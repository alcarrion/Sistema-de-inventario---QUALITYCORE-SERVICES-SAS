// src/components/EditProductForm.js
import React, { useState, useEffect } from "react";
import { API_URL, getCookie } from "../services/api";

export default function EditProductForm({ producto, onSave, onCancel }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");
  const [categoria, setCategoria] = useState(producto.categoria || "");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [proveedor, setProveedor] = useState(producto.proveedor || "");
  const [proveedores, setProveedores] = useState([]);
  const [precio, setPrecio] = useState(producto.precio);
  const [stockActual, setStockActual] = useState(producto.stockActual);
  const [stockMinimo, setStockMinimo] = useState(producto.stockMinimo);
  const [estado, setEstado] = useState(producto.estado);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/suppliers/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setProveedores(data.filter(p => !p.deleted_at)))
      .catch(() => setProveedores([]));

    fetch(`${API_URL}/categories/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setCategorias(data))
      .catch(() => setCategorias([]));
  }, []);

  const handleFileChange = e => {
    setImagen(e.target.files[0]);
  };

  const handleNuevaCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ nombre: nuevaCategoria }),
      });
      const data = await res.json();
      setCategorias(prev => [...prev, data]);
      setCategoria(data.id);
      setNuevaCategoria("");
    } catch {
      setError("No se pudo crear la categoría.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!nombre || !precio || !stockActual || !stockMinimo || !categoria || !proveedor) {
      setError("Todos los campos marcados son obligatorios.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    formData.append("precio", precio);
    formData.append("stockActual", stockActual);
    formData.append("stockMinimo", stockMinimo);
    formData.append("estado", estado);
    formData.append("proveedor", proveedor);
    if (imagen) formData.append("imagen", imagen);

    try {
      const res = await fetch(`${API_URL}/products/${producto.id}/`, {
        method: "PATCH",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("No se pudo editar el producto.");
      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError(err.message || "Error al editar producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-title">Editar producto</div>
      <div className="form-group">
        <label>Nombre *</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <input value={descripcion} onChange={e => setDescripcion(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Categoría *</label>
        <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
          <option value="">Seleccione</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            placeholder="Nueva categoría"
            value={nuevaCategoria}
            onChange={e => setNuevaCategoria(e.target.value)}
          />
          <button type="button" onClick={handleNuevaCategoria} disabled={loading || !nuevaCategoria}>Añadir</button>
        </div>
      </div>
      <div className="form-group">
        <label>Proveedor *</label>
        <select value={proveedor} onChange={e => setProveedor(e.target.value)} required>
          <option value="">Seleccione</option>
          {proveedores.map(prov => (
            <option key={prov.id} value={prov.id}>{prov.nombre}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Precio *</label>
        <input type="number" min={0} value={precio} onChange={e => setPrecio(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Stock actual *</label>
        <input type="number" min={0} value={stockActual} onChange={e => setStockActual(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Stock mínimo *</label>
        <input type="number" min={0} value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Estado *</label>
        <select value={estado} onChange={e => setEstado(e.target.value)} required>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
      <div className="form-group">
        <label>Imagen</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>Cancelar</button>
      </div>
    </form>
  );
}
