
async function addToFavorites(propertyId) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: 'You must be logged in to add favorites' };
  }
  
  const property = await getPropertyById(propertyId);
  if (!property) {
    return { success: false, message: 'Property not found' };
  }
  
  if (currentUser.favorites.includes(propertyId)) {
    return { success: false, message: 'Property already in favorites' };
  }
  
  currentUser.favorites.push(propertyId);
  
  return await updateUserProfile(currentUser.id, { favorites: currentUser.favorites });
}

async function removeFromFavorites(propertyId) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: 'You must be logged in to manage favorites' };
  }
  
  if (!currentUser.favorites.includes(propertyId)) {
    return { success: false, message: 'Property not in favorites' };
  }
  
  const updatedFavorites = currentUser.favorites.filter(id => id !== propertyId);
  
  return await updateUserProfile(currentUser.id, { favorites: updatedFavorites });
}

async function getFavoriteProperties() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return [];
  }
  
  const properties = await loadProperties();
  return properties.filter(property => currentUser.favorites.includes(property.id));
}

function isPropertyInFavorites(propertyId) {
  const currentUser = getCurrentUser();
  return currentUser && currentUser.favorites.includes(propertyId);
}

async function updateFavoritesCount() {
  const favoritesCount = document.getElementById('favoriteCount');
  if (favoritesCount) {
    const currentUser = getCurrentUser();
    const count = currentUser ? currentUser.favorites.length : 0;
    favoritesCount.textContent = count.toString();
  }
}