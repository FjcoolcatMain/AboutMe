const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "devsecret";

// FIX: correct file path for Render
const DATA_FILE = path.join(__dirname, "data.json");

// rate limit login
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5
});
app.use("/api/login", limiter);

// fake user
const username = "Fj121";
const hashedPassword = bcrypt.hashSync("121", 10);

// auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    next();
  });
}

// login
app.post("/api/login", async (req, res) => {
  const { username: u, password } = req.body;

  if (u !== username) return res.status(401).send("Invalid");

  const valid = await bcrypt.compare(password, hashedPassword);
  if (!valid) return res.status(401).send("Invalid");

  const token = jwt.sign({ username: u }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// get public content
app.get("/api/content", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

// update content
app.put("/api/admin/content", auth, (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  if (req.body.home) data.home = req.body.home;
  if (req.body.about) data.about = req.body.about;

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.send("Updated");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
