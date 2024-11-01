document.addEventListener("DOMContentLoaded", function () {
  const token = sessionStorage.getItem("jwt");

  if (!token) {
    console.error("Token ni bil najden v sessionStorage.");
    return;
  }

  fetch(
    `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/sessions/admin`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch sessions: " + response.statusText);
      }
      return response.json();
    })
    .then((seje) => {
      const tbody = document.getElementById("tbody");
      tbody.innerHTML = "";

      seje.forEach((seja) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><a href="Seja.html?id=${seja.id}" onclick="storeSessionId(${
          seja.id
        })">${seja.naziv}</a></td>
          <td>${new Date(seja.datum_kreacije).toLocaleDateString()}</td>
          <td><button class="delete-btn" onclick="deleteSeja(${
            seja.id
          }, this)">Delete</button></td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch((error) => console.error("Napaka pri prevzemu sej:", error));
});

function storeSessionId(id) {
  sessionStorage.setItem("sessionId", id);
  sessionStorage.setItem("sessionDate", new Date().toISOString());
}

function deleteSeja(id, button) {
  if (!confirm("Ali ste prepričani, da želite izbrisati sejo?")) {
    return;
  }
  const token = sessionStorage.getItem("jwt");

  fetch(
    `https://spolna-enakost-a5b1f42434e5.herokuapp.com/api/sessions/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        const row = button.closest("tr");
        row.parentNode.removeChild(row);
      } else {
        console.error("Napaka pri brisanju seje:", data);
      }
    })
    .catch((error) => console.error("Napaka pri brisanju seje:", error));
}
