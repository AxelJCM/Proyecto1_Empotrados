import React, { useState, useEffect } from 'react';
import './HouseControl.css';  // Archivo CSS para estilos

const HouseControl = ({ isAuthenticated }) => {
  const [lightStatus, setLightStatus] = useState(Array(5).fill('off')); // Estado de 5 luces
  const [doorStatus, setDoorStatus] = useState(Array(4).fill('closed')); // Estado de 4 puertas
  const [motionSensor, setMotionSensor] = useState('No motion'); // Estado del sensor de movimiento
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLightsStatus();
      fetchDoorsStatus();
      fetchMotionSensorStatus();

      const intervalId = setInterval(() => {
        fetchLightsStatus();
        fetchDoorsStatus();
        fetchMotionSensorStatus();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated]);

  const fetchLightsStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/lights');
      const data = await response.json();
      setLightStatus(data.lights);
    } catch (error) {
      console.error('Error al obtener el estado de las luces:', error);
    }
  };

  const fetchDoorsStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/doors');
      const data = await response.json();
      setDoorStatus(data.doors);
    } catch (error) {
      console.error('Error al obtener el estado de las puertas:', error);
    }
  };

   
   // Función para restaurar la imagen     
  function restoreImage(base64String) {
      // Crear un objeto URL para la cadena Base64
    const imgSrc = `data:image/jpeg;base64,${base64String}`;

      // Seleccionar el elemento <img> y asignarle el src con la imagen restaurada
    const imgElement = document.getElementById('restoredImage');
    imgElement.src = imgSrc;
  }

  const fetchMotionSensorStatus = async () => {
    try {
      const response = await fetch('http://localhost:8080/motion-sensor');
      const data = await response.json();
      setMotionSensor(data.image);
    } catch (error) {
      console.error('Error al obtener la imagen del sensor de movimiento:', error);
    }
  };

  const toggleLight = async (index) => {
    const newStatus = lightStatus[index] === 'on' ? 'off' : 'on';
    setLightStatus([...lightStatus.slice(0, index), newStatus, ...lightStatus.slice(index + 1)]);

    try {
      await fetch(`http://localhost:8080/lights/${index}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newStatus }),
      });
    } catch (error) {
      console.error('Error al cambiar el estado de la luz:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const response = await fetch('http://localhost:8080/take-photo', { method: 'POST' });
      const data = await response.json();
      photo = restoreImage(data.photo)
      setPhoto(photo);
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  };

  if (!isAuthenticated) {
    return <p>Por favor, inicia sesión para controlar la casa.</p>;
  }

  return (
    <div className="house-control">
      <h2>Home Manager</h2>

      {/* Control de luces */}
      <section className="lights-section">
        <h3>Luces</h3>
        <div className="lights">
          {lightStatus.map((light, index) => (
            <div key={index} className="light">
              <span>{`Cuarto ${index + 1}`}</span>
              <button
                className={`light-button ${light === 'on' ? 'on' : 'off'}`}
                onClick={() => toggleLight(index)}
              >
                {light === 'on' ? '💡 Encendida' : '💤 Apagada'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Visualización de puertas */}
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

      {/* Cámara */}
      <section className="camera-section">
        <h3>Cámara</h3>
        <button onClick={takePhoto}>Tomar Foto</button>
        {photo && <img src={photo} alt="Foto de la casa" />}
      </section>
    </div>
  );
};

export default HouseControl;

