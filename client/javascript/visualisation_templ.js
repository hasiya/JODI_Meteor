/**
 * Created by Rajitha Hasith on 28/07/2016.
 * This file controls all the client side actions of the 'Visualisation_Temp.html' file
 * (client/views/Visualisation_Temp.html) this file contains the functions that uses in the Visualisation_Temp.html
 * file, as well as the Meteor Template Helpers functions and Events functions.
 */
/**
 * Importing libraries and files need to use in this file.
 */
import Clipboard from 'clipboard';
import "../../imports/Visualisations/dimple_bar";
import "../../imports/Visualisations/dimple_grouped";
import "../../imports/Visualisations/dimple_pie";
import "../../imports/Visualisations/mapbox";
import "../../imports/Visualisations/dimple_line";
import "../../imports/functions";

/**
 * this is a instance of the mapboxgl from the 'mapbox' function in 'imports/Visualisations/mapbox.js. file
 */
var map;
/**
 * this variable keeps track of what visualisation type the application outputting
 */
var visualType;
/**
 * the column header name that the user clicked
 */
var headerOrig;
/**
 * svg chart's SVG element
 */
var svg;
/**
 * width of the SVG element
 */
var width;
/**
 * height of the SVG element
 */
var height;

/**
 * obbject properties names stored in these variables.
 * easier to call them.
 * @type {string}
 */
var headerOriginal = "originalVal";
var headerPresent = "presentVal";
var headerType = "type";
var headerValCount = "valCount";
var dataAlreadyExist = "Data set already exist";
var newDataset = "New data set";
/**
 * this variable tracks the map is drawn or not.
 */
var isMapDraw;

/**
 * this function checks if the data set headers have longitude and latitude data.
 * @returns {boolean}
 */
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

/**
 * this function checks whether any header is deleted or not in the 'headerValues' array.
 * this function helps to display 'header restore' button in header config panel.
 * @returns {{deleted: boolean, notDeleted: boolean}}
 */
