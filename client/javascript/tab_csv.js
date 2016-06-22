var CSV_keys;
var CSV_Data;
var editor;

function linesMatch(lines) {

    var lineMatch = {
        "lineMatch": true,
        "lineNum":0
    };
    // var linesMatch = true;
    var lineNum = 1;
    lines.forEach(function (l) {
        if(l.split(',').length != lines[0].split(',').length){
            lineMatch["lineMatch"] = false;
            lineMatch["lineNum"] = lineNum;
            return lineMatch;
        }
        lineNum++;
    });
    return lineMatch;
}
function getkeys() {
    var panel = document.getElementById("panel");
    panel.style.display = "inline";
    
    var innerHtml = "";
    for(i=0; i<CSV_keys.length;i++){
        innerHtml +=
            "<div class='row top-buffer'>" +
                "<div class='col-md-4 col-md-offset-1'>"+
                    "<form class='form-inline'>" +
                        "<fieldset class='form-group'>" +
                            "<input type='text' readonly id='"+CSV_keys[i]+"' class='form-control' value='"+CSV_keys[i]+"'>" +
                        "</fieldset>" +
                        "<button type='button' id='"+CSV_keys[i]+"' class='csvHeaderEdit btn btn-default btn-sm'>"+
                            "<span class='glyphicon glyphicon-edit'></span>"+
                        "</button>"+
                    "</form>"+
                "</div>" +
                "<div class='col-md-4'>" +
                    "<select id='selectbasicTypeTour' name='selectbasicTypeTour' class='form-control'>"+
                        "<option value='string'>String</option>"+
                        "<option value='number'>Number</option>"+
                        "<option value='string'>Lon</option>"+
                        "<option value='string'>Lat</option>"+
                    "</select>" +
                "</div>" +
                "<div class='col-md-4'>" +
                    "" +
                "</div>" +
            "</div>";
    }
    var button =
        "<div class='pull-right btn-toolbar'>" +
            "<button class='pull-right btn-primary btn PanelDone' >Done</button>" +
        " </div>";
    innerHtml +=button;
    panel.innerHTML= innerHtml;
}


Template.tab_csv.rendered = function() {
    editor = CodeMirror.fromTextArea(this.find("#codemirror_id"), {
        lineNumbers: true,
        lineWrapping:true,
        mode:"Plain Text",
        placeholder:"Paste your CSV file content or drag and drop the file here..."
    });
}

Template.tab_csv.helpers({

    "editorOptions": function () {
        return {
            lineNumbers: true,
            lineWrapping:true,
            mode:"Plain Text",
            placeholder:"Paste your CSV file content or drag and drop the file here..."
        }

    },
    
    getKey: function () {
        a = 1;
        return CSV_keys
    },
    
    getData: function () {
        return CSV_Data;
    }
    
});

if(!$("#codemirror_id").val()){
    console.log("empty!");
}

Template.tab_csv.events({

    "keyup .CodeMirror":function (e,t) {
        console.log(e);
        var text = editor.getValue();
        if(!text){
            var panel = document.getElementById("panel");
            panel.style.display = "none";
            panel.innerHTML = "";
            var Message = $("#message");
            Message.html("");
        }

    },

    "change .CodeMirror":function (e,t) {
        var text = editor.getValue();
        if(!text){
            var panel = document.getElementById("panel");
            panel.style.display = "none";
            panel.innerHTML = "";
            var Message = $("#message");
            Message.html("");
        }

    },

    "drop .CodeMirror":function (e) {
        console.log(e);

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        panel.innerHTML = "";
        var Message = $("#message");
        Message.html("");
    },

    "paste .CodeMirror":function (e) {
        console.log(e);

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        panel.innerHTML = "";
        var Message = $("#message");
        Message.html("");
    },

    "click .ProcessCSV":function (e, t) {
        // var text = t.find("#codemirror_id").value;
        var text = editor.getValue();
        var lines = text.split('\n');

        if(lines.length > 1){
            var lineMatch = linesMatch(lines);
            if(lineMatch["lineMatch"]){
                $.ajax({
                    method:"POST",
                    url:"http://127.0.0.1:5000/csv_data",
                    data:{
                        'data':text
                    },
                    success: function(data){
                        console.log(data);
                        CSV_Data = data;
                        CSV_keys = Object.keys(data[0]);
                        getkeys();
                        var Message = $("#message");
                        Message.html("");
                    }
                });
            }
            else {
                var Message = $("#message");
                Message.html("There is the problem in line: "+ lineMatch["lineNum"]);
            }
        }
    },

    "click .ClearCSV":function (e,t) {
        editor.setValue("");

        var panel = document.getElementById("panel");
        panel.style.display = "none";
        panel.innerHTML = "";
        var Message = $("#message");
        Message.html("");
    },

    "click .csvHeaderEdit":function (e) {
        var elem = e.currentTarget;
        var id = elem.id;
        var textbox = document.getElementById(id);
        if(textbox.readOnly) {
            elem.innerHTML = "<span class='glyphicon glyphicon-ok'></span>"
            textbox.readOnly = false;
        }else {
            elem.innerHTML = "<span class='glyphicon glyphicon-edit'></span>"
            textbox.readOnly = true;
        }
    }
});