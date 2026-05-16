import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function StudentDashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${API}/results/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data.results);
      } catch (err) {
        console.error("Failed to fetch results");
      }
      setLoading(false);
    };
    fetchResults();
  }, []);

  const gradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#16a34a";
    if (grade === "B") return "#2563eb";
    if (grade === "C") return "#d97706";
    if (grade === "D") return "#ea580c";
    return "#dc2626";
  };

  const average = results.length > 0
    ? Math.round(results.reduce((a, r) => a + (r.marks / r.totalMarks) * 100, 0) / results.length)
    : 0;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navTitle}>🎓 StudentResult</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👨‍🎓 {user.name}</span>
          <span style={styles.badge}>Student</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <div>
            <h2 style={styles.welcomeTitle}>Welcome, {user.name}! 👋</h2>
            <p style={styles.welcomeSub}>Roll Number: {user.rollNumber} | Email: {user.email}</p>
          </div>
          <div style={styles.avgScore}>
            <div style={styles.avgNumber}>{average}%</div>
            <div style={styles.avgLabel}>Average Score</div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{results.length}</div>
            <div style={styles.statLabel}>Total Subjects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {results.filter(r => r.grade === "A+" || r.grade === "A").length}
            </div>
            <div style={styles.statLabel}>Grade A</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {results.filter(r => r.grade === "F").length}
            </div>
            <div style={styles.statLabel}>Failed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{average}%</div>
            <div style={styles.statLabel}>Overall %</div>
          </div>
        </div>

        {/* Results */}
        <div style={styles.tableCard}>
          <h2 style={styles.tableTitle}>📊 My Results</h2>
          {loading ? (
            <p style={styles.empty}>Loading results...</p>
          ) : results.length === 0 ? (
            <p style={styles.empty}>No results found yet. Ask your teacher to add your results!</p>
          ) : (
            <div style={styles.resultGrid}>
              {results.map((r) => (
                <div key={r._id} style={styles.resultCard}>
                  <div style={styles.resultHeader}>
                    <h3 style={styles.subject}>{r.subject}</h3>
                    <span style={{ ...styles.gradeBadge, background: gradeColor(r.grade) }}>
                      {r.grade}
                    </span>
                  </div>
                  <div style={styles.marksRow}>
                    <span style={styles.marks}>{r.marks}/{r.totalMarks}</span>
                    <span style={styles.percentage}>
                      {Math.round((r.marks / r.totalMarks) * 100)}%
                    </span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${Math.round((r.marks / r.totalMarks) * 100)}%`,
                      background: gradeColor(r.grade)
                    }} />
                  </div>
                  <p style={styles.resultDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", background: "#f0f4f8", fontFamily: "sans-serif" },
  navbar: { background: "#1e3a5f", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navTitle: { color: "white", fontSize: "1.5rem", fontWeight: "800" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  navUser: { color: "white", fontSize: "0.95rem" },
  badge: { background: "#16a34a", color: "white", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "700" },
  logoutBtn: { background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "700" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  welcomeCard: { background: "linear-gradient(135deg, #1e3a5f, #2d6a9f)", borderRadius: "16px", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", color: "white" },
  welcomeTitle: { fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.5rem" },
  welcomeSub: { opacity: 0.85, fontSize: "0.95rem" },
  avgScore: { textAlign: "center" },
  avgNumber: { fontSize: "3rem", fontWeight: "800" },
  avgLabel: { fontSize: "0.85rem", opacity: 0.85 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  statCard: { background: "white", borderRadius: "12px", padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  statNumber: { fontSize: "2rem", fontWeight: "800", color: "#1e3a5f" },
  statLabel: { fontSize: "0.85rem", color: "#808080", marginTop: "0.25rem" },
  tableCard: { background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  tableTitle: { fontSize: "1.3rem", fontWeight: "800", color: "#1e3a5f", marginBottom: "1.5rem" },
  resultGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  resultCard: { background: "#f8fafc", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  subject: { fontSize: "1.1rem", fontWeight: "700", color: "#1e3a5f" },
  gradeBadge: { color: "white", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "700" },
  marksRow: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" },
  marks: { fontSize: "1rem", fontWeight: "600", color: "#333" },
  percentage: { fontSize: "1rem", fontWeight: "700", color: "#1e3a5f" },
  progressBar: { background: "#e2e8f0", borderRadius: "999px", height: "8px", marginBottom: "0.5rem" },
  progressFill: { height: "100%", borderRadius: "999px", transition: "width 0.3s" },
  resultDate: { fontSize: "0.8rem", color: "#808080" },
  empty: { textAlign: "center", color: "#808080", padding: "2rem" },
};