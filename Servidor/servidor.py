from flask import Flask, request, jsonify
import jwt
import datetime
from flask_cors import CORS
import ctypes as ct
import time
from control import *
import json
import threading
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)  # Aplica CORS después de definir `app`

# Clave secreta para firmar los tokens
SECRET_KEY = "supersecretkey"

# Credenciales válidas
VALID_USERNAME = "abc"
VALID_PASSWORD = "123"

#Flag hilo
stop = False

# Estado inicial de las luces, puertas y sensor de movimiento
lights = ['off', 'off', 'off', 'off', 'off']  # 5 luces
doors = ['closed', 'closed', 'closed', 'closed']  # 4 puertas
motion_sensor = 'No motion'  # Sensor de movimiento

# Pin configuration
# Lights
light_0 = b"517"   # GPIO5 #LightRoom1
light_1 = b"518"   # GPIO6 #LightRoom2
light_2 = b"525"   # GPIO13 #LightHall
ligth_3 = b"531"  #GPIO19 #LightLiving
light_4 = b"538"  #GPIO26 #LightKitchen

pinMode(light_0, b"out")
pinMode(light_1, b"out")
pinMode(light_2, b"out")
pinMode(ligth_3, b"out")
pinMode(light_4, b"out")

# Doors
door_1 = b"529"  #GPIO17  #Principal
door_2 = b"539"  #GPIO27  #Hall
door_3 = b"534"  #GPIO22   #Room1
door_4 = b"516"  #GPIO4    #Room2

pinMode(door_1, b"in")
pinMode(door_2, b"in")
pinMode(door_3, b"in")
pinMode(door_4 , b"in")

#Sensor
trigger_pin = b"535"    # GPIO23
echo_pin = b"536"       # GPIO24

pinMode(trigger_pin, b"out")
pinMode(echo_pin, b"in")



#Funcion para convertir  la imagen a Base64 para enviarla por el Jsonify. 
def conversephoto(image_path):
    # Abrir la imagen con Pillow
    with Image.open(image_path) as img:
        # Convertir la imagen a un formato de bytes
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")  # Cambia el formato si es necesario
        # Codificar la imagen en Base64
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return img_str

#Funcion para la lectura constante del sensor 
def sensor_state():
    while(stop):
        distancia = getDistance(trigger_pin, echo_pin)
        
        if (0 < distancia < 15):
            takePicture(b"sensorphoto.jpg")

        time.sleep(1)
        return "Save photo"  




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

# Ruta para obtener el estado de las luces (No se puede obtener el valor de un pin in)
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

    if (new_state == 'on'):
        pinl = 'light_'+ str(light_id)
        digitalWrite(pinl, b"1")
        lights[light_id] = new_state
        return jsonify({"message": f"Luz {light_id + 1} {new_state}"}), 200
    
    elif (new_state == 'off'):
        pinl = 'light_'+ light_id
        digitalWrite(pinl, b"0")
        lights[light_id] = new_state
        return jsonify({"message": f"Luz {light_id + 1} {new_state}"}), 200


# Ruta para obtener el estado de las puertas
@app.route('/doors', methods=['GET'])
def get_doors_status():
    
    for i in len(doors):
        value_read = ct.create_string_buffer(4) # string buffer
        pind = 'door_'+ str(i)
        digitalRead(pind, value_read)
        
        if (value_read.value.decode('utf-8') < 0):
            doors[i] = 'open'
        elif(value_read.value.decode('utf-8') == 0):
            doors[i] = 'closed'
        
        #print("Pin", pin2.decode('utf-8'), "value:", value_read.value.decode('utf-8'))
    
    return jsonify({"doors": doors}), 200

# Ruta para obtener el estado del sensor de movimiento
@app.route('/motion-sensor', methods=['GET'])
def get_motion_sensor_status():

    picture = conversephoto("/sensorphoto.jpg", 110)

    return jsonify({"image": picture}), 200
  

# Ruta para simular tomar una foto
@app.route('/take-photo', methods=['POST'])
def take_photo():
    takePicture(b"camera.jpg")
    picture = conversephoto("/camara.jpg")

    # De momento, devolvemos una URL de ejemplo.
    return jsonify({"photo": picture}), 200



if __name__ == '__main__':

    sensor = threading.Thread(target=sensor_state)

    # Iniciar el hilo
    sensor.start()

   
    #Hacer el thread del sensor ultrasonico
    app.run(host='0.0.0.0', port=8080)

    stop = True
    sensor.join()