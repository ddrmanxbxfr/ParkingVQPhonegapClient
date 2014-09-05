/*global $ */
function showOverlay(overlayName) {
    "use strict";
    var overlayToShow, cl;
    overlayToShow = document.getElementById(overlayName);
    cl = overlayToShow.classList;
    if (cl.contains('off')) {
        cl.remove('off');
    }
}

function hideOverlay(overlayName) {
    "use strict";
    var overlayToShow, cl;
    overlayToShow = document.getElementById(overlayName);
    cl = overlayToShow.classList;
    cl.add('off');
}

function configurerCssMap() {
    "use strict";
    $("#map").height($(window).height() - $("#titleTopBar").height()).width($(window).width());
}

function doOnOrientationChange() {
    "use strict";
    switch (window.orientation) {
    case -90:
    case 90:
        // This is landscape mode
        configurerCssMap();
        break;
    default:
        // This is portrait mode
        configurerCssMap();
        break;
    }
}
