document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submit-button");

  if (submitButton && !submitButton.hasListener) {
    submitButton.hasListener = true; // Set a custom flag
    submitButton.addEventListener("click", async function () {
      const naziv = document.getElementById("naziv").value;
      const jsonFileInput = document.getElementById("json-file");
      const file = jsonFileInput.files[0];

      if (!file) {
        displayMessage("Prosim naloži JSON file.", "danger");
        return;
      }

      let reader = new FileReader();
      reader.onload = async function (event) {
        let jsonData;
        try {
          jsonData = JSON.parse(event.target.result);
        } catch (e) {
          displayMessage("Nepravilen JSON file format", "danger");
          return;
        }

        const token = window.sessionStorage.getItem("jwt");

        const data = {
          naziv: naziv,
          vnos: jsonData,
        };

        try {
          const response = await fetch("http://localhost:3307/api/sessions/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            const result = await response.json();

            // Display success message
            displayMessage(result.message, "success");

            // Check if a new token was provided in the response
            if (result.token) {
              // Store the new token in session storage
              window.sessionStorage.setItem("jwt", result.token);
            }
          } else {
            const error = await response.json();
            displayMessage("Napaka: " + error.message, "danger");
          }
        } catch (error) {
          console.error("Napaka:", error);
          displayMessage("Napaka je bila pri kreaciji seje.", "danger");
        }
      };

      reader.readAsText(file);
    });
  }
});

function displayMessage(message, type) {
  const messageContainer = document.getElementById("message-container");
  messageContainer.textContent = message;
  messageContainer.className = `alert alert-${type} mt-3`;
  messageContainer.style.display = "block";
}
