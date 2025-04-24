/**
 * Refresh Script
 * 
 * This script refreshes metadata and aliases, then restarts the development server.
 * Useful for when you've added new icons and need to quickly update everything.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Refreshing Icon Library data...');

try {
  // Run in the project root directory
  const rootDir = path.join(__dirname, '..');
  
  console.log('\n📄 Generating icon metadata...');
  execSync('npm run generate-metadata', { stdio: 'inherit', cwd: rootDir });
  
  console.log('\n🏷️  Generating icon aliases...');
  execSync('npm run generate-aliases', { stdio: 'inherit', cwd: rootDir });
  
  console.log('\n✅ All data refreshed successfully!');
  console.log('\n🚀 Restarting development server...');
  
  // Restart the dev server
  execSync('npm run dev', { stdio: 'inherit', cwd: rootDir });
  
} catch (error) {
  console.error('\n❌ Error refreshing icon library data:', error.message);
  process.exit(1);
} 