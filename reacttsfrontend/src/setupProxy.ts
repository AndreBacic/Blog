import { createProxyMiddleware } from 'http-proxy-middleware'

const context = [
    "/api/accountAPI",
    "/api/accountAPI/login",
    "/api/accountAPI/logout",
    "/api/accountAPI/refreshToken",
    "/api/accountAPI/getLoggedInUser",
    "/api/accountAPI/createAccount",
    "/api/accountAPI/editAccount",
    "/api/accountAPI/editPassword",
    "/api/accountAPI/deleteAccount",
    "/api/articleAPI",
    "/api/articleAPI/{id}",
    "/api/commentAPI",
    "/api/commentAPI/{articleId}",
    "/api/commentAPI/{articleId}/{id}",
]

module.exports = function (app: any) {
    const appProxy = createProxyMiddleware(context, {
        target: 'https://localhost:44325',
        secure: false
    })

    app.use(appProxy)
};
