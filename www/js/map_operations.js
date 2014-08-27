/*global L,$*/
var map, geoJsonLayer;

function clearWaypoints() {
    "use strict";
    if (geoJsonLayer !== null) {
        map.removeLayer(geoJsonLayer);
    }
}

function ajouterWaypointsRadius(radiusTarget, latlngLocs) {
    "use strict";
    var geojsonFeature, geoJsonToShow, url;
    if (geoJsonLayer != null) {
        clearWaypoints();
    }

    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    url = "http://localhost:4711/api/parking/" + radiusTarget + "/" + latlngLocs.lat + "/" + latlngLocs.lng;
    
    
      console.log(url);
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };
        geoJsonLayer = L.geoJson(geoJsonToShow).addTo(map);
    });
}

function onLocationFound(e) {
    "use strict";
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("Vous êtes ici").openPopup();

    L.circle(e.latlng, radius).addTo(map);
    
    ajouterWaypointsRadius(10, map.getCenter());
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

    }).addTo(map);

    // Bind la methode après locate...
    map.on('locationfound', onLocationFound);

    map.locate({
        setView: true,
        maxZoom: 14,
        enableHighAccuracy: true
    });
}