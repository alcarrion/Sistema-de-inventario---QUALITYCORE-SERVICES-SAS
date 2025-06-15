// src/components/UserProfile.js
import React from "react";
import "../App.css";

export default function UserProfile({
  user, onClose, onEditProfile, onChangePassword, onAddUser
}) {
  return (
    <div className="profile-container">
      <button className="back-btn" onClick={onClose}>←</button>
      <h2>Mi Perfil</h2>
      <div className="profile-info">
        <div className="profile-avatar">{user?.nombre?.[0]?.toUpperCase() || "U"}</div>
        <div><strong>Nombre:</strong> {user?.nombre}</div>
        <div><strong>Correo:</strong> {user?.email}</div>
        <div><strong>Teléfono:</strong> {user?.telefono}</div>
        <div><strong>ROL:</strong> {user?.rol}</div>
      </div>
      <div className="profile-actions">
        <button className="btn-edit-profile" onClick={onEditProfile}>EDITAR PERFIL</button>
        <button className="btn-change-password" onClick={onChangePassword}>CAMBIAR CONTRASEÑA</button>
      </div>
    </div>
  );
}
