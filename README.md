# 🗺️ LoclyAI — Smart Civic Issue Reporting Platform

LoclyAI is an advanced, AI-powered full-stack civic reporting system designed to streamline communication between citizens and local authorities. Utilizing standard web technologies paired with cutting-edge computer vision, LoclyAI automatically detects, classifies, and tracks municipal issues like potholes, illegal garbage dumping, broken streetlights, and structural damage in real-time.

---
live demo click here --------👉https://loclyai-frontend.vercel.app/

## 🚀 Key Features

### 👤 Citizen Application
* **Smart Issue Reporter:** Upload an image of a municipal problem, and the embedded **YOLOv8 AI engine** automatically classifies it (e.g., *🕳️ Pothole*, *🗑️ Garbage*, *💡 Streetlight issue*) and gauges confidence.
* **Personalized Dashboard:** Track filed reports, check progress status (Submitted, Under Review, In Progress, Resolved), and view responses from officials.
* **User Profile & Activity:** Manage credentials, edit profile configurations, and track total issues resolved.
* **Secure Auth:** Fully implemented secure registration, login, and JWT token-based session persistence.

### 🏢 Authority Management Portal
* **Interactive Control Center:** Municipal administrators can see an analytical breakdown of incoming reports categorized by urgency and type.
* **Dynamic Workflows:** Update the status of reports, assign field teams, and leave comments or updates for citizens.
* **Urgency & Geographic Insights:** Pinpoint issue locations and view automated YOLOv8 confidence scores to prioritize high-risk reports (e.g., exposed electrical wiring, flooding).

### 👑 Super Admin Dashboard
* **Central Authority Management:** Register and approve new municipal wards or local authority departments.
* **Audit & Moderation Logs:** Monitor global platform activity, review registered users, and audit civic status changes.

### 🧠 FastAPI ML Inference Service
* **Automated Image Detection:** An independent FastAPI backend hosting a fine-tuned **YOLOv8 model** (`best.pt`) that handles high-throughput image uploads and yields precise bounding boxes.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Vanilla CSS | Fast, responsive, HSL-themed UI with clean interactive components. |
| **Backend API** | Node.js, Express, JWT, PostgreSQL | Secure REST endpoints, relational schema design, dynamic cookie-based session tracking. |
| **ML Engine** | Python, FastAPI, YOLOv8, Pillow | Ultra-low latency image inference service returning normalized bounding boxes and fuzzy-matched emojis. |
| **Email Service**| Resend API | Automated email notifications for registrations, password resets, and issue resolution updates. |
| **Storage** | Multer, Static serving | Handles local photo uploads securely with unique file hashes. |

---

## 📂 Project Architecture

```
loclyai/
├── backend/            # Express.js REST API
│   ├── config/         # Database configurations
│   ├── middleware/     # Auth & JWT middlewares
│   ├── migrations/     # PostgreSQL schema migrations
│   ├── routes/         # Express routing controllers
│   ├── uploads/        # Local image assets
│   └── utils/          # Token utilities & Resend email helpers
├── frontend/           # React + Vite Client
│   ├── src/
│   │   ├── assets/     # Images and static assets
│   │   ├── components/ # Citizen, Authority, & Admin views
│   │   ├── context/    # Global Authentication states
│   │   └── utils/      # API wrappers
├── mlmodel/            # FastAPI + YOLOv8 ML Service
│   ├── best.pt         # Fine-tuned YOLOv8 model weights
│   ├── main.py         # Inference routes
│   └── requirements.txt# Python dependency lists
└── .gitignore          # Root-level Fortress security configuration
```

---

## 💿 Installation & Setup

### 1. Prerequisites
Ensure you have the following installed:
* **Node.js** (v18+)
* **PostgreSQL**
* **Python** (3.9 - 3.11 recommended)

---

### 🔑 2. Environment Variables Setup
Create a `.env` file in the `/backend` directory containing:

```env
# PostgreSQL Database Setup
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loclyai

# JWT Cryptographic Secrets
ACCESS_TOKEN_SECRET=your_long_random_access_token_secret
REFRESH_TOKEN_SECRET=your_long_random_refresh_token_secret

# Session Duration
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Server Configurations
PORT=5000

# Email Integration (Resend API)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=LoclyAI <onboarding@resend.dev>
```

---

### ⚙️ 3. Backend Setup & Run
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database schema and seed basic configuration:
   ```bash
   npm run seed
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
The backend API will run on: **`http://localhost:5000`**

---

### 💻 4. Frontend Setup & Run
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
The frontend application will boot on: **`http://localhost:5173`**

---

### 🧠 5. FastAPI ML Inference Service Setup
1. Navigate to the machine learning directory:
   ```bash
   cd ../mlmodel
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (Command Prompt)
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI uvicorn server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
The Machine Learning API will run on: **`http://localhost:8000`**
* Test/Explore API documentation visually at: **`http://localhost:8000/docs`**

---

## 🔒 Security Configuration
This project features a root-level **Fortress `.gitignore`** design, which blocks:
* Hardcoded secrets/API keys (`.env` files)
* Certificates and key files (`.pem`, `.key`, `.pub`)
* Local PostgreSQL database caches and SQL dumps
* Node.js and Python packages (`node_modules`, `venv/`)
* User-uploaded image assets (retaining folder structure cleanly via `.gitkeep`)

---

## 🤝 Contribution
Contributions to LoclyAI are welcome! Feel free to open issues, submit pull requests, or improve model classification capabilities. 

*Made with 💖 to build smarter, safer cities.*
