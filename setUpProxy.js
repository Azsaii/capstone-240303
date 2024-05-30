const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', //proxy가 필요한 path prameter
    createProxyMiddleware({
      //target: 'http://localhost:8080', //타겟이 되는 api url
      target: 'http://52.79.56.22:8080/',
      changeOrigin: true, //대상 서버 구성에 따라 호스트 헤더가 변경되도록 설정
    })
  );
};
