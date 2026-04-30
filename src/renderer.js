window.addEventListener('DOMContentLoaded', async () => {
  const tagId = await window.rfidAPI.readTag();
  console.log("Scanned on startup:", tagId);
});
