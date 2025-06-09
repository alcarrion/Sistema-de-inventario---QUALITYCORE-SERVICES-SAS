// src/components/ChangePasswordForm.js
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

export function ChangePasswordForm({ onSave, onCancel }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");

    const csrftoken = getCookie("csrftoken");
    try {
      const res = await fetch(`${API_URL}/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
      });

      if (!res.ok) throw new Error("No se pudo cambiar la contraseña.");

      // ✔️ Éxito: redirigir al login
      alert("Contraseña cambiada con éxito. Por seguridad, debes iniciar sesión nuevamente.");
      window.location.href = "/login";
    } catch (err) {
      setError("Hubo un error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }

  };

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-title">Change Password</div>
      <div className="form-group">
        <label>Old Password</label>
        <input
          type="password"
          value={oldPass}
          onChange={e => setOldPass(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
          required
        />
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

