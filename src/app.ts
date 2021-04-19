import { fastify } from 'fastify';
import fastifyCors from 'fastify-cors';
import { IRequest, IReply } from './types/definitions';
import { db, DB_OFFLINE_RESPONSE_OBJECT } from './databases/databases';

import { getLatestSegments } from './routes/getLatestSegments';
import { getVideoSegments } from './routes/getVideoSegments';
import { getUserSegments } from './routes/getUserSegments';
import { getUserStats } from './routes/getUserStats';
import { getConfig } from './routes/getConfig';

export async function createServer(port: number, host: string) {
  // Create a service
  const app = fastify({
    logger: {
      level: 'info',
      serializers: {
        req (request) {
          return { url: request.url }
        }
      }
    },
    trustProxy: true,
    ignoreTrailingSlash: true,
  });
  app.register(fastifyCors, {
    allowedHeaders: ['etag', 'if-none-match'],
  });

  if (process.env?.ENV === 'dev') {
    // testing slow response time
    app.addHook('onRequest', (req: IRequest, res: IReply, done: any) => {
     if (req?.query?.debug_delay) {
       const delay = Number(req?.query?.debug_delay);
       setTimeout(done, Math.min(delay, 10000));
     }
     else {
       done();
     }
    });
  }

  app.addHook('onRequest', (req: IRequest, res: IReply, done: any) => {
    if (!db.isActive()) {
      return res.code(500).send(DB_OFFLINE_RESPONSE_OBJECT);
    }
    done();
  });

  setupRoutes(app);

  async function closeGracefully() {
    await app.close();
    await db.close();
    process.exit();
  }
  process.on('SIGINT', closeGracefully);
  process.on('SIGTERM', closeGracefully);

  return app.listen(port, host);
}

function setupRoutes(app) {
  app.get('/', async (req: IRequest, res: IReply) => {
    res.status(404).send({
      status: 'error',
      msg: 'API documentation on github',
    });
  });
  app.get('/api/latestSegments', getLatestSegments);
  app.get('/api/videoSegments/:videoID', getVideoSegments);
  app.get('/api/userSegments/:userID', getUserSegments);
  app.get('/api/userStats/:userID', getUserStats);
  app.get('/api/config', getConfig);
}
