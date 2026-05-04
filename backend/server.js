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

const DATA_FILE = path.join(__dirname, "data.json");

// Fake user
const USERNAME = "Fj121";
const PASSWORD_HASH = bcrypt.hashSync("121", 10);

// Rate limit login
app.use("/api/login", rateLimit({
  windowMs: 60 * 1000,
  max: 5
}));

// AUTH middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET, (err) => {
    if (err) return res.sendStatus(403);
    next();
  });
}

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== USERNAME) return res.status(401).send("Invalid");

  const ok = await bcrypt.compare(password, PASSWORD_HASH);
  if (!ok) return res.status(401).send("Invalid");

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// GET CONTENT
app.get("/api/content", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

// UPDATE CONTENT
app.put("/api/admin/content", auth, (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));

  if (req.body.home) data.home = req.body.home;
  if (req.body.about) data.about = req.body.about;

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.send("Updated");
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
