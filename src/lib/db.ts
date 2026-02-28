import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";

type SqlDb = { run: (sql: string, ...args: unknown[]) => void; exec: (sql: string) => { values: unknown[][] }[]; export: () => Uint8Array; close: () => void };

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "lexplain.db");

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function getSql() {
  if (SQL) return SQL;
  SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
  });
  return SQL;
}

function loadDbBuffer(): Buffer | null {
  ensureDir();
  try {
    return fs.readFileSync(DB_PATH);
  } catch {
    return null;
  }
}

function saveDb(db: SqlDb) {
  ensureDir();
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function runMigrations(db: SqlDb) {
  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export interface Stats {
  totalAnalyses: number;
  totalRatings: number;
  averageRating: number;
  positiveCount: number;
}

export async function getStats(): Promise<Stats> {
  const Sql = await getSql();
  const buffer = loadDbBuffer();
  const db = buffer ? new Sql.Database(buffer) : new Sql.Database();
  runMigrations(db);

  const analysesRow = db.exec("SELECT COUNT(*) as c FROM analyses");
  const totalAnalyses = analysesRow.length
    ? (analysesRow[0].values[0][0] as number)
    : 0;

  const ratingsRow = db.exec("SELECT COUNT(*) as c, COALESCE(AVG(score), 0) as avg FROM ratings");
  let totalRatings = 0;
  let averageRating = 0;
  if (ratingsRow.length && ratingsRow[0].values[0]) {
    totalRatings = ratingsRow[0].values[0][0] as number;
    averageRating = Number((ratingsRow[0].values[0][1] as number).toFixed(1));
  }

  const positiveRow = db.exec("SELECT COUNT(*) as c FROM ratings WHERE score >= 4");
  const positiveCount = positiveRow.length ? (positiveRow[0].values[0][0] as number) : 0;

  db.close();
  return { totalAnalyses, totalRatings, averageRating, positiveCount };
}

export async function recordAnalysis(): Promise<void> {
  const Sql = await getSql();
  const buffer = loadDbBuffer();
  const db = buffer ? new Sql.Database(buffer) : new Sql.Database();
  runMigrations(db);
  db.run("INSERT INTO analyses (created_at) VALUES (datetime('now'))");
  saveDb(db);
  db.close();
}

export async function recordRating(score: number): Promise<void> {
  if (score < 1 || score > 5) return;
  const Sql = await getSql();
  const buffer = loadDbBuffer();
  const db = buffer ? new Sql.Database(buffer) : new Sql.Database();
  runMigrations(db);
  db.run("INSERT INTO ratings (score) VALUES (?)", [score]);
  saveDb(db);
  db.close();
}
