const mongoose = require("mongoose");
const { Owner } = require("./Owner.model");

const PetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
    },
    size: {
        type: String,
        enum: ["small", "medium", "big", "giant"],
    },
},
{
    timestamps: true,
    toJSON: { virtuals: true, },
    toObject: { virtuals: true, }
});

PetSchema.virtual("owner", {
    ref: "Owner",
    localField: "ownerId",
    foreignField: "_id",
    justOne: true,
});

const Pet = mongoose.model("Pet", PetSchema);

module.exports = { Pet };