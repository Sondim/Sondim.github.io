const ASSESSMENT_STEPS = [
  {
    id: "role",
    question: "Where are you in the dev journey right now?",
    type: "choice",
    options: [
      { value: "solo", label: "Solo dev — I'm wearing most hats" },
      { value: "lead", label: "Lead / founder — I'm steering the ship" },
      { value: "team", label: "Team member — I'm contributing inside a crew" },
    ],
  },
  {
    id: "energy",
    question: "Internal energy (your torch)",
    hint: "Low = freeze / depletion. High = overdrive / burnout risk.",
    type: "range",
    min: 0.1,
    max: 2.5,
    step: 0.1,
    default: 1,
  },
  {
    id: "environment",
    question: "Environment turbulence (your inner sea)",
    hint: "How chaotic do tools, team, or life feel around the project?",
    type: "range",
    min: 0,
    max: 600,
    step: 10,
    default: 150,
  },
  {
    id: "resilience",
    question: "Resilience under pressure (squash & stretch)",
    type: "range",
    min: 1,
    max: 2,
    step: 0.01,
    default: 1.5,
  },
  {
    id: "clarity",
    question: "How clear is your #1 priority this month?",
    type: "choice",
    options: [
      { value: 1, label: "Foggy — too many fires" },
      { value: 2, label: "Partly clear" },
      { value: 3, label: "Crystal — I know the star" },
    ],
  },
  {
    id: "fulfillment",
    question: "Fulfillment vs grind this week",
    type: "choice",
    options: [
      { value: 1, label: "Mostly grind" },
      { value: 2, label: "Mixed" },
      { value: 3, label: "Mostly joy" },
    ],
  },
];

let assessmentAnswers = {};
let assessmentStep = 0;

function openAssessment() {
  assessmentAnswers = {};
  assessmentStep = 0;
  const modal = document.getElementById("assessment-modal");
  if (modal) {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    renderAssessmentStep();
  }
}

function closeAssessment() {
  const modal = document.getElementById("assessment-modal");
  if (modal) {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }
}

function renderAssessmentStep() {
  const body = document.getElementById("assessment-body");
  const progress = document.getElementById("assessment-progress");
  if (!body) return;

  if (assessmentStep >= ASSESSMENT_STEPS.length) {
    body.innerHTML = buildAssessmentResult();
    if (progress) progress.textContent = "Complete";
    return;
  }

  const step = ASSESSMENT_STEPS[assessmentStep];
  if (progress) progress.textContent = `Step ${assessmentStep + 1} / ${ASSESSMENT_STEPS.length}`;

  let inputHtml = "";
  if (step.type === "choice") {
    inputHtml = step.options
      .map(
        (o) =>
          `<label class="block mb-3 cursor-pointer">
            <input type="radio" name="assess" value="${o.value}" class="mr-2" />
            <span class="text-zinc-200">${o.label}</span>
          </label>`
      )
      .join("");
  } else {
    inputHtml = `<input type="range" class="w-full my-4" id="assess-range"
      min="${step.min}" max="${step.max}" step="${step.step}" value="${step.default}" />
      <p class="text-xs text-zinc-400 font-mono" id="assess-range-val">${step.default}</p>`;
  }

  body.innerHTML = `
    <h3 class="text-xl font-black text-white mb-2">${step.question}</h3>
    ${step.hint ? `<p class="text-sm text-zinc-400 mb-4">${step.hint}</p>` : ""}
    <div>${inputHtml}</div>
    <div class="flex gap-3 mt-8">
      ${assessmentStep > 0 ? '<button type="button" onclick="assessmentBack()" class="px-4 py-2 border border-white/20 rounded-lg text-sm">Back</button>' : ""}
      <button type="button" onclick="assessmentNext()" class="flex-1 px-4 py-3 bg-white text-black rounded-xl font-bold btn-press">Continue</button>
    </div>
  `;

  const range = document.getElementById("assess-range");
  const rangeVal = document.getElementById("assess-range-val");
  if (range && rangeVal) {
    range.addEventListener("input", () => {
      rangeVal.textContent = range.value;
    });
  }
}

