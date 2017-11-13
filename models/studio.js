var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var studioSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    username: String,
    password: String,
    albums: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album"
        }
    ]
});

studioSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", studioSchema);