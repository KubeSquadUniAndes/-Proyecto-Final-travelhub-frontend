import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'SWUMMo0fmRiS4um6iUcOhU';
const agent = new https.Agent({ rejectUnauthorized: false });

async function extractStyles() {
  console.log('🎨 Extrayendo estilos de Figma...\n');

  const response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
    agent
  });

  const data = await response.json();
  
  // Buscar página de Design System
  const designSystemPage = data.document.children.find(page => 
    page.name.includes('Desing System') || page.name.includes('Design System')
  );

  // Buscar página de Login
  const wireframesPage = data.document.children.find(page => page.name === 'Wireframes web');
  const loginFrame = wireframesPage?.children.find(frame => frame.name === 'Login');

  const styles = {
    colors: {},
    typography: {},
    spacing: {},
    loginStyles: null
  };

  // Extraer colores y tipografía del login
  if (loginFrame) {
    console.log('📄 Analizando wireframe de Login...\n');
    
    function extractColors(node, depth = 0) {
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
        styles.typography[node.name || node.characters.substring(0, 20)] = {
          fontFamily: node.style.fontFamily,
          fontSize: node.style.fontSize,
          fontWeight: node.style.fontWeight,
          lineHeight: node.style.lineHeightPx,
          letterSpacing: node.style.letterSpacing
        };
      }

      if (node.children) {
        node.children.forEach(child => extractColors(child, depth + 1));
      }
    }

    extractColors(loginFrame);
    styles.loginStyles = {
      width: loginFrame.absoluteBoundingBox?.width,
      height: loginFrame.absoluteBoundingBox?.height,
      backgroundColor: loginFrame.backgroundColor
    };
  }

  // Guardar estilos
  fs.writeFileSync(
    'figma-data/styles.json',
    JSON.stringify(styles, null, 2)
  );

  console.log('✅ Estilos extraídos');
  console.log(`📊 Colores encontrados: ${Object.keys(styles.colors).length}`);
  console.log(`📝 Tipografías encontradas: ${Object.keys(styles.typography).length}`);
  
  // Guardar estructura completa del login para análisis
  if (loginFrame) {
    fs.writeFileSync(
      'figma-data/login-structure.json',
      JSON.stringify(loginFrame, null, 2)
    );
    console.log('✅ Estructura del login guardada en: figma-data/login-structure.json');
  }
}

extractStyles().catch(console.error);
