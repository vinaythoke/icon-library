/**
 * Icon Aliases Generator
 * 
 * This script scans the icon metadata and generates well-thought-out aliases 
 * for each icon based on its name, category, and subcategory.
 * The result is saved to the icon-aliases.json file.
 */

const fs = require('fs');
const path = require('path');

// File paths
const METADATA_FILE = path.join(process.cwd(), 'src', 'data', 'icon-metadata.json');
const ALIAS_FILE = path.join(process.cwd(), 'src', 'data', 'icon-aliases.json');

// Category-specific keywords mapping
const CATEGORY_KEYWORDS = {
  arrows: ['direction', 'pointer', 'navigation', 'movement', 'indicator'],
  commerce: ['shopping', 'business', 'money', 'retail', 'transaction', 'payment'],
  culture: ['art', 'tradition', 'heritage', 'society', 'diversity'],
  education: ['learning', 'school', 'knowledge', 'academic', 'study', 'teaching'],
  entertainment: ['fun', 'leisure', 'recreation', 'amusement', 'hobby', 'media'],
  essentials: ['basic', 'core', 'fundamental', 'necessary', 'key', 'standard'],
  office: ['workplace', 'business', 'corporate', 'professional', 'work'],
  social: ['connection', 'communication', 'network', 'community', 'sharing'],
  technology: ['digital', 'electronic', 'device', 'gadget', 'innovation', 'tech'],
  tools: ['utility', 'equipment', 'instrument', 'apparatus', 'implement'],
  travel: ['journey', 'trip', 'transport', 'vacation', 'tourism', 'movement']
};

// Icon-specific keyword mapping for common icons
const SPECIFIC_KEYWORDS = {
  'home': ['house', 'residence', 'dwelling', 'homepage', 'main'],
  'user': ['person', 'profile', 'account', 'member', 'individual'],
  'search': ['find', 'lookup', 'magnify', 'query', 'explore'],
  'phone': ['call', 'telephone', 'mobile', 'contact', 'cellular'],
  'email': ['mail', 'message', 'communication', 'contact', 'correspondence'],
  'heart': ['love', 'like', 'favorite', 'emotion', 'care'],
  'star': ['favorite', 'rating', 'bookmark', 'ranking', 'important'],
  'settings': ['preferences', 'options', 'configuration', 'setup', 'control'],
  'notification': ['alert', 'reminder', 'update', 'badge', 'attention'],
  'calendar': ['date', 'schedule', 'event', 'planner', 'appointment'],
  'location': ['place', 'position', 'map', 'pin', 'destination', 'gps'],
  'camera': ['photo', 'picture', 'image', 'snapshot', 'photography'],
  'document': ['file', 'paper', 'page', 'record', 'text'],
  'lock': ['security', 'protection', 'privacy', 'password', 'secure'],
  'chat': ['message', 'conversation', 'discussion', 'talk', 'dialogue'],
  'cart': ['shopping', 'basket', 'purchase', 'buy', 'checkout'],
  'play': ['start', 'video', 'audio', 'media', 'begin'],
  'pause': ['stop', 'halt', 'wait', 'break', 'interrupt'],
  'share': ['send', 'distribute', 'social', 'publish', 'forward'],
  'download': ['save', 'get', 'retrieve', 'obtain', 'fetch'],
  'upload': ['send', 'put', 'transfer', 'attach', 'submit'],
  'trash': ['delete', 'remove', 'bin', 'garbage', 'dispose'],
  'edit': ['modify', 'change', 'update', 'alter', 'revise'],
  'arrow': ['direction', 'pointer', 'indicator', 'move'],
  'menu': ['hamburger', 'list', 'navigation', 'options', 'selection']
};

// Direction-related keyword mapping
const DIRECTION_KEYWORDS = {
  'up': ['upward', 'ascending', 'northward', 'skyward', 'rise'],
  'down': ['downward', 'descending', 'southward', 'fall', 'lower'],
  'left': ['westward', 'backward', 'previous', 'lateral'],
  'right': ['eastward', 'forward', 'next', 'advance'],
  'top': ['upper', 'above', 'overhead', 'superior'],
  'bottom': ['lower', 'below', 'underneath', 'inferior']
};

// Action-related keyword mapping
const ACTION_KEYWORDS = {
  'add': ['plus', 'create', 'insert', 'include', 'append'],
  'remove': ['delete', 'subtract', 'eliminate', 'exclude', 'erase'],
  'check': ['verify', 'tick', 'confirm', 'validate', 'approve'],
  'close': ['shut', 'exit', 'dismiss', 'end', 'terminate'],
  'refresh': ['reload', 'update', 'renew', 'reset', 'synchronize'],
  'zoom': ['magnify', 'enlarge', 'scale', 'focus', 'expand']
};

// Shape-related keyword mapping
const SHAPE_KEYWORDS = {
  'circle': ['round', 'circular', 'disc', 'sphere', 'oval'],
  'square': ['rectangle', 'box', 'block', 'quadrilateral', 'equilateral'],
  'triangle': ['pyramid', 'wedge', 'delta', 'arrowhead', 'angular'],
  'line': ['stroke', 'path', 'straight', 'segment', 'linear']
};

