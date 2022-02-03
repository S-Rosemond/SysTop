const { app, BrowserWindow, Menu } = require("electron");
const { join } = require("path");
const Store = require("./store");

const isMac = process.platform === "darwin";
isDev = process.env.NODE_ENV !== "production";

const storeConfig = {
  configName: "user-settings",
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
};

const storage = new Store(storeConfig);

let win = null;

function createMenu() {
  const menu = [
    {
      label: "Window",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [{ role: "minimize" }],
    },
  ];

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
}

const defaultProps = {
  width: 500,
  height: 600,
  resizable: false,
  show: false,
  webPreferences: {
    preload: join(__dirname, "app/Javascript/preload.js"),
  },
};

const sysTopProps = {
  title: "SysTop",
  width: isDev ? 700 : 355,
  height: 500,
  icon: "./app/assets/icons/icon.png",
  resizable: isDev ? true : false,
  backgroundColor: "white",
};

const newProps = Object.assign({}, defaultProps, sysTopProps);

const defaultPath = "./app/html/index.html";

function createWindow(props = defaultProps, url = defaultPath) {
  win = new BrowserWindow(props);

  win.loadFile(url);

  win.on("ready-to-show", win.show);
}

app.on("ready", () => {
  createWindow(newProps);
  createMenu();

  win.webContents.on("dom-ready", () => {
    win.webContents.send("get:settings", storage.get("settings"));
  });
  win.on("closed", () => (win = null));
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
