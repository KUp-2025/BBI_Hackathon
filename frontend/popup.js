const API_BASE = "http://127.0.0.1:8000/api";

async function loadRecentFiles() {
  const container = document.getElementById("files");
  try {
    const res = await fetch(`${API_BASE}/recent-files/`);
    if (!res.ok) {
      container.textContent = "Error loading files.";
      return;
    }
    const data = await res.json();
    if (!data.length) {
      container.textContent = "No files checked yet.";
      return;
    }
    container.innerHTML = "";
    data.forEach(f => {
      const div = document.createElement("div");
      div.className = "file";
      div.innerHTML = `
        <div class="name">${f.file_name || "(no name)"}</div>
        <div>${(f.size / 1024).toFixed(1)} KB · ${f.mime}</div>
        <div style="color:#666;">${f.sha256_hash.slice(0,16)}...</div>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    container.textContent = "Backend not reachable.";
  }
}

loadRecentFiles();
