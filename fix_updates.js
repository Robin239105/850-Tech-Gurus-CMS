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

    // Pattern for UPDATE statements that end with RETURNING *
    // e.g. const rows = await db`UPDATE table SET ... WHERE id = ${id} RETURNING *`
    
    // Using a regex with a replacement function
    content = content.replace(/(const (?:rows|updated) = await db`\s*UPDATE ([a-zA-Z0-9_]+) SET([\s\S]*?)WHERE\s+id\s*=\s*\$\{([a-zA-Z0-9_]+)\}([\s\S]*?)RETURNING \*(?:\s*)`)/g, (match, fullMatch, tableName, setClause, idVar, whereRest) => {
      let replacement = `await db\`\n      UPDATE ${tableName} SET${setClause}WHERE id = \${${idVar}}${whereRest}\`;\n`;
      replacement += `    const rows = await db\`SELECT * FROM ${tableName} WHERE id = \${${idVar}}\``;
      // return it
      return replacement;
    });
    
    // Also handle return values for passwords
    content = content.replace(/RETURNING id, name, email, status, plan/g, '');

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated UPDATEs in', filePath);
    }
  }
});
