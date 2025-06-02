const API_URL = "http://localhost:8000/api/productos";

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, message: "Error de conexión con el servidor" };
  }
}

export async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_URL}/forgot-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, message: "Error de conexión con el servidor" };
  }
}
