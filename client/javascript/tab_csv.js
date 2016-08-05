// import "../../imports/bar_chart.js";
import "../../imports/dimple_bar";
import "../../imports/bar";
// import "../../imports/grouped_bar";
import "../../imports/dimple_grouped";
// import "../../imports/pie_chart";
import "../../imports/dimple_pie";
import "../../imports/map";
import "../../imports/mapbox";
import "../../imports/dimple_line";
import "../../imports/functions";


// var pythonServer = "139.59.186.138/";
pythonServer = "localhost:5000";


CSV_keys = [];
csv_key_dep = new Tracker.Dependency();
CSV_Data = [];
csv_data_dep = new Tracker.Dependency();
Data_Source = "";

var showPanel = false;
var showPanel_dep = new Tracker.Dependency();

Code_Editor = [];
headerValues = [];
headers_dep = new Tracker.Dependency();
var removedHeaderVals = [];
headerOriginal = "originalVal";
headerPresent = "presentVal";
headerType = "type";
headerValCount = "valCount";

dataAlreadyExist = "Data set already exist";
dataNameAlreadyExist = "Data set name already exist";
dataStored = "Successfully data added to elasticsearch";
newDataset = "New data set";

var selectedXlable;
var chartRedrawObj = {
    data: {},
    width: 0,
    height: 0,
    type: ""
};

var isVisOn;


// function isNull(inputArray) {
//     for (var i = 0, len = inputArray.length; i < len; i += 1)
//         if (inputArray[i] !== null)
//             return false;
//     return true;
// }

function checkIPlist(ip, list) {

    var ipData = null;

    list.forEach(function (d) {
        if (d.ip == ip) {
            ipData = d;
        }
    });
    return ipData;
}

function lon_lat_check() {
    var lon = false;
    var lat = false;
    headerValues.forEach(function (h) {
        if (!h.deleted) {
            if (h[headerType] == "lon") {
                lon = true;
            }
            else if ((h[headerType] == "lat")) {
                lat = true;
            }
        }
    });

    return (lon && lat);
}

function headersDeleted() {
    var headersDeleted = true;
    headerValues.forEach(function (h) {
        if (!h.deleted) {
            headersDeleted = false;
        }
    });
    return headersDeleted;
}

function headersNotDeleted() {
    var headersNotDeleted = true;
    headerValues.forEach(function (h) {
        if (h.deleted) {
            headersNotDeleted = false;
        }
    });
    return headersNotDeleted;
}

// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
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

function linesMatch(lines) {

    CSV_keys = [];
    // csv_key_dep.changed();

    var lineMatch = {
        "lineMatch": true,
        "lineNum": 0
    };
    // var linesMatch = true;
    var lineNum = 0;
    var headers = CSVtoArray(lines[0]);
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
                var colNum = CSVtoArray(l);
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

function SetUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
    });
}


function setUpPanel() {
    headerValues = [];

    // CSV_keys.forEach(function (key) {
    //     var keyItem = {
    //         "originalVal": key,
    //         "presentVal": key,
    //         "type": "",
    //         "deleted": false,
    //         "valCount": {}
    //     };
    //     headerValues.push(keyItem);
    //
    // });

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


function countValues(column) {
    var columnVals = [];
    var countsObj = {};
    var counts = [];

    CSV_Data.forEach(function (d) {
        var columnVal = d[column];
        columnVals.push(columnVal);
    });

    columnVals.forEach(function (v) {
        countsObj[v] = 1 + (countsObj[v] || 0);
    });

    for (var prop in countsObj) {
        if (countsObj.hasOwnProperty(prop)) {
            var keyVal = {
                Key: prop,
                Value: countsObj[prop]
            };
            counts.push(keyVal);
        }
    }

    return counts
}

function checkDataset(dataset) {
    var Message = $("#message");
    Message.html("");

    var elem = document.getElementById("process_edit_btn");
    $.ajax({
        method: "POST",
        url: "http://" + pythonServer + "/check_dataset",
        data: JSON.stringify(dataset),
        dataType: "json",
        // contentType: 'application/json',
        success: function (data) {
            if (data.message == dataAlreadyExist) {
                Message.html("The CSV data already exist in the database. Data set name: '" + data.data_set_name + "'");
                document.getElementById("datasetStorePanel").style.display = "none";
                document.getElementById("panel").style.display = "inline";
            }
            else if (data.message == newDataset) {
                document.getElementById("datasetStorePanel").style.display = "inline";

            }
            elem.disabled = false;
            elem.style.cursor = 'pointer';
            elem.className = "btn-primary btn EditCSV";
            elem.innerHTML = "Edit";
            // else if(data.massage == newDataset){
            //
            // }
        }
    });
}

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
                Message.html("")
            }

            console.log(data);
        }
    });

}

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

