(function() {
    const lat = 20.566573;
    const lng = -101.2176514;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 12);
    let markers = new L.FeatureGroup().addTo(mapa);
    let propiedades = [];
    
    // Filtros 
    const filtros = {
        categorias: '',
        precio: '',
    }
    
    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Filtrado de categorias y precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categorias = +e.target.value;
        filtrarPropiedades();
    });
    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        filtrarPropiedades();
    });


    const obternerPropiedades = async() => {
        try {
            const url = '/api/propiedades';
            const respuesta = await fetch(url);
            propiedades = await respuesta.json();
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

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio);
        markers.clearLayers();
        mostrarPropiedades(resultado);
    }
    const filtrarCategoria = propiedad => filtros.categorias ? propiedad.categoriaId === filtros.categorias : propiedad;
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;
    
    obternerPropiedades();
    
})();