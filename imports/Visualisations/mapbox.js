/**
 * Created by Rajitha Hasith on 12/07/2016.
 *
 */

var width, height;
var data;
var lat_h;
var lon_h;
var count_h;
var map;


mapbox = function (dataObj, countHeader, isVisOn, Data_Source, lon, lat) {

    data = dataObj;
    count_h = countHeader;
    lon_h = lon;
    lat_h = lat;

    if (lat_h && lon_h) {
        data.forEach(function (d) {
            d.location = {
                lat: +d[lat_h],
                lon: +d[lon_h]
            };
        });
    }

    var geoJson = createGeoJSON(data);

    var svgDiv = document.getElementById('svgMap');
    svgDiv.style.height = "600px";

    if (!isVisOn) {
        mapboxgl.accessToken = "pk.eyJ1IjoiaGFzaXlhIiwiYSI6ImNpcWprZHphODBhbGhmbm5lZDJ4cXM0aDQifQ.QGJsxbUoJ_puG6JliOILiQ";

        map = new mapboxgl.Map({
            container: 'svgMap', // container id
            style: 'mapbox://styles/mapbox/basic-v9', //stylesheet location
            // hash: true,
            preserveDrawingBuffer: true
        });

        // map.scrollZoom.disable()
        map.dragRotate.disable();
    }

    var mapSource = map.getSource("points");
    var mapLayer = map.getLayer("points");

    if (mapSource && mapLayer) {
        map.removeSource("points");
        map.removeLayer("points");

        map.addSource("points", geoJson);
        map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": "points",
            "layout": {
                "icon-image": "{icon}",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        })
    }

    map.on('load', function () {
        map.addSource("points", geoJson);
        map.addLayer({
            "id": "points",
            "type": "symbol",
            "source": "points",
            "layout": {
                "icon-image": "{icon}",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        })
    });

    var locationList = [];

    data.forEach(function (d) {
        locationList.push(d.location)
    });

    var mapBounds = getBounds(locationList);
    map.fitBounds(mapBounds);

    return map;

};

function createGeoJSON(data) {
    var geoJsonObj = {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: []
        }
    };

    data.forEach(function (d) {
        var feature = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [d.location.lon, d.location.lat]

            },
            properties: {
                icon: "circle-11",
                title: d[count_h],
                iconSize: [10, 10]
            }
        };
        geoJsonObj.data.features.push(feature);

    });

    return geoJsonObj;

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