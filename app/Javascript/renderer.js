"use strict";

const alertFrequency = document.getElementById("alert-frequency");
const cpuOverload = document.getElementById("cpu-overload");
const cpuModel = document.getElementById("cpu-model");
const cpuUsage = document.getElementById("cpu-usage");
const cpuFree = document.getElementById("cpu-free");
const cpuProgress = document.getElementById("cpu-progress");
const sysUptime = document.getElementById("sys-uptime");
const computerName = document.getElementById("comp-name");
const os = document.getElementById("os");
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

// Ipc Renderer
window.api.getDefaultSettings(cpuOverload, alertFrequency);

// Run every 2 seconds
setInterval(() => {
  window.api.getCpuUsage(cpuUsage);
  window.api.getCpuFree(cpuFree);
  window.api.styleCpuProgress(cpuProgress, 80);
  convertFromTime();
}, 2000);
