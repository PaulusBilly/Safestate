async function addToFavorites(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to add favorites",
    };
  }

  const property = await getPropertyById(propertyId);
  if (!property) {
    return { success: false, message: "Property not found" };
  }

  if (currentUser.favorites.includes(propertyId)) {
    return { success: false, message: "Property already in favorites" };
  }

  currentUser.favorites.push(propertyId);

  return await updateUserProfile(currentUser.id, {
    favorites: currentUser.favorites,
  });
}

async function removeFromFavorites(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to manage favorites",
    };
  }

  if (!currentUser.favorites.includes(propertyId)) {
    return { success: false, message: "Property not in favorites" };
  }

  const updatedFavorites = currentUser.favorites.filter(
    (id) => id !== propertyId
  );

  return await updateUserProfile(currentUser.id, {
    favorites: updatedFavorites,
  });
}

async function getFavoriteProperties() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return [];
  }

  const properties = await loadProperties();
  return properties.filter((property) =>
    currentUser.favorites.includes(property.id)
  );
}

function isPropertyInFavorites(propertyId) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.favorites.includes(propertyId);
}

async function updateFavoritesCount() {
  const favoritesCount = document.getElementById("favoriteCount");
  if (favoritesCount) {
    const currentUser = getCurrentUser();
    const count = currentUser ? currentUser.favorites.length : 0;
    favoritesCount.textContent = count.toString();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await updateFavoritesCount();
  const cartLinks = document.querySelectorAll(".cart-icon");
  cartLinks.forEach((cartLink) => {
    if (cartLink) {
      cartLink.href = "favorites.html";
    }
  });

  // Only run the favorites list logic on favorites.html
  if (window.location.pathname.split("/").pop() !== "favorites.html") {
    return;
  }

  let favoritesContainer = document.getElementById("favorites-container");
  if (!favoritesContainer) {
    favoritesContainer = document.createElement("div");
    favoritesContainer.id = "favorites-container";
    favoritesContainer.className = "properties-grid";
    document.body.appendChild(favoritesContainer);
  }
  const favoriteProperties = await getFavoriteProperties();
  if (favoriteProperties.length === 0) {
    favoritesContainer.innerHTML =
      '<p class="no-results">You have no favorite properties. Browse our <a href="marketplace.html">marketplace</a> to find properties you like.</p>';
  } else {
    favoriteProperties.forEach((property) => {
      const propertyCard = createPropertyCard(property);
      favoritesContainer.appendChild(propertyCard);
    });
  }
});
