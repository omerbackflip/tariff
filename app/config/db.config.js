// In the app folder, we create a separate config folder for configuration
// with db.config.js file like this:

// module.exports = {
//   url: "mongodb://localhost:27017/tariff"
// };

module.exports = {
  url: process.env.DB_CONNECTION_STRING,
};