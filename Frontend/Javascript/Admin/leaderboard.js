function getSessionIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("sejaId");
}

const sessionId = getSessionIdFromUrl();
if (sessionId) {
  fetchLeaderboard(sessionId);
} else {
  console.error("Session ID not found in URL");
}

async function fetchLeaderboard(sessionId) {
  const token = window.sessionStorage.getItem("jwt");
  try {
    const response = await fetch(
      `http://localhost:3307/api/responses/leaderboard/${sessionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const leaderboardData = await response.json();
    updateLeaderboard(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
  }
}

function updateLeaderboard(data) {
  const leaderboardBody = document.getElementById("leaderboard-body");
  leaderboardBody.innerHTML = ""; // Clear existing rows

  const topTenData = data.slice(0, 10); // Get the top 10 entries

  topTenData.forEach((user, index) => {
    const row = document.createElement("tr");
    let rowClass = "";

    // Apply different classes for the top 3 ranks
    if (index === 0) {
      rowClass = "gold";
    } else if (index === 1) {
      rowClass = "silver";
    } else if (index === 2) {
      rowClass = "bronze";
    }

    row.innerHTML = `
            <td class="rank ${rowClass}">${index + 1}</td>
            <td class="${rowClass}">${user.nickname}</td>
            <td class="${rowClass}">${user.skupneTocke}</td>
        `;
    leaderboardBody.appendChild(row);
  });
}
