import CloudContext from '../aven-cloud/CloudContext';
import createCloudClient from '../aven-cloud/createCloudClient';
import startMemoryDataSource from '../aven-cloud/startMemoryDataSource';
import WebServer from '../aven-web/WebServer';

import App from './App';

const runServer = async () => {
  console.log('☁️ Starting Cloud 💨');

  const dataSource = await startMemoryDataSource({
    domain: 'example.aven.cloud',
  });
  const client = createCloudClient({
    dataSource,
    domain: 'example.aven.cloud',
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
