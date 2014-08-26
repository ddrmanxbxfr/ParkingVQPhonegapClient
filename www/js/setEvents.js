/*global $*/
// Ce script change le contenu disponible !
$('#btnInfo').click(function () {
    "use strict";
    $('#main-content').html("<div class=\"center\"><h3>La place pour trouver le meilleur stationnement.</h3><p>Plus de probleme a trouver un stationnement.</p><p>Il suffit de selectionner une option ci-dessous </p></div>");
});

$('#btnAskParking').click(function () {
    "use strict";
    $('#main-content').html('<h3 class="center">Localisation en cours</h3><p class="center">Nous sommes à la recherche de vous avec une paire de loupe.</p>');
});

$('#btnShowMap').click(function () {
    "use strict";
    $('#main-content').html("<div id=\"map\"></div><script>initMap();<\/script>");
});