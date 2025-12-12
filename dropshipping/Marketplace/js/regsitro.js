document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------
    // 1. Manejo del Formulario de REGISTRO
    // ---------------------------------------------

    // En la página registro.html el formulario tiene id="form-registro"
    const registroForm = document.querySelector('#form-registro');

    if (registroForm) {
        registroForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const nombre = document.getElementById('nombre_completo').value;
            const correo = document.getElementById('correo_registro').value;
            const documento = document.getElementById('documento_registro').value;
            const contrasena = document.getElementById('contrasena_registro').value;
            const repetirContrasena = document.getElementById('repetir_contrasena').value;

            // Simple validación de campos
            if (contrasena !== repetirContrasena) {
                alert('Error: Las contraseñas no coinciden.');
                return;
            }

            // 1.1 Obtener o inicializar la lista de usuarios
            let usuarios = JSON.parse(localStorage.getItem('wozMarketplaceUsers')) || [];

            // 1.2 Verificar si el usuario ya existe (usando el documento o el correo)
            const usuarioExistente = usuarios.some(user => user.documento === documento || user.correo === correo);

            if (usuarioExistente) {
                alert('Error: Ya existe una cuenta registrada con este Documento o Correo.');
                return;
            }

            // 1.3 Crear un nuevo objeto de usuario
            const nuevoUsuario = {
                nombre: nombre,
                correo: correo,
                documento: documento,
                contrasena: contrasena, // NOTA: En un entorno real, la contraseña debe hashearse.
                rol: 'vendedor', // Asume rol vendedor por defecto
                // Aquí podrías agregar WhatsApp, País, Ciudad, etc.
            };

            // 1.4 Guardar el nuevo usuario y actualizar localStorage
            usuarios.push(nuevoUsuario);
            localStorage.setItem('wozMarketplaceUsers', JSON.stringify(usuarios));

            // 1.5 Guardar sesión actual y redirigir al index
            localStorage.setItem('usuarioActual', JSON.stringify({
                documento: nuevoUsuario.documento,
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol
            }));

            alert('¡Registro exitoso! Redirigiendo al inicio...');
            this.reset();
            window.location.href = 'index.html';
        });
    }

    // ---------------------------------------------
    // 2. Manejo del Formulario de INICIO DE SESIÓN
    // ---------------------------------------------

    // Soporta login en página dedicada (login.html) o en la antigua sección
    const loginForm = document.querySelector('#login-form') || document.querySelector('#inicio-sesion form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const documento = document.getElementById('documento_login').value;
            const contrasena = document.getElementById('contrasena_login').value;
            const recuerdame = document.querySelector('input[name="recuerdame"]').checked;

            // 2.1 Obtener la lista de usuarios
            const usuarios = JSON.parse(localStorage.getItem('wozMarketplaceUsers')) || [];

            // 2.2 Buscar el usuario por número de documento
            const usuarioEncontrado = usuarios.find(user => user.documento === documento);

            if (!usuarioEncontrado) {
                alert('Error de inicio de sesión: Número de documento no encontrado.');
                return;
            }

            // 2.3 Verificar la contraseña
            if (usuarioEncontrado.contrasena !== contrasena) {
                alert('Error de inicio de sesión: Contraseña incorrecta.');
                return;
            }

            // 2.4 Almacenar el estado de la sesión (usuario logueado)
            // Usamos sessionStorage para que la sesión se borre al cerrar la pestaña/navegador.
            sessionStorage.setItem('usuarioLogueado', JSON.stringify({
                documento: usuarioEncontrado.documento,
                nombre: usuarioEncontrado.nombre,
                rol: usuarioEncontrado.rol
            }));
            // También guardamos en localStorage para que index/producto lo detecten
            localStorage.setItem('usuarioActual', JSON.stringify({
                documento: usuarioEncontrado.documento,
                nombre: usuarioEncontrado.nombre,
                rol: usuarioEncontrado.rol
            }));
            
            // 2.5 Si la casilla "Recuérdame" está marcada, guardamos un token simple
            // (En un entorno real, sería un token de expiración)
            if (recuerdame) {
                localStorage.setItem('recuerdameWoz', 'true');
            } else {
                localStorage.removeItem('recuerdameWoz');
            }


            // 2.6 Redirección al index.html
            alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}! Iniciando sesión...`);
            window.location.href = 'index.html';
        });
    }
});