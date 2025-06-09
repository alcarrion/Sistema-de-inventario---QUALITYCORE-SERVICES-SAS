// src/pages/DashboardPage.js
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import UserProfile from "../components/UserProfile";
import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { AddUserForm } from "../components/AddUserForm";
import { Package, DollarSign, Users, Activity, Search, Bell, Settings } from "lucide-react";
import "../App.css";

export default function DashboardPage() {
  // Estado del usuario (simulado desde localStorage, lo puedes ajustar según tu backend)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { nombre: "Usuario", rol: "Sin rol" });
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Simulación de datos para las tarjetas del dashboard
  const stats = [
    {
      icon: <Package size={32} color="#3475eb" />,
      color: "#e6eeff",
      value: "1,247",
      label: "Productos Totales",
      percent: "+12%",
      percentColor: "#16c784"
    },
    {
      icon: <DollarSign size={32} color="#34cb74" />,
      color: "#e6fbe7",
      value: "$24,580",
      label: "Ventas del Mes",
      percent: "+8%",
      percentColor: "#16c784"
    },
    {
      icon: <Users size={32} color="#9057ff" />,
      color: "#efeaff",
      value: "892",
      label: "Clientes Registrados",
      percent: "+5%",
      percentColor: "#6c47e1"
    },
  ];

  // Acciones para los formularios (simulados, agrega aquí tu lógica real/API)
  const handleSaveEdit = (data) => {
    setUser(data);
    setShowEdit(false);
    localStorage.setItem("user", JSON.stringify(data));
  };
  const handleSavePass = (oldPass, newPass) => {
    setShowPass(false);
  };
  const handleSaveAdd = (newUser) => {
    setShowAdd(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        onShowPerfil={() => setShowProfile(true)}
      />
      <main className="dashboard-main">
        {showProfile ? (
          <>
            <UserProfile
              user={user}
              onClose={() => setShowProfile(false)}
              onEditProfile={() => setShowEdit(true)}
              onChangePassword={() => setShowPass(true)}
              onAddUser={() => setShowAdd(true)}
            />
            {showEdit && (
              <Modal onClose={() => setShowEdit(false)}>
                <EditProfileForm user={user} onSave={handleSaveEdit} onCancel={() => setShowEdit(false)} />
              </Modal>
            )}
            {showPass && (
              <Modal onClose={() => setShowPass(false)}>
                <ChangePasswordForm onSave={handleSavePass} onCancel={() => setShowPass(false)} />
              </Modal>
            )}
            {showAdd && (
              <Modal onClose={() => setShowAdd(false)}>
                <AddUserForm onSave={handleSaveAdd} onCancel={() => setShowAdd(false)} />
              </Modal>
            )}
          </>
        ) : (
          <>
            <div className="dashboard-header">
              <div>
                <h1>
                  Bienvenido/a, <span className="dashboard-user">{user?.nombre || user?.username}</span>
                </h1>
                <div className="dashboard-sub">Gestiona tu inventario de manera eficiente</div>
              </div>
              <div className="dashboard-header-actions">
                <div className="dashboard-search">
                  <Search size={18} />
                  <input type="text" placeholder="Buscar productos..." />
                </div>
                <Bell size={22} style={{ margin: "0 18px" }} />
                <Settings size={22} />
              </div>
            </div>
            <div className="dashboard-stats">
              {stats.map((stat, i) => (
                <div className="dashboard-card" key={i}>
                  <div className="dashboard-card-icon" style={{ background: stat.color }}>{stat.icon}</div>
                  <div className="dashboard-card-info">
                    <div className="dashboard-card-value">{stat.value}</div>
                    <div className="dashboard-card-label">{stat.label}</div>
                  </div>
                  <div className="dashboard-card-percent" style={{ color: stat.percentColor }}>{stat.percent}</div>
                </div>
              ))}
            </div>
            {/* Widgets y más contenido abajo */}
            <div className="dashboard-widget">
              <div className="dashboard-widget-title">Resumen de Ventas</div>
              <div className="dashboard-widget-placeholder">
                <Activity size={38} color="#bbb" />
                <span style={{ marginLeft: 12, color: "#aaa" }}>Aquí se mostrará el gráfico de ventas</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
