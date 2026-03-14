// looks that some tutorials can be found here... https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file

const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const { ServerApp } = require('../config/constants');
const { auth } = require('google-auth-library');
const db = require("../models");


const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', 
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  "https://www.googleapis.com/auth/spreadsheets.readonly", // access to Google Sheets
];
const TOKEN_PATH = path.join(ServerApp.configFolderPath, 'token.json');
const SPREADSHEET_ID = "1qS8rb0RDkOwVCuH7McXPYrlvrfctLFSaQ2hpFrmtbI0"; // sheet ID
// const SPREADSHEET_ID = "10wuqAFC59GPQgRAoDt5pZRKkXzo8celDQx4Kb9Sh7GQ"; // test sheet ID located in "שיווק"
const RANGE = "'לידים'!A:G"; // Using quotes for Hebrew sheet names

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // 'online' (default) or 'offline' (gets refresh_token). IMPORTANT NOTE - The refresh_token is only returned on the first authorization.
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);

  return authUrl;
}

// getAuthClient:
// Creates and returns a new OAuth2Client instance using credentials stored in google-credentials.json.
// Does not handle the token; it only sets up the client with the necessary credentials.
exports.getAuthClient = () => {
  const credentials = JSON.parse(fs.readFileSync(ServerApp.configFolderPath + 'google-credentials.json'));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  return oAuth2Client;
}

// getAuth:
// Uses the OAuth2Client created by getAuthClient and attempts to load and set credentials (tokens) for the client.
// Handles both existing tokens and the process for obtaining a new token

exports.getAuth = async () => {

  const oAuth2Client = this.getAuthClient();

  if (fs.existsSync(TOKEN_PATH)) {
    let token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));

    console.log('oAuth2Client.isTokenExpiring()', oAuth2Client.isTokenExpiring());
    
    //Checking If access token is expired
    if(oAuth2Client.isTokenExpiring()){
      try{
        //Requesting, new access token.
        await this.refreshAccessToken(oAuth2Client, JSON.parse(token)['refresh_token']);
        const oAuth2ClientUpd = await this.getAuthClient();
        token = fs.readFileSync(TOKEN_PATH);
        oAuth2ClientUpd.setCredentials(JSON.parse(token));

        return oAuth2ClientUpd;
      }catch(authError){
        //authError.message
        //console.log("Auth Error:", authError.message);
      }
    }else{
      return oAuth2Client;
    }
  }

  return getNewToken(oAuth2Client);
}


exports.getToken = async (oAuth2Client, code) => {

  const {tokens} = await oAuth2Client.getToken(code)

  if(tokens && tokens.access_token){
    this.storeToken(JSON.stringify(tokens));
    return tokens;
  }

  return false;
}

exports.refreshAccessToken = async (oAuth2Client,refreshToken) => {
  try {
    
    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const response = await oAuth2Client.getAccessToken();
    
    if(response.token && response.res.data){
      this.storeToken(JSON.stringify(response.res.data));
    }
     // Save updated token
    console.log("Access token refreshed successfully!");
    return response.res.data;
  } catch (error) {
    console.error("Error refreshing access token:", error);

    if(error.message == 'invalid_grant'){
      return false;
    }

    throw error;
  }
};

exports.storeToken = async (token) => {
  try{
    fs.writeFileSync(TOKEN_PATH,token);
  }catch (error){
    console.log("Error! While storing google token", error);
  }
}

exports.getUser = async (oAuth2Client) => {
  try{

    const oauth2 = google.oauth2({
        auth: oAuth2Client,
        version: 'v2',
    });

    const userInfo = await oauth2.userinfo.get();

    return userInfo.data;

  } catch (error) {
    console.log(error);
    return false;
  }
}

exports.uploadToGoogleDrive = async (oAuth2Client, filename) => {
  const drive = google.drive({ version: 'v3', auth: oAuth2Client }); // auth object was "require" above...

  const filePath = path.join(ServerApp.uploadFolderPath, filename);
  const fileMetadata = {
    name: filename,
    parents: ServerApp.google.invoiceFolderIds,
  };
  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    body: fs.createReadStream(filePath),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true,
    });

    // console.log('file.data', file.data);
    // console.log('file', file);

    return file.data;
  } catch (error) {
    console.error('Error uploading the file to google drive:', error);
    return false;
  }
}

