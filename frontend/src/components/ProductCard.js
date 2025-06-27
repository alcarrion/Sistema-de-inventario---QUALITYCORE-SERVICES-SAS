// src/components/ProductCard.js
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductCard({ producto, onEdit, onDelete, isAdmin }) {
  return (
    <div className="product-card">
      <img
        src={producto.imagen || "https://via.placeholder.com/84?text=Sin+Imagen"}
        alt={producto.nombre}
        className="product-card-img"
      />
      <div className="product-card-content">
        <div className="product-card-title">{producto.nombre}</div>
        <div className="product-card-info"><strong>Categoría:</strong> {producto.categoria_nombre || "-"}</div>
        <div className="product-card-info"><strong>Proveedor:</strong> {producto.proveedor_nombre || "-"}</div>
        <div className="product-card-info"><strong>Precio:</strong> ${producto.precio}</div>
        <div className="product-card-info"><strong>Stock:</strong> {producto.stockActual}</div>
        <div className="product-card-info"><strong>Estado:</strong> {producto.estado}</div>
        {isAdmin && (
          <div className="product-card-actions">
            <button className="btn-icon" onClick={() => onEdit(producto)}>
              <FaEdit />
            </button>
            <button className="btn-icon btn-delete" onClick={() => onDelete(producto)}>
              <FaTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
