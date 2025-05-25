// Property display functions

// Custom notification system
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const messageElement = notification.querySelector(".notification-message");

  // Set message and type
  messageElement.textContent = message;
  notification.className = `notification ${type}`;

  // Show notification
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Auto hide after 5 seconds
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

// Display properties in a container
async function displayProperties(containerId, filterOptions = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Container not found:", containerId);
    return;
  }

  // Clear container
  container.innerHTML = "";

  // Load properties
  let properties = await loadProperties();
  console.log("Loaded properties:", properties.length);

  // For marketplace, only show properties that are available for sale or rent
  // unless specific status filter is provided
  if (!filterOptions.status) {
    properties = properties.filter(
      (p) => p.status === "FOR_SALE" || p.status === "FOR_RENT"
    );
    console.log(
      "After marketplace filter (FOR_SALE/FOR_RENT):",
      properties.length
    );
  }

  // Apply filters
  if (filterOptions.status) {
    properties = properties.filter((p) => p.status === filterOptions.status);
    console.log("After status filter:", properties.length);
  }

  if (filterOptions.type) {
    properties = properties.filter((p) => p.type === filterOptions.type);
    console.log("After type filter:", properties.length);
  }

  if (filterOptions.minPrice) {
    properties = properties.filter((p) => p.price >= filterOptions.minPrice);
  }

  if (filterOptions.maxPrice) {
    properties = properties.filter((p) => p.price <= filterOptions.maxPrice);
  }

  if (filterOptions.bedrooms) {
    properties = properties.filter((p) => p.bedrooms >= filterOptions.bedrooms);
  }

  if (filterOptions.location) {
    properties = properties.filter((p) =>
      p.location.toLowerCase().includes(filterOptions.location.toLowerCase())
    );
  }

  // Sort properties
  if (filterOptions.sortBy === "price-low") {
    properties.sort((a, b) => a.price - b.price);
  } else if (filterOptions.sortBy === "price-high") {
    properties.sort((a, b) => b.price - a.price);
  }

  console.log("Final properties to display:", properties.length);

  // Create property cards
  properties.forEach((property) => {
    const propertyCard = createPropertyCard(property);
    container.appendChild(propertyCard);
  });

  // If no properties found
  if (properties.length === 0) {
    container.innerHTML =
      '<p class="no-results">No properties found matching your criteria.</p>';
  }
}

