✈️ Smart Travel Planner – Full Stack Web Application

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/SpringBoot-3.x-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/Status-Internship%20Project-success)

---

## 📌 Project Overview

Smart Travel Planner is a full-stack web application that allows users to efficiently plan, organize, and manage their trips.

The system enables users to:
- Create and manage trips
- Plan itineraries
- Track budgets and expenses
- Search flights and accommodations
- Get travel recommendations
- View weather forecasts
- Manage bookings and notifications

This project demonstrates real-world full-stack development using modern frontend and backend technologies.

---

## 🏗️ Project Structure

```

travel-planner-fullstack/
│
├── travel-planner-frontend/   → React Frontend
├── travel-planner-app/
│    └── backend/              → Spring Boot Backend
└── README.md

```

---

## 🚀 Technologies Used

### 🔹 Frontend
- React.js
- Vite
- React Router
- Axios
- Heroicons
- Tailwind CSS

### 🔹 Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- REST APIs
- Maven

### 🔹 Database
- MySQL

---

## 🔐 Key Features

- User Registration & Login (JWT Authentication)
- Role-Based Authorization (Admin/User)
- Trip Creation & Management
- Budget & Expense Tracking
- Itinerary Planner
- Flight & Hotel Search Integration
- Weather Information
- Offline Mode Support
- Email Notifications
- Admin Dashboard
- Secure REST API Architecture

---

## ⚙️ Backend Configuration

Before running the backend:

1. Go to:
```

backend/src/main/resources/

```

2. Create a file named:
```

application.properties

```

3. Copy content from:
```

application-example.properties

````

4. Replace placeholder values with your actual credentials.

⚠️ Note:  
`application.properties` is intentionally ignored in `.gitignore` for security reasons.

---

## ▶️ How To Run The Project

---

### 🖥️ 1️⃣ Run Backend (Spring Boot)

```bash
cd travel-planner-app/backend
mvn spring-boot:run
````

Backend runs at:

```
http://localhost:8080
```

---

### 🌐 2️⃣ Run Frontend (React)

Open a new terminal:

```bash
cd travel-planner-frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔗 API Communication

Frontend communicates with backend using REST APIs.

Example Endpoints:

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/trips
POST   /api/trips
PUT    /api/trips/{id}
DELETE /api/trips/{id}
```

---

## 👨‍💻 Developer

**Mahesh Swami**
Full Stack Java Developer

* Developed complete frontend using React.
* Built secure REST APIs using Spring Boot.
* Implemented JWT authentication and role-based access.
* Integrated MySQL database.
* Designed full application architecture.

---


## 📈 Future Enhancements

* Payment Gateway Integration
* Cloud Deployment (AWS / Render)
* Mobile App Version
* AI-Based Travel Recommendations
* Real-time Notifications
* Map-Based Route Optimization

---

## 📜 Project Purpose

This project was developed as part of an internship and educational learning process to demonstrate full-stack development skills.

---

## ⭐ If you like this project

Feel free to fork, star, or contribute.

````

---

# ✅ Now What To Do

1. Open `README.md`
2. Delete old content
3. Paste this
4. Save
5. Run:

```bash
git add README.md
git commit -m "Updated professional README"
git push
````

---
