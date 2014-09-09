/*jslint nomen: true*/
/*global L,$,console, clearWaypoints, ajouterWaypointsBounds,showOverlay,hideOverlay, refreshMap,reducedDataset,evaluateIfIShouldLoadWaypointsFromApi, ajouterWaypointsDelta, shouldILoadUsingDelta, configurerCssMap,
doOnOrientationChange*/
var map, markers, overlayShown, currentLocationMarker;

function onLocationFound(e) {
    "use strict";
    var radius = e.accuracy / 2;
    if (currentLocationMarker === undefined) {
        currentLocationMarker = L.marker(e.latlng).addTo(map)
            .bindPopup("Vous êtes ici").openPopup();
    } else {
        if (currentLocationMarker.getLatLng() !== e.latlng) {
            // Si on c'est deplacer il faut aussi deplacer le marker.
            map.removeLayer(currentLocationMarker);
            currentLocationMarker = L.marker(e.latlng).addTo(map).bindPopup("Vous êtes ici").openPopup();
        }
    }
}

function setProgressBar(percentProgress) {
    "use strict";
    document.getElementById('progress_bar').style.width = percentProgress + '%';
}

function desactiverControlZoom() {
    "use strict";
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    $(".leaflet-control-zoom").css("visibility", "hidden");
}

function activerControlZoom() {
    "use strict";
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    $(".leaflet-control-zoom").css("visibility", "visible");
}

function showOverlayMap() {
    "use strict";
    if (overlayShown === undefined || overlayShown === false) {
        desactiverControlZoom();
        setProgressBar(0);
        showOverlay("overlay");
        overlayShown = true;
    }
}

function hideOverlayMap() {
    "use strict";
    var overlayToShow, cl;
    if (overlayShown) {
        activerControlZoom();
        hideOverlay("overlay");
        overlayShown = false;
    }
}

function ajouterWaypointALaMap(geojsonMarkers, clearOldWaypoints) {
    "use strict";
    var progressBar, maxZoom;
    progressBar = document.getElementById('progress_bar');

    function generateMarkerList(geojsonMarkers) {
        function getMarkerFromLocs(plng, plat, propsDoc) {
            function getMapIcon(nomProp) {
                function validDansLesHeuresAutorise(arrHeuresAutorise) {
                    var d, n, iCpt;
                    d = new Date();
                    n = d.getHours();
                    for (iCpt = 0; iCpt < arrHeuresAutorise.length; iCpt = iCpt + 1) {
                        if (n > arrHeuresAutorise[iCpt][0] && n < arrHeuresAutorise[iCpt][1]) {
                            return true;
                        }
                    }
                    return false;
                }

                var d, n, iCpt, iconToReturn;
                switch (nomProp) {
                case "PANNEAU_S":
                    if (propsDoc.NB_MINUTES_AUTORISE !== undefined) {
                        iconToReturn = L.icon({
                            iconUrl: 'img/parkinggreen.png',
                            iconSize: [38, 38] // size of the icon
                        });
                    } else {
                        if (propsDoc.HEURES_AUTORISE !== undefined) {
                            if (validDansLesHeuresAutorise(propsDoc.HEURES_AUTORISE)) {
                                iconToReturn = L.icon({
                                    iconUrl: 'img/parkingred.png',
                                    iconSize: [38, 38] // size of the icon
                                });
                            } else {
                                iconToReturn = L.icon({
                                    iconUrl: 'img/parkinggreen.png',
                                    iconSize: [38, 38] // size of the icon
                                });
                            }
                        } else {
                            iconToReturn = L.icon({
                                iconUrl: 'img/parkingicon.png',
                                iconSize: [38, 38] // size of the icon
                            });
                        }

                    }
                    break;
                case "PARCOMETRE":
                    iconToReturn = L.icon({
                        iconUrl: 'img/parcometre.png',
                        iconSize: [38, 38] // size of the icon
                    });
                    break;
                case "BORNES_FONTAINES":
                    iconToReturn = L.icon({
                        iconUrl: 'img/bornefontaine.png',
                        iconSize: [38, 38] // size of the icon
                    });
                    break;
                }

                return iconToReturn;
            }
            var markerToReturn = L.marker(L.latLng(plng, plat), {
                icon: getMapIcon(propsDoc.TYPE_SRC)
            });

            if (propsDoc.TYPE_CODE !== undefined) {
                markerToReturn.bindPopup("<p>Information importante</p><p>" + propsDoc.TYPE_DESC + "</p>");
            }

            return markerToReturn;
        }



        var markerList, lenFeatures, i;
        markerList = [];
        lenFeatures = geojsonMarkers.features.length;
        for (i = 0; i < lenFeatures; i = i + 1) {
            markerList.push(getMarkerFromLocs(geojsonMarkers.features[i].geometry.coordinates[1], geojsonMarkers.features[i].geometry.coordinates[0], geojsonMarkers.features[i].properties));
        }
        return markerList;
    }

    function updateProgressBar(processed, total, elapsed, layersArray) {
        if (elapsed > 2000) {
            // if it takes more than a second to load, display the progress bar:
            showOverlayMap();
            progressBar.style.width = Math.round(processed / total * 100) + "%";
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
            hideOverlayMap();
        }
    }

    maxZoom = map.getMaxZoom();
    if (clearOldWaypoints) {
        oldData[reducedDataset] = markers;
        clearWaypoints();
        markers = L.markerClusterGroup({
            chunkedLoading: true,
            chunkProgress: updateProgressBar,
            removeOutsideVisibleBounds: true,
            disableClusteringAtZoom: maxZoom
        });
    }

    markers.addLayers(generateMarkerList(geojsonMarkers));

    if (clearOldWaypoints) {
        map.addLayer(markers);
    }
}

function addWaypointsFromOldData() {
    var progressBar, maxZoom;
    progressBar = document.getElementById('progress_bar');

    function updateProgressBar(processed, total, elapsed, layersArray) {
        if (elapsed > 2000) {
            // if it takes more than a second to load, display the progress bar:
            showOverlayMap();
            progressBar.style.width = Math.round(processed / total * 100) + "%";
        }

        if (processed === total) {
            // all markers processed - hide the progress bar:
            hideOverlayMap();
        }
    }

    maxZoom = map.getMaxZoom();
    clearWaypoints();
    markers = oldData[!reducedDataset]
    map.addLayer(markers);
}

function refreshMapOnEvent() {
    "use strict";
    var mapBounds, mapZoom;
    mapBounds = map.getBounds();
    mapZoom = map.getZoom();
    if (evaluateIfIShouldLoadWaypointsFromApi(mapBounds, mapZoom)) {
        if (canIBringBackTheOldLocs(mapBounds, mapZoom)) {
            bringBackTheCachedWaypoints(mapBounds, mapZoom);
        } else {
            if (shouldILoadUsingDelta(mapBounds, mapZoom)) { // Let's choose a strategy !
                ajouterWaypointsDelta(mapBounds, mapZoom);
            } else {
                ajouterWaypointsBounds(mapBounds, mapZoom);
            }
        }
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
    window.addEventListener('orientationchange', doOnOrientationChange);
    configurerCssMap();

    map = L.map('map', {
        attributionControl: false
    }).setView([46.80, -71.23], 15);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    }).addTo(map);

    // Bind la methode après locate...
    map.on('locationfound', onLocationFound);
    // Methodes lorsque le user deplace la map...
    map.on("dragend", refreshMapOnEvent);
    map.on("zoomend", refreshMapOnEvent);

    locateMeOnMap();
}
