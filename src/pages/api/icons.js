import fs from 'fs';
import path from 'path';

// Import our metadata, if it exists
let iconMetadata = [];
const metadataPath = path.join(process.cwd(), 'src', 'data', 'icon-metadata.json');

try {
  if (fs.existsSync(metadataPath)) {
    iconMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`Loaded metadata for ${iconMetadata.length} icons`);
  } else {
    console.warn('Icon metadata file not found. Please run "npm run generate-metadata" first.');
  }
} catch (error) {
  console.error('Error loading icon metadata:', error);
}

// Load aliases for better search capability
let iconAliases = {};
const aliasPath = path.join(process.cwd(), 'src', 'data', 'icon-aliases.json');

try {
  if (fs.existsSync(aliasPath)) {
    iconAliases = JSON.parse(fs.readFileSync(aliasPath, 'utf8'));
    console.log(`Loaded aliases for ${Object.keys(iconAliases).length} icons`);
  } else {
    console.warn('Icon aliases file not found. Search may be limited.');
  }
} catch (error) {
  console.error('Error loading icon aliases:', error);
}

export default function handler(req, res) {
  const { 
    q, // search query
    category, 
    subcategory,
    page = 1, // default to first page
    limit = 48, // default to 48 items per page
    sortBy = 'name', // name, category, date
    sortOrder = 'asc', // asc or desc
  } = req.query;
  
  // Convert page and limit to numbers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  let filteredIcons = [...iconMetadata];
  
  // Filter by search query with improved relevance
  if (q) {
    console.log(`Searching for: "${q}"`);
    const searchTerms = q.toLowerCase().split(/\s+/).filter(term => term.trim() !== '');
    
    if (searchTerms.length > 0) {
      // Score-based filtering for better relevance
      const scoredIcons = filteredIcons.map(icon => {
        let score = 0;
        const nameWords = icon.name.toLowerCase().split(/[-_\s]/);
        const displayNameWords = icon.displayName ? icon.displayName.toLowerCase().split(/\s+/) : [];
        
        // Get aliases for this icon
        const iconKey = `${icon.category}/${icon.subcategory ? icon.subcategory + '/' : ''}${icon.name}`.replace(/\\/g, '/');
        const aliases = iconAliases[iconKey] || [];
        
        if (aliases.length > 0 && searchTerms.some(term => aliases.includes(term))) {
          console.log(`Found match in aliases for ${iconKey}: ${aliases.filter(a => searchTerms.includes(a))}`);
        }
        
        // All searchable terms for this icon
        const allSearchableTerms = [
          ...nameWords,
          ...displayNameWords,
          icon.category.toLowerCase(),
          icon.subcategory ? icon.subcategory.toLowerCase() : '',
          ...icon.keywords.map(k => k.toLowerCase()),
          ...aliases.map(a => a.toLowerCase())
        ].filter(term => term.trim() !== '');
        
        // Calculate score based on matches
        searchTerms.forEach(searchTerm => {
          // Exact matches score higher
          if (icon.name.toLowerCase() === searchTerm || 
              (icon.displayName && icon.displayName.toLowerCase() === searchTerm)) {
            score += 100;
          }
          
          // Name starts with search term
          if (icon.name.toLowerCase().startsWith(searchTerm)) {
            score += 50;
          }
          
          // Name contains search term
          if (icon.name.toLowerCase().includes(searchTerm)) {
            score += 30;
          }
          
          // Category or subcategory match
          if (icon.category.toLowerCase() === searchTerm || 
              (icon.subcategory && icon.subcategory.toLowerCase() === searchTerm)) {
            score += 40;
          }
          
          // Check for matches in all searchable terms
          allSearchableTerms.forEach(term => {
            if (term === searchTerm) {
              score += 20; // Exact match in any term
            } else if (term.includes(searchTerm)) {
              score += 10; // Partial match
            }
          });
        });
        
        return { ...icon, score };
      });
      
      // Filter out icons with zero score and sort by score (descending)
      filteredIcons = scoredIcons
        .filter(icon => icon.score > 0)
        .sort((a, b) => b.score - a.score);
        
      console.log(`Found ${filteredIcons.length} icons matching search "${q}"`);
    }
  } else {
    // If no search query, apply category and subcategory filters
    
    // Filter by category
    if (category && category !== 'all') {
      filteredIcons = filteredIcons.filter(icon => icon.category === category);
    }
    
    // Filter by subcategory if provided
    if (subcategory) {
      filteredIcons = filteredIcons.filter(icon => icon.subcategory === subcategory);
    }
    
    // Apply sorting
    filteredIcons.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case 'category':
          // First sort by category
          compareResult = a.category.localeCompare(b.category);
          // Then by subcategory
          if (compareResult === 0) {
            compareResult = (a.subcategory || '').localeCompare(b.subcategory || '');
          }
          // Finally by name
          if (compareResult === 0) {
            compareResult = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          }
          break;
        
        case 'date':
          compareResult = new Date(a.dateAdded || 0) - new Date(b.dateAdded || 0);
          break;
          
        case 'name':
        default:
          compareResult = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          break;
      }
      
      // Apply sort order
      return sortOrder.toLowerCase() === 'desc' ? -compareResult : compareResult;
    });
  }
  
  // Calculate pagination
  const totalItems = filteredIcons.length;
  const totalPages = Math.ceil(totalItems / limitNum);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = Math.min(startIndex + limitNum, totalItems);
  
  // Get the icons for the current page
  const paginatedIcons = filteredIcons.slice(startIndex, endIndex);
  
  // Return paginated results with metadata
  res.status(200).json({
    icons: paginatedIcons,
    pagination: {
      total: totalItems,
      totalPages,
      currentPage: pageNum,
      pageSize: limitNum,
      hasNext: pageNum < totalPages,
      hasPrevious: pageNum > 1
    }
  });
} 