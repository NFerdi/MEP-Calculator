const activityPresets = [
  { name: "Duduk / Kantor / Santai", btu: 400 },
  { name: "Kerja Ringan / Berdiri", btu: 500 },
  { name: "Aktivitas Fisik / Olahraga / Gym", btu: 750 },
];

const mcbStandardList = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63];
const humanRows = [{ typeIndex: 0, count: 4 }];
let currentMethod = "m2";

const getElement = (id) => document.getElementById(id);
const getNumber = (id, fallback = 0) =>
  parseFloat(getElement(id).value) || fallback;
const formatNumber = (value) => Math.round(value).toLocaleString("id-ID");

function setAreaMethod(method) {
  currentMethod = method;
  const isSquareMeters = method === "m2";

  getElement("btn-method-m2").className = isSquareMeters
    ? "px-3 py-1.5 rounded-lg transition-all bg-blue-600 text-white shadow"
    : "px-3 py-1.5 rounded-lg transition-all text-slate-400 hover:text-white";
  getElement("btn-method-pyl").className = isSquareMeters
    ? "px-3 py-1.5 rounded-lg transition-all text-slate-400 hover:text-white"
    : "px-3 py-1.5 rounded-lg transition-all bg-blue-600 text-white shadow";
  getElement("wrapper-method-m2").classList.toggle("hidden", !isSquareMeters);
  getElement("wrapper-method-pyl").classList.toggle("hidden", isSquareMeters);
  calculate();
}

function renderHumanRows() {
  const container = getElement("human-rows-container");
  container.replaceChildren();

  humanRows.forEach((row, index) => {
    const rowElement = document.createElement("div");
    rowElement.className =
      "flex items-center space-x-2 bg-slate-900/60 p-3 rounded-xl border border-slate-700/50";

    const activityWrapper = document.createElement("div");
    activityWrapper.className = "flex-grow";
    const activitySelect = document.createElement("select");
    activitySelect.className =
      "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500";

    activityPresets.forEach((preset, presetIndex) => {
      const option = document.createElement("option");
      option.value = presetIndex;
      option.textContent = `${preset.name} (${preset.btu} BTU/org)`;
      option.selected = presetIndex === row.typeIndex;
      activitySelect.append(option);
    });
    activitySelect.addEventListener("change", () => {
      humanRows[index].typeIndex = Number(activitySelect.value);
      calculate();
    });
    activityWrapper.append(activitySelect);

    const countWrapper = document.createElement("div");
    countWrapper.className = "w-24";
    const countInput = document.createElement("input");
    countInput.type = "number";
    countInput.min = "1";
    countInput.max = "100";
    countInput.value = row.count;
    countInput.placeholder = "Jumlah";
    countInput.className =
      "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs text-center focus:outline-none focus:border-cyan-500";
    countInput.addEventListener("input", () => {
      humanRows[index].count = Math.max(1, parseInt(countInput.value, 10) || 1);
      calculate();
    });
    countWrapper.append(countInput);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className =
      "w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center transition-all text-xs";
    removeButton.setAttribute("aria-label", "Hapus tipe aktivitas");
    removeButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    removeButton.addEventListener("click", () => removeHumanRow(index));

    rowElement.append(activityWrapper, countWrapper, removeButton);
    container.append(rowElement);
  });
}

function addHumanRow() {
  humanRows.push({ typeIndex: 1, count: 2 });
  renderHumanRows();
  calculate();
}

function removeHumanRow(index) {
  humanRows.splice(index, 1);
  if (humanRows.length === 0) {
    humanRows.push({ typeIndex: 0, count: 1 });
  }
  renderHumanRows();
  calculate();
}

function updateSafetyLabel() {
  getElement("label-safety-ac").textContent =
    `${getElement("slider-safety-ac").value}%`;
}

function updateCosPhiLabel() {
  getElement("label-cos-phi").textContent =
    getElement("slider-cos-phi").value;
}

function getRoomArea() {
  if (currentMethod === "m2") {
    return getNumber("input-m2");
  }

  return getNumber("input-panjang") * getNumber("input-lebar");
}

function getRecommendedCapacity(totalBTU) {
  const capacityPK = totalBTU / 9000;
  const capacityOptions = [
    [0.75, "0.5 PK"],
    [1.1, "1.0 PK"],
    [1.6, "1.5 PK"],
    [2.2, "2.0 PK"],
    [2.8, "2.5 PK"],
    [3.5, "3.0 PK"],
  ];
  const match = capacityOptions.find(([maximum]) => capacityPK <= maximum);

  return match
    ? match[1]
    : `${(Math.ceil(capacityPK * 2) / 2).toFixed(1)} PK`;
}

function getRecommendedMCB(current) {
  return mcbStandardList.find((rating) => rating >= current) ?? 63;
}

function calculate() {
  const roomBTU = getRoomArea() * getNumber("select-exposure", 600);
  const humanBTU = humanRows.reduce((total, row) => {
    return total + row.count * activityPresets[row.typeIndex].btu;
  }, 0);
  const watts = getNumber("input-electronic-watts");
  const electronicBTU = watts * 3.41;
  const safetyPercent = getNumber("slider-safety-ac", 15);
  const totalBTU =
    (roomBTU + humanBTU + electronicBTU) * (1 + safetyPercent / 100);

  const totalSystemWatts = (totalBTU / 9000) * 850 + watts;
  const voltage = getNumber("select-voltage", 220);
  const cosPhi = getNumber("slider-cos-phi", 0.85);
  const isThreePhase = voltage === 380;
  const current =
    totalSystemWatts / (isThreePhase ? 1.732 * 380 * cosPhi : 220 * cosPhi);
  const phase = isThreePhase || current > 32 ? "3 Fasa (3P)" : "1 Fasa (1P)";

  getElement("res-btu").textContent = formatNumber(totalBTU);
  getElement("res-pk").textContent = getRecommendedCapacity(totalBTU);
  getElement("res-ampere").textContent = `${current.toFixed(1)} A`;
  getElement("res-mcb").textContent = `${getRecommendedMCB(current)} Ampere`;
  getElement("res-phase").textContent = phase;
  getElement("breakdown-room").textContent = `${formatNumber(roomBTU)} BTU/h`;
  getElement("breakdown-human").textContent = `${formatNumber(humanBTU)} BTU/h`;
  getElement("breakdown-elec").textContent =
    `${formatNumber(electronicBTU)} BTU/h`;
  getElement("breakdown-safety").textContent = `+${safetyPercent}%`;
}

document.querySelectorAll("[data-area-method]").forEach((button) => {
  button.addEventListener("click", () => setAreaMethod(button.dataset.areaMethod));
});
document.querySelectorAll("[data-calculate]").forEach((input) => {
  input.addEventListener("input", calculate);
  input.addEventListener("change", calculate);
});
getElement("slider-safety-ac").addEventListener("input", () => {
  updateSafetyLabel();
  calculate();
});
getElement("slider-cos-phi").addEventListener("input", () => {
  updateCosPhiLabel();
  calculate();
});
document
  .querySelector("[data-add-human-row]")
  .addEventListener("click", addHumanRow);

renderHumanRows();
calculate();