exports.uploadInvoiceToGoogleDrive = async (oAuth2Client, filename, folderPath = null) => {

  const drive = google.drive({ version: 'v3', auth: oAuth2Client });

  let parentFolderId = ServerApp.google.storeInvoiceFolderIds;
  parentFolderId = parentFolderId[0];
  //console.log(folderPath,parentFolderId[0]);
  if(folderPath){
    const folderParts = folderPath.split('/');
    for (const part of folderParts) {
      parentFolderId = await findOrCreateFolder(part, parentFolderId, drive);
      parentFolderId = parentFolderId;
    }
  }

  if(parentFolderId){

      const fileMetadata = {
        name: filename,
        parents: [parentFolderId],
      };
      const filePath = path.join(ServerApp.uploadFolderPath, filename);
      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath),
      };

      try {
        // Upload file to Google Drive
        const file = await drive.files.create({
          resource: fileMetadata,
          media: media,
          fields: 'id, name',
          supportsAllDrives: true,
        });

        await drive.permissions.create({
          fileId: file.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        const readableUrl = `https://docs.google.com/file/d/${file.data.id}/preview?usp=drivesdk`;

        return { id: file.data.id, name: file.data.name, url: readableUrl };

    } catch (error) {
      console.error('Error uploading the file to Google Drive:', error);

    }
  }else{
    return false;
  }
};

async function findOrCreateFolder(folderName, parentFolderId, drive) {
  try {
    const trimmedFolderName = folderName.trim();

    // Construct the search query
    const searchQuery = `${parentFolderId ? `'${parentFolderId}' in parents and ` : ''}name = '${trimmedFolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    // Search for the folder
    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.data.files.length > 0) {
      // Folder exists, return its ID
      console.log(`Folder exists: ${trimmedFolderName} (ID: ${response.data.files[0].id})`);
      return response.data.files[0].id;
    }

    // Folder doesn't exist, create it
    console.log(`Folder not found. Creating folder: ${trimmedFolderName}`);
    const folderMetadata = {
      name: trimmedFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentFolderId && { parents: [parentFolderId] }),
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id, name',
      supportsAllDrives: true,
    });

    console.log(`Folder created: ${trimmedFolderName} (ID: ${folder.data.id})`);
    return folder.data.id;

  } catch (error) {
    console.error(`Error finding or creating folder '${folderName}':`, error.message);
    throw error;
  }
}

// fetch data from Google Sheet and save to UPLOAD_MODEL
exports.fetchNewRows = async (UPLOAD_MODEL) => {
  const auth = await this.getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    let rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return;
    }

    // Skip the first row (headers)
    rows = rows.slice(1);

    // Fetch last loaded row index from db (use description as stringified index)
    let lastLoad = await db.tables.findOne({ table_id: 99, table_code: 80 });
    const lastRowIndex = parseInt(lastLoad?.description || '0', 10);

    console.log("Last loaded row index:", lastRowIndex);

    // Get new rows from the last loaded position + 1
    const newRows = rows.slice(lastRowIndex + 1);

    console.log("Total rows:", rows.length);
    console.log("New rows to upload:", newRows.length);

    if (newRows.length > 0) {
      for (const row of newRows) {
        const [createdAt, name, phone, email, interested, adName, arrivedFrom] = row;
        const formattedPhone = formatPhoneNumber(phone);
        await UPLOAD_MODEL.create({ name, phone: formattedPhone, email, interested, adName, arrivedFrom });
      }

      // Save the last loaded row index
      const newLastIndex = lastRowIndex + newRows.length;
      await db.tables.findOneAndUpdate(
        { table_id: 99, table_code: 80 },
        { description: newLastIndex.toString() }
      );
    }

    console.log(`Fetched ${newRows.length} new rows from Google Sheets.`);
    return newRows.length;
  } catch (error) {
    console.error("Error fetching Google Sheets data:", error);
  }
};


// Helper function to format phone numbers to Israeli format (0xxxxxxxxx)
// Converts +972xxxxxxxxx to 0xxxxxxxxx, or keeps 0xxxxxxxxx format as is
function formatPhoneNumber(phone) {
  if (!phone) return phone;
  
  // Convert to string and trim whitespace
  let formattedPhone = String(phone).trim();
  
  // Remove any hyphens, spaces, or other common separators
  formattedPhone = formattedPhone.replace(/[\s\-().]/g, '');
  
  // If starts with +972, replace with 0
  if (formattedPhone.startsWith('+972')) {
    formattedPhone = '0' + formattedPhone.slice(4);
  }
  // If starts with 972 (without +), replace with 0
  else if (formattedPhone.startsWith('972') && !formattedPhone.startsWith('0')) {
    formattedPhone = '0' + formattedPhone.slice(3);
  }
  
  return formattedPhone;
}

// Helper function to check if a date matches the exact format: "YYYY-MM-DD HH:MM:SS"
function isValidDateFormat(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return regex.test(dateStr);
}
