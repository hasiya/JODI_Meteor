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
var headers_colors = [];


mapbox = function (dataObj, countHeader, isVisOn, lon, lat) {

    // Mapbox.load();

    if (svg) {
        var tmpSvg;
        svg.html("");
        svg = tmpSvg;

    }
    data = dataObj;
    count_h = countHeader;
    lon_h = lon;
    lat_h = lat;
    headerVals = unique(data.map(function (d) {
        return d[count_h];
    }));

    var colors = getcolours(headerVals.length);

    var c = 0;
    headerVals.forEach(function (h) {
        headers_colors.push({
            header: h,
            color: colors[c]
        });
        c++;
    });



    if (lat_h && lon_h) {
        data.forEach(function (d) {
            d.location = {
                lat: +d[lat_h],
                lon: +d[lon_h]
            };
        });
    }

    compute_size();

    var svgDiv = document.getElementById('svgMap');
    // svgDiv.style.width = width;
    svgDiv.style.height = height;

    if (!isVisOn) {
        mapboxgl.accessToken = "pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ";

        map = new mapboxgl.Map({
            container: 'svgMap', // container id
            style: 'mapbox://styles/mapbox/streets-v9' //stylesheet location
        });

        // map.scrollZoom.disable()
        map.dragRotate.disable();
    }


    if (!svg) {
        var container = map.getCanvasContainer();
        svg = d3.select(container).append('svg');
        svg.attr('class', 'map');
    }
    else {
        svg.html("")
    }


    var locationList = [];

    data.forEach(function (d) {
        locationList.push(d.location)
    });

    // var dataLocMidpoint = getLocationMidpoint(locationList);
    // var dataLocMidpoint = avgLoc(locationList);
    // map.setCenter([dataLocMidpoint.lon, dataLocMidpoint.lat]);
    var mapBounds = getBounds(locationList);
    map.fitBounds(mapBounds);

    mapLocations();
    legend();

};

function getcolours(count) {
    var i = 0;
    var colours = [];

    while (i < count) {
        var color = randomColor({
            luminosity: 'bright'
        });
        while (colours.includes(color)) {
            color = randomColor({
                luminosity: 'bright'
            });

        }
        colours.push(color);


        i++
    }

    return colours;
}

function getHeaderColor(header) {
    var h_color;
    headers_colors.forEach(function (hc) {
        if (hc.header == header) {
            h_color = hc.color;
        }
    });

    return h_color;
}

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
            return getHeaderColor(d[count_h]);
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
        .style("fill", function (d) {
            return getHeaderColor(d);
        });

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

function getLocationMidpoint(locations) {
    var cartesianCoords = [];
    var latLon_r = [];
    var X = 0, Y = 0, Z = 0;
    locations.forEach(function (l) {
        var lat_r = l.lat * Math.PI / 180;
        var lon_r = l.lon * Math.PI / 180;

        latLon_r.push({
            lat_r: lat_r,
            lon_r: lon_r
        });

        var x, y, z;

        x = Math.cos(lat_r) * Math.cos(lon_r);
        y = Math.cos(lat_r) * Math.sin(lon_r);
        z = Math.sin(lat_r);

        var coords = {
            x: x,
            y: y,
            z: z
        };

        cartesianCoords.push(coords);
    });

    var totWeight = locations.length;

    cartesianCoords.forEach(function (c) {
        X += (c.x);
        Z += (c.z);
        Y += (c.x);
    });

    X = X / totWeight;
    Y = Y / totWeight;
    Z = Z / totWeight;

    var Lon = Math.atan2(X, Y);
    var Hyp = Math.sqrt(X * X + Y * Y);
    var Lat = Math.atan2(Hyp, Z);

    var center_lat = Lat * 180 / Math.PI;
    var center_lon = Lon * 180 / Math.PI;

    var lat = 0, lon = 0;
    latLon_r.forEach(function (l) {
        lat += l.lat_r;
        lon += l.lon_r;
    });

    lat = lat / totWeight;
    lon = lon / totWeight;

    if (lon < -180) {
        lon = lon - 360;
    }
    if (lon > 180) {
        lon = lon + 360;
    }
    //
    // return {
    //     lat: center_lat,
    //     lon: center_lon
    // };

    return {
        lat: lat,
        lon: lon
    };
}

function avgLoc(locations) {
    var totLon = 0, totLat = 0;

    locations.forEach(function (l) {
        totLat += l.lat;
        totLon += l.lon;
    });

    var latAvg = totLat / locations.length;
    var lonAvg = totLon / locations.length;

    return {
        lat: latAvg,
        lon: lonAvg
    };

}

function getBounds(locations) {
    var lons = [];
    var lats = [];

    locations.forEach(function (l) {
        lats.push(l.lat);
        lons.push(l.lon);
    });
    var maxLat = Math.max(...lats);
    var maxLon = Math.max(...lons);
    var minLat = Math.min(...lats);
    var minLon = Math.min(...lons);

    var margine = 0.019;
    return [[minLon - margine, minLat - margine], [maxLon + margine, maxLat + margine]];
}