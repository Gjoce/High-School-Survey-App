$(document).ready(function () {
  $("#continue-quiz").hide(); // Initially hide the continue button

  // Check if a user ID is stored in sessionStorage
  const userId = sessionStorage.getItem("sifraKviza");
  if (userId) {
    fetchUserPoints(userId);
  } else {
    console.error("User ID not found in sessionStorage.");
  }

  // Polling function to check if the admin allowed to continue
  function checkIfAllowedToContinue() {
    const questionId = sessionStorage.getItem("currentQuestionId");

    if (questionId) {
      $.ajax({
        url: `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/quiz/allowed/${questionId}`, // Update this endpoint as needed
        method: "GET",
        success: function (data) {
          if (data.allowed) {
            $("#continue-quiz").show(); // Show the continue button if allowed
          } else {
            setTimeout(checkIfAllowedToContinue, 3000); // Poll every 3 seconds
          }
        },
        error: function (error) {
          console.error("Error checking permission to continue:", error);
        },
      });
    }
  }

  checkIfAllowedToContinue(); // Start polling

  // Continue quiz button click event
  $("#continue-quiz").click(function () {
    // Optionally clear the flag after clicking
    sessionStorage.removeItem("lastQuestionAnswered");
    showCongratulations();
  });
});

// Function to fetch user points
function fetchUserPoints(userId) {
  fetch(
    `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/responses/points/${userId}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById(
        "points"
      ).textContent = `Uspelo ti je zbrati: ${data.points} točke`;
    })
    .catch((error) => console.error("Error fetching points:", error));
}

// Show congratulations message and redirect
function showCongratulations() {
  $("#continue-quiz").hide();
  $("#cestitam").hide();
  $("#congratulations-message").show();
  setTimeout(function () {
    window.location.href = "sklop.html"; // Redirect after 5 seconds
  }, 5000);
}
