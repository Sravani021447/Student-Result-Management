import { useState } from "react";
import axios from "axios";

const API = "https://student-result-backend-u9t1.onrender.com/api";

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/register`, form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.logo}>🎓 StudentResult</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Register As</label>
            <select
              style={styles.input}
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          {form.role === "student" && (
            <div style={styles.field}>
              <label style={styles.label}>Roll Number</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter your roll number"
                value={form.rollNumber}
                onChange={e => setForm({ ...form, rollNumber: e.target.value })}
              />
            </div>
          )}
          {error && <p style={styles.error}>❌ {error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account?{" "}
          <a href="/login" style={styles.a}>Login here</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e3a5f, #2d6a9f)" },
  card: { background: "white", padding: "2.5rem", borderRadius: "16px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  header: { textAlign: "center", marginBottom: "2rem" },
  logo: { fontSize: "2rem", fontWeight: "800", color: "#1e3a5f", fontFamily: "sans-serif" },
  subtitle: { color: "#808080", fontFamily: "sans-serif", marginTop: "0.5rem" },
  field: { marginBottom: "1.2rem" },
  label: { display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#333", marginBottom: "0.4rem", fontFamily: "sans-serif" },
  input: { width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e5e5e5", fontSize: "0.95rem", fontFamily: "sans-serif", boxSizing: "border-box", outline: "none" },
  btn: { width: "100%", padding: "0.85rem", background: "#1e3a5f", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", fontFamily: "sans-serif", marginTop: "0.5rem" },
  error: { color: "#ef4444", fontSize: "0.85rem", fontFamily: "sans-serif", marginBottom: "0.5rem" },
  link: { textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", fontFamily: "sans-serif", color: "#555" },
  a: { color: "#2d6a9f", fontWeight: "700", textDecoration: "none" },
};