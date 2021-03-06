/**
 * Created by Rajitha Hasith on 03/08/2016.
 * This file controls all the client side actions of the 'tab_api.html' file (client/views/tab_api.html)
 * this file contains the functions that uses in the tab_api.html file, as well as the Meteor Template Helpers
 * functions and Events functions.
 */

/**
 * importing the functions file in the /imports directory.
 */
import "../../imports/functions";

/**
 * this variable is to keep track of the API type that that user is dealing with.
 */
var apiType;
/**
 * This variable is creating a new instance of 'X2JS' library, that uses to convert string in to JSON object.
 */
var xml_conv = new X2JS();
/**
 * this is Message variable that takes the Message label element.
 * @type {any}
 */
var Message;
/**
 * This string variable store the server return message to check.
 * @type {string}
 */
var dataNameAlreadyExist = "Data set name already exist";
/**
 * This string variable store the server return message to check.
 * @type {string}
 */
var dataStored = "Successfully data added to elasticsearch";

/**
 * this function add a count property with value of 1 to the Data object that is get from the API.
 * This added property value is used in creating visualisations.
 * the 'setUPCount()' function is called in this file in Get Api button click event function.
 */
function setUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
    });
}

Template.tab_api.onRendered(function () {
    Message = $("#api_message");
});

/**
 * This function calls an ajax call with a POST request to the server to store the api information data in the
 * elasticsearch.
 * @param dataInfo
 * @param url
 * @param data_path
 * @param api_type
 */
function insertData(dataInfo, url, data_path, api_type) {
    var headersObj = [];
    CSV_keys.forEach(function (key) {
        headersObj.push(key);
    });
    var requestObject = {
        datasetInfo: dataInfo,
        apiUrl: url,
        dataPath: data_path,
        apiType: api_type,
        apiData: true
    };

    var elem = document.getElementById("storeDataBtn");
    Message.html("");

    $.ajax({
        method: "POST",
        url: "http://" + pythonServer + "/insert_api",
        data: JSON.stringify(requestObject),
        dataType: "json",
        success: function (data) {

            if (data.message == dataNameAlreadyExist) {
                Message.html("There is another data set under this name. Please change the data set name. ");
                elem.disabled = false;
            }
            else if (data.message == dataStored) {
                document.getElementById("datasetStorePanel").style.display = "none";
                // document.getElementById("panel").style.display = "inline";
                // elem.disabled = false;
                var apiDataName = document.getElementById("apiDataName").value = "";
                Message.className = "pull-left label-success label";
                Message.html("Data Stored in Database...")
            }
            console.log(data);
        }
    });
}


/**
 * The tab_api event functions. These functions specify event handler for this template.
 */
Template.tab_api.events({
    /**
     * This is the event function for 'Get Data' button in 'get_api' template. the function send and ajax the server do
     * the api call.
     * @param e
     */
    "click .getApi": function (e) {
        e.preventDefault();
        var url = document.getElementById("apiUrl").value;
        var data_path = document.getElementById("apiDataPath").value;

        var j_data;
        var dataset;

        Message.html("");
        Message.className = "pull-left label-danger label";


        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_api_data",
            data: url,
            // contentType: 'application/json',
            success: function (data) {
                if (apiType == 'json') {
                    j_data = JSON.parse(data);
                    dataset = get_data_api_obj(j_data, data_path)

                }
                else if (apiType == 'xml') {
                    j_data = xml_conv.xml_str2json(data);
                    dataset = get_data_api_obj(j_data, data_path)
                }

                if (dataset) {
                    console.log(dataset);

                    CSV_Data = dataset;
                    CSV_keys = Object.keys(dataset[0]);

                    setUpCount();

                    // setUpPanel();
                    document.getElementById("datasetStorePanel").style.display = "inline";
                }
                else {
                    Message.html("Something went wrong.");
                }
            },
            error: function (err) {
                Message.html("API Request Failed.");

            }


        });
    },
    /**
     * this function changes the 'apiType' variable state between 'xml' and 'json', every time the 'apiType' radio
     * inputs changes.
     * @param e
     */
    "change .apiType": function (e) {
        console.log(e);
        apiType = e.currentTarget.getAttribute("apiType");
        var url_val = document.getElementById("apiUrl").value;
        var api_path_val = document.getElementById("apiDataPath").value;

        if (/\S/.test(url_val) && /\S/.test(api_path_val)) {
            document.getElementById("getApi").disabled = false;
        }
        Message.html("");
    },

    /**
     * this function triggers every time a keypress up the api url textbox.
     * @param e
     */
    "keyup .apiUrl": function (e) {
        var url_val = e.currentTarget.value;
        var api_path_val = document.getElementById("apiDataPath").value;

        document.getElementById("getApi").disabled = !(/\S/.test(url_val) && /\S/.test(api_path_val) && (apiType));
        Message.html("");
    },

    /**
     * this function triggers every time a keypress up the api data path textbox.
     * @param e
     */
    "keyup .apiDataPath": function (e) {
        var api_path_val = e.currentTarget.value;
        var url_val = document.getElementById("apiUrl").value;

        document.getElementById("getApi").disabled = !(/\S/.test(url_val) && /\S/.test(api_path_val) && (apiType));
        Message.html("");
    },

    /**
     * The on click event for the Store api data button.
     * This event function calls the 'insertData' which will send the ajax call to store the API information in the
     * elasticsearch.
     * @param e
     */
    "click .storeDataBtn": function (e) {
        var elem = e.currentTarget;
        var apiDataName = document.getElementById("apiDataName");
        var apiPersonName = document.getElementById("PersonName");
        var apiDataSource = document.getElementById("DataSource");
        var url = document.getElementById("apiUrl").value;
        var data_path = document.getElementById("apiDataPath").value;
        // Message = $("#message");

        var dataInfo = {
            dataset_name: apiDataName.value.trim(),
            person_name: apiPersonName.value.trim(),
            data_source: apiDataSource.value.trim(),
        };

        elem.disabled = true;
        insertData(dataInfo, url, data_path, apiType);
        Message.html("");
    },

    /**
     * the key up event function for the api data name textbox.
     * @param e
     */
    "keyup .apiDataName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var personTxt = document.getElementById("PersonName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && personTxt && dataSourceTxt);
        Message.html("");
    },
    /**
     * the key up event function for the api data uploaded person's name textbox.
     * @param e
     */
    "keyup .PersonName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("apiDataName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && dataSourceTxt);
        Message.html("");
    },

    /**
     * the key up event function for the api data source textbox.
     * @param e
     */
    "keyup .DataSource": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("apiDataName").value;
        var personTxt = document.getElementById("PersonName").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && personTxt);
        Message.html("");
    },
});
