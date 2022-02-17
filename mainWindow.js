const { BrowserWindow } = require("electron");
const { join } = require("path");

const isDev = process.env.NODE_ENV !== "production";

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
  mainWindow = new BrowserWindow(props);

  mainWindow.loadFile(url);

  mainWindow.on("ready-to-show", mainWindow.show);

  return mainWindow;
}

module.exports = { createWindow, newProps };
