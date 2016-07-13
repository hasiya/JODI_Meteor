/**
 * Created by RajithaHasith on 12/07/2016.
 */

TOKEN = "pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ";
var width, height;
mapbox = function () {

    // Mapbox.load();

    compute_size();

    var svg = document.getElementById('svgMap');
    svg.style.width = width;
    svg.style.height = height;

    if (Mapbox.loaded()) {
        L.mapbox.accessToken = TOKEN;
        var map = L.mapbox.map('svgMap', 'mapbox.streets')
            .setView([55, -2], 5);
    }

};

function compute_size() {
    var margin = 50;
    var mapDiv = document.getElementById("svgMap");

    if (!mapDiv) {
        width = "500px";
    }
    else {
        width = document.getElementById("svgMap").offsetWidth;
    }
    height = "600px";
    // height = window.innerHeight - 2*margin;
}
