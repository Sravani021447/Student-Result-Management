import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/student");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={handleLogin} />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onLogin={handleLogin} />} />
      <Route path="/teacher" element={
        user?.role === "teacher"
          ? <TeacherDashboard user={user} onLogout={handleLogout} />
          : <Login onLogin={handleLogin} />
      } />
      <Route path="/student" element={
        user?.role === "student"
          ? <StudentDashboard user={user} onLogout={handleLogout} />
          : <Login onLogin={handleLogin} />
      } />
    </Routes>
  );
}