// Manejo del formulario de inicio de sesión
document.getElementById("login-form")?.addEventListener("submit", function(event) {
    event.preventDefault(); // Evita el envío del formulario por defecto
    
    // Toma los valores del formulario
    const email = document.getElementById('form2Example11').value;
    const password = document.getElementById('form2Example22').value; 
    
    // Envia los datos de login al servidor
    fetch('http://localhost:3000/user', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Usuario creado exitosamente.") {

            localStorage.setItem('authenticated', 'true');
            localStorage.setItem('currentUser', email);
            
            // Redirigir a la portada
            window.location.href = "index.html";
        } else {
            alert('Error al crear usuario: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
    });
});

// Carga el nombre del usuario cuando el documento esté listo
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOMContentLoaded ejecutado');
    // Recupera el nombre del usuario desde localStorage
    const currentUser = localStorage.getItem('currentUser');
    

    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        if (currentUser) {
            usernameElement.textContent = currentUser; // Muestra el email
        } else {
            usernameElement.textContent = 'Invitado'; // Muestra "Invitado" si no hay usuario
        }
    } else {
        console.error('Elemento con id "username" no encontrado.');
    }
});
