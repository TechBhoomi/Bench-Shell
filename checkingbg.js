const { execSync, exec } = require('child_process');
let { closeSecondaryWindow} = require('./secondwindow');
let { session   } = require('electron');


function checkAndTerminateApps(mainWindow, clearIntvPshell) {

mainWindow.setContentProtection(true);

const ScreenrecordNames = ['Eassiy Screen Recorder Ultimate', 'FonePaw Screen Recorder','UltraViewer_Desktop',  'Aqua Demo','AirDroid_Desktop_Client_3.7.2.1',
'AnyDesk', 'AnyDesk (1)', 'apowerrec-setup',  'bdcam', 'Bootstrapper', 'CamtasiaStudio', 'crashpad_handler','screen_recorder_setup','screen_recorder_setup.tmp', 
  'Screencast', 'screen-recorder (2)','screen-recorder (2).tmp','Skype', ' smartscreen', 'recorder', "Vidmore Screen Recorder", "ScreenRecorder", "VideoConverterUltimate",
  "Wondershare Filmora", "obs64", "ApowerREC" , "screenrec", "IceCream Screen Recorder", "Camtasia 2023"
  ,"ShareX", "Wondershare UniConverter", 'Wondershare Filmora', 'OBS Studio','Loom','Bandicam',  'Free Cam',   'Vidmore',   'FonePaw screen recorder',    'Eassiy',    'Snagit',
  'Zight',    'Wistia',    'Descript',    'Vmaker',    'Slack',    'Chrome remote desktop',    'G-Meet',    'Zoom',    'Team viewer',    'Webex',    'ScreenCastify',
  'Awesome ChatGPT Screenshot and Screenrecorder',    'Amazing Screen Recorder',    'Scrnli Screen Recorder and Screen Capture app',    'Chrome Remote Desktop',  
    'Screen Recorder for Google Chrome',  'ApowerMirror',    'AirDroid',"GameBar", "GameBarFTServer","FineScreenRecorder"
  
]

  const getProcessDetailsCommand = `Get-Process | Where-Object { $_.ProcessName -in (${ScreenrecordNames.map(name => `'${name}'`).join(', ')}) }`;

  exec(`powershell.exe -Command "${getProcessDetailsCommand}"`, (err, out, stdErr) => {
    if (err) {
      console.error(`Error getting process details: ${err.message}`);
      return;
    }
    if (stdErr) {
      return;
    }
    console.log(`Details of get Processes:\n${out}`);
  if(out){



    const appListMessage = ScreenrecordNames.filter((app, index) => {
      if(out.toLocaleLowerCase().includes(app.toLocaleLowerCase())){
        return `${index + 1}) ${app} \n`
      }
      
    });

    clearInterval(clearIntvPshell)
    mainWindow.webContents.setAudioMuted(true)




    mainWindow.loadFile('blank.html')
    mainWindow.show();
    mainWindow.focus();
    closeSecondaryWindow()

    mainWindow.webContents.on('did-finish-load', () => {
  
    mainWindow.webContents.send('data-to-renderer', appListMessage);
});

  }
  });
}




function funWinRemoteDsktop(app,showErrorDialog ){
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
          // mainWindow.webContents.send('remote-desktop-error', error.message);
        }
       },10000)
}
 


function headersmodified(){
  const customSession = session.fromPartition('custom');

  // Intercept requests using 'beforeSendHeaders' event
  customSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { url, requestHeaders } = details;

    // Check if the URL matches a certain pattern (e.g., 'https://example.com/api/')
    if (url.startsWith('https://example.com/api/')) {
      // Modify headers for the matched URL
      requestHeaders['Authorization'] = 'Bearer YourAccessToken';
      // Add other headers as needed

      // Call the callback with the modified headers
      callback({ cancel: false, requestHeaders });
    } else {
      // For other URLs, use original headers
      callback({ cancel: false, requestHeaders });
    }
  });
}

module.exports={
    funWinRemoteDsktop,
    checkAndTerminateApps
}