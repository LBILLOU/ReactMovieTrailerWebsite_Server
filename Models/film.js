/**
 * Created by rano on 23/01/17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('filmCollection', new Schema({
    title: {type: String, null: false, immutable : true },
    release_date: {type:Number , null: false},
    director: {type: String, null: false},
    type: [{type: String,enum: ['Comedy', 'Drama', 'Action','Adventure','Comedy','Crime','Drama','Historical','Horror','Musical','Science Fiction','Western','Other'], null: false}],
    cast: {type: String, null: true},
    upload_date:{type: Date, null: false},
    uploader:{type: String, null: false},
    trailer_link:{type: String, null: false},
    image:{type:String, null: false}
})
)