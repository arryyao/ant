"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var fs = require("fs");
var child_process_1 = require("child_process");
// require('update-electron-app')();
var win, serve;
var args = process.argv.slice(1);
serve = args.some(function (val) { return val === '--serve'; });
// let tray = null;
function copyFile(src, dist) {
    if (!fs.existsSync(dist)) {
        fs.writeFileSync(dist, fs.readFileSync(src));
    }
}
function runEngine() {
    console.log('Engine running');
    var userData = electron_1.app.getPath('userData');
    var cmdPath = userData + '/ant';
    console.log(userData);
    // Copy file from app.asar to user data
    copyFile(electron_1.app.getAppPath() + '/torrent/ant', cmdPath);
    copyFile(electron_1.app.getAppPath() + '/torrent/tracker.txt', userData + '/tracker.txt');
    copyFile(electron_1.app.getAppPath() + '/torrent/config.toml', userData + '/config.toml');
    fs.chmodSync(cmdPath, '0555');
    console.log('Done');
    var torrentEngine = child_process_1.exec(cmdPath, { cwd: userData }, function (error, stdout, stderr) {
        if (error) {
            console.error("Exec Failed: " + error);
            return;
        }
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
    });
    torrentEngine.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
    });
    torrentEngine.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    torrentEngine.on('close', function (code) {
        console.log('out code：' + code);
    });
}
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    win = new electron_1.BrowserWindow({
        width: size.width * 0.65,
        height: size.height * 0.7,
        minWidth: size.width * 0.6,
        minHeight: size.height * 0.6,
        title: 'ANT Downloader',
        icon: path.join(__dirname, 'src/assets/tray.png'),
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
    });
    if (serve) {
        require('electron-reload')(__dirname, {
            electron: require(__dirname + "/node_modules/electron")
        });
        win.loadURL('http://localhost:4200');
    }
    else {
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    if (serve || true) {
        win.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    win.on('closed', function () {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
        // tray.destroy();
    });
    win.webContents.session.on('will-download', function (event, item, webContents) {
        var filePath = electron_1.app.getPath('downloads') + '/' + item.getFilename();
        console.log(filePath);
        item.setSavePath(filePath);
        item.once('done', function (evt, state) {
            if (state === 'completed') {
                console.log('Download successfully');
                win.webContents.send('torrentDownload', filePath);
            }
            else {
                console.log("Download failed: " + state);
                alert('Failed to get meta data');
            }
        });
    });
    // tray = new Tray(path.join(__dirname, 'src/assets/tray.png'));
    // const contextMenu = Menu.buildFromTemplate([
    //   { label: '新建下载', type: 'normal' },
    //   { label: '', type: 'separator' },
    //   { label: '全部开始', type: 'normal' },
    //   { label: '全部暂停', type: 'normal' },
    // ]);
    // tray.setToolTip('ANT Downloader');
    // tray.setContextMenu(contextMenu);
}
try {
    // run torrent engine
    if (!serve) {
        runEngine();
    }
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    electron_1.app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });
}
catch (e) {
    // Catch Error
    // throw e;
}
//# sourceMappingURL=main.js.map