// Display user properties in a container
async function displayUserProperties(containerId, filterOptions = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading your properties...</p>
    </div>
  `;

  // Get current user
  const currentUser = getCurrentUser();
  if (!currentUser) {
    container.innerHTML =
      '<p class="no-results">Please login to view your properties.</p>';
    return;
  }

  // Initialize user property arrays if they don't exist
  if (!currentUser.ownedProperties) currentUser.ownedProperties = [];
  if (!currentUser.rentedProperties) currentUser.rentedProperties = [];

  // Load all properties
  let properties = await loadProperties();

  // Filter properties based on user ownership (only owned and rented)
  properties = properties.filter((property) => {
    const isOwned =
      currentUser.ownedProperties.includes(property.id) &&
      property.status === "OWNED";
    const isRented =
      currentUser.rentedProperties.includes(property.id) &&
      property.status === "RENTED";
    return isOwned || isRented;
  });

  // Apply additional filters from filterOptions
  if (filterOptions.type) {
    properties = properties.filter((p) => p.type === filterOptions.type);
  }

  if (filterOptions.status) {
    properties = properties.filter((p) => p.status === filterOptions.status);
  }

  if (filterOptions.location) {
    properties = properties.filter((p) =>
      p.location.toLowerCase().includes(filterOptions.location.toLowerCase())
    );
  }

  // Apply search filter
  if (filterOptions.search) {
    const searchTerm = filterOptions.search.toLowerCase();
    properties = properties.filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm)
    );
  }

  // Sort properties
  if (filterOptions.sortBy === "price-low") {
    properties.sort((a, b) => a.price - b.price);
  } else if (filterOptions.sortBy === "price-high") {
    properties.sort((a, b) => b.price - a.price);
  }

  // Clear container and add staggered animation
  container.innerHTML = "";

  // Update statistics
  updatePropertyStats(currentUser, properties);

  // Create property cards with staggered animation
  if (properties.length > 0) {
    properties.forEach((property, index) => {
      const propertyCard = createUserPropertyCard(property);
      propertyCard.style.opacity = "0";
      propertyCard.style.transform = "translateY(20px)";
      container.appendChild(propertyCard);

      // Staggered animation
      setTimeout(() => {
        propertyCard.style.transition =
          "opacity 0.5s ease, transform 0.5s ease";
        propertyCard.style.opacity = "1";
        propertyCard.style.transform = "translateY(0)";
      }, index * 100);
    });
  } else {
    container.innerHTML = `
      <div class="no-results">
        <h3>No Properties Found</h3>
        <p>You don't have any properties yet. Start your real estate journey by exploring our marketplace!</p>
        <a href="marketplace.html" class="marketplace-cta">
          <i class="fas fa-plus"></i>
          Browse Marketplace
        </a>
      </div>
    `;
  }
}

// Create a property card element
function createPropertyCard(property) {
  const card = document.createElement("div");
  card.className = "grid-item";
  card.setAttribute("data-property-id", property.id);

  // Format price
  const formattedPrice = formatRupiah(property.price);
  const formattedPricePerMonth = property.pricePerMonth
    ? formatRupiah(property.pricePerMonth) + "/month"
    : "";

  // Check if property is in favorites
  const isFavorite = isPropertyInFavorites(property.id);

  card.innerHTML = `
    <div class="favorite-banner ${isFavorite ? "liked" : ""}">
      <i class="fas fa-heart"></i>
    </div>
    <div class="grid-item-footer">
      <small>${property.location}</small>
      <strong>${property.name}</strong>
      <small>${
        property.status === "FOR_RENT" ? formattedPricePerMonth : formattedPrice
      }</small>
    </div>
  `;

  // Set background image
  card.style.backgroundImage = `url('${
    property.mainImage || "img/prop1.jpg"
  }')`;
  card.style.backgroundSize = "cover";
  card.style.backgroundPosition = "center";

  // Add click event to show overlay
  card.addEventListener("click", (e) => {
    // Don't trigger if clicking favorite button
    if (e.target.closest(".favorite-banner")) {
      e.stopPropagation();
      return;
    }
    showPropertyOverlay(property);
  });

  // Add click event for favorite button
  const favoriteBtn = card.querySelector(".favorite-banner");
  favoriteBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in first
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showNotification("Please log in to manage favorites", "warning");
      return;
    }

    const isFavorite = favoriteBtn.classList.contains("liked");

    try {
      if (isFavorite) {
        const result = await removeFromFavorites(property.id);
        if (result.success) {
          favoriteBtn.classList.remove("liked");
          await updateFavoritesCount();
          showNotification("Property removed from favorites", "success");

          // Update overlay button if overlay is open for this property
          const overlay = document.querySelector("#propertyOverlay");
          if (overlay && overlay.style.visibility === "visible") {
            const overlayBtn = overlay.querySelector(".add-to-favorites");
            if (overlayBtn) {
              overlayBtn.innerHTML =
                '<i class="fas fa-heart"></i> Add to Favorites';
              overlayBtn.classList.remove("favorited");
              overlayBtn.style.color = "";
            }
          }
        } else {
          showNotification(
            result.message || "Failed to remove from favorites",
            "error"
          );
        }
      } else {
        const result = await addToFavorites(property.id);
        if (result.success) {
          favoriteBtn.classList.add("liked");
          await updateFavoritesCount();
          showNotification("Property added to favorites", "success");

          // Update overlay button if overlay is open for this property
          const overlay = document.querySelector("#propertyOverlay");
          if (overlay && overlay.style.visibility === "visible") {
            const overlayBtn = overlay.querySelector(".add-to-favorites");
            if (overlayBtn) {
              overlayBtn.innerHTML =
                '<i class="fas fa-heart"></i> Remove from Favorites';
              overlayBtn.classList.add("favorited");
              overlayBtn.style.color = "#ff4757";
            }
          }
        } else {
          showNotification(
            result.message || "Failed to add to favorites",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      showNotification(
        "Failed to update favorites. Please try again.",
        "error"
      );
    }
  });

  return card;
}

