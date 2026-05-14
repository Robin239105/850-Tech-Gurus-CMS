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

    content = content.replace(/(const ([a-zA-Z0-9_]+) = await db`\s*INSERT INTO ([a-zA-Z0-9_]+) \(([\s\S]*?)\)\s*VALUES\s*\(([\s\S]*?)\)\s*RETURNING \*(?:\s*)`)/g, (match, fullMatch, varName, tableName, columns, values) => {
      let replacement = `const id = crypto.randomUUID();\n`;
      replacement += `    await db\`\n      INSERT INTO ${tableName} (id, ${columns})\n      VALUES (\${id}, ${values})\`;\n`;
      replacement += `    const ${varName} = await db\`SELECT * FROM ${tableName} WHERE id = \${id}\``;
      return replacement;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated INSERTs in', filePath);
    }
  }
});
