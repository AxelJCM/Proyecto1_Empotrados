from flask import Flask, request, jsonify
import jwt
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Aplica CORS después de definir `app`

# Clave secreta para firmar los tokens
SECRET_KEY = "supersecretkey"

VALID_USERNAME = "abc"
VALID_PASSWORD = "123"

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    print(f"Received username: {username}, password: {password}")

    if username == VALID_USERNAME and password == VALID_PASSWORD:
        token = jwt.encode({
    'user': username,
    'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
}, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token}), 200
    else:
        return jsonify({"message": "Invalid Credentials"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)