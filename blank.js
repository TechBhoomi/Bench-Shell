const { ipcRenderer } = require('electron');

    // Handle receiving data from the main process
    ipcRenderer.on('data-to-renderer', (event, data) => {
      console.log('Data received in renderer process:', data);
      // Do something with the data received from the main process

    

     let htmlString = '<ul>';
data.forEach(item => {
  htmlString += `<li>${item}</li>`;
});
htmlString += '</ul>';

      document.getElementById('data-display').innerHTML= htmlString
      
      // Optionally send data back to the main process
      ipcRenderer.send('renderer-to-main', 'Data received in renderer');
    });

    let yesbutton=document.getElementById('buttonYes')
    let nobutton=document.getElementById('buttonNo')

    yesbutton.addEventListener("click",()=>{
      console.log("ipcRenderer.send('renderer-to-main', 'yes');")
      ipcRenderer.send('send-data-to-main', 'yes');

    })

    nobutton.addEventListener("click",()=>{
      console.log("ipcRenderer.send('renderer-to-main', 'no');")

      ipcRenderer.send('send-data-to-main', 'no');

    })