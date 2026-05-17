# 🎓 Student Result Management System

A Full Stack MERN application for managing student results with two user roles — Teacher and Student.

## 🌐 Live Demo
- **Frontend:** https://student-result-management-omega.vercel.app
- **Backend API:** https://student-result-backend-u9t1.onrender.com

## 📦 GitHub Repository
https://github.com/Sravani021447/Student-Result-Management

## 👨‍🏫 Teacher Features
- Register & Login
- Add student results
- View all results
- Update results
- Delete results

## 👨‍🎓 Student Features
- Register & Login
- View own results with grades
- See average score and progress bars

## 🛠️ Tech Stack
- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** Vercel (Frontend) + Render (Backend)

## ✅ Features
- JWT Authentication
- Two user roles (Teacher & Student)
- Full CRUD operations
- Grade calculation (A+, A, B, C, D, F)
- Progress bars for visual results
- Responsive design

## 🔑 Test Credentials

**Teacher:**
- Email: teacher@gmail.com
- Password: teacher123

**Student:**
- Email: sravani2@gmail.com
- Password: sravani123

## 🚀 Run Locally

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📁 Project Structure
```
StudentResult/
├── client/          # React Frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── StudentDashboard.jsx
└── server/          # Node.js Backend
    └── server.js
```