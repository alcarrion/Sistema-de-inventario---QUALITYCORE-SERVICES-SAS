// src/pages/TransactionsPage.js
import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getMovimientos, postMovimiento, getProductos, getClientes } from "../services/api";
import "../styles/pages/TransactionsPage.css";

function TransactionsPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipo, setTipo] = useState("entrada");
  const [formData, setFormData] = useState({
    fecha: "",
    cantidad: "",
    producto: "",
    cliente: ""
  });
  const [mensaje, setMensaje] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const canCreateMovimientos = user?.rol === "Administrador" || user?.rol === "Usuario";

  useEffect(() => {
    fetchMovimientos();
    fetchProductos();
    fetchClientes();
  }, []);

  const fetchMovimientos = async () => {
    const data = await getMovimientos();
    setMovimientos(data);
  };

  const fetchProductos = async () => {
    const data = await getProductos();
    const activos = data.filter(p => p.estado === "Activo");
    setProductos(activos);
  };

  const fetchClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    const productoSeleccionado = productos.find(p => p.id === parseInt(formData.producto));

    const cantidad = parseInt(formData.cantidad);

    if (tipo === "salida" && productoSeleccionado && cantidad > productoSeleccionado.stockActual) {
      setMensaje("❌ No hay suficiente stock disponible para esta salida.");
      setTimeout(() => setMensaje(""), 4000);
      return;
    }

    const res = await postMovimiento({ ...formData, tipoMovimiento: tipo });
    if (res.ok) {
      fetchMovimientos();
      fetchProductos();
      window.dispatchEvent(new Event("recargarInventario"));
      setShowModal(false);
      setFormData({ fecha: "", cantidad: "", producto: "", cliente: "" });
      setMensaje("✅ Movimiento guardado con éxito.");
      setTimeout(() => setMensaje(""), 3000);
    } else {
      setMensaje("❌ Error al guardar el movimiento.");
      setTimeout(() => setMensaje(""), 4000);
    }
  };

  const entradas = movimientos.filter(m => m.tipoMovimiento === "entrada");
  const salidas = movimientos.filter(m => m.tipoMovimiento === "salida");

  return (
    <div className="page">
      <h2 style={{ marginBottom: "1rem" }}>Movimientos</h2>

      {mensaje && (
        <div className={mensaje.startsWith("✅") ? "mensajeOk" : "mensajeError"}>
          {mensaje}
        </div>
      )}

      {canCreateMovimientos && (
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => { setTipo("entrada"); setShowModal(true); }}
            className="btn entradaBtn"
          >
            ➕ Añadir Entrada
          </button>
          <button
            onClick={() => { setTipo("salida"); setShowModal(true); }}
            className="btn salidaBtn"
          >
            ➖ Añadir Salida
          </button>
        </div>
      )}

      <div className="card">
        <h3>ENTRADAS</h3>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Fecha</th>
              <th className="th">Producto</th>
              <th className="th">Cantidad</th>
              <th className="th">Proveedor</th>
              <th className="th">Stock</th>
              <th className="th">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((m) => (
              <tr key={m.id}>
                <td className="td">{new Date(m.fecha).toLocaleDateString()} {new Date(m.fecha).toLocaleTimeString()}</td>
                <td className="td">{m.producto_nombre || m.producto}</td>
                <td className="td">{m.cantidad}</td>
                <td className="td">{m.proveedor_nombre}</td>
                <td className="td">{m.stockProducto}</td>
                <td className="td">{m.vendedor_nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>SALIDAS</h3>
        <table className="table">
          <thead>
            <tr>
              <th className="th">Fecha</th>
              <th className="th">Producto</th>
              <th className="th">Cantidad</th>
              <th className="th">Cliente</th>
              <th className="th">Stock</th>
              <th className="th">Vendedor</th>
            </tr>
          </thead>
          <tbody>
            {salidas.map((m) => (
              <tr key={m.id}>
                <td className="td">{new Date(m.fecha).toLocaleDateString()} {new Date(m.fecha).toLocaleTimeString()}</td>
                <td className="td">{m.producto_nombre || m.producto}</td>
                <td className="td">{m.cantidad}</td>
                <td className="td">{m.cliente_nombre || m.cliente}</td>
                <td className="td">{m.stockProducto}</td>
                <td className="td">{m.vendedor_nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={`Añadir ${tipo}`} onClose={() => setShowModal(false)}>
          <form className="formContainer">
            <div className="formGroup">
              <label htmlFor="fecha" style={{ fontWeight: 600 }}>Fecha:</label>
              <input
                type="datetime-local"
                name="fecha"
                id="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="input fechaInput"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="cantidad" style={{ fontWeight: 600 }}>Cantidad:</label>
              <input
                type="number"
                name="cantidad"
                id="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                className="input cantidadInput"
              />
            </div>

            <div className="formGroup" style={{ flexGrow: 1 }}>
              <label htmlFor="producto" style={{ fontWeight: 600 }}>Producto:</label>
              <select
                name="producto"
                id="producto"
                value={formData.producto}
                onChange={handleInputChange}
                className="select productoSelect"
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {tipo === "salida" && (
              <div className="formGroup" style={{ flexGrow: 1 }}>
                <label htmlFor="cliente" style={{ fontWeight: 600 }}>Cliente:</label>
                <select
                  name="cliente"
                  id="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  className="select clienteSelect"
                >
                  <option value="">-- Selecciona un cliente --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                className="formButton"
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
