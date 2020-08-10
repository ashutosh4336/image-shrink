const { app, BrowserWindow, Menu, globalShortcut } = require('electron');

// Check Platform
const isMac = process.platform === 'darwin' ? true : false;
const isLinux = process.platform === 'linux' ? true : false;
const isWin = process.platform === 'win32' ? true : false;

// Set ENV
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;

let mainWindow;
let aboutWindow;

// Main App Entry Page / Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Shrink',
    width: 600,
    height: 800,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: '#ddd',
  });

  mainWindow.loadFile(`./app/index.html`);
}

// About Page / Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About Image-Shrink',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: '#ddd',
  });

  aboutWindow.loadFile(`./app/about.html`);
}

// Initilize App (losely)
app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Global Short Cuts - (Not Required because I used 'Developer' menu down)
  // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
  // globalShortcut.register(isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', () =>
  //   mainWindow.toggleDevTools()
  // );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// App Menus
const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
];

// For Mac
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Deprecation Warnings
// app.allowRendererProcessReuse = true;
