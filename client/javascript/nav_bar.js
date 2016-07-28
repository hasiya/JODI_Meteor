// var pythonServer = "localhost:5000";

function createSearchDataset(hits) {
    var dataListNode = document.getElementById("searchData");
    dataListNode.innerHTML = "";
    hits.forEach(function (hit) {
        var optionNode = document.createElement('option');
        optionNode.value = hit['dataset_name'];
        dataListNode.appendChild(optionNode);
    })


}
Template.navbar2.events({
    /*"keyup .inputSearch": function (e) {
     e.preventDefault();
     console.log(e);
     var target = e.currentTarget;
     var searchTerm = target.value;
     var hits = [];
     if(searchTerm){
     $.ajax({
     method: "GET",
     url: "http://" + pythonServer + "/search_dataset/"+searchTerm,
     success: function (data) {
     hits = data;
     console.log(hits)
     var hit_source = []

     if(hits.length > 0){
     hits.forEach(function (hit) {
     hit_source.push(hit['_source']);
     })
     }
     console.log(hit_source);
     createSearchDataset(hit_source);
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


     },*/
    "submit .searchForm": function (e) {
        e.preventDefault();
    }
});
