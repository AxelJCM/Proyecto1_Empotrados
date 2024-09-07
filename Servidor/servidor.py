from flask import Flask, request, jsonify
import json
import jwt
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Aplica CORS después de definir `app`

# Clave secreta para firmar los tokens
SECRET_KEY = "supersecretkey"

# Credenciales válidas
VALID_USERNAME = "abc"
VALID_PASSWORD = "123"

# Estado inicial de las luces, puertas y sensor de movimiento
lights = ['off', 'off', 'off', 'off', 'off']  # 5 luces
doors = ['closed', 'closed', 'closed', 'closed']  # 4 puertas
motion_sensor = 'No motion'  # Sensor de movimiento

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username == VALID_USERNAME and password == VALID_PASSWORD:
        token = jwt.encode({
            'user': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token}), 200
    else:
        return jsonify({"message": "Invalid Credentials"}), 401

# Ruta para obtener el estado de las luces
@app.route('/lights', methods=['GET'])
def get_lights_status():
    return jsonify({"lights": lights}), 200

# Ruta para cambiar el estado de una luz
@app.route('/lights/<int:light_id>', methods=['POST'])
def change_light_status(light_id):
    if light_id < 0 or light_id >= len(lights):
        return jsonify({"message": "Invalid light ID"}), 400

    data = request.json
    new_state = data.get('state')

    if new_state not in ['on', 'off']:
        return jsonify({"message": "Invalid state"}), 400

    lights[light_id] = new_state
    return jsonify({"message": f"Luz {light_id + 1} {new_state}"}), 200

# Ruta para obtener el estado de las puertas
@app.route('/doors', methods=['GET'])
def get_doors_status():
    return jsonify({"doors": doors}), 200

# Ruta para obtener el estado del sensor de movimiento
@app.route('/motion-sensor', methods=['GET'])
def get_motion_sensor_status():
    return jsonify({"status": motion_sensor}), 200

# Ruta para simular tomar una foto
@app.route('/take-photo', methods=['POST'])
def take_photo():
    # Aquí puedes integrar código para tomar una foto real si es necesario.
    # De momento, devolvemos una URL de ejemplo.
    return jsonify({"photoUrl": "http://localhost:8080/static/photo.jpg"}), 200

if __name__ == '__main__':

    # todo: crear hilo para el sensor ultrasonico
    
    app.run(host='192.168.0.100', port=6000)
