import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'SWUMMo0fmRiS4um6iUcOhU';
const agent = new https.Agent({ rejectUnauthorized: false });

const NEW_PAGES = ['Registro', 'Gestionar Habitaciones', 'Solicitudes de reservas', 'Gestionar habitaciones', 'Cancelar reservas'];

async function extractNewStyles() {
  console.log('🎨 Extrayendo estilos de nuevas pantallas...\n');

  const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
    agent
  });

  const data = await response.json();
  const wireframesPage = data.document.children.find(page => page.name === 'Wireframes web');

  for (const pageName of NEW_PAGES) {
    const frame = wireframesPage?.children.find(f => f.name === pageName);
    if (!frame) {
      console.log(`⚠️  No encontrado: ${pageName}`);
      continue;
    }

    const styles = { colors: {}, typography: {}, elements: [] };

    function extract(node, depth = 0) {
      if (node.fills && Array.isArray(node.fills)) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const { r, g, b, a = 1 } = fill.color;
            const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
            styles.colors[node.name || `color-${Object.keys(styles.colors).length}`] = { hex, opacity: a };
          }
        });
      }

      if (node.style && node.characters) {
        styles.typography[node.name || node.characters.substring(0, 30)] = {
          fontFamily: node.style.fontFamily,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          lineHeight: node.style.lineHeightPx,
          text: node.characters
        };
      }

      if (node.children) {
        node.children.forEach(child => extract(child, depth + 1));
      }
    }

    extract(frame);

    const fileName = pageName.toLowerCase().replace(/\s+/g, '-');
    fs.writeFileSync(`figma-data/${fileName}-structure.json`, JSON.stringify(frame, null, 2));
    fs.writeFileSync(`figma-data/${fileName}-styles.json`, JSON.stringify(styles, null, 2));

    console.log(`✅ ${pageName}`);
    console.log(`   Colores: ${Object.keys(styles.colors).length}`);
    console.log(`   Tipografías: ${Object.keys(styles.typography).length}\n`);
  }
}

extractNewStyles().catch(console.error);
