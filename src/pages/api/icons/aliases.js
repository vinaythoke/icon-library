import fs from 'fs';
import path from 'path';

// Load aliases data
let iconAliases = {};
const aliasPath = path.join(process.cwd(), 'src', 'data', 'icon-aliases.json');

try {
  if (fs.existsSync(aliasPath)) {
    iconAliases = JSON.parse(fs.readFileSync(aliasPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading icon aliases:', error);
}

export default function handler(req, res) {
  // Get the icon key from the query parameters
  const { iconKey } = req.query;
  
  if (!iconKey) {
    return res.status(400).json({ 
      error: 'Missing iconKey parameter',
      message: 'Please provide an iconKey parameter' 
    });
  }
  
  // Get aliases for the requested icon key
  const aliases = iconAliases[iconKey] || [];
  
  // Return the aliases as JSON
  res.status(200).json({
    iconKey,
    aliases
  });
} 