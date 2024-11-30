const express = require('express');
const path = require('path');
const fs = require('fs'); // Módulo para manejo de archivos
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2'); // me conecto a la base de datos
require('dotenv').config(); // Carga variables de entorno desde un archivo .env

const SECRET_KEY = process.env.SECRET_KEY || "CLAVE_ULTRA_SECRETA"; // Usa la variable de entorno
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json()); // Middleware para parsear JSON

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: '1234', 
    database: 'users' 
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});

// Ejemplo de consulta a la base de datos
db.query('SELECT * FROM user', (err, results) => {
    if (err) {
        console.error('Error al realizar la consulta:', err);
        return;
    }
    console.log('Resultados de la consulta:', results);
});

// Lista todas las tareas 
app.get('/user', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Para obtener por ID
app.get('/user/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
        res.json(results[0]);
    });
});

//Para hacer un "registro" en el login. Devuelve un token y los datos. 
//Guardará en la tabla user los valores del body
app.post('/user', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'El email y la contraseña son obligatorios.' });
    }

    const query = 'INSERT INTO user (email, password) VALUES (?, ?)';
    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.error('Error al insertar el usuario:', err);
            return res.status(500).json({ message: 'Error al insertar el usuario.' });
        }

        // Genera un token JWT para el nuevo usuario
        const userId = result.insertId;
        const token = jwt.sign({ id: userId, email }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({
            message: 'Usuario creado exitosamente.',
            user: {
                id: userId,
                email,
            },
            token, 
        });
    });
});

// Para poder actualizar lo que esté en la tabla

app.put('/user/:id', (req, res) => {
    const { id } = req.params;
    const { email, password} = req.body;
    const query = 'UPDATE user SET email = ?, password = ? WHERE id = ?';
    db.query(query, [email, password, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ id, email, password});
    });
});

// Esto es para eliminar lo que esté en la tabla

app.delete('/user/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM user WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado correctamente' });
    });
});
app.post('/login', (req, res) => {
    const { email, password } = req.body; // recibe email y password
    
    // Verifica si el email y la contraseña están presentes
    if (!email || !password) {
        return res.status(400).json({ message: 'El email y la contraseña son necesarios.' });
    }

    // Si no hay token en la cabecera, valida el email y password en la base de datos
    const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error al consultar la base de datos:', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
        }

        // Si las credenciales son correctas, genera un nuevo token
        const user = results[0];
        const newToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

        // Responde con el nuevo token y la información del usuario
        return res.status(200).json({
            message: 'Login exitoso, token generado.',
            user: { id: user.id, email: user.email },
            token: newToken, // El nuevo token generado
        });
    });
});


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


// Ruta para obtener todos los carritos desde la base de datos
//http://localhost:3000/cart
app.get('/cart', authorize, (req, res) => {
    db.query('SELECT * FROM cart', (err, results) => {
        if (err) {
            console.error('Error al realizar la consulta:', err);
            return res.status(500).json({ message: 'Error en la consulta' });
        }
        res.json(results);
    });
});

// Ruta para agregar un nuevo carrito a la base de datos
app.post('/cart', authorize, (req, res) => {
    const { user_id, items } = req.body; // Asegúrate de enviar el formato adecuado en la solicitud

    const query = 'INSERT INTO cart (user_id, items) VALUES (?, ?)';
    db.query(query, [user_id, JSON.stringify(items)], (err, result) => {
        if (err) {
            console.error('Error al insertar el carrito:', err);
            return res.status(500).json({ message: 'Error al insertar el carrito' });
        }
        res.status(201).json({ message: 'Carrito creado correctamente', id: result.insertId });
    });
});

// Ruta para obtener el carrito de un usuario específico
app.get('/user_cart', authorize, (req, res) => {
    const userCart = path.join(__dirname, 'data', 'user_cart');
    fs.readdir(userCart, (err, files) => {
        if (err) return res.status(500).send('Error al leer la carpeta');

        // Leer el contenido de cada archivo
        const carts = files.map((file) => {
            const filePath = path.join(userCart, file);
            const content = fs.readFileSync(filePath, 'utf8'); // Lee el archivo
            return { filename: file, content: JSON.parse(content) }; // Devuelve el nombre del archivo y su contenido
        });

        res.json(carts);
    });
});


// Ruta para obtener un carrito específico de un usuario
app.get('/user_cart/:id', authorize, (req, res) => {
    const filePath = path.join(__dirname, 'data', 'user_cart', req.params.id);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).send('Archivo no encontrado');
        res.json(JSON.parse(data));
    });
});

// Ruta para obtener productos (datos de productos en un archivo JSON)
app.get('/products', (req, res) => {
    const productsDir = path.join(__dirname, 'data', 'products');
    
    // Leer los nombres de los archivos
    fs.readdir(productsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer la carpeta');
        }

        // Leer el contenido de cada archivo
        const products = files.map(file => {
            const filePath = path.join(productsDir, file);

            // Leer el contenido del archivo
            try {
                const data = fs.readFileSync(filePath, 'utf8');
                return { fileName: file, content: JSON.parse(data) }; // Devuelve nombre y contenido
            } catch (readErr) {
                console.error(`Error al leer el archivo ${file}:`, readErr);
                return { fileName: file, error: 'No se pudo leer el archivo' };
            }
        });

        res.json(products); // Devolver el array con nombre y contenido
    });
});


// Ruta para obtener un producto específico
app.get('/products/:id', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'products', req.params.id);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(404).send('Archivo no encontrado');
        res.json(JSON.parse(data));
    });
});

// Ruta para obtener los productos a la venta (desde un archivo JSON)
app.get('/sell', authorize, (req, res) => {
    const sellProduct = path.join(__dirname, 'data', 'sell', 'publish.json');
    fs.readFile(sellProduct, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.json(JSON.parse(data));
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
