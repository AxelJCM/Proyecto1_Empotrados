import React, { useState } from 'react';
import Login from './Login';
import HouseControl from './HouseControl'; // Importa el componente de control de la casa

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true); // Actualiza la autenticación
  };

  return (
    <div className="App">
      <h1>Casa Inteligente</h1>

      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />  // El login aparece solo cuando no está autenticado
      ) : (
        <p>Autenticación exitosa. Controla tu casa abajo:</p>
      )}

      {/* Cargar el resto de la interfaz siempre, pero con condicionales según autenticación */}
      <HouseControl isAuthenticated={isAuthenticated} />  {/* Mostrar el control de la casa */}
    </div>
  );
}

export default App;
