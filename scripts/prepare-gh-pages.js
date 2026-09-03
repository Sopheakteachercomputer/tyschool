import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distDir, 'index.html');
const notFoundPath = path.join(distDir, '404.html');
const noJekyllPath = path.join(distDir, '.nojekyll');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✅ Created dist/404.html for GitHub Pages SPA routing');
  
  fs.writeFileSync(noJekyllPath, '');
  console.log('✅ Created dist/.nojekyll to disable Jekyll processing');
} else {
  console.error('❌ dist/index.html not found! Run vite build first.');
  process.exit(1);
}
