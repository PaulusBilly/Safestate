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

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showNotification("Please log in to view your properties", "warning");
    setTimeout(() => {
      window.location.href = "account.html";
    }, 2000);
    return;
  }

  await ensureUserPropertiesInitialized();

  if (typeof updateNavigation === "function") {
    updateNavigation();
  }

  const filterIcon = document.querySelector(".toggle-filter");
  const filterPanel = document.querySelector(".filter-panel");

  if (filterIcon && filterPanel) {
    filterIcon.addEventListener("click", () => {
      filterPanel.classList.toggle("show");
    });
  }

  await displayOwnedProperties();

  await displayRentedProperties();

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
  const ownedProperties = await getUserOwnedProperties();
  const container = document.getElementById("properties-container");
  const ownedCount = document.getElementById("ownedCount");

  if (ownedCount) {
    ownedCount.textContent = ownedProperties.length;
  }

  if (ownedProperties.length > 0) {
    const ownedSection = document.createElement("div");
    ownedSection.className = "properties-section";
    ownedSection.innerHTML = "<h2>Owned Properties</h2>";
    container.appendChild(ownedSection);

    const ownedGrid = document.createElement("div");
    ownedGrid.className = "properties-grid";
    ownedSection.appendChild(ownedGrid);

    ownedProperties.forEach((property) => {
      const card = createPropertyCard(property, "OWNED");
      ownedGrid.appendChild(card);
    });
  } else {
    const ownedSection = document.createElement("div");
    ownedSection.className = "properties-section";
    ownedSection.innerHTML = `
      <h2>Owned Properties</h2>
      <div class="empty-state">
        <p>You don't own any properties yet.</p>
        <a href="marketplace.html" class="cta-button">Browse Properties</a>
      </div>
    `;
    container.appendChild(ownedSection);
  }
}

async function displayRentedProperties() {
  const rentedProperties = await getUserRentedProperties();
  const container = document.getElementById("properties-container");
  const rentedCount = document.getElementById("rentedCount");

  if (rentedCount) {
    rentedCount.textContent = rentedProperties.length;
  }

  if (rentedProperties.length > 0) {
    const rentedSection = document.createElement("div");
    rentedSection.className = "properties-section";
    rentedSection.innerHTML = "<h2>Rented Properties</h2>";
    container.appendChild(rentedSection);

    const rentedGrid = document.createElement("div");
    rentedGrid.className = "properties-grid";
    rentedSection.appendChild(rentedGrid);

    rentedProperties.forEach((property) => {
      const card = createPropertyCard(property, "RENTED");
      rentedGrid.appendChild(card);
    });
  } else {
    const rentedSection = document.createElement("div");
    rentedSection.className = "properties-section";
    rentedSection.innerHTML = `
      <h2>Rented Properties</h2>
      <div class="empty-state">
        <p>You haven't rented any properties yet.</p>
        <a href="marketplace.html" class="cta-button">Browse Rentals</a>
      </div>
    `;
    container.appendChild(rentedSection);
  }
}

function createPropertyCard(property, status) {
  const card = document.createElement("div");
  card.className = "property-card";

  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    showPropertyOverlay(property);
  });

  let contractEndsIn = "";
  if (status === "RENTED") {
    const daysRemaining = Math.floor(Math.random() * 359) + 7;
    contractEndsIn = `<p class="contract">Contract ends in: ${daysRemaining} days</p>`;
  }

  let priceDisplay;
  if (status === "OWNED") {
    priceDisplay = formatRupiah(property.price);
  } else {
    priceDisplay = property.pricePerMonth
      ? `${formatRupiah(property.pricePerMonth)}/month`
      : formatRupiah(property.price);
  }

  card.innerHTML = `
    <!-- Status badge at top-left -->
    <div class="status-badge ${status}">${status}</div>
    
    <div class="property-image">
      <img src="${property.mainImage || "img/prop1.jpg"}" alt="${
    property.name
  }">
      <div class="property-meta">
        <span><i class="fa-solid fa-bed"></i> ${property.bedrooms || 0}</span>
        <span><i class="fa-solid fa-toilet"></i> ${
          property.bathrooms || 0
        }</span> 
      </div>
    </div>
    <div class="property-details">
      <h3 class="name">${property.name}</h3>
      <p class="location"><i class="fas fa-map-marker-alt"></i> ${
        property.location
      }</p>
      ${contractEndsIn}
      <p class="price">${priceDisplay}</p>
    </div>
  `;

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
