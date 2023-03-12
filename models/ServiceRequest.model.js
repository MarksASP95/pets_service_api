const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
    },
    servicesIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        }],
        required: true,
        validate: (v) => Array.isArray(v) && v.length > 0,
    },
    total: {
        type: Number,
        required: true,
        validate: (v) => v > 0,
    },
    status: {
        type: String,
        enum: ["due", "in_process", "done", "cancelled"],
    },
    reasonCancelled: {
        type: String,
        required: false,
    },
},
{
    timestamps: true,
    collection: "service_requests",
    toJSON: { virtuals: true, },
    toObject: { virtuals: true, }
});

ServiceRequestSchema.virtual("services", {
    ref: "Service",
    localField: "servicesIds",
    foreignField: "_id",
    justOne: false,
});

ServiceRequestSchema.virtual("pet", {
    ref: "Pet",
    localField: "petId",
    foreignField: "_id",
    justOne: true,
});

const ServiceRequest = mongoose.model("ServiceRequest", ServiceRequestSchema);

module.exports = { ServiceRequest };