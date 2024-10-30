document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.style.display = "none";

    try {
      const response = await fetch(
        "https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, geslo: password }),
        }
      );

      if (response.ok) {
        window.location.href = "./Prijava.html";
      } else {
        const data = await response.json();
        if (response.status === 500 && data.message.includes("duplicate")) {
          errorMessage.textContent =
            "Email že obstaja. Prosimo, uporabite drugi email";
        } else {
          errorMessage.textContent =
            "Napaka pri registraciji. Prosimo, poskusite ponovno";
        }
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent =
        "Napaka pri registraciji. Prosimo, poskusite ponovno";
      errorMessage.style.display = "block";
    }
  });
