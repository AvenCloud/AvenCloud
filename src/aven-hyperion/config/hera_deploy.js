// terraform will run this to deploy the initial node server

const fs = require('fs');
const nginxConf = require('./nginx.conf.js');

const clusterName = fs.readFileSync('/SETUP_CLUSTER_NAME.txt', {
  encoding: 'utf8',
});
const cluster = fs.readFileSync('/SETUP_CLUSTER.json', { encoding: 'utf8' });

fs.writeFileSync(
  '/etc/nginx/nginx.conf',
  nginxConf({
    clusterName,
    sslHostnames: [], // no ssl hosts for the initial deploy
  }),
);
