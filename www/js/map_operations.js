/*jslint nomen: true*/
/*global L,$,console, markers, map, ajouterWaypointALaMap*/
var locsLoadedInMemory;

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

function evaluateIfIShouldLoadWaypointsFromApi(mapBounds) {
    "use strict";
    if (isLocsLoadedInMemory()) {
        if ((mapBounds._northEast.lat > locsLoadedInMemory.swX || mapBounds._southWest.lat > locsLoadedInMemory.swY) && (mapBounds._northEast.lng < locsLoadedInMemory.neY || mapBounds._southWest.lng < locsLoadedInMemory.neX)) {
            console.log('Indeed the new bounds is in the area');
            return false;
        } else {
            return true;
        }
    } else {
        return true;
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
        updateLocsInMemory(latlngBounds);
        ajouterWaypointALaMap(geoJsonToShow);
    });
}
