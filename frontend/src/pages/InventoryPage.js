// src/pages/InventoryPage.js
import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import AddProductForm from "../components/AddProductForm";
import EditProductForm from "../components/EditProductForm";
import { API_URL, getCookie } from "../services/api";
import { FaPlus, FaSearch } from "react-icons/fa";

export default function InventoryPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser?.rol === "Administrador";
  const [productos, setProductos] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState("");

  // Cargar productos
  useEffect(() => {
    fetch(`${API_URL}/products/`, {
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      }
    })
      .then(res => res.json())
      .then(data => setProductos(data.filter(p => !p.deleted_at)))
      .catch(() => setProductos([]));
  }, [showAdd, showEdit]);

  // Cargar proveedores
  useEffect(() => {
    fetch(`${API_URL}/suppliers/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setProveedores(data.filter(p => !p.deleted_at)))
      .catch(() => setProveedores([]));
  }, []);

  // Cargar categorías
  useEffect(() => {
    fetch(`${API_URL}/categories/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  const productosConNombres = productos.map(p => {
    const cat = categorias.find(c => c.id === p.categoria);
    const prov = proveedores.find(pr => pr.id === p.proveedor);
    return {
      ...p,
      categoria_nombre: cat ? cat.nombre : "-",
      proveedor_nombre: prov ? prov.nombre : "-"
    };
  });

  const filtered = productosConNombres.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(search.toLowerCase())) ||
    (p.proveedor_nombre && p.proveedor_nombre.toLowerCase().includes(search.toLowerCase()))
  );


  // Eliminar producto (soft-delete)
  const handleDelete = producto => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    fetch(`${API_URL}/products/${producto.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    })
      .then(res => res.json())
      .then(() => setProductos(prev => prev.filter(p => p.id !== producto.id)));
  };

  return (
    <div className="inventory-page-container">
      <div className="inventory-header">
        <h2>INVENTARIO</h2>
      </div>
      <div className="inventory-actions">
        <div className="inventory-search-bar">
          <FaSearch />
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-add-product" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PRODUCTO
          </button>
        )}
      </div>
      <div className="product-list">
        {filtered.map(producto => (
          <ProductCard
            key={producto.id}
            producto={producto}
            isAdmin={isAdmin}
            onEdit={p => { setEditingProduct(p); setShowEdit(true); }}
            onDelete={p => handleDelete(p)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="no-data">No hay productos para mostrar.</div>
        )}
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddProductForm
            proveedores={proveedores}
            categorias={categorias}
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
            recargarCategorias={() => {
              fetch(`${API_URL}/categories/`, { credentials: "include" })
                .then(res => res.json())
                .then(data => setCategorias(data));
            }}
          />
        </Modal>
      )}
      {showEdit && editingProduct && (
        <Modal onClose={() => { setShowEdit(false); setEditingProduct(null); }}>
          <EditProductForm
            producto={editingProduct}
            proveedores={proveedores}
            categorias={categorias}
            onSave={() => { setShowEdit(false); setEditingProduct(null); }}
            onCancel={() => { setShowEdit(false); setEditingProduct(null); }}
            recargarCategorias={() => {
              fetch(`${API_URL}/categories/`, { credentials: "include" })
                .then(res => res.json())
                .then(data => setCategorias(data));
            }}
          />
        </Modal>
      )}
    </div>
  );
}
