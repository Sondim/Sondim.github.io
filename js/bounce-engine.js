function updateBouncePhysics() {
  const slider = document.getElementById("bounce-slider");
  const ball = document.getElementById("interactive-ball");
  if (!slider || !ball) return;
  const v = parseFloat(slider.value);
  ball.style.setProperty("--squash-ratio", v);
  ball.style.setProperty("--stretch-ratio", 1 + (v - 1) * 0.5);
}

function confirmBounce() {
  const v = document.getElementById("bounce-slider")?.value || "1.5";
  const msg =
    v >= 1.7
      ? "High squash: you're flexible under pressure — guard your core vision so scope doesn't flatten you."
      : v <= 1.2
        ? "Low squash: structure is rigid — where could you flex without losing what makes your game yours?"
        : "Balanced squash: resilience looks healthy. Journal one scope trade-off you accepted this week.";
  showToast(msg);
}
