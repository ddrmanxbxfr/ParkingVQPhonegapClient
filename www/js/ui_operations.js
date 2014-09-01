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