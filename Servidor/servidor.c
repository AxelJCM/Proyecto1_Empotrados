#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 8080

int authenticate_user(const char* username, const char* password) {
    // Credenciales hardcodeadas; en un entorno real, usa una base de datos o almacenamiento seguro
    const char* valid_username = "admin";
    const char* valid_password = "password";
    return strcmp(username, valid_username) == 0 && strcmp(password, valid_password) == 0;
}

void handle_login_request(int client_socket) {
    char buffer[1024];
    read(client_socket, buffer, 1024);

    // Extraer username y password de la solicitud; asume que vienen en formato JSON
    char username[100], password[100];
    sscanf(buffer, "{\"username\":\"%[^\"]\",\"password\":\"%[^\"]\"}", username, password);

    if (authenticate_user(username, password)) {
        // Responder con éxito
        const char* success_response = "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nLogin Successful";
        send(client_socket, success_response, strlen(success_response), 0);
    } else {
        // Responder con error
        const char* failure_response = "HTTP/1.1 401 Unauthorized\nContent-Type: text/plain\n\nInvalid Credentials";
        send(client_socket, failure_response, strlen(failure_response), 0);
    }
}

int main() {
    int server_fd, client_socket;
    struct sockaddr_in address;
    int addrlen = sizeof(address);

    // Crear el socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // Configurar la dirección y el puerto
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    // Vincular el socket al puerto
    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Escuchar conexiones
    if (listen(server_fd, 3) < 0) {
        perror("listen");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    printf("Servidor en espera de conexiones en el puerto %d...\n", PORT);

    // Aceptar conexiones entrantes
    while ((client_socket = accept(server_fd, (struct sockaddr*)&address, (socklen_t*)&addrlen)) >= 0) {
        handle_login_request(client_socket);
        close(client_socket);
    }

    // Cerrar el socket del servidor
    close(server_fd);
    return 0;
}
