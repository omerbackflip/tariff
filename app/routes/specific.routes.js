const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

// Save Bulk of Specific
// **************** EXAMPLE FILE FOR SPECIFIC ROUTES ************* //

module.exports = app => {
  const specific = require("../controllers/specific.controller.js");

  var router = require("express").Router();

  router.post("/save-excel-bulk",upload.single('file'), specific.saveExcelBulk);
  router.get("/get-database-info", specific.getDbInfo);
	router.post("/save-pic", specific.savePic);
	router.post("/delete-pic", specific.deletePic);
	router.post("/bulk-write", specific.bulkWriteControl);

  //Google auth  
  router.get("/get-google-connection-status", specific.googleConnectionStatus);
  router.get("/google-auth-handler", specific.googleAuthHandler); // in looks not used - it is not called from specificServiceEndPoints.js like other functions
  router.get("/sync-google-sheets", specific.syncGoogleSheets);
  app.use('/api/specific', router);
};