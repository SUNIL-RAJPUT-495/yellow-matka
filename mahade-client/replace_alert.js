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
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('alert(')) {
    let newContent = content.replace(/alert\((.*?)\)/g, (match, p1) => {
        const lowerP1 = p1.toLowerCase();
        if (lowerP1.includes('success') || lowerP1.includes('created')) {
            return `toast.success(${p1})`;
        } else if (lowerP1.includes('fail') || lowerP1.includes('invalid') || lowerP1.includes('error') || lowerP1.includes('must') || lowerP1.includes('please') || lowerP1.includes('insufficient') || lowerP1.includes('zaroori')) {
            return `toast.error(${p1})`;
        } else {
            return `toast(${p1})`;
        }
    });

    if (newContent !== content) {
      if (!newContent.includes(`import toast`)) {
        // Add import after other imports. Find last import
        const importRegex = /^import\s+.*?['"];?/gm;
        let lastMatch = null;
        let match;
        while ((match = importRegex.exec(newContent)) !== null) {
            lastMatch = match;
        }
        
        if (lastMatch) {
            const insertPos = lastMatch.index + lastMatch[0].length;
            newContent = newContent.substring(0, insertPos) + `\nimport toast from 'react-hot-toast';` + newContent.substring(insertPos);
        } else {
            newContent = `import toast from 'react-hot-toast';\n` + newContent;
        }
      }
      fs.writeFileSync(file, newContent, 'utf8');
      changedFiles++;
    }
  }
}
console.log(`Updated ${changedFiles} files with toast.`);
