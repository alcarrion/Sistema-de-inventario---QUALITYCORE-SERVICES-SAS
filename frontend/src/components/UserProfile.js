// src/components/UserProfile.js
import React from "react";
import "../App.css";

export default function UserProfile({
  user, onClose, onEditProfile, onChangePassword, onAddUser
}) {
  return (
    <div className="profile-container">
      <button className="back-btn" onClick={onClose}>←</button>
      <h2>MY PROFILE</h2>
      <div className="profile-info">
        <div className="profile-avatar">{user?.nombre?.[0]?.toUpperCase() || "U"}</div>
        <div><strong>NAME:</strong> {user?.nombre}</div>
        <div><strong>EMAIL:</strong> {user?.email}</div>
        <div><strong>PHONE:</strong> {user?.telefono}</div>
        <div><strong>ROLE:</strong> {user?.rol}</div>
      </div>
      <div className="profile-actions">
        <button className="btn-edit-profile" onClick={onEditProfile}>EDIT PROFILE</button>
        <button className="btn-change-password" onClick={onChangePassword}>CHANGE PASSWORD</button>
        {user?.rol === "Administrador" && (
          <button className="btn-add-user" onClick={onAddUser}>
            ADD NEW USER
          </button>
        )}
      </div>
    </div>
  );
}
