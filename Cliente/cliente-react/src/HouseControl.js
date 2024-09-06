import React, { useState, useEffect } from 'react';
import './HouseControl.css';  // Importar el archivo CSS

const HouseControl = ({ isAuthenticated }) => {
  const [lightStatus, setLightStatus] = useState(Array(5).fill('off')); // Estado de 5 luces
  const [doorStatus, setDoorStatus] = useState(Array(4).fill('closed')); // Estado de 4 puertas
  const [motionSensor, setMotionSensor] = useState('No motion'); // Estado del sensor de movimiento
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Llamadas iniciales para obtener el estado
      fetchLightsStatus();
      fetchDoorsStatus();
      fetchMotionSensorStatus();

      // Configurar intervalos para actualización automática cada 5 segundos (5000 ms)
      const intervalId = setInterval(() => {
        fetchLightsStatus();
        fetchDoorsStatus();
        fetchMotionSensorStatus();
      }, 5000); // Cambia este valor si prefieres otra frecuencia de actualización

      // Limpiar el intervalo cuando el componente se desmonte
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const fetchLightsStatus = async () => {
    // Obtener el estado de las luces desde el servidor
    const response = await fetch('http://localhost:8080/lights');
    const data = await response.json();
    setLightStatus(data.lights);
  };

  const fetchDoorsStatus = async () => {
    // Obtener el estado de las puertas desde el servidor
    const response = await fetch('http://localhost:8080/doors');
    const data = await response.json();
    setDoorStatus(data.doors);
  };

  const fetchMotionSensorStatus = async () => {
    // Obtener el estado del sensor de movimiento
    const response = await fetch('http://localhost:8080/motion-sensor');
    const data = await response.json();
    setMotionSensor(data.status);
  };

  const toggleLight = async (index) => {
    const newStatus = lightStatus[index] === 'on' ? 'off' : 'on';
    setLightStatus([...lightStatus.slice(0, index), newStatus, ...lightStatus.slice(index + 1)]);

    await fetch(`http://localhost:8080/lights/${index}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: newStatus }),
    });
  };

  const takePhoto = async () => {
    const response = await fetch('http://localhost:8080/take-photo', {
      method: 'POST',
    });
    const data = await response.json();
    setPhoto(data.photoUrl);
  };

  if (!isAuthenticated) {
    return <p>Por favor, inicia sesión para controlar la casa.</p>;
  }

  return (
    <div className="house-control">
      <h2>Control de la Casa Inteligente</h2>

      {/* Control de luces */}
      <section className="lights-section">
        <h3>Luces</h3>
        <div className="lights">
          {lightStatus.map((light, index) => (
            <div key={index} className="light">
              <span>{`Luz ${index + 1}: ${light}`}</span>
              <button onClick={() => toggleLight(index)}>
                {light === 'on' ? 'Apagar' : 'Encender'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Control de puertas */}
      <section className="doors-section">
        <h3>Puertas</h3>
        <div className="doors">
          {doorStatus.map((door, index) => (
            <div key={index} className="door">
              <span>{`Puerta ${index + 1}: ${door}`}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sensor de movimiento */}
      <section className="motion-section">
        <h3>Sensor de Movimiento</h3>
        <p>{motionSensor}</p>
      </section>

      {/* Control de la cámara */}
      <section className="camera-section">
        <h3>Cámara</h3>
        <button onClick={takePhoto}>Tomar Foto</button>
        {photo && <img src={photo} alt="Foto de la casa" />}
      </section>
    </div>
  );
};

export default HouseControl;
