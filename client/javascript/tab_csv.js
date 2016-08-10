/**
 * Created by Rajitha Hasith on 22/06/2016.
 * This file controls all the client side actions of the 'tab_csv.html' file (client/views/tab_csv.html)
 * this file contains the functions that uses in the tab_csv.html file, as well as the Meteor Template Helpers
 * functions and Events functions.
 */

/**
 * this variable store the string value of the python (server side) sever address.
 * @type {string}
 */
pythonServer = "localhost:5000";

/**
 * This variable stores the CSV object keys (csv column headers).
 * @type {Array}
 */
CSV_keys = [];
/**
 * This is a Tracker variable that will track the 'CSV_keys' array variable. This variable helps to trigger an action
 * when the 'CSV_keys' array variable changes.
 *
 * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
 * @type {Tracker.Dependency}
 */
csv_key_dep = new Tracker.Dependency();
/**
 *
 * @type {Array}
 */
CSV_Data = [];
/**
 * This is a Tracker variable that will track the 'CSV_keys' array variable. This variable helps to trigger an action
 * when the 'CSV_keys' array variable changes.
 *
 * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
 * @type {Tracker.Dependency}
 */
csv_data_dep = new Tracker.Dependency();
/**
 *The variable to store the data source of the csv files.
 * @type {string}
 */
Data_Source = "";
/**
 * The variable to store the instance of the code mirror object.
 * The variable is initialised in the template onRendered function.
 */
var Code_Editor;
/**
 * this array variable stores the header information objects.
 * @type {Array}
 */
headerValues = [];
/**
 * This is a Tracker variable that will track the 'headerValues' array variable. This variable helps to trigger an
 * action when the 'headerValues' array variable changes.
 *
 * Doc: https://docs.meteor.com/api/tracker.html#tracker_dependency
 * @type {Tracker.Dependency}
 */
headers_dep = new Tracker.Dependency();

/**
 * This string variable store the server return message to check.
 * @type {string}
 */
var dataAlreadyExist = "Data set already exist";
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
 * This string variable store the server return message to check.
 * @type {string}
 */
var newDataset = "New data set";

// Return array of string values, or NULL if CSV string not well formed.
/**
 * the function takes a string (line from the csv file in this case), then checks if the line looks like an csv line.
 * If it passes the check returns the values of the line in an array, returns Null otherwise.
 * @param text
 * @returns {*}
 */
function csv_to_array(text) {
    var re_valid;
    re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value;
    re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
}
/**
 * This function checks if the csv file's number of headers and number of values in each line is same.
 * returns an object with the boolean value stating is the lines matching or not. if the lines are not matching, the
 * lineNum property will state the line number that is not matching, otherwise it will be 0.
 * @param lines
 * @returns {{lineMatch: boolean, lineNum: number}}
 */
function linesMatch(lines) {

    CSV_keys = [];
    // csv_key_dep.changed();

    var lineMatch = {
        "lineMatch": true,
        "lineNum": 0
    };
    // var linesMatch = true;
    var lineNum = 0;
    var headers = csv_to_array(lines[0]);
    // CSV_keys = headers;
    headers.forEach(function (h) {
        CSV_keys.push(h);
        csv_key_dep.changed();
    });
    // csv_key_dep.changed();


    if (headers) {
        lines.forEach(function (l) {
            lineNum += 1;
            if (l) {
                var colNum = csv_to_array(l);
                if (colNum) {
                    if (colNum.length != headers.length) {
                        lineMatch["lineMatch"] = false;
                        lineMatch["lineNum"] = lineNum;

                    }
                }
                else {
                    lineMatch["lineMatch"] = false;
                    lineMatch["lineNum"] = lineNum;

                }
            }
        });
    }
    else {
        lineMatch = null;
    }
    return lineMatch;
}
/**
 * This function function set up the header configuration panel.
 * The function updates the 'headerValues' array and then the 'headers_dep' Tracker variable calls the .changed()
 * function. This will trigger
 */
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
/**
 * This function calls an ajax calla POST request to the server to store the CSV data in the elasticsearch.
 * @param dataInfo
 * @param dataset
 */
function insertData(dataInfo, dataset) {
    var headersObj = [];
    CSV_keys.forEach(function (key) {
        headersObj.push(key);
    });
    var requestObject = {
        datasetInfo: dataInfo,
        DataSet: dataset,
        headers: CSV_keys,
        apiData: false

    };

    var elem = document.getElementById("storeDataBtn");
    var Message = $("#message");
    Message.html("");


    $.ajax({
        method: "POST",
        url: "http://" + pythonServer + "/insert_dataset",
        data: JSON.stringify(requestObject),
        dataType: "json",
        // contentType: 'application/json',
        success: function (data) {

            // if(data.message == dataAlreadyExist){
            //     Message.html("The CSV data already exist in the database. Data set name: '"+data.data_set_name+"'");
            //     document.getElementById("datasetStorePanel").style.display = "none";
            //     document.getElementById("panel").style.display = "inline";
            // }
            if (data.message == dataNameAlreadyExist) {
                Message.html("There is another CSV data set under this name. Please change the data set name. ");
                elem.disabled = false;
            }
            else if (data.message == dataStored) {
                document.getElementById("datasetStorePanel").style.display = "none";
                document.getElementById("panel").style.display = "inline";
                // elem.disabled = false;
                var csvDataName = document.getElementById("csvDataName").value = "";
                var personName = document.getElementById("personName").value = "";
                var dataSource = document.getElementById("dataSource").value = "";
                Message.html("")
            }

            console.log(data);
        }
    });

}
/**
 * This is a meteor function that registers functions that will call when the template is rendering to the DOM.
 * you can also update variables in this function.
 */
Template.tab_csv.onRendered(function () {
    // this.$(".tooltipped").tooltip();

    Code_Editor = CodeMirror.fromTextArea(this.find("#codemirror_id"), {
        lineNumbers: true,
        lineWrapping: true,
        styleSelectedText: true,
        mode: "Plain Text",
        placeholder: "Paste your CSV file content or drag and drop the file here..."
    });

    Code_Editor.on("drop", function (cm, e) {
        // e.preventDefault()
        var processBtn = document.getElementById("process_edit_btn");
        var clearBtn = document.getElementById("clear_editor");
        console.log(e);
        console.log(cm);
        var files = e.dataTransfer.files;

        if (files.length > 1) {
            e.preventDefault();
            processBtn.style.display = "none";
            clearBtn.style.display = "none";
            var Message = $("#message");
            Message.html("Please only drop one file to process.");
            cm.setValue("")

        }

        // Mapbox.load()

    });

    Code_Editor.on("update", function (cm) {
        var processBtn = document.getElementById("process_edit_btn");
        var clearBtn = document.getElementById("clear_editor");
        var Message = $("#message");
        var text = cm.getValue();
        // console.log(e);

        var textn = !text;
        var texte = !/\s/.test(text);

        if (!/\S/.test(text)) {
            processBtn.style.display = "none";
            clearBtn.style.display = "none";
            var fileUploader = document.getElementById("fileUpload");
            fileUploader.style.display = "inline";
            document.getElementById("csvFileName").value = "";

            var panel = document.getElementById("panel");
            panel.style.display = "none";
            // document.getElementById("HeaderConfig").innerHTML = "";
            document.getElementById("restoreModelBody").innerHTML = "";
            Message.html("");
        }
        else {
            processBtn.style.display = "inline";
            clearBtn.style.display = "inline";
            // Message.html("")
        }
    });

    // GoogleMaps.load(
    //     {    key:"AIzaSyB8shH7uf30GbAWTRFAiWPzcIY1grpw9Xc"}
    // );
});
/**
 * The tab_csv event functions. These functions specify event handler for this template.
 */
