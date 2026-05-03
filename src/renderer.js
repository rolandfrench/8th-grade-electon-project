window.addEventListener('DOMContentLoaded', async () => {
  const tagId = await window.rfidAPI.readTag();
  console.log("Scanned on startup:", tagId);
});

let games = {
    "123545": "minish",
    "123545": "country",
    "123545": "ruby",
}

// This runs in your UI/Webpage
window.rfidAPI.onTagScanned((tagId) => {
    console.log("tagId:: ", tagId);
    let game = games[tagId];
    if (games && game) {
        console.log("game:: ", game);
        window.launchGame.launchGame(game);
        // Update your HTML
        const display = document.getElementById('status');
        display.innerText = `Last Scanned: ${tagId}`;
        display.style.color = 'green';
    }
});
