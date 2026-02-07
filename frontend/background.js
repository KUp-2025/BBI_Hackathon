console.log("🎯 DDAS Production Ready");

const BACKEND = "http://127.0.0.1:8000/api";

chrome.downloads.onCreated.addListener(async (item) => {
  console.log("📥 Pause:", item.id);
  chrome.downloads.pause(item.id);
  
  const filename = item.filename || item.url.split('/').pop().split('?')[0] || 'file.dat';
  const payload = {
    filename,
    size: item.fileSize || 0,
    mime: item.mime || 'unknown',
    file_hash: `hash_${Date.now()}`
  };
  
  try {
    const res = await fetch(`${BACKEND}/check-duplicate/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    console.log("Backend:", result);
    
    if (result.duplicate) {
      chrome.notifications.create({
        type: 'basic',
        title: '🚫 Duplicate Download',
        message: `${filename}\n(${result.reason})`,
        buttons: [{title: 'Cancel'}, {title: 'Force'}]
      });
    } else {
      chrome.downloads.resume(item.id);
    }
  } catch (e) {
    console.error("Backend offline:", e);
    chrome.downloads.resume(item.id);
  }
});
