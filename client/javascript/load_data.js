/**
 * Created by RajithaHasith on 28/07/2016.
 */
var hit_source = [];
var hit_sourceDep = new Tracker.Dependency();


function setUpPanel() {
    headerValues = [];

    CSV_keys.forEach(function (key) {
        var keyItem = {
            "originalVal": key,
            "presentVal": key,
            "type": "",
            "deleted": false,
            "valCount": {}
        };
        headerValues.push(keyItem);

    });

    CSV_keys.forEach(function (k) {

        if (k.toLowerCase() == "longitude") {
            var test = document.getElementById("type_" + k);
            document.getElementById("type_" + k).value = "lon";
        }
        else if (k.toLowerCase() == "latitude") {
            document.getElementById("type_" + k).value = "lat";
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
                    document.getElementById("type_" + k).value = "number";
                }
            }
        }
    });
}


Template.load_data.helpers({
    getSearchData: function () {
        hit_sourceDep.depend();
        return hit_source;
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
                        })
                    }
                    else {
                        hit_source = [];
                        hit_sourceDep.changed();
                    }
                    console.log(hit_source);
                    // createSearchDataset(hit_source);
                }
            });

            // console.log(hits)
        }
        else {
            hit_source = [];
            hit_sourceDep.changed();
        }
        // var hit_source = []
        //
        // if(hits.length > 0){
        //     hits.forEach(function (hit) {
        //         hit_source.push(hit['_source']);
        //     })
        // }
        // console.log(hit_source)


    },

    "click .loadData": function (e) {
        var elem = e.currentTarget;
        var dataset_name = elem.value;

        var doc = {};

        $.ajax({
            method: "GET",
            url: "http://" + pythonServer + "/get_dataset/" + dataset_name,
            success: function (data) {
                doc = data;
                console.log(doc);
                CSV_Data = doc['dataset'];
                CSV_keys = doc['headers'];
                csv_key_dep.changed();


                console.log(CSV_Data);
                document.getElementById("panel").style.display = "inline";
                // setUpPanel();

                // createSearchDataset(hit_source);
            }
        });
    }
});