var mongoose = require("mongoose");

var albumSchema = new mongoose.Schema({
    name: String,
    date: Date,
    venue: String,
    photos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Photo"
        }
    ]
});

module.exports = mongoose.model("Album", albumSchema);