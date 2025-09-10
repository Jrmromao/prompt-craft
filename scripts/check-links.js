const fs = require('fs');
const path = require('path');

// Define existing routes based on app directory structure
const existingRoutes = [
  '/',
  '/about',
  '/account',
  '/admin',
  '/blog',
  '/careers',
  '/community',
  '/community-prompts',
  '/contact',
  '/dashboard',
  '/hive',
  '/legal',
  '/onboarding',
  '/playground',
  '/pricing',
  '/profile',
  '/prompts',
  '/prompts/my-prompts',
  '/prompts/templates',
  '/settings',
  '/support',
  '/sign-in',
  '/sign-up',
  '/unauthorized'
];

// Extract links from component files
function extractLinks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const linkRegex = /(?:href=["']([^"']+)["']|Link.*?to=["']([^"']+)["'])/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[1] || match[2];
    if (link && link.startsWith('/') && !link.startsWith('//')) {
      links.push(link);
    }
  }
  
  return links;
}

// Check all component files
function checkAllLinks() {
  const componentsDir = path.join(__dirname, '../components');
  const appDir = path.join(__dirname, '../app');
  
  const issues = [];
  
  // Check components directory
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(basePath, item));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const relativePath = path.join(basePath, item);
        const links = extractLinks(fullPath);
        
        for (const link of links) {
          // Clean the link (remove query params and fragments)
          const cleanLink = link.split('?')[0].split('#')[0];
          
          if (!existingRoutes.includes(cleanLink)) {
            issues.push({
              file: relativePath,
              link: link,
              issue: 'Dead link - route does not exist'
            });
          }
        }
      }
    }
  }
  
  scanDirectory(componentsDir, 'components');
  scanDirectory(appDir, 'app');
  
  return issues;
}

// Run the check
console.log('🔍 Scanning for navigation bugs and dead links...\n');

const issues = checkAllLinks();

if (issues.length === 0) {
  console.log('✅ No dead links found!');
} else {
  console.log(`❌ Found ${issues.length} potential issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Link: ${issue.link}`);
    console.log(`   Issue: ${issue.issue}\n`);
  });
}

// Export for programmatic use
module.exports = { checkAllLinks, existingRoutes };
