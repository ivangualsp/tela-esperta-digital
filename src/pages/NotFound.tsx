
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if the path is /view/ instead of /viewer/
  const isViewRouteError = location.pathname.includes('/view/');
  const correctedPath = isViewRouteError ? 
    location.pathname.replace('/view/', '/viewer/') : 
    null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        
        {isViewRouteError && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-amber-800 mb-2">
              Parece que você está tentando acessar um dispositivo com o caminho incorreto.
            </p>
            <p className="text-sm text-amber-700 mb-4">
              O caminho correto para visualizar dispositivos é <strong>/viewer/</strong> e não /view/
            </p>
            <Button asChild variant="outline" className="mb-4">
              <Link to={correctedPath || "/"}>
                Ir para o caminho correto
              </Link>
            </Button>
          </div>
        )}
        
        <Button asChild>
          <Link to="/">Retornar ao início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
