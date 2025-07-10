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
            card.addEventListener('click', () => mostrarModalPokemon(poke));
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

function capitalizarPalabras(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}

async function mostrarModalPokemon(poke) {
    const modal = document.getElementById('modalCarta');
    const detalles = document.getElementById('detallesCarta');

    let descripcion = '';
    let rareza = 'Normal';
    try {
        const resp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${poke.id}`);
        const species = await resp.json();
        const flavor = species.flavor_text_entries.find(f => f.language.name === 'es');
        descripcion = flavor ? flavor.flavor_text.replace(/\f/g, ' ') : 'Sin descripción.';
        rareza = species.is_legendary ? 'Legendario' : (species.is_mythical ? 'Mítico' : 'Normal');
    } catch {
        descripcion = 'Sin descripción.';
        rareza = 'Normal';
    }

    const hp = poke.stats.find(stat => stat.stat.name === 'hp').base_stat;

    const primerAtaque = poke.moves[0];
    let ataqueNombre = 'Sin ataque';
    let ataqueVeces = '';
    let ataqueTipo = '';
    if (primerAtaque) {
        ataqueNombre = capitalizarPalabras(primerAtaque.move.name.replace('-', ' '));
        ataqueVeces = primerAtaque.version_group_details[0]?.level_learned_at
            ? `x${primerAtaque.version_group_details[0].level_learned_at}`
            : '';
        ataqueTipo = '⚔️';
    }

    const tipo = poke.types[0]?.type.name || 'desconocido';
    const tipoIcono = obtenerIconoTipo(tipo);

    detalles.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;">
            <img src="${poke.sprites.front_default}" alt="${poke.name}" style="width:100px;height:100px;display:block;margin:0 auto;">
            <div style="font-size:1.2rem;font-weight:bold;margin-top:0.5rem;">
                ${poke.name.charAt(0).toUpperCase() + poke.name.slice(1)}
                <span style="font-size:1rem;color:#888;font-weight:normal;">#${String(poke.id).padStart(3, '0')}</span>
            </div>
            <div style="margin:0.5rem 0 0.7rem 0;display:flex;align-items:center;gap:0.5rem;">
                <span style="font-size:1.2em;color:#e25555;">❤️</span>
                <span style="font-weight:bold;">${hp} HP</span>
            </div>
            <div style="margin-bottom:0.7rem;display:flex;align-items:center;gap:0.5rem;">
                <span style="font-size:1.2em;">${ataqueTipo}</span>
                <span style="font-weight:bold;">${ataqueNombre}</span>
                <span style="color:#888;">${ataqueVeces}</span>
            </div>
            <div style="font-size:0.95em;color:#444;background:#f6f6f6;border-radius:0.5em;padding:0.7em 1em;margin-bottom:0.7em;">
                ${descripcion}
            </div>
            <div style="display:flex;justify-content:space-between;width:100%;margin-top:0.5em;">
                <span style="font-size:1em;font-weight:bold;">
                    ${tipoIcono} ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </span>
                <span style="font-size:1em;font-weight:bold;">
                    ${rareza}
                </span>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function obtenerIconoTipo(tipo) {
    switch (tipo) {
        case 'fire': return '🔥';
        case 'water': return '💧';
        case 'grass': return '🌿';
        case 'electric': return '⚡';
        case 'psychic': return '🔮';
        case 'ice': return '❄️';
        case 'dragon': return '🐉';
        case 'dark': return '🌑';
        case 'fairy': return '🧚';
        case 'normal': return '⭐';
        case 'fighting': return '🥊';
        case 'poison': return '☠️';
        case 'ground': return '🌎';
        case 'flying': return '🕊️';
        case 'bug': return '🐛';
        case 'rock': return '🪨';
        case 'ghost': return '👻';
        case 'steel': return '⚙️';
        default: return '❔';
    }
}

// Cerrar el modal
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cerrarModalBtn').onclick = () => {
        document.getElementById('modalCarta').style.display = 'none';
    };
    document.getElementById('modalCarta').onclick = (e) => {
        if (e.target.id === 'modalCarta') {
            document.getElementById('modalCarta').style.display = 'none';
        }
    };
});

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