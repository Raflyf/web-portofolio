import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const endpoint = urlObj.pathname.replace(/^\/api\//, '').split('?')[0];
        const apiFilePath = path.resolve(__dirname, `api/${endpoint}.js`);

        if (!fs.existsSync(apiFilePath)) {
          return next();
        }

        try {
          // Read request body for POST/PUT/PATCH
          let body = {};
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const buffers = [];
            for await (const chunk of req) {
              buffers.push(chunk);
            }
            const rawData = Buffer.concat(buffers).toString();
            try {
              body = JSON.parse(rawData);
            } catch (_) {
              body = rawData;
            }
          }

          req.body = body;
          req.query = Object.fromEntries(urlObj.searchParams.entries());

          // Provide Vercel serverless helper methods on response object
          res.status = function(code) {
            res.statusCode = code;
            return this;
          };
          res.json = function(data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          res.send = function(data) {
            res.end(data);
          };

          const module = await server.ssrLoadModule(apiFilePath);
          const handler = module.default || module;

          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.status(500).json({ error: `Handler not found in api/${endpoint}.js` });
          }
        } catch (err) {
          console.error(`[Vite API Middleware Error] ${endpoint}:`, err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message });
          }
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
