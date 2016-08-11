/**
 * Created by Rajitha Hasith on 22/06/2016.
 * This file controls all the client side actions of the 'tab_csv.html' file (client/views/tab_csv.html)
 * this file contains the functions that uses in the tab_csv.html file, as well as the Meteor Template Helpers
 * functions and Events functions.
 */

/**
 * importing the functions file in the /imports directory.
 */
import "../../imports/functions";

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

/**
 * This function checks if the csv file's number of headers and number of values in each line is same.
 * returns an object with the boolean value stating is the lines matching or not. if the lines are not matching, the
 * lineNum property will state the line number that is not matching, otherwise it will be 0.
 * @param lines
 * @returns {{lineMatch: boolean, lineNum: number}}
 */
function linesMatch(lines) {

    CSV_keys = [];

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
 *
 * Doc: http://docs.meteor.com/api/templates.html#Template-onRendered
 */
Template.tab_csv.onRendered(function () {
    /**
     * Creating the Editor in the tab_csv template.
     * the CodeMirror.fromTextArea() function creates the editor text area with the properties that passes in to the
     * function.
     *
     * Doc: http://codemirror.net/doc/manual.html
     */
    Code_Editor = CodeMirror.fromTextArea(this.find("#codemirror_id"), {
        lineNumbers: true,
        lineWrapping: true,
        styleSelectedText: true,
        mode: "Plain Text",
        placeholder: "Paste your CSV file content or drag and drop the file here..."
    });

    /**
     * The CodeMirror event function.
     * This function trigger when ever a file drop in to the editor.
     *
     * Doc: http://codemirror.net/doc/manual.html#events
     */
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

    });
    /**
     * The CodeMirror event function.
     * This function trigger when ever the text editor updates.
     *
     * Doc: http://codemirror.net/doc/manual.html#events
     */
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
});

/**
 * The tab_csv event functions. These functions specify event handler for this template.
 */
Template.tab_csv.events({

    /**
     * The Process CSV button on click event function.
     * The function gets the value in the CodeMirror editer value and check whether it is CSV format, if so uses
     * d3.csv.parse() function to create an object array from the editor data. if the data in the editor is CSV data,
     * the 'Process CSV' button changes to 'Edit' button, and the editor becomes read only.
     *
     * Doc: https://github.com/d3/d3-3.x-api-reference/blob/master/CSV.md#parse
     * @param e
     */
    "click .ProcessCSV": function (e) {
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

    /**
     * The on click event for the Store data button.
     * This event function calls the 'insertData' which will send the ajax call to store the CSV data set information
     * and the data set itself in the elasticsearch.
     * @param e
     */
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

    /**
     * the key up event function for the CSV data set name textbox.
     * @param e
     */
    "keyup .csvDataName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var personTxt = document.getElementById("personName").value;
        var dataSourceTxt = document.getElementById("dataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && personTxt && dataSourceTxt);
    },

    /**
     * the key up event function for the CSV data set uploaded person's name textbox.
     * @param e
     */
    "keyup .PersonName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var dataSourceTxt = document.getElementById("dataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && dataSourceTxt);

    },

    /**
     * the key up event function for the CSV data set source textbox.
     * @param e
     */
    "keyup .DataSource": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var personTxt = document.getElementById("personName").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && personTxt);

    },

    /**
     * The 'Edit' button on click event.
     * when the use click this button the button changes to 'Process CSV' button. The Editor's read only state become
     * false. This allow user to any changes to the CSV file.
     * @param e
     */
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

    /**
     * The 'Clear CSV' button on click event. the function clear everythin on the editor and make the tab_csv template
     * in to the original state.
     * @param e
     */
    "click .ClearCSV": function (e) {
        Code_Editor.setOption("readOnly", false);
        Code_Editor.setValue("");
        var processBtn = document.getElementById("process_edit_btn");
        processBtn.className = "btn-success btn ProcessCSV";
        processBtn.innerHTML = "Process";
        processBtn.style.display = "none";
        var elem = e.currentTarget;
        elem.style.display = "none";
        var datasetName = document.getElementById("datasetStorePanel");
        datasetName.style.display = "none";

        CSV_keys = [];
        CSV_Data = [];
        headerValues = [];
        Data_Source = "";

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        // document.getElementById("HeaderConfig").innerHTML = "";
        document.getElementById("restoreModelBody").innerHTML = "";

        var Message = $("#message");
        Message.html("");

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
    },

    /**
     * As well as the editor the user have to option to upload CSV files in to the syste.
     * This is the input file on change function.
     * When user upload a CSV file the content of the file is displayed in the CSV Editor.
     * @param e
     */
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

/**
 * This function resets the values in the export data panel.
 * The function is used in 'Clear' button on click and 'Edit' on click events.
 */
function resetOutputEmbed() {
    var downloadBtn = document.getElementById('downloadCharBtn');
    var fileNameTxt = document.getElementById('downloadFileName');
    var svgTextArea = document.getElementById('chartEmbedTxt');

    downloadBtn.disabled = true;
    downloadBtn.style.cursor = 'auto';
    fileNameTxt.value = "";
    svgTextArea.value = "";
}