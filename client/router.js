/**
 * Created by digital on 21/06/16.
 */


Router.map(function () {
    this.route('/', function () {
        this.render('tab_csv');
    });

    this.route("/load_data", function () {
        this.render('load_data');
    });

    this.route("/csv_data", function () {
        this.render('tab_csv');
    });

    this.route("/api_data", function () {
        this.render('tab_api');
    })
});

