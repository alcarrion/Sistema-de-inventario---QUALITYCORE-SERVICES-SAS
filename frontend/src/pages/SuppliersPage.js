// src/pages/SuppliersPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { API_URL, getCookie } from "../services/api";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddSupplierForm from "../components/AddSupplierForm";
import EditSupplierForm from "../components/EditSupplierForm";

export default function SuppliersPage({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem("user"));
  const [proveedores, setProveedores] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [search, setSearch] = useState("");

  const isAdmin = currentUser?.rol === "Administrador";

  useEffect(() => {
    fetch(`${API_URL}/suppliers/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setProveedores(data.filter(p => !p.deleted_at)))
      .catch(() => setProveedores([]));
  }, [showAdd, showEdit]);

  const filtered = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.RUC && p.RUC.includes(search)) ||
    (p.correo && p.correo.toLowerCase().includes(search.toLowerCase())) ||
    (p.telefono && p.telefono.includes(search))
  );

  const handleDelete = (proveedor) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proveedor?")) return;
    fetch(`${API_URL}/suppliers/${proveedor.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    })
      .then(res => res.json())
      .then(() => setProveedores(prev => prev.filter(p => p.id !== proveedor.id)));
  };

  return (
    <div className="suppliers-page-container">
      <div className="suppliers-header">
        <button className="back-btn" onClick={() => window.history.back()}>←</button>
        <h2>PROVEEDORES</h2>
      </div>
      <div className="suppliers-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            placeholder="Buscar proveedores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button className="btn-add-supplier" onClick={() => setShowAdd(true)}>
            <FaPlus /> AÑADIR PROVEEDOR
          </button>
        )}
      </div>
      <div className="suppliers-list">
        {filtered.map(proveedor => (
          <div key={proveedor.id} className="supplier-card">
            <div><strong>NOMBRE:</strong> {proveedor.nombre}</div>
            <div><strong>CORREO:</strong> {proveedor.correo || "-"}</div>
            <div><strong>RUC:</strong> {proveedor.RUC || "-"}</div>
            <div><strong>TELÉFONO:</strong> {proveedor.telefono || "-"}</div>
            <div><strong>DIRECCIÓN:</strong> {proveedor.direccion || "-"}</div>
            {isAdmin && (
              <div className="supplier-actions">
                <button className="btn-icon"
                  onClick={() => { setEditingProveedor(proveedor); setShowEdit(true); }}>
                  <FaEdit />
                </button>
                <button className="btn-icon btn-delete" onClick={() => handleDelete(proveedor)}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="no-data">No hay proveedores para mostrar.</div>}
      </div>
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>
          <AddSupplierForm
            onSave={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>
      )}
      {showEdit && editingProveedor && (
        <Modal onClose={() => { setShowEdit(false); setEditingProveedor(null); }}>
          <EditSupplierForm
            proveedor={editingProveedor}
            onSave={() => {
              setShowEdit(false);
              setEditingProveedor(null);
            }}
            onCancel={() => {
              setShowEdit(false);
              setEditingProveedor(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
