import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-foreground mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Página no encontrada</p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default NotFound;
