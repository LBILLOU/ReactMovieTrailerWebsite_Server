/**
 * Created by rano on 22/01/17.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('userCollection', new Schema({
        password: {type: String, null: true, selected: false},
        email: {type: String, null: false, unique: true},
        token: {type: String, null: true},
        _id: {type: String, null: false, immutable: false}
    },
    {
        versionKey: false // You should be aware of the outcome after set to false
    }));