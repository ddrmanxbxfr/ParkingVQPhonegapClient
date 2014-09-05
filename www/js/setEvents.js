/*global $, showOverlay, hideOverlay, locateMeOnMap*/
// Ce script change le contenu disponible !

function templateShowMap() {
    "use strict";
    $('#main-content').html("<div id=\"progress\"><div id=\"progress-bar\"></div></div><div id=\"map\"></div><script>initMap();<\/script>");
}

$('#btnLegend').click(function () {
    "use strict";
    showOverlay("overlay_legend");
});

$('#btnShowMap').click(function () {
    "use strict";
    locateMeOnMap();
});

$('#btnLegendClose').click(function () {
    "use strict";
    hideOverlay("overlay_legend");
});
