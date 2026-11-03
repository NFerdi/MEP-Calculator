const getElement = (id) => document.getElementById(id);
const getNumber = (id, fallback = 0) =>
  parseFloat(getElement(id).value) || fallback;
const formatNumber = (value) => Math.round(value).toLocaleString("id-ID");

const modeButtonClasses = {
  activeLamps: [
    "py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all",
    "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20",
    "flex items-center justify-center gap-2",
  ].join(" "),
  activeWatts: [
    "py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all",
    "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20",
    "flex items-center justify-center gap-2",
  ].join(" "),
  inactive: [
    "py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all",
    "text-slate-400 hover:text-white flex items-center justify-center gap-2",
  ].join(" "),
};

function switchMode(mode) {
  const isLampMode = mode === "find-lamps";

  document.querySelectorAll("[data-mode]").forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.className = isActive
      ? isLampMode
        ? modeButtonClasses.activeLamps
        : modeButtonClasses.activeWatts
      : modeButtonClasses.inactive;

    const indicator = button.querySelector("[data-mode-indicator]");
    indicator.className = isActive
      ? "w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold"
      : "w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px]";
    indicator.textContent = isActive ? "✓" : "";
  });

  getElement("section-find-lamps").classList.toggle("hidden", !isLampMode);
  getElement("section-find-watts").classList.toggle("hidden", isLampMode);

  if (isLampMode) {
    calculateFindLamps();
  } else {
    calculateFindWatts();
  }
}

function getDynamicCU(area, height) {
  if (area <= 0) {
    return 0.75;
  }

  const effectiveHeight = Math.max(height - 0.8, 1.0);
  const perimeter = 4 * Math.sqrt(area);
  const roomCavityRatio = (5 * effectiveHeight * perimeter) / area;
  const utilizationCoefficient = 0.75 - roomCavityRatio * 0.03;

  return Number(Math.min(0.75, Math.max(0.35, utilizationCoefficient)).toFixed(2));
}

function calculateFindLamps() {
  const area = getNumber("l1-area");
  const height = getNumber("l1-height", 3);
  const lux = getNumber("l1-lux-select", 300);
  const lumenPerLamp = getNumber("l1-lumen", 1500);
  const lightLossFactor = getNumber("l1-llf", 0.8);
  const utilizationCoefficient = getDynamicCU(area, height);

  getElement("l1-cu").value = utilizationCoefficient;

  const totalLumenRequired = lux * area;
  const effectiveLumenPerLamp =
    lumenPerLamp * lightLossFactor * utilizationCoefficient;
  const lampCount = Math.max(
    1,
    Math.ceil(
      effectiveLumenPerLamp > 0
        ? totalLumenRequired / effectiveLumenPerLamp
        : 0,
    ),
  );
  const gridLayouts = {
    4: "4 Titik Lampu (Grid 2x2)",
    6: "6 Titik Lampu (Grid 2x3)",
    9: "9 Titik Lampu (Grid 3x3)",
  };
  const gridDescription =
    gridLayouts[lampCount] ?? `${lampCount} Titik Lampu (Sebar Merata)`;
  const ceilingNote =
    height > 3.5
      ? "⚠️ Plafon tinggi (>3.5m): Cahaya meredup saat sampai di lantai, pertimbangkan sudut sorot lampu yang lebih sempit."
      : "✅ Ketinggian plafon dalam batas normal/standar.";

  getElement("l1-res-lumen").textContent =
    `${formatNumber(totalLumenRequired)} Lumen`;
  getElement("l1-res-lamps").textContent = `${lampCount} Titik Lampu`;
  getElement("l1-res-grid").textContent = gridDescription;
  getElement("l1-res-note").textContent = ceilingNote;
}

function calculateFindWatts() {
  const area = getNumber("l2-area");
  const height = getNumber("l2-height", 3);
  const lux = getNumber("l2-lux", 300);
  const lampCount = getNumber("l2-lamps", 1);
  const lightLossFactor = getNumber("l2-llf", 0.8);
  const utilizationCoefficient = getDynamicCU(area, height);

  getElement("l2-cu").value = utilizationCoefficient;

  const totalLumenRequired = lux * area;
  const effectiveLampCount = lampCount * lightLossFactor * utilizationCoefficient;
  const lumenPerLamp =
    effectiveLampCount > 0 ? totalLumenRequired / effectiveLampCount : 0;
  const estimatedWatts = lumenPerLamp / 100;

  getElement("l2-res-total-lumen").textContent =
    `${formatNumber(totalLumenRequired)} Lumen`;
  getElement("l2-res-lumen-per-lamp").textContent =
    `${formatNumber(lumenPerLamp)} Lumen`;
  getElement("l2-res-watt").textContent =
    `± ${Math.round(estimatedWatts)} Watt per lampu`;
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});
document.querySelectorAll("[data-calculator]").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.dataset.calculator === "find-lamps") {
      calculateFindLamps();
    } else {
      calculateFindWatts();
    }
  });
  input.addEventListener("change", () => {
    if (input.dataset.calculator === "find-lamps") {
      calculateFindLamps();
    } else {
      calculateFindWatts();
    }
  });
});

calculateFindLamps();
