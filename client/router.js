/**
 * Created by digital on 21/06/16.
 */


Router.map(function () {
    this.route('/', function () {
        this.render('home');
    });

    this.route("/load_data", function () {
        this.render('load_data');
    })
});

