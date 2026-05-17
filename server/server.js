require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "https://student-result-management-omega.vercel.app"] }));
app.use(express.json());

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/studentresult")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── SCHEMAS ──────────────────────────────────────────────────

// User Schema (Teacher + Student)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["teacher", "student"], default: "student" },
  rollNumber: { type: String }, // only for students
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Result Schema
const resultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  marks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});
const Result = mongoose.model("Result", resultSchema);

// ── MIDDLEWARE ────────────────────────────────────────────────
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "student_secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Teacher access only" });
  }
  next();
};

// ── AUTH ROUTES ───────────────────────────────────────────────

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, rollNumber } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || "student", rollNumber });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber },
      process.env.JWT_SECRET || "student_secret",
      { expiresIn: "7d" }
    );
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: "Invalid email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, error: "Invalid email or password" });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber },
      process.env.JWT_SECRET || "student_secret",
      { expiresIn: "7d" }
    );
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, rollNumber: user.rollNumber } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ── RESULT ROUTES (CRUD) ──────────────────────────────────────

// CREATE result (teacher only)
app.post("/api/results", protect, teacherOnly, async (req, res) => {
  const { studentName, rollNumber, email, subject, marks, totalMarks } = req.body;
  if (!studentName || !rollNumber || !subject || !marks || !totalMarks) {
    return res.status(400).json({ success: false, error: "All fields required" });
  }
  try {
    const percentage = (marks / totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    const result = await Result.create({ studentName, rollNumber, email, subject, marks, totalMarks, grade, createdBy: req.user.id });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// READ all results (teacher only)
app.get("/api/results", protect, teacherOnly, async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// READ student own results
// READ student own results
app.get("/api/results/my", protect, async (req, res) => {
  try {
    console.log("Student rollNumber from token:", req.user.rollNumber);
    const results = await Result.find({ rollNumber: req.user.rollNumber }).sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// UPDATE result (teacher only)
app.put("/api/results/:id", protect, teacherOnly, async (req, res) => {
  const { studentName, rollNumber, email, subject, marks, totalMarks } = req.body;
  try {
    const percentage = (marks / totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      { studentName, rollNumber, email, subject, marks, totalMarks, grade },
      { new: true }
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE result (teacher only)
app.delete("/api/results/:id", protect, teacherOnly, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Result deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));