const { app, BrowserWindow, globalShortcut, desktopCapturer, systemPreferences,screen, dialog,session  } = require('electron');
const path = require('path');
var os = require('os');
const { execSync } = require('child_process');
const machineId = require('node-machine-id');

let mainWindow;
const secondaryWindows = new Set();

function showErrorDialog(message) {
  dialog.showErrorBox('Error', message);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      allowPopups: false,
      devTools: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.setContentProtection(true);

  globalShortcut.register('CommandOrControl+Tab', () => {
    console.log('CommandOrControl+X is pressed');
  });

  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    for (const source of sources) {
      console.log(source.name);
    }
  });
 
  const checkDisplaySettings = () => {
    const displays = screen.getAllDisplays();
  
  // Check if there's only one display with certain dimensions

  console.log({dl:displays.length,
      dw:displays[0].size.width,
    dh:displays[0].size.height
  })
 
};
  
  
  checkDisplaySettings();
  systemPreferences.on('display-metrics-changed', () => {
    checkDisplaySettings();
  });


  mainWindow.webContents.setWindowOpenHandler((details) => {
    createSecondaryWindow(details.url);
    return {action:"deny"}
  })


 
    let mainwinRemoteDsktop=  setInterval(()=>{
       try {
         const output = execSync('quser', { encoding: 'utf-8' });
         const lines = output.split('\n');
         console.log('mainwindow lines:', lines);
   
   
         // Check for lines indicating RDP sessions
         const isRemoteSession = lines.some(line => line.toLowerCase().includes('rdp-tcp'));
   
         if(isRemoteSession){
         console.log('Is Remote Desktop Connection--------------------------====>:', isRemoteSession);
   clearInterval(mainwinRemoteDsktop)
   showErrorDialog("detected Remote Desktop")

       app.quit();
   
         }
       } catch (error) {
         console.error('Error detecting Remote Desktop:', error);
         mainWindow.webContents.send('remote-desktop-error', error.message);
       }
      },30000)
    
      const defaultSession = session.defaultSession;

      const deviceId = machineId.machineIdSync();

      // Use the device ID in your application

      // Modify the user agent for all requests to the following urls.
const filter = {
  urls: ['http://192.168.1.202:3031/*',  'http://106.51.74.69:8000/*','http://192.168.1.252:4007/*','http://106.51.74.69:9084/*']
}

session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
  const { requestHeaders } = details;

  // Overwrite or modify existing headers
  requestHeaders['authorization'] = 'Bearer NewToken';
  requestHeaders['Custom-Header'] = 'NewValue';
console.log("modified req", requestHeaders)
  // Continue with the modified headers
  callback({ requestHeaders });
});

      console.log('Device ID:', deviceId);
      // Intercept and modify outgoing HTTP requests
      const urlsToIntercept = [
        "http://106.51.74.69:3031/",
       "http://106.51.74.69:8000/",
       "http://192.168.1.252:4007/",
       "http://106.51.74.69:9084/",
      ];
    //   defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {

    //     if (urlsToIntercept.some(apiUrl => details.url.startsWith(apiUrl))) {


    //       const updatedHeaders = Object.assign({}, details.requestHeaders, {
    //         'Device-ID': deviceId // Replace with your device ID
    //       });
    // console.log(updatedHeaders)
    //       callback({ cancel: false, requestHeaders: updatedHeaders });
    //     } else {
    //       callback({ cancel: false, requestHeaders: details.requestHeaders });
    //     }
    //   });

      defaultSession.webRequest.onSendHeaders((details) => {
        const url = details.url;
    
        // Check if the request URL matches any of the URLs to intercept
        if (urlsToIntercept.some(apiUrl => details.url.startsWith(apiUrl))) {
          console.log('Request headers:', details.requestHeaders); // Log request headers
        }
      });

      mainWindow.on('closed', () => {
        mainWindow = null;
        if (secondaryWindows.size === 0) {
          app.quit();
        }
      });
    

}
  
  
   


const interfaces = os.networkInterfaces();
const addresses = [];

for (const k in interfaces) {
  for (const k2 in interfaces[k]) {
    const address = interfaces[k][k2];
    if (address.family === 'IPv4' && !address.internal) {
      addresses.push(address.address);
    }
  }
}

console.log(addresses); 




function createSecondaryWindow(url) {
  let win = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    // fullscreen: true,
    // kiosk: true,
    webPreferences: {
      

        menu: null,
        frame: false,
        autoHideMenuBar: true,
      contextIsolation: true,
      nodeIntegration: true,
      allowPopups: false,
      devTools: false,
    }
  });
  win.setMenu(null)
  win.once('ready-to-show', () => win.show());
  win.loadURL(url, {userAgent: 'Chrome'}); // Replace this URL with your desired URL
  win.setContentProtection(true);

  win.webContents.setWindowOpenHandler((details) => {return {action:'deny'}})


  
    let winRemoteDsktop=  setInterval(()=>{
       try {
         const output = execSync('quser', { encoding: 'utf-8' });
         const lines = output.split('\n');
         console.log('secandary window lines:', lines);
   
   
         // Check for lines indicating RDP sessions
         const isRemoteSession = lines.some(line => line.toLowerCase().includes('rdp-tcp'));
   
         if(isRemoteSession){
         console.log('Is Remote Desktop Connection--------------------------====>:', isRemoteSession);
   clearInterval(winRemoteDsktop)
   showErrorDialog("detected Remote Desktop")

       app.quit();
   
         }
       } catch (error) {
         console.error('Error detecting Remote Desktop:', error);
         mainWindow.webContents.send('remote-desktop-error', error.message);
       }
      },30000)
   

  win.on('closed', () => {
   clearInterval(winRemoteDsktop)
    console.log("clearInetrval---winRemoteDsktop")
    showErrorDialog("child window closed")

    secondaryWindows.delete(win);
    win = null;
    // if (mainWindow === null && secondaryWindows.size === 0) {
    //   app.quit();
    // }
  });

  secondaryWindows.add(win);
}

app.whenReady().then(()=>{
    createMainWindow()

}

    );

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

