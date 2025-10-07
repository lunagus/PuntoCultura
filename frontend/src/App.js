import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/inicio";
import Eventos from "./pages/eventos";
import Espacios from "./pages/espacios";
import Contacto from "./pages/contacto";
import Login from "./pages/login";
import "./assets/css/estilos.css"; // tu CSS principal

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/espacios" element={<Espacios />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
