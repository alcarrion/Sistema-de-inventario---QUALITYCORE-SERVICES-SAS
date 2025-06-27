// src/pages/DashboardPage.js
import React, { useState, useEffect } from "react";
import UserProfile from "../components/UserProfile";
import Modal from "../components/Modal";
import EditProfileForm from "../components/EditProfileForm";
import { ChangePasswordForm } from "../components/ChangePasswordForm";
import { AddUserForm } from "../components/AddUserForm";
import { Package, DollarSign, Users, Activity, Search, Bell, Settings } from "lucide-react";
import { API_URL, getCookie } from "../services/api";
import "../styles/pages/DashboardPage.css"; 

export default function DashboardPage() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || { nombre: "Usuario", rol: "Sin rol" });
  const [showProfile, setShowProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [alertas, setAlertas] = useState([]);

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

  useEffect(() => {
    fetch(`${API_URL}/alerts/`, {
      method: "GET",
      headers: {
        "X-CSRFToken": getCookie("csrftoken")
      },
      credentials: "include"  
    })
      .then(res => res.json())
      .then(data => setAlertas(data));
  }, []);

  const cerrarAlerta = async (id) => {
    await fetch(`${API_URL}/alerts/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      credentials: "include",
      body: JSON.stringify({ deleted_at: new Date().toISOString() })
    });
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

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

  return (
    <div className="dashboard-root">
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

            {alertas.length > 0 && (
              <div className="dashboard-alertas" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>🚨 Alertas de Stock</h3>
                <ul>
                  {alertas.map((alerta) => (
                    <li key={alerta.id} style={{
                      marginBottom: "0.5rem",
                      padding: "0.6rem",
                      background: "#fffbe6",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <strong>{alerta.producto_nombre}:</strong> {alerta.mensaje}
                      </div>
                      <button
                        onClick={() => cerrarAlerta(alerta.id)}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          padding: "0.3rem 0.7rem",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Ocultar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
