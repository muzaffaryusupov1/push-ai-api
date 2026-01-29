import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const server = http.createServer(async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Static files
    if (req.url.startsWith('/test')) {
        const filePath = path.join(__dirname, 'public', req.url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
            return;
        }
    }

    // API routes
    if (req.url === '/api/generate' && req.method === 'POST') {
        const { default: handler } = await import('./api/generate.js');
        return handler(req, res);
    }

    if (req.url === '/api/generate-image' && req.method === 'POST') {
        const { default: handler } = await import('./api/generate-image.js');
        return handler(req, res);
    }

    // 404
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`\n🚀 Server ishga tushdi!`);
    console.log(`\n📍 URL: http://localhost:${PORT}`);
    console.log(`\n🧪 Test sahifalar:`);
    console.log(`   - Text generation: http://localhost:${PORT}/test.html`);
    console.log(`   - Image generation: http://localhost:${PORT}/test-image.html`);
    console.log(`\n💡 API Endpoints:`);
    console.log(`   - POST /api/generate`);
    console.log(`   - POST /api/generate-image`);
    console.log(`\n⚠️  .env faylida API keylar borligini tekshiring!\n`);
});
