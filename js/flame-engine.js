(function () {
  const canvas = document.getElementById("fire-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("fire-slider");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  ctx.translate(0, 24);
  ctx.scale(1, -1);

  let prev = Date.now();
  const yCoords = [2, 1, 0, 0, 0, 0, 1, 2];
  const baseMax = [7, 9, 11, 13, 13, 11, 9, 7];
  const baseMin = [4, 7, 8, 10, 10, 8, 7, 4];

  function drawFlame() {
    const intensity = parseFloat(slider.value);
    const fps = reducedMotion ? 2 : 7;
    const interval = 1000 / fps;
    const now = Date.now();

    if (now - prev > interval) {
      prev = now;
      ctx.clearRect(0, 0, 16, 24);

      ctx.fillStyle = "#5d4037";
      ctx.fillRect(7, 0, 2, 4);

      const label = document.getElementById("fire-label");
      if (label) {
        if (intensity <= 0.2) label.textContent = "DEPLETED";
        else if (intensity > 1.8) label.textContent = "CRITICAL";
        else label.textContent = "Stable";
      }

      const anchorY = 4;
      const colStart = intensity <= 0.2 ? 3 : 0;
      const colEnd = intensity <= 0.2 ? 5 : 8;

      ctx.strokeStyle = "#d14234";
      for (let x = colStart; x < colEnd; x++) {
        const drawX = x + 4;
        const curMax = intensity <= 0.2 ? anchorY + 2 : baseMax[x] * intensity + anchorY;
        const curMin = intensity <= 0.2 ? anchorY + 1 : baseMin[x] * intensity + anchorY;
        const a = Math.random() * (curMax - curMin + 1) + curMin;
        ctx.beginPath();
        ctx.moveTo(drawX + 0.5, yCoords[x] + anchorY);
        ctx.lineTo(drawX + 0.5, a);
        ctx.stroke();
      }

      if (intensity > 0.2) {
        ctx.strokeStyle = "#f2a55f";
        for (let j = 1; j < 7; j++) {
          const drawX = j + 4;
          const a =
            Math.random() * ((baseMax[j] - 5) * intensity - (baseMin[j] - 5) * intensity + 1) +
            (baseMin[j] - 5) * intensity +
            anchorY;
          ctx.beginPath();
          ctx.moveTo(drawX + 0.5, yCoords[j] + 1 + anchorY);
          ctx.lineTo(drawX + 0.5, Math.max(yCoords[j] + 1.5 + anchorY, a));
          ctx.stroke();
        }
      }

      if (intensity > 0.5) {
        ctx.strokeStyle = "#e8dec5";
        for (let k = 3; k < 5; k++) {
          const drawX = k + 4;
          const a =
            Math.random() * ((baseMax[k] - 9) * intensity - (baseMin[k] - 9) * intensity + 1) +
            (baseMin[k] - 9) * intensity +
            anchorY;
          ctx.beginPath();
          ctx.moveTo(drawX + 0.5, yCoords[k] + anchorY);
          ctx.lineTo(drawX + 0.5, Math.max(yCoords[k] + 0.5 + anchorY, a));
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawFlame);
  }
  drawFlame();
})();
