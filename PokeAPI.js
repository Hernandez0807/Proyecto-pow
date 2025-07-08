export async function obtenerPokemonPorId(id) {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!respuesta.ok) throw new Error('No se pudo obtener el Pokémon');
    return await respuesta.json();
}

export function obtenerIdsAleatorios(cantidad = 6, maxId = 151, idsExistentes = []) {
    const nuevosIds = [];
    while (nuevosIds.length < cantidad) {
        const id = Math.floor(Math.random() * maxId) + 1;
        if (!idsExistentes.includes(id) && !nuevosIds.includes(id)) {
            nuevosIds.push(id);
        }
    }
    return nuevosIds;
}

export async function desbloquearCartas(cantidad = 6, idsExistentes = []) {
    const nuevosIds = obtenerIdsAleatorios(cantidad, 151, idsExistentes);
    const nuevasCartas = await Promise.all(nuevosIds.map(obtenerPokemonPorId));
    return nuevasCartas;
}