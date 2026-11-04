document.addEventListener("alpine:init", () => {
  const pages = [
    { id: "ac", label: "Kalkulator AC & MCB", icon: "❄️", file: "ac.html" },
    {
      id: "pencahayaan",
      label: "Kalkulator Cahaya",
      icon: "💡",
      file: "pencahayaan.html",
    },
    {
      id: "air-bersih",
      label: "Kalkulator Air Bersih",
      icon: "💧",
      file: "air_bersih.html",
    },
    {
      id: "air-kotor",
      label: "Kalkulator Air Kotor",
      icon: "♻️",
      file: "air_kotor.html",
    },
  ];
  const pageContentCache = new Map();

  Alpine.data("calculatorApp", () => ({
    pages,
    activePage: "ac",
    loading: true,
    error: "",
    mobileMenuOpen: false,
    loadRequestId: 0,

    init() {
      window.addEventListener("hashchange", () => {
        this.loadPage(this.getPageFromHash());
      });
      this.loadPage(this.getPageFromHash());
    },

    getPageFromHash() {
      const requestedPage = window.location.hash.slice(1);
      return this.pages.some((page) => page.id === requestedPage)
        ? requestedPage
        : "ac";
    },

    navigate(pageId) {
      if (!this.pages.some((page) => page.id === pageId)) return;
      if (window.location.hash === `#${pageId}`) {
        this.loadPage(pageId);
        return;
      }
      window.location.hash = pageId;
    },

    async loadPage(pageId) {
      const page = this.pages.find((item) => item.id === pageId);
      if (!page) {
        this.error = "Halaman kalkulator tidak ditemukan.";
        return;
      }

      const requestId = ++this.loadRequestId;
      this.activePage = pageId;
      this.mobileMenuOpen = false;
      this.loading = true;
      this.error = "";

      try {
        let documentText = pageContentCache.get(page.file);
        if (!documentText) {
          const response = await fetch(page.file);
          if (!response.ok) {
            throw new Error(`Gagal memuat ${page.file} (${response.status}).`);
          }
          documentText = await response.text();
          pageContentCache.set(page.file, documentText);
        }
        if (requestId !== this.loadRequestId) return;
        const pageDocument = new DOMParser().parseFromString(
          documentText,
          "text/html",
        );
        const pageMain = pageDocument.querySelector("main");
        if (!pageMain) {
          throw new Error(`Konten utama tidak ditemukan di ${page.file}.`);
        }

        this.$refs.pageContent.innerHTML = pageMain.innerHTML;
        document.title = `${page.label} | MEP Kalkulator`;
        this.$nextTick(() => {
          if (requestId !== this.loadRequestId) return;
          Alpine.initTree(this.$refs.pageContent);
          if (pageId === "ac") window.initAcCalculator();
          if (pageId === "pencahayaan") window.initLightingCalculator();
          this.loading = false;
        });
      } catch (error) {
        if (requestId !== this.loadRequestId) return;
        this.error =
          error instanceof TypeError
            ? "Halaman tidak dapat dimuat. Jalankan aplikasi melalui server lokal (misalnya Live Server), bukan dengan membuka file langsung."
            : error.message;
        this.loading = false;
      }
    },
  }));
});
