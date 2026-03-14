/**
 * Run this file with:
 *    node checkGoogleAuthType.js
 *
 * It scans your project for Google Drive API credentials
 * and prints which authentication method is being used.
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();

function findGoogleFiles(dir) {
  const result = [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!item.includes('node_modules')) {
        result.push(...findGoogleFiles(fullPath));
      }
    } else if (
      item.match(/google|drive|auth|service|api/i) &&
      item.endsWith('.js')
    ) {
      result.push(fullPath);
    }
  }
  return result;
}

function checkAuthType(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  if (content.includes('google.auth.GoogleAuth') || content.includes('keyFile')) {
    results.push('🟢 Service Account (uses JSON key file)');
  }
  if (content.includes('google.auth.OAuth2') || content.includes('oAuth2Client')) {
    results.push('🟡 OAuth2 Client (user login flow)');
  }
  if (content.includes('apiKey') || content.includes('gapi.client.init')) {
    results.push('🔵 API Key (public access, no login)');
  }

  if (results.length === 0) {
    results.push('⚪ No Google auth method detected');
  }

  console.log(`\n📄 ${filePath}`);
  results.forEach(r => console.log('   →', r));
}

console.log(`\n🔍 Scanning ${projectDir} for Google API usage...\n`);
const files = findGoogleFiles(projectDir);

if (files.length === 0) {
  console.log('No related files found (no matches for google/drive/auth/api).');
  process.exit(0);
}

files.forEach(checkAuthType);
console.log('\n✅ Scan complete.\n');
