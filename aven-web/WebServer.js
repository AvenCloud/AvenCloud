import express from "express";
import ReactDOMServer from "react-dom/server";
import { AppRegistry } from "react-native";
import startServer from "./startServer";
import { IS_DEV } from "./config";
import { handleServerRequest } from "@react-navigation/web";
const yes = require("yes-https");
const helmet = require("helmet");
const http = require("http");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const path = require("path");
const mime = require("mime");

const isProd = process.env.NODE_ENV === "production";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const sendNotFound = res => {
  res.status(404);
  res.send("Not found");
};

async function objectResponse({
  domain,
  refName,
  dispatch,
  refPath,
  objId,
  objName
}) {
  const obj = await dispatch({
    type: "getObject",
    id: objId,
    domain,
    refName
  });
  if (!obj) {
    return sendNotFound;
  }
  if (refPath === "/" || refPath === "") {
    if (!obj.object.data) {
      // should be checking for some type here, rather than looking at "data"..
      return res => {
        res.send(obj.object);
      };
    }
    const mimeType = mime.getType(path.extname(objName));
    return res => {
      res.header("Content-Type", mimeType);
      res.send(Buffer.from(obj.object.data, "hex"));
    };
  }
  if (!obj.object || !obj.object.files) {
    return sendNotFound;
  }
  const pathParts = refPath.split("/");
  const pathTermName = pathParts[1];
  if (obj.object.files[pathTermName]) {
    const childRefPath = `/${pathParts.slice(2).join("/")}`;
    const childId = obj.object.files[pathTermName].id;
    return await objectResponse({
      domain,
      refName,
      dispatch,
      objName: pathTermName,
      objId: childId,
      refPath: childRefPath
    });
  }
  return sendNotFound;
}

async function webDataInterface({ domain, refName, dispatch, refPath }) {
  const ref = await dispatch({
    ref: refName,
    type: "getRef",
    domain
  });
  if (!ref || !ref.id) {
    return sendNotFound;
  }
  return await objectResponse({
    domain,
    refName,
    dispatch,
    objName: refName,
    objId: ref.id,
    refPath
  });
}

export default async function WebServer({
  App,
  dispatch,
  startSocketServer,
  serverListenLocation
}) {
  const expressApp = express();
  const jsonParser = bodyParser.json();
  expressApp.use(jsonParser);
  expressApp.use(yes());
  expressApp.use(helmet());
  expressApp.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  AppRegistry.registerComponent("App", () => App);

  // const publicDir = isProd ? 'build/public' : `src/${activeApp}/public`;
  const publicDir = isProd ? "build/public" : `public`;

  expressApp.disable("x-powered-by");
  expressApp.use(express.static(publicDir));
  expressApp.post("/dispatch", (req, res) => {
    if (dispatch) {
      dispatch(req.body)
        .then(result => {
          res.send(result);
        })
        .catch(err => {
          console.error(err);
          res.status(500).send(String(err));
        });
    }
  });

  expressApp.get("/_/:domain/:ref*", (req, res) => {
    const refName = req.params.ref;
    const domain = req.params.domain;
    const refPath = req.params["0"];

    webDataInterface({ domain, refName, refPath, dispatch })
      .then(responder => {
        responder(res);
      })
      .catch(e => {
        res.status(500);
        console.error(e);
        res.send(e);
      });
  });

  expressApp.get("/*", (req, res) => {
    const { path, query } = req;

    let navigation = {};
    let title = "";
    let options = {};
    if (App.router) {
      const response = handleServerRequest(App.router, path, query);
      navigation = response.navigation;
      title = response.title;
      options = response.options;
    }

    const { element, getStyleElement } = AppRegistry.getApplication("App", {
      initialProps: {
        navigation,
        env: "server"
      }
    });

    const html = ReactDOMServer.renderToString(element);
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    res.send(
      `<!doctype html>
    <html lang="">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charSet='utf-8' />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style id="root-stylesheet">
        html, body, #root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        ${options.customCSS}
        </style>
        ${css}
        ${
          isProd
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="root">${html}</div>
        ${options.customHTML}
    </body>
</html>`
    );
  });

  const httpServer = http.createServer(expressApp);

  const wss = new WebSocket.Server({ server: httpServer });

  await startServer(httpServer, serverListenLocation);

  const wsServer = startSocketServer && (await startSocketServer(wss));

  console.log("Listening on " + serverListenLocation);
  IS_DEV && console.log(`http://localhost:${serverListenLocation}`);

  return {
    close: async () => {
      httpServer.close();
      wsServer && wsServer.close();
    }
  };
}