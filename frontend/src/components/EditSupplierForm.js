// src/components/EditSupplierForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
import "../styles/components/Form.css";


export default function EditSupplierForm({ proveedor, onSave, onCancel }) {
  const [nombre, setNombre] = useState(proveedor.nombre);
  const [correo, setCorreo] = useState(proveedor.correo || "");
  const [RUC, setRUC] = useState(proveedor.RUC);
  const [telefono, setTelefono] = useState(proveedor.telefono || "");
  const [direccion, setDireccion] = useState(proveedor.direccion || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!nombre || !RUC) {
      setError("Nombre y RUC son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/suppliers/${proveedor.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({
          nombre,
          correo,
          RUC,
          telefono,
          direccion,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "No se pudo editar el proveedor.");
      }
      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError(err.message || "Error al editar proveedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Editar proveedor</div>
      <div className="form-group">
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Correo</label>
        <input value={correo} onChange={e => setCorreo(e.target.value)} />
      </div>
      <div className="form-group">
        <label>RUC</label>
        <input value={RUC} onChange={e => setRUC(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input value={telefono} onChange={e => setTelefono(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Dirección</label>
        <input value={direccion} onChange={e => setDireccion(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
