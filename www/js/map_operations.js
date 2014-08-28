/*global L,$,console*/
var map, geoJsonLayer;

function clearWaypoints() {
    "use strict";
    if (geoJsonLayer !== null) {
        map.removeLayer(geoJsonLayer);
    }
}


function trouverCenterFromBounds(h1, h2, b1, b2) {
    "use strict";
    var ih1, ih2, ib1, ib2, centreH, centreB, point;
    ih1 = parseFloat(h1);
    ih2 = parseFloat(h2);
    ib1 = parseFloat(b1);
    ib2 = parseFloat(b2);

    centreH = (ih1 + ih2) / 2;
    centreB = (ib1 + ib2) / 2;
    point = {
        lat: centreH,
        lng: centreB
    };
    return point;
}

function ajouterWaypointsBounds(latlngBounds) {
    var url, geojsonFeature, geoJsonToShow;
    if (geoJsonLayer != null) {
        clearWaypoints();
    }

    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    url = "http://127.0.0.1:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng;
    console.log(url);
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };
        geoJsonLayer = L.geoJson(geoJsonToShow).addTo(map);
    });
};

function ajouterWaypointsRadius(radiusTarget, latlngLocs) {
    "use strict";
    var geojsonFeature, geoJsonToShow, url, pointCentral;
    if (geoJsonLayer != null) {
        clearWaypoints();
    }

    pointCentral = trouverCenterFromBounds(latlngLocs._southWest.lat, latlngLocs._northEast.lat, latlngLocs._southWest.lng, latlngLocs._northEast.lng);
    console.log('lat :' + pointCentral.lat + ' lng: ' + pointCentral.lng);
    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    url = "http://127.0.0.1:4711/api/parking/" + radiusTarget + "/" + pointCentral.lat + "/" + pointCentral.lng;
    //  console.log(url);
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
    ajouterWaypointsBounds(map.getBounds());
}

function configurerCssMap() {
    "use strict";
    $("#map").height($(window).height()).width($(window).width());
}


function refreshMap() {
    "use strict";
    ajouterWaypointsBounds(map.getBounds());
}

function initMap() {
    "use strict";
    configurerCssMap();
    map = L.map('map').setView([46.80, -71.23], 11);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    }).addTo(map);

    // Bind la methode après locate...
    map.on('locationfound', onLocationFound);
    // Methodes lorsque le user deplace la map...
    map.on('dragend', refreshMap);
    map.on("zoomend", refreshMap);
    
    // Trouve moi donc où je suis !
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
}