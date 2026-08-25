import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-discovery-middleware',
        configureServer(server) {
          server.middlewares.use('/api/discovery/search', async (req, res) => {
            try {
              const urlObj = new URL(req.url, 'http://localhost');
              const q = urlObj.searchParams.get('q') || 'water pollution';
              const country = urlObj.searchParams.get('country') || '';

              // Ensure process.env has TAVILY_API_KEY from .env file
              if (!process.env.TAVILY_API_KEY && env.TAVILY_API_KEY) {
                process.env.TAVILY_API_KEY = env.TAVILY_API_KEY;
              }

              const fakeReq = { query: { q, country }, body: {} };
              const fakeRes = {
                status(code) {
                  res.statusCode = code;
                  return this;
                },
                json(data) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                }
              };

              const handler = (await import('./api/discovery/search.js')).default;
              await handler(fakeReq, fakeRes);
            } catch (err) {
              console.error('Vite dev API middleware error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message, results: [] }));
            }
          });
        }
      }
    ],
    server: {
      port: 3000,
      host: true,
      strictPort: false
    },
    preview: {
      port: 3000,
      host: true
    }
  };
});
