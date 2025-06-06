function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const messageElement = notification.querySelector(".notification-message");

  messageElement.textContent = message;
  notification.className = `notification ${type}`;

  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    hideNotification();
  }, 5000);
}

function hideNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("show");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 300);
}

document.addEventListener("DOMContentLoaded", async function () {
  if (typeof updateNavigation === "function") {
    updateNavigation();
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "account.html";
    return;
  }

  await displayOwnedProperties();
  await displayRentedProperties();

  const filterIcon = document.querySelector(".toggle-filter");
  const filterPanel = document.querySelector(".filter-panel");

  if (filterIcon && filterPanel) {
    filterIcon.addEventListener("click", () => {
      filterPanel.classList.toggle("show");
    });
  }

  setupSearch();

  await updateFavoritesCount();
  const cartLinks = document.querySelectorAll(".cart-icon");
  cartLinks.forEach((cartLink) => {
    if (cartLink) {
      cartLink.href = "favorites.html";
    }
  });
});

async function displayOwnedProperties() {
  const container = document.getElementById("properties-container");
  if (!container) return;

  const ownedProperties = await getUserOwnedProperties();
  const ownedCount = document.getElementById("ownedCount");
  if (ownedCount) {
    animateNumber(ownedCount, ownedProperties.length);
  }

  ownedProperties.forEach((property) => {
    const card = createPropertyCard(property, "owned");
    container.appendChild(card);
  });
}

async function displayRentedProperties() {
  const container = document.getElementById("properties-container");
  if (!container) return;

  const rentedProperties = await getUserRentedProperties();
  const rentedCount = document.getElementById("rentedCount");
  if (rentedCount) {
    animateNumber(rentedCount, rentedProperties.length);
  }

  rentedProperties.forEach((property) => {
    const card = createPropertyCard(property, "rented");
    container.appendChild(card);
  });
}

function createPropertyCard(property, status) {
  const card = document.createElement("div");
  card.className = "property-card";
  card.innerHTML = `
    <img src="${property.image}" alt="${property.title}" />
    <div class="property-info">
      <h3>${property.title}</h3>
      <p class="location">${property.location}</p>
      <p class="price">Rp ${property.price.toLocaleString()}</p>
      <div class="property-details">
        <span><i class="fas fa-bed"></i> ${property.bedrooms} Beds</span>
        <span><i class="fas fa-bath"></i> ${property.bathrooms} Baths</span>
        <span><i class="fas fa-ruler-combined"></i> ${property.size} m²</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    showPropertyOverlay(property);
  });

  return card;
}

function setupSearch() {
  const searchInput = document.querySelector(".search-wrapper input");
  if (!searchInput) return;

  searchInput.addEventListener("input", async function () {
    const searchTerm = this.value.toLowerCase();
    const allProperties = await getAllUserProperties();
    const container = document.getElementById("properties-container");

    container.innerHTML = "";

    if (searchTerm.length === 0) {
      await displayOwnedProperties();
      await displayRentedProperties();
      return;
    }

    const filteredProperties = allProperties.filter((property) => {
      return (
        property.name.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm)
      );
    });

    const searchSection = document.createElement("div");
    searchSection.className = "properties-section";
    searchSection.innerHTML = `<h2>Search Results (${filteredProperties.length})</h2>`;
    container.appendChild(searchSection);

    const resultsGrid = document.createElement("div");
    resultsGrid.className = "properties-grid";
    searchSection.appendChild(resultsGrid);

    if (filteredProperties.length > 0) {
      filteredProperties.forEach((property) => {
        const status = property.status === "RENTED" ? "RENTED" : "OWNED";
        const card = createPropertyCard(property, status);
        resultsGrid.appendChild(card);
      });
    } else {
      resultsGrid.innerHTML = `
        <div class="empty-state">
          <p>No properties match your search.</p>
        </div>
      `;
    }
  });
}

function redirectToMarketplace() {
  const priceFilter = document.getElementById("marketplacePrice").value;
  const sizeFilter = document.getElementById("marketplaceSize").value;
  const typeFilter = document.getElementById("marketplaceType").value;
  const statusFilter = document.getElementById("marketplaceRentBuy").value;

  let filterParams = [];
  if (priceFilter && priceFilter !== "Price")
    filterParams.push(`price=${priceFilter}`);
  if (sizeFilter && sizeFilter !== "Size")
    filterParams.push(`size=${sizeFilter}`);
  if (typeFilter && typeFilter !== "Type")
    filterParams.push(`type=${typeFilter}`);
  if (statusFilter && statusFilter !== "Rent/Buy")
    filterParams.push(`status=${statusFilter}`);

  const queryString = filterParams.length ? "?" + filterParams.join("&") : "";
  window.location.href = "marketplace.html" + queryString;
}
