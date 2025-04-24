# Sarvārth Icon Library Web App

A web application to browse, search, and download icons from a comprehensive icon library. The application provides a user-friendly interface for exploring icons across different categories and downloading them in both PNG and SVG formats.

## Features

- **Browse Icons by Category and Subcategory**: View icons organized by categories (arrows, commerce, culture, etc.) and their subcategories
- **Enhanced Search Functionality**: 
  - Score-based relevance search with intelligent ranking
  - Search by icon name, category, subcategory, and aliases
  - Automatic keyword generation from icon names
  - Custom aliases for improved discoverability
- **Pagination**: Browse through large sets of icons with an intuitive pagination system
- **Color Customization**:
  - Preview icons in brand colors (Sarvārth Red, Sarvārth Blue, Sarvārth Grey)
  - Download SVG icons in the selected brand color
  - Real-time color preview in the icon detail view
- **Size Options**:
  - View larger icon previews for better visibility
  - Download SVG icons at 2x the original size
  - Multiple size options for PNG downloads (1x, 2x, 3x)
- **Performance Optimizations**:
  - Lazy loading for images to reduce initial load time
  - Only rendering visible icons to improve performance
  - Optimized search algorithm for large icon sets (2,445+ icons)
- **Icon Preview**: View detailed previews of icons before downloading
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Sorting Options**: Sort icons by name, category, or date added

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd icon-library-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup icon files
   Copy your icon files to the public directory:
   - SVG icons to: `public/icons/svg/`
   - PNG icons to: `public/icons/png/`

   Make sure to maintain the category/subcategory structure.

4. Generate metadata and aliases
   ```bash
   npm run generate-metadata
   npm run generate-aliases
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
icon-library-app/
├── public/
│   └── icons/ (Icon files organized by type)
│       ├── svg/ (SVG icon files organized by category)
│       │   ├── arrows/
│       │   ├── commerce/
│       │   ├── culture/
│       │   ├── education/
│       │   ├── entertainment/
│       │   ├── essentials/
│       │   ├── office/
│       │   ├── social/
│       │   ├── technology/
│       │   ├── tools/
│       │   └── travel/
│       └── png/ (PNG icon files in various sizes)
│           ├── arrows/
│           ├── commerce/
│           └── ... (same structure as svg)
├── scripts/
│   ├── generate-metadata.js (Scans icon files and generates metadata)
│   ├── generate-icon-aliases.js (Creates aliases for improved search)
│   └── refresh.js (Regenerates metadata and aliases, restarts server)
├── src/
│   ├── components/ (React components)
│   │   ├── IconGrid.js (Grid display with performance optimizations)
│   │   ├── IconItem.js (Individual icon item with lazy loading)
│   │   └── IconPreview.js (Detailed icon preview modal)
│   ├── data/ (Generated JSON data)
│   │   ├── icon-metadata.json (Metadata for all icons including paths)
│   │   └── icon-aliases.json (Search aliases for better discoverability)
│   ├── pages/ (Next.js pages)
│   │   ├── index.js (Main app page with search, filters, and grid)
│   │   ├── _app.js (Next.js app wrapper with global styles)
│   │   └── api/ (API endpoints)
│   │       ├── icons.js (Search and pagination for icons)
│   │       ├── icons/
│   │       │   └── aliases.js (Returns aliases for specific icons)
│   │       └── download.js (SVG color customization and download)
│   ├── styles/ (CSS styles)
│   │   └── globals.css (Global styles using Tailwind)
│   └── utils/ (Utility functions)
├── jsconfig.json (JavaScript configuration)
├── package.json (Dependencies and scripts)
├── package-lock.json (Dependency lock file)
├── postcss.config.js (PostCSS configuration for Tailwind)
├── tailwind.config.js (Tailwind CSS configuration)
└── README.md (Project documentation)
```

## Technologies Used

- **Next.js**: React framework for server-side rendering
- **React**: UI library
- **TailwindCSS**: CSS framework for styling
- **Intersection Observer API**: For lazy loading and performance optimization

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build production version
- `npm run start`: Start production server
- `npm run generate-metadata`: Generate metadata for all icons
- `npm run generate-aliases`: Generate search aliases for all icons

## Performance Optimizations

- **Pagination**: Only loads a subset of icons at a time (default: 48 per page)
- **Lazy Loading**: Only loads images when they're about to enter the viewport
- **Intelligent Search**: Score-based relevance search algorithm
- **Debounced Search**: Prevents excessive API calls during typing
- **Optimized Rendering**: Only renders visible components

## Brand Colors

The application supports the following predefined brand colors for SVG icons:

- **Sarvārth Red**: #FF5350
- **Sarvārth Blue**: #45D1F4
- **Sarvārth Grey**: #808080

## License

This project is licensed under the MIT License. 
