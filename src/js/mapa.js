(function() {
    const lat = 20.566573;
    const lng = -101.2176514;
    const mapa = L.map('mapa').setView([lat, lng ], 15);
    let marker;
    
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // pin 
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa);

    // detectar el movimiento del pin
    marker.on('moveend', function(e) {
        marker = e.target;
        const posicion = marker.getLatLng();

        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        // obtenr inoformacion de la calle al mover el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, resultado) {
            marker.bindPopup(resultado.address.Match_addr).openPopup();

            // llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        });

    })

})()