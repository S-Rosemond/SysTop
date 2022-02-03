"use strict";

const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");
const os = require("os");
const osu = require("node-os-utils");
// const osuOS = osu.os;
const cpu = osu.cpu;
const mem = osu.mem;

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
async function setUsageStyle(domElement, overload) {
  // 1000 * 60 * 60;  1 hour
  //1000 * 60 * 5;  5 minutes
  const inDev = 1000 * 30; // 30 seconds

  const frequency = inDev;
  const notified = checkLastNotification(frequency);

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
  styleCpuProgress: (domElement, overload) =>
    setUsageStyle(domElement, overload),
  ipcRenderer,
  getDefaultSettings: (cpuOverload, alertFrequency) =>
    ipcRenderer.on("get:settings", (event, settings) => {
      cpuOverload.value = settings.cpuOverload;
      alertFrequency.value = settings.alertFrequency;
    }),
};

contextBridge.exposeInMainWorld("api", API);

// How to use ipcRenderer.on examples under ipcRenderer in API
