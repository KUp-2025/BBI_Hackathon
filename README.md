🛡️ DDAS - Data Download Duplication Alert System
A Smart Chrome Extension that prevents redundant downloads by checking your local filesystem before the download even starts.

📌 Problem Statement
In research institutes and universities, users frequently re-download the same heavy datasets, PDFs, and papers, wasting:

💾 Storage Space (Multiple copies of 1GB+ files)

⏳ Time (Waiting for redundant downloads)

🌐 Bandwidth (Unnecessary network usage)

🚀 The Solution: DDAS
DDAS is a hybrid extension that bridges the gap between the Browser and the Operating System. Unlike standard extensions that only check browser history, DDAS uses a lightweight local server to scan your actual hard drive for duplicates based on Filename and File Size.

🛠️ Tech Stack
Frontend: HTML5, CSS3, JavaScript (Chrome Extension V3)

Backend: Python (Django)

Communication: REST API (JSON)

📥 Installation Guide
Prerequisites
Google Chrome (or any Chromium browser like Edge/Brave)

Python 3.8 or higher installed on your system.

Step 1: Backend Setup (The Brain)
The backend is responsible for scanning your local Downloads/ folder.

Navigate to the backend folder:

bash
cd backend
Create a Virtual Environment (Recommended):

bash
python -m venv venv

# Windows:
.\venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
Install Dependencies:

bash
pip install django django-cors-headers
Run the Server:

bash
python manage.py runserver
✅ Success: You should see: Starting development server at http://127.0.0.1:8000/

Step 2: Extension Setup (The Interface)
Open Chrome and go to chrome://extensions/.

Enable Developer Mode (Toggle in the top right).

Click Load unpacked.

Select the frontend folder from this project.

📌 Pin the extension to your toolbar for easy access.

🎮 How to Test It
Ensure the Backend is running (python manage.py runserver).

Click the DDAS Icon in Chrome -> Ensure the status says "System Online".

Download a file (e.g., an image or PDF).

Download it again.

Instead of creating image (1).jpg, DDAS will pause the download.

A Popup Window will appear showing:

📁 Existing File Location

⚖️ File Size Match

Click "Stop Download" to save space or "Download Anyway" to proceed.

📂 Project Structure
text
DDAS/
├── backend/                # Python Django Server
│   ├── manage.py           # Server entry point
│   ├── ddas_backend/       # Main App Logic
│   └── views.py            # Logic to check local files
│
├── frontend/               # Chrome Extension
│   ├── manifest.json       # Permissions & Config
│   ├── background.js       # Background Watchdog
│   ├── popup.html          # Dashboard (Toggle/Status)
│   └── prompt.html         # Alert Popup Window
│
└── README.md               # Documentation
✨ Key Features
✅ Real-Time Monitoring: Intercepts downloads instantly.

✅ Local File System Check: Detects files even if cleared from browser history.

✅ Smart Comparison: Checks Name + File Size to avoid false alarms.

✅ User Control: "Cancel" or "Continue" options via a clean UI.

✅ Dashboard: View connection status and recent logs.

MADE FOR ELECTROTHON 2026
by BBI
