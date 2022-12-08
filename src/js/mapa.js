(function() {
    const lat = 20.566573;
    const lng = -101.2176514;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


})()