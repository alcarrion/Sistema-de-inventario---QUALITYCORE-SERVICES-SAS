// src/components/Sidebar.js
import React from "react";
import {
  LayoutDashboard, Box, BarChart2, FileText, Users,
  User, DollarSign, Truck, LogOut
} from "lucide-react";
import "../App.css";

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={require("../assets/logo.png")} alt="Logo" />
        <span>CoreQuality<br /><span className="sidebar-sub">Services</span></span>
      </div>
      <nav className="sidebar-nav">
        <a className="active"><LayoutDashboard size={20}/> Dashboard</a>
        <a><Box size={20}/> Inventario</a>
        <a><Truck size={20}/> Movimientos</a>
        <a><BarChart2 size={20}/> Reportes</a>
        <a><Users size={20}/> Proveedores</a>
        <a><User size={20}/> Clientes</a>
        <a><DollarSign size={20}/> Cotización</a>
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">{user?.first_name?.[0] || user?.username?.[0] || "U"}</div>
          <div>
            <div className="sidebar-user-name">{user?.first_name || user?.username || "Usuario"}</div>
            <div className="sidebar-user-role">Administrador</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} style={{marginRight:8}}/> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
