function updateVisionBoard() {
  const star = document.getElementById("vision-star")?.value?.trim() || "(your star goal)";
  const a = document.getElementById("vision-a")?.value?.trim() || "—";
  const b = document.getElementById("vision-b")?.value?.trim() || "—";
  const c = document.getElementById("vision-c")?.value?.trim() || "—";
  const out = document.getElementById("vision-output");
  if (!out) return;
  const text = [
    "=== Vision Staging Board ===",
    `STAR (staging focus): ${star}`,
    "",
    "Supporting lights:",
    `1. ${a}`,
    `2. ${b}`,
    `3. ${c}`,
    "",
    "Reflection: What can dim this week so the star stays lit?",
  ].join("\n");
  out.textContent = text;
}

function copyVisionBoard() {
  const out = document.getElementById("vision-output");
  if (out) navigator.clipboard.writeText(out.textContent).then(() => showToast("Vision board copied."));
}

function updateRhythmMap() {
  const names = ["rhythm-1", "rhythm-2", "rhythm-3", "rhythm-4"];
  const beats = ["beat-1", "beat-2", "beat-3", "beat-4"];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const name = document.getElementById(names[i])?.value?.trim();
    const beat = document.getElementById(beats[i])?.value?.trim();
    if (name || beat) {
      rows.push({ name: name || `Role ${i + 1}`, beat: beat || "—" });
    }
  }
  const out = document.getElementById("rhythm-output");
  if (!out) return;
  const overlap = rows.filter((r, i, arr) => arr.filter((x) => x.beat === r.beat && r.beat !== "—").length > 1);
  let text = "=== Team Rhythm Map ===\n\n";
  rows.forEach((r) => {
    text += `${r.name} → ${r.beat}\n`;
  });
  if (overlap.length) {
    text += "\n⚠ Overlap on: " + [...new Set(overlap.map((o) => o.beat))].join(", ");
    text += "\nClarify who owns the downbeat.";
  } else if (rows.length) {
    text += "\nNo beat collisions detected — still worth a 15-min sync.";
  } else {
    text += "Add at least one role and beat.";
  }
  out.textContent = text;
}

function copyRhythmMap() {
  const out = document.getElementById("rhythm-output");
  if (out) navigator.clipboard.writeText(out.textContent).then(() => showToast("Rhythm map copied."));
}

function initStagingSpotlight() {
  const stage = document.getElementById("staging-stage");
  const spotlight = document.getElementById("staging-spotlight");
  const dim = document.getElementById("staging-dim");
  if (!stage || !spotlight) return;
  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlight.style.left = `${x}px`;
    spotlight.style.top = `${y}px`;
    if (dim) dim.style.opacity = "0.35";
  });
  stage.addEventListener("mouseleave", () => {
    if (dim) dim.style.opacity = "0.85";
  });
}

function initPoseToggle() {
  const toggle = document.getElementById("pose-toggle");
  const label = document.getElementById("pose-label");
  const bar = document.getElementById("pose-bar");
  if (!toggle || !label || !bar) return;
  toggle.addEventListener("change", () => {
    const straight = toggle.checked;
    label.textContent = straight ? "Straight ahead — flowing, iterative" : "Pose to pose — keyed milestones";
    bar.style.transition = straight ? "width 2s linear" : "width 0.6s steps(4)";
    bar.style.width = "0%";
    void bar.offsetWidth;
    bar.style.width = "100%";
  });
}

function initSlowEase() {
  const slider = document.getElementById("ease-slider");
  const dot = document.getElementById("ease-dot");
  if (!slider || !dot) return;
  slider.addEventListener("input", () => {
    const t = parseFloat(slider.value);
    dot.style.transition = `left ${t}s cubic-bezier(0.42, 0, 0.58, 1)`;
    dot.style.left = "0%";
    void dot.offsetWidth;
    dot.style.left = "calc(100% - 16px)";
  });
}

function initExaggeration() {
  const slider = document.getElementById("exaggeration-slider");
  const text = document.getElementById("exaggeration-text");
  if (!slider || !text) return;
  slider.addEventListener("input", () => {
    const v = parseFloat(slider.value);
    text.style.transform = `scale(${0.9 + v * 0.3}) rotate(${v * 3 - 1.5}deg)`;
    text.style.letterSpacing = `${v * 0.08}em`;
  });
}

function initAppealPick() {
  document.querySelectorAll("[data-appeal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-appeal]").forEach((b) => b.classList.remove("ring-2", "ring-cyan-400"));
      btn.classList.add("ring-2", "ring-cyan-400");
      const msg = btn.dataset.appeal;
      const out = document.getElementById("appeal-result");
      if (out) out.textContent = `You chose: ${msg} — that's your appeal axis. Design toward what feels true, not what trends.`;
    });
  });
}

function initSolidPillars() {
  const checkboxes = document.querySelectorAll("[data-pillar]");
  const out = document.getElementById("pillar-status");
  const labels = { mechanics: "Mechanics", fantasy: "Fantasy", audience: "Audience" };
  const update = () => {
    const on = [...checkboxes].filter((c) => c.checked).map((c) => labels[c.dataset.pillar]);
    if (out) {
      out.textContent = on.length
        ? `Pillars active: ${on.join(" + ")} — solid drawing means all three inform every major decision.`
        : "Toggle the pillars that ground your game.";
    }
  };
  checkboxes.forEach((c) => c.addEventListener("change", update));
  update();
}
