export function obtenerColeccion() {
    const coleccion = localStorage.getItem('coleccionPokemon');
    return coleccion ? JSON.parse(coleccion) : [];
}

export function guardarColeccion(coleccion) {
    localStorage.setItem('coleccionPokemon', JSON.stringify(coleccion));
}

export function agregarCartasANuestraColeccion(nuevosIds) {
    const coleccion = obtenerColeccion();
    const actualizada = [...new Set([...coleccion, ...nuevosIds])];
    guardarColeccion(actualizada);
}

export function eliminarCartaDeColeccion(id) {
    const coleccion = obtenerColeccion();
    const actualizada = coleccion.filter(cartaId => cartaId !== id);
    guardarColeccion(actualizada);
}