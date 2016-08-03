/**
 * Created by RajithaHasith on 03/08/2016.
 */

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

function setUpCount() {
    CSV_Data.forEach(function (c) {
        c.Count = 1;
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


Template.tab_api.events({
    "click .loadApi": function (e) {
        e.preventDefault();
        var url = document.getElementById("apiUrl").value;

        // d3.json(url,function (data) {
        //     console.log(data);
        // });

        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_api_data",
            data: url,
            // contentType: 'application/json',
            success: function (data) {
                var j_data = JSON.parse(data);
                console.log(j_data);

                CSV_Data = j_data['RoadClosureReports'];
                CSV_keys = Object.keys(j_data['RoadClosureReports'][0]);


                setUpCount();

                setUpPanel();
                document.getElementById("panel").style.display = "inline";

            }
        });

        // d3.csv(url,function (data) {
        //     console.log(data);
        // });
        // var xhr = createCORSRequest('GET', url);
        // if (!xhr) {
        //     alert('CORS not supported');
        //     return;
        // }
        //
        // // Response handlers.
        // xhr.onload = function() {
        //     var text = xhr.responseText;
        //     console.log(text);
        //
        // };
        //
        // xhr.onerror = function() {
        //     alert('Woops, there was an error making the request.');
        // };
        //
        // xhr.send();
    }
});
