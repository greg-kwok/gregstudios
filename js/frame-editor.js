function isMobile() {
    return window.innerWidth <= 768;
}

// Hide filter buttons on mobile
function hideQrOnMobile() {
    const QrButton = document.getElementById('QrButton');
    if (isMobile()) {
        QrButton.style.display = 'none'; // Hide filter controls on mobile
    } else {
        QrButton.style.display = 'inline-block'; // Show filter controls on desktop
    }
}

// Call the function when the page loads and whenever the window is resized
window.addEventListener('load', hideQrOnMobile);
window.addEventListener('resize', hideQrOnMobile);
// ✅ Replace with your Imgur API credentials
const CLIENT_ID = "08dd2fcb210fda7";
const CLIENT_SECRET = "0ea2ddd960baf135126db717d827c16563e52145";
let ACCESS_TOKEN = "8ea32e7c43b28ebc5e15fafcfd0ffa485cd12c35";
let REFRESH_TOKEN = "49e90faef42e1c9131dfc970eff11eb8d609b6c3";

let frameColor = '#FFFFFF';
const framePreview = document.getElementById('frame-preview');
const photos = JSON.parse(localStorage.getItem('photos')) || [];

function loadPhotos() {
    framePreview.innerHTML = '';
    photos.forEach(src => {
        const img = new Image();
        img.src = src;
        img.classList.add('photo');
        img.style.borderColor = frameColor;
        img.style.backgroundColor = frameColor;
        framePreview.appendChild(img);
    });
}

function changeFrameColor(color) {
    frameColor = color;
    document.querySelectorAll('.photo').forEach(img => {
        img.style.borderColor = color;
        img.style.backgroundColor = color;
    });
}

function downloadStrip() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 350; // Include border width
    const height = 1180; // Total height 
    canvas.width = width;
    canvas.height = height;

    let loadedImages = 0;

    photos.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = function() {
            const imageAspectRatio = img.width / img.height;
            const imageHeight = 320 / imageAspectRatio; // Scale the height proportionally based on width (320px)

            ctx.fillStyle = frameColor;
            ctx.fillRect(0, index * 270, width, 270);
            ctx.drawImage(img, 15, index * 270 + 15, 320, imageHeight);

            loadedImages++;
            if (loadedImages === photos.length) {
                const link = document.createElement('a');
                link.download = 'photo-strip.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        };
    });
}

async function refreshAccessToken() {
    try {
        const response = await fetch('https://api.imgur.com/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                refresh_token: REFRESH_TOKEN,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token'
            })
        });

        const data = await response.json();
        if (data.access_token) {
            ACCESS_TOKEN = data.access_token;
            console.log("New Access Token:", ACCESS_TOKEN);
        } else {
            console.error("Failed to refresh token:", data);
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
    }
}

async function uploadImageToImgur(imageDataURL) {
    await refreshAccessToken(); // Ensure token is fresh

    const formData = new FormData();
    formData.append('image', imageDataURL.split(',')[1]);

    return fetch('https://api.imgur.com/3/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            return data.data.link;
        } else {
            throw new Error("Upload failed");
        }
    })
    .catch(error => {
        console.error("Upload Error:", error);
    });
}

function generateQRCode() {
    document.getElementById('qr-code-container').innerHTML = 'Generating...⌛';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 350;
    const height = 1180;
    canvas.width = width;
    canvas.height = height;

    let loadedImages = 0;
    photos.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = async function() {
            const imageAspectRatio = img.width / img.height;
            const imageHeight = 320 / imageAspectRatio; // Scale the height proportionally based on width (320px)

            ctx.fillStyle = frameColor;
            ctx.fillRect(0, index * 270, width, 270);
            ctx.drawImage(img, 15, index * 270 + 15, 320, imageHeight);

            loadedImages++;
            if (loadedImages === photos.length) {
                const imageDataURL = canvas.toDataURL('image/png');

                try {
                    const imageUrl = await uploadImageToImgur(imageDataURL);
                    document.getElementById('qr-code-container').innerHTML = '';
                    new QRCode(document.getElementById('qr-code-container'), {
                        text: imageUrl,
                        width: 200,
                        height: 200,
                    });
                } catch (error) {
                    console.error("QR Code Generation Failed:", error);
                }
            }
        };
    });
}

function retakePhotos() {
    localStorage.removeItem('photos');
    window.location.href = 'index.html';
}

loadPhotos();