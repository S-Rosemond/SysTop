"use strict";

const { contextBridge, ipcRenderer } = require("electron");
const os = require("os");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const Store = require("../../store");

// could add style parameter to set the progress bar
async function getCpuProcess(domElement, processName) {
  const process = await cpu[processName]();

  domElement.innerText = `${process}%`;
}

// Send notification
function notifyUser(options) {
  new Notification(options.title, options);
}

// check if user has been notified
function checkLastNotification(frequency) {
  const lastNotification = localStorage.getItem("lastNotification");

  if (lastNotification === null || lastNotification === undefined) return false;

  if (lastNotification) {
    const currentTime = +new Date();
    const timeDiff = currentTime - lastNotification;

    if (timeDiff > frequency) return false;
  }

  return true;
}

// Separating the functions to make it easier to read
async function setUsageStyle(domElement, overload, frequency) {
  // 1000 * 60 * 60; 1 hour
  // 1000 * 60 ; 1 minutes

  const newFrequency = 1000 * 60 * frequency;

  // const frequency = inDev;
  const notified = checkLastNotification(newFrequency);

  const value = await cpu.usage();

  domElement.style.width = `${value}%`;

  if (value > overload) {
    domElement.style.background = "red";

    if (!notified) {
      notifyUser({
        title: "CPU overloaded",
        body: `CPU is over ${domElement.style.width || 80}%`,
        icon: "../assets/icons/icon.png",
      });

      localStorage.setItem("lastNotification", +new Date());
    }
  } else domElement.style.background = "var(--primary-color)";
}

const API = {
  cpuModel: () => cpu.model(),
  hostName: () => os.hostname(),
  os,
  osType: () => os.type(),
  osArch: () => os.arch(),
  mem,
  getCpuUsage: (domElement, processName = "usage") =>
    getCpuProcess(domElement, processName),
  getCpuFree: (domElement, processName = "free") =>
    getCpuProcess(domElement, processName),
  styleCpuProgress: (domElement) => {
    // this works and no memory leak message
    ipcRenderer.send("getUpdate:settings");
    ipcRenderer.once("getUpdate:settings", (event, settings) => {
      setUsageStyle(domElement, settings.cpuOverload, settings.alertFrequency);
    });
  },
  ipcRenderer,
  getDefaultSettings: (cpuOverload, alertFrequency) =>
    ipcRenderer.on("get:settings", (event, settings) => {
      cpuOverload.value = settings.cpuOverload;
      alertFrequency.value = settings.alertFrequency;
    }),
  showAlert: (callback) =>
    ipcRenderer.on("show:alert", (event, options) => callback(options)),
};

contextBridge.exposeInMainWorld("api", API);

// How to use ipcRenderer.on examples under ipcRenderer in API
