const path = require('path');
const os = require('os');
const { ipcRenderer } = require('electron');

const form = document.getElementById('image-form');
const slider = document.getElementById('slider');
const img = document.getElementById('img');

document.getElementById('output-path').innerText = path.join(
  os.homedir(),
  'pictures',
  'imageshrink'
);

// Onsubmit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!img) {
    console.log('Image not exist');
    return '';
  }

  const imgPath = img.files[0].path;
  const quality = slider.value;

  //   console.log(imgPath, quality);
  ipcRenderer.send('image:minimize', {
    imgPath,
    quality,
  });
});
