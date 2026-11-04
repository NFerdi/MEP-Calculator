window.waterBuildingProfiles = Object.freeze(
  [
    {
      id: "residential",
      name: "Rumah tinggal",
      consumption: 150,
      description: "Asumsi awal 150 L per penghuni per hari.",
    },
    {
      id: "office",
      name: "Kantor",
      consumption: 50,
      description: "Asumsi awal 50 L per pengguna per hari.",
    },
    {
      id: "school",
      name: "Sekolah",
      consumption: 40,
      description: "Asumsi awal 40 L per pengguna per hari.",
    },
    {
      id: "hotel",
      name: "Hotel",
      consumption: 250,
      description: "Asumsi awal 250 L per pengguna per hari.",
    },
    {
      id: "hospital",
      name: "Rumah sakit",
      consumption: 500,
      description: "Asumsi awal 500 L per pengguna per hari.",
    },
    {
      id: "restaurant",
      name: "Restoran",
      consumption: 20,
      description:
        "Asumsi awal 20 L per pengunjung per hari; sesuaikan dengan pekerja dan operasional.",
    },
  ].map((profile) => Object.freeze(profile)),
);

window.waterCalculatorUtils = Object.freeze({
  nonNegative(value) {
    return Math.max(0, Number(value) || 0);
  },

  format(value, maximumFractionDigits = 0) {
    return Number(value).toLocaleString("id-ID", {
      maximumFractionDigits,
    });
  },
});
