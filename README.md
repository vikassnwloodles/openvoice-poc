# OpenVoice POC

This is a proof-of-concept project for voice cloning using OpenVoice, including both backend and frontend components.

## 🚀 Project Structure

- `voltron-backend/voltron/` – Django backend for handling TTS and voice cloning APIs
- `openvoice-frontend/` – Frontend interface built with Node.js

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/vikassnwloodles/openvoice-poc.git
cd openvoice-poc/
```

---

### 2. Backend Setup (Python 3.9)

```bash
cd voltron-backend/voltron/
python -m venv env               # Create virtual environment
. env/bin/activate               # Activate the environment
pip install -r requirements.txt  # Install Python dependencies

# Download Japanese dictionary for text processing
python -m unidic download
```

#### 🔽 Download Model Checkpoints

```bash
wget https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip
unzip checkpoints_v2_0417.zip
```

#### 🗄️ Run Database Migrations and Start Server

```bash
python manage.py migrate
python manage.py runserver
```

---

### 3. Frontend Setup (Node.js & npm)

```bash
cd openvoice-frontend/
npm install
npm run dev
```

---

## ✅ Requirements

* Python 3.9
* Node.js (v16+ recommended)
* `wget`, `unzip` (for downloading models)

---

## 📢 Notes

* Ensure model checkpoints are correctly unzipped and paths are valid.
* The backend server runs on `http://127.0.0.1:8000/`
* The frontend dev server runs on `http://localhost:3000/` by default.
