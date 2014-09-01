/*global $*/
// Ce script change le contenu disponible !

function templateShowMap() {
    "use strict";
    $('#main-content').html("<div id=\"progress\"><div id=\"progress-bar\"></div></div><div id=\"map\"></div><script>initMap();<\/script>");
}

function templateAskParking() {
    "use strict";
    $('#main-content').html('<h3 class="center">Légende</h3><p class="center">Ceci est la liste des icones utilisé sur la carte pour représenter les différents éléments de la ville.</p>');
}

$('#btnAskParking').click(function () {
    "use strict";
    templateAskParking();
});

$('#btnShowMap').click(function () {
    "use strict";
    templateShowMap();
});
