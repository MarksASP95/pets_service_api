const mongoose = require("mongoose");
require("dotenv").config();

async function mongoConnect() {
    return mongoose.connect(process.env.DATABASE_URL);
}

module.exports = mongoConnect;