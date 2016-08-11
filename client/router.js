/**
 * Created by Rajitha Hasith on 21/06/16.
 *
 */

/**
 * The Iron Router map function. which maps the routs of the web application.
 *
 * Doc: http://iron-meteor.github.io/iron-router/
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

