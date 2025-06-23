import React, { useState } from "react";
import { getCookie, API_URL } from "../services/api";

export default function ReportsPage() {
  const [tipo, setTipo] = useState("movimientos");
  const [reporteUrl, setReporteUrl] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleGenerar = async () => {
    const csrftoken = getCookie("csrftoken");
    try {
      const res = await fetch(`${API_URL}/reportes/generar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        credentials: "include",
        body: JSON.stringify({ tipo }),
      });

      const data = await res.json();
      if (res.ok) {
        setReporteUrl(`http://localhost:8000${data.url}`);
        setMensaje(data.message);
      } else {
        setMensaje(data.message || "Error al generar el reporte");
      }
    } catch (err) {
      setMensaje("Error en la conexión con el servidor");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Generar Reporte</h2>

      <label className="block mb-2 font-semibold">Tipo de reporte:</label>
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="border p-2 rounded mb-4"
      >
        <option value="movimientos">Movimientos recientes</option>
        <option value="top_vendidos">Productos más vendidos</option>
        <option value="bajo_stock">Productos bajo stock mínimo</option>
      </select>

      <button
        onClick={handleGenerar}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Generar Reporte
      </button>

      {mensaje && <p className="mt-4 text-green-700">{mensaje}</p>}

      {reporteUrl && (
        <div className="mt-4">
          <a
            href={reporteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline"
          >
            Descargar PDF generado
          </a>
        </div>
      )}
    </div>
  );
}
