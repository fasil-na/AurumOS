import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') && !file.endsWith('convert.mjs')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(__dirname);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace `require('dotenv').config();`
  content = content.replace(/require\('dotenv'\)\.config\(\);/g, "import dotenv from 'dotenv';\ndotenv.config();");

  // Replace `const X = require('Y');`
  content = content.replace(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*require\((['"])([^'"]+)\2\);/g, (match, p1, p2, p3) => {
    let importPath = p3;
    if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
      importPath += '.js';
    }
    return `import ${p1} from '${importPath}';`;
  });

  // Replace `const { X, Y } = require('Z');`
  content = content.replace(/(?:const|let|var)\s+\{\s*([^}]+)\s*\}\s*=\s*require\((['"])([^'"]+)\2\);/g, (match, p1, p2, p3) => {
    let importPath = p3;
    if (importPath.startsWith('.') && !importPath.endsWith('.js')) {
      importPath += '.js';
    }
    return `import { ${p1.trim()} } from '${importPath}';`;
  });

  // Handle nested requires like `const authRoutes = require('./routes/auth');` without const? Handled by above.
  
  // Handle `module.exports = { X, Y };`
  content = content.replace(/module\.exports\s*=\s*\{\s*([^}]+)\s*\};?/g, "export { $1 };");
  
  // Handle `module.exports = X;`
  content = content.replace(/module\.exports\s*=\s*([a-zA-Z0-9_]+);?/g, "export default $1;");

  // Fix __dirname
  if (originalContent.includes('__dirname')) {
    const dirnameInjection = `import { fileURLToPath } from 'url';\nimport { dirname } from 'path';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\n\n`;
    content = dirnameInjection + content;
  }

  fs.writeFileSync(file, content);
});

console.log("Conversion complete.");
