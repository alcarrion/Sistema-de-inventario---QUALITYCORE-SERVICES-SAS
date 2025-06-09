// src/components/EditProfileForm.js
import React, { useState } from "react";
import { API_URL } from "../services/api";

// Función para obtener el CSRF token de las cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function EditProfileForm({ user, onSave, onCancel }) {
  const [nombre, setNombre] = useState(user.nombre);
  const [telefono, setTelefono] = useState(user.telefono || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // ✅ Validación del teléfono
  if (telefono && !/^\d{10}$/.test(telefono)) {
    setError("El número de teléfono debe tener exactamente 10 dígitos numéricos.");
    setLoading(false);
    return;
  }

  const csrftoken = getCookie("csrftoken");

  try {
    const res = await fetch(`${API_URL}/usuarios/${user.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({ nombre, telefono }),
    });
    if (!res.ok) throw new Error("No se pudo actualizar.");
    const data = await res.json();
    onSave(data);
  } catch (err) {
    setError("Hubo un error al guardar los cambios.");
  } finally {
    setLoading(false);
  }
};


  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Edit Profile</div>
      <div className="form-group">
        <label>Name</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input value={telefono} onChange={e => setTelefono(e.target.value)} />
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button className="btn-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
