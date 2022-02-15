"use strict";

process.env.NODE_ENV = "development";
const { app, BrowserWindow, Menu, Tray } = require("electron");
const { ipcMain } = require("electron/main");
const { join } = require("path");
const Store = require("./store");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "production";

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
let tray = null;

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

function createTray() {
  const icon = join(__dirname, "app", "assets", "icons", "tray_icon.png");
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show", click: () => win.show() },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setToolTip("SysTop");
  tray.setContextMenu(contextMenu);
}

app.on("ready", () => {
  createWindow(newProps);
  createMenu();
  createTray();

  win.webContents.on("dom-ready", () => {
    win.webContents.send("get:settings", storage.get("settings"));
  });

  tray.on("click", () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });

  win.on("closed", () => (win = null));
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on("save:settings", (event, settings) => {
  storage.set("settings", settings);
  win.webContents.send("get:settings", storage.get("settings"));
  win.webContents.send("show:alert", "Settings saved");
});

ipcMain.on("getUpdate:settings", (event, settings) => {
  win.webContents.send("getUpdate:settings", storage.get("settings"));
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
