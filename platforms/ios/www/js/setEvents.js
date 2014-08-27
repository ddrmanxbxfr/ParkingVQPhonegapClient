/*global $*/
// Ce script change le contenu disponible !

function templateBtnInfo() {
    "use strict";
    $('#main-content').html("<div class=\"center\"><h3>La place pour trouver le meilleur stationnement.</h3><p>Plus de probleme a trouver un stationnement.</p><p>Il suffit de selectionner une option ci-dessous </p></div>");
}

function templateShowMap() {
    "use strict";
    $('#main-content').html("<div id=\"map\"></div><script>initMap();<\/script>");
}

function templateAskParking() {
    "use strict";
    $('#main-content').html('<h3 class="center">Légende</h3><p class="center">Ceci est la liste des icones utilisé sur la carte pour représenter les différents éléments de la ville.</p>');
}

$('#btnInfo').click(function () {
    "use strict";
    templateBtnInfo();
});

$('#btnAskParking').click(function () {
    "use strict";
    templateAskParking();
});

$('#btnShowMap').click(function () {
    "use strict";
    templateShowMap();
});