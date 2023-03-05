const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
},
{
    timestamps: true,
});

const Service = mongoose.model("Service", ServiceSchema);

module.exports = { Service };