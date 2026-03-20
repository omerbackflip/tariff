const path = require('path');

module.exports = {
	ServerApp : {
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
	}
};