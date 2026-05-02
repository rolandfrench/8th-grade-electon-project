window.addEventListener('DOMContentLoaded', async () => {
  const tagId = await window.rfidAPI.readTag();
  console.log("Scanned on startup:", tagId);
});


// This runs in your UI/Webpage
window.rfidAPI.onTagScanned((tagId) => {
    console.log("Tag detected in UI:", tagId);
    
    // Update your HTML
    const display = document.getElementById('status');
    display.innerText = `Last Scanned: ${tagId}`;
    display.style.color = 'green';

    // Optional: Trigger an action based on the ID
    if (tagId === "123456789") {
        alert("Access Granted: Roland");
    }
});
