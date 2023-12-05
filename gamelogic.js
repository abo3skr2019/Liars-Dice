
function rollDice() {
  let diceResults = [];
  const diceContainer = document.getElementById("dice-container");

  for (let i = 0; i < 5; i++) {
    let diceValue = Math.floor(Math.random() * 6) + 1;
    diceResults.push(diceValue);
  }

  diceContainer.innerHTML = diceResults.join(", ");
}
