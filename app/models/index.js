const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

db.tables = require("./table.model.js")(mongoose);
db.binarits = require("./binarit.model.js")(mongoose);
db.dekels = require("./dekel.model.js")(mongoose);

module.exports = db; 