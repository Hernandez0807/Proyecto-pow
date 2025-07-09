import { obtenerPokemonPorId } from '../../shared/js/PokeAPI.js';
import { obtenerColeccion } from '../../shared/js/storage.js';

let cartasColeccion = {};

async function mostrarColeccion() {
    const grid = document.getElementById('cardsGrid');
    const contador = document.getElementById('contadorColeccion');
    grid.innerHTML = '<p class="mensaje-carga">Cargando cartas...</p>';
    const idsDesbloqueados = obtenerColeccion();
    if (contador) contador.textContent = `${idsDesbloqueados.length}/151 Pokémon`;

    cartasColeccion = {};
    await Promise.all(idsDesbloqueados.map(async (id) => {
        const poke = await obtenerPokemonPorId(id);
        cartasColeccion[id] = poke;
    }));

    filtrarYMostrarCartas();
}

function filtrarYMostrarCartas() {
    const grid = document.getElementById('cardsGrid');
    const texto = document.getElementById('searchInput').value.trim().toLowerCase();
    const tipo = document.getElementById('typeFilter').value;

    grid.innerHTML = '';

    for (let id = 1; id <= 151; id++) {
        const poke = cartasColeccion[id];
        
        if (poke) {
            
            if (texto && !poke.name.toLowerCase().includes(texto)) continue;
            if (tipo && !poke.types.some(t => t.type.name === tipo)) continue;

            
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.innerHTML = `
                <img src="${poke.sprites.front_default}" alt="${poke.name}">
                <h3>${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}</h3>
                <div class="pokemon-info">
                    <span class="pokemon-num">#${String(poke.id).padStart(3, '0')}</span>
                    <span class="pokemon-hp">HP ${poke.stats.find(stat => stat.stat.name === 'hp').base_stat}</span>
                </div>
            `;
            grid.appendChild(card);
        } else {
            
            if (texto || tipo) continue;

            
            const card = document.createElement('div');
            card.className = 'pokemon-card bloqueada';
            card.innerHTML = `
                <div class="placeholder-img"></div>
                <h3>???</h3>
                <div class="pokemon-info">
                    <span class="pokemon-num">#${String(id).padStart(3, '0')}</span>
                </div>
            `;
            grid.appendChild(card);
        }
    }

    
    if (!grid.hasChildNodes()) {
        grid.innerHTML = '<p>No se encontraron cartas.</p>';
    }
}

// Inicialización segura al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filtrarYMostrarCartas);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filtrarYMostrarCartas);
    }
    mostrarColeccion();
});