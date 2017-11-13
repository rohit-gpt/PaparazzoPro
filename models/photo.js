var mongoose = require("mongoose");

var photoSchema = new mongoose.Schema({
    url: String
});

module.exports = mongoose.model("Photo", photoSchema);