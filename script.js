import { desbloquearCartas, obtenerPokemonPorId } from './PokeAPI.js';
import { obtenerColeccion, agregarCartasANuestraColeccion } from './storage.js';

let cartasColeccion = [];

// Evento para el botón "¡Abrir Sobre!"
document.getElementById('openPackBtn').addEventListener('click', async () => {
    const idsExistentes = obtenerColeccion();
    const nuevasCartas = await desbloquearCartas(6, idsExistentes);
    agregarCartasANuestraColeccion(nuevasCartas.map(p => p.id));
    mostrarNuevasCartas(nuevasCartas);
    // Actualiza la colección principal después de abrir un sobre
    await mostrarColeccion();
});

function mostrarNuevasCartas(cartas) {
    const container = document.getElementById('newCardsContainer');
    const grid = document.getElementById('newCardsGrid');
    grid.innerHTML = '';
    cartas.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        `;
        grid.appendChild(card);
    });
    container.style.display = 'block';
}

// Función para cerrar el sobre y ocultar el contenedor de nuevas cartas
window.cerrarSobre = function() {
    document.getElementById('newCardsContainer').style.display = 'none';
}

// Mostrar la colección en el índice, ordenada y filtrable
async function mostrarColeccion() {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = '<p>Cargando cartas...</p>';
    const ids = obtenerColeccion();
    if (ids.length === 0) {
        grid.innerHTML = '<p>No tienes cartas aún. ¡Abre un sobre!</p>';
        cartasColeccion = [];
        return;
    }
    cartasColeccion = await Promise.all(ids.map(obtenerPokemonPorId));
    cartasColeccion.sort((a, b) => a.id - b.id);
    filtrarYMostrarCartas();
}

// Filtra y muestra las cartas según el buscador y el filtro de tipo
function filtrarYMostrarCartas() {
    const grid = document.getElementById('cardsGrid');
    const texto = document.getElementById('searchInput').value.trim().toLowerCase();
    const tipo = document.getElementById('typeFilter').value;

    let cartasFiltradas = cartasColeccion;

    if (texto) {
        cartasFiltradas = cartasFiltradas.filter(p =>
            p.name.toLowerCase().includes(texto)
        );
    }
    if (tipo) {
        cartasFiltradas = cartasFiltradas.filter(p =>
            p.types.some(t => t.type.name === tipo)
        );
    }

    grid.innerHTML = '';
    if (cartasFiltradas.length === 0) {
        grid.innerHTML = '<p>No se encontraron cartas.</p>';
        return;
    }
    cartasFiltradas.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        `;
        grid.appendChild(card);
    });
}

// Eventos para buscador y filtro
document.getElementById('searchInput').addEventListener('input', filtrarYMostrarCartas);
document.getElementById('typeFilter').addEventListener('change', filtrarYMostrarCartas);

// Mostrar la colección al cargar la página
window.addEventListener('DOMContentLoaded', mostrarColeccion);

// Si tienes navegación entre pantallas, llama a mostrarColeccion() cada vez que muestres el índice
window.mostrarPantalla = function(pantallaId) {
    document.querySelectorAll('.screen').forEach(div => div.classList.remove('active'));
    document.getElementById(pantallaId).classList.add('active');
    if (pantallaId === 'indice') {
        mostrarColeccion();
    }
}