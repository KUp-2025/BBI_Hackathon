const API_BASE = "http://127.0.0.1:8000/api";

console.log("DDAS background service worker loaded");

async function computeSha256FromUrl(url) {
  console.log("Fetching for hash:", url);
  const resp = await fetch(url);
  const buffer = await resp.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  console.log("Computed hash:", hashHex.slice(0, 16) + "...");
  return hashHex;
}

async function checkDuplicateWithBackend({ filename, fileSize, mime, url }) {
  let hash;
  try {
    hash = await computeSha256FromUrl(url);
  } catch (e) {
    console.error("Hash compute failed, allowing download:", e);
    return { duplicate: false, reason: "HASH_FAILED" };
  }

  const payload = {
    filename,
    size: fileSize,
    mime: mime || "application/octet-stream",
    file_hash: hash
  };

  console.log("Sending payload to backend:", payload);

  const res = await fetch(`${API_BASE}/check-duplicate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Backend error:", res.status, txt);
    return { duplicate: false, reason: "BACKEND_ERROR" };
  }

  const data = await res.json();
  console.log("Backend response:", data);
  return data;
}

chrome.downloads.onCreated.addListener(async (downloadItem) => {
  console.log("Download detected:", downloadItem);

  if (!downloadItem.url || !downloadItem.url.startsWith("http")) {
    console.log("Non-http download, ignoring.");
    return;
  }

  try {
    console.log("Pausing download:", downloadItem.id);
    chrome.downloads.pause(downloadItem.id);
  } catch (e) {
    console.error("Failed to pause download:", e);
  }

  try {
    const result = await checkDuplicateWithBackend({
      filename: downloadItem.filename || downloadItem.url.split("/").pop(),
      fileSize: downloadItem.fileSize || 0,
      mime: downloadItem.mime || "",
      url: downloadItem.url
    });

    if (result.duplicate) {
      console.log("Duplicate detected, showing notification.");
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon128.png",
        title: "Duplicate Download Detected",
        message: `A file with identical content already exists.\nReason: ${result.reason}`,
        buttons: [
          { title: "Cancel Download" },
          { title: "Download Anyway" }
        ],
        priority: 2
      }, (notificationId) => {
        chrome.storage.local.set({ [notificationId]: downloadItem.id });
      });
    } else {
      console.log("No duplicate, resuming download:", downloadItem.id);
      chrome.downloads.resume(downloadItem.id);
    }
  } catch (e) {
    console.error("Error in duplicate check flow:", e);
    chrome.downloads.resume(downloadItem.id);
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  chrome.storage.local.get(notificationId, (data) => {
    const downloadId = data[notificationId];
    if (!downloadId) {
      console.warn("No downloadId stored for notification", notificationId);
      return;
    }

    if (buttonIndex === 0) {
      console.log("User chose to cancel download:", downloadId);
      chrome.downloads.cancel(downloadId);
    } else {
      console.log("User chose to continue download:", downloadId);
      chrome.downloads.resume(downloadId);
    }
    chrome.notifications.clear(notificationId);
    chrome.storage.local.remove(notificationId);
  });
});
