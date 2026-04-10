import fs from 'fs';

const wireframesData = JSON.parse(fs.readFileSync('figma-data/wireframes-web.json', 'utf8'));

const componentMapping = {
  'Home': { route: '', component: 'home' },
  'Busqueda': { route: 'search', component: 'search' },
  'Checkout': { route: 'checkout', component: 'checkout' },
  'Checkout 2': { route: 'checkout/step2', component: 'checkout-step2' },
  'Reserva confirmada': { route: 'booking-confirmed', component: 'booking-confirmed' },
  'Imprimir reserva': { route: 'print-booking', component: 'print-booking' },
  'Login': { route: 'login', component: 'login' },
  'Dasboard': { route: 'dashboard', component: 'dashboard' }
};

function generateAngularStructure() {
  console.log('🏗️  Generando estructura Angular...\n');

  const structure = {
    app: {
      components: [],
      routes: [],
      modules: []
    }
  };

  wireframesData.wireframes.forEach(wf => {
    const mapping = componentMapping[wf.name];
    if (!mapping) return;

    structure.app.components.push({
      name: mapping.component,
      path: `src/app/pages/${mapping.component}`,
      files: [
        `${mapping.component}.component.ts`,
        `${mapping.component}.component.html`,
        `${mapping.component}.component.css`,
        `${mapping.component}.component.spec.ts`
      ]
    });

    structure.app.routes.push({
      path: mapping.route,
      component: mapping.component
    });
  });

  // Guardar estructura
  fs.writeFileSync(
    'figma-data/angular-structure.json',
    JSON.stringify(structure, null, 2)
  );

  console.log('📁 Estructura de componentes:\n');
  structure.app.components.forEach(comp => {
    console.log(`  ${comp.name}`);
    console.log(`    📂 ${comp.path}`);
  });

  console.log('\n🛣️  Rutas generadas:\n');
  structure.app.routes.forEach(route => {
    console.log(`  /${route.path} → ${route.component}`);
  });

  console.log('\n✅ Estructura guardada en: figma-data/angular-structure.json');
  
  return structure;
}

function generateRoutingModule(structure) {
  const routes = structure.app.routes.map(r => {
    const componentName = r.component.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('') + 'Component';
    
    return `  { path: '${r.path}', component: ${componentName} }`;
  }).join(',\n');

  const imports = structure.app.components.map(c => {
    const componentName = c.name.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join('') + 'Component';
    
    return `import { ${componentName} } from './pages/${c.name}/${c.name}.component';`;
  }).join('\n');

  const routingModule = `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
${imports}

const routes: Routes = [
${routes}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
`;

  fs.writeFileSync('figma-data/app-routing.module.ts', routingModule);
  console.log('\n✅ Módulo de rutas generado: figma-data/app-routing.module.ts');
}

const structure = generateAngularStructure();
generateRoutingModule(structure);
