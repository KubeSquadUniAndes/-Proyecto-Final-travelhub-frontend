import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'SWUMMo0fmRiS4um6iUcOhU';
const agent = new https.Agent({ rejectUnauthorized: false });

async function exportImages() {
  console.log('📸 Exportando imágenes de wireframes...\n');

  const wireframesData = JSON.parse(fs.readFileSync('figma-data/wireframes-web.json', 'utf8'));
  const ids = wireframesData.wireframes.map(wf => wf.id).join(',');

  const response = await fetch(
    `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids}&format=png&scale=1`,
    {
      headers: { 'X-Figma-Token': FIGMA_TOKEN },
      agent
    }
  );

  const data = await response.json();

  if (!data.images) {
    console.error('❌ Error al exportar imágenes:', data);
    return;
  }

  if (!fs.existsSync('figma-data/images')) {
    fs.mkdirSync('figma-data/images', { recursive: true });
  }

  console.log('⬇️  Descargando imágenes...\n');

  for (const wf of wireframesData.wireframes) {
    const imageUrl = data.images[wf.id];
    if (!imageUrl) continue;

    const fileName = wf.name.toLowerCase().replace(/\s+/g, '-');
    const imagePath = `figma-data/images/${fileName}.png`;

    const imgResponse = await fetch(imageUrl, { agent });
    const buffer = await imgResponse.buffer();
    fs.writeFileSync(imagePath, buffer);

    console.log(`✅ ${wf.name} → ${imagePath}`);
  }

  console.log('\n✅ Todas las imágenes exportadas');
}

exportImages().catch(console.error);