function assessmentBack() {
  assessmentStep = Math.max(0, assessmentStep - 1);
  renderAssessmentStep();
}

function assessmentNext() {
  const step = ASSESSMENT_STEPS[assessmentStep];
  if (step.type === "choice") {
    const picked = document.querySelector('input[name="assess"]:checked');
    if (!picked) {
      showToast("Pick one option to continue.");
      return;
    }
    assessmentAnswers[step.id] = picked.value;
  } else {
    const range = document.getElementById("assess-range");
    assessmentAnswers[step.id] = range ? range.value : step.default;
  }
  assessmentStep++;
  renderAssessmentStep();
}

function buildAssessmentResult() {
  const energy = parseFloat(assessmentAnswers.energy || 1);
  const env = parseInt(assessmentAnswers.environment || 150, 10);
  const res = parseFloat(assessmentAnswers.resilience || 1.5);
  const clarity = parseInt(assessmentAnswers.clarity || 2, 10);
  const fulfillment = parseInt(assessmentAnswers.fulfillment || 2, 10);
  const role = assessmentAnswers.role || "solo";

  const insights = [];
  if (energy <= 0.2) insights.push("Torch is low — protect recovery before adding scope.");
  else if (energy > 1.8) insights.push("Torch is critical — schedule deliberate cool-down this week.");
  else insights.push("Energy looks in a workable band — keep rituals that maintain it.");

  if (env > 350) insights.push("Sea is turbulent — reduce WIP and sync one expectation with your team (or future collaborators).");
  else if (env < 80) insights.push("Sea is calm — good time for deep creative work.");
  else insights.push("Environment has moderate ripple — name one external stressor you can influence.");

  if (res >= 1.7) insights.push("High squash — you're adapting fast; write down what must NOT bend.");
  else if (res <= 1.2) insights.push("Low squash — consider where a little flexibility could unblock progress.");

  if (clarity < 3) insights.push("Staging needs work — pick one star goal (use the Vision Board below).");
  if (fulfillment < 3) insights.push("Joy is thin — reconnect to why *you* want this game, not just milestones.");

  const roleNote =
    role === "lead"
      ? "As a lead, your inner weather sets the studio climate."
      : role === "team"
        ? "On a team, overlap without clarity breeds turbulence — map rhythms below."
        : "Solo dev: you are the whole orchestra — pace matters.";

  const summary = [
    "=== Sondim Free Assessment ===",
    `Role: ${role}`,
    `Energy: ${energy.toFixed(1)} | Sea delay: ${env}ms | Resilience: ${res.toFixed(2)}`,
    `Priority clarity: ${clarity}/3 | Fulfillment: ${fulfillment}/3`,
    "",
    roleNote,
    "",
    ...insights.map((i) => `• ${i}`),
    "",
    "The real work is yours — I'm glad you're looking inward.",
    "https://sondim.github.io/#book",
  ].join("\n");

  return `
    <h3 class="text-2xl font-black text-cyan-300 mb-4">Your snapshot</h3>
    <p class="text-zinc-300 text-sm mb-4">${roleNote}</p>
    <ul class="text-sm text-zinc-200 space-y-2 mb-6 list-disc pl-5">
      ${insights.map((i) => `<li>${i}</li>`).join("")}
    </ul>
    <pre class="tool-output text-xs mb-4" id="assessment-summary">${summary}</pre>
    <div class="flex flex-wrap gap-3">
      <button type="button" onclick="copyAssessment()" class="px-4 py-3 bg-blue-600 rounded-xl font-bold text-sm btn-press">Copy results</button>
      <a href="#book" onclick="closeAssessment()" class="px-4 py-3 bg-white text-black rounded-xl font-bold text-sm btn-press inline-block text-center">Book a session</a>
      <button type="button" onclick="closeAssessment()" class="px-4 py-3 border border-white/20 rounded-xl text-sm">Close</button>
    </div>
  `;
}

function copyAssessment() {
  const el = document.getElementById("assessment-summary");
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => showToast("Assessment copied to clipboard."));
}
