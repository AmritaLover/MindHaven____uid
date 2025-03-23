// MP3player_________________________________________________________
let currentMusic = 0;

const music = document.querySelector('#audio');
const seekBar = document.querySelector('.seek-bar');
const songName = document.querySelector('.music-name');
const artistName = document.querySelector('.artist-name');
const disk = document.querySelector('.disk');
const currentTime = document.querySelector('.current-time'); // Fixed the selector
const musicDuration = document.querySelector('.song-duration');
const playBtn = document.querySelector('.play-btn');
const forwardBtn = document.querySelector('.forward-btn');
const backwardBtn = document.querySelector('.backward-btn');

playBtn.addEventListener('click', () => {
    if (playBtn.className.includes('pause')) {
        music.play();
    } else {
        music.pause();
    }
    playBtn.classList.toggle('pause');
    disk.classList.toggle('play');
});

// Setup music
const setMusic = (i) => {
    seekBar.value = 0;
    let song = songs[i];
    currentMusic = i;
    music.src = song.path;

    songName.innerHTML = song.name;
    artistName.innerHTML = song.artist;
    disk.style.backgroundImage = `url('${song.cover}')`;

    currentTime.innerHTML = '00:00';
    setTimeout(() => {
        seekBar.max = music.duration;
        musicDuration.innerHTML = formatTime(music.duration);
    }, 300);
};

setMusic(0);

// funcn to format time in min:sec
const formatTime = (time) => {
    let min = Math.floor(time / 60);
    if (min < 10) {
        min = `0${min}`;
    }
    let sec = Math.floor(time % 60);
    if (sec < 10) {
        sec = `0${sec}`;
    }
    return `${min}:${sec}`;
};

// seek bar
setInterval(() => {
    seekBar.value = music.currentTime;
    currentTime.innerHTML = formatTime(music.currentTime);
    if (Math.floor(music.currentTime) == Math.floor(seekBar.max)) { 
        forwardBtn.click();
    }
}, 500);

seekBar.addEventListener('change', () => {
    music.currentTime = seekBar.value;
});

const playMusic = () => {
    music.play();
    playBtn.classList.remove('pause');
    disk.classList.add('play');
};




// fwd and bwd btns
forwardBtn.addEventListener('click', () => {
    if (currentMusic >= songs.length - 1) {
        currentMusic = 0;
    } else {
        currentMusic++;
    }
    setMusic(currentMusic);
    playMusic();
});

backwardBtn.addEventListener('click', () => {
    if (currentMusic <= 0) {
        currentMusic = songs.length - 1;
    } else {
        currentMusic--;
    }
    setMusic(currentMusic);
    playMusic();
});

// _______________________________________________________________EYES____________________________________________________________________


// variables to track previous mouse positions and Timestamp 
let lastMouseX = 0;
let lastMouseY = 0;
let lastTimestamp = 0;

// squint threshodl (pixels per millisecond)
const SQUINT_THRESHOLD = 1.0;                                           // value to be adjusted to control sensitivity

// flag to prevent overlapping squint animations
let isSquinting = false;

// funcn to radomly trigger blink
function randomBlink() {
    const eyes = document.querySelectorAll('.eye');
    // add blink class while running
    eyes.forEach((eye) => {
        eye.classList.add('blink');
    });
    // to remove blink class after having run once
    setTimeout(() => {
        eyes.forEach((eye) => {
            eye.classList.remove('blink');
        });
    }, 400); 
}

setInterval(() => {
    const randomInterval = Math.floor(Math.random() * 50000) + 10000; 
    setTimeout(randomBlink, randomInterval);
}, 1000);

// EYE FOLLOW
document.querySelector("body").addEventListener("mousemove", moveEyes);

function moveEyes(event) {
    let eyes = document.querySelectorAll(".eye");
    eyes.forEach((eye) => {
        
        let eyeRect = eye.getBoundingClientRect();
        
        let eyeCenterX = eyeRect.left + eyeRect.width / 2;
        let eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        let deltaX = event.pageX - eyeCenterX;
        let deltaY = event.pageY - eyeCenterY;
        let angle = Math.atan2(deltaY, deltaX);
        
        let maxDistance = eyeRect.width / 4; 
        let distance = Math.min(maxDistance, Math.hypot(deltaX, deltaY));
        
        let pupilX = (distance * Math.cos(angle)) + eyeRect.width / 2;
        let pupilY = (distance * Math.sin(angle)) + eyeRect.height / 2;
        
        let pupil = eye.querySelector(".pupil");
        pupil.style.left = `${pupilX}px`;
        pupil.style.top = `${pupilY}px`;
    });
}


function squintEyes() {
    const eyes = document.querySelectorAll('.eye');
    
    isSquinting = true;
    
    eyes.forEach((eye) => {
        eye.classList.add('squint');
    });
    
    setTimeout(() => {
        eyes.forEach((eye) => {
            eye.classList.remove('squint');
        });
       
        isSquinting = false;
    }, 300); 
}

// _______________________________________________________CANVAS___________________________________________________________________________

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// canvas size set to match css size
canvas.width = 500; 
canvas.height = 300;


let isDrawing = false;
let lastX = 0;
let lastY = 0;


const drawColor = "rgba(213, 238, 187, 0.1)"; //stroke color
const strokeWidth = 4; // stroke width

// canvas timer later for fading
let clearTimer;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    [lastX, lastY] = getCursorPosition(e); 
    resetClearTimer();

   
    const rect = canvas.getBoundingClientRect();
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;
    lastTimestamp = performance.now(); 
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing) {
        const [x, y] = getCursorPosition(e); 
        drawLine(lastX, lastY, x, y);
        [lastX, lastY] = [x, y];
        resetClearTimer();

        // to calculate mouse speed
        const rect = canvas.getBoundingClientRect();
        const currentMouseX = e.clientX - rect.left;
        const currentMouseY = e.clientY - rect.top;
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTimestamp;

        // calc dist
        const deltaX = currentMouseX - lastMouseX;
        const deltaY = currentMouseY - lastMouseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Calculate speed (pixels per millisecond)
        const speed = distance / deltaTime;

        //trigger squint effect is speed exceeds threshold
        if (speed > SQUINT_THRESHOLD && !isSquinting) {
            squintEyes();
        }

        // update tracking variable
        lastMouseX = currentMouseX;
        lastMouseY = currentMouseY;
        lastTimestamp = currentTime;
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    resetClearTimer();
});

canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    resetClearTimer();
});

// fucntion to get cursor position
function getCursorPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; 
    const scaleY = canvas.height / rect.height; 
    return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY,
    ];
}


function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = drawColor; 
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round"; 
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

// timer to fade canvas
function resetClearTimer() {
    clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
        fadeCanvas();
    }, 5000); // trigger fading after 5 sec of inactivity
}

// function to fade
function fadeCanvas() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // reduce alpha(opacity) of each pixle 
    for (let i = 3; i < data.length; i += 4) {
        data[i] = Math.max(data[i] - 10, 0); // Decrease opacity
    }

    ctx.putImageData(imageData, 0, 0);

    // function to repeat fading till cnavas is clear
    if (ctx.getImageData(0, 0, 1, 1).data[3] > 0) {
        requestAnimationFrame(fadeCanvas);
    }
}