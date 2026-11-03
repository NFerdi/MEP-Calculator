function switchMode(mode) {
  const btn1 = document.getElementById("mode-btn-1");
  const btn2 = document.getElementById("mode-btn-2");
  const sec1 = document.getElementById("section-find-lamps");
  const sec2 = document.getElementById("section-find-watts");

  if (mode === "find-lamps") {
    btn1.className =
      "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2";
    btn1.innerHTML =
      '<span class="w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">✓</span> Cari Jumlah Titik Lampu (N)';

    btn2.className =
      "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2";
    btn2.innerHTML =
      '<span class="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px]"></span> Cari Watt / Lumen Lampu (Φ)';

    sec1.classList.remove("hidden");
    sec2.classList.add("hidden");
    calculateFindLamps();
  } else {
    btn2.className =
      "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2";
    btn2.innerHTML =
      '<span class="w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold">✓</span> Cari Watt / Lumen Lampu (Φ)';

    btn1.className =
      "py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all text-slate-400 hover:text-white flex items-center justify-center gap-2";
    btn1.innerHTML =
      '<span class="w-4 h-4 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px]"></span> Cari Jumlah Titik Lampu (N)';

    sec2.classList.remove("hidden");
    sec1.classList.add("hidden");
    calculateFindWatts();
  }
}

function getDynamicCU(area, height) {
  let hEff = Math.max(height - 0.8, 1.0);
  let perimeter = 4 * Math.sqrt(area);
  let rcr = (5 * hEff * perimeter) / area;
  let baseCU = 0.75 - rcr * 0.03;
  if (baseCU < 0.35) baseCU = 0.35;
  if (baseCU > 0.75) baseCU = 0.75;
  return parseFloat(baseCU.toFixed(2));
}

function calculateFindLamps() {
  let area = parseFloat(document.getElementById("l1-area").value) || 0;
  let height = parseFloat(document.getElementById("l1-height").value) || 3.0;
  let lux = parseFloat(document.getElementById("l1-lux-select").value) || 300;
  let lumenPerLamp =
    parseFloat(document.getElementById("l1-lumen").value) || 1500;

  let useFactors = document.getElementById("l1-use-factors").checked;
  let factorsBox = document.getElementById("l1-factors-box");

  let llf = 1.0;
  let cu = 1.0;

  if (useFactors) {
    factorsBox.classList.remove("opacity-40", "pointer-events-none");
    llf = parseFloat(document.getElementById("l1-llf").value) || 0.8;
    cu = getDynamicCU(area, height);
    document.getElementById("l1-cu").value = cu;
  } else {
    factorsBox.classList.add("opacity-40", "pointer-events-none");
  }

  let totalLumenRequired = lux * area;
  let denominator = lumenPerLamp * llf * cu;
  let lampsCount = denominator > 0 ? totalLumenRequired / denominator : 0;
  let finalLamps = Math.ceil(lampsCount);
  if (finalLamps < 1) finalLamps = 1;

  let gridText = `${finalLamps} Titik Lampu (Sebar Merata)`;
  if (finalLamps === 4) gridText = `4 Titik Lampu (Grid 2x2)`;
  else if (finalLamps === 6) gridText = `6 Titik Lampu (Grid 2x3)`;
  else if (finalLamps === 9) gridText = `9 Titik Lampu (Grid 3x3)`;

  document.getElementById("l1-res-lumen").innerText =
    Math.round(totalLumenRequired).toLocaleString("id-ID") + " Lumen";
  document.getElementById("l1-res-lamps").innerText =
    finalLamps + " Titik Lampu";
  document.getElementById("l1-res-grid").innerText = gridText;
}

function calculateFindWatts() {
  let area = parseFloat(document.getElementById("l2-area").value) || 0;
  let height = parseFloat(document.getElementById("l2-height").value) || 3.0;
  let lux = parseFloat(document.getElementById("l2-lux").value) || 300;
  let lamps = parseFloat(document.getElementById("l2-lamps").value) || 1;

  let useFactors = document.getElementById("l2-use-factors").checked;
  let factorsBox = document.getElementById("l2-factors-box");

  let llf = 1.0;
  let cu = 1.0;

  if (useFactors) {
    factorsBox.classList.remove("opacity-40", "pointer-events-none");
    llf = parseFloat(document.getElementById("l2-llf").value) || 0.8;
    cu = getDynamicCU(area, height);
    document.getElementById("l2-cu").value = cu;
  } else {
    factorsBox.classList.add("opacity-40", "pointer-events-none");
  }

  let totalLumenRequired = lux * area;
  let denominator = lamps * llf * cu;
  let lumenPerLamp = denominator > 0 ? totalLumenRequired / denominator : 0;

  // Disesuaikan ke standar efisiensi LED (±96 Lumen per Watt agar sinkron dengan acuan Zhitov)
  let estimatedWatts = lumenPerLamp / 96;

  document.getElementById("l2-res-total-lumen").innerText =
    Math.round(totalLumenRequired).toLocaleString("id-ID") + " Lumen";
  document.getElementById("l2-res-lumen-per-lamp").innerText =
    Math.round(lumenPerLamp).toLocaleString("id-ID") + " Lumen";
  document.getElementById("l2-res-watt").innerText =
    `± ${Math.round(estimatedWatts)} Watt per lampu (LED)`;
}

window.onload = function () {
  calculateFindLamps();
};
