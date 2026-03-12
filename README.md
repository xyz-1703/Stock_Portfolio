# Stock Portfolio Management System

## Developed by

**Girija Zirange**
Full‑Stack Project 

---

## Project Overview

This project is a **Stock Portfolio Management Web Application** where users can:

* View sectors and stocks
* Add stocks sector‑wise into their portfolio
* Manage stock quantities
* View their personal portfolio

The system is built using **Django REST APIs** in backend and **React.js** frontend with SQLite database.

This project helped me strengthen my full‑stack skills after working on my OJT project on posture detection using RoboFlow and APT tools.

---

## Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* SQLite Database

### Frontend

* React.js
* JavaScript
* Axios (API calls)
* HTML + CSS

### Tools Used

* VS Code
* Git & GitHub
* Postman (API Testing)

---

## Project Structure

```
Stock_portfolio/
│
├── stock/            # Stock & Sector models
├── portfolio/        # Portfolio models & APIs
├── frontend/         # React App
├── manage.py
├── requirements.txt
└── README.md
```

---

## Features

### User Features

* View all sectors
* View stocks in each sector
* Add stocks to portfolio
* Update stock quantity
* Remove stocks from portfolio

### Admin Features

* Add new sectors
* Add stocks with symbol, sector, price

---

## Database Models

### Sector

* id
* name

### Stock

* id
* name
* symbol
* sector
* price

### Portfolio

* user

### PortfolioStock

* portfolio
* stock
* quantity

---

## 🔌 API Endpoints

### Stock APIs

```
GET  /api/sectors/
GET  /api/stocks/<sector_id>/
```

### Portfolio APIs

```
GET  /api/portfolio/
POST /api/add-stock/
DELETE /api/remove-stock/
```

Tested using Postman.

---

## How to Run Project

### One-Command Scripts (Recommended)

From project root:

```bash
# Windows Command Prompt / PowerShell
scripts\setup.bat
scripts\start_all.bat

# Linux / Git Bash / WSL
chmod +x scripts/*.sh
bash scripts/setup.sh
bash scripts/start_all.sh
```

### Backend Setup

```
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```
cd frontend
npm install
npm start
```

Frontend runs at:
[http://localhost:3000](http://localhost:3000)

Backend runs at:
[http://127.0.0.1:8000](http://127.0.0.1:8000)

### Available Helper Scripts

* `scripts/setup.bat` or `scripts/setup.sh`: install backend + frontend dependencies
* `scripts/start_backend.bat` or `scripts/start_backend.sh`: run Django backend
* `scripts/start_frontend.bat` or `scripts/start_frontend.sh`: run React frontend
* `scripts/start_all.bat` or `scripts/start_all.sh`: start both services

### Linux VM Notes

* The shell scripts support Linux virtual environments via `env/bin/activate`
* They also fall back to `env/Scripts/activate` for Git Bash on Windows
* If `python3` is available, the scripts use it automatically

### Running On A Linux VM

Use the default script ports:

```bash
chmod +x scripts/*.sh
bash scripts/setup.sh
bash scripts/start_backend.sh
bash scripts/start_frontend.sh
```

The scripts now bind to:

* Django: `0.0.0.0:8000`
* React: `0.0.0.0:3000`

Open these ports on the VM:

```bash
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
```

If your VM is in AWS, Azure, or GCP, also allow inbound traffic on ports `8000` and `3000` in the instance security rules.

Access the app from your machine using:

```text
http://<vm-ip>:3000
```

The frontend will automatically call the backend on:

```text
http://<vm-ip>:8000
```

---

## Testing

* APIs tested in Postman
* Frontend tested in browser
* Migration errors debugged and resolved
* React components created for SectorList, StockList, Portfolio

---

## Learning Outcomes

From this project I learned:

* Django model relationships (ForeignKey, OneToOne)
* Creating REST APIs
* Handling migrations and database errors
* React component structure
* Connecting React with Django APIs
* GitHub deployment


---

## Future Improvements

* User authentication login/register
* Live stock price API integration
* Charts and analytics dashboard
* Portfolio profit/loss tracking
* Deployment on cloud server

---
