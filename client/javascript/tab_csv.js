import "../../imports/bar_chart.js";
import "../../imports/bar";

var CSV_keys;
var CSV_Data;
var editor;
var headerValues = [];
var headerOrinal = "orinialVal";
var headerPresent = "presentVal";
var headerType = "type";
var headerValCount = "valCount";
var selectedXlable;
var chartRedrawObj = {
    data: {},
    width: 0,
    height: 0,
    type: ""
};

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

    var lineMatch = {
        "lineMatch": true,
        "lineNum": 0
    };
    // var linesMatch = true;
    var lineNum = 0;
    var headers = CSVtoArray(lines[0]);

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
    return lineMatch;
}
function CreatePanel() {
    headerValues = [];

    var panel = document.getElementById("panel");
    panel.style.display = "inline";

    var innerHtml = "<div class='row top-buffer' style='margin-bottom: 10px'>" +
        "<div class='col-md-1'>" +
        "</div>" +
        "<div class='col-md-4' style='text-align: center'>" +
        "<strong>Column Headers</strong>" +
        "</div>" +
        "<div class='col-md-4' style='text-align: center'>" +
        "<strong>Data Type</strong>" +
        "</div>" +
        "<div class='col-md-3'>" +
        "<div class='col-md-6'>" +
        "</div>" +
        "<div class='col-md-6'>" +
        "</div>" +
        // "</form> " +

        "</div>" +
        "</div>";


    for (i = 0; i < CSV_keys.length; i++) {
        var keyItem = {
            "orinialVal": CSV_keys[i],
            "presentVal": CSV_keys[i],
            "type": "",
            "valCount": {}
        };

        innerHtml +=
            "<div class='row top-buffer' id='row_" + CSV_keys[i] + "'>" +
            "<div class='col-md-1'>" +
            "</div>" +
            "<div class='col-md-4'>" +
            "<form class='form-inline'>" +
            "<input type='text' index='" + i + "' name='headerText' headerID='" + CSV_keys[i] + "' style='width: 80%' readonly id='header_" + CSV_keys[i] + "' class='form-control input' autocomplete='off' value='" + CSV_keys[i] + "'>" +
            "<button type='button' id='editBtn_" + CSV_keys[i] + "' name='headerEditBtn' headerID='" + CSV_keys[i] + "' data-toggle='tooltip' data-placement='top' title='Edit the Header Text Field' style='width: 15%' class='tooltipped csvHeaderEdit  btn btn-default btn-sm'>" +
            "<span class='glyphicon glyphicon-edit'></span>" +
            "</button>" +
            "</form>" +
            "</div>" +
            "<div class='col-md-4'>" +
            "<select id='type_" + CSV_keys[i] + "' headerID='" + CSV_keys[i] + "' index='" + i + "' name='headerType' class='csvHeaderType form-control'>" +
            "<option value='string'>String</option>" +
            "<option value='number'>Number</option>" +
            "<option value='lon/lat'>Longitude/Latitude</option>" +
            // "<option value='latitude'>Latitude</option>"+
            "</select>" +
            "</div>" +
            "<div class='col-md-3'>" +
            "<div class='col-md-6'>" +
            // "<form class='form-inline'>" +
            "<div class='checkbox' style='width: 50%'>" +
            "<label for='checkBox_" + CSV_keys[i] + "' data-toggle='tooltip' data-placement='top' title='Count Data'><input type='checkbox' name='headerCheck' id='checkBox_" + CSV_keys[i] + "'/>Count</label>" +
            "</div>" +
            "</div>" +
            "<div class='col-md-6'>" +
            "<button  type='button' id='remvBtn_" + CSV_keys[i] + "' headerID='" + CSV_keys[i] + "' name='headerremvbtn' index='" + i + " ' data-toggle='tooltip' data-placement='top' title='Delete Header Row'  class='pull-left csvHeaderDelete btn btn-danger btn-sm'>" +
            "<span class='glyphicon glyphicon-remove'></span>" +
            "</button>" +
            "</div>" +
            // "</form> " +

            "</div>" +
            "</div>";
        headerValues.push(keyItem);
    }
    var button =
        "<div class='pull-right btn-toolbar'>" +
        "<button class='pull-right btn-success btn PanelDone'>Done</button>" +
        "</div>";
    innerHtml += button;
    panel.innerHTML = innerHtml;

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


Template.tab_csv.onRendered(function () {
    // this.$(".tooltipped").tooltip();

    editor = CodeMirror.fromTextArea(this.find("#codemirror_id"), {
        lineNumbers: true,
        lineWrapping: true,
        mode: "Plain Text",
        placeholder: "Paste your CSV file content or drag and drop the file here..."
    });

    editor.on("drop", function (cm, e) {
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

        }

    });

    editor.on("update", function (cm) {
        var processBtn = document.getElementById("process_edit_btn");
        var clearBtn = document.getElementById("clear_editor");
        var Message = $("#message");
        var text = cm.getValue();
        // console.log(e);

        if (!text) {
            processBtn.style.display = "none";
            clearBtn.style.display = "none";

            var panel = document.getElementById("panel");
            panel.style.display = "none";
            panel.innerHTML = "";
            Message.html("");
        }
        else {
            processBtn.style.display = "inline";
            clearBtn.style.display = "inline";
            Message.html("")
        }
    });
});

