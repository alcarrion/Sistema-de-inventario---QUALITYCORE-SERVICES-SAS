// src/components/EditCustomerForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";

export default function EditCustomerForm({ cliente, onSave, onCancel }) {

  const [nombre, setNombre] = useState(cliente.nombre);
  const [correo, setCorreo] = useState(cliente.correo);
  const [cedulaRUC, setCedulaRUC] = useState(cliente.cedulaRUC);
  const [telefono, setTelefono] = useState(cliente.telefono || "");
  const [direccion, setDireccion] = useState(cliente.direccion || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!nombre || !cedulaRUC) {
      setError("Nombre y cédula son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/customers/${cliente.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({
          nombre,
          correo,
          cedulaRUC,
          telefono,
          direccion,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "No se pudo editar el cliente.");
      }
      const data = await res.json();
      onSave(data);
    } catch (err) {
      setError(err.message || "Error al editar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Editar cliente</div>
      <div className="form-group">
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Correo</label>
        <input value={correo} onChange={e => setCorreo(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Cédula / RUC</label>
        <input value={cedulaRUC} onChange={e => setCedulaRUC(e.target.value)} required />
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
