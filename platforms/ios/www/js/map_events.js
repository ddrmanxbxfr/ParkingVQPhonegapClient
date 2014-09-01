/*jslint nomen: true*/
/*global L,$,console, clearWaypoints, ajouterWaypointsBounds, refreshMap,evaluateIfIShouldLoadWaypointsFromApi*/
var map, markers, overlayShown;

function onLocationFound(e) {
    "use strict";
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("Vous êtes ici").openPopup();

    L.circle(e.latlng, radius).addTo(map);
    ajouterWaypointsBounds(map.getBounds());
}

function setProgressBar(percentProgress) {
    "use strict";
    document.getElementById('progress_bar').style.width = percentProgress + '%';
}

function showOverlay() {
    "use strict";
    var overlayToShow, cl;
    if (overlayShown === undefined || overlayShown === false) {
        overlayToShow = document.getElementById('overlay');
        cl = overlayToShow.classList;
        setProgressBar(0);
        if (cl.contains('off')) {
            cl.remove('off');
        }
        overlayShown = true;
    }
}

function hideOverlay() {
    "use strict";
    var overlayToShow, cl;
    if (overlayShown) {
        overlayToShow = document.getElementById('overlay');
        cl = overlayToShow.classList;
        cl.add('off');
        overlayShown = false;
    }
}

function configurerCssMap() {
    "use strict";
    $("#map").height($(window).height() - $("#titleTopBar").height()).width($(window).width());
}

function ajouterWaypointALaMap(geojsonMarkers) {
    "use strict";
    var progressBar, maxZoom;
    progressBar = document.getElementById('progress_bar');

    function generateMarkerList(geojsonMarkers) {
        function getMapIcon(nomProp) {
            switch (nomProp) {
            case "PANNEAU_S":
                return L.icon({
                    iconUrl: 'img/parkingicon.png',
                    iconSize: [38, 38] // size of the icon
                });
            case "PARCOMETRE":
                return L.icon({
                    iconUrl: 'img/parcometre.png',
                    iconSize: [38, 38] // size of the icon
                });
            case "BORNES_FONTAINES":
                return L.icon({
                    iconUrl: 'img/bornefontaine.png',
                    iconSize: [38, 38] // size of the icon
                });
            }
        }

        var markerList, lenFeatures, i;
        markerList = [];
        lenFeatures = geojsonMarkers.features.length;
        for (i = 0; i < lenFeatures; i = i + 1) {
            markerList.push(L.marker(L.latLng(geojsonMarkers.features[i].geometry.coordinates[1], geojsonMarkers.features[i].geometry.coordinates[0]), {
                icon: getMapIcon(geojsonMarkers.features[i].properties.TYPE_SRC)
            }));
        }
        return markerList;
    }

    function updateProgressBar(processed, total, elapsed, layersArray) {
        if (elapsed > 1000) {
            // if it takes more than a second to load, display the progress bar:
            showOverlay();
            progressBar.style.width = Math.round(processed / total * 100) + "%";
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

    clearWaypoints();

    markers.addLayers(generateMarkerList(geojsonMarkers));
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

function locateMeOnMap() {
    "use strict";
    // Trouve moi donc où je suis !
    map.locate({
        setView: true,
        maxZoom: 16,
        enableHighAccuracy: true
    });
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
    map.on("dragend", refreshMapOnEvent);
    map.on("zoomend", refreshMapOnEvent);

    locateMeOnMap();
}
