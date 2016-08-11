/**
 * Created by Rajitha Hasith on 28/07/2016.
 * This file controls all the client side actions of the 'load_data.html' file (client/views/load_data.html)
 * this file contains the functions that uses in the load_data.html file, as well as the Meteor Template Helpers
 * functions and Events functions.
 */

import "../../imports/functions";

/**
 * This variable is creating a new instance of 'X2JS' library, that uses to convert string in to JSON object.
 */
var xml_convert = new X2JS();
/**
 * This variable is use to store the data source that retrieve from the elasticsearch.
 * @type {Array}
 */
var hit_source = [];
/**
 * This is a Tracker variable that will track the 'hit_source' array variable. this variable helps to trigger an action
 * when the 'hit_source' array variable changes.
 *
 * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
 *
 * @type {Tracker.Dependency}
 */
var hit_sourceDep = new Tracker.Dependency();
/**
 * This is an object variable, that will store the elasticsearch document when retrieving a document.
 * @type {{}}
 */
var loadDoc = {};
/**
 * This is a Tracker variable that will track the 'loadDoc' object variable. This variable helps to trigger an action
 * when the 'loadDoc' object variable changes.
 *
 * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
 *
 * @type {Tracker.Dependency}
 */
var load_doc_dep = new Tracker.Dependency();

/**
 * This function resets the header configuration panel in the load_data page.
 * then the user load the data once and if user wants to load a different data set, this function resets the header
 * configuration panel for the second data set
 */
function resetPanel() {

    var textElems = document.getElementsByName("headerText");
    var editBtnElems = document.getElementsByName("headerEditBtn");
    var selectElems = document.getElementsByName("headerType");
    var checkElem = document.getElementsByName("headerCheck");
    var remvBtnElems = document.getElementsByName("headerremvbtn");

    if (textElems) {
        Array.from(textElems).forEach(function (e) {
            e.readOnly = true;
        });
    }
    if (editBtnElems) {
        Array.from(editBtnElems).forEach(function (e) {
            e.innerHTML = "<span class='glyphicon glyphicon-edit'></span>";
            e.className = "csvHeaderEdit btn btn-default btn-sm";
            e.style.display = "inline";
        });
    }
    if (selectElems) {
        Array.from(selectElems).forEach(function (e) {
            e.disabled = false;
        });
    }
    if (checkElem) {
        Array.from(checkElem).forEach(function (e) {
            e.disabled = false;
        });
    }
    if (remvBtnElems) {
        Array.from(remvBtnElems).forEach(function (e) {
            e.style.display = "inline";
        });
    }
}

/**
 * this function add a count property to the Data object that is get from the API.
 * the 'setUPCount()' function is called in this file in 'getAPIdata()' function.
 */
function setUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
    });
}

/**
 * Some API does not allow JavaScript do API calls to servers with 'access-control-allow-origin': no.
 * Because of this, the javascript sends a ajax call to the server side (flask) of system.
 * This function get the api data, by calling to flask server to send the API request and get data through the python
 * server.
 * @param url
 * @param data_path
 * @param apiType
 */
function getAPIdata(url, data_path, apiType) {
    var j_data;
    var dataset;
    $.ajax({
        method: "GET",
        url: "http://" + pythonServer + "/get_api_data",
        data: url,
        // contentType: 'application/json',
        success: function (data) {
            // document.getElementById("searchList").style.display = 'none';
            // // document.getElementById("visual_all").style.display = "inline";
            // document.getElementById("panel").style.display = "none";
            // document.getElementById('viewDataSetInfo').style.display = 'inline';
            if (apiType == 'json') {
                j_data = JSON.parse(data);
                dataset = get_data_api_obj(j_data, data_path)

            }
            else if (apiType == 'xml') {
                j_data = xml_convert.xml_str2json(data);
                dataset = get_data_api_obj(j_data, data_path)
            }

            if (dataset) {
                console.log(dataset);

                CSV_Data = dataset;
                CSV_keys = Object.keys(dataset[0]);

                setUpCount();
                csv_data_dep.changed();
                document.getElementById("panel").style.display = "inline";
                setUpPanel();
                resetPanel();
            }
            else {
                // Message.html("Something went wrong.");
            }
        }

    });
}

/**
 * The load_data template helpers function. These helper functions send that send data to the template.
 *
 * Doc: https://docs.meteor.com/api/templates.html#Template-helpers
 */
