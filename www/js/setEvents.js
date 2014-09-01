/*global $*/
// Ce script change le contenu disponible !

function templateShowMap() {
    "use strict";
    $('#main-content').html("<div id=\"progress\"><div id=\"progress-bar\"></div></div><div id=\"map\"></div><script>initMap();<\/script>");
}

function showOverlayLegend() {
    "use strict";
    var overlayToShow, cl;
    overlayToShow = document.getElementById('overlay_legend');
    cl = overlayToShow.classList;
    if (cl.contains('off')) {
        cl.remove('off');
    }
}

$('#btnLegend').click(function () {
    "use strict";
    showOverlayLegend();
});

$('#btnShowMap').click(function () {
    "use strict";
    templateShowMap();
});

$('#btnLegendClose').click(function() {
    "use strict";
    alert('closing legend');
});
