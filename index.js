const express = require("express");
const morgan = require("morgan");
const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      callback(null, true);
    },
  })
);

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const ORIGIN = process.env.ORIGIN;
const PORT = process.env.PORT;
const API_SERVICE_URL = process.env.API_URL;

const proxy = createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  cookieDomainRewrite: COOKIE_DOMAIN,
  selfHandleResponse: true,
  headers: ORIGIN
    ? {
        origin: ORIGIN,
      }
    : undefined,
  onProxyRes: responseInterceptor(
    async (responseBuffer, proxyRes, req, res) => {
      const response = responseBuffer.toString("utf8");
      // modify this if you want to log every response, or comment out this if you don't want to log any response
      if (res.statusCode >= 400) console.error(response);
      return response;
    }
  ),
});

app.use(morgan("dev"));

app.use("/", proxy);

app.listen(PORT, 'localhost', () => {
  console.log(`Starting Proxy at localhost:${PORT}`);
});
