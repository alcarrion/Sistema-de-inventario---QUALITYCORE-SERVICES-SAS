// src/pages/TransactionsPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getMovimientos, postMovimiento, getProductos } from "../services/api";

function TransactionsPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState("entrada");
  const [formData, setFormData] = useState({
    fecha: "",
    cantidad: "",
    producto: ""
  });
  const [mensaje, setMensaje] = useState("");

  // Recuperar usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.rol === "Administrador";

  useEffect(() => {
    fetchMovimientos();
    fetchProductos();
  }, []);

  const fetchMovimientos = async () => {
    const data = await getMovimientos();
    setMovimientos(data);
  };

  const fetchProductos = async () => {
    const data = await getProductos();
    setProductos(data);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    const res = await postMovimiento({ ...formData, tipoMovimiento: tipo });
    if (res.ok) {
      fetchMovimientos();
      setShowModal(false);
      setFormData({ fecha: "", cantidad: "", producto: "" });
      setMensaje("✅ Movimiento guardado con éxito.");
      setTimeout(() => setMensaje(""), 3000);
    } else {
      setMensaje("❌ Error al guardar el movimiento.");
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const entradas = movimientos.filter(m => m.tipoMovimiento === "entrada");
  const salidas = movimientos.filter(m => m.tipoMovimiento === "salida");

  const styles = {
    page: { padding: "2rem", fontFamily: "sans-serif", backgroundColor: "#f9f9f9", minHeight: "100vh" },
    btn: {
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: 8,
      marginRight: "1rem",
      cursor: "pointer",
      fontWeight: "bold"
    },
    entradaBtn: { backgroundColor: "#bdfc38", color: "#000" },
    salidaBtn: { backgroundColor: "#f8bb59", color: "#000" },
    mensajeOk: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "0.75rem",
      borderRadius: "8px",
      marginBottom: "1rem"
    },
    mensajeError: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "0.75rem",
      borderRadius: "8px",
      marginBottom: "1rem"
    },
    card: {
      backgroundColor: "#fff",
      padding: "1.2rem",
      borderRadius: "12px",
      boxShadow: "0 0 12px rgba(0,0,0,0.06)",
      marginBottom: "2rem"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse"
    },
    th: {
      textAlign: "left",
      padding: "0.5rem",
      backgroundColor: "#f0f0f0"
    },
    td: {
      padding: "0.5rem",
      borderBottom: "1px solid #eee"
    },
    formButton: {
      backgroundColor: "#222",
      color: "white",
      padding: "0.6rem 1.2rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      marginTop: "1.5rem"
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={{ marginBottom: "1rem" }}>Movimientos</h2>

      {mensaje && (
        <div style={mensaje.startsWith("✅") ? styles.mensajeOk : styles.mensajeError}>
          {mensaje}
        </div>
      )}

      {isAdmin && (
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => { setTipo("entrada"); setShowModal(true); }}
            style={{ ...styles.btn, ...styles.entradaBtn }}
          >
            ➕ Añadir Entrada
          </button>
          <button
            onClick={() => { setTipo("salida"); setShowModal(true); }}
            style={{ ...styles.btn, ...styles.salidaBtn }}
          >
            ➖ Añadir Salida
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h3>ENTRADAS</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((m) => (
              <tr key={m.id}>
                <td style={styles.td}>{m.fecha}</td>
                <td style={styles.td}>{m.producto_nombre || m.producto}</td>
                <td style={styles.td}>{m.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.card}>
        <h3>SALIDAS</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Producto</th>
              <th style={styles.th}>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {salidas.map((m) => (
              <tr key={m.id}>
                <td style={styles.td}>{m.fecha}</td>
                <td style={styles.td}>{m.producto_nombre || m.producto}</td>
                <td style={styles.td}>{m.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={`Añadir ${tipo}`} onClose={() => setShowModal(false)}>
          <form style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="fecha" style={{ fontWeight: 600 }}>Fecha:</label>
              <input
                type="date"
                name="fecha"
                id="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minWidth: "160px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <label htmlFor="cantidad" style={{ fontWeight: 600 }}>Cantidad:</label>
              <input
                type="number"
                name="cantidad"
                id="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minWidth: "100px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <label htmlFor="producto" style={{ fontWeight: 600 }}>Producto:</label>
              <select
                name="producto"
                id="producto"
                value={formData.producto}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  minWidth: "200px"
                }}
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                style={styles.formButton}
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TransactionsPage;
