# TravelHub Frontend - Angular + MCP Figma

## Configuración MCP Figma

### 1. Obtener Token de Figma
1. Ve a https://www.figma.com/settings
2. En "Personal access tokens", crea un nuevo token
3. Copia el token

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```
Edita `.env` y agrega tu token:
```
FIGMA_ACCESS_TOKEN=tu_token_aqui
```

### 3. Usar MCP Figma
```bash
npm run mcp
```

### Herramientas Disponibles
- `get_figma_file`: Obtener datos del archivo Figma
- `get_figma_images`: Exportar imágenes desde Figma

### Obtener File Key de Figma
En la URL de tu archivo Figma:
`https://www.figma.com/file/ABC123/nombre-archivo`
El File Key es: `ABC123`