Template.load_data.helpers({
    /**
     * This function returns the hit_source array to the load data template. because of the 'hit_sourceDep' Tracker
     * variable every time the hit_source array changes this function triggers.
     * @returns {Array}
     */
    getSearchData: function () {
        hit_sourceDep.depend();
        return hit_source;
    },

    /**
     * This function returns the loadDoc object to the load data template. Because of the 'load_doc_dep' Tracker
     * variable every time the loadDoc object updates this function triggers.
     * @returns {{}}
     */
    getDoc: function () {
        load_doc_dep.depend();
        return loadDoc;
    },
    /**
     * this function returns the CSV_Data object to the load data template. csv_data_dep Tracker variable depends on
     * the CSV_Data variable, so when ever the CSV_Data variable changes this function returns the CSV_Data to the
     * template. in this call the function is called in meteor 'reactiveTable' as a collection.
     * @returns {*|Array}
     */
    getData: function () {
        csv_data_dep.depend();
        return CSV_Data;
    }
});

/**
 * This is a meteor function that registers functions that will call when the template is rendering to the DOM.
 * you can also update variables in this function.
 *
 * DOc: http://docs.meteor.com/api/templates.html#Template-onRendered
 */
Template.load_data.onRendered(function () {
    /**
     * In this render function, the hit_source array variable is initialising with an empty array. This is same an
     * resetting the array.
     * @type {Array}
     */
    hit_source = [];

    /**
     * Triggering the changed status in the hit_sourceDep Tracker variable. Which will trigger the 'getSearchData'
     * helper function.
     * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
     */
    hit_sourceDep.changed();
});

/**
 * The load_data event functions. These functions specify event handler for this template.
 */
Template.load_data.events({

    /**
     * This is the key up function for the search textbox. Every key press up will trigger this function.
     * in this function I do an Ajax call to the server side to search in elasticsearch.
     * @param e
     */
    "keyup .inputSearch": function (e) {
        e.preventDefault();
        console.log(e);
        var target = e.currentTarget;
        var searchTerm = target.value;
        var hits = [];
        if (/\S/.test(searchTerm)) {
            $.ajax({
                method: "GET",
                url: "http://" + pythonServer + "/search_dataset/" + searchTerm.trim(),
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
                        document.getElementById("panel").style.display = "none";
                        document.getElementById("visualMenu").style.display = "none";
                        document.getElementById("charts").style.display = "none";
                        document.getElementById("exportChart").style.display = "none";
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

    /**
     * The Show All button on click event function.
     * the function calls the python backend to get all the data sets from the elasticsearch.
     * @param e
     */
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
                    document.getElementById("panel").style.display = "none";
                    document.getElementById("visualMenu").style.display = "none";
                    document.getElementById("charts").style.display = "none";
                    document.getElementById("exportChart").style.display = "none";
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

    /**
     * The Load Data button click event function.
     * The function sends and GET request to retrieve a specific data set from the elasticsearch.
     * @param e
     */
    "click .loadData": function (e) {
        var elem = e.currentTarget;
        var dataset_name = elem.value;

        document.getElementById("searchList").style.display = 'none';
        // document.getElementById("visual_all").style.display = "inline";
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
                    document.getElementById("searchList").style.display = 'none';
                    // document.getElementById("visual_all").style.display = "inline";
                    document.getElementById("panel").style.display = "none";
                    document.getElementById('viewDataSetInfo').style.display = 'inline';
                    CSV_keys = loadDoc['headers'];
                    CSV_Data = loadDoc['dataset'];
                    document.getElementById("panel").style.display = "inline";

                    setUpPanel();
                    resetPanel();
                }
                // csv_key_dep.changed();
                Data_Source = loadDoc["data_source"];

                console.log(CSV_Data);
            }
        });
    },

    /**
     * The View Data button click event function.
     * The function call the server to get data from the elasticsearch.
     * @param e
     */
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

    /**
     * The Delete data button on click event function.
     * This function sends a ajax call to delete the data set from the elasticsearch.
     * @param e
     */
    "click .deleteData": function (e) {
        e.preventDefault();
        var elem = e.currentTarget;
        var datasetID = elem.value;
        var datasetContainer = document.getElementById(datasetID.trim().replace(/\s/g, ''));
        var sure_delete = confirm("Are your sure, you want to delete '" + datasetID + "' data set?");
        if (sure_delete) {
            $.ajax({
                url: "http://" + pythonServer + "/delete_dataset/" + datasetID,
                success: function (data) {
                    datasetContainer.style.display = 'none';
                    alert(data["message"]);
                }
            });
        }
        else {
            console.log(sure_delete)
        }
    }
});