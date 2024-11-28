const express = require('express');
const path = require('path');
const fs = require('fs'); // Módulo para manejo de archivos
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Carga variables de entorno desde un archivo .env

const SECRET_KEY = process.env.SECRET_KEY || "CLAVE_ULTRA_SECRETA"; // Usa la variable de entorno
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Middleware de autorización
const authorize = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }

    const token = authHeader.split(' ')[1]; // Formato "Bearer <token>"
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }
        req.user = user; // Datos decodificados del token
        next();
    });
};

// Rutas sin protección
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "admin" && password === "admin") {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: "Usuario y/o contraseña incorrectos" });
    }
});

// Rutas protegidas
app.get('/cart', authorize, (req, res) => {
    const cartProduct = path.join(__dirname, 'data', 'cart', 'buy.json');
    fs.readFile(cartProduct, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.json(JSON.parse(data));
    });
});

app.get('/user_cart', authorize, (req, res) => {
    const userCart = path.join(__dirname, 'data', 'user_cart');
    fs.readdir(userCart, (err, files) => {
        if (err) return res.status(500).send('Error al leer la carpeta');
        res.json(files);
    });
});

app.get('/user_cart/:id', authorize, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'user_cart', req.params.id);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).send('Archivo no encontrado');
        res.json(JSON.parse(data));
    });
});

app.get('/sell', authorize, (req, res) => {
    const sellProduct = path.join(__dirname, 'data', 'sell', 'publish.json');
    fs.readFile(sellProduct, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.json(JSON.parse(data));
    });
});

// Rutas públicas o con datos menos sensibles
app.get('/products', (req, res) => {
    const productsDir = path.join(__dirname, 'data', 'products');
    fs.readdir(productsDir, (err, files) => {
        if (err) return res.status(500).send('Error al leer la carpeta');
        res.json(files);
    });
});

app.get('/products/:id', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products', req.params.id);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).send('Archivo no encontrado');
        res.json(JSON.parse(data));
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
