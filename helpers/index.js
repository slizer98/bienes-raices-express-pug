const esVendedor = (usuarioId, propiedadUsuarioId) => {
    return usuarioId === propiedadUsuarioId;
}

const formatearFecha = fecha => {
    console.log(fecha);
}

export {
    esVendedor,
    formatearFecha
}