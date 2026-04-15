const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fix index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');
content = content.replace(/src="\/_expo\//g, 'src="/SecondChance/_expo/');
content = content.replace(/href="\/_expo\//g, 'href="/SecondChance/_expo/');
content = content.replace(/href="\/favicon\.ico"/g, 'href="/SecondChance/favicon.ico"');
fs.writeFileSync(indexPath, content);
console.log('Fixed asset paths in index.html');

// Fix JavaScript files containing /_expo/ references
const jsFiles = glob.sync('dist/**/*.js');
jsFiles.forEach(file => {
  let jsContent = fs.readFileSync(file, 'utf8');
  const originalContent = jsContent;
  
  // Replace /_expo/ with /SecondChance/_expo/ in JavaScript
  jsContent = jsContent.replace(/"\/_expo\//g, '"/SecondChance/_expo/');
  jsContent = jsContent.replace(/'\/_expo\//g, "'/SecondChance/_expo/");
  
  if (jsContent !== originalContent) {
    fs.writeFileSync(file, jsContent);
    console.log(`Fixed paths in ${file}`);
  }
});
