CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    edad INT
);

INSERT INTO usuarios (nombre, email, edad) VALUES
    ('Ana Lopez', 'ana@example.com', 23),
    ('Bruno Perez', 'bruno@example.com', 30);
