const { app, BrowserWindow, shell } = require("electron");
const fs = require("fs");
const http = require("http");
const net = require("net");
const path = require("path");

const DEV = process.argv.includes("--dev");
const DEV_URL = "http://localhost:8081";
const BACKEND_PORT = 4000;
const WEB_DIR = path.join(__dirname, "app");
const BACKEND_ENTRY = path.join(__dirname, "backend-dist", "backend", "src", "index.js");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function isPortFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(port, "127.0.0.1");
  });
}

// Runs the news backend inside the app so the desktop version works without a separate server.
async function startEmbeddedBackend() {
  if (!(await isPortFree(BACKEND_PORT))) {
    console.log(`[desktop] Port ${BACKEND_PORT} occupé : on utilise le backend déjà lancé.`);
    return;
  }
  if (!fs.existsSync(BACKEND_ENTRY)) {
    console.warn("[desktop] Backend non compilé (lance `npm run build:backend`).");
    return;
  }
  process.env.PORT = String(BACKEND_PORT);
  require(BACKEND_ENTRY);
}

// Expo's web export uses absolute asset paths, so it must be served over http rather than file://.
function serveWebApp() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      let filePath = path.normalize(path.join(WEB_DIR, urlPath));
      if (!filePath.startsWith(WEB_DIR)) {
        res.writeHead(403).end();
        return;
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(WEB_DIR, "index.html"); // client-side routes like /article/123
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] ?? "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(`http://127.0.0.1:${server.address().port}`));
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 420,
    minHeight: 560,
    title: "TechPulse",
    backgroundColor: "#0B1020",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });

  // External links (articles, YouTube) open in the user's normal browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  const url = DEV ? DEV_URL : await serveWebApp();
  if (!DEV && !fs.existsSync(path.join(WEB_DIR, "index.html"))) {
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent("<h2 style='font-family:sans-serif'>Interface non compilée : lance <code>npm run build</code> dans packages/desktop.</h2>"),
    );
    return;
  }
  console.log(`[desktop] Interface servie sur ${url}`);
  win.loadURL(url);
}

app.setAppUserModelId("com.techpulse.app");

app.whenReady().then(async () => {
  await startEmbeddedBackend();
  await createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
