// Search and Filter functionality
class SearchAndFilter {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.currentFilters = {
      search: "",
      price: "",
      size: "",
      type: "",
      rentBuy: "",
    };
  }

  initializeElements() {
    this.toggleBtn = document.querySelector(".toggle-filter");
    this.filterIcon = document.querySelector(".filter-icon");
    this.filterPanel = document.querySelector(".filter-panel");
    this.applyBtn = document.querySelector(".apply-filter");
    this.searchInput = document.querySelector(".search-wrapper input");
    this.searchIcon = document.querySelector(".search-icon");

    // Filter dropdowns
    this.priceSelect = document.querySelector(
      ".filter-panel select:nth-of-type(1)"
    );
    this.sizeSelect = document.querySelector(
      ".filter-panel select:nth-of-type(2)"
    );
    this.typeSelect = document.querySelector(
      ".filter-panel select:nth-of-type(3)"
    );
    this.rentBuySelect = document.querySelector(
      ".filter-panel select:nth-of-type(4)"
    );
  }

  attachEventListeners() {
    // Filter panel toggle
    if (this.filterIcon) {
      this.filterIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        this.filterPanel.classList.toggle("active");
      });
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.filterPanel.classList.toggle("active");
      });
    }

    // Close filter panel when clicking outside
    document.addEventListener("click", (event) => {
      if (
        this.filterPanel &&
        !this.filterPanel.contains(event.target) &&
        !this.toggleBtn?.contains(event.target) &&
        !this.filterIcon?.contains(event.target)
      ) {
        this.filterPanel.classList.remove("active");
      }
    });

    // Prevent filter panel from closing when clicking inside
    if (this.filterPanel) {
      this.filterPanel.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    // Search functionality
    if (this.searchInput) {
      this.searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.performSearch();
        }
      });
    }

    if (this.searchIcon) {
      this.searchIcon.addEventListener("click", () => {
        this.performSearch();
      });
    }

    // Apply filter button
    if (this.applyBtn) {
      this.applyBtn.addEventListener("click", () => {
        this.applyFilters();
      });
    }

    // Real-time filter updates
    if (this.priceSelect) {
      this.priceSelect.addEventListener("change", () => {
        this.currentFilters.price = this.priceSelect.value;
      });
    }

    if (this.sizeSelect) {
      this.sizeSelect.addEventListener("change", () => {
        this.currentFilters.size = this.sizeSelect.value;
      });
    }

    if (this.typeSelect) {
      this.typeSelect.addEventListener("change", () => {
        this.currentFilters.type = this.typeSelect.value;
      });
    }

    if (this.rentBuySelect) {
      this.rentBuySelect.addEventListener("change", () => {
        this.currentFilters.rentBuy = this.rentBuySelect.value;
      });
    }
  }

  performSearch() {
    if (this.searchInput) {
      this.currentFilters.search = this.searchInput.value.trim();
    }
    this.navigateToMarketplace();
  }

  applyFilters() {
    this.filterPanel.classList.remove("active");
    this.navigateToMarketplace();
  }

  navigateToMarketplace() {
    const currentPage = window.location.pathname.split("/").pop();

    // Create URL with search parameters
    const params = new URLSearchParams();

    if (this.currentFilters.search) {
      params.set("search", this.currentFilters.search);
    }
    if (this.currentFilters.price) {
      params.set("price", this.currentFilters.price);
    }
    if (this.currentFilters.size) {
      params.set("size", this.currentFilters.size);
    }
    if (this.currentFilters.type) {
      params.set("type", this.currentFilters.type);
    }
    if (this.currentFilters.rentBuy) {
      params.set("rentBuy", this.currentFilters.rentBuy);
    }

    const queryString = params.toString();

    // Always redirect to marketplace, never filter in place on properties page
    if (currentPage !== "marketplace.html") {
      // If we're not on marketplace.html, navigate there
      window.location.href = `marketplace.html${
        queryString ? "?" + queryString : ""
      }`;
    } else {
      // If we're already on marketplace, just update the URL and filter
      const newUrl = `${window.location.pathname}${
        queryString ? "?" + queryString : ""
      }`;
      window.history.pushState({}, "", newUrl);
      this.filterPropertiesOnPage();
    }
  }

  async filterPropertiesOnPage() {
    // Only filter if we're on marketplace page
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "marketplace.html") return;

    const container = document.getElementById("grid-container");
    if (!container) return;

    try {
      // Load all properties
      let properties = await loadProperties();

      // Apply search filter
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search.toLowerCase();
        properties = properties.filter(
          (property) =>
            property.name.toLowerCase().includes(searchTerm) ||
            property.location.toLowerCase().includes(searchTerm) ||
            property.description.toLowerCase().includes(searchTerm)
        );
      }

      // Apply price filter
      if (this.currentFilters.price) {
        if (this.currentFilters.price === "low") {
          properties.sort((a, b) => a.price - b.price);
        } else if (this.currentFilters.price === "high") {
          properties.sort((a, b) => b.price - a.price);
        }
      }

      // Apply size filter
      if (this.currentFilters.size) {
        if (this.currentFilters.size === "smallest") {
          properties.sort((a, b) => a.size.building - b.size.building);
        } else if (this.currentFilters.size === "largest") {
          properties.sort((a, b) => b.size.building - a.size.building);
        }
      }

      // Apply type filter
      if (this.currentFilters.type) {
        properties = properties.filter(
          (property) =>
            property.type.toLowerCase() ===
            this.currentFilters.type.toLowerCase()
        );
      }

      // Apply rent/buy filter
      if (this.currentFilters.rentBuy) {
        if (this.currentFilters.rentBuy === "rent") {
          properties = properties.filter(
            (property) => property.status === "FOR_RENT"
          );
        } else if (this.currentFilters.rentBuy === "buy") {
          properties = properties.filter(
            (property) => property.status === "FOR_SALE"
          );
        }
      }

      // Clear container and display filtered properties
      container.innerHTML = "";

      if (properties.length === 0) {
        container.innerHTML =
          '<p class="no-results">No properties found matching your criteria. <a href="marketplace.html">Clear filters</a> to see all properties.</p>';
      } else {
        properties.forEach((property) => {
          const propertyCard = createPropertyCard(property);
          container.appendChild(propertyCard);
        });
      }
    } catch (error) {
      console.error("Error filtering properties:", error);
      container.innerHTML =
        '<p class="error">Error loading properties. Please try again.</p>';
    }
  }

  // Load filters from URL parameters
  loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    this.currentFilters.search = urlParams.get("search") || "";
    this.currentFilters.price = urlParams.get("price") || "";
    this.currentFilters.size = urlParams.get("size") || "";
    this.currentFilters.type = urlParams.get("type") || "";
    this.currentFilters.rentBuy = urlParams.get("rentBuy") || "";

    // Update UI elements with loaded filters
    if (this.searchInput && this.currentFilters.search) {
      this.searchInput.value = this.currentFilters.search;
    }

    if (this.priceSelect && this.currentFilters.price) {
      this.priceSelect.value = this.currentFilters.price;
    }

    if (this.sizeSelect && this.currentFilters.size) {
      this.sizeSelect.value = this.currentFilters.size;
    }

    if (this.typeSelect && this.currentFilters.type) {
      this.typeSelect.value = this.currentFilters.type;
    }

    if (this.rentBuySelect && this.currentFilters.rentBuy) {
      this.rentBuySelect.value = this.currentFilters.rentBuy;
    }
  }
}

// Overlay functions (keep existing functionality)
function openOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.classList.add("show");
  }
}

function closeOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.classList.remove("show");
  }
}

// Initialize search and filter when DOM is loaded
let searchAndFilter;

document.addEventListener("DOMContentLoaded", () => {
  searchAndFilter = new SearchAndFilter();

  // Load filters from URL and apply them based on current page
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "marketplace.html") {
    searchAndFilter.loadFiltersFromURL();
    // Apply filters after properties are loaded
    setTimeout(() => {
      searchAndFilter.filterPropertiesOnPage();
    }, 100);
  }
});
