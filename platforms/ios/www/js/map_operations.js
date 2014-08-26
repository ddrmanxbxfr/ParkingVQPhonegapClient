/*global L,$*/
var map;
function onLocationFound(e) {
    "use strict";
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("Vous êtes ici").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

function configurerCssMap() {
   "use strict";
    $("#map").height($(window).height()).width($(window).width());
}

function initMap() {
    "use strict";
    configurerCssMap();
    map = L.map('map').setView([46.80, -71.23], 11);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; Powered by APES, Thanks to OSM/Leaflet for tiles and maps'
    }).addTo(map);
    
    // Bind la methode après locate...
    map.on('locationfound', onLocationFound);
    
    map.locate({setView: true, maxZoom: 14, enableHighAccuracy: true});

}

