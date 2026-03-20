const db = require("../models");
const UPLOAD_MODEL = db.dekels; // Change this to the appropriate model for Excel uploads (e.g., db.dekels if you want to save to dekels collection)
const csv = require('csvtojson');
var fs = require('fs');
const XLSX = require('xlsx');
const { transformCSVData, storeMedia } = require("../util/util");
const specificService = require("../services/specific-service");
const { url } = require("../config/db.config");
const path = require('path');
const { ServerApp } = require("../config/constants");

// const { HOLDER_MODEL } = require("../../client/src/constants/constants");
// const HOLDER_MODEL = db.holders;

// **************** EXAMPLE FILE FOR SPECIFIC CONTROLLERS ************* //

exports.saveExcelBulk = async (req, res) => {
	try {
        await UPLOAD_MODEL.deleteMany();
		var workbook = XLSX.readFile(`uploads/${req.file.filename}`,{type: 'binary', cellDates: true, dateNF: 'dd/mm/yyyy;@'});
		var sheet_name_list = workbook.SheetNames;
		const data = transformCSVData(sheet_name_list , workbook);
        let excelData = specificService.getExcelToSave(data[0]);
		if (excelData) {
			const result = await UPLOAD_MODEL.insertMany(excelData, { ordered: true });
			unLinkFile(`uploads/${req.file.filename}`);
			if (result) {
				return res.send({
					success: true,
					message: `Total ${result.length} to ${UPLOAD_MODEL} successfully Imported`
				})
			}
		}

	} catch (error) {
		console.log(error)
		res.status(500).send({
			message: "Error saving bulk of the read Excel"
		});
	}
};

exports.getDbInfo = (req,res) => {
	try {
		// const local = url.includes('localhost'); //retuens true/false
		const local = url.includes('127.0.0.1'); //retuens true/false
		return res.send({ success: true, local});
	} catch (error) {
		console.log(error)
		res.status(500).send({ message: "Error getting db info", error });
	}
};

exports.savePic = async(req, res) => {
	try {
		const media = { ...req.body };
		if(media && media.fileContent){
			let picName = storeMedia(media.fileContent); // save the pics
			res.send(picName);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error while savePic function in specifc.controller.js file"});
	}
}

exports.deletePic = async(req, res) => {
	try {
		const fileName = req.body;
		let uploadFolder = path.join(__dirname + '/../../client/' + process.env.VUE_APP_MEDIA_FILES_REL_DIR_PATH);
		// fs.unlink(uploadFolder + fileName,() => {}) // fs.unlink must have callback - so dummy callback was added
		unLinkFile(uploadFolder + fileName)
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error while deletePic function in specifc.controller.js file"});
	}
}


exports.bulkWriteControl = async (req, res) => {
	try {
		const items = req.body
		const {flatId,bill_id} = items[0]
		const itemIds = items.filter(i => i._id).map(i => i._id); // Extract existing IDs

		// Step 1: Find existing items for this flatId
		const existingItems = await db[req.query.model].find({ flatId: flatId, bill_id:bill_id });
		const existingItemIds = existingItems.map(item => item._id.toString());

		// Step 2: Determine which items to insert, update, or delete
		const bulkOps = [];
		items.forEach(item => {
			if (item._id) { // Update existing item
				bulkOps.push({
					updateOne: {filter: { _id: item._id },update: { $set: item }}
				});
			} else { // Insert new item
				bulkOps.push({
					insertOne: { document: {...item} }
				});
			}
		});

		// Step 3: Delete missing items
		const itemsToDelete = existingItemIds.filter(id => !itemIds.includes(id));
		if (itemsToDelete.length > 0) {
			bulkOps.push({
				deleteMany: {filter: { _id: { $in: itemsToDelete } }
				}
			});
		}
		const data = await specificService.bulkWriteService(db[req.query.model], bulkOps);
		if (data) {
			res.send(data);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send({message: error.message || "Some error occurred while create entity."});
	}
};

function unLinkFile(path) {
	fs.unlinkSync(path);
}