// Function to generate appropriate aliases based on icon details
function generateAliases(icon) {
  const aliases = new Set();
  
  // Add category-specific keywords
  if (CATEGORY_KEYWORDS[icon.category]) {
    CATEGORY_KEYWORDS[icon.category].forEach(keyword => aliases.add(keyword));
  }
  
  // Parse the icon name and extract parts
  const nameParts = icon.name.split(/[-_]/).map(part => part.toLowerCase());
  
  // Check for specific icon matches
  nameParts.forEach(part => {
    if (SPECIFIC_KEYWORDS[part]) {
      SPECIFIC_KEYWORDS[part].forEach(keyword => aliases.add(keyword));
    }
    
    // Check for direction keywords
    if (DIRECTION_KEYWORDS[part]) {
      DIRECTION_KEYWORDS[part].forEach(keyword => aliases.add(keyword));
    }
    
    // Check for action keywords
    if (ACTION_KEYWORDS[part]) {
      ACTION_KEYWORDS[part].forEach(keyword => aliases.add(keyword));
    }
    
    // Check for shape keywords
    if (SHAPE_KEYWORDS[part]) {
      SHAPE_KEYWORDS[part].forEach(keyword => aliases.add(keyword));
    }
  });
  
  // Add subcategory as an alias if it's not in the name
  if (icon.subcategory && !nameParts.includes(icon.subcategory)) {
    aliases.add(icon.subcategory);
  }
  
  // Add opposite of direction (for a more complete set of associations)
  const opposites = {
    'up': 'down',
    'down': 'up',
    'left': 'right',
    'right': 'left',
    'top': 'bottom',
    'bottom': 'top'
  };
  
  nameParts.forEach(part => {
    if (opposites[part]) {
      aliases.add(`opposite-${opposites[part]}`);
      aliases.add(`not-${opposites[part]}`);
    }
  });
  
  // Add combined terms for multi-word names
  if (nameParts.length > 1) {
    aliases.add(nameParts.join(' ')); // Add space-separated variant
    aliases.add(nameParts.join('')); // Add concatenated variant
  }
  
  // For icons with both vertical and horizontal directions, add diagonal as keyword
  if ((nameParts.includes('up') || nameParts.includes('down') || nameParts.includes('top') || nameParts.includes('bottom')) &&
      (nameParts.includes('left') || nameParts.includes('right'))) {
    aliases.add('diagonal');
    aliases.add('corner');
  }
  
  // Add common use cases based on combinations
  if (icon.name.includes('arrow') && (icon.name.includes('down') || icon.name.includes('bottom'))) {
    aliases.add('download');
    aliases.add('dropdown');
  }
  
  if (icon.name.includes('arrow') && (icon.name.includes('up') || icon.name.includes('top'))) {
    aliases.add('upload');
    aliases.add('upward');
  }
  
  if (icon.name.includes('arrow') && icon.name.includes('refresh')) {
    aliases.add('sync');
    aliases.add('reload');
    aliases.add('update');
  }
  
  if (icon.name.includes('arrow') && icon.name.includes('circle')) {
    aliases.add('rotate');
    aliases.add('cycle');
    aliases.add('loop');
  }
  
  // Also add any custom keywords from the metadata
  if (icon.keywords && Array.isArray(icon.keywords)) {
    icon.keywords.forEach(keyword => aliases.add(keyword.toLowerCase()));
  }
  
  // Convert Set to Array and filter out any empty strings
  return Array.from(aliases).filter(alias => alias.trim() !== '');
}

// Main function to generate aliases for all icons
async function generateIconAliases() {
  try {
    // Check if metadata file exists
    if (!fs.existsSync(METADATA_FILE)) {
      console.error(`Metadata file not found: ${METADATA_FILE}`);
      console.error('Please run the generate-metadata.js script first.');
      process.exit(1);
    }
    
    // Read and parse metadata
    const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    console.log(`Loaded metadata for ${metadata.length} icons`);
    
    // Create alias mapping
    const aliasMap = {};
    
    // Process each icon
    let totalAliases = 0;
    let maxAliases = 0;
    let iconWithMostAliases = '';
    
    metadata.forEach(icon => {
      const iconPath = `${icon.category}/${icon.subcategory ? icon.subcategory + '/' : ''}${icon.name}`;
      const iconKey = `${icon.category}/${icon.subcategory ? icon.subcategory + '/' : ''}${icon.name}`.replace(/\\/g, '/');
      
      // Generate aliases
      const aliases = generateAliases(icon);
      
      // Add to alias map if we have aliases
      if (aliases.length > 0) {
        aliasMap[iconKey] = aliases;
        totalAliases += aliases.length;
        
        if (aliases.length > maxAliases) {
          maxAliases = aliases.length;
          iconWithMostAliases = iconKey;
        }
      }
    });
    
    // Ensure the output directory exists
    const outputDir = path.dirname(ALIAS_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write to file
    fs.writeFileSync(ALIAS_FILE, JSON.stringify(aliasMap, null, 2));
    
    // Log detailed summary
    console.log(`\nAliases generation summary:`);
    console.log(`=============================`);
    console.log(`Total icons with aliases: ${Object.keys(aliasMap).length}`);
    console.log(`Total aliases generated: ${totalAliases}`);
    console.log(`Average aliases per icon: ${(totalAliases / Object.keys(aliasMap).length).toFixed(2)}`);
    console.log(`Maximum aliases for one icon: ${maxAliases} (${iconWithMostAliases})`);
    console.log(`Icon with most aliases: ${iconWithMostAliases}`);
    console.log(`Example aliases for this icon: ${aliasMap[iconWithMostAliases].slice(0, 10).join(', ')}${aliasMap[iconWithMostAliases].length > 10 ? '...' : ''}`);
    console.log(`\nOutput file: ${ALIAS_FILE}`);
    
  } catch (error) {
    console.error('Error generating aliases:', error);
    process.exit(1);
  }
}

// Run the generator
generateIconAliases(); 