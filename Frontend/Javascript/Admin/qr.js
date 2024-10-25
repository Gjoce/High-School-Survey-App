function getSessionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}


function generateQRCode(sessionId) {
    const qrCodeContainer = document.getElementById('qrcode-container');
    const qrCode = new QRCode(qrCodeContainer, {
        text: `http://localhost:3307/index.html?id=${sessionId}`,
        width: 500,
        height: 500,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}


const sessionId = getSessionIdFromUrl();
if (sessionId) {
    generateQRCode(sessionId);
} else {
    console.error('Session ID ni bil najden v URL');
}