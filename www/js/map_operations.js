/*jslint nomen: true*/
/*global L,$,console, markers, map, ajouterWaypointALaMap, showOverlayMap*/
var locsLoadedInMemory, reducedDataset, oldData, detailedOldLocs, reducedOldLocs;
oldData = [];

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

function updateLocsInMemory(latlngbounds, isThisReducedDataset) {
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

    if (isThisReducedDataset) {
        reducedOldLocs = {
            swY: latlngbounds._southWest.lat,
            swX: latlngbounds._southWest.lng,
            neY: latlngbounds._northEast.lat,
            neX: latlngbounds._northEast.lng
        };
    } else {
        detailedOldLocs = {
            swY: latlngbounds._southWest.lat,
            swX: latlngbounds._southWest.lng,
            neY: latlngbounds._northEast.lat,
            neX: latlngbounds._northEast.lng
        };
    }
}

function isPolyInBounds(swY, swX, neY, neX, locsToWorkOn) {
    "use strict";
    if (locsToWorkOn !== undefined && (neY > locsToWorkOn.neY || swY > locsToWorkOn.swY) && (neX < locsToWorkOn.neX || swX < locsToWorkOn.swX)) {
        return true;
    } else {
        return false;
    }
}

function canIBringBackTheOldLocs(mapBounds, zoomLevel) {
    if ((zoomLevel >= 14 && reducedDataset === false) || (zoomLevel < 14 && reducedDataset === true)) {
        return false; // We still in the detailed dataset :)
    } else {
        // Check what we are dealing with
        if ((zoomLevel >= 14 && reducedDataset === true) && isPolyInBounds(mapBounds._southWest.lat, mapBounds._southWest.lng, mapBounds._northEast.lat, mapBounds._northEast.lng, detailedOldLocs) && oldData[false] !== undefined) {
            return true; // Map bounds still in the old locs :)
        } else {
            if ((zoomLevel < 14 && reducedDataset === false) && isPolyInBounds(mapBounds._southWest.lat, mapBounds._southWest.lng, mapBounds._northEast.lat, mapBounds._northEast.lng, reducedOldLocs) && oldData[true] !== undefined) {
                return true;
            } else {
                return false;
            }
        }
    }
}

function bringBackTheCachedWaypoints(mapBounds, zoomLevel) {
    if (zoomLevel >= 14 && reducedDataset) {
        reducedDataset = false;
        updateLocsInMemory({
            _southWest: {
                lat: detailedOldLocs.swY,
                lng: detailedOldLocs.swX
            },
            _northEast: {
                lat: detailedOldLocs.neY,
                lng: detailedOldLocs.neX
            }
        }, reducedDataset);
        addWaypointsFromOldData();
    } else {
        if (zoomLevel < 14 && reducedDataset === false) {
            reducedDataset = true;
            updateLocsInMemory({
                _southWest: {
                    lat: reducedOldLocs.swY,
                    lng: reducedOldLocs.swX
                },
                _northEast: {
                    lat: reducedOldLocs.neY,
                    lng: reducedOldLocs.neX
                }
            }, reducedDataset);
            addWaypointsFromOldData();
        }
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
                    isPolyInBounds(mapBounds._southWest.lat, mapBounds._southWest.lng, mapBounds._northEast.lat, mapBounds._northEast.lng, locsLoadedInMemory)
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
    //console.log(url);

    $.get(url, function (data) {
        var unpackData = RJSON.unpack(data);
        geoJsonToShow = {
            "features": unpackData.features,
            "name": unpackData.name,
            "type": unpackData.type
        };
        updateLocsInMemory(newBounds, reducedDataset);
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
    $.get(url, function (data) {
                var unpackData = RJSON.unpack(data);
        geoJsonToShow = {
            "features": unpackData.features,
            "name": unpackData.name,
            "type": unpackData.type
        };

        updateLocsInMemory(latlngBounds, reducedDataset);
        ajouterWaypointALaMap(geoJsonToShow, true);
    });
}
