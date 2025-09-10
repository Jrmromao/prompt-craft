const fs = require('fs');
const path = require('path');

// Link mappings: dead link -> correct link
const linkMappings = {
  '/prompts/create': '/prompts',
  '/prompts/new': '/prompts',
  '/prompts/community': '/community-prompts',
  '/legal/privacy': '/legal/privacy-policy',
  '/legal/terms': '/legal/terms-of-service',
  '/privacy-policy': '/legal/privacy-policy',
  '/cookie-policy': '/legal/cookie-policy',
  '/billing': '/pricing',
  '/credits': '/pricing',
  '/prompt': '/prompts',
  '/support/new': '/support',
  '/support/kb': '/support',
  '/support/faq': '/support'
};

function fixLinksInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const [oldLink, newLink] of Object.entries(linkMappings)) {
    const regex = new RegExp(`(href=["'])${oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'])`, 'g');
    if (content.match(regex)) {
      content = content.replace(regex, `$1${newLink}$2`);
      changed = true;
      console.log(`  ✓ Fixed: ${oldLink} → ${newLink}`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function fixAllLinks() {
  const componentsDir = path.join(__dirname, '../components');
  const appDir = path.join(__dirname, '../app');
  
  let totalFixed = 0;
  
  function scanAndFix(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanAndFix(fullPath, path.join(basePath, item));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const relativePath = path.join(basePath, item);
        console.log(`Checking: ${relativePath}`);
        
        if (fixLinksInFile(fullPath)) {
          totalFixed++;
        }
      }
    }
  }
  
  console.log('🔧 Fixing dead links...\n');
  
  scanAndFix(componentsDir, 'components');
  scanAndFix(appDir, 'app');
  
  console.log(`\n✅ Fixed links in ${totalFixed} files`);
}

// Create missing route files
function createMissingRoutes() {
  const routesToCreate = [
    { path: 'legal/privacy-policy', content: 'Privacy Policy page' },
    { path: 'legal/terms-of-service', content: 'Terms of Service page' },
    { path: 'legal/cookie-policy', content: 'Cookie Policy page' }
  ];
  
  console.log('\n📁 Creating missing route files...\n');
  
  for (const route of routesToCreate) {
    const dirPath = path.join(__dirname, '../app', route.path);
    const filePath = path.join(dirPath, 'page.tsx');
    
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      
      const pageContent = `export default function ${route.path.split('/').pop().replace(/-/g, '')}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${route.content}</h1>
      <p>This page is under construction.</p>
    </div>
  );
}`;
      
      fs.writeFileSync(filePath, pageContent);
      console.log(`  ✓ Created: ${route.path}/page.tsx`);
    }
  }
}

// Run fixes
fixAllLinks();
createMissingRoutes();

console.log('\n🎉 All fixes completed!');
