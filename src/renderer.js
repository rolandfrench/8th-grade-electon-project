window.addEventListener('DOMContentLoaded', async () => {
  console.log("App ready, waiting for RFID...");
  const tagId = await window.rfidAPI.readTag();
  console.log("Scanned on startup:", tagId);
});
