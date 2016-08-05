/**
 * Created by RajithaHasith on 03/08/2016.
 */
// import "/imports/libs/xml2json";

var apiType;

var xml_conv = new X2JS();
var Message = $("#message");


function setUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
    });
}

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
                // document.getElementById("panel").style.display = "inline";
                // elem.disabled = false;
                var csvDataName = document.getElementById("csvDataName").value = "";
                Message.html("Data Stored in Database...")
            }

            console.log(data);
        }
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


Template.tab_api.events({
    "click .getApi": function (e) {
        e.preventDefault();
        var url = document.getElementById("apiUrl").value;
        var data_path = document.getElementById("apiDataPath").value;

        var j_data;
        var dataset;

        var Message = $("#message");
        Message.html("");
        // d3.json(url,function (data) {
        //     console.log(data);
        // });

        // var apiData = {
        //     url: url,
        //     data_type: apiType
        // }

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
                    j_data = xml_conv.xml_str2json(data);
                    dataset = get_api_Data(j_data, data_path)
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
            }

        });


    },

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

    "keyup .apiUrl": function (e) {
        var url_val = e.currentTarget.value;
        var api_path_val = document.getElementById("apiDataPath").value;

        document.getElementById("getApi").disabled = !(/\S/.test(url_val) && /\S/.test(api_path_val) && (apiType));
        Message.html("");

    },

    "keyup .apiDataPath": function (e) {
        var api_path_val = e.currentTarget.value;
        var url_val = document.getElementById("apiUrl").value;

        document.getElementById("getApi").disabled = !(/\S/.test(url_val) && /\S/.test(api_path_val) && (apiType));
        Message.html("");


    },

    "click .storeDataBtn": function (e) {
        var elem = e.currentTarget;
        var csvDataName = document.getElementById("csvDataName");
        var csvPersonName = document.getElementById("PersonName");
        var csvDataSource = document.getElementById("DataSource");
        var url = document.getElementById("apiUrl").value;
        var data_path = document.getElementById("apiDataPath").value;

        var dataInfo = {
            dataset_name: csvDataName.value,
            person_name: csvPersonName.value,
            data_source: csvDataSource.value,
        };
        // Data_Source = csvDataSource.value;

        // var text = Code_Editor.getValue();

        elem.disabled = true;
        insertData(dataInfo, url, data_path, apiType);
        Message.html("");


    },

    "keyup .csvDataName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var personTxt = document.getElementById("PersonName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && personTxt && dataSourceTxt);
        Message.html("");


    },

    "keyup .PersonName": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var dataSourceTxt = document.getElementById("DataSource").value;
        var storeBtn = document.getElementById("storeDataBtn");


        storeBtn.disabled = !(elemVal && dataNameTxt && dataSourceTxt);
        Message.html("");


    },

    "keyup .DataSource": function (e) {
        var elem = e.currentTarget;
        var elemVal = elem.value;
        var dataNameTxt = document.getElementById("csvDataName").value;
        var personTxt = document.getElementById("PersonName").value;
        var storeBtn = document.getElementById("storeDataBtn");

        storeBtn.disabled = !(elemVal && dataNameTxt && personTxt);
        Message.html("");


    },



});
