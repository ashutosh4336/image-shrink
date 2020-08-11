const path = require('path');
const os = require('os');

const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  ipcMain,
  shell,
} = require('electron');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');
const log = require('electron-log');

// Check Platform
const isMac = process.platform === 'darwin' ? true : false;
const isLinux = process.platform === 'linux' ? true : false;
const isWin = process.platform === 'win32' ? true : false;

// Set ENV
// process.env.NODE_ENV = 'development';
process.env.NODE_ENV = 'production';
const isDev = process.env.NODE_ENV !== 'production' ? true : false;

let mainWindow;
let aboutWindow;

// Main App Entry Page / Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Image Shrink',
    width: isDev ? 1000 : 600,
    height: 700,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.loadFile(`./app/index.html`);
}

// About Page / Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About Image-Shrink',
    width: 400,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: '#880e4f',
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
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
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

ipcMain.on('image:minimize', (e, options) => {
  options.dest = path.join(os.homedir(), 'pictures', 'imageshrink');
  shrinkImage(options);
});

async function shrinkImage({ imgPath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imagemin([slash(imgPath)], {
      destination: dest,
      plugins: [
        imageminMozjpeg({ quality }),
        imageminPngquant({
          quality: [pngQuality, pngQuality],
        }),
      ],
    });
    // console.log(files);
    log.info(files);

    // Open Destination Folder containg the Resulted File
    shell.openPath(dest);

    mainWindow.webContents.send('image:done');
  } catch (err) {
    console.log(err);
    log.error(err);
  }
}

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
app.allowRendererProcessReuse = true;
app.enableRemoteModule = true;
