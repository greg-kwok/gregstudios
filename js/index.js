// Check if the device is mobile (screen width <= 768px)
function isMobile() {
    return window.innerWidth <= 768;
}

// Hide filter buttons on mobile
function hideFiltersOnMobile() {
    const filterControls = document.getElementById('filter-controls');
    const mobileMessage = document.getElementById('mobile-message');
    if (isMobile()) {
        filterControls.style.display = 'none'; // Hide filter controls on mobile
        mobileMessage.style.display = 'block'; // Show mobile message
    } else {
        filterControls.style.display = 'flex'; // Show filter controls on desktop
        mobileMessage.style.display = 'none'; // Hide mobile message
    }
}

// Call the function when the page loads and whenever the window is resized
window.addEventListener('load', hideFiltersOnMobile);
window.addEventListener('resize', hideFiltersOnMobile);
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const photoStrip = document.getElementById('photo-strip');
const countdownEl = document.getElementById('countdown');
let photos = [];
let currentFilter = 'none';  // Default filter

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Camera access denied", err));

// Apply selected filter to the video stream
function applyFilter(filter) {
    currentFilter = filter;
    video.style.filter = currentFilter;
}

function countdown(seconds, callback) {
    countdownEl.innerText = seconds;
    if (seconds > 0) {
        setTimeout(() => countdown(seconds - 1, callback), 1000);
    } else {
        countdownEl.innerText = '';
        callback();
    }
}

function capturePhoto() {
    if (photos.length >= 4) return;
    
    // Apply the selected filter to the canvas context before drawing the photo
    ctx.filter = currentFilter;
    ctx.save();
    ctx.translate(canvas.width, 0); // Flip image horizontally
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Capture the image from the canvas with the applied filter
    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.classList.add('photo');
    photoStrip.appendChild(img);
    photos.push(img);
    
    // Reset the filter for future captures
    ctx.filter = 'none';

    if (photos.length === 4) {
        const watermark = new Image();
        watermark.src = "greg_studios©.png";
        photos.push(watermark);
        setTimeout(() => goToFrameEditor(), 1000);
    }
}

function startCapture() {
    document.getElementById('capture').style.display = 'none';
    photos = [];
    photoStrip.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        setTimeout(() => countdown(3, capturePhoto), i * 5000);
    }
}

function goToFrameEditor() {
    localStorage.setItem('photos', JSON.stringify(photos.map(img => img.src)));
    window.location.href = 'frame-editor.html';
}