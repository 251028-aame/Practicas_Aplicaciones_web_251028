-- COMANDOS PARA CREAR LA BASE DE DATOS PARA MECAGEST Y SU INTERACCIÓN CON PHP
-- 1. Crear Base de Datos
CREATE database db_mecagest;

-- 2. Usar/activar la Base de Datos
USE db_mecagest;

-- 3. Crear la tabla de usuarios
CREATE TABLE usuarios (
	id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR (100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		ON UPDATE CURRENT_TIMESTAMP,
	status TINYINT DEFAULT 1
);

-- 4. Visualizar la estructura de la tabla
DESCRIBE usuarios;

-- 5. Seleccionar los registros de la tabla
SELECT * FROM usuarios;

-- 6. Ejemplo de inserción de un nuevo usuario
INSERT INTO usuarios VALUES(DEFAULT, "Alma Ariadne Maldonado Eslava", "itsariadnees@gmail.com", md5("qwerty123"), now(), null, 1);

-- 7. Inserción multiple de otros dos usuarios
INSERT INTO usuarios (nombre, email, password) values 
("Juan Pérez", "j.perez@gmail.com", md5("12345")),
("Patricia Reyes", "patty.reyes48@outlook.com", md5("67890"));

