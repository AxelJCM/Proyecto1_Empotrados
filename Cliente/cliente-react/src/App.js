import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { HOSTNAME } from './Constant';
import Tabs from './Tabs';  // Importa el componente de pestañas
import Login from './Login'; // Asegúrate de que el archivo se llame Login.js

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lightStatus, setLightStatus] = useState({});
  const [doorStatus, setDoorStatus] = useState({});
  const [motionSensor, setMotionSensor] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [sensorPhoto, setSensorPhoto] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${HOSTNAME}/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLightStatus(data.lights || {});  // Asegurarse de que siempre es un objeto
      setDoorStatus(data.doors || {});    // Asegurarse de que siempre es un objeto
      setMotionSensor(data.motion || 'No motion');
    } catch (error) {
      console.error('Error al obtener el estado:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchStatus(); // Llama a fetchStatus cuando cambie el token
    }
  }, [token, fetchStatus]); // Añade fetchStatus como dependencia

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

  const handleGetLastPhoto = async () => {
    try {
      const response = await fetch(`${HOSTNAME}/motion-sensor`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSensorPhoto(`data:image/jpeg;base64,${data.photo}`);
      }
    } catch (error) {
      console.error('Error al obtener la última foto del sensor:', error);
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
    <section className="tab-content">
      <h2>Luces</h2>
      <div className="lights-grid">
        {Object.keys(lightStatus || {}).map((room) => (
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
    <section className="tab-content">
      <h2>Puertas</h2>
      <div className="doors-grid">
        {Object.keys(doorStatus || {}).map((door) => (
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

  const sensorAndCameraTab = (
    <section className="tab-content">
      <h2>Sensor y Cámara</h2>
      <div className="sensor-camera">
        <div className="sensor-section">
          <h3>Sensor de Movimiento</h3>
          <p>{motionSensor}</p>
          <button onClick={handleGetLastPhoto} className="sensor-button">Obtener Última Foto del Sensor</button>
          {sensorPhoto && <img src={sensorPhoto} alt="Última foto del sensor" />}
        </div>
        <div className="camera-section">
          <h3>Cámara</h3>
          <button onClick={handleTakePhoto} className="camera-button">Tomar Foto</button>
          {photo && <img src={photo} alt="Foto de la cámara" />}
        </div>
      </div>
    </section>
  );

  return (
    <div className="house-control">
      <h1>Home Manager</h1>
      <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
      <Tabs
        tabs={{
          'luces': lightsTab,
          'puertas': doorsTab,
          'sensor y cámara': sensorAndCameraTab
        }}
      />
    </div>
  );
}

export default App;