// Create a user property card element (matching favorites page style exactly)
function createUserPropertyCard(property) {
  const card = document.createElement("div");
  card.className = "grid-item";
  card.setAttribute("data-property-id", property.id);

  // Format price
  const formattedPrice = formatRupiah(property.price);
  const formattedPricePerMonth = property.pricePerMonth
    ? formatRupiah(property.pricePerMonth) + "/month"
    : "";

  // Set background image
  card.style.backgroundImage = `url('${
    property.mainImage || "img/prop1.jpg"
  }')`;
  card.style.backgroundSize = "cover";
  card.style.backgroundPosition = "center";

  // Build the card HTML structure (exactly like favorites page)
  card.innerHTML = `
    <div class="grid-item-footer">
      <small>${property.location}</small>
      <strong>${property.name}</strong>
      <small>${
        property.status === "RENTED" ? formattedPricePerMonth : formattedPrice
      }</small>
    </div>
  `;

  // Add click event to show overlay
  card.addEventListener("click", (e) => {
    showPropertyOverlay(property);
  });

  return card;
}

// Update property statistics in the header
function updatePropertyStats(currentUser, allUserProperties) {
  if (!currentUser) return;

  const ownedCount = allUserProperties.filter(
    (p) => p.status === "OWNED"
  ).length;
  const rentedCount = allUserProperties.filter(
    (p) => p.status === "RENTED"
  ).length;

  // Update the DOM elements if they exist
  const ownedElement = document.getElementById("ownedCount");
  const rentedElement = document.getElementById("rentedCount");

  if (ownedElement) {
    animateNumber(ownedElement, ownedCount);
  }
  if (rentedElement) {
    animateNumber(rentedElement, rentedCount);
  }
}

