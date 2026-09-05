import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
fs.mkdirSync(dataDir, { recursive: true })

// Credenciales/configuracion de conexion solicitadas para la sustentacion.
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'solarte_admin',
  password: process.env.DB_PASSWORD || 'solarte_demo_password',
  database: process.env.DB_NAME || 'solarte_inventory',
  filename: process.env.DB_FILE || path.join(dataDir, 'solarte.db')
}

const db = new Database(dbConfig.filename)
db.pragma('journal_mode = WAL')
db.exec(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  units INTEGER NOT NULL CHECK(units >= 0),
  warehouse TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Leche',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`)

const count = db.prepare('SELECT COUNT(*) AS total FROM products').get().total
if (!count) {
  const seed = db.prepare('INSERT INTO products (name, brand, units, warehouse, category) VALUES (?, ?, ?, ?, ?)')
  const addMany = db.transaction(() => {
    seed.run('Leche entera UHT', 'Alquería', 148, 'Fríos A-01', 'Leche')
    seed.run('Leche deslactosada', 'Colanta', 92, 'Fríos A-02', 'Leche')
    seed.run('Leche de almendras', 'Alpina', 64, 'Fríos B-01', 'Alternativa')
    seed.run('Yogur natural familiar', 'Parmalat', 51, 'Fríos B-03', 'Yogur')
  })
  addMany()
}

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Solarte Inventory API' }))
app.get('/api/products', (_req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all()
  res.json(products)
})
app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id)
  if (!product) return res.status(404).json({ error: 'Articulo no encontrado' })
  res.json(product)
})
app.post('/api/products', (req, res) => {
  const { name, brand, units, warehouse, category = 'Leche' } = req.body
  if (!name?.trim() || !brand?.trim() || !warehouse?.trim() || !Number.isInteger(Number(units)) || Number(units) < 0) {
    return res.status(400).json({ error: 'Nombre, marca, unidades y bodega son obligatorios' })
  }
  const result = db.prepare('INSERT INTO products (name, brand, units, warehouse, category) VALUES (?, ?, ?, ?, ?)').run(name.trim(), brand.trim(), Number(units), warehouse.trim(), category)
  res.status(201).json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid))
})
app.put('/api/products/:id', (req, res) => {
  const { name, brand, units, warehouse, category = 'Leche' } = req.body
  if (!name?.trim() || !brand?.trim() || !warehouse?.trim() || !Number.isInteger(Number(units)) || Number(units) < 0) {
    return res.status(400).json({ error: 'Datos del articulo invalidos' })
  }
  const result = db.prepare('UPDATE products SET name = ?, brand = ?, units = ?, warehouse = ?, category = ? WHERE id = ?').run(name.trim(), brand.trim(), Number(units), warehouse.trim(), category, req.params.id)
  if (!result.changes) return res.status(404).json({ error: 'Articulo no encontrado' })
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id))
})
app.delete('/api/products/:id', (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  if (!result.changes) return res.status(404).json({ error: 'Articulo no encontrado' })
  res.status(204).end()
})

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'dist')
  app.use(express.static(frontendPath))
  app.get('*', (_req, res) => res.sendFile(path.join(frontendPath, 'index.html')))
}

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Solarte API activa en http://localhost:${port}`))
