function getLightingNumber(id, fallback = 0) {
  return Number.parseFloat(document.getElementById(id).value) || fallback;
}

function getDynamicCU(area, height) {
  const effectiveHeight = Math.max(height - 0.8, 1);
  const perimeter = 4 * Math.sqrt(area);
  const roomCavityRatio = (5 * effectiveHeight * perimeter) / area;
  const utilizationCoefficient = 0.75 - roomCavityRatio * 0.03;

  return Number(Math.min(0.75, Math.max(0.35, utilizationCoefficient)).toFixed(2));
}

function getLightingFactors(prefix, area, height) {
  const factorsEnabled = document.getElementById(`${prefix}-use-factors`).checked;
  const factorsBox = document.getElementById(`${prefix}-factors-box`);

  factorsBox.classList.toggle("opacity-40", !factorsEnabled);
  factorsBox.classList.toggle("pointer-events-none", !factorsEnabled);

  if (!factorsEnabled) return { llf: 1, cu: 1 };

  const cu = getDynamicCU(area, height);
  document.getElementById(`${prefix}-cu`).value = cu;

  return {
    llf: getLightingNumber(`${prefix}-llf`, 0.8),
    cu,
  };
}

function calculateLighting(prefix, options) {
  const area = getLightingNumber(`${prefix}-area`);
  const height = getLightingNumber(`${prefix}-height`, 3);
  const lux = getLightingNumber(options.luxId, 300);
  const { llf, cu } = getLightingFactors(prefix, area, height);
  const requiredLumen = lux * area;

  return {
    area,
    requiredLumen,
    correctedLumen: requiredLumen / (llf * cu),
  };
}

function calculateFindLamps() {
  const { requiredLumen, correctedLumen } = calculateLighting("l1", {
    luxId: "l1-lux-select",
  });
  const lumenPerLamp = getLightingNumber("l1-lumen", 1500);
  const lampCount = Math.max(1, Math.ceil(correctedLumen / lumenPerLamp));
  const layouts = {
    4: "Grid 2x2",
    6: "Grid 2x3",
    9: "Grid 3x3",
  };

  document.getElementById("l1-res-lumen").textContent =
    `${Math.round(requiredLumen).toLocaleString("id-ID")} Lumen`;
  document.getElementById("l1-res-lamps").textContent =
    `${lampCount} Titik Lampu`;
  document.getElementById("l1-res-grid").textContent = layouts[lampCount]
    ? `${lampCount} Titik Lampu (${layouts[lampCount]})`
    : `${lampCount} Titik Lampu (Sebar Merata)`;
}

function calculateFindWatts() {
  const { requiredLumen, correctedLumen } = calculateLighting("l2", {
    luxId: "l2-lux",
  });
  const lampCount = getLightingNumber("l2-lamps", 1);
  const lumenPerLamp = correctedLumen / lampCount;
  const estimatedWatts = lumenPerLamp / 96;

  document.getElementById("l2-res-total-lumen").textContent =
    `${Math.round(requiredLumen).toLocaleString("id-ID")} Lumen`;
  document.getElementById("l2-res-lumen-per-lamp").textContent =
    `${Math.round(lumenPerLamp).toLocaleString("id-ID")} Lumen`;
  document.getElementById("l2-res-watt").textContent =
    `± ${Math.round(estimatedWatts)} Watt per lampu (LED)`;
}

function switchMode(mode) {
  const findLamps = mode === "find-lamps";
  const activeButton = document.getElementById(
    findLamps ? "mode-btn-1" : "mode-btn-2",
  );
  const inactiveButton = document.getElementById(
    findLamps ? "mode-btn-2" : "mode-btn-1",
  );
  const activeSection = document.getElementById(
    findLamps ? "section-find-lamps" : "section-find-watts",
  );
  const inactiveSection = document.getElementById(
    findLamps ? "section-find-watts" : "section-find-lamps",
  );
  activeButton.className = findLamps
    ? "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
    : "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2";
  activeButton.innerHTML =
    `<span class="w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">✓</span> ${findLamps ? "Cari Jumlah Titik Lampu (N)" : "Cari Watt / Lumen Lampu (Φ)"}`;
  inactiveButton.className =
    "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2";
  inactiveButton.innerHTML =
    `<span class="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px]"></span> ${findLamps ? "Cari Watt / Lumen Lampu (Φ)" : "Cari Jumlah Titik Lampu (N)"}`;
  activeSection.classList.remove("hidden");
  inactiveSection.classList.add("hidden");

  if (findLamps) calculateFindLamps();
  else calculateFindWatts();
}

window.initLightingCalculator = function initLightingCalculator() {
  if (!document.getElementById("l1-area")) return;
  calculateFindLamps();
};

window.initLightingCalculator();
