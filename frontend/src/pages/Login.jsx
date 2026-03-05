import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      navigate("/");
    } catch (error) {
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Bienvenido 👋</h2>
        <p style={subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={handleLogin} style={form}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            required
          />

          <button type="submit" style={button}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

/* ESTILOS */

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #4f46e5, #2563eb)"
};

const card = {
  background: "white",
  padding: "40px",
  borderRadius: "15px",
  width: "350px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  textAlign: "center"
};

const title = {
  marginBottom: "5px"
};

const subtitle = {
  marginBottom: "25px",
  color: "gray",
  fontSize: "14px"
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "15px"
};

const input = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "14px"
};

const button = {
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s"
};

export default Login;