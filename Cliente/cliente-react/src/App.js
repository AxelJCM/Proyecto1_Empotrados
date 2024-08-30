import React, { useState } from 'react';
import Login from './Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <h1>Bienvenido a la Casa Inteligente</h1>
          {/* Aquí se puede cargar la interfaz principal */}
        </div>
      )}
    </div>
  );
}

export default App;
