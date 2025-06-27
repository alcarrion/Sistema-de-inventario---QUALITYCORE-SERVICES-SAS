// src/components/AddUserForm.js
import React, { useState } from "react";
import { API_URL, getCookie } from "../services/api";
import "../styles/components/Form.css";


export function AddUserForm({ onSave, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState("Usuario");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // Validación del teléfono
  if (!/^\d{10}$/.test(telefono)) {
    setError("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
    setLoading(false);
    return;
  }

  const csrftoken = getCookie("csrftoken");

  try {
    const res = await fetch(`${API_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({ nombre, email, telefono, rol, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      let errorMsg = "No se pudo crear el usuario.";
      
      // Si el backend devuelve errores tipo { campo: ["error"] }
      if (typeof data === "object" && data !== null) {
        const detalles = Object.entries(data)
          .map(([campo, errores]) => `${campo}: ${errores.join(", ")}`)
          .join(" | ");
        errorMsg += ` Motivo: ${detalles}`;
      }

      throw new Error(errorMsg);
    }
    const data = await res.json();
    onSave(data);
  } catch (err) {
    setError(err.message || "Hubo un error al crear el usuario.");
  } finally {
    setLoading(false);
  }
};

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Añadir nuevo usuario</div>
      <div className="form-group">
        <label>Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Correo</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Teléfono</label>
        <input value={telefono} onChange={e => setTelefono(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Rol</label>
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="Usuario">Usuario</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>
      <div className="form-group">
        <label>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Guradando..." : "Añadir"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
