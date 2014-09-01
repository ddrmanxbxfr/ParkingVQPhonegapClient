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

function isPointInPoly(ptLat, ptLng) {
    // Algo trouvé sur...
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    "use strict";
    var x, y, xi, yi, xj, yj, intersect, inside;
    x = ptLng;
    y = ptLat;
    inside = false;
    xi = locsLoadedInMemory.neY;
    yi = locsLoadedInMemory.swY;
    xj = locsLoadedInMemory.neX;
    yj = locsLoadedInMemory.neY;
    intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) {
        inside = !inside;
    }

    return inside;
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
                    isPointInPoly(mapBounds._southWest.lat,
                        mapBounds._southWest.lng) && isPointInPoly(mapBounds._northEast.lat,
                        mapBounds._northEast.lng)
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

function ajouterWaypointsBounds(latlngBounds, zoomLevel) {
    "use strict";

    function getUrlForZoomLevel(latlngBounds, zoomLevel) {
        if (zoomLevel >= 14) {
            if (reducedDataset) {
                reducedDataset = false;
            }
            return "http://vps84512.ovh.net:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=5";
        } else {
            if (!reducedDataset) {
                reducedDataset = true;
            }
            return "http://vps84512.ovh.net:4711/api/parking/" + latlngBounds._southWest.lat + "/" + latlngBounds._southWest.lng + "/" + latlngBounds._northEast.lat + "/" + latlngBounds._northEast.lng + "?roundloc=3";
        }
    }
    var url, geojsonFeature, geoJsonToShow;
    geojsonFeature = new L.GeoJSON();
    geoJsonToShow = {};
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
        ajouterWaypointALaMap(geoJsonToShow);
    });
}
