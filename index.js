"use strict";

process.env.NODE_ENV = "development";
const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron/main");
const Store = require("./store");
const { createWindow, newProps } = require("./mainWindow");
const { createMenu, createTray, popupMenu } = require("./menu");

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

app.on("ready", () => {
  win = createWindow(newProps);
  createMenu();
  tray = createTray(win);

  win.webContents.on("dom-ready", () => {
    win.webContents.send("get:settings", storage.get("settings"));
  });

  let trayPopupIsOpen = false;

  tray.on("click", () => {
    // solution for smooth tray popup on double click
    // found electron methods for popupMenu, instead of rebuilding the menu each subsequent click
    if (win.isVisible()) win.hide();
    else if (trayPopupIsOpen === false && !win.isVisible()) {
      popupMenu.popup();
      trayPopupIsOpen = true;
    } else {
      trayPopupIsOpen = false;
      popupMenu.closePopup();
    }
  });

  tray.on("double-click", () => {
    win.show();
  });

  win.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      app.isQuitting = true;
    }
    win.hide();
    // need dialog to confirm
  });
  win.on("closed", () => (win = null));
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow(win, newProps);
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
