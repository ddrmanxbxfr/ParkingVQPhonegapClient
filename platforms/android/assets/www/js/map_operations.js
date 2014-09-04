/*jslint nomen: true*/
/*global L,$,console, markers, map, ajouterWaypointALaMap, showOverlayMap*/
var locsLoadedInMemory, reducedDataset;

function isLocsLoadedInMemory() {
    "use strict";
    if (locsLoadedInMemory !== undefined && locsLoadedInMemory.swX !== undefined && locsLoadedInMemory.swY !== undefined && locsLoadedInMemory.neX !== undefined && locsLoadedInMemory.neY !== undefined) {
        return true;
    } else {
        return false;
    }
}

// Obtiens la zone cache de waypoints qu'on load en memoire...
function getBiggerBounds() {
    "use strict";
    return 0.05;
}

function addNonViewedBoundsToLoc(parToAdd, isItSw) {
    "use strict";
    if (isItSw) {
        return parToAdd - getBiggerBounds();
    } else {
        return parToAdd + getBiggerBounds();
    }
}


function addConstantNonViewToBounds(platlngbounds) {
    "use strict";
    platlngbounds._southWest.lat = addNonViewedBoundsToLoc(platlngbounds._southWest.lat, true);
    platlngbounds._southWest.lng = addNonViewedBoundsToLoc(platlngbounds._southWest.lng, true);
    platlngbounds._northEast.lat = addNonViewedBoundsToLoc(platlngbounds._northEast.lat, false);
    platlngbounds._northEast.lng = addNonViewedBoundsToLoc(platlngbounds._northEast.lng, false);
    return platlngbounds;
}

function updateLocsInMemory(latlngbounds) {
    "use strict";
    if (locsLoadedInMemory !== undefined) {
        locsLoadedInMemory.swY = latlngbounds._southWest.lat;
        locsLoadedInMemory.swX = latlngbounds._southWest.lng;
        locsLoadedInMemory.neY = latlngbounds._northEast.lat;
        locsLoadedInMemory.neX = latlngbounds._northEast.lng;
    } else {
        locsLoadedInMemory = {
            swY: latlngbounds._southWest.lat,
            swX: latlngbounds._southWest.lng,
            neY: latlngbounds._northEast.lat,
            neX: latlngbounds._northEast.lng
        };
    }
}

function isPolyInBounds(swY, swX, neY, neX) {
    "use strict";
    if ((neY > locsLoadedInMemory.neY || swY > locsLoadedInMemory.swY) && (neX < locsLoadedInMemory.neX || swX < locsLoadedInMemory.swX)) {
        return true;
    } else {
        return false;
    }
}

function shouldILoadUsingDelta(mapBounds, zoomLevel) {
    "use strict";
    if ((zoomLevel >= 14 && reducedDataset === false) || (zoomLevel < 14 && reducedDataset === true)) {
        return true; // We still in the detailed dataset :)
    } else {
        return false;
    }
}

function evaluateIfIShouldLoadWaypointsFromApi(mapBounds, zoomLevel) {
    "use strict";
    if (zoomLevel >= 14 && reducedDataset === true) {
        return true; // We zoomed in
    } else {
        if (zoomLevel < 14 && reducedDataset === false) {
            return true;
        } else {
            if (isLocsLoadedInMemory()) {
                if (
                    isPolyInBounds(mapBounds._southWest.lat, mapBounds._southWest.lng, mapBounds._northEast.lat, mapBounds._northEast.lng)
                ) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        }
    }
}

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


function ajouterWaypointsDelta(latlngBounds, zoomLevel) {
    "use strict";

    function getUrlForZoomLevel(latlngBounds, zoomLevel) {

        var baseUrl = "http://vps84512.ovh.net:4711/api/parking/" + locsLoadedInMemory.swY + "/" +
            locsLoadedInMemory.swX + "/" + locsLoadedInMemory.neY + "/" + locsLoadedInMemory.neX;

        if (zoomLevel >= 14) {
            if (reducedDataset) {
                reducedDataset = false;
            }
            return baseUrl + "/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=5";
        } else {
            if (!reducedDataset) {
                reducedDataset = true;
            }
            return baseUrl + "/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=2";
        }
    }

    function calculerNewBounds(latlngBounds) {
        var minX, minY, maxX, maxY;

        minX = latlngBounds._southWest.lng;
        minY = latlngBounds._southWest.lat;
        maxX = latlngBounds._northEast.lng;
        maxY = latlngBounds._northEast.lat;

        if (minX > locsLoadedInMemory.swX) {
            minX = locsLoadedInMemory.swX;
        }

        if (minY > locsLoadedInMemory.swY) {
            minY = locsLoadedInMemory.swY;
        }

        if (maxX < locsLoadedInMemory.neX) {
            maxX = locsLoadedInMemory.neX;
        }

        if (maxY < locsLoadedInMemory.neY) {
            maxY = locsLoadedInMemory.neY;
        }

        return {
            _southWest: {
                lat: minY,
                lng: minX
            },
            _northEast: {
                lat: maxY,
                lng: maxX
            }
        };
    }


    var url, geojsonFeature, geoJsonToShow, newBounds;
    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    latlngBounds = addConstantNonViewToBounds(latlngBounds);
    newBounds = calculerNewBounds(latlngBounds);
    url = getUrlForZoomLevel(newBounds, zoomLevel);
    // console.log(url);
    showOverlayMap();
    console.log(url);
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };
        updateLocsInMemory(newBounds);
        ajouterWaypointALaMap(geoJsonToShow, false);
    });
}

function ajouterWaypointsBounds(latlngBounds, zoomLevel) {
    "use strict";

    function getUrlForZoomLevel(latlngBounds, zoomLevel) {
        if (zoomLevel >= 14) {
            if (reducedDataset === undefined || reducedDataset) {
                reducedDataset = false;
            }
            return "http://vps84512.ovh.net:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=4";
        } else {
            if (reducedDataset === undefined || !reducedDataset) {
                reducedDataset = true;
            }
            return "http://vps84512.ovh.net:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=2";
        }
    }
    var url, geojsonFeature, geoJsonToShow;
    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
    latlngBounds = addConstantNonViewToBounds(latlngBounds);
    url = getUrlForZoomLevel(latlngBounds, zoomLevel);
    // console.log(url);
    showOverlayMap();
    $.getJSON(url, function (data) {
        geoJsonToShow = {
            "features": data.features,
            "name": data.name,
            "type": data.type
        };
        updateLocsInMemory(latlngBounds);
        ajouterWaypointALaMap(geoJsonToShow, true);
    });
}
