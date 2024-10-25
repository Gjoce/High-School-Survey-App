function fetchUserPoints(userId) {
  fetch(`http://localhost:3307/api/responses/points/${userId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // Update the points displayed in the UI
      document.getElementById("points").textContent = data.points;
    })
    .catch((error) => console.error("Error fetching points:", error));
}

// Retrieve user ID from sessionStorage
const userId = sessionStorage.getItem("sifraKviza");
if (userId) {
  // Fetch points for the retrieved user ID
  fetchUserPoints(userId);
} else {
  console.error("User ID not found in sessionStorage.");
}
