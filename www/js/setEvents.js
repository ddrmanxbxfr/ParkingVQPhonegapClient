/*
This file is part of ParkingVQPhonegapClient.

ParkingVQPhonegapClient is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ParkingVQPhonegapClient is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ParkingVQPhonegapClient.  If not, see <http://www.gnu.org/licenses/>.
*/
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
