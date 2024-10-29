document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.style.display = "none";

    try {
      const response = await fetch("http://localhost:3307/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, geslo: password }),
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("jwt", data.token);
        window.location.href = "./Pregled_Seje.html";
      } else {
        errorMessage.textContent =
          "Neveljaven email ali geslo. Prosimo, poskusite ponovno.";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Error:", error);
      errorMessage.textContent =
        "Napaka pri prijavi. Prosim, poskusite ponovno.";
      errorMessage.style.display = "block";
    }
  });
