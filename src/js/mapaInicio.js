(function() {
    const lat = 20.566573;
    const lng = -101.2176514;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 12);
    let markers = new L.FeatureGroup().addTo(mapa);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    const obternerPropiedades = async() => {
        try {
            const url = '/api/propiedades';
            const respuesta = await fetch(url);
            const propiedades = await respuesta.json();
            mostrarPropiedades(propiedades);
        } catch (error) {
            console.log(error);
        }
    }

    const mostrarPropiedades = (propiedades) => {
        propiedades.forEach(propiedad => {
            // agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                draggable: true,
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
            <p class="text-indigo-600 font-bold">${propiedad?.categoria.nombre}</p>
            <h2 class="text-lg font-extrabold uppercase mb-3-">${propiedad?.titulo} </h2>
            <img src="/uploads/${propiedad?.imagen}" alt="imagen de la propiedad ${propiedad.titulo}">
            <small>${propiedad?.calle}</small>
            <br>
            <p class="text-gray-600 font-bold">${propiedad?.precio.nombre}</p>
            <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase "> Ver Propiedad</a>
            `).openPopup();

            markers.addLayer(marker);
        });
    }
    
    obternerPropiedades();
    
})();