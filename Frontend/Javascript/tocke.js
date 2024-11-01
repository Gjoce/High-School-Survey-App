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
      document.getElementById("points-top").textContent = data.points;
    })
    .catch((error) => console.error("Error fetching points:", error));
}

const userId = sessionStorage.getItem("sifraKviza");
if (userId) {
  fetchUserPoints(userId);
} else {
  console.error("User ID not found in sessionStorage.");
}
