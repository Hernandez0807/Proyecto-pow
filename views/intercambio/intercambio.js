import { mapaPokemon } from '../../shared/js/pokemonMap.js';

window.addEventListener('DOMContentLoaded', () => {
    const ably = new Ably.Realtime({
        key: '6BAGVg.hwO_cg:z1W9BBEM2eqvxooxuk2P64wLnwF8BDDHkHpvaCyNaWc',
        clientId: localStorage.getItem('nombreJugador') || `Jugador_${Math.floor(Math.random() * 1000)}`
    });
    const channel = ably.channels.get('intercambio-pokemon');

    // Conexión de jugadores usando Ably Presence
    let miNombre = localStorage.getItem('nombreJugador') || `Jugador_${Math.floor(Math.random()*1000)}`;
    localStorage.setItem('nombreJugador', miNombre);
    const nombreOponenteElem = document.getElementById('nombreOponente');
    const estadoConexionElem = document.getElementById('estadoConexion');
    const puntoConexionElem = document.getElementById('puntoConexion');

    // Función para conectar y mostrar jugadores
    window.conectarIntercambio = function() {
        channel.presence.enter({ nombre: miNombre });
        actualizarEstadoConexion(true);
        document.getElementById('interfazIntercambio').style.display = '';
    };

    // Actualizar la interfaz visual al conectar
    function actualizarEstadoConexion(conectado) {
        if (conectado) {
            estadoConexionElem.textContent = 'Conectado';
            puntoConexionElem.style.background = 'limegreen';
        } else {
            estadoConexionElem.textContent = 'Desconectado';
            puntoConexionElem.style.background = '#e74c3c';
        }
    }

    channel.presence.subscribe('enter', (member) => {
        if (member.clientId !== ably.auth.clientId && member.data && member.data.nombre !== miNombre) {
            nombreOponenteElem.textContent = member.data.nombre;
        }
        actualizarEstadoConexion(true);
    });

    channel.presence.subscribe('leave', (member) => {
        if (member.data && member.data.nombre !== miNombre) {
            nombreOponenteElem.textContent = 'Esperando...';
        }
        if (channel.presence.getSync().length <= 1) {
            actualizarEstadoConexion(false);
        }
    });

    // Mostrar los datos almacenados en localStorage en pantalla
    function mostrarDatosLocalStorage() {
        const datosDiv = document.getElementById('datosLocalStorage');
        if (!datosDiv) return;
        let html = '<h4>Datos en localStorage:</h4><ul>';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            html += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        html += '</ul>';
        datosDiv.innerHTML = html;
    }

    // Mostrar las cartas disponibles del localStorage en el contenedor de cartas
    function mostrarCartasDisponibles() {
        const contenedor = document.getElementById('coleccionContainer');
        if (!contenedor) return;
        contenedor.innerHTML = '';
        const coleccionRaw = localStorage.getItem('coleccionPokemon');
        let coleccion = [];
        try {
            coleccion = coleccionRaw ? JSON.parse(coleccionRaw) : [];
        } catch {
            coleccion = [];
        }
        if (coleccion.length === 0) {
            contenedor.innerHTML = '<p>No tienes cartas en tu colección.</p>';
            return;
        }
        coleccion.forEach(id => {
            const nombre = mapaPokemon[id] || `Pokemon #${id}`;
            const cartaDiv = document.createElement('div');
            cartaDiv.className = 'carta-intercambio';
            const spanId = document.createElement('span');
            spanId.className = 'pokemon-id';
            spanId.textContent = `#${id}`;
            const spanNombre = document.createElement('span');
            spanNombre.className = 'pokemon-nombre';
            spanNombre.textContent = nombre;
            cartaDiv.appendChild(spanId);
            cartaDiv.appendChild(spanNombre);
            contenedor.appendChild(cartaDiv);
        });
    }

    let confirmacionLocal = false;
    let confirmacionOponente = false;

    // Permitir seleccionar cartas y enviar selección al oponente solo al confirmar
    function habilitarSeleccionCartas() {
        const contenedor = document.getElementById('coleccionContainer');
        if (!contenedor) return;
        contenedor.querySelectorAll('.carta-intercambio').forEach(cartaDiv => {
            cartaDiv.addEventListener('click', function() {
                cartaDiv.classList.toggle('selected');
            });
        });
        // Agregar botón de confirmación
        let btnConfirmar = document.getElementById('btnConfirmarSeleccion');
        if (!btnConfirmar) {
            btnConfirmar = document.createElement('button');
            btnConfirmar.id = 'btnConfirmarSeleccion';
            btnConfirmar.className = 'boton-intercambiar';
            btnConfirmar.textContent = 'Confirmar selección';
            contenedor.parentElement.appendChild(btnConfirmar);
        }
        btnConfirmar.onclick = function() {
            confirmacionLocal = true;
            enviarCartasSeleccionadas();
            btnConfirmar.disabled = true;
            actualizarBotonIntercambiar();
        };
    }

    function enviarCartasSeleccionadas() {
        const seleccionadas = Array.from(document.querySelectorAll('.carta-intercambio.selected'))
            .map(div => Number(div.querySelector('.pokemon-id').textContent.replace('#', '')));
        channel.publish('cartas-seleccionadas', { cartas: seleccionadas, remitente: miNombre, confirmado: true });
    }

    // Mostrar cartas seleccionadas por el oponente
    function mostrarCartasOponente(cartas, confirmado) {
        const contenedorOponente = document.getElementById('cartasOponente');
        if (!contenedorOponente) return;
        contenedorOponente.innerHTML = '';
        if (!cartas || cartas.length === 0) {
            contenedorOponente.innerHTML = '<p class="mensaje-cartas">El oponente no ha seleccionado carta</p>';
            confirmacionOponente = false;
            actualizarBotonIntercambiar();
            return;
        }
        cartas.forEach(id => {
            const nombre = mapaPokemon[id] || `Pokemon #${id}`;
            const cartaDiv = document.createElement('div');
            cartaDiv.className = 'carta-intercambio oponente';
            const spanId = document.createElement('span');
            spanId.className = 'pokemon-id';
            spanId.textContent = `#${id}`;
            const spanNombre = document.createElement('span');
            spanNombre.className = 'pokemon-nombre';
            spanNombre.textContent = nombre;
            cartaDiv.appendChild(spanId);
            cartaDiv.appendChild(spanNombre);
            contenedorOponente.appendChild(cartaDiv);
        });
        confirmacionOponente = !!confirmado;
        actualizarBotonIntercambiar();
    }
    // Suscribirse al evento de selección de cartas del oponente
    channel.subscribe('cartas-seleccionadas', (message) => {
        if (message.data.remitente !== miNombre) {
            mostrarCartasOponente(message.data.cartas, message.data.confirmado);
        }
    });

    // Habilitar el botón de intercambio solo si ambos han confirmado
    function actualizarBotonIntercambiar() {
        const btnIntercambiar = document.getElementById('botonIntercambiar');
        if (!btnIntercambiar) return;
        btnIntercambiar.disabled = !(confirmacionLocal && confirmacionOponente);
    }

    // Lógica de intercambio de cartas
    function intercambiarCartas() {
        const cartasPropias = Array.from(document.querySelectorAll('.carta-intercambio.selected'))
            .map(div => Number(div.querySelector('.pokemon-id').textContent.replace('#', '')));
        const cartasOponente = Array.from(document.querySelectorAll('.carta-intercambio.oponente'))
            .map(div => Number(div.querySelector('.pokemon-id').textContent.replace('#', '')));
        channel.publish('intercambio-cartas', {
            remitente: miNombre,
            cartasEnviadas: cartasPropias,
            cartasRecibidas: cartasOponente
        });
        // Actualizar la colección local
        let coleccion = JSON.parse(localStorage.getItem('coleccionPokemon') || '[]');
        coleccion = coleccion.filter(id => !cartasPropias.includes(id));
        coleccion = coleccion.concat(cartasOponente);
        localStorage.setItem('coleccionPokemon', JSON.stringify(coleccion));
        mostrarCartasDisponibles();
        mostrarDatosLocalStorage();
        confirmacionLocal = false;
        confirmacionOponente = false;
        document.getElementById('btnConfirmarSeleccion').disabled = false;
        actualizarBotonIntercambiar();
        // Refrescar la página directamente al finalizar el intercambio
        location.reload();
    }

    // Suscribirse al evento de intercambio para actualizar colección al recibir cartas
    channel.subscribe('intercambio-cartas', (message) => {
        if (message.data.remitente !== miNombre) {
            let coleccion = JSON.parse(localStorage.getItem('coleccionPokemon') || '[]');
            coleccion = coleccion.filter(id => !message.data.cartasRecibidas.includes(id));
            coleccion = coleccion.concat(message.data.cartasEnviadas);
            localStorage.setItem('coleccionPokemon', JSON.stringify(coleccion));
            mostrarCartasDisponibles();
            mostrarDatosLocalStorage();
            confirmacionLocal = false;
            confirmacionOponente = false;
            document.getElementById('btnConfirmarSeleccion').disabled = false;
            actualizarBotonIntercambiar();
            location.reload();
        }
    });

    // Asignar evento al botón de intercambio
    const btnIntercambiar = document.getElementById('botonIntercambiar');
    if (btnIntercambiar) {
        btnIntercambiar.onclick = intercambiarCartas;
    }

    // Llamar a la función al cargar la página
    mostrarDatosLocalStorage();
    mostrarCartasDisponibles();
    habilitarSeleccionCartas();
    actualizarBotonIntercambiar();
});
