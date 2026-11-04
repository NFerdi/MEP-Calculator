document.addEventListener('alpine:init', () => {
  Alpine.data('wastewaterCalculator', () => ({
    profiles: window.waterBuildingProfiles,
    buildingType: 'residential',
    useProfileConsumption: true,
    occupants: 4,
    consumption: 150,
    wastewaterPercent: 80,
    peakFactor: 2.5,
    retentionDays: 3, // Waktu tinggal septic tank (hari) / Retention Time standar SNI

    get selectedProfile() {
      return (
        this.profiles.find((profile) => profile.id === this.buildingType) ??
        this.profiles[0]
      );
    },

    get profileDescription() {
      return this.selectedProfile.description.replace(
        ' L per ',
        ' L air bersih per ',
      );
    },

    get dailyCleanWater() {
      return (
        window.waterCalculatorUtils.nonNegative(this.occupants) *
        window.waterCalculatorUtils.nonNegative(this.consumption)
      );
    },

    get dailyWastewater() {
      return (
        this.dailyCleanWater *
        (window.waterCalculatorUtils.nonNegative(this.wastewaterPercent) / 100)
      );
    },

    get monthlyWastewater() {
      return this.dailyWastewater * 30;
    },

    get peakFlow() {
      return (
        (this.dailyWastewater *
          window.waterCalculatorUtils.nonNegative(this.peakFactor)) /
        86400
      );
    },

    // --- PERHITUNGAN SEPTIC TANK & DIMENSI LAPANGAN ---
    get septicVolume() {
      return (
        this.dailyWastewater *
        window.waterCalculatorUtils.nonNegative(this.retentionDays)
      ); // Total Liter
    },

    get septicVolumeM3() {
      return this.septicVolume / 1000; // Total m3
    },

    // Rekomendasi Dimensi Bersih Lapangan (Asumsi Kedalaman Efektif Air 1.2 Meter)
    get septicDimensions() {
      let volM3 = this.septicVolumeM3;
      // Batasi volume minimal praktis di lapangan (misal min 0.8 m3 / 800L agar nyaman dikerjakan)
      if (volM3 < 0.8) volM3 = 0.8;

      let depth = 1.2; // Kedalaman efektif air (meter)
      let surfaceArea = volM3 / depth; // Luas penampang (m2)

      // Asumsi rasio perbandingan panjang : lebar = 2 : 1
      let width = Math.sqrt(surfaceArea / 2);
      let length = width * 2;

      // Pembulatan rapi ke kelipatan 5 cm terdekat (0.05m)
      length = Math.max(1.0, Math.ceil(length * 20) / 20);
      width = Math.max(0.6, Math.ceil(width * 20) / 20);
      depth = 1.2;

      let actualVol = length * width * depth;

      return {
        length: length.toFixed(2),
        width: width.toFixed(2),
        depth: depth.toFixed(2),
        actualCapacity: Math.round(actualVol * 1000),
      };
    },

    applyProfile() {
      if (this.useProfileConsumption) {
        this.consumption = this.selectedProfile.consumption;
      }
    },

    toggleProfileConsumption() {
      if (this.useProfileConsumption) this.applyProfile();
    },

    format(value) {
      return window.waterCalculatorUtils.format(Math.round(value));
    },

    formatCubic(value) {
      return window.waterCalculatorUtils.format(value / 1000, 2);
    },

    formatFlow(value) {
      return window.waterCalculatorUtils.format(value, 3);
    },
  }));
});
