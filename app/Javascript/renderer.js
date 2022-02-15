"use strict";

const alertFrequency = document.getElementById("alert-frequency");
const computerName = document.getElementById("comp-name");
const cpuFree = document.getElementById("cpu-free");
const cpuModel = document.getElementById("cpu-model");
const cpuOverload = document.getElementById("cpu-overload");
const cpuProgress = document.getElementById("cpu-progress");
const cpuUsage = document.getElementById("cpu-usage");
const formSettings = document.getElementById("settings-form");
const os = document.getElementById("os");
const sysUptime = document.getElementById("sys-uptime");
const totalMemory = document.getElementById("mem-total");

async function getTotalMemoryInMb() {
  const info = await window.api.mem.info();
  totalMemory.innerText = info.totalMemMb;
  return;
}

function convertFromTime(timeValue = window.api.os.uptime()) {
  timeValue = Number(timeValue);

  const days = Math.floor(timeValue / (3600 * 24));
  const hours = Math.floor((timeValue % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeValue % 3600) / 60);
  const seconds = Math.floor(timeValue % 60);

  sysUptime.innerText = ` ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

// Set Model
cpuModel.innerText = window.api.cpuModel();

// Set Computer Name
computerName.innerText = window.api.hostName();

// OS
os.innerText = `${window.api.osType()} ${window.api.osArch()}`;

// Total Memory
getTotalMemoryInMb();

// show alert
function showAlert(msg) {
  const alert = document.getElementById("alert");
  alert.classList.remove("hide");
  alert.classList.add("alert");
  alert.innerText = msg;

  setTimeout(() => {
    alert.classList.remove("alert");
    alert.classList.add("hide");
  }, 3000);
}

// Ipc Renderer
window.api.getDefaultSettings(cpuOverload, alertFrequency);
window.api.showAlert(showAlert);

// submit settings
formSettings.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = {
    cpuOverload: cpuOverload.value,
    alertFrequency: alertFrequency.value,
  };

  window.api.ipcRenderer.send("save:settings", formData);
});

// Run every 2 seconds
setInterval(() => {
  window.api.getCpuUsage(cpuUsage);
  window.api.getCpuFree(cpuFree);
  window.api.styleCpuProgress(cpuProgress);
  convertFromTime();
}, 2000);
