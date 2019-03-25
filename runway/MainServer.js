import CloudContext from '../cloud-core/CloudContext';
import createCloudClient from '../cloud-core/createCloudClient';
import createMemoryDataSource from '../cloud-core/createMemoryDataSource';
import WebServer from '../aven-web/WebServer';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Runway 🛫');

  const dataSource = await createMemoryDataSource({
    domain: 'runway.aven.cloud',
  });
  const client = createCloudClient({
    dataSource,
    domain: 'runway.aven.cloud',
  });

  const getEnv = c => process.env[c];
  const serverListenLocation = getEnv('PORT');
  const context = new Map();
  context.set(CloudContext, client);
  const webService = await WebServer({
    App,
    context,
    dataSource,
    serverListenLocation,
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await webService.close();
      await dataSource.close();
    },
  };
};

export default runServer;
