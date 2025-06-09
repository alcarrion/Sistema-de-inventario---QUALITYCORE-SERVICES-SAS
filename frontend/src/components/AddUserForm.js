// src/components/AddUserForm.js
import React, { useState } from "react";
import { API_URL } from "../services/api";

// Función para obtener el CSRF token de las cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
    const res = await fetch(`${API_URL}/usuarios/`, {
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
      <div className="form-title">Add New User</div>
      <div className="form-group">
        <label>Name</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={telefono} onChange={e => setTelefono(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Role</label>
        <select value={rol} onChange={e => setRol(e.target.value)}>
          <option value="Usuario">User</option>
          <option value="Administrador">Admin</option>
        </select>
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
