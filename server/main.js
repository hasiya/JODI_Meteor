import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    PostCSV:function (text) {
        HTTP.call('POST','http://127.0.0.1:5000/csv_data',{
            data:text
        });
    }
});
