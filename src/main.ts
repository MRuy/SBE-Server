import { createServer } from './app';

import { config } from './config';

(async _ => {
  const host = config.web.host;
  const port = config.web.port;
  await createServer(port, host);
  console.info(`Server started on port ${host}:${port}`);
})();
