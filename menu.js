const { app, Menu, Tray } = require("electron");
const { join } = require("path");

const isMac = process.platform === "darwin";

function buildMenuTemplate(menuTemplate) {
  return Menu.buildFromTemplate(menuTemplate);
}

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

  const mainMenu = buildMenuTemplate(menu);
  Menu.setApplicationMenu(mainMenu);
}

function createTray(win) {
  const icon = join(__dirname, "app", "assets", "icons", "tray_icon.png");
  tray = new Tray(icon);
  const trayMenu = [
    { label: "Show", click: () => win.show() },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ];
  const contextMenu = buildMenuTemplate(trayMenu);

  tray.setToolTip("SysTop");
  tray.setContextMenu(contextMenu);

  return tray;
}

const popupMenu = Menu.buildFromTemplate([
  {
    label: "Quit",
    click: () => {
      app.isQuitting = true;
      app.quit();
    },
  },
]);

module.exports = { createMenu, createTray, popupMenu };
