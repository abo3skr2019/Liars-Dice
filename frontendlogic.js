const peerIdElement = document.querySelector("#peer-id");
document.addEventListener("DOMContentLoaded", (event) => {
  const startGameButton = document.querySelector("#start-game");
  const lobbyDiv = document.querySelector("#lobbydiv");
  const gameDiv = document.querySelector("#gamediv");

  const gameIdInput = document.getElementById("gameid");
  const joinGameButton = document.getElementById("join-game");

  gameIdInput.addEventListener("input", function () {
    if (gameIdInput.value.trim() !== "") {
      joinGameButton.disabled = false;
    } else {
      joinGameButton.disabled = true;
    }
  });

  // Hide the gameDiv by default
  gameDiv.style.display = "none";

  startGameButton.addEventListener("click", () => {
    // Hide the lobby and show the game when the button is clicked
    lobbyDiv.style.display = "none";
    gameDiv.style.display = "block";
    startRound();
  });

  peerIdElement.addEventListener("click", () => {
    const peerId = peerIdElement.textContent.split(":")[1].trim();
    navigator.clipboard
      .writeText(peerId)
      .then(() => {
        console.log(`Peer ID copied to clipboard: ${peerId}`);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  });
});

const nicknameForm = document.querySelector("#nickname-form");
const gameIdForm = document.querySelector("#gameid-form");
const messageForm = document.querySelector("#message-form");
const chatBox = document.querySelector("#chat-box");
let peer, conn, nickname;

nicknameForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const nicknameInput = document.getElementById("nickname");
  nickname = nicknameInput.value;
  if (nickname.trim() !== "" && /^[a-zA-Z0-9]+$/.test(nickname)) {
    peer = new Peer();

    peer.on("open", (id) => {
      console.log("Connected with ID:", id);
      peerIdElement.textContent = `Game ID: ${id}`; // Update the peer id div
    });

    peer.on("error", (error) => {
      console.error("PeerJS error:", error);
    });
    peer.on("connection", (connection) => {
      conn = connection;

      document.getElementById("message").disabled = false;
      document.querySelector("#message-form button").disabled = false;
      document.getElementById("chat-box").style.display = "block";
      document.getElementById("start-game").disabled = false;

      conn.on("data", (data) => {
        const messageElement = document.createElement("p");
        messageElement.textContent = data;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    });
    const gameIdInput = document.getElementById("gameid");
    gameIdInput.disabled = false;
  } else {
    alert(
      "Invalid nickname. Please enter a nickname that contains only letters and numbers."
    );
  }
});

gameIdForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const gameIdInput = document.getElementById("gameid");
  const gameId = gameIdInput.value;

  if (gameId.trim() !== "") {
    conn = peer.connect(gameId);

    conn.on("open", () => {
      conn.send(`${nickname} has joined the game`);
      document.getElementById("message").disabled = false;
      document.querySelector("#message-form button").disabled = false;
      document.getElementById("chat-box").style.display = "block";
    });

    conn.on("data", (data) => {
      const messageElement = document.createElement("p");
      messageElement.textContent = data;
      chatBox.appendChild(messageElement);
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } else {
    alert(
      "Invalid GameID. Please enter a GameID that contains only letters and numbers."
    );
    console.error("Game ID is required to connect.");
  }
});

// JavaScript
messageForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const messageInput = document.getElementById("message");
  const message = messageInput.value;

  if (conn) {
    // Check if conn is defined
    if (message.trim() !== "") {
      conn.send(`${nickname}: ${message}`);
    }

    const messageElement = document.createElement("p");
    if (message.trim() !== "") {
      messageElement.textContent = `You: ${message}`;
    }
    messageElement.classList.add("sent-message"); // Add class
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  } else {
    console.error("Connection not established. Please enter a game ID first.");
  }
  messageInput.value = "";
});