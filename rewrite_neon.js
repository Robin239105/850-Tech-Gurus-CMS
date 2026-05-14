const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app/api', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace imports
    content = content.replace(/import \{ neon \} from '@neondatabase\/serverless'/g, "import { sql as db } from '@/lib/db'\nimport crypto from 'crypto'");
    
    // Remove getDb function
    content = content.replace(/function getDb\(\) \{\n\s+const url = process\.env\.DATABASE_URL \|\| process\.env\.POSTGRES_URL\n\s+if \(!url\) throw new Error\('.*?'\)\n\s+return neon\(url\)\n\}\n?/g, '');

    // Remove const db = getDb() calls
    content = content.replace(/\s+const db = getDb\(\)/g, '');
    
    // Replace ILIKE with LIKE
    content = content.replace(/ILIKE/g, 'LIKE');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
