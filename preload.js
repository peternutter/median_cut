const os = require("os");
const path = require("path");
const { contextBridge, ipcRenderer } = require("electron");
const Toastify = require("toastify-js");
const fs = require("fs");

contextBridge.exposeInMainWorld("os", {
  homedir: () => os.homedir(),
});

contextBridge.exposeInMainWorld("fs",{
  existsSync: (path) => fs.existsSync(path),
});

contextBridge.exposeInMainWorld("path", {
  join: (...args) => path.join(...args),
  dirname: (p) => path.dirname(p),
});

contextBridge.exposeInMainWorld("Toastify", {
  toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld("ipcRenderer", {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
