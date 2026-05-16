function initSea() {
  const container = document.getElementById("flag-container");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 20; i++) {
    const col = document.createElement("div");
    col.className = "column";
    col.id = `col-${i}`;
    container.appendChild(col);
  }
  updateSeaStorm();
}

function updateSeaStorm() {
  const slider = document.getElementById("sea-turbulence");
  const delayEl = document.getElementById("delay-val");
  if (!slider) return;
  const val = slider.value;
  if (delayEl) delayEl.textContent = `${val}ms`;
  for (let i = 0; i < 20; i++) {
    const col = document.getElementById(`col-${i}`);
    if (col) col.style.animationDelay = `${i * val}ms`;
  }
}
