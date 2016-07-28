/**
 * Created by RajithaHasith on 28/07/2016.
 */
var hit_source = [];
var hit_sourceDep = new Tracker.Dependency();

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
        // var hit_source = []
        //
        // if(hits.length > 0){
        //     hits.forEach(function (hit) {
        //         hit_source.push(hit['_source']);
        //     })
        // }
        // console.log(hit_source)


    },
});