const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:44474';

const PROXY_CONFIG = [
  {
    context: [
      "/weatherforecast",
      "/sportfield",
      "/rentals",
      "/users",
      "/roles",
      "/payment",
      "/account"
    ],
    proxyTimeout: 10000,
    target: target,
    secure: false,
    changeOrigin: true, // Add this line to enable changing the origin
    headers: {
      Connection: 'Keep-Alive'
    }
  }
];

module.exports = PROXY_CONFIG;
