const express = require('express');
const path = require('path');
const fs = require('fs'); // Importamos el módulo File System
const cors = require('cors');

// Crear instancia de Express
const app = express();

app.use(cors());

// Definir puerto
const PORT = 3000;

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando correctamente!');
});

// http://localhost:3000/cart
app.get('/cart', (req, res) => {
    const cartProduct = path.join(__dirname, 'data', 'cart', 'buy.json');  // ingresa a data, luego a cart y por ultimo a buy

    // Usamos fs.readFile para leer el archivo
    fs.readFile(cartProduct, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        // Enviamos el contenido del archivo como respuesta
        res.json(JSON.parse(data));  // Si el contenido es JSON, puedes parsearlo
    });
});

// http://localhost:3000/cats_products
// Obtener todas las categorías
app.get('/cats_products', (req, res) => {
    const folderPath = path.join(__dirname, 'data', 'cats_products'); // Ruta a la carpeta cats_products
    const files = fs.readdirSync(folderPath); // Obtiene una lista de los archivos en la carpeta

    // Leemos todos los archivos JSON y los devolvemos como un arreglo
    const catsProductsData = files.map(file => {
        const filePath = path.join(folderPath, file); // Ruta completa del archivo
        const fileData = fs.readFileSync(filePath, 'utf8'); // Leemos el archivo
        return JSON.parse(fileData); // Convertimos el JSON del archivo en un objeto y lo agregamos al arreglo
    });

    res.json(catsProductsData); // Devolvemos todos los datos leídos de los archivos JSON
});
// Ejemplo: http://localhost:3000/cats_products/101
app.get('/cats_products/:id', (req, res) => {
    const categoryId = req.params.id; // Obtenemos el id de la categoría desde la URL
    const filePath = path.join(__dirname, 'data', 'cats_products', `${categoryId}.json`); // Creamos la ruta al archivo específico

    fs.readFile(filePath, 'utf8', (err, data) => { // Leemos el archivo
        if (err) {
            return res.status(404).send('Categoría no encontrada');
        }
        res.json(JSON.parse(data)); // Enviamos la respuesta con los productos de esa categoría
    });
});

// http://localhost:3000/cats
// Obtener todas las categorías 
app.get('/cats', (req, res) => {
    const catsProducts = path.join(__dirname, 'data', 'cats', 'cat.json'); // Ruta completa del archivo cats.json

    // Usamos fs.readFile para leer el archivo cats.json
    fs.readFile(catsProducts, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        // Parseamos el contenido JSON y lo enviamos como respuesta
        try {
            const catsData = JSON.parse(data);
            res.json(catsData);
        } catch (parseErr) {
            return res.status(500).send('Error al parsear el archivo JSON');
        }
    });
});

// http://localhost:3000/products
// Obtener todos los productos. Esto solo muestra el nombre del archivo.
app.get('/products', (req, res) => {
    const productsDir = path.join(__dirname, 'data', 'products'); // Ruta completa de la carpeta products

    // Usamos fs.readdir para leer todos los archivos dentro de la carpeta
    fs.readdir(productsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer la carpeta');
        }

        // Enviamos la lista de archivos como respuesta
        res.json(files);
    });
});

// http://localhost:3000/products/:id
// Al agregar el id obtenemos la info de ese producto en particular
app.get('/products/:id', (req, res) => {
    const filename = req.params.id; // Retorna el objeto pasado por el parámetro en el id 
    const filePath = path.join(__dirname, 'data', 'products', filename); // Crea la ruta completa al archivo dentro de la carpeta products, que está dentro de la carpeta data.

    fs.readFile(filePath, 'utf8', (err, data) => { // Lee los archivos
        if (err) {
            return res.status(404).send('Archivo no encontrado');
        }
        res.json(JSON.parse(data));
    });
});

// http://localhost:3000/products_comments
// Para obtener todos los archivos de los comentarios uso el mismo código que en products
app.get('/products_comments', (req, res) => {
    const productsComments = path.join(__dirname, 'data', 'products_comments');

    // Usamos fs.readdir para leer todos los archivos dentro de la carpeta
    fs.readdir(productsComments, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer la carpeta');
        }

        // Enviamos la lista de archivos como respuesta
        res.json(files);
    });
});

// http://localhost:3000/products_comments/:id
app.get('/products_comments/:id', (req, res) => {
    const filename = req.params.id; // Retorna el objeto pasado por el parámetro en el id 
    const filePath = path.join(__dirname, 'data', 'products_comments', filename); // Crea la ruta completa al archivo dentro de la carpeta products_comments, que está dentro de la carpeta data.

    fs.readFile(filePath, 'utf8', (err, data) => { // Lee los archivos
        if (err) {
            return res.status(404).send('Archivo no encontrado');
        }
        res.json(JSON.parse(data));
    });
});

// http://localhost:3000/sell
app.get('/sell', (req, res) => {
    const sellProduct = path.join(__dirname, 'data', 'sell', 'publish.json');  // ingresa a data, luego a sell y por ultimo al archivo

    // Usamos fs.readFile para leer el archivo
    fs.readFile(sellProduct, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error al leer el archivo');
        }

        // Enviamos el contenido del archivo como respuesta
        res.json(JSON.parse(data));  // Si el contenido es JSON, puedes parsearlo
    });
});

// http://localhost:3000/user_cart
app.get('/user_cart', (req, res) => {
    const userCart = path.join(__dirname, 'data', 'user_cart');

    // Usamos fs.readdir para leer todos los archivos dentro de la carpeta
    fs.readdir(userCart, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer la carpeta');
        }

        // Enviamos la lista de archivos como respuesta
        res.json(files);
    });
});

// http://localhost:3000/user_cart/:id
app.get('/user_cart/:id', (req, res) => {
    const filename = req.params.id; // Retorna el objeto pasado por el parámetro en el id 
    const filePath = path.join(__dirname, 'data', 'user_cart', filename); // Crea la ruta completa al archivo dentro de la carpeta products_comments, que está dentro de la carpeta data.

    fs.readFile(filePath, 'utf8', (err, data) => { // Lee los archivos
        if (err) {
            return res.status(404).send('Archivo no encontrado');
        }
        res.json(JSON.parse(data));
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
