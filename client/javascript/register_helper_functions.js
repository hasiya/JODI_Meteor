/**
 * Created by Rajitha Hasith on 10/08/2016.
 * This file contains all the Template Register Helper functions.
 * Template-registerHelper defines a function that can be access from any template in the application.
 *
 * Doc: https://docs.meteor.com/api/templates.html#Template-registerHelper
 */

/**
 * the getID helper function is used in load_data template. Function is used to create an ID for the each search data
 * div container. The helper function takes an string (Data set name in this case), trim the head and tail white spaces
 * and remove spaces in the string.
 */
Template.registerHelper("getID", function (name) {
    // var date = new Date(dateTime);

    return name.trim().replace(/\s/g, '');
});

/**
 * the dateTime function returns a formatted data and time to the template.
 * the function is called in load_data template to display the data and time of the data sets uploaded.
 */
Template.registerHelper("dateTime", function (dateTime) {
    // var date = new Date(dateTime);

    return moment(dateTime).format('DD-MM-YYYY, HH:mm');
});

/**
 * the function checks the two parameters are equal or not, returns a boolean value.
 * the 'isEqual' function is used in 'visualisation_all' template to set the selected option of column tyep drop down
 * menu.
 */
Template.registerHelper("isEqual", function (type1, type2) {

    return type1 == type2
});