Template.tab_csv.events({

    "click .ProcessCSV": function (e, t) {
        // var text = t.find("#codemirror_id").value;
        var elem = e.currentTarget;
        // elem.className +=' disabled';
        elem.disabled = true;
        elem.style.cursor = 'auto';

        var text = Code_Editor.getValue();
        var lines = text.split('\n');
        var headerList = lines[0].split;
        var Message = $("#message");
        document.getElementById("restoreModelBody").innerHTML = "";
        var test = document.getElementById("fileUpload");


        if (lines.length > 1) {
            var lineMatch = linesMatch(lines);
            if (lineMatch) {
                if (lineMatch["lineMatch"]) {

                    CSV_Data = d3.csv.parse(text, function (d) {
                        d.Count = 1;
                        return d;
                    });
                    // SetUpCount();
                    console.log(CSV_Data);
                    // CSV_keys = Object.keys(data[0]);

                    setUpPanel();
                    // var Message = $("#message");
                    Message.html("");
                    Code_Editor.setOption("readOnly", true);
                    // checkDataset(CSV_Data);
                    document.getElementById("datasetStorePanel").style.display = "inline";


                    elem.disabled = false;
                    elem.style.cursor = 'pointer';
                    elem.className = "btn-primary btn EditCSV";
                    elem.innerHTML = "Edit";

                }
                else {
                    Message.html("There is the problem in line: " + lineMatch["lineNum"]);
                    Code_Editor.setSelection({line: lineMatch["lineNum"] - 1, ch: 0}, {line: lineMatch["lineNum"] - 1});
                    elem.disabled = false;
                    elem.style.cursor = 'pointer';

                }
            }
            else {
                Message.html("The Editor content does not look like a CSV... ");
                elem.disabled = false;
                elem.style.cursor = 'pointer';
            }
        }
        else {
            Message.html("CSV files should have multiple lines... ");
            elem.disabled = false;
            elem.style.cursor = 'pointer';
        }

        var fileUploader = document.getElementById("fileUpload");
        fileUploader.style.display = "none";
    },

    "click .storeDataBtn": function (e) {
        var elem = e.currentTarget;
        var csvDataName = document.getElementById("csvDataName");
        var csvPersonName = document.getElementById("personName");
        var csvDataSource = document.getElementById("dataSource");

        var dataInfo = {
            dataset_name: csvDataName.value.trim(),
            person_name: csvPersonName.value.trim(),
            data_source: csvDataSource.value.trim()
        };
        Data_Source = csvDataSource.value.trim();

        var text = Code_Editor.getValue();

        elem.disabled = true;
        insertData(dataInfo, CSV_Data);


    },

    "keyup .csvDataName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var personTxt = document.getElementById("personName").value;
        var dataSourceTxt = document.getElementById("dataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && personTxt && dataSourceTxt);


    },

    "keyup .PersonName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var dataSourceTxt = document.getElementById("dataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");


        storeBtn.disabled = !(elemVal && dataNameTxt && dataSourceTxt);

    },

    "keyup .DataSource": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var personTxt = document.getElementById("personName").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && personTxt);

    },

    "click .EditCSV": function (e) {
        Code_Editor.setOption("readOnly", false);
        var elem = e.currentTarget;
        elem.className = "btn-success btn ProcessCSV";
        elem.innerHTML = "Process";
        var datasetName = document.getElementById("datasetStorePanel");
        datasetName.style.display = "none";

        var temp;
        CSV_keys = temp;
        CSV_Data = temp;
        headerValues = [];
        Data_Source = "";

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        // document.getElementById("HeaderConfig").innerHTML = "";
        document.getElementById("restoreModelBody").innerHTML = "";


        var Message = $("#message");
        Message.html("");

        // var headerpanel = document.getElementById("headerLabels");
        // headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";


        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";
        mapSvg.style.height = 0;


        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        var visualMenu = document.getElementById("visualMenu");
        visualMenu.style.display = "none";
        document.getElementById("charts").style.display = "none";

        var fileUploader = document.getElementById("fileUpload");
        fileUploader.style.display = "inline";
        // var fileUploadInner = document.getElementById("innerFileUpload");

    },

    "click .ClearCSV": function (e, t) {
        Code_Editor.setOption("readOnly", false);
        Code_Editor.setValue("");
        var processBtn = document.getElementById("process_edit_btn");
        processBtn.className = "btn-success btn ProcessCSV";
        processBtn.innerHTML = "Process";
        processBtn.style.display = "none";
        var clearBtn = document.getElementById("clear_editor");
        clearBtn.style.display = "none";
        var datasetName = document.getElementById("datasetStorePanel");
        datasetName.style.display = "none";

        var temp;
        CSV_keys = temp;
        CSV_Data = temp;
        headerValues = [];
        Data_Source = "";

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        // document.getElementById("HeaderConfig").innerHTML = "";
        document.getElementById("restoreModelBody").innerHTML = "";

        var Message = $("#message");
        Message.html("");

        // var headerpanel = document.getElementById("headerLabels");
        // headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";

        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";
        mapSvg.style.height = 0;


        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        var visualMenu = document.getElementById("visualMenu");
        visualMenu.style.display = "none";
        document.getElementById("charts").style.display = "none";

        var fileUploader = document.getElementById("fileUpload");
        fileUploader.style.display = "inline";
        document.getElementById("csvFileName").value = "";
        // var fileUploadInner = document.getElementById("innerFileUpload");
        // fileUploadInner.innerHTML = "Browse&hellip; <input class='csv_upload' type='file' style='display: none;'>"
    },

    "change .csv_upload": function (e) {
        var elem = e.currentTarget;
        var file = elem.files[0];
        var fileName = file.name;
        var fileNameTxt = document.getElementById("csvFileName");
        fileNameTxt.value = fileName;


        var reader = new FileReader();
        reader.onload = function (fileLoadEvent) {
            // console.log(fileLoadEvent.target.result)
            var text = fileLoadEvent.target.result;
            Code_Editor.setValue(text);
        };

        reader.readAsText(file);

        var fileUploadInner = document.getElementById("innerFileUpload");
        fileUploadInner.innerHTML = "Browse&hellip; <input class='csv_upload' type='file' style='display: none;'>"

    },

});

function resetOutputEmbed() {
    var downloadBtn = document.getElementById('downloadCharBtn');
    var fileNameTxt = document.getElementById('downloadFileName');
    var svgTextArea = document.getElementById('chartEmbedTxt');

    downloadBtn.disabled = true;
    downloadBtn.style.cursor = 'auto';
    fileNameTxt.value = "";
    svgTextArea.value = "";
}