let gameState = {};

function startRound() {
  const remainingPlayers = Object.keys(gameState);
  if (remainingPlayers.length === 1) {
    console.log(`Game over, ${remainingPlayers[0]} is the winner!`);
    return;
  }
  // Roll the dice for each player
  for (let peerId in gameState) {
    rollDice(peerId);
  }

  // Reset the current bid and bidder
  gameState.currentBid = null;
  gameState.currentBidder = null;

  // Send the updated game state to the other player
  sendGameState();
}

function addPlayer(peerId) {
  gameState[peerId] = { dice: [1, 2, 3, 4, 5], bid: null };
}

function removePlayer(peerId) {
  delete gameState[peerId];
}

// When a peer connects...
peer.on("connection", (connection) => {
  conn = connection;
  addPlayer(conn.peer); // Add the new player

  // Other code...

  // When the connection closes...
  conn.on("close", () => {
    removePlayer(conn.peer); // Remove the player
  });
});
// Function to roll the dice
function rollDice(peerId) {
  gameState[peerId].dice = gameState[peerId].dice.map(
    () => Math.floor(Math.random() * 6) + 1
  );
}

// Function to make a bid
function makeBid(peerId, bid) {
  if (gameState.currentBid && bid <= gameState.currentBid) {
    console.error("Each bid must be higher than the previous bid.");
    return;
  }

  gameState[peerId].bid = bid;
  gameState.currentBid = bid;
  gameState.currentBidder = peerId;

  // Send the updated game state to the other player
  sendGameState();
}

// Function to challenge a bid
// Function to challenge a bid
function challengeBid(challengerPeerId, bidFace) {
  // Get all the dice from all players
  const allDice = Object.values(gameState).flatMap((player) => player.dice);

  // Count the number of dice showing the bid face
  const faceCount = allDice.filter((face) => face === bidFace).length;

  if (gameState[gameState.currentBidder].bid > faceCount) {
    // The bid was too high, the current bidder loses a die
    gameState[gameState.currentBidder].dice.pop();
  } else {
    // The bid was not too high, the challenging player loses a die
    gameState[challengerPeerId].dice.pop();
  }
  // Check if the current bidder has lost all their dice
  if (gameState[gameState.currentBidder].dice.length === 0) {
    console.log(`${gameState.currentBidder} is out of the game!`);
    removePlayer(gameState.currentBidder);
  }

  // Check if the challenging player has lost all their dice
  if (gameState[challengerPeerId].dice.length === 0) {
    console.log(`${challengerPeerId} is out of the game!`);
    removePlayer(challengerPeerId);
  }

  // Start a new round
  startRound();
}

// Function to send the game state to the other player
function sendGameState() {
  const message = JSON.stringify(gameState);
  conn.send(message);
}
