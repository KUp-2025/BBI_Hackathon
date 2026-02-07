console.log("🚀 DDAS - Production v3.1 (Stable)");

const API_BASE = "http://127.0.0.1:8000/api";
const checks = new Map();

// Helper to add logs
async function addLog(filename, action) {
  const data = await chrome.storage.local.get('ddas_logs');
  const logs = data.ddas_logs || [];
  // Add new log to the TOP of the list
  logs.unshift({ filename, action, timestamp: Date.now() });
  // Keep only last 50 logs
  if (logs.length > 50) logs.pop();
  chrome.storage.local.set({ ddas_logs: logs });
}

chrome.downloads.onCreated.addListener(async (item) => {
  // 1. Check if Enabled
  const { ddas_enabled } = await chrome.storage.local.get('ddas_enabled');
  if (ddas_enabled === false) return; 

  if (checks.has(item.id)) return;
  checks.set(item.id, true);

  console.log("📥 Checking Download ID:", item.id);
  chrome.downloads.pause(item.id);

  // Wait for filename to be populated by Chrome
  await new Promise(r => setTimeout(r, 600)); 
  
  const search = await chrome.downloads.search({id: item.id});
  const fullItem = search[0] || item;
  const filename = fullItem.filename || "unknown_file";

  // Payload for Backend
  const payload = {
    filename: filename,
    size: fullItem.fileSize || 0,
    url: fullItem.url,
    mime: fullItem.mime || "application/octet-stream"
  };

  try {
    const res = await fetch(`${API_BASE}/check-duplicate/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    
    if (result.duplicate) {
      console.log("⚠️ Duplicate Found:", filename);
      
      // Calculate readable size
      const sizeBytes = fullItem.fileSize || 0;
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      const sizeStr = sizeMB > 0 ? `${sizeMB} MB` : `${sizeBytes} Bytes`;

      // Prepare URL params
      const params = new URLSearchParams({
        id: item.id,
        name: filename, // Auto-encoded
        size: sizeStr,
        path: result.existing_path || "Downloads Folder"
      });

      chrome.windows.create({
        url: `prompt.html?${params.toString()}`,
        type: "popup",
        width: 420,
        height: 380, // Increased slightly for better UI fit
        focused: true
      });
      
      addLog(filename, "Detected");
      
      // Store filename temporarily to update log status later if needed
      chrome.storage.local.set({ [`pending_${item.id}`]: filename });

    } else {
      console.log("✅ File Unique:", filename);
      chrome.downloads.resume(item.id);
      addLog(filename, "Clean");
    }
  } catch (e) {
    console.error("❌ Backend Error (Is Django Running?):", e);
    // Fail safe: resume if backend is down
    chrome.downloads.resume(item.id);
  } finally {
    checks.delete(item.id);
  }
});

// Listener for User Decisions from Prompt Window
chrome.runtime.onMessage.addListener(async (msg) => {
  // Retrieve the filename we saved earlier
  const key = `pending_${msg.id}`;
  const stored = await chrome.storage.local.get(key);
  const fname = stored[key] || "Download";

  if (msg.action === 'CANCEL') {
    console.log("🛑 User Cancelled:", fname);
    chrome.downloads.cancel(msg.id);
    addLog(fname, "Blocked");
  } 
  else if (msg.action === 'RESUME') {
    console.log("🟢 User Resumed:", fname);
    chrome.downloads.resume(msg.id);
    addLog(fname, "Allowed");
  }

  // Cleanup storage
  chrome.storage.local.remove(key);
});
