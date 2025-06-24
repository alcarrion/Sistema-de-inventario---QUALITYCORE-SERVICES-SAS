import React, { useState, useEffect } from "react";
import {
  getClientes,
  getProductos,
  getCookie,
  API_URL,
  getCotizacionPDF,
} from "../services/api";

export default function QuotationPage() {
  const [cliente, setCliente] = useState("");
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
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
    nuevos[index][field] =
      field === "cantidad" || field === "precioUnitario" ? Number(value) : value;

    if (field === "producto") {
      const productoObj = productos.find((p) => p.id === parseInt(value));
      if (productoObj) {
        nuevos[index].precioUnitario = Number(productoObj.precio);
        nuevos[index].cantidad = 1;
        nuevos[index].subtotal = Number(productoObj.precio);
      }
    } else {
      nuevos[index].subtotal = nuevos[index].cantidad * nuevos[index].precioUnitario;
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

    const res = await fetch(`${API_URL}/cotizaciones/generar/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({ cliente, productos_cotizados: productosCotizados }),
    });

    const data = await res.json();
    if (res.ok && data.cotizacion?.id) {
      setMensaje("✅ Cotización guardada correctamente");
      setProductosCotizados([]);
      setCliente("");
      setSubtotal(0);
      setIva(0);
      setTotal(0);

      // 👇 Obtener URL del PDF desde la vista del backend
      const pdfResponse = await getCotizacionPDF(data.cotizacion.id);
      if (pdfResponse.ok && pdfResponse.url) {
        const fullUrl = API_URL.replace("/api/productos", "") + pdfResponse.url;
        setPdfUrl(fullUrl);
      }
    } else {
      setMensaje("❌ Error al guardar la cotización");
    }
  };

  return (
    <div className="cotiz-bg">
      <style>{`
        .cotiz-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6fff7 0%, #e6f5e9 100%);
          padding: 30px 10px;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        .cotiz-main {
          max-width: 700px;
          margin: 0 auto;
          padding: 32px 24px;
          background: #fff;
          border-radius: 2rem;
          box-shadow: 0 10px 40px rgba(68,160,92,0.12);
        }
        .cotiz-section {
          background: #f4fdf6;
          border-left: 7px solid #5ad97a;
          padding: 28px 24px;
          border-radius: 1.3rem;
          margin-bottom: 32px;
          box-shadow: 0 4px 16px rgba(68,160,92,0.06);
        }
        .cotiz-title {
          display: flex;
          align-items: center;
          font-size: 1.6rem;
          font-weight: bold;
          color: #256029;
          gap: 10px;
          margin-bottom: 14px;
        }
        .cotiz-label {
          font-weight: 600;
          color: #2e7333;
          margin-bottom: 5px;
          display: block;
        }
        .cotiz-select, .cotiz-input {
          width: 100%;
          border: 2px solid #bbf7d0;
          background: #e7fbe8;
          border-radius: 1rem;
          padding: 0.7rem 1.1rem;
          font-size: 1rem;
          margin-bottom: 6px;
          margin-top: 3px;
          color: #205526;
          outline: none;
          transition: border 0.2s;
        }
        .cotiz-select:focus, .cotiz-input:focus {
          border: 2px solid #16a34a;
          background: #f0fdf4;
        }
        .cotiz-btn {
          background: linear-gradient(90deg, #10b981 60%, #2ecc71 100%);
          color: #fff;
          font-weight: bold;
          border: none;
          border-radius: 2rem;
          padding: 0.75rem 2.1rem;
          font-size: 1.1rem;
          margin: 14px 0 0 0;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(42,196,109,0.15);
          transition: background 0.2s;
        }
        .cotiz-btn:hover {
          background: linear-gradient(90deg, #059669 70%, #16a34a 100%);
        }
        .cotiz-prod-list {
          margin-top: 10px;
        }
        .cotiz-prod-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1.2fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .cotiz-summary {
          background: linear-gradient(93deg, #41ba6b 40%, #127436 100%);
          color: #fff;
          padding: 30px 20px 25px 20px;
          border-radius: 1.5rem;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(68,160,92,0.08);
        }
        .cotiz-summary h3 {
          font-size: 1.4rem;
          margin-bottom: 16px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .cotiz-summary-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ffffff33;
          padding-bottom: 7px;
          margin-bottom: 6px;
          font-size: 1.05rem;
        }
        .cotiz-summary-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          font-size: 1.3rem;
          font-weight: bold;
          padding-top: 9px;
          color: #fdf29c;
        }
        .cotiz-pdf-link {
          display: inline-block;
          background: #ffc93c;
          color: #2d311b;
          padding: 0.8rem 2.3rem;
          border-radius: 1.5rem;
          font-weight: bold;
          font-size: 1.09rem;
          margin-top: 22px;
          box-shadow: 0 3px 12px rgba(255,201,60,0.17);
          text-decoration: none;
          transition: background 0.2s;
        }
        .cotiz-pdf-link:hover {
          background: #f0b70a;
        }
        .cotiz-empty {
          color: #4e7d5e;
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 7px;
          background: #e8f7eb;
          padding: 18px 14px;
          border-radius: 1rem;
          border: 1.5px dashed #8ff3ad;
          justify-content: center;
        }
        @media (max-width: 650px) {
          .cotiz-main, .cotiz-section, .cotiz-summary {
            padding: 18px 7px !important;
          }
          .cotiz-prod-row {
            grid-template-columns: 1fr 1fr;
            gap: 7px;
          }
        }
      `}</style>

      <div className="cotiz-main">

        {/* Cliente */}
        <div className="cotiz-section">
          <div className="cotiz-title">
            <span role="img" aria-label="cliente">👤</span>
            Información del Cliente
          </div>
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
          <div className="cotiz-title">
            <span role="img" aria-label="box">📦</span>
            Productos Cotizados
          </div>
          <button
            onClick={handleAddProducto}
            className="cotiz-btn"
            type="button"
          >
            ➕ Añadir Producto
          </button>
          <div className="cotiz-prod-list">
            {productosCotizados.length === 0 ? (
              <div className="cotiz-empty">
                <span role="img" aria-label="box">📦</span>
                No hay productos agregados
              </div>
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
                    placeholder="Cantidad"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) => handleProductoChange(index, "precioUnitario", e.target.value)}
                    className="cotiz-input"
                    placeholder="Precio Unitario"
                  />
                  <input
                    type="text"
                    readOnly
                    value={item.subtotal.toFixed(2)}
                    className="cotiz-input"
                    placeholder="Subtotal"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="cotiz-summary">
          <h3>
            <span role="img" aria-label="summary">💰</span>
            Resumen de Cotización
          </h3>
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

        {/* Botón Guardar */}
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

        {/* PDF generado */}
        {pdfUrl && (
          <div style={{ textAlign: "center" }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cotiz-pdf-link"
            >
              📄 Ver PDF de la Cotización
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