// Animate number changes
function animateNumber(element, targetNumber) {
  const startNumber = parseInt(element.textContent) || 0;
  const increment = targetNumber > startNumber ? 1 : -1;
  const stepTime =
    Math.abs(Math.floor(300 / (targetNumber - startNumber))) || 50;

  let current = startNumber;
  const timer = setInterval(() => {
    current += increment;
    element.textContent = current;

    if (current === targetNumber) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Display property details
async function displayPropertyDetails(propertyId) {
  const property = await getPropertyById(propertyId);
  if (!property) {
    document.body.innerHTML = '<div class="error">Property not found</div>';
    return;
  }

  // Update page title
  document.title = `Safestate - ${property.name}`;

  // Format prices
  const formattedPrice = formatRupiah(property.price);
  const formattedPricePerMonth = property.pricePerMonth
    ? formatRupiah(property.pricePerMonth) + "/month"
    : "";

  // Update property details
  const nameElement = document.querySelector(".property-name");
  if (nameElement) nameElement.textContent = property.name;

  const locationElement = document.querySelector(".property-location");
  if (locationElement) locationElement.textContent = property.location;

  // Update status element if it exists
  const statusElement = document.querySelector(".status");
  if (statusElement) statusElement.textContent = property.status;

  // Update contract information if it exists
  const contractElement = document.querySelector(".contract");
  if (contractElement && property.contractEndDate) {
    const contractDate = new Date(property.contractEndDate);
    const today = new Date();
    const diffTime = contractDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      contractElement.textContent = `Contract ends in: ${diffDays} Days`;
    } else {
      contractElement.textContent = `Contract ends in: Expired`;
    }
  } else if (contractElement) {
    contractElement.textContent = "Contract ends in: –";
  }

  const priceElement = document.querySelector(".price");
  if (priceElement) {
    priceElement.textContent =
      property.status === "FOR_RENT" || property.status === "RENTED"
        ? formattedPricePerMonth
        : formattedPrice;
  }

  // Update specifications table
  const specTable = document.querySelector(
    ".property-details-tables table:first-child"
  );
  if (specTable && property.specifications) {
    let specHtml = "";
    specHtml += `<tr><th>Luas Tanah</th><td>${property.size.land} m²</td><th>Sertifikat</th><td>${property.specifications.certificate}</td></tr>`;
    specHtml += `<tr><th>Luas Bangunan</th><td>${property.size.building} m²</td><th>Listrik</th><td>${property.specifications.electricity}</td></tr>`;
    specHtml += `<tr><th>Jumlah Kamar Tidur</th><td>${property.bedrooms}</td><th>Jumlah Kamar Mandi</th><td>${property.bathrooms}</td></tr>`;
    specTable.innerHTML = specHtml;
  }

  // Update facilities table
  const facilityTable = document.querySelector(
    ".property-details-tables table:nth-child(4)"
  );
  if (facilityTable && property.facilities) {
    let facilityHtml = "";
    facilityHtml += `<tr><th>Swimming Pool</th><td>${
      property.facilities.swimmingPool ? "Yes" : "No"
    }</td><th>Gym</th><td>${property.facilities.gym ? "Yes" : "No"}</td></tr>`;
    facilityHtml += `<tr><th>Security 24/7</th><td>${
      property.facilities.security ? "Yes" : "No"
    }</td><th>Playground</th><td>${
      property.facilities.playground ? "Yes" : "No"
    }</td></tr>`;
    facilityHtml += `<tr><th>Parking</th><td>${
      property.facilities.parking ? "Yes" : "No"
    }</td><th>Internet</th><td>${
      property.facilities.internet ? "Yes" : "No"
    }</td></tr>`;
    facilityTable.innerHTML = facilityHtml;
  }

  // Update nearby attractions
  const nearbyTable = document.querySelector(
    ".property-details-tables table:nth-child(6)"
  );
  if (nearbyTable && property.nearbyAttractions) {
    let nearbyHtml = "";
    nearbyHtml += `<tr><th>Shopping Mall</th><td>${property.nearbyAttractions.shoppingMall}</td><th>Park</th><td>${property.nearbyAttractions.park}</td></tr>`;
    nearbyHtml += `<tr><th>Hospital</th><td>${property.nearbyAttractions.hospital}</td><th>School</th><td>${property.nearbyAttractions.school}</td></tr>`;
    nearbyHtml += `<tr><th>Train Station</th><td>${property.nearbyAttractions.trainStation}</td><th>Supermarket</th><td>${property.nearbyAttractions.supermarket}</td></tr>`;
    nearbyTable.innerHTML = nearbyHtml;
  }
}

function showPropertyOverlay(property) {
  const overlay = document.querySelector("#propertyOverlay");
  if (!overlay) return;

  // Update overlay content with property details
  const formattedPrice = formatRupiah(property.price);
  const formattedPricePerMonth = property.pricePerMonth
    ? formatRupiah(property.pricePerMonth) + "/month"
    : "";

  overlay.querySelector(".label").textContent =
    property.status === "FOR_RENT" ? "FOR RENT" : "FOR SALE";
  overlay.querySelector(".property-title").textContent = property.name;
  overlay.querySelector(".published-date").textContent = `Published on ${
    property.publishedDate || "N/A"
  }`;
  overlay.querySelector(".location").textContent = property.location;
  overlay.querySelector(".description").textContent =
    property.description || "No description available";
  overlay.querySelector(".price strong").textContent =
    property.status === "FOR_RENT" ? formattedPricePerMonth : formattedPrice;

  // Update agent image
  const agentPhoto = overlay.querySelector(".agent-photo");
  if (agentPhoto) {
    agentPhoto.src = property.agentImage || "img/agent.png";
  }

  // Update main image
  const mainImage = overlay.querySelector(".main-image");
  mainImage.src = property.mainImage || "img/prop1.jpg";
  mainImage.alt = property.name;

  // Update thumbnails
  const thumbnailContainer = overlay.querySelector(".image-thumbnails");
  if (thumbnailContainer && property.thumbnails) {
    thumbnailContainer.innerHTML = property.thumbnails
      .map((thumb) => `<img src="${thumb}" alt="${property.name} thumbnail" />`)
      .join("");
  }

  // Update specifications table
  const specTable = overlay.querySelector(".property-details-tables table");
  if (specTable) {
    specTable.innerHTML = `
      <tr><th>Land Size</th><td>${property.size.land} m²</td><th>Certificate</th><td>${property.specifications.certificate}</td></tr>
      <tr><th>Building Size</th><td>${property.size.building} m²</td><th>Electricity</th><td>${property.specifications.electricity}</td></tr>
      <tr><th>Property Type</th><td>${property.type}</td><th>Floors</th><td>${property.specifications.floors}</td></tr>
      <tr><th>Bedrooms</th><td>${property.bedrooms}</td><th>Bathrooms</th><td>${property.bathrooms}</td></tr>
    `;
  }

  // Update facilities table
  const facilitiesTable = overlay.querySelector(
    ".property-details-tables table:nth-child(4)"
  );
  if (facilitiesTable && property.facilities) {
    facilitiesTable.innerHTML = `
      <tr>
        <th>Swimming Pool</th><td>${
          property.facilities.swimmingPool ? "Yes" : "No"
        }</td>
        <th>Gym</th><td>${property.facilities.gym ? "Yes" : "No"}</td>
      </tr>
      <tr>
        <th>Security</th><td>${property.facilities.security ? "Yes" : "No"}</td>
        <th>Playground</th><td>${
          property.facilities.playground ? "Yes" : "No"
        }</td>
      </tr>
      <tr>
        <th>Parking</th><td>${property.facilities.parking ? "Yes" : "No"}</td>
        <th>Internet</th><td>${property.facilities.internet ? "Yes" : "No"}</td>
      </tr>
    `;
  }

  // Update nearby attractions table
  const nearbyTable = overlay.querySelector(
    ".property-details-tables table:nth-child(6)"
  );
  if (nearbyTable && property.nearbyAttractions) {
    nearbyTable.innerHTML = `
      <tr>
        <th>Shopping Mall</th><td>${property.nearbyAttractions.shoppingMall}</td>
        <th>Park</th><td>${property.nearbyAttractions.park}</td>
      </tr>
      <tr>
        <th>Hospital</th><td>${property.nearbyAttractions.hospital}</td>
        <th>School</th><td>${property.nearbyAttractions.school}</td>
      </tr>
      <tr>
        <th>Train Station</th><td>${property.nearbyAttractions.trainStation}</td>
        <th>Supermarket</th><td>${property.nearbyAttractions.supermarket}</td>
      </tr>
    `;
  }

  // Update Buy Now button with property ID and handle favorites
  const buyNowBtn = overlay.querySelector(".buy-now");
  const addToFavoritesBtn = overlay.querySelector(".add-to-favorites");

  // Check current page to determine behavior
  const currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "properties.html") {
    // Hide buttons on properties page
    if (addToFavoritesBtn) addToFavoritesBtn.style.display = "none";
    if (buyNowBtn) buyNowBtn.style.display = "none";
  } else {
    // Show buttons on marketplace and favorites pages
    if (addToFavoritesBtn) {
      addToFavoritesBtn.style.display = "flex";

      // Update favorites button state
      const isFavorited = isPropertyInFavorites(property.id);
      if (isFavorited) {
        addToFavoritesBtn.innerHTML =
          '<i class="fas fa-heart"></i>Remove from Favorites';
        addToFavoritesBtn.classList.add("favorited");
      } else {
        addToFavoritesBtn.innerHTML =
          '<i class="fas fa-heart"></i>Add to Favorites';
        addToFavoritesBtn.classList.remove("favorited");
      }

      // Remove any existing event listeners
      addToFavoritesBtn.replaceWith(addToFavoritesBtn.cloneNode(true));
      const newAddToFavoritesBtn = overlay.querySelector(".add-to-favorites");

      // Add new event listener
      newAddToFavoritesBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const currentUser = getCurrentUser();
        if (!currentUser) {
          showNotification("Please log in to manage favorites", "warning");
          return;
        }

        try {
          const isFavorited = isPropertyInFavorites(property.id);
          let result;

          if (isFavorited) {
            result = await removeFromFavorites(property.id);
            if (result.success) {
              newAddToFavoritesBtn.innerHTML =
                '<i class="fas fa-heart"></i>Add to Favorites';
              newAddToFavoritesBtn.classList.remove("favorited");
              await updateFavoritesCount();

              // Update property card if visible
              const propertyCard = document.querySelector(
                `[data-property-id="${property.id}"] .favorite-banner`
              );
              if (propertyCard) {
                propertyCard.classList.remove("liked");
              }

              // If we're on favorites page, remove the property from view
              if (currentPage === "favorites.html") {
                const gridItem = document.querySelector(
                  `[data-property-id="${property.id}"]`
                );
                if (gridItem) {
                  gridItem.classList.add("removing");
                  setTimeout(() => {
                    gridItem.remove();
                    // Check if no favorites left
                    const remainingFavorites =
                      document.querySelectorAll(".grid-item");
                    if (remainingFavorites.length === 0) {
                      const container = document.getElementById(
                        "favorites-container"
                      );
                      if (container) {
                        container.innerHTML =
                          '<p class="no-results">You have no favorite properties. Browse our <a href="marketplace.html">marketplace</a> to find properties you like.</p>';
                      }
                    }
                  }, 400);
                }
                closeOverlay();
              }
            } else {
              showNotification(
                result.message || "Failed to remove from favorites",
                "error"
              );
            }
          } else {
            result = await addToFavorites(property.id);
            if (result.success) {
              newAddToFavoritesBtn.innerHTML =
                '<i class="fas fa-heart"></i>Remove from Favorites';
              newAddToFavoritesBtn.classList.add("favorited");
              await updateFavoritesCount();

              // Update property card if visible
              const propertyCard = document.querySelector(
                `[data-property-id="${property.id}"] .favorite-banner`
              );
              if (propertyCard) {
                propertyCard.classList.add("liked");
              }
            } else {
              showNotification(
                result.message || "Failed to add to favorites",
                "error"
              );
            }
          }
        } catch (error) {
          console.error("Error managing favorites:", error);
          showNotification("An error occurred. Please try again.", "error");
        }
      });
    }

    if (buyNowBtn) {
      buyNowBtn.style.display = "flex";
      buyNowBtn.onclick = () => {
        window.location.href = `payment.html?id=${property.id}`;
      };
    }
  }

  // Show overlay
  overlay.classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeOverlay() {
  const overlay = document.querySelector("#propertyOverlay");
  if (!overlay) return;

  overlay.classList.remove("show");
  document.body.classList.remove("no-scroll");
}

// Add event listener for close button and click outside
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.querySelector(".close-overlay");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeOverlay);
  }

  // Add notification close button event listener
  const notificationCloseBtn = document.querySelector(".notification-close");
  if (notificationCloseBtn) {
    notificationCloseBtn.addEventListener("click", hideNotification);
  }

  // Add click outside to close overlay
  const overlay = document.querySelector("#propertyOverlay");
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      // Close if clicking the overlay background, not the content
      if (e.target === overlay) {
        closeOverlay();
      }
    });

    // Prevent closing when clicking inside the overlay content
    const overlayContent = overlay.querySelector(".overlay-content");
    if (overlayContent) {
      overlayContent.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }
});
