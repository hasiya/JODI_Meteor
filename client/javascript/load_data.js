/**
 * Created by RajithaHasith on 28/07/2016.
 */
var hit_source = [];
var hit_sourceDep = new Tracker.Dependency();

var loadDoc = {};
var load_doc_dep = new Tracker.Dependency();



function setUpPanel() {
    headerValues = [];

    CSV_keys.forEach(function (k) {

        var keyItem = {
            "originalVal": k,
            "presentVal": k,
            "type": "string",
            "deleted": false,
            "valCount": {}
        };

        if (k.toLowerCase() == "longitude") {
            var test = document.getElementById("type_" + k);
            // document.getElementById("type_" + k).value = "lon";
            keyItem['type'] = 'lon';
        }
        else if (k.toLowerCase() == "latitude") {
            // document.getElementById("type_" + k).value = "lat";
            keyItem['type'] = 'lat';

        }
        else {
            var propertiesArray = CSV_Data.map(function (d) {
                return d[k];
            });

            var testEmptyArray = [];

            propertiesArray.forEach(function (p) {
                if (p === "") {
                    testEmptyArray.push(null);
                }
                else {
                    testEmptyArray.push(p);
                }
            });


            if (!isArrayNull(testEmptyArray)) {
                var isNumbers = (!propertiesArray.some(isNaN));

                if (isNumbers) {
                    // document.getElementById("type_" + k).value = "number";
                    keyItem['type'] = 'number';

                }
            }
        }

        headerValues.push(keyItem);
        headers_dep.changed();
        var panelDoneBtn = document.getElementById('panelDone');
        panelDoneBtn.className = "pull-right btn-success btn PanelDone";
        panelDoneBtn.innerHTML = "Done";

    });
}


Template.load_data.helpers({
    getSearchData: function () {
        hit_sourceDep.depend();
        return hit_source;
    },

    getHeaders: function () {
        headers_dep.depend();
        return headerValues;
    },
    getDoc: function () {
        load_doc_dep.depend();
        return loadDoc;
    },
    getData: function () {

        csv_data_dep.depend();
        return CSV_Data;
    }
});
// Template.load_data.Test = function () {
//     hit_sourceDep.depend();
//     return hit_source
// };

Template.load_data.onRendered(function () {
    hit_source = [];
    hit_sourceDep.changed();
});

Template.registerHelper("dateTime", function (dateTime) {
    // var date = new Date(dateTime);

    return moment(dateTime).format('DD-MM-YYYY, HH:mm');
});


Template.registerHelper("getHeaders", function (dateTime) {
    // var date = new Date(dateTime);

    return !!CSV_keys;
    // setUpPanel();
});

Template.load_data.events({
    "keyup .inputSearch": function (e) {
        e.preventDefault();
        console.log(e);
        var target = e.currentTarget;
        var searchTerm = target.value;
        var hits = [];
        if (searchTerm) {
            $.ajax({
                method: "GET",
                url: "http://" + pythonServer + "/search_dataset/" + searchTerm,
                success: function (data) {
                    hits = data;
                    console.log(hits);

                    if (hits.length > 0) {
                        hit_source = [];
                        hits.forEach(function (hit) {
                            hit_source.push(hit['_source']);
                            hit_sourceDep.changed();
                        });

                        document.getElementById("searchList").style.display = 'inline';
                        document.getElementById("visual_all").style.display = "none";
                        document.getElementById('viewDataSetInfo').style.display = 'none';

                    }
                    else {
                        document.getElementById("searchList").style.display = 'none';
                        // document.getElementById("visual_all").style.display = "none";
                        document.getElementById('viewDataSetInfo').style.display = 'none';
                        hit_source = [];
                        hit_sourceDep.changed();
                        document.getElementById("panel").style.display = "none";
                        document.getElementById("visualMenu").style.display = "none";
                        document.getElementById("charts").style.display = "none";
                        document.getElementById("exportChart").style.display = "none";

                    }
                    console.log(hit_source);
                    // createSearchDataset(hit_source);
                }
            });

            // console.log(hits)
        }
        else {
            document.getElementById("searchList").style.display = 'none';
            // document.getElementById("visual_all").style.display = "none";
            document.getElementById('viewDataSetInfo').style.display = 'none';

            hit_source = [];
            hit_sourceDep.changed();
            document.getElementById("panel").style.display = "none";
            document.getElementById("visualMenu").style.display = "none";
            document.getElementById("charts").style.display = "none";
            document.getElementById("exportChart").style.display = "none";
        }

    },

    "click .loadData": function (e) {
        var elem = e.currentTarget;
        var dataset_name = elem.value;

        document.getElementById("searchList").style.display = 'none';
        document.getElementById("visual_all").style.display = "inline";
        document.getElementById('viewDataSetInfo').style.display = 'inline';



        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_dataset/" + dataset_name,
            success: function (data) {
                loadDoc = data;
                load_doc_dep.changed();
                console.log(loadDoc);
                CSV_Data = loadDoc['dataset'];
                Data_Source = loadDoc["data_source"];
                // csv_data_dep.changed();

                CSV_keys = loadDoc['headers'];
                // csv_key_dep.changed();


                console.log(CSV_Data);
                document.getElementById("panel").style.display = "inline";
                setUpPanel();

                // createSearchDataset(hit_source);
            }
        });
    },

    "click .viewData": function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        var dataset_name = elem.value;

        var doc = {};

        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_dataset/" + dataset_name,
            success: function (data) {
                doc = data;
                console.log(doc);
                CSV_Data = doc['dataset'];
                Data_Source = loadDoc["data_source"];
                csv_data_dep.changed();
                $('#viewDataModal').modal('show');


                // createSearchDataset(hit_source);
            }
        });

    }

});