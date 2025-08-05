import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import "./styles/App.css";

// Componentes
import Login from "./components/Login";

// Páginas
import Register from "./pages/Register";
import Home from "./pages/Home";
import PostsDeProyectos from "./pages/PostsDeProyectos";
import Calendario from "./pages/Calendario";
import Finanzas from "./pages/Finanzas";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/proyectos" element={<PostsDeProyectos />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/finanzas" element={<Finanzas />} />
      </Routes>
    </Router>
  );
};

export default App;