Template.tab_csv.helpers({

    // mapOptions: function() {
    //     if (GoogleMaps.loaded()) {
    //         var a = 1;
    //         return {
    //             center: new google.maps.LatLng(-37.8136, 144.9631),
    //             zoom: 8
    //         };
    //     }
    // },

    // getCSV_Keys: function () {
    //     csv_key_dep.depend();
    //     return CSV_keys
    // },

    getData: function () {
        var a = 1;
        return headerValues;
    }

});

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
                    // $.ajax({
                    //     method: "POST",
                    //     url: "http://" + pythonServer + "/csv_data",
                    //     data: {
                    //         'data': text
                    //     },
                    //     success: function (data) {
                    //         CSV_Data = data;
                    //         SetUpCount();
                    //         console.log(CSV_Data);
                    //         // CSV_keys = Object.keys(data[0]);
                    //
                    //         setUpPanel();
                    //         var Message = $("#message");
                    //         Message.html("");
                    //         Code_Editor.setOption("readOnly", true);
                    //         // checkDataset(CSV_Data);
                    //         document.getElementById("datasetStorePanel").style.display = "inline";
                    //
                    //
                    //         elem.disabled = false;
                    //         elem.style.cursor = 'pointer';
                    //         elem.className = "btn-primary btn EditCSV";
                    //         elem.innerHTML = "Edit";
                    //     }
                    // });

                    var data = d3.csv.parse(text, function (d) {
                        d.Count = 1;
                        return d;
                    });
                    CSV_Data = data;
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
        var csvPersonName = document.getElementById("PersonName");
        var csvDataSource = document.getElementById("DataSource");

        var dataInfo = {
            dataset_name: csvDataName.value,
            person_name: csvPersonName.value,
            data_source: csvDataSource.value
        };
        Data_Source = csvDataSource.value;

        var text = Code_Editor.getValue();

        elem.disabled = true;
        insertData(dataInfo, CSV_Data);


    },

    "keyup .csvDataName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var personTxt = document.getElementById("PersonName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && personTxt && dataSourceTxt);


    },

    "keyup .PersonName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");


        storeBtn.disabled = !(elemVal && dataNameTxt && dataSourceTxt);

    },

    "keyup .DataSource": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var personTxt = document.getElementById("PersonName").value;
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

    /*

     "click .csvHeaderEdit": function (e) {
        var headerIndex;
        var elem = e.currentTarget;
        var id = elem.getAttribute("headerID");
        var textbox = document.getElementById("header_" + id);
        // var selection = document.getElementById("type_"+id);
        if (textbox.readOnly) {
            elem.innerHTML = "<span class='glyphicon glyphicon-ok'></span>";
            elem.className = "csvHeaderEdit btn btn-success btn-sm";
            textbox.readOnly = false;
        } else {
            headerIndex = textbox.getAttribute('index');
            var header = headerValues[headerIndex];
            header[headerPresent] = textbox.value;
            //
            // header[headerType] = selection.value;
            headerValues[headerIndex] = header;

            elem.innerHTML = "<span class='glyphicon glyphicon-edit'></span>";
            elem.className = "csvHeaderEdit btn btn-default btn-sm";
            textbox.readOnly = true;
        }
    },

    "change .csvHeaderType": function (e) {
        var elem = e.currentTarget;
        var headerId = elem.getAttribute("headerID");
        var headerIndex = elem.getAttribute("index");

        var header = headerValues[headerIndex];
        header[headerType] = elem.value;
        headerValues[headerIndex] = header;
    },

    "click .csvHeaderDelete": function (e) {
        var elem = e.currentTarget;
        var restoreBtn = document.getElementById("restore");
        var restoreModalBody = document.getElementById("restoreModelBody");
        var HeaderConfigPanel = document.getElementById("HeaderConfig");
        var rowID = elem.getAttribute("headerID");
        var rowElem = document.getElementById("row_" + rowID);
        var headerIndex = +elem.getAttribute("index");
        var delHeaderVal = headerValues[headerIndex];
        removedHeaderVals.push(delHeaderVal);

        var removedHeaderIndex = removedHeaderVals.length - 1;

        rowElem.style.display = "none";

        headerValues[headerIndex].deleted = true;
        // HeaderConfigPanel.removeChild(rowElem);

        restoreBtn.style.display = "inline";
        restoreModalBody.innerHTML +=
            "<div id='restore_" + rowID + "' class='container-fluid'>" +
            "<div class='row'>" +
            "<button type='button' id='restoreHeader' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' class='btn btn-warning restoreHeader' removedHeaderIndex='" + removedHeaderIndex + "' headerIndex='" + headerIndex + "'>" +
            delHeaderVal.presentVal + " <span class='glyphicon glyphicon-refresh'></span>" +
            "</button>" +
            "</div>" +
            "</div>";


        if (headersDeleted()) {
            restoreBtn.style.display = "none";
            document.getElementById("panel").style.display = "none";
            var processBtn = document.getElementById("process_edit_btn");
            processBtn.className = "btn-success btn ProcessCSV";
            processBtn.innerHTML = "Process";
            removedHeaderVals = [];
        }
    },

    "click .restoreHeader": function (e) {
        var elem = e.currentTarget;
        var headerConfigPanel = document.getElementById("HeaderConfig");
        var headerIndex = elem.getAttribute("headerIndex");
        var removedHeaderIndex = elem.getAttribute("removedHeaderIndex");
        var headerVal = headerValues[headerIndex];
        var restoreModalBody = document.getElementById("restoreModelBody");
        var restoreBtnContainer = document.getElementById("restore_" + headerVal.originalVal);
        var restoreBtn = document.getElementById("restore");

        var rowElem = document.getElementById("row_" + headerVal.originalVal);
        rowElem.style.display = "inherit";


        restoreModalBody.removeChild(restoreBtnContainer);
        // removedHeaderVals.splice(removedHeaderIndex,1);
        headerVal.deleted = false;

        if (headersNotDeleted()) {
            $("#restoreHeadersModal").modal('hide');
            restoreBtn.style.display = "none";
        }
    },

    "click .PanelDone": function (e) {
        headerValues.forEach(function (h) {
            if (!h.deleted) {
                var text = document.getElementById("header_" + h[headerOriginal]);
                var selection = document.getElementById("type_" + h[headerOriginal]);
                var checkbox = document.getElementById("checkBox_" + h[headerOriginal]);
                h[headerPresent] = text.value;
                h[headerType] = selection.value;

                if (checkbox.checked) {
                    h[headerValCount] = countValues(h[headerOriginal])
                }
                else {
                    h[headerValCount] = {}
                }
            }
            // var header = h;


        });

        CSV_Data.forEach(function (data) {
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "string") {
                        data[h[headerOriginal]] = String(data[h[headerOriginal]]);
                    }
                    else if (h[headerType] == "number") {
                        data[h[headerOriginal]] = +data[h[headerOriginal]];
                    }
                    else if (h[headerType] == "ip") {
                        var ip = data[h[headerOriginal]];
                        $.ajax({
                            method: "get",
                            url: 'http://ip-api.com/json/' + ip,
                            dataType: "json",
                            success: function (d) {
                                // var loc = d.loc.split(",");
                                data.location = {
                                    lat: d.lat,
                                    lon: d.lon
                                };
                                // console.log(data)
                            }
                        });
                        // data[h[headerOriginal]] = parseFloat(data[h[headerOriginal]]);
                    }

                    // else if(h[headerType] == "latitude"){
                    //     data[h[headerOriginal]] = parseFloat(data[h[headerOriginal]]);
                    // }
                }
            })
        });

        var textElems = document.getElementsByName("headerText");
        var editBtnElems = document.getElementsByName("headerEditBtn");
        var selectElems = document.getElementsByName("headerType");
        var checkElem = document.getElementsByName("headerCheck");
        var remvBtnElems = document.getElementsByName("headerremvbtn");

        Array.from(textElems).forEach(function (e) {
            e.readOnly = true;
        });
        Array.from(editBtnElems).forEach(function (e) {
            e.style.display = "none";
        });
        Array.from(selectElems).forEach(function (e) {
            e.disabled = true;
        });
        Array.from(checkElem).forEach(function (e) {
            e.disabled = true;
        });
        Array.from(remvBtnElems).forEach(function (e) {
            e.style.display = "none";
        });

        // document.getElementById("charts").style.display = "inline";
        var visualMenu = document.getElementById("visualMenu");
        visualMenu.style.display = "inline";

        var elem = e.currentTarget;
        elem.className = "pull-right btn-primary btn PanelEdit";
        elem.innerHTML = "Edit";

        var restoreHeaderBtn = document.getElementById("restore");
        restoreHeaderBtn.style.display = "none";
        console.log(CSV_Data);
        console.log(headerValues);

        var headerLabelinnerhtml = "";
        var xAxisInnerhtml = "";
        // var headerLabels = document.getElementById("headerLabels");
        var xAxisLabels = document.getElementById("xAxisLabels");

        var chartsMenu = document.getElementById("ChartsMenuTab");
        var normalChartsThumb = false;
        var countChartsThumb = false;
     /!*for now the grouped bar and pie charts set to true.*!/
        var pieChartThumb = true;
        var groupBarChartThumb = true;
        var lineChartThumb = true;

        var chartsMenuInner = "";

        var mapsMenu = document.getElementById("MapsMenuTab");
        var mapsThumb = false;
        var mapsMenuInner = "";



        headerValues.forEach(function (h) {
            if (!h.deleted) {
                if (h[headerType] == "number") {
                    headerValues.forEach(function (hs) {
                        if (hs[headerType] == "string") {
                            normalChartsThumb = true;
                        }
                    });
                    pieChartThumb = true;
                    // groupBarChartThumb = true;

                    // headerLabelinnerhtml +=
                    //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='false' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";
                }
                if (!jQuery.isEmptyObject(h[headerValCount])) {
                    countChartsThumb = true;
                    pieChartThumb = true;
                    // groupBarChartThumb = true;
                    // headerLabelinnerhtml +=
                    //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + " (Count)</button>";
                }
                if ((h[headerType] == "lon") || (h[headerType] == "lat") || (h[headerType] == "ip")) {

                    if (h[headerType] == "ip") {
                        mapsThumb = true;
                    }
                    else if (lon_lat_check()) {
                        mapsThumb = true;
                    }

                }
            }
        });

        if (normalChartsThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='NormalBar' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Bar Charts" +
                "</a>" +
                "</div>";
        }
        if (countChartsThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='CountBar' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Bar Charts (Counts)" +
                "</a>" +
                "</div>";
        }
        if (mapsThumb) {
            mapsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' vistype='Map' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Maps" +
                "</a>" +
                "</div>";
        }
        if (groupBarChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='groupBar' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Grouped Bar Chart" +
                "</a>" +
                "</div>";
        }
        if (pieChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='pieChart' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Pie Chart" +
                "</a>" +
                "</div>";
        }
        if (lineChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='lineChart' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='http://placehold.it/400x300' alt=''>" +
                "Line Chart" +
                "</a>" +
                "</div>";
        }


        chartsMenu.innerHTML = chartsMenuInner;
        mapsMenu.innerHTML = mapsMenuInner;


        // headerLabels.innerHTML = headerLabelinnerhtml;
        // xAxisLabels.innerHTML = xAxisInnerhtml;
        // document.getElementsByClassName("xAxisLabels")[0].checked = true;
    },

    "click .PanelEdit": function (e) {
        var textElems = document.getElementsByName("headerText");
        var editBtnElems = document.getElementsByName("headerEditBtn");
        var selectElems = document.getElementsByName("headerType");
        var checkElem = document.getElementsByName("headerCheck");
        var remvBtnElems = document.getElementsByName("headerremvbtn");

        Array.from(textElems).forEach(function (e) {
            e.readOnly = true;
        });
        Array.from(editBtnElems).forEach(function (e) {
            e.innerHTML = "<span class='glyphicon glyphicon-edit'></span>";
            e.className = "csvHeaderEdit btn btn-default btn-sm";
            e.style.display = "inline";
        });
        Array.from(selectElems).forEach(function (e) {
            e.disabled = false;
        });
        Array.from(checkElem).forEach(function (e) {
            e.disabled = false;
        });
        Array.from(remvBtnElems).forEach(function (e) {
            e.style.display = "inline";
        });

        var visualMenu = document.getElementById("visualMenu");
        visualMenu.style.display = "none";
        document.getElementById("charts").style.display = "none";


        // var headerpanel = document.getElementById("headerLabels");
        // headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";

        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";

        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        var elem = e.currentTarget;
        elem.className = "pull-right btn-success btn PanelDone";
        elem.innerHTML = "Done";

        if (!headersNotDeleted()) {

            var restoreHeaderBtn = document.getElementById("restore");
            restoreHeaderBtn.style.display = "inline";
        }
    },

    "click .visualThumb": function (e) {
        isVisOn = false;
        var elem = e.currentTarget;
        var visType = elem.getAttribute("vistype");

        var headerLabelinnerhtml = "";

        var xAxisInnerhtml = "";
        var headerLabels = document.getElementById("headerLabelGroup");
        var xAxisLabels = document.getElementById("xAxisLabels");
        var xAxiaLblDiv = document.getElementById("xAxisLblsDiv");

        xAxiaLblDiv.style.display = "none";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";

        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";

        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        if (visType == "NormalBar") {
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "number") {
                        headerLabelinnerhtml +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='bar' count='false' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";

                        document.getElementById("charts").style.display = "inline";
                    }
                    if (h[headerType] == "string") {
                        xAxisInnerhtml +=
                            "<option class='xAxisLabel' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</option>";
                        xAxiaLblDiv.style.display = "inline";

                    }
                }
            });


        }
        else if (visType == "CountBar") {
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (!jQuery.isEmptyObject(h[headerValCount])) {

                        headerLabelinnerhtml +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='count' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + " (Count)</button>";

                        document.getElementById("charts").style.display = "inline";

                    }
                    // if (h[headerType] == "string") {
                    //     xAxisInnerhtml +=
                    //         "<option class='xAxisLabels' name='optradio' original='" + h[headerOriginal] + "'>"+ h[headerPresent] + "</option>";
                    //
                    //     // headerLabelinnerhtml +=
                    //     //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='false' class='btn btn-primary headerLabels' original='" + h[headerOrinal] + "'>" + h[headerPresent] + "</button>";
                    // }
                }
            });
            // headerLabelinnerhtml += "<hr>" +
            //     "<label for='xLabelRot' >Rotate X axis Labels <input id='xLabelRot' type='checkbox' class='xLabelRot'></label>"
        }
        else if (visType == "groupBar") {


            headerLabelinnerhtml +=
                "<div class='pull-left' style='text-align: left'>" +
                "Group Each" +
                "<select id='subGroup' class='form-control'>";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    headerLabelinnerhtml +=
                        "<option class='subGroup' original='" + h[headerOriginal] + "'>" +
                        h[headerPresent] +
                        "</option>"
                }
            });

            headerLabelinnerhtml += "</select>";

            headerLabelinnerhtml +=
                "By" +
                "<select id='mainGroup' class='form-control'>";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    headerLabelinnerhtml +=
                        "<option class='mainGroup' original='" + h[headerOriginal] + "'>" +
                        h[headerPresent] +
                        "</option>"
                }
            });

            headerLabelinnerhtml += "</select>";

            headerLabelinnerhtml +=
                "Y Axis Measure" +
                "<select id='yAxisMeasure' class='form-control'>" +
                "<option class='yAxisMeasure' original='count'>" +
                "Count Distinct" +
                "</option>" +
                "<option class='yAxisMeasure' disabled >" +
                "-----------------" +
                "</option>";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "number") {
                        headerLabelinnerhtml +=
                            "<option class='yAxisMeasure' original='" + h[headerOriginal] + "'>" +
                            h[headerPresent] +
                            "</option>"
                    }

                }
            });

            headerLabelinnerhtml += "</select>" +
                "</div>";

            headerLabelinnerhtml +=
                "<div class='pull-right'>" +
                "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='group' count='true' class='btn btn-primary headerLabels' > Create </button>" +
                "</div>";
            document.getElementById("charts").style.display = "inline";

            // var svg = document.getElementById("svgChar");
            // svg.innerHTML = "";
            // var width = document.getElementById("chartBody").offsetWidth;
            // var height = document.getElementById("chartBody").offsetHeight - 5;
            // if (height < 450) {
            //     height = 450;
            // }

        }
        else if (visType == "pieChart") {
     /!*headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (!jQuery.isEmptyObject(h[headerValCount])) {

                        headerLabelinnerhtml +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='pie' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";


                    }

                    if (h[headerType] == "number") {
                        headerLabelinnerhtml +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='pie' count='false' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";
                    }

                    document.getElementById("charts").style.display = "inline";
                }
     });*!/

            headerLabelinnerhtml +=
                "<div class='pull-left' style='text-align: left'>" +
                "Pie Chart of" +
                "<select id='pieHeader' class='form-control'>";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    headerLabelinnerhtml +=
                        "<option class='pieHeader' original='" + h[headerOriginal] + "'>" +
                        h[headerPresent] +
                        "</option>"
                }
            });

            headerLabelinnerhtml += "</select>";

            headerLabelinnerhtml +=
                "Chart Measure" +
                "<select id='pieMeasure' class='form-control'>" +
                "<option class='pieMeasure' original='Count'>" +
                "Count Distinct" +
                "</option>" +
                "<option class='pieMeasure' disabled >" +
                "-----------------" +
                "</option>";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "number") {
                        headerLabelinnerhtml +=
                            "<option class='pieMeasure' original='" + h[headerOriginal] + "'>" +
                            h[headerPresent] +
                            "</option>"
                    }

                }
            });

            headerLabelinnerhtml += "</select>" +
                "</div>";

            headerLabelinnerhtml +=
                "<div class='pull-right'>" +
                "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='pie' count='true' class='btn btn-primary headerLabels' > Create </button>" +
                "</div>";
            document.getElementById("charts").style.display = "inline";
        }
        else if (visType == "lineChart") {
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "number") {
                        headerLabelinnerhtml +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='line' count='false' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";

                        document.getElementById("charts").style.display = "inline";
                    }
                    if (h[headerType] == "string") {
                        xAxisInnerhtml +=
                            "<option class='xAxisLabel' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</option>";
                        xAxiaLblDiv.style.display = "inline";

                    }
                }
            });
        }
        else if (visType == "Map") {
            var lon = false, lat = false, ip = false;
            var lon_h = "", lat_h = "", ip_h = "";
            var location_radio_inner = "";
            var headerLbel_tmp = "";
            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerType] == "lon") {
                        lon = true;
                        lon_h = h[headerOriginal];
                        // headerLabelinnerhtml +=
                        //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='map' maptype='lon/lat' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";

                        document.getElementById("charts").style.display = "inline";
                        // maps();
                    }
                    if (h[headerType] == "lat") {
                        lat = true;
                        lat_h = h[headerOriginal];
                        // headerLabelinnerhtml +=
                        //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='map' maptype='lon/lat' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";

                        document.getElementById("charts").style.display = "inline";
                        // maps();
                    }
                    if (h[headerType] == "ip") {
                        ip = true;
                        ip_h = h[headerOriginal];
                        // headerLabelinnerhtml +=
                        //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='map' maptype='ip' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + "</button>";

                        document.getElementById("charts").style.display = "inline";
                        // maps();
                    }

                    if (!jQuery.isEmptyObject(h[headerValCount])) {
                        headerLbel_tmp +=
                            "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' vistype='map' count='true' class='btn btn-primary headerLabels' original='" + h[headerOriginal] + "'>" + h[headerPresent] + " (Count)</button>";
                    }
                }
            });

            if (lat && lon) {
                location_radio_inner +=
                    "<label class='radio-inline'><input type='radio' name='location_type' maptype='lon/lat' lat_h='" + lat_h + "' lon_h='" + lon_h + "'>Longitude / Latitude</label>";

                // document.getElementById("charts").style.display = "inline";
            }
            if (ip) {
                location_radio_inner +=
                    "<label class='radio-inline'><input type='radio' name='location_type' maptype='ip' ip_h='" + ip_h + "' >IP Location</label>";

                // document.getElementById("charts").style.display = "inline";
            }
            headerLabelinnerhtml += location_radio_inner + headerLbel_tmp;
        }

        headerLabels.innerHTML = headerLabelinnerhtml;
        xAxisLabels.innerHTML = xAxisInnerhtml;
        // var xAxis = document.getElementsByClassName("xAxisLabels")
        // xAxis[0].checked = true;
        if (visType == "Map") {
            var mapTypeRadio = document.getElementsByName("location_type");
            mapTypeRadio[0].checked = true;
        }

    },

    "click .headerLabels": function (e) {
        var elem = e.currentTarget;
        elem.disabled = true;
        elem.style.cursor = 'auto';
        // elem.className += ' disabled';
        var headerOrig = elem.getAttribute("original");
        var visType = elem.getAttribute("vistype");
        var count = elem.getAttribute("count");

        // var siblings = $("#"+elem.id).siblings();
        var siblings = elem.parentNode.childNodes;



        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        // svg.style.display = "none";

        var width = document.getElementById("chartBody").offsetWidth;
        var height = 0;
        if (height < 500) {
            height = 500;
        }

        var selectedXlabel;

        if (visType == "bar") {
            var xAxis = document.getElementById("xAxisLabels");
            var xAxisOptions = document.getElementsByClassName("xAxisLabel");

            selectedXlabel = xAxisOptions[xAxis.selectedIndex].getAttribute("original");

            svg.style.display = "inline";

            // var createBar = function (callback) {
            //     // var future = new Future;
            //     // future.return()
            //     callback(null, barChartHeaders(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width))
            // };
            // var createBarAsyc = Meteor.wrapAsync(createBar);
            // elem.disabled = false;
            // elem.style.cursor = 'pointer';
            barChartHeaders(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width);
        }
        else if (visType == "count") {
            var values = [];
            var counts = [];
            var countObjects = {
                "counts": [],
                "values": []
            };

            headerValues.forEach(function (h) {
                if (!h.deleted) {
                    if (h[headerOriginal] == headerOrig) {
                        if (!jQuery.isEmptyObject(h[headerValCount])) {
                            counts = h[headerValCount]
                        }
                    }
                }
            });
            svg.style.display = "inline";


            barChartCounts(CSV_Data, headerOrig, "#svgChar", height, width);
        }
        else if (visType == "group") {

            var subGroup = document.getElementById("subGroup");
            var subGroupOption = document.getElementsByClassName("subGroup");

            var mainGroup = document.getElementById("mainGroup");
            var mainGroupOption = document.getElementsByClassName("mainGroup");

            var yAxisMeasure = document.getElementById("yAxisMeasure");
            var yAxisMeasureOption = document.getElementsByClassName("yAxisMeasure");

            var subCat = subGroupOption[subGroup.selectedIndex].getAttribute("original");
            var mainCat = mainGroupOption[mainGroup.selectedIndex].getAttribute("original");
            var yAxisMes = yAxisMeasureOption[yAxisMeasure.selectedIndex].getAttribute("original");

            svg.style.display = "inline";


            groupedBarChart(CSV_Data, mainCat, subCat, yAxisMes, "#svgChar", height, width);
        }
        else if (visType == "pie") {
     /!*svg.style.display = "inline";
            if (width > 900) {
                width = width - 200;
            }
            if (count == "true") {
                pieChart(CSV_Data, headerOrig, true, "#svgChar", height, width);

            }
            else if (count == "false") {
                pieChart(CSV_Data, headerOrig, false, "#svgChar", height, width);

     }*!/

            var pieHeader = document.getElementById("pieHeader");
            var pieHeaderOption = document.getElementsByClassName("pieHeader");

            var pieMeasure = document.getElementById("pieMeasure");
            var pieMeasureOption = document.getElementsByClassName("pieMeasure");

            var header = pieHeaderOption[pieHeader.selectedIndex].getAttribute("original");
            var measure = pieMeasureOption[pieMeasure.selectedIndex].getAttribute("original");

            svg.style.display = "inline";
            pieChart(CSV_Data, header, measure, false, "#svgChar", height, width);

        }
        else if (visType == 'line') {
            var LinexAxis = document.getElementById("xAxisLabels");
            var LinexAxisOptions = document.getElementsByClassName("xAxisLabel");

            selectedXlabel = LinexAxisOptions[LinexAxis.selectedIndex].getAttribute("original");

            svg.style.display = "inline";

            // var createBar = function (callback) {
            //     // var future = new Future;
            //     // future.return()
            //     callback(null, barChartHeaders(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width))
            // };
            // var createBarAsyc = Meteor.wrapAsync(createBar);
            // elem.disabled = false;
            // elem.style.cursor = 'pointer';
            lineChart(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width);
        }
        else if (visType == "map") {
            var parentNodeId = elem.parentElement.getAttribute("id");
            var mapTypeRadio = document.getElementsByName("location_type");
            var mapType;
            mapTypeRadio.forEach(function (map_type) {
                if (map_type.checked) {
                    mapType = map_type.getAttribute("maptype")
                }
            });

            // var mapType =$("#"+parentNodeId +" input[name=location_type]:checked");



            if (mapType == "ip") {
                console.log(CSV_Data);

                mapbox(CSV_Data, headerOrig, isVisOn);

                // maps(CSV_Data, headerOrig);
            }
            else if (mapType == "lon/lat") {
                var lonHeader;
                var latHeader;

                headerValues.forEach(function (h) {
                    if (h[headerType] == "lon") {
                        lonHeader = h[headerOriginal];
                    }
                    else if (h[headerType] == "lat") {
                        latHeader = h[headerOriginal];
                    }
                });

                if (lonHeader && latHeader) {

                    mapbox(CSV_Data, headerOrig, isVisOn, lonHeader, latHeader);

                    // maps(CSV_Data, headerOrig, lonHeader, latHeader)
                }
            }

            isVisOn = true;
        }

        for (var i = 0; i < siblings.length; i++) {
            var child = siblings[i];
            if (child.getAttribute("original") == headerOrig) {
                child.style.backgroundColor = "#00ccff";
                child.style.color = "black";
            }
            else if (child.tagName.toLowerCase() == "button") {
                child.style.backgroundColor = "";
                child.style.color = "white";
            }
        }
        elem.disabled = false;
        elem.style.cursor = 'pointer';
        // var className = elem.getAttribute('class');
        // className = className.replace(' disabled', '');
        // elem.className = className;
        document.getElementById("exportChart").style.display = 'inline';
    },

    "keyup .downloadFileName": function (e) {
        var elem = e.currentTarget;
        var downloadBtn = document.getElementById('downloadCharBtn');
        if (elem.value.length > 0) {
            downloadBtn.disabled = false;
            downloadBtn.style.cursor = 'pointer';
        }
        else {
            downloadBtn.disabled = true;
            downloadBtn.style.cursor = 'auto';
        }
    },

     "click .downloadCharBtn": function (e) {

        var fileName = document.getElementById('downloadFileName').value;

        var svg = document.getElementById('svgChar');
        var svgWidth = svg.clientWidth;
        var svgHeight = svg.clientHeight;
        var svgData = new XMLSerializer().serializeToString(svg);

        var canvas = document.createElement("canvas");
        canvas.width = svgWidth;
        canvas.height = svgHeight;
        var ctx = canvas.getContext("2d");

        var img = document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

        img.onload = function () {
            ctx.drawImage(img, 0, 0);

            // Now is done
            console.log(canvas.toDataURL("image/png"));

            var a = document.createElement("a");
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();

        };

    },

    "click .xLabelRot": function (e) {
        var elem = e.currentTarget;
        console.log(e);
        rotate_X_labels(elem.checked, "#svgChar");
    },

    "change #xAxisLabels": function (e) {
        console.log(e);
    },

    "click .chartTabs": function (e) {
        document.getElementById("charts").style.display = "none";
    },
     */

});

/*
$(function () {
    $('#fileupload').fileupload({
        dataType: 'json',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo(document.body);
            });
        }
    });
});
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
// window.addEventListener('resize', function () {
//     var svg = document.getElementById("svgChar");
//  if (svg.style.display != "none" && svg.style.display != "") {
//
//         svg.innerHTML = "";
//
//         var width = document.getElementById("chartBody").offsetWidth;
//         var height = document.getElementById("chartBody").offsetHeight;
//         if (height < 350) {
//             height = 350;
//         }
//         if (chartRedrawObj.type == "counts") {
//             barChartCounts(chartRedrawObj.data.counts, "#svgChar", height, width)
//         }
//         else {
//             barChartHeaders(chartRedrawObj.data, selectedXlable, "#svgChar", height, width)
//         }
//     }
// });
