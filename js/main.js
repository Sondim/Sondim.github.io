function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("is-visible"), 4500);
}

document.addEventListener("DOMContentLoaded", () => {
  initSea();
  updateBouncePhysics();

  const bounceSlider = document.getElementById("bounce-slider");
  if (bounceSlider) bounceSlider.addEventListener("input", updateBouncePhysics);

  const seaSlider = document.getElementById("sea-turbulence");
  if (seaSlider) seaSlider.addEventListener("input", updateSeaStorm);

  initStagingSpotlight();
  initPoseToggle();
  initSlowEase();
  initExaggeration();
  const exSlider = document.getElementById("exaggeration-slider");
  if (exSlider) exSlider.dispatchEvent(new Event("input"));
  initAppealPick();
  initSolidPillars();

  const modal = document.getElementById("assessment-modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAssessment();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAssessment();
  });
});
