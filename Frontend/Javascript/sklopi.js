$(document).ready(function () {
  const sessionId = sessionStorage.getItem("sessionID");

  console.log("Session ID:", sessionId);

  if (sessionId) {
    fetch(
      `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/sessions/user/session/${sessionId}`
    )
      .then((response) => {
        console.log("Status odziva:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Prevzeti podatki:", data);
        if (data && data.sklopi) {
          const cardsContainer = $("#cards-container");
          const colors = [
            "rgb(172, 185, 255)",
            "rgb(208, 173, 255)",
            "rgb(178, 163, 255)",
          ];
          const darkerColors = [
            "rgb(92, 105, 175)",
            "rgb(128, 93, 175)",
            "rgb(98, 83, 175)",
          ];

          const userProgress =
            JSON.parse(sessionStorage.getItem("userProgress")) || {};

          data.sklopi.forEach((sklop, index) => {
            const color = colors[index % colors.length];
            const darkerColor = darkerColors[index % darkerColors.length];
            const isCompleted = userProgress[sklop.id];
            const cardColor = isCompleted ? darkerColor : color;

            const card = $(`
                            <div class="card" style="background-color: ${cardColor};">
                                <h2>${sklop.naziv}</h2>
                            </div>
                        `);

            if (!isCompleted) {
              card.click(function () {
                updateUserProgress(sklop.id);
                sessionStorage.setItem("sklopID", sklop.id);
                sessionStorage.setItem("currentQuestionIndex", 0);
                window.location.href = "Vprasanja.html";
              });
            } else {
              card.addClass("completed");
            }

            cardsContainer.append(card);
          });
        } else {
          console.error("Nepravilna struktura podatkov:", data);
        }
      })
      .catch((error) => {
        console.error("Napaka pri prevzemu sejne podatke:", error);
      });
  } else {
    console.error("Session ID ni bil najden v SessionStorage");
  }
});

function updateUserProgress(topicId) {
  const userProgress = JSON.parse(sessionStorage.getItem("userProgress")) || {};
  userProgress[topicId] = true;
  sessionStorage.setItem("userProgress", JSON.stringify(userProgress));
}
