/**
 * Created by RajithaHasith on 12/07/2016.
 */

TOKEN = "pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ";
var width, height;

var data;
var lat_h;
var lon_h;
var count_h;
var count_data;
var headerVals;
var colours;
// var projection
var svg, path, g;
var map, dots;


mapbox = function (dataObj, countHeader, lon, lat) {

    // Mapbox.load();

    data = dataObj;
    count_h = countHeader;
    lon_h = lon;
    lat_h = lat;
    headerVals = unique(data.map(function (d) {
        return d[count_h];
    }));

    if (lat_h && lon_h) {
        data.forEach(function (d) {
            d.location = {
                lat: d[lat_h],
                lon: d[lon_h]
            };
        });
    }
    if (lat_h && lon_h) {
        data.forEach(function (d) {
            d.location = {
                lat: d[lat_h],
                lon: d[lon_h]
            };
        });
    }
    // if (count_h) {
    //     count_data = d3.nest()
    //         .key(function (d) {
    //             return d[count_h]
    //         })
    //         .entries(data);
    // }

    compute_size();

    var svgDiv = document.getElementById('svgMap');
    // svgDiv.style.width = width;
    svgDiv.style.height = height;

    // if (Mapbox.loaded()) {
    //     L.mapbox.accessToken = TOKEN;
    //     // map = L.mapbox.map('svgMap', 'mapbox.streets')
    //     //     .setView([55, -2], 5);
    //     map = L.map('svgMap','mapbox.streets')
    //         .setView([55, -2], 5);
    //
    // }

    mapboxgl.accessToken = "pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ";

    map = new mapboxgl.Map({
        container: 'svgMap', // container id
        style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
        center: [-2, 55], // starting position
        zoom: 4 // starting zoom
    });

    // map.scrollZoom.disable()
    map.dragRotate.disable();
    // map.addControl(new mapboxgl.Navigation({
    //     position: 'top-left'
    // }));

    // L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ').addTo(map);
    //
    //
    // svg =d3.select(map.getPanes().overlayPane).append("svg");
    // mapLocations();

    var container = map.getCanvasContainer();
    svg = d3.select(container).append('svg');
    svg.attr('class', 'map');

    mapLocations();
    legend();

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

function unique(x) {
    return x.reverse().filter(function (e, i, x) {
        return x.indexOf(e, i + 1) === -1;
    }).reverse();
}

function mapLocations() {
    colours = d3.scale.category10();


    dots = svg.selectAll("circle.dot")
        .data(data);

    dots.enter().append("circle").classed('dot', true)
        .attr("r", 1)
        .style("fill", function (d) {
            return colours(d[count_h]);
        })
        .style("fill-opacity", "2")
        .transition().duration(1000)
        .attr("r", 3);


    // var key = svg.selectAll(".key")
    //     .data(count_data)
    //     .enter().append("g")
    //     .attr("class", "key");
    //
    // dots = key.selectAll(".pin")
    //     .data(function (d) {
    //         return d.values;
    //     })
    //     .enter().append("circle", ".pin")
    //     .attr("r", 1)
    //     .style("fill", function (d) {
    //         return colours(d[count_h]);
    //     })
    //     .style("fill-opacity", "2")
    //     .transition().duration(1000)
    //     .attr("r", 6);


    render();

    function render() {
        dots.attr({
            cx: function (d) {
                return project(d).x
            },
            cy: function (d) {
                return project(d).y
            }
        });
    }

    map.on("viewreset", function () {
        render()
    });

    map.on("move", function () {
        render()
    });

    // })
    // .attr("transform", function (d) {
    //
    //     if (d.hasOwnProperty("location")) {
    //         return "translate(" + project(d) + ")";
    //     }
    // });

}

function legend() {
    // var legend = svg.selectAll(".legend")
    //     .data(headerVals.slice().reverse())
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function (d, i) {
    //         return "translate(0," + i * 20 + ")";
    //     });
    //
    // legend.append("rect")
    //     .attr("x", width - 7)
    //     .attr("width", 18)
    //     .attr("height", 18)
    //     .style("fill", colours);
    //
    // legend.append("text")
    //     .attr("x", width - 13)
    //     .attr("y", 9)
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "end")
    //     .text(function (d) {
    //         return d;
    //     });

    var chartbody = d3.select('#chartBody');

    var legendDiv = document.getElementById('map_legend');
    if (!legendDiv) {
        legendDiv = chartbody.append('div');
        legendDiv.attr('class', 'row svgmap');
        legendDiv.attr('id', 'map_legend');
    } else {
        legendDiv = d3.select('#map_legend');
        legendDiv.html("");
    }

    var legendSvg = legendDiv.append('svg');
    legendSvg.attr('class', 'col-md-12');

    var legend = legendSvg.selectAll(".legend")
        .data(headerVals.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", 5)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colours);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) {
            return d;
        });

}

function project(d) {
    return map.project(new mapboxgl.LngLat(+d.location.lon, +d.location.lat));
}

function render() {
    dots.attr({
        cx: function (d) {
            return project(d).x
        },
        cy: function (d) {
            return project(d).y
        }
    });
}