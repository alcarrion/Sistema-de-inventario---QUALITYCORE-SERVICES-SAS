// src/pages/ReportsPage.js
import React, { useState, useEffect } from "react";
import { getCookie, API_URL } from "../services/api";
import { FileText } from "lucide-react";
import "../styles/pages/ReportsPage.css"; 

export default function ReportsPage() {
  const [tipo, setTipo] = useState("movimientos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporteUrl, setReporteUrl] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/alerts/`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
    })
      .then((res) => res.json())
      .then((data) => setAlertas(data))
      .catch((err) => console.error("Error al obtener alertas", err));
  }, []);

  const handleGenerar = async () => {
    const csrftoken = getCookie("csrftoken");
    try {
      const res = await fetch(`${API_URL}/reports/generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({
          tipo,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const base = API_URL.replace("/api/productos", "");
        setReporteUrl(`${base}${data.url}`);
        setMensaje(data.message);
      } else {
        setMensaje(data.message || "Error al generar el reporte");
      }
    } catch {
      setMensaje("Error al conectar con el servidor.");
    }
  };

  const handleDescarga = () => {
    setMensaje(""); 
  };

  return (
    <div className="report-bg">
      <div className="report-card">
        <div className="report-title">📄 Generador de Reportes</div>
        <div className="report-subtitle">Selecciona el tipo y el rango de fechas</div>

        {alertas.length > 0 && (
          <div className="alert-section">
            <div className="alert-title">⚠️ Productos con bajo stock:</div>
            {alertas.map((a) => (
              <div className="alert-item" key={a.id}>
                • <strong>{a.producto.nombre}</strong>: {a.mensaje}
              </div>
            ))}
          </div>
        )}

        <label className="report-label">Tipo de reporte:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="report-select"
        >
          <option value="movimientos">Movimientos recientes</option>
          <option value="top_vendidos">Productos más vendidos</option>
        </select>

        <label className="report-label">Fecha de inicio:</label>
        <input
          type="date"
          className="report-input"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />

        <label className="report-label">Fecha de fin:</label>
        <input
          type="date"
          className="report-input"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />

        <button onClick={handleGenerar} className="report-btn">
          ⬇️ Generar Reporte PDF
        </button>

        {mensaje && (
          <div className="report-msg">
            <FileText size={18} /> {mensaje}
          </div>
        )}

        {reporteUrl && (
          <div style={{ textAlign: "center" }}>
            <a
              href={reporteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="report-pdf-link"
              onClick={handleDescarga}
            >
              📥 Descargar PDF generado
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
