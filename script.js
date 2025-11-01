document.addEventListener("DOMContentLoaded", () => {
  const clockElement = document.getElementById("clock");

  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // 時計を1秒ごとに更新
  setInterval(updateClock, 1000);
  updateClock();
});
