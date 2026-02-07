document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Parameters 
  const params = new URLSearchParams(window.location.search);
  
  const id = parseInt(params.get('id'));
  const name = params.get('name') || "Unknown File";
  const size = params.get('size') || "Unknown Size";
  const path = params.get('path') || "Downloads Folder";

  // 2. Decode content 
  document.getElementById('fname').textContent = decodeURIComponent(name);
  document.getElementById('fsize').textContent = decodeURIComponent(size);
  document.getElementById('fpath').textContent = decodeURIComponent(path);

  // 3. Button 
  document.getElementById('cancelBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'CANCEL', id: id });
    window.close();
  });

  document.getElementById('contBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'RESUME', id: id });
    window.close();
  });
});
