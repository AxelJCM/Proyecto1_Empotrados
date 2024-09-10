import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { HOSTNAME } from './Constant';
import Tabs from './Tabs';  // Importa el componente de pestañas
import Login from './Login'; // Importa el componente de inicio de sesión mejorado

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lightStatus, setLightStatus] = useState({});
  const [doorStatus, setDoorStatus] = useState({});
  const [motionSensor, setMotionSensor] = useState('No motion');
  const [photo, setPhoto] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchStatus();
    }
  }, [token]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${HOSTNAME}/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLightStatus(data.lights);
      setDoorStatus(data.doors);
      setMotionSensor(data.motion);
    } catch (error) {
      console.error('Error al obtener el estado:', error);
    }
  }, [token]);

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${HOSTNAME}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
      } else {
        alert('Error en el login');
      }
    } catch (error) {
      console.error('Error en el login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsAuthenticated(false);
  };

  const handleTakePhoto = async () => {
    try {
      const response = await fetch(`${HOSTNAME}/take-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPhoto(`data:image/jpeg;base64,${data.photo}`);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  const toggleLight = async (room) => {
    const newState = lightStatus[room] === 'on' ? 'off' : 'on';
    setLightStatus({ ...lightStatus, [room]: newState });

    try {
      const response = await fetch(`${HOSTNAME}/lights/${room}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ state: newState })
      });
      if (!response.ok && response.status === 401) {
        handleLogout(); // Manejar el logout en caso de token inválido
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la luz:', error);
    }
  };

  if (!isAuthenticated) {
    return <Login handleLogin={handleLogin} />;
  }

  const lightsTab = (
    <section>
      <h2>Luces</h2>
      <div className="lights-grid">
        {Object.keys(lightStatus).map((room) => (
          <div key={room} className="light-card">
            <span>{room.charAt(0).toUpperCase() + room.slice(1)}</span>
            <button
              className={`light-button ${lightStatus[room] === 'on' ? 'on' : 'off'}`}
              onClick={() => toggleLight(room)}
            >
              {lightStatus[room] === 'on' ? '💡 Encendida' : '💤 Apagada'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const doorsTab = (
    <section>
      <h2>Puertas</h2>
      <div className="doors-grid">
        {Object.keys(doorStatus).map((door) => (
          <div key={door} className="door-card">
            <span>{door.charAt(0).toUpperCase() + door.slice(1)}</span>
            <span className="door-icon">
              {doorStatus[door] === 'closed' ? '🔒 Cerrada' : '🔓 Abierta'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  const motionTab = (
    <section>
      <h2>Sensor de Movimiento</h2>
      <p>{motionSensor}</p>
    </section>
  );

  const cameraTab = (
    <section>
      <h2>Cámara</h2>
      <button onClick={handleTakePhoto}>Tomar Foto</button>
      {photo && <img src={photo} alt="Foto de la casa" />}
    </section>
  );

  return (
    <div className="house-control">
      <h1>Home Manager</h1>
      <button onClick={handleLogout}>Cerrar sesión</button>
      <Tabs
        tabs={{
          'luces': lightsTab,
          'puertas': doorsTab,
          'sensor': motionTab,
          'cámara': cameraTab
        }}
      />
    </div>
  );
}

export default App;
