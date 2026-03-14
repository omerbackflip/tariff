const path = require('path');

module.exports = {
	ServerApp : {
		google: {
			apiKeyForPicker: 'AIzaSyB7JIngRxWywC2D2Ua92lYjbO7U4igfwSk', // picker API Key
			locale: 'en', //https://developers.google.com/drive/picker/reference/picker.locales.md
			pickerRootFolder: ['1mj97GijYbyEhNvElxPN2gAvSOOeC0TFw'], // this is the id of "pick up root" folder in Google-Drive
		},
		models : {
			invoice : 'invoices'
		},
		configFolderPath: path.join(__dirname ) + '/',
	}
};