const electron = require("electron");
const { join } = require("path");
const fs = require("fs");

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaults;
  }
}

class Store {
  constructor(options) {
    const userDataPath = electron.app.getPath("userData");

    this.path = join(userDataPath, options.configName + ".json");
    this.data = parseDataFile(this.path, options.defaults);
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.writeFile();
  }
  delete(key) {
    delete this.data[key];
    this.writeFile();
  }
  writeFile() {
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

module.exports = Store;
