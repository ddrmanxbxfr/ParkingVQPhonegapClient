/*jslint nomen: true*/
/*global L,$,console, clearWaypoints, ajouterWaypointsBounds, refreshMap,evaluateIfIShouldLoadWaypointsFromApi, showOverlay, hideOverlay*/
var map, markers;

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

function ajouterWaypointALaMap(geojsonMarkers) {
    "use strict";
    var progressBar, markerList, lenFeatures, marker, i, maxZoom;
    progressBar = document.getElementById('progress_bar');

    function updateProgressBar(processed, total, elapsed, layersArray) {
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            showOverlay();
            progressBar.style.width = Math.round(processed / total * 100) + '%';
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
            hideOverlay();
        }
    }
    maxZoom = map.getMaxZoom();
    markers = L.markerClusterGroup({
        chunkedLoading: true,
        chunkProgress: updateProgressBar,
        removeOutsideVisibleBounds: true,
        disableClusteringAtZoom: maxZoom
    });
    markerList = [];
    lenFeatures = geojsonMarkers.features.length;
    for (i = 0; i < lenFeatures; i = i + 1) {
        marker = L.marker(L.latLng(geojsonMarkers.features[i].geometry.coordinates[1], geojsonMarkers.features[i].geometry.coordinates[0]));
        markerList.push(marker);
    }

    clearWaypoints();

    markers.addLayers(markerList);
    map.addLayer(markers);
}


function clearWaypointsOnEvent() {
    "use strict";
    if (evaluateIfIShouldLoadWaypointsFromApi(map.getBounds())) {
        clearWaypoints();
    }
}

function refreshMapOnEvent() {
    "use strict";
    var mapBounds = map.getBounds();
    if (evaluateIfIShouldLoadWaypointsFromApi(mapBounds)) {
        ajouterWaypointsBounds(mapBounds);
    }
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
    map.on("dragstart", clearWaypointsOnEvent);
    map.on("dragend", refreshMapOnEvent);
    map.on("zoomstart", clearWaypointsOnEvent);
    map.on("zoomend", refreshMapOnEvent);

    // Trouve moi donc où je suis !
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
}
