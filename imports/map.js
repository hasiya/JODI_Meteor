maps = function () {

    load_data("/uk.json", "subunits");

    // if(GoogleMaps.loaded()){
    // var mapDiv = document.getElementById('googleMap');
    // var map = new google.maps.Map(mapDiv, {
    //     center: {lat: 44.540, lng: -78.546},
    //     zoom: 8
    // });
    // var map = new google.maps.Map(d3.select("#googleMap").node(), {
    //     zoom: 8,
    //     center: new google.maps.LatLng(37.76487, -122.41948),
    //     mapTypeId: google.maps.MapTypeId.TERRAIN
    // });


    // GoogleMaps.create({
    //     name: "gMap",
    //     element: document.getElementById('googleMap'),
    //     options: {
    //         center: new google.maps.LatLng(-37.8136, 144.9631),
    //         zoom: 8
    //     }
    // });
    // }


    // GoogleMaps.ready('map', function(map) {
    //     console.log("I'm ready!");
    // });
};


// get the width of the area we're displaying in
var width;
// but we're using the full window height
var height;

// variables for map drawing
var projection, svg, path, g;
var boundaries, units;

function compute_size() {
    var margin = 50;
    var mapDiv = d3.select("#googleMap");
    width = 500;
    height = 600;
    // width = parseInt(d3.select("#googleMap").style("width"));
    // height = window.innerHeight - 2*margin;
}

compute_size();
// initialise the map
init(width, height);


// remove any data when we lose selection of a map unit
function deselect() {
    d3.selectAll(".selected")
        .attr("class", "area");
    // d3.select("#data_table")
    //     .html("");
}


function init(width, height) {

    // pretty boring projection
    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    // create the svg element for drawing onto
    svg = d3.select("#googleMap").append("svg")
        .attr("width", width)
        .attr("height", height);

    // graphics go here
    g = svg.append("g");

    // add a white rectangle as background to enable us to deselect a map selection
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#fff")
        .on('click', deselect);
}


// select a map area
function select(d) {
    // get the id of the selected map area
    var id = "#" + d.id;
    // remove the selected class from any other selected areas
    d3.selectAll(".selected")
        .attr("class", "area");
    // and add it to this area
    d3.select(id)
        .attr("class", "selected area");
    // add the area properties to the data_table section
    // d3.select("#data_table")
    //     .html(create_table(d.properties));
}

// draw our map on the SVG element
function draw(boundaries) {

    projection
        .scale(1)
        .translate([0, 0]);

    // compute the correct bounds and scaling from the topoJSON
    var b = path.bounds(topojson.feature(boundaries, boundaries.objects[units]));
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    // add an area for each feature in the topoJSON
    g.selectAll(".area")
        .data(topojson.feature(boundaries, boundaries.objects[units]).features)
        .enter().append("path")
        .attr("class", "area")
        .attr("id", function (d) {
            return d.id
        })
        // .attr("properties_table", function(d) { return create_table(d.properties)})
        .attr("d", path)
        .on("click", function (d) {
            return select(d)
        });

    // add a boundary between areas
    g.append("path")
        .datum(topojson.mesh(boundaries, boundaries.objects[units], function (a, b) {
            return a !== b
        }))
        .attr('d', path)
        .attr('class', 'boundary');
}

function mapTraffic() {
    var traffic = "http://data.aberdeencity.gov.uk/OpenDataService/TemporaryTrafficOrderReport/json";

    // d3.csv("crime.csv", function (error,data) {
    //     if(error)
    //         return console.log(error);
    //    console.log(data);
    // });

    d3.json("traffic.json", function (error, traff) {
        if (error)
            return console.log(error);
        var reports = traff.RoadClosureReports;


        svg.selectAll(".pin")
            .data(reports)
            .enter().append("circle", ".pin")
            .attr("r", 4)
            .attr("transform", function (r) {
                return "translate(" + projection([
                        r.Longitude,
                        r.Latitude
                    ]) + ")";

            })
            .attr("clicked", false)
            .style("fill", "red").style("fill-opacity", "2");
    })
}

// called to redraw the map - removes map completely and starts from scratch
function redraw() {
    compute_size();
    //width = parseInt(d3.select("#map").style("width"));
    //height = window.innerHeight - margin;

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
    mapTraffic()
}

// loads data from the given file and redraws the map
function load_data(filename, u) {
    // clear any selection
    deselect();

    units = u;
    d3.json(filename, function (error, b) {
        if (error) return console.error(error);
        boundaries = b;
        redraw();
    });
}

// when the window is resized, redraw the map
window.addEventListener('resize', redraw);


