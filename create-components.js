import fs from 'fs';
import path from 'path';

const structure = JSON.parse(fs.readFileSync('figma-data/angular-structure.json', 'utf8'));
const baseDir = 'travelhub-app/src/app/pages';

function createComponent(comp) {
  const dir = path.join(baseDir, comp.name);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const className = comp.name.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join('');

  // TypeScript
  const tsContent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-${comp.name}',
  standalone: true,
  templateUrl: './${comp.name}.component.html',
  styleUrls: ['./${comp.name}.component.css']
})
export class ${className}Component {
  constructor() {}
}
`;

  // HTML
  const htmlContent = `<div class="${comp.name}-container">
  <h1>${className}</h1>
  <!-- TODO: Implementar según wireframe -->
</div>
`;

  // CSS
  const cssContent = `.${comp.name}-container {
  padding: 20px;
}
`;

  fs.writeFileSync(path.join(dir, `${comp.name}.component.ts`), tsContent);
  fs.writeFileSync(path.join(dir, `${comp.name}.component.html`), htmlContent);
  fs.writeFileSync(path.join(dir, `${comp.name}.component.css`), cssContent);

  console.log(`✅ ${comp.name}`);
}

console.log('🏗️  Creando componentes Angular...\n');
structure.app.components.forEach(createComponent);
console.log('\n✅ Componentes creados en: travelhub-app/src/app/pages/');
