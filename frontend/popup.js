document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('toggleSwitch');
  const logList = document.getElementById('logList');
  const clearBtn = document.getElementById('clearLogs');

  // 1. Load Settings
  const data = await chrome.storage.local.get(['ddas_enabled', 'ddas_logs']);
  toggle.checked = data.ddas_enabled !== false; // Default to true
  renderLogs(data.ddas_logs || []);

  // 2. Toggle Handler
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ ddas_enabled: toggle.checked });
    // Reload background script to apply changes immediately? 
    // Not needed if background checks storage every time.
  });

  // 3. Clear Logs
  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ ddas_logs: [] });
    renderLogs([]);
  });

  // 4. Listen for updates (Real-time log update)
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.ddas_logs) {
      renderLogs(changes.ddas_logs.newValue);
    }
  });

  function renderLogs(logs) {
    if (!logs || logs.length === 0) {
      logList.innerHTML = '<div style="text-align:center; color:#999; margin-top: 80px;">No recent duplicates</div>';
      return;
    }
    
    logList.innerHTML = logs.reverse().map(log => `
      <div class="log-item">
        <span class="status-badge ${log.action === 'Blocked' ? 'status-blocked' : 'status-allowed'}">${log.action}</span>
        <span class="log-title" title="${log.filename}">${log.filename}</span>
        <div class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</div>
      </div>
    `).join('');
  }
});
