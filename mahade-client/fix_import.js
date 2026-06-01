import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const files = walkSync('c:/Users/rahul/Desktop/maha dev/mahade-client/src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Pattern: "from '\nimport toast from 'react-hot-toast';" followed by the rest of the import
  // Example: import { useSelector } from '\nimport toast from 'react-hot-toast';react-redux';
  
  if (content.includes(`'\nimport toast from 'react-hot-toast';`)) {
      content = content.replace(/'\nimport toast from 'react-hot-toast';(.*?)'/g, (match, p1) => {
          return `'${p1}'\nimport toast from 'react-hot-toast';`;
      });
      changed = true;
  }
  
  if (content.includes(`"\nimport toast from 'react-hot-toast';`)) {
      content = content.replace(/"\nimport toast from 'react-hot-toast';(.*?)"/g, (match, p1) => {
          return `"${p1}"\nimport toast from 'react-hot-toast';`;
      });
      changed = true;
  }
  
  if (changed) {
      fs.writeFileSync(file, content, 'utf8');
  }
}
console.log("Imports fixed.");
