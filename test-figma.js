import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import https from 'https';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'SWUMMo0fmRiS4um6iUcOhU';

const agent = new https.Agent({
  rejectUnauthorized: false
});

async function testFigmaConnection() {
  if (!FIGMA_TOKEN) {
    console.error('❌ FIGMA_ACCESS_TOKEN no configurado en .env');
    process.exit(1);
  }

  console.log('🔍 Probando conexión con Figma...');
  
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
      agent
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Conexión exitosa!');
    console.log(`📄 Archivo: ${data.name}`);
    console.log(`📅 Última modificación: ${data.lastModified}`);
    console.log(`🎨 Páginas encontradas: ${data.document.children.length}`);
    
    data.document.children.forEach(page => {
      console.log(`  - ${page.name} (${page.children?.length || 0} elementos)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testFigmaConnection();