Template.tab_csv.helpers({


    getKey: function () {
        a = 1;
        return CSV_keys
    },

    getData: function () {
        return CSV_Data;
    }

});

Template.tab_csv.events({

    "click .ProcessCSV": function (e, t) {
        // var text = t.find("#codemirror_id").value;
        var text = editor.getValue();
        var lines = text.split('\n');

        if (lines.length > 1) {
            var lineMatch = linesMatch(lines);
            if (lineMatch["lineMatch"]) {
                $.ajax({
                    method: "POST",
                    url: "http://127.0.0.1:5000/csv_data",
                    data: {
                        'data': text
                    },
                    success: function (data) {
                        CSV_Data = data;
                        console.log(CSV_Data);
                        CSV_keys = Object.keys(data[0]);
                        CreatePanel();
                        var Message = $("#message");
                        Message.html("");
                        editor.setOption("readOnly", true);
                        var elem = e.currentTarget;
                        elem.className = "btn-primary btn EditCSV";
                        elem.innerHTML = "Edit";
                    }
                });
            }
            else {
                var Message = $("#message");
                Message.html("There is the problem in line: " + lineMatch["lineNum"]);
            }


        }

    },

    "click .EditCSV": function (e) {
        editor.setOption("readOnly", false);
        var elem = e.currentTarget;
        elem.className = "btn-success btn ProcessCSV";
        elem.innerHTML = "Process";

        var temp;
        CSV_keys = temp;
        CSV_Data = temp;
        headerValues = [];

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        panel.innerHTML = "";
        var Message = $("#message");
        Message.html("");

        var headerpanel = document.getElementById("headerLabels");
        headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";

        var charts = document.getElementById("charts");
        charts.style.display = "none"
    },

    "click .ClearCSV": function (e, t) {
        editor.setOption("readOnly", false);
        editor.setValue("");
        var processBtn = document.getElementById("process_edit_btn");
        processBtn.className = "btn-success btn ProcessCSV";
        processBtn.innerHTML = "Process";
        processBtn.style.display = "none";
        var clearBtn = document.getElementById("clear_editor");
        clearBtn.style.display = "none";

        var temp;
        CSV_keys = temp;

        CSV_Data = temp;
        headerValues = [];
        var panel = document.getElementById("panel");
        panel.style.display = "none";
        panel.innerHTML = "";

        var Message = $("#message");

        Message.html("");

        var headerpanel = document.getElementById("headerLabels");
        headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";

        var charts = document.getElementById("charts");
        charts.style.display = "none"
    },

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
        var panel = document.getElementById("panel");
        var rowID = elem.getAttribute("headerID");
        var rowElem = document.getElementById("row_" + rowID);
        var headerIndex = elem.getAttribute("index");

        headerValues.splice(headerIndex, 1);
        panel.removeChild(rowElem);
    },


    "click .PanelDone": function (e) {
        headerValues.forEach(function (h) {
            var header = h;
            var text = document.getElementById("header_" + h[headerOrinal]);
            var selection = document.getElementById("type_" + h[headerOrinal]);
            var checkbox = document.getElementById("checkBox_" + h[headerOrinal]);
            header[headerPresent] = text.value;
            header[headerType] = selection.value;

            if (checkbox.checked) {
                header[headerValCount] = countValues(h[headerOrinal])
            }
            else {
                header[headerValCount] = {}

            }

        });

        CSV_Data.forEach(function (data) {
            headerValues.forEach(function (h) {
                if (h[headerType] == "string") {
                    data[h[headerOrinal]] = String(data[h[headerOrinal]]);
                }
                else if (h[headerType] == "number") {
                    data[h[headerOrinal]] = +data[h[headerOrinal]];
                }
                else if (h[headerType] == "lon/lat") {
                    data[h[headerOrinal]] = parseFloat(data[h[headerOrinal]]);
                }

                // else if(h[headerType] == "latitude"){
                //     data[h[headerOrinal]] = parseFloat(data[h[headerOrinal]]);
                // }

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

        document.getElementById("charts").style.display = "inline";

        var elem = e.currentTarget;
        elem.className = "pull-right btn-primary btn PanelEdit";
        elem.innerHTML = "Edit";

        console.log(CSV_Data);
        console.log(headerValues);

        var headerLabelinnerhtml = "";
        var xAxisInnerhtml = "";
        var headerLabels = document.getElementById("headerLabels");
        var xAxisLabels = document.getElementById("xAxisLabels");

        headerValues.forEach(function (h) {
            if (h[headerType] == "number") {
                headerLabelinnerhtml +=
                    "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='false' class='btn btn-primary headerLabels' original='" + h[headerOrinal] + "'>" + h[headerPresent] + "</button>";
            }
            if (!jQuery.isEmptyObject(h[headerValCount])) {
                headerLabelinnerhtml +=
                    "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='true' class='btn btn-primary headerLabels' original='" + h[headerOrinal] + "'>" + h[headerPresent] + " (Count)</button>";
            }
            // if (h[headerType] == "string") {
            //     xAxisInnerhtml += "<div class='radio' original='" + h[headerOrinal] + "'>" +
            //         "<label><input type='radio' class='xAxisLabels' name='optradio' original='" + h[headerOrinal] + "'>" + h[headerPresent] + "</label>" +
            //         "</div>";
            //
            //     // headerLabelinnerhtml +=
            //     //     "<button type='button' id='headerLabels' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' count='false' class='btn btn-primary headerLabels' original='" + h[headerOrinal] + "'>" + h[headerPresent] + "</button>";
            // }

        });

        headerLabels.innerHTML = headerLabelinnerhtml;
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

        var charts = document.getElementById("charts");
        charts.style.display = "none";

        var headerpanel = document.getElementById("headerLabels");
        headerpanel.innerHTML = "";

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";


        var elem = e.currentTarget;
        elem.className = "pull-right btn-success btn PanelDone";
        elem.innerHTML = "Done";
    },

    "click .headerLabels": function (e) {
        var elem = e.currentTarget;
        var headerOrig = elem.getAttribute("original");
        var isCount = elem.getAttribute("count");

        var svg = document.getElementById("svgChar");
        svg.innerHTML = "";

        var width = document.getElementById("chartBody").offsetWidth;
        var height = document.getElementById("chartBody").offsetHeight - 5;
        if (height < 450) {
            height = 450;
        }

        if (isCount == "false") {
            var xAxis = document.getElementsByClassName("xAxisLabels");
            for (var i = 0; i < xAxis.length; i++) {
                var checked = xAxis[i];
                if (xAxis[i].checked) {
                    selectedXlable = checked.getAttribute("original");

                }
            }
            // var arrayXacis = Array.from(xAxis);
            // arrayXacis.forEach(function (e) {
            //    if(e.checked){
            //        var a = 1;
            //        // selectedXlable = e.currentTarget
            //    }
            // });

            // bar(CSV_Data,width,height,headerOrig);
            // bar_chart(CSV_Data, width, height, selectedXlable, headerOrig);
            barChartHeaders(CSV_Data, headerOrig, "#svgChar", height, width);
        }
        else if (isCount == "true") {
            var values = [];
            var counts = [];
            var countObjects = {
                "counts": [],
                "values": []
            };
            //
            // headerValues.forEach(function (h) {
            //     if (!jQuery.isEmptyObject(h[headerValCount])) {
            //         if (h[headerOrinal] == headerOrig) {
            //             values = Object.keys(h[headerValCount]);
            //             values.forEach(function (k) {
            //                 counts.push(h[headerValCount][k]);
            //             });
            //             countObjects["counts"] = counts;
            //             countObjects["values"] = values;
            //         }
            //     }
            // });

            headerValues.forEach(function (h) {
                if (h[headerOrinal] == headerOrig) {
                    if (!jQuery.isEmptyObject(h[headerValCount])) {
                        counts = h[headerValCount]
                    }
                }
            });


            barChartCounts(counts, "#svgChar", height, width);
        }
    },

    "change .xAxisLabels": function (e) {
        console.log(e);

    }
});

window.addEventListener('resize', function () {
    var svg = document.getElementById("svgChar");
    svg.innerHTML = "";

    var width = document.getElementById("chartBody").offsetWidth;
    var height = document.getElementById("chartBody").offsetHeight;
    if (height < 350) {
        height = 350;
    }
    if (chartRedrawObj.type == "counts") {
        barChartCounts(chartRedrawObj.data.counts, "#svgChar", height, width)
    }
    else {
        barChartHeaders(chartRedrawObj.data, selectedXlable, "#svgChar", height, width)
    }
});