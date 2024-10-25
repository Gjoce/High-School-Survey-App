document.getElementById('quizForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const quizCode = document.getElementById('quizCode').value;
    const quizNickname = document.getElementById('quizNickname').value;
    let genderValue = document.getElementById('genderSelect').value;

    
    if (genderValue === 'moški') {
        genderValue = 0;
    } else if (genderValue === 'ženski') {
        genderValue = 1;
    } else {
        genderValue = 2;
    }

    if (quizCode && quizNickname && genderValue !== '') {
        sessionStorage.setItem('sifraKviza', quizCode);
        sessionStorage.setItem('vzdevek', quizNickname);
        sessionStorage.setItem('spol', genderValue);

        window.location.href = 'sklop.html'; 
    } else {
        alert('Please fill in all fields.');
    }
});

const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('id');
sessionStorage.setItem("sessionID", sessionId);
