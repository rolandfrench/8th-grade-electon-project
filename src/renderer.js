let games = {
    "136831181658": "minish",
    "13683132165250": "country",
    "13683223165161": "ruby",
}

// This runs in your UI/Webpage
window.rfidAPI.onTagScanned((tagId) => {
    console.log("tagId:: ", tagId);
    let game = games[tagId];
    if (games && game) {
        console.log("game:: ", game);
        window.electronAPI.launchGame(game);

        // Update your HTML
        const display = document.getElementById('status');
        display.innerText = `Last Scanned: ${game}`;
        display.style.color = 'green';
    }
});
