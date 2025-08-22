import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
const PORT = 3000;
const DB_PATH = process.env.DB_PATH || "./app.db";

app.use(express.json());

// 建立資料庫連線 + 初始化資料表
async function initDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return db;
}

let db; // 共用連線
initDb().then((conn) => {
  db = conn;
  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
    console.log(`DB file: ${DB_PATH}`);
  });
}).catch((err) => {
  console.error("Failed to init DB:", err);
  process.exit(1);
});

// 健康檢查
app.get("/health", (_req, res) => res.json({ ok: true }));

// 新增一筆資料：POST /items { "name": "foo" }
app.post("/items", async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const result = await db.run("INSERT INTO items (name) VALUES (?)", name);
  const item = await db.get("SELECT * FROM items WHERE id = ?", result.lastID);
  res.status(201).json(item);
});

// 查所有資料：GET /items
app.get("/items", async (_req, res) => {
  const rows = await db.all("SELECT * FROM items ORDER BY id DESC");
  res.json(rows);
});
