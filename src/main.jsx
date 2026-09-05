import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Boxes, Edit3, Leaf, Milk, Plus, Search, Trash2, Warehouse, X } from 'lucide-react'
import './styles.css'

const emptyForm = { name: '', brand: '', units: '', warehouse: '', category: 'Leche' }

function Logo() {
  return <div className="logo-mark" aria-label="Logo Solarte"><Leaf size={23} strokeWidth={2.5} /><span>S</span></div>
}

function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    const response = await fetch('/api/products')
    setProducts(await response.json())
    setLoading(false)
  }
  useEffect(() => { loadProducts() }, [])

  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.brand} ${product.warehouse}`.toLowerCase().includes(search.toLowerCase())
  ), [products, search])
  const totalUnits = products.reduce((sum, product) => sum + product.units, 0)
  const brands = new Set(products.map((product) => product.brand)).size

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setIsFormOpen(true) }
  const openEdit = (product) => { setEditingId(product.id); setForm({ name: product.name, brand: product.brand, units: product.units, warehouse: product.warehouse, category: product.category }); setIsFormOpen(true) }
  const submit = async (event) => {
    event.preventDefault()
    const response = await fetch(editingId ? `/api/products/${editingId}` : '/api/products', { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, units: Number(form.units) }) })
    if (!response.ok) { setNotice('Revisa los datos del artículo'); return }
    setNotice(editingId ? 'Artículo actualizado correctamente' : 'Artículo creado correctamente')
    setIsFormOpen(false); setForm(emptyForm); setEditingId(null); loadProducts()
    setTimeout(() => setNotice(''), 3000)
  }
  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este artículo del inventario?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' }); setNotice('Artículo eliminado'); loadProducts(); setTimeout(() => setNotice(''), 3000)
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><Logo /><div><strong>solarte</strong><span>central de lácteos</span></div></div>
      <div className="api-status"><i></i> API conectada <span>v1.0</span></div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><Milk size={15} /> OPERACIÓN EN TIEMPO REAL</p><h1>Todo el frío,<br /><em>en orden.</em></h1><p className="intro">Controla las existencias de la bodega Solarte. Cada unidad cuenta para mantener la frescura en movimiento.</p><button className="primary-btn" onClick={openCreate}><Plus size={18} /> Nuevo artículo</button></div>
        <div className="hero-art"><div className="sun"></div><div className="bottle bottle-one"><span>solarte</span></div><div className="bottle bottle-two"><span>solarte</span></div><div className="shelf shelf-one"></div><div className="shelf shelf-two"></div><div className="sparkle">✦</div></div>
      </section>
      <section className="metrics"><div><span>ARTÍCULOS ACTIVOS</span><strong>{products.length}</strong><small>referencias en bodega</small></div><div><span>UNIDADES TOTALES</span><strong>{totalUnits.toLocaleString('es-CO')}</strong><small>productos disponibles</small></div><div><span>MARCAS</span><strong>{brands}</strong><small>aliados registrados</small></div><div><span>ESTADO DE BODEGA</span><strong className="healthy">ÓPTIMO</strong><small><i></i> sincronizado ahora</small></div></section>
      <section className="inventory-section"><div className="section-head"><div><p className="eyebrow">INVENTARIO</p><h2>Existencias de Solarte</h2></div><div className="toolbar"><label className="search"><Search size={17} /><input placeholder="Buscar artículo, marca..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="filter-btn"><Warehouse size={17} /> Todas las bodegas</button></div></div>
        <div className="table-wrap"><table><thead><tr><th>ARTÍCULO</th><th>MARCA</th><th>UNIDADES</th><th>UBICACIÓN</th><th>CATEGORÍA</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="empty">Cargando inventario...</td></tr> : filteredProducts.map((product, index) => <tr key={product.id} className="row-in"><td><div className="product-cell"><span className={`product-icon icon-${index % 3}`}><Milk size={18} /></span><div><strong>{product.name}</strong><small>SKU-{String(product.id).padStart(4, '0')}</small></div></div></td><td>{product.brand}</td><td><strong>{product.units}</strong></td><td><span className="location"><Warehouse size={14} /> {product.warehouse}</span></td><td><span className="tag">{product.category}</span></td><td><div className="actions"><button title="Editar" onClick={() => openEdit(product)}><Edit3 size={16} /></button><button title="Eliminar" onClick={() => remove(product.id)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table>{!loading && !filteredProducts.length && <div className="empty-state">No encontramos artículos con esa búsqueda.</div>}</div>
      </section>
    </main>
    <footer><span>© 2026 Solarte</span><span>Inventario de lácteos · API REST</span><span className="footer-dot"><i></i> Sistema operativo</span></footer>
    {notice && <div className="toast">{notice}</div>}
    {isFormOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsFormOpen(false)}><form className="modal" onSubmit={submit}><button type="button" className="close-btn" onClick={() => setIsFormOpen(false)}><X size={19} /></button><p className="eyebrow">{editingId ? 'EDITAR REGISTRO' : 'NUEVO REGISTRO'}</p><h2>{editingId ? 'Actualiza el artículo' : 'Suma al inventario'}</h2><div className="form-grid"><label>Nombre del artículo<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Leche entera UHT" /></label><label>Marca<input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Ej. Alpina" /></label><label>Unidades<input required type="number" min="0" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="0" /></label><label>Bodega<input required value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} placeholder="Ej. Fríos C-02" /></label><label className="full">Categoría<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Leche</option><option>Yogur</option><option>Alternativa</option><option>Queso</option></select></label></div><button className="primary-btn submit-btn">{editingId ? 'Guardar cambios' : 'Crear artículo'} <Plus size={17} /></button></form></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
