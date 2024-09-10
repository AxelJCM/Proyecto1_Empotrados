import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { HOSTNAME } from './Constant';

const HouseControl = ({ onLogout }) => {
  const [lightStatus, setLightStatus] = useState({
    cuarto1: 'off',
    cuarto2: 'off',
    sala: 'off',
    comedor: 'off',
    cocina: 'off'
  });

  const [doorStatus, setDoorStatus] = useState({
    cuarto1: 'closed',
    delantera: 'closed',
    trasera: 'closed',
    cuarto2: 'closed'
  });

  const [motionSensor, setMotionSensor] = useState('No motion');
  const [photo, setPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('lights');  // Estado para manejar las pestañas

  const token = localStorage.getItem('token');

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${HOSTNAME}/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status); // Imprimir el estado de la respuesta
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data); // Imprimir los datos obtenidos del servidor
        setLightStatus(data.lights);
        setDoorStatus(data.doors);
        setMotionSensor(data.motion);
      } else if (response.status === 401) {
        onLogout();  // Token inválido o expirado
      }
    } catch (error) {
      console.error('Error al obtener el estado:', error);
    }
  }, [token, onLogout]);

  useEffect(() => {
    if (token) {
      fetchStatus();

      const intervalId = setInterval(() => {
        fetchStatus();
      }, 5000);

      return () => clearInterval(intervalId);
    } else {
      onLogout();  // Si no hay token, desloguear al usuario
    }
  }, [fetchStatus, token, onLogout]);

  const toggleLight = async (light) => {
    const newState = lightStatus[light] === 'on' ? 'off' : 'on';
    setLightStatus({ ...lightStatus, [light]: newState });

    try {
      const response = await fetch(`${HOSTNAME}/lights/${light}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ state: newState })
      });

      console.log('Toggle light response status:', response.status); // Imprimir el estado de la respuesta

      if (!response.ok && response.status === 401) {
        onLogout();  // Token inválido o expirado
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la luz:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const response = await fetch(`${HOSTNAME}/take-photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Take photo response status:', response.status); // Imprimir el estado de la respuesta

      if (response.ok) {
        const data = await response.json();
        setPhoto(`data:image/jpeg;base64,${data.photo}`);
      } else if (response.status === 401) {
        onLogout();  // Token inválido o expirado
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="house-control">
      <h2>Home Manager</h2>
      <button onClick={handleLogout}>Cerrar Sesión</button>

      <div className="tabs">
        <button onClick={() => handleTabChange('lights')} className={activeTab === 'lights' ? 'active' : ''}>Luces</button>
        <button onClick={() => handleTabChange('doors')} className={activeTab === 'doors' ? 'active' : ''}>Puertas</button>
        <button onClick={() => handleTabChange('sensor')} className={activeTab === 'sensor' ? 'active' : ''}>Sensor & Cámara</button>
      </div>

      {activeTab === 'lights' && (
        <section className="lights-section">
          <h3>Luces</h3>
          <div className="lights-grid">
            {Object.keys(lightStatus).map((light) => (
              <div key={light} className="light-card">
                <span>{light.charAt(0).toUpperCase() + light.slice(1)}</span>
                <button
                  className={`light-button ${lightStatus[light] === 'on' ? 'on' : 'off'}`}
                  onClick={() => toggleLight(light)}
                >
                  {lightStatus[light] === 'on' ? '💡 Encendida' : '💤 Apagada'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'doors' && (
        <section className="doors-section">
          <h3>Puertas</h3>
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
      )}

      {activeTab === 'sensor' && (
        <section className="sensor-section">
          <h3>Sensor de Movimiento</h3>
          <p>{motionSensor}</p>

          <h3>Cámara</h3>
          <button onClick={takePhoto}>Tomar Foto</button>
          {photo && <img src={photo} alt="Foto de la casa" />}
        </section>
      )}
    </div>
  );
};

export default HouseControl;
