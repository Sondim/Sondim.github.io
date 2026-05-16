const DRAW_SIZES = { s: 4, m: 10, l: 22 };
const drawState = { tool: "brush", color: "#1a1a1a", size: 10, strokes: [], current: null, isDrawing: false, ctx: null, canvas: null, bgColor: "#ffffff" };

function initDrawBoard() {
  const canvas = document.getElementById("draw-canvas");
  if (!canvas) return;
  drawState.canvas = canvas;
  drawState.ctx = canvas.getContext("2d", { willReadFrequently: true });
  drawState.canvas.style.backgroundColor = drawState.bgColor;
  resizeDrawCanvas();
  window.addEventListener("resize", debounceDraw(resizeDrawCanvas, 200));
  bindDrawToolbar();
  bindDrawPointer(canvas);
  bindDrawSendForm();
  redrawCanvas();
}

function debounceDraw(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function resizeDrawCanvas() {
  const canvas = drawState.canvas;
  const wrap = canvas.parentElement;
  if (!wrap) return;
  const w = Math.min(wrap.clientWidth, 720);
  const h = Math.round(w * 0.75);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.style.backgroundColor = drawState.bgColor;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  drawState.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawCanvas();
}

function bindDrawToolbar() {
  document.querySelectorAll("[data-draw-tool]").forEach((btn) => {
    btn.addEventListener("click", () => setDrawTool(btn.dataset.drawTool));
  });
  document.querySelectorAll("[data-draw-color]").forEach((btn) => {
    btn.addEventListener("click", () => {
      drawState.color = btn.dataset.drawColor;
      if (drawState.tool === "eraser") setDrawTool("brush");
      document.querySelectorAll(".draw-color-swatch").forEach((b) => b.classList.toggle("draw-color-active", b === btn));
    });
  });
  document.querySelectorAll("[data-draw-size]").forEach((btn) => {
    btn.addEventListener("click", () => {
      drawState.size = DRAW_SIZES[btn.dataset.drawSize] || 10;
      document.querySelectorAll("[data-draw-size]").forEach((b) => b.classList.toggle("draw-size-active", b === btn));
    });
  });
  document.getElementById("draw-undo")?.addEventListener("click", drawUndo);
  document.getElementById("draw-clear")?.addEventListener("click", () => {
    if (drawState.strokes.length && !confirm("Clear the whole canvas?")) return;
    drawState.strokes = [];
    redrawCanvas();
    showToast("Canvas cleared.");
  });
  setDrawTool("brush");
  document.querySelector('.draw-color-swatch[data-draw-color="#1a1a1a"]')?.classList.add("draw-color-active");
  document.querySelector('[data-draw-size="m"]')?.classList.add("draw-size-active");
}

function setDrawTool(tool) {
  drawState.tool = tool;
  document.querySelectorAll("[data-draw-tool]").forEach((b) => {
    const on = b.dataset.drawTool === tool;
    b.classList.toggle("draw-tool-active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  if (drawState.canvas) drawState.canvas.style.cursor = tool === "eraser" ? "cell" : "crosshair";
}

function bindDrawPointer(canvas) {
  const start = (e) => {
    e.preventDefault();
    const p = pointerPos(e);
    if (drawState.tool === "fill") {
      floodFill(p.x, p.y, drawState.color);
      drawState.strokes.push({ tool: "fill", color: drawState.color, x: p.x, y: p.y });
      return;
    }
    drawState.isDrawing = true;
    drawState.current = { tool: drawState.tool, color: drawState.color, size: drawState.size, points: [p] };
    drawStroke(drawState.current, true);
  };
  const move = (e) => {
    if (!drawState.isDrawing || !drawState.current) return;
    e.preventDefault();
    const p = pointerPos(e);
    const pts = drawState.current.points;
    const prev = pts[pts.length - 1];
    pts.push(p);
    const ctx = drawState.ctx;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    applyStrokeStyle(drawState.current);
    ctx.stroke();
  };
  const end = () => {
    if (!drawState.isDrawing || !drawState.current) return;
    drawState.isDrawing = false;
    if (drawState.current.points.length) drawState.strokes.push(drawState.current);
    drawState.current = null;
  };
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", (e) => { if (e.touches.length === 1) start(e.touches[0]); }, { passive: false });
  canvas.addEventListener("touchmove", (e) => { if (e.touches.length === 1) move(e.touches[0]); }, { passive: false });
  canvas.addEventListener("touchend", end);
}

function pointerPos(e) {
  const rect = drawState.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  return { x: (e.clientX - rect.left) * (drawState.canvas.width / rect.width) / dpr, y: (e.clientY - rect.top) * (drawState.canvas.height / rect.height) / dpr };
}

function applyStrokeStyle(stroke) {
  const ctx = drawState.ctx;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;
  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }
}

function drawStroke(stroke, dot) {
  const ctx = drawState.ctx;
  applyStrokeStyle(stroke);
  const pts = stroke.points;
  if (dot && pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
    if (stroke.tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = "rgba(0,0,0,1)"; }
    else { ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = stroke.color; }
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

function redrawCanvas() {
  const ctx = drawState.ctx;
  const dpr = window.devicePixelRatio || 1;
  const w = drawState.canvas.width / dpr;
  const h = drawState.canvas.height / dpr;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = drawState.bgColor;
  ctx.fillRect(0, 0, w, h);
  for (const s of drawState.strokes) {
    if (s.tool === "fill") { floodFill(s.x, s.y, s.color); continue; }
    drawStroke(s, s.points.length === 1);
  }
}

function drawUndo() {
  if (!drawState.strokes.length) { showToast("Nothing to undo."); return; }
  drawState.strokes.pop();
  redrawCanvas();
}

function floodFill(x, y, color) {
  const canvas = drawState.canvas;
  const ctx = drawState.ctx;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const sx = Math.max(0, Math.min(w - 1, Math.floor(x * (window.devicePixelRatio || 1))));
  const sy = Math.max(0, Math.min(h - 1, Math.floor(y * (window.devicePixelRatio || 1))));
  const target = pix(data, w, sx, sy);
  const fill = hexRgba(color);
  if (match(target, fill)) return;
  const stack = [[sx, sy]];
  const seen = new Uint8Array(w * h);
  while (stack.length) {
    const [cx, cy] = stack.pop();
    const id = cy * w + cx;
    if (seen[id]) continue;
    seen[id] = 1;
    if (!match(pix(data, w, cx, cy), target)) continue;
    setPix(data, w, cx, cy, fill);
    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < w - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < h - 1) stack.push([cx, cy + 1]);
  }
  ctx.putImageData(img, 0, 0);
}

function pix(d, w, x, y) { const i = (y * w + x) * 4; return [d[i], d[i+1], d[i+2], d[i+3]]; }
function setPix(d, w, x, y, c) { const i = (y * w + x) * 4; d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=c[3]; }
function match(a, b, t = 36) { return Math.abs(a[0]-b[0])<=t && Math.abs(a[1]-b[1])<=t && Math.abs(a[2]-b[2])<=t; }
function hexRgba(hex) {
  const h = hex.replace("#","");
  const n = parseInt(h.length===3 ? h.split("").map(c=>c+c).join("") : h, 16);
  return [(n>>16)&255, (n>>8)&255, n&255, 255];
}

function isCanvasBlank() { return drawState.strokes.length === 0; }

function canvasToBlob() {
  // Ensure background is rendered into pixel data before exporting
  redrawCanvas();
  return new Promise((r) => drawState.canvas.toBlob((b) => r(b), "image/png", 0.92));
}

function bindDrawSendForm() {
  const form = document.getElementById("draw-send-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isCanvasBlank()) { showToast("Draw something first."); return; }
    const name = document.getElementById("draw-name")?.value?.trim() || "Anonymous";
    const email = document.getElementById("draw-email")?.value?.trim() || "";
    const message = document.getElementById("draw-message")?.value?.trim() || "";
    if (!email.includes("@")) { showToast("Please add your email so I can reply."); return; }
    const btn = document.getElementById("draw-send-btn");
    const status = document.getElementById("draw-send-status");
    const notify = SITE_CONFIG?.notifyEmail || "magnus@sondim.com";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    const blob = await canvasToBlob();
    const key = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG.web3formsAccessKey : "";
      try {
        if (key) {
          const fd = new FormData();
          fd.append("access_key", key);
          fd.append("subject", "Sondim draw board — " + name);
          fd.append("from_name", name);
          fd.append("email", email);
          fd.append("message", message || "(Drawing attached)");
          fd.append("attachment", blob, "sondim-drawing.png");

          const sendWithRetries = async (formData, attempts = 3) => {
            for (let i = 1; i <= attempts; i++) {
              if (status) status.textContent = `Sending… (attempt ${i} of ${attempts})`;
              try {
                const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
                let json;
                try { json = await res.json(); } catch (e) { const txt = await res.text().catch(() => "<no body>"); throw new Error(`Non-JSON response: ${res.status} ${res.statusText} — ${txt}`); }
                console.log("web3forms response", res.status, res.statusText, json);
                if (!res.ok || !json.success) throw new Error(json?.message || `${res.status} ${res.statusText}`);
                return json;
              } catch (err) {
                console.warn(`web3forms attempt ${i} failed:`, err);
                if (i < attempts) await new Promise((r) => setTimeout(r, 500 * i));
                else throw err;
              }
            }
          };

          // Helper to convert blob to a smaller data URL (for embedding when attachments
          // are not allowed by the account). Limits width to 480px to keep size reasonable.
          const blobToDataUrl = async (blob, maxW = 480) => {
            try {
              const img = await createImageBitmap(blob);
              const w = img.width;
              const h = img.height;
              const ratio = Math.min(1, maxW / w);
              const cw = Math.max(1, Math.round(w * ratio));
              const ch = Math.max(1, Math.round(h * ratio));
              const c = document.createElement("canvas");
              c.width = cw; c.height = ch;
              const ctx2 = c.getContext("2d");
              ctx2.drawImage(img, 0, 0, cw, ch);
              return c.toDataURL("image/png", 0.8);
            } catch (e) {
              return null;
            }
          };

          try {
            await sendWithRetries(fd, 3);
            if (status) status.textContent = "Sent — thank you! I'll reply soon.";
            showToast("Drawing sent.");
            form.reset();
          } catch (err) {
            console.error("web3forms final error:", err);
            const msg = err?.message || String(err);
            // If we got a 400-type error (bad request) it's often because attachments
            // are not permitted on the account (file uploads are a PRO feature).
            // In that case, retry without the attachment and embed a reduced data-URL
            // of the PNG into the message so you still receive the drawing.
            const looksLikeBadRequest = /400|bad request|attachment|file|pro/i.test(msg);
            if (looksLikeBadRequest) {
              try {
                if (status) status.textContent = "Attachment rejected — retrying without attachment…";
                const dataUrl = await blobToDataUrl(blob, 480);
                const fd2 = new FormData();
                fd2.append("access_key", key);
                fd2.append("subject", "Sondim draw board — " + name);
                fd2.append("name", name);
                fd2.append("email", email);
                const extra = (message ? message + "\n\n" : "") + (dataUrl ? `Image (data URL):\n${dataUrl}` : "(PNG available on download)");
                fd2.append("message", extra);
                const res2 = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd2 });
                let json2;
                try { json2 = await res2.json(); } catch (e) { const t = await res2.text().catch(() => "<no body>"); throw new Error(`Retry Non-JSON response: ${res2.status} ${res2.statusText} — ${t}`); }
                console.log("web3forms retry response (no attachment)", res2.status, res2.statusText, json2);
                if (!res2.ok || !json2.success) throw new Error(json2?.message || `${res2.status} ${res2.statusText}`);
                if (status) status.textContent = "Sent (without attachment) — check your inbox.";
                showToast("Drawing sent without attachment.");
                form.reset();
                return;
              } catch (err2) {
                console.error("retry without attachment failed:", err2);
                downloadDrawing(blob, name);
                if (status) status.textContent = `Send failed — ${err2?.message || err2}. PNG downloaded. Email ${notify}`;
                showToast("Couldn't send — downloaded instead.");
                return;
              }
            }
            // Otherwise show helpful guided messages for common causes
            if (/401|403|access|invalid/i.test(msg)) {
              if (status) status.textContent = `Send failed — invalid access key. Check js/site-config.js.`;
            } else if (/Failed to fetch|NetworkError|TypeError/i.test(msg)) {
              if (status) status.textContent = `Send failed — network or CORS issue. PNG downloaded. Email ${notify}`;
            } else {
              if (status) status.textContent = `Send failed — ${msg}. PNG downloaded. Email ${notify}`;
            }
            downloadDrawing(blob, name);
            showToast("Couldn't send — downloaded instead.");
          }
        } else {
          downloadDrawing(blob, name);
          location.href = "mailto:" + notify + "?subject=" + encodeURIComponent("Coaching sketch from " + name) + "&body=" + encodeURIComponent("From: " + name + "\nEmail: " + email + "\n\n" + message + "\n\n(PNG downloaded — attach it to this email)");
          if (status) status.textContent = "PNG downloaded — attach it in your email app.";
        }
      } catch (err) {
        console.error("unexpected send error:", err);
        downloadDrawing(blob, name);
        if (status) status.textContent = `Send failed — ${err?.message || err}. PNG downloaded. Email ${notify}`;
        showToast("Couldn't send — downloaded instead.");
      }
    if (btn) { btn.disabled = false; btn.textContent = "Send drawing to Magnus"; }
  });
  document.getElementById("draw-download")?.addEventListener("click", async () => {
    downloadDrawing(await canvasToBlob(), "sondim-sketch");
    showToast("PNG downloaded.");
  });
}

function downloadDrawing(blob, prefix) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (prefix || "drawing") + "-" + Date.now() + ".png";
  a.click();
  // Revoke after a short delay to ensure the download starts in all browsers
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