function isHeadersDeleted() {
    var headersDeleted = true;
    var headersNotDeleted = true;
    headerValues.forEach(function (h) {
        if (!h.deleted) {
            headersDeleted = false;
        }
        else {
            headersNotDeleted = false;
        }
    });
    return {
        deleted: headersDeleted,
        notDeleted: headersNotDeleted
    };
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

/**
 * the function counts the value frequency of the parameter column name.
 * returns an array of obects with column value and the frequency of that value.
 * @param column
 * @returns {Array}
 */
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
/**
 * This function resets the values in the export data panel.
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
                document.getElementById("datasetName").style.display = "none";
                document.getElementById("panel").style.display = "inline";
            }
            else if (data.message == newDataset) {
                document.getElementById("datasetName").style.display = "inline";

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

/**
 * This is a meteor function that registers functions that will call when the template is rendering to the DOM.
 * you can also update variables in this function.
 *
 * Doc: http://docs.meteor.com/api/templates.html#Template-onRendered
 */
Template.visualisation_all.onRendered(function () {
    /**
     * creating a instence of Clipboard instance to copy the embed code.
     * @type {Clipboard}
     */
    var clipboard = new Clipboard('.clipboardBtn');
});
/**
 * The load_data template helpers function. These helper functions send that send data to the template.
 *
 * Doc: https://docs.meteor.com/api/templates.html#Template-helpers
 */
Template.visualisation_all.helpers({
    get_keys: function () {
        // csv_key_dep.depend();
        // return CSV_keys;
        headers_dep.depend();
        return headerValues;
    }
});

/**
 * The tab_api event functions. These functions specify event handler for this template.
 */
Template.visualisation_all.events({

    /**
     * The click event fucntion for Header Edit button.
     * this allow user to edit the header name of the csv file, which will show in charts.
     * @param e
     */
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

    /**
     * the function triggers evertime the user change the header type in the header configuration panel.
     * @param e
     */
    "change .csvHeaderType": function (e) {
        var elem = e.currentTarget;
        var headerId = elem.getAttribute("headerID");
        var headerIndex = elem.getAttribute("index");

        var header = headerValues[headerIndex];
        header[headerType] = elem.value;
        headerValues[headerIndex] = header;
    },

    /**
     * the function trigger when user delete a header from the header config. panel.
     * this hides the header row in the panel and add the deleted header in to the restore header model body.
     * @param e
     */
    "click .csvHeaderDelete": function (e) {
        var elem = e.currentTarget;
        var restoreBtn = document.getElementById("restore");
        var restoreModalBody = document.getElementById("restoreModelBody");
        var HeaderConfigPanel = document.getElementById("HeaderConfig");
        var rowID = elem.getAttribute("headerID");
        var rowElem = document.getElementById("row_" + rowID);
        var headerIndex = +elem.getAttribute("index");
        var delHeaderVal = headerValues[headerIndex];

        rowElem.style.display = "none";

        headerValues[headerIndex].deleted = true;

        restoreBtn.style.display = "inline";
        restoreModalBody.innerHTML +=
            "<div id='restore_" + rowID + "' class='container-fluid'>" +
            "<div class='row'>" +
            "<button type='button' id='restoreHeader' style='word-wrap: break-word; white-space: normal; position: relative; margin: 5px' class='btn btn-warning restoreHeader' headerIndex='" + headerIndex + "'>" +
            delHeaderVal.presentVal + " <span class='glyphicon glyphicon-refresh'></span>" +
            "</button>" +
            "</div>" +
            "</div>";

        var is_H_deleted = isHeadersDeleted();

        if (is_H_deleted.deleted) {
            restoreBtn.style.display = "none";
            document.getElementById("panel").style.display = "none";
            var processBtn = document.getElementById("process_edit_btn");
            processBtn.className = "btn-success btn ProcessCSV";
            processBtn.innerHTML = "Process";
        }
    },

    /**
     * The restore header button click event.
     * @param e
     */
    "click .restoreHeader": function (e) {
        var elem = e.currentTarget;
        var headerConfigPanel = document.getElementById("HeaderConfig");
        var headerIndex = elem.getAttribute("headerIndex");
        var headerVal = headerValues[headerIndex];
        var restoreModalBody = document.getElementById("restoreModelBody");
        var restoreBtnContainer = document.getElementById("restore_" + headerVal.originalVal);
        var restoreBtn = document.getElementById("restore");

        var rowElem = document.getElementById("row_" + headerVal.originalVal);
        rowElem.style.display = "inherit";


        restoreModalBody.removeChild(restoreBtnContainer);
        headerVal.deleted = false;

        var is_h_deleted = isHeadersDeleted();
        if (is_h_deleted.notDeleted) {
            $("#restoreHeadersModal").modal('hide');
            restoreBtn.style.display = "none";
        }
    },

    /**
     * the event function displays the charts menu to the use. the header config panel becomes read only. The the panel
     * done button becomes edit button.
     * @param e
     */
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
                    }
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
        var xAxisLabels = document.getElementById("xAxisLabels");

        var chartsMenu = document.getElementById("ChartsMenuTab");
        var normalChartsThumb = false;
        var countChartsThumb = false;
        var lineChartThumb = false;
        /*for now the grouped bar and pie charts set to true.*/
        var pieChartThumb = true;
        var groupBarChartThumb = true;

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
                            lineChartThumb = true;
                        }
                    });
                    pieChartThumb = true;
                }
                if (!jQuery.isEmptyObject(h[headerValCount])) {
                    countChartsThumb = true;
                    pieChartThumb = true;
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
                "<img class='img-responsive' src='/images/bar_chart.png' alt=''>" +
                "Bar Charts" +
                "</a>" +
                "</div>";
        }
        if (countChartsThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='CountBar' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='/images/bar_chart.png' alt=''>" +
                "Bar Charts (Counts)" +
                "</a>" +
                "</div>";
        }
        if (mapsThumb) {
            mapsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' vistype='Map' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='/images/map.png' alt=''>" +
                "Maps" +
                "</a>" +
                "</div>";
        }
        if (groupBarChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='groupBar' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='/images/group_chart.png' alt=''>" +
                "Grouped Bar Chart" +
                "</a>" +
                "</div>";
        }
        if (pieChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='pieChart' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='/images/pie_chart.png' alt=''>" +
                "Pie Chart" +
                "</a>" +
                "</div>";
        }
        if (lineChartThumb) {
            chartsMenuInner +=
                "<div class='col-lg-3 col-md-4 col-xs-6 thumb'>" +
                "<a class='thumbnail visualThumb' visType='lineChart' href='#' style='text-align: center'>" +
                "<img class='img-responsive' src='/images/line_chart.png' alt=''>" +
                "Line Chart" +
                "</a>" +
                "</div>";
        }

        chartsMenu.innerHTML = chartsMenuInner;
        mapsMenu.innerHTML = mapsMenuInner;
    },

    /**
     * The edit panel button click event function.
     * @param e
     */
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

        svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";

        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";
        mapSvg.style.height = 0;


        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        var elem = e.currentTarget;
        elem.className = "btn-success btn PanelDone";
        elem.innerHTML = "Done";

        var is_h_deleted = isHeadersDeleted();
        if (!is_h_deleted.notDeleted) {

            var restoreHeaderBtn = document.getElementById("restore");
            restoreHeaderBtn.style.display = "inline";
        }
    },

    /**
     * This event function triggers when user chooses the chart type they want to create.
     * @param e
     */
    "click .visualThumb": function (e) {
        isMapDraw = false;
        var elem = e.currentTarget;
        var visType = elem.getAttribute("vistype");

        var headerLabelinnerhtml = "";

        var xAxisInnerhtml = "";
        var headerLabels = document.getElementById("headerLabelGroup");
        var xAxisLabels = document.getElementById("xAxisLabels");
        var xAxiaLblDiv = document.getElementById("xAxisLblsDiv");

        xAxiaLblDiv.style.display = "none";

        svg = document.getElementById("svgChar");
        svg.innerHTML = "";
        svg.style.display = "none";

        var mapSvg = document.getElementById("svgMap");
        mapSvg.innerHTML = "";
        mapSvg.style.height = 0;

        if (map) {
            map.remove();
        }

        document.getElementById("exportChart").style.display = 'none';
        resetOutputEmbed();

        /**
         * this satement checks the chart type user selected and create UI acording to that.
         */
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
                }
            });
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

        }
        else if (visType == "pieChart") {

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
            document.getElementById("charts").style.display = "inline";

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

    /**
     * This is the on click function for the button that displays the appropriate chart.
     */
    "click .headerLabels": function (e) {
        var elem = e.currentTarget;
        elem.disabled = true;
        elem.style.cursor = 'auto';
        // elem.className += ' disabled';
        headerOrig = elem.getAttribute("original");
        visualType = elem.getAttribute("vistype");
        var count = elem.getAttribute("count");

        var siblings = elem.parentNode.childNodes;


        svg = document.getElementById("svgChar");
        svg.innerHTML = "";

        document.getElementById("embedCode").style.display = "inline";

        width = document.getElementById("chartBody").offsetWidth;
        height = 0;
        if (height < 500) {
            height = 500;
        }

        var selectedXlabel;

        /**
         * each type of visualisations have different functions to draw the chart or map. this if statement is to check
         * which chart is visualising and call the correct function.
         */
        if (visualType == "bar") {
            var xAxis = document.getElementById("xAxisLabels");
            var xAxisOptions = document.getElementsByClassName("xAxisLabel");

            selectedXlabel = xAxisOptions[xAxis.selectedIndex].getAttribute("original");

            svg.style.display = "inline";

            barChartHeaders(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width, Data_Source);
        }
        else if (visualType == "count") {
            svg.style.display = "inline";


            barChartCounts(CSV_Data, headerOrig, "#svgChar", height, width, Data_Source);
        }
        else if (visualType == "group") {

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


            groupedBarChart(CSV_Data, mainCat, subCat, yAxisMes, "#svgChar", height, width, Data_Source);
        }
        else if (visualType == "pie") {

            var pieHeader = document.getElementById("pieHeader");
            var pieHeaderOption = document.getElementsByClassName("pieHeader");

            var pieMeasure = document.getElementById("pieMeasure");
            var pieMeasureOption = document.getElementsByClassName("pieMeasure");

            var header = pieHeaderOption[pieHeader.selectedIndex].getAttribute("original");
            var measure = pieMeasureOption[pieMeasure.selectedIndex].getAttribute("original");

            svg.style.display = "inline";
            pieChart(CSV_Data, header, measure, "#svgChar", height, width, Data_Source);

        }
        else if (visualType == 'line') {
            var LinexAxis = document.getElementById("xAxisLabels");
            var LinexAxisOptions = document.getElementsByClassName("xAxisLabel");

            selectedXlabel = LinexAxisOptions[LinexAxis.selectedIndex].getAttribute("original");

            svg.style.display = "inline";

            lineChart(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width, Data_Source);
        }
        else if (visualType == "map") {
            var parentNodeId = elem.parentElement.getAttribute("id");
            var mapTypeRadio = document.getElementsByName("location_type");
            var mapType;
            mapTypeRadio.forEach(function (map_type) {
                if (map_type.checked) {
                    mapType = map_type.getAttribute("maptype")
                }
            });

            if (mapType == "ip") {
                console.log(CSV_Data);

                map = mapbox(CSV_Data, headerOrig, isMapDraw, Data_Source);

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

                    map = mapbox(CSV_Data, headerOrig, isMapDraw, Data_Source, lonHeader, latHeader);

                    // maps(CSV_Data, headerOrig, lonHeader, latHeader)
                }
            }
            document.getElementById("embedCode").style.display = "none";

            isMapDraw = true;
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

    /**
     * this is the on change function for xAxisLabel dropdown list. When user changes the x axis value in bar charts or
     * line charts this function trigger and create the visualisation acording to the change.
     * @param e
     */
    "change #xAxisLabels": function (e) {

        var elem = e.currentTarget;
        var selectedXlabel = elem.options[elem.selectedIndex].getAttribute("original");
        svg.innerHTML = "";

        if (visualType == "bar") {

            svg.style.display = "inline";
            barChartHeaders(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width, Data_Source);
        }


        else if (visualType == 'line') {

            svg.style.display = "inline";
            lineChart(CSV_Data, headerOrig, selectedXlabel, "#svgChar", height, width), Data_Source;
        }


        console.log(e);
    },

    /**
     * The function is to reset everthing below the charts menu.
     * @param e
     */
    "click .chartTabs": function (e) {
        document.getElementById("charts").style.display = "none";
        document.getElementById('exportChart').style.display = 'none';
        resetOutputEmbed();
    },


    /**
     * this is the key up event function to check whether file name text box is empty or not. depends on this function
     * result that download image button become availabale to the user.
     * @param e
     */
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

    /**
     * the function creates the image of chart or mapbox map and allow user to download.
     * @param e
     */
    "click .downloadCharBtn": function (e) {
        var fileName = document.getElementById('downloadFileName').value;
        var canvas;

        if (visualType == 'map') {
            canvas = map.getCanvas();
            var a = document.createElement("a");
            a.download = fileName;
            a.href = canvas.toDataURL("image/png");
            a.click();
        }
        else {
            var svg = document.getElementById('svgChar');
            var svgWidth = svg.clientWidth;
            var svgHeight = svg.clientHeight;
            var svgData = new XMLSerializer().serializeToString(svg);

            canvas = document.createElement("canvas");
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
        }

    }
});
