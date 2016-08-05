/**
 * Created by RajithaHasith on 28/07/2016.
 */
var xml_convert = new X2JS();


var hit_source = [];
var hit_sourceDep = new Tracker.Dependency();

var loadDoc = {};
var load_doc_dep = new Tracker.Dependency();


function getDatasetHeaders(datset) {
    var headers = [];
    for (var prop in datset[0]) {
        headers.push(prop)
    }
    return headers;
}
function setUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
    });
}
function get_api_Data(api_data, data_path) {
    // if(api_type == 'json'){
    var path = data_path.split('/');
    var data = api_data;

    path.forEach(function (p) {
        data = data[p];
    });

    return data;
    // }
}


function getAPIdata(url, data_path, apiType) {
    var j_data;
    var dataset;
    $.ajax({
        method: "GET",
        url: "http://" + pythonServer + "/get_api_data",
        data: url,
        // contentType: 'application/json',
        success: function (data) {
            if (apiType == 'json') {
                j_data = JSON.parse(data);
                dataset = get_api_Data(j_data, data_path)

            }
            else if (apiType == 'xml') {
                j_data = xml_convert.xml_str2json(data);
                dataset = get_api_Data(j_data, data_path)
            }

            if (dataset) {
                console.log(dataset);

                CSV_Data = dataset;
                CSV_keys = Object.keys(dataset[0]);

                setUpCount();
                csv_data_dep.changed();
                document.getElementById("panel").style.display = "inline";
                setUpPanel();

                // setUpPanel();
            }
            else {
                // Message.html("Something went wrong.");
            }
        }

    });
}
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

    "click .showAll": function (e) {
        e.preventDefault();
        var hits = [];
        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_all_dataset",
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
            }
        });
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

                // csv_data_dep.changed();
                if (loadDoc["is_api"]) {
                    var url = loadDoc["APIurl"];
                    var url_dataPath = loadDoc["url_dataset_path"];
                    var apiType = loadDoc["api_type"];
                    // CSV_keys = getDatasetHeaders(CSV_keys)
                    getAPIdata(url, url_dataPath, apiType)
                }
                else {
                    CSV_keys = loadDoc['headers'];
                    CSV_Data = loadDoc['dataset'];
                    document.getElementById("panel").style.display = "inline";
                    setUpPanel();
                }
                // csv_key_dep.changed();
                Data_Source = loadDoc["data_source"];

                console.log(CSV_Data);
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

                if (doc["is_api"]) {
                    var url = doc["APIurl"];
                    var url_dataPath = doc["url_dataset_path"];
                    var apiType = doc["api_type"];
                    // CSV_keys = getDatasetHeaders(CSV_keys)
                    getAPIdata(url, url_dataPath, apiType)
                }
                else {
                    CSV_keys = doc['headers'];
                    CSV_Data = doc['dataset'];
                }

                console.log(doc);
                // CSV_Data = doc['dataset'];
                Data_Source = doc["data_source"];
                $('#viewDataModal').modal('show');
                csv_data_dep.changed();


                // createSearchDataset(hit_source);
            }
        });
    },

    "click .deleteData": function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        var datasetID = elem.value;
        var sure_delete = confirm("Are your sure, you want to delete '" + datasetID + "' data set?");
        if (sure_delete) {
            $.ajax({
                url: "http://" + pythonServer + "/delete_dataset/" + datasetID,
                success: function (data) {
                    alert(data["message"]);
                }
            });
        }
        else {
            console.log(sure_delete)
        }
    }
});