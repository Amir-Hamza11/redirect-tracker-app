
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path"); // ✅ NEW

const app = express();
app.set('trust proxy', true); // 👈 Add this line to trust proxies/ keep ip address consistant
const port = process.env.PORT || 3001;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ NEW: Serve static HTML files from frontend/dist
const publicPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(publicPath));

// Create DB and Table
const db = new sqlite3.Database("tracker.db");
db.run(`
  CREATE TABLE IF NOT EXISTS redirects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pid TEXT,
    uid TEXT,
    status TEXT,
    timestamp TEXT,
    ipaddress TEXT
  )
`);


// REDIRECT ROUTE
app.get("/redirect/:status", (req, res) => {
  const { status } = req.params;
  const { pid, uid } = req.query;
  const ip= req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();

  if (!["complete", "terminate", "quotafull"].includes(status)) {
    return res.status(404).send("Invalid status.");
  }

  db.run(
    `INSERT INTO redirects (pid, uid, status, timestamp, ipaddress) VALUES (?, ?, ?, ?, ?)`,
    [pid, uid, status, timestamp, ipAddress],
    (err) => {
      if (err) {
        return res.status(500).send("Database error.");
      }

      // ✅ Serve correct static HTML file
      // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

      res.render("status", {
        pid,
        uid,
        status,
        ip,
      });
    }
  );
});

// DASHBOARD DATA ENDPOINT
app.get("/data", (req, res) => {
  db.all("SELECT * FROM redirects ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error fetching data");
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});