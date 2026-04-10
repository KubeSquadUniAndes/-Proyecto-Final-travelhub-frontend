import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'SWUMMo0fmRiS4um6iUcOhU';
const agent = new https.Agent({ rejectUnauthorized: false });

async function extractWireframes() {
  console.log('🔍 Extrayendo wireframes web de Figma...\n');

  const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
    agent
  });

  const data = await response.json();
  const wireframesPage = data.document.children.find(page => page.name === 'Wireframes web');

  if (!wireframesPage) {
    console.error('❌ No se encontró la página "Wireframes web"');
    return;
  }

  console.log(`📄 Página: ${wireframesPage.name}`);
  console.log(`🎨 Wireframes encontrados: ${wireframesPage.children.length}\n`);

  const wireframes = wireframesPage.children.map((frame, index) => ({
    id: frame.id,
    name: frame.name,
    type: frame.type,
    width: frame.absoluteBoundingBox?.width,
    height: frame.absoluteBoundingBox?.height
  }));

  wireframes.forEach((wf, i) => {
    console.log(`${i + 1}. ${wf.name}`);
    console.log(`   ID: ${wf.id}`);
    console.log(`   Tamaño: ${wf.width}x${wf.height}px\n`);
  });

  // Guardar estructura
  if (!fs.existsSync('figma-data')) {
    fs.mkdirSync('figma-data');
  }

  fs.writeFileSync(
    'figma-data/wireframes-web.json',
    JSON.stringify({ wireframes, page: wireframesPage }, null, 2)
  );

  console.log('✅ Datos guardados en: figma-data/wireframes-web.json');
  console.log('\n💡 Para exportar imágenes, usa: npm run export-images');
}

extractWireframes().catch(console.error);
