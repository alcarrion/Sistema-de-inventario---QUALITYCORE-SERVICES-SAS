// src/pages/QuotationPage.js
import React, { useState, useEffect } from "react";
import {
  getClientes,
  getProductos,
  getCookie,
  API_URL,
  getCotizacionPDF,
} from "../services/api";

import "../styles/pages/QuotationPage.css"; 

export default function QuotationPage() {
  const [cliente, setCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [productosCotizados, setProductosCotizados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const [subtotal, setSubtotal] = useState(0);
  const [iva, setIva] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchClientes();
    fetchProductos();
  }, []);

  const fetchClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const fetchProductos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  const handleAddProducto = () => {
    setProductosCotizados([
      ...productosCotizados,
      { producto: "", cantidad: 1, precioUnitario: 0, subtotal: 0 },
    ]);
  };

  const handleProductoChange = (index, field, value) => {
    const nuevos = [...productosCotizados];
    
    if (field === "cantidad" || field === "precioUnitario") {
      if (value === "") {
        nuevos[index][field] = value; // permite borrar
      } else {
        value = value.replace(/^0+(?=\d)/, ""); 
        nuevos[index][field] = Number(value);
      }
    } else {
      nuevos[index][field] = value;
    }

    if (field === "producto") {
      const productoObj = productos.find((p) => p.id === parseInt(value));
      if (productoObj) {
        nuevos[index].precioUnitario = Number(productoObj.precio);
        nuevos[index].cantidad = 1;
        nuevos[index].subtotal = Number(productoObj.precio);
      }
    } else {
      const cantidad = Number(nuevos[index].cantidad) || 0;
      const precio = Number(nuevos[index].precioUnitario) || 0;
      nuevos[index].subtotal = cantidad * precio;
    }

    setProductosCotizados(nuevos);
    recalcularTotales(nuevos);
  };


  const recalcularTotales = (productos) => {
    const nuevoSubtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
    const nuevoIva = nuevoSubtotal * 0.15;
    const nuevoTotal = nuevoSubtotal + nuevoIva;

    setSubtotal(nuevoSubtotal.toFixed(2));
    setIva(nuevoIva.toFixed(2));
    setTotal(nuevoTotal.toFixed(2));
  };

  const handleGuardar = async () => {
    const csrftoken = getCookie("csrftoken");

    const res = await fetch(`${API_URL}/quotations/generate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({
        cliente,
        productos_cotizados: productosCotizados,
        observaciones,
      }),
    });

    const data = await res.json();
    if (res.ok && data.cotizacion?.id) {
      setMensaje("✅ Cotización guardada correctamente");
      setProductosCotizados([]);
      setCliente("");
      setSubtotal(0);
      setIva(0);
      setTotal(0);
      setObservaciones(""); 

      const pdfResponse = await getCotizacionPDF(data.cotizacion.id);
      if (pdfResponse.ok && pdfResponse.url) {
        const fullUrl = API_URL.replace("/api/productos", "") + pdfResponse.url;
        setPdfUrl(fullUrl);
      }
    } else {
      setMensaje("❌ Error al guardar la cotización");
    }
  };

  const handleVerPDF = () => {
    setMensaje("");
    setPdfUrl(null);
  };

  return (
    <div className="cotiz-bg">
      <div className="cotiz-main">
        {/* Cliente */}
        <div className="cotiz-section">
          <div className="cotiz-title">👤 Información del Cliente</div>
          <label className="cotiz-label">Cliente:</label>
          <select
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="cotiz-select"
          >
            <option value="">-- Selecciona un cliente --</option>
            {clientes.map((cli) => (
              <option key={cli.id} value={cli.id}>{cli.nombre}</option>
            ))}
          </select>
        </div>

        {/* Productos Cotizados */}
        <div className="cotiz-section">
          <div className="cotiz-title">📦 Productos Cotizados</div>
          <button onClick={handleAddProducto} className="cotiz-btn" type="button">
            ➕ Añadir Producto
          </button>

          {productosCotizados.length > 0 && (
            <div className="cotiz-prod-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio Unitario</span>
              <span>Subtotal</span>
              <span></span>
            </div>
          )}

          <div className="cotiz-prod-list">
            {productosCotizados.length === 0 ? (
              <div className="cotiz-empty">📦 No hay productos agregados</div>
            ) : (
              productosCotizados.map((item, index) => (
                <div key={index} className="cotiz-prod-row">
                  <select
                    value={item.producto}
                    onChange={(e) => handleProductoChange(index, "producto", e.target.value)}
                    className="cotiz-select"
                  >
                    <option value="">Producto</option>
                    {productos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleProductoChange(index, "cantidad", e.target.value)}
                    className="cotiz-input"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) => handleProductoChange(index, "precioUnitario", e.target.value)}
                    className="cotiz-input"
                  />
                  <input
                    type="text"
                    readOnly
                    value={item.subtotal.toFixed(2)}
                    className="cotiz-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const copia = [...productosCotizados];
                      copia.splice(index, 1);
                      setProductosCotizados(copia);
                      recalcularTotales(copia);
                    }}
                    className="cotiz-remove-btn"
                  >
                    ❌
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="cotiz-summary">
          <h3>💰 Resumen de Cotización</h3>
          <div className="cotiz-summary-row">
            <span>📊 Subtotal:</span>
            <span>${subtotal}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>🧾 IVA (15%):</span>
            <span>${iva}</span>
          </div>
          <div className="cotiz-summary-row">
            <span>💳 Total:</span>
            <span>${total}</span>
          </div>
        </div>

        {/* Observaciones */}
        <div className="cotiz-section">
          <div className="cotiz-title">📝 Observaciones</div>
          <label className="cotiz-label">Comentarios u observaciones para el cliente:</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows="4"
            className="cotiz-input"
            placeholder="Por ejemplo: Esta cotización es válida por 30 días..."
            style={{ resize: "vertical", minHeight: "100px" }}
          />
        </div>

        {/* Guardar */}
        <button
          onClick={handleGuardar}
          className="cotiz-btn"
          style={{ width: "100%" }}
        >
          💾 Guardar Cotización
        </button>

        {/* Mensaje */}
        {mensaje && (
          <p style={{
            marginTop: "14px",
            textAlign: "center",
            color: mensaje.startsWith("✅") ? "#127436" : "#c0392b",
            fontWeight: "bold",
            fontSize: "1.11rem"
          }}>
            {mensaje}
          </p>
        )}

        {/* PDF */}
        {pdfUrl && (
          <div style={{ textAlign: "center" }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cotiz-pdf-link"
              onClick={handleVerPDF}
            >
              📄 Ver PDF de la Cotización
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
