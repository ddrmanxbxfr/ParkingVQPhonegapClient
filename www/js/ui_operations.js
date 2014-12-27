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
    configurerCssMap();
}
