import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function TeacherDashboard({ user, onLogout }) {
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({ studentName: "", rollNumber: "", email: "", subject: "", marks: "", totalMarks: "" });
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("view");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all results
  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API}/results`, { headers });
      setResults(res.data.results);
    } catch (err) {
      console.error("Failed to fetch results");
    }
  };

  useEffect(() => { fetchResults(); }, []);

  // Add or Update result
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      if (editId) {
        await axios.put(`${API}/results/${editId}`, form, { headers });
        setMessage("✅ Result updated successfully!");
        setEditId(null);
      } else {
        await axios.post(`${API}/results`, form, { headers });
        setMessage("✅ Result added successfully!");
      }
      setForm({ studentName: "", rollNumber: "", email: "", subject: "", marks: "", totalMarks: "" });
      setStatus("success");
      fetchResults();
      setActiveTab("view");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Failed"));
      setStatus("error");
    }
  };

  // Delete result
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    try {
      await axios.delete(`${API}/results/${id}`, { headers });
      setMessage("✅ Result deleted!");
      fetchResults();
    } catch (err) {
      setMessage("❌ Failed to delete");
    }
  };

  // Edit result
  const handleEdit = (result) => {
    setForm({
      studentName: result.studentName,
      rollNumber: result.rollNumber,
      email: result.email,
      subject: result.subject,
      marks: result.marks,
      totalMarks: result.totalMarks,
    });
    setEditId(result._id);
    setActiveTab("add");
  };

  const gradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#16a34a";
    if (grade === "B") return "#2563eb";
    if (grade === "C") return "#d97706";
    if (grade === "D") return "#ea580c";
    return "#dc2626";
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h1 style={styles.navTitle}>🎓 StudentResult</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👨‍🏫 {user.name}</span>
          <span style={styles.badge}>Teacher</span>
          <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{results.length}</div>
            <div style={styles.statLabel}>Total Results</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {results.filter(r => r.grade === "A+" || r.grade === "A").length}
            </div>
            <div style={styles.statLabel}>Grade A Students</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {results.filter(r => r.grade === "F").length}
            </div>
            <div style={styles.statLabel}>Failed Students</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {results.length > 0
                ? Math.round(results.reduce((a, r) => a + (r.marks / r.totalMarks) * 100, 0) / results.length)
                : 0}%
            </div>
            <div style={styles.statLabel}>Average Score</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === "view" ? styles.activeTab : {}) }}
            onClick={() => { setActiveTab("view"); setEditId(null); setMessage(""); }}
          >
            📋 View Results
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "add" ? styles.activeTab : {}) }}
            onClick={() => { setActiveTab("add"); setMessage(""); }}
          >
            ➕ {editId ? "Edit Result" : "Add Result"}
          </button>
        </div>

        {message && (
          <div style={{ ...styles.msg, background: message.includes("✅") ? "#f0fdf4" : "#fef2f2", color: message.includes("✅") ? "#16a34a" : "#dc2626" }}>
            {message}
          </div>
        )}

        {/* Add/Edit Form */}
        {activeTab === "add" && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>{editId ? "✏️ Edit Result" : "➕ Add New Result"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>Student Name</label>
                  <input style={styles.input} placeholder="Full name" value={form.studentName}
                    onChange={e => setForm({ ...form, studentName: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Roll Number</label>
                  <input style={styles.input} placeholder="e.g. CS2021001" value={form.rollNumber}
                    onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} type="email" placeholder="Student email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Subject</label>
                  <input style={styles.input} placeholder="e.g. Mathematics" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Marks Obtained</label>
                  <input style={styles.input} type="number" placeholder="e.g. 85" value={form.marks}
                    onChange={e => setForm({ ...form, marks: e.target.value })} />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Total Marks</label>
                  <input style={styles.input} type="number" placeholder="e.g. 100" value={form.totalMarks}
                    onChange={e => setForm({ ...form, totalMarks: e.target.value })} />
                </div>
              </div>
              <button style={styles.submitBtn} type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Saving..." : editId ? "Update Result" : "Add Result"}
              </button>
              {editId && (
                <button style={styles.cancelBtn} type="button"
                  onClick={() => { setEditId(null); setForm({ studentName: "", rollNumber: "", email: "", subject: "", marks: "", totalMarks: "" }); setActiveTab("view"); }}>
                  Cancel
                </button>
              )}
            </form>
          </div>
        )}

        {/* Results Table */}
        {activeTab === "view" && (
          <div style={styles.tableCard}>
            <h2 style={styles.formTitle}>📋 All Student Results</h2>
            {results.length === 0 ? (
              <p style={styles.empty}>No results found. Add some results!</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thead}>
                      <th style={styles.th}>Student Name</th>
                      <th style={styles.th}>Roll No</th>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Marks</th>
                      <th style={styles.th}>Grade</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r._id} style={styles.tr}>
                        <td style={styles.td}>{r.studentName}</td>
                        <td style={styles.td}>{r.rollNumber}</td>
                        <td style={styles.td}>{r.subject}</td>
                        <td style={styles.td}>{r.marks}/{r.totalMarks} ({Math.round((r.marks/r.totalMarks)*100)}%)</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.gradeBadge, background: gradeColor(r.grade) }}>
                            {r.grade}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.editBtn} onClick={() => handleEdit(r)}>✏️ Edit</button>
                          <button style={styles.deleteBtn} onClick={() => handleDelete(r._id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
  badge: { background: "#2d6a9f", color: "white", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "700" },
  logoutBtn: { background: "#ef4444", color: "white", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "700" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" },
  statCard: { background: "white", borderRadius: "12px", padding: "1.5rem", textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  statNumber: { fontSize: "2rem", fontWeight: "800", color: "#1e3a5f" },
  statLabel: { fontSize: "0.85rem", color: "#808080", marginTop: "0.25rem" },
  tabs: { display: "flex", gap: "0.5rem", marginBottom: "1.5rem" },
  tab: { padding: "0.75rem 1.5rem", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", background: "#e2e8f0", color: "#555", fontSize: "0.95rem" },
  activeTab: { background: "#1e3a5f", color: "white" },
  msg: { padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontWeight: "600" },
  formCard: { background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  formTitle: { fontSize: "1.3rem", fontWeight: "800", color: "#1e3a5f", marginBottom: "1.5rem" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" },
  field: { display: "flex", flexDirection: "column" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#333", marginBottom: "0.4rem" },
  input: { padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e5e5e5", fontSize: "0.95rem", outline: "none" },
  submitBtn: { marginTop: "1.5rem", background: "#1e3a5f", color: "white", border: "none", borderRadius: "8px", padding: "0.85rem 2rem", fontWeight: "700", cursor: "pointer", fontSize: "1rem" },
  cancelBtn: { marginTop: "1.5rem", marginLeft: "1rem", background: "#e5e5e5", color: "#333", border: "none", borderRadius: "8px", padding: "0.85rem 2rem", fontWeight: "700", cursor: "pointer", fontSize: "1rem" },
  tableCard: { background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.08)" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f0f4f8" },
  th: { padding: "0.75rem 1rem", textAlign: "left", fontWeight: "700", color: "#1e3a5f", fontSize: "0.9rem" },
  tr: { borderBottom: "1px solid #f0f4f8" },
  td: { padding: "0.75rem 1rem", fontSize: "0.9rem", color: "#333" },
  gradeBadge: { color: "white", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "700" },
  editBtn: { background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", padding: "0.3rem 0.7rem", cursor: "pointer", fontWeight: "600", marginRight: "0.5rem" },
  deleteBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "0.3rem 0.7rem", cursor: "pointer", fontWeight: "600" },
  empty: { textAlign: "center", color: "#808080", padding: "2rem" },
};