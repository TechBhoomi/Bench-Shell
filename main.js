let { app, BrowserWindow,  screen, dialog, Menu, ipcMain,session   } = require('electron');
let {createSecondaryWindow, secondaryWindows} = require('./secondwindow');
const os = require('os');
let {checkAndTerminateApps, funWinRemoteDsktop} = require('./checkingbg');
const {  spawn } = require('child_process');
let { closeSecondaryWindow} = require('./secondwindow');
const { autoUpdater } = require("electron-updater")

const path=require("path")



let mainWindow;


let checkInertnet= require('dns')

function showErrorDialog(message) {
  dialog.showErrorBox('Error', message);
}

function createMainWindow() {
const {width, height} = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    title:"Bench",
    // fullscreen: true,
    // kiosk: true,
    icon: path.join(__dirname, './assests/icon.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      allowPopups: false,
      devTools: false,
      preload: path.join(__dirname, 'blank.js')
    }
  });
mainWindow.maximize()

// ----------------------


const defaultSession = session.defaultSession;

// Intercept requests and modify headers for matched URLs
defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  // Check if the URL matches the desired pattern
  if (details.url.startsWith('http://106.51.74.69:2424/')) {
    // Modify headers for the matched URL
  console.log(details.url)
    const newHeaders = Object.assign({}, details.requestHeaders, {
      'Device-Id':  os.machine() + '-' + os.userInfo().username,
      'App-version':app.getVersion()
      // Add other headers as needed
    });

    // Continue the request with the modified headers
    callback({ requestHeaders: newHeaders });
  } else {
    // For URLs that don't match, proceed without modification
    callback({ requestHeaders: details.requestHeaders });
  }
});



  mainWindow.loadURL("http://106.51.74.69:8000/")
  mainWindow.setContentProtection(true);
   mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadFile('index.html');
  
  });

  mainWindow.on('focus', () => {
  mainWindow.setContentProtection(true);
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      console.log('Focused window title:', focusedWindow.getTitle());
      focusedWindow.setContentProtection(true)
      checkInertnet.resolve('www.google.com', function(err) {
        if (err) {
          mainWindow.loadFile('index.html'); // Load a local HTML file indicating offline status
        }else{
          console.log("internet connectin is working")
        }
      });
    }
  });

  const mainMenuTemplate = [
    {
      label: 'File',
      submenu: [
        {label:"Exit", role: 'quit' } 
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' }
      ]
    },
    {
      label: 'view',
      submenu: [
        { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      label: 'App',
      submenu: [
        {
          label: 'Manager',
          click:  () => {
           
            mainWindow.loadURL("http://106.51.76.167:4007/")
          }
        },
        {
          
            label: 'Student',
            click: async () => {
              mainWindow.loadURL("http://106.51.74.69:8000/")
            
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check For Update',
          click: async () => {
            dialog.showMessageBox(mainWindow, { 
              type:"none",
            title: 'No-Update',
            message: 'Curent version is up-to-date',
            // detail: 'Additional details can be provided here.',
            buttons: ['OK']});
          }
        },
        {
          label: `Version - ${app.getVersion()}`,
        }
      ]
    }
   
  ];

  // Create the menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  // Set the application menu
  Menu.setApplicationMenu(mainMenu);


  mainWindow.webContents.setWindowOpenHandler((details) => {
    createSecondaryWindow(details.url);
    return {action:"deny"}
  })



  let clearIntvPshell  = setInterval(()=>{
    checkAndTerminateApps(mainWindow, clearIntvPshell)
  }, 10000);

 funWinRemoteDsktop(app, showErrorDialog)

      mainWindow.on('closed', () => {
        mainWindow = null;
        closeSecondaryWindow()

        if (secondaryWindows.size === 0) {
          app.quit();
        }
      });
   
      
      ipcMain.on('send-data-to-main', (event, data) => {
        console.log('Data received in main process from renderer:', data);
    
        if (data== "no") { 
    
          return    app.quit();
         }
    
        // Testing.
        if (data ==="yes") {
    mainWindow.loadURL("http://106.51.74.69:8000/")
    mainWindow.setContentProtection(true);
    
    mainWindow.webContents.setAudioMuted(false)
      // const commandget = `powershell.exe -ExecutionPolicy Bypass -Command "Stop-Process  -Name ${ScreenrecordNames.map(name => `'${name}'`).join(',')} -Force"`;
      // const command = `powershell.exe -ExecutionPolicy Bypass -Command "Stop-Process  -Name ${ScreenrecordNames.map(name => `'${name}'`).join(', ')}  -Force"`
      
      const powershellCommand = `
      $processesToMatch = @(
          'Eassiy Screen Recorder Ultimate', 'FonePaw Screen Recorder', 'UltraViewer_Desktop', 'Aqua Demo', 'AirDroid_Desktop_Client_3.7.2.1',
          'AnyDesk', 'AnyDesk (1)', 'apowerrec-setup', 'bdcam', 'Bootstrapper', 'CamtasiaStudio', 'crashpad_handler', 'screen_recorder_setup',
          'screen_recorder_setup.tmp', 'Screencast', 'screen-recorder (2)', 'screen-recorder (2).tmp', 'Skype', ' smartscreen', 'recorder',
          'Vidmore Screen Recorder', 'ScreenRecorder', 'VideoConverterUltimate', 'Wondershare Filmora', 'obs64', 'ApowerREC', 'screenrec',
          'IceCream Screen Recorder', 'Camtasia 2023', 'ShareX', 'Wondershare UniConverter', 'Wondershare Filmora', 'OBS Studio', 'Loom',
          'Bandicam', 'Free Cam', 'Vidmore', 'FonePaw screen recorder', 'Eassiy', 'Snagit', 'Zight', 'Wistia', 'Descript', 'Vmaker',
          'Slack', 'Chrome remote desktop', 'G-Meet', 'Zoom', 'Team viewer', 'Webex', 'ScreenCastify', 'Awesome ChatGPT Screenshot and Screenrecorder',
          'Amazing Screen Recorder', 'Scrnli Screen Recorder and Screen Capture app', 'Chrome Remote Desktop', 'Screen Recorder for Google Chrome',
          'ApowerMirror', 'AirDroid', 'GameBar', 'GameBarFTServer','FineScreenRecorder'
      )
      
      $processes = Get-Process | Where-Object { $processesToMatch -contains $_.ProcessName }
      
      # Stop the matched processes
      if ($processes) {
          $processes | ForEach-Object {
              Stop-Process -Id $_.Id -Force
          }
      }
      `;
      
      const child = spawn('powershell.exe', ['-Command', powershellCommand]);
    
      child.stdout.on('data', (data) => {
          console.log('stdout:', data.toString());
      });
      
      child.stderr.on('data', (data) => {
          console.error('stderr:', data.toString());
      });
      
      child.on('close', (code) => {
          console.log('Child process exited with code', code);
      }); 
        
      let clearIntvPshell1 =setInterval(()=>{
          checkAndTerminateApps(mainWindow, clearIntvPshell1)
        }, 10000)
      }
    
      });


}
 





app.whenReady().then(async ()=>{

    createMainWindow()
    autoUpdater.checkForUpdatesAndNotify()
  });
  


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    closeSecondaryWindow()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

//=234=234=3=23==24

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available.')
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  // let log_message = "Download speed: " + progressObj.bytesPerSecond
  // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
  // console.log(log_message)

    win.webContents.send('download-progress', progressObj.percent)

})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded')
})