import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import WebServer from '../aven-web/WebServer';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const source = await createMemoryStorageSource({
    domain: 'example.aven.cloud',
  });
  const client = createCloudClient({
    source,
    domain: 'example.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    source,
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await source.close();
    },
  };
};

export default runServer;
