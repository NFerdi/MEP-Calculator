document.addEventListener("alpine:init", () => {
  Alpine.data("waterSupplyCalculator", () => ({
    profiles: window.waterBuildingProfiles,
    buildingType: "residential",
    useProfileConsumption: true,
    occupants: 4,
    consumption: 150,
    reservePercent: 20,

    get selectedProfile() {
      return (
        this.profiles.find((profile) => profile.id === this.buildingType) ??
        this.profiles[0]
      );
    },

    get dailyDemand() {
      return (
        window.waterCalculatorUtils.nonNegative(this.occupants) *
        window.waterCalculatorUtils.nonNegative(this.consumption)
      );
    },

    get monthlyDemand() {
      return this.dailyDemand * 30;
    },

    get recommendedTank() {
      return (
        this.dailyDemand *
        (1 + window.waterCalculatorUtils.nonNegative(this.reservePercent) / 100)
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
  }));
});
