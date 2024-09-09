import React, { useState, useEffect } from 'react';
import './App.css';
import { HOSTNAME } from './Constant';

function App() {
  const [lightStatus, setLightStatus] = useState({
    cuarto1: false,
    cuarto2: false,
    sala: false,
    comedor: false,
    cocina: false
  });

  const [doorStatus, setDoorStatus] = useState({
    cuarto1: false,
    delantera: false,
    trasera: false,
    cuarto2: false
  });

  const [motionSensor, setMotionSensor] = useState('Sin Movimiento');
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchStatus(); // Llama a la función para obtener el estado inicial de luces, puertas y sensor
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${HOSTNAME}/status`); // Ajusta la URL al endpoint correcto de tu servidor Flask
      const data = await response.json();
      setLightStatus(data.lights);
      setDoorStatus(data.doors);
      setMotionSensor(data.motion);
    } catch (error) {
      console.error('Error al obtener el estado:', error);
    }
  };

  const toggleLight = async (light) => {
    const updatedLightStatus = { ...lightStatus, [light]: !lightStatus[light] };
    setLightStatus(updatedLightStatus);

    try {
      await fetch(`${HOSTNAME}/lights/${light}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: updatedLightStatus[light] ? 'on' : 'off' })
      });
    } catch (error) {
      console.error('Error al cambiar el estado de la luz:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const response = await fetch(`${HOSTNAME}/take-photo`, { method: 'POST' });
      const data = await response.json();
      setPhoto(data.photoUrl);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  return (
    <div className="house-control">
      <h1>Home Manager</h1>

      <section>
        <h2>Luces</h2>
        <div className="lights-grid">
          {Object.keys(lightStatus).map((room) => (
            <div key={room} className="light-card" onClick={() => toggleLight(room)}>
              <span>{room.charAt(0).toUpperCase() + room.slice(1)}</span>
              <span className="light-icon">{lightStatus[room] ? '💡' : '💤'}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Puertas</h2>
        <div className="doors-grid">
          {Object.keys(doorStatus).map((door) => (
            <div key={door} className="door-card">
              <span>{door.charAt(0).toUpperCase() + door.slice(1)}</span>
              <span className="door-icon">{doorStatus[door] ? '🔒' : '🔓'}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Sensor de Movimiento</h2>
        <div className="motion-sensor">
          <p>{motionSensor}</p>
        </div>
      </section>

      <section>
        <h2>Cámara</h2>
        <button className="camera-button" onClick={takePhoto}>Toma una foto del Patio Trasero</button>
        {photo && <img src={photo} alt="Foto del Patio Trasero" />}
      </section>
    </div>
  );
}

export default App;
