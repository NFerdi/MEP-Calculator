document.addEventListener("alpine:init", () => {
  Alpine.data("wastewaterCalculator", () => ({
    profiles: window.waterBuildingProfiles,
    buildingType: "residential",
    useProfileConsumption: true,
    occupants: 4,
    consumption: 150,
    wastewaterPercent: 80,
    peakFactor: 2.5,

    get selectedProfile() {
      return (
        this.profiles.find((profile) => profile.id === this.buildingType) ??
        this.profiles[0]
      );
    },

    get profileDescription() {
      return this.selectedProfile.description.replace(
        " L per ",
        " L air bersih per ",
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
