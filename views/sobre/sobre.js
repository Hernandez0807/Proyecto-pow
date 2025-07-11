import { desbloquearCartas } from '../../shared/js/PokeAPI.js';
import { agregarCartasANuestraColeccion } from '../../shared/js/storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modalCarta');
  const detalles = document.getElementById('detallesCarta');
  const cerrarModalBtn = document.getElementById('cerrarModalBtn');
  const botonAbrir = document.getElementById('botonAbrirSobre');

  let cartas = [];
  let actual = 0;

  botonAbrir.onclick = async () => {
    botonAbrir.disabled = true;
    botonAbrir.textContent = 'Abriendo...';
    try {
      cartas = await desbloquearCartas(6);
      const nuevosIds = cartas.map(p => p.id);
      agregarCartasANuestraColeccion(nuevosIds);
      actual = 0;
      await mostrarCarta(cartas[actual]);
      botonAbrir.textContent = '¡Sobre abierto!';
    } catch (error) {
      alert('Error al abrir el sobre.');
      console.error(error);
      botonAbrir.disabled = false;
      botonAbrir.textContent = 'Reintentar';
    }
  };

  async function mostrarCarta(poke) {
    let descripcion = 'Sin descripción.';
    let rareza = 'Normal';
    try {
      const resp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${poke.id}`);
      const data = await resp.json();
      const flavor = data.flavor_text_entries.find(f => f.language.name === 'es');
      descripcion = flavor ? flavor.flavor_text.replace(/\f/g, ' ') : descripcion;
      rareza = data.is_legendary ? 'Legendario' : data.is_mythical ? 'Mítico' : 'Normal';
    } catch {}

    const tipo = poke.types[0]?.type.name || 'desconocido';
    const iconoTipo = obtenerIconoTipo(tipo);
    const hp = poke.stats.find(stat => stat.stat.name === 'hp')?.base_stat || '?';
    const ataque = poke.moves[0]?.move?.name.replace('-', ' ') || 'Sin ataque';
    const nivel = poke.moves[0]?.version_group_details[0]?.level_learned_at || '';

    detalles.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <img src="${poke.sprites.front_default}" alt="${poke.name}" style="width:100px;height:100px;">
        <h2>${capitalizar(poke.name)} <span style="font-size:1rem;color:#999;">#${String(poke.id).padStart(3, '0')}</span></h2>
        <div style="margin:0.5rem 0;">❤️ <strong>${hp} HP</strong></div>
        <div style="margin-bottom:0.5rem;">⚔️ ${capitalizar(ataque)} ${nivel ? `x${nivel}` : ''}</div>
        <p style="background:#f6f6f6;padding:0.7em 1em;border-radius:0.5em;">${descripcion}</p>
        <div style="display:flex;justify-content:space-between;width:100%;margin-top:0.5rem;">
          <strong>${iconoTipo} ${capitalizar(tipo)}</strong>
          <strong>${rareza}</strong>
        </div>
        <p style="margin-top:1rem;font-size:0.9rem;color:#777;">Haz clic para mostrar la siguiente carta</p>
      </div>
    `;
    modal.style.display = 'flex';
  }

  function capitalizar(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function obtenerIconoTipo(tipo) {
    const iconos = {
      fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', psychic: '🔮',
      ice: '❄️', dragon: '🐉', dark: '🌑', fairy: '🧚', normal: '⭐',
      fighting: '🥊', poison: '☠️', ground: '🌎', flying: '🕊️', bug: '🐛',
      rock: '🪨', ghost: '👻', steel: '⚙️'
    };
    return iconos[tipo] || '❔';
  }

  // Navegación entre cartas
  modal.onclick = (e) => {
    if (e.target.id === 'modalCarta') {
      modal.style.display = 'none';
    } else {
      actual++;
      if (actual < cartas.length) {
        mostrarCarta(cartas[actual]);
      } else {
        modal.style.display = 'none';
      }
    }
  };

  cerrarModalBtn.onclick = () => {
    modal.style.display = 'none';
  };
});