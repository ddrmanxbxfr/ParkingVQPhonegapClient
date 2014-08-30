/*global L,$,console*/
var map, markers;

function clearWaypoints() {
    "use strict";
    if (markers !== undefined && markers !== null) {
        map.removeLayer(markers);
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

function ajouterWaypointALaMap(geojsonMarkers) {
    "use strict";
    var progressBar, progress, markerList, lenFeatures, marker, i;
    clearWaypoints();
    progress = document.getElementById('progress');
    progressBar = document.getElementById('progress-bar');

    function updateProgressBar(processed, total, elapsed, layersArray) {
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            progress.style.display = 'block';
            progressBar.style.width = Math.round(processed / total * 100) + '%';
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
            progress.style.display = 'none';
        }
    }
    markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
    markerList = [];
    lenFeatures = geojsonMarkers.features.length;
    for (i = 0; i < lenFeatures; i + 1) {
        marker = L.marker(L.latLng(geojsonMarkers.features[i].geometry.coordinates[1], geojsonMarkers.features[i].geometry.coordinates[0]));
        markerList.push(marker);
    }
    console.log('adding to layer : ' + markerList.length);
    markers.addLayers(markerList);
    map.addLayer(markers);
}

function ajouterWaypointsBounds(latlngBounds) {
    "use strict";
    var url, geojsonFeature, geoJsonToShow;

    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    url = "http://vps84512.ovh.net:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng;
    // console.log(url);
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };

        ajouterWaypointALaMap(geoJsonToShow);
    });
}

function ajouterWaypointsRadius(radiusTarget, latlngLocs) {
    "use strict";
    var geojsonFeature, geoJsonToShow, url, pointCentral;

    pointCentral = trouverCenterFromBounds(latlngLocs._southWest.lat, latlngLocs._northEast.lat, latlngLocs._southWest.lng, latlngLocs._northEast.lng);
    console.log('lat :' + pointCentral.lat + ' lng: ' + pointCentral.lng);
    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    url = "http://vps84512.ovh.net:4711/api/parking/" + radiusTarget + "/" + pointCentral.lat + "/" + pointCentral.lng;
    //  console.log(url);
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };
        ajouterWaypointALaMap(geoJsonToShow);
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
    $("#map").height($(window).height() - $("#titleTopBar").height()).width($(window).width());
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
    map.on("dragstart", clearWaypoints);
    map.on("dragend", refreshMap);
    map.on("zoomstart", clearWaypoints);
    map.on("zoomend", refreshMap);

    // Trouve moi donc où je suis !
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
}