const { createProxyMiddleware } = require('http-proxy-middleware');

const context = [
    "/api/accountAPI",
    "/api/articleAPI",
    "/api/commentAPI",
];

module.exports = function (app) {
    const appProxy = createProxyMiddleware(context, {
        target: 'https://localhost:44325',
        secure: false
    });

    app.use(appProxy);
};
