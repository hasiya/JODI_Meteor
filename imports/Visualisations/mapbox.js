/**
 * Created by Rajitha Hasith on 12/07/2016.
 * The file contains function to create the map visualisations.
 */


/**
 * This function map data location in the world map.
 * Mapbox Gl library is used to create the map. The function returns the instance of the mapboxgl.
 *
 * Doc: https://www.mapbox.com/mapbox-gl-js/api/
 *
 * @param data
 * The data object which contains the data to map.
 *
 * @param header
 * The data property (CSV Header) that need to map.
 *
 * @param isVisOn
 * A bool value to check whether map is drawn or not.
 *
 * @param Data_Source
 * Source of the data set.
 *
 * @param lon
 * longitude column header name.
 *
 * @param lat
 * latitude column header name.
 *
 * @returns {*}
 */
mapbox = function (data, header, isVisOn, Data_Source, lon, lat) {

    var map;

    /**
     * checks if the longitude and latitude values are available
     */
    if (lat && lon) {
        data.forEach(function (d) {
            d.location = {
                lat: +d[lat],
                lon: +d[lon]
            };
        });
    }

    /**
     * create a geoJson object to mark the points in the map.
     */
    var geoJson = createGeoJSON(data, header);

    var svgDiv = document.getElementById('svgMap');
    svgDiv.style.height = "600px";

    /**
     * check whether map is already drawn.
     */
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

/**
 * The function that create the geoJson object from the data and the header column name.
 * @param data
 * @param header
 * @returns {{type: string, data: {type: string, features: Array}}}
 */
function createGeoJSON(data, header) {
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
                title: d[header],
                iconSize: [10, 10]
            }
        };
        geoJsonObj.data.features.push(feature);

    });

    return geoJsonObj;

}

/**
 * this function gets the location data boundary to Zoom in the map to data locations.
 * @param locations
 * @returns {*[]}
 */
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