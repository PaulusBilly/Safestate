// User properties functionality

// Get user's owned properties
async function getUserOwnedProperties() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.ownedProperties) {
    return [];
  }

  const properties = await loadProperties();
  return properties.filter(
    (property) =>
      currentUser.ownedProperties.includes(property.id) &&
      property.status === "OWNED"
  );
}

// Get user's rented properties
async function getUserRentedProperties() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.rentedProperties) {
    return [];
  }

  const properties = await loadProperties();
  return properties.filter(
    (property) =>
      currentUser.rentedProperties.includes(property.id) &&
      property.status === "RENTED"
  );
}

// Get all user properties
async function getAllUserProperties() {
  const ownedProperties = await getUserOwnedProperties();
  const rentedProperties = await getUserRentedProperties();

  return [...ownedProperties, ...rentedProperties];
}

// Check if user owns a property
function isUserProperty(propertyId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;

  const owned =
    currentUser.ownedProperties &&
    currentUser.ownedProperties.includes(propertyId);
  const rented =
    currentUser.rentedProperties &&
    currentUser.rentedProperties.includes(propertyId);

  return owned || rented;
}

// Add property to user's owned properties
async function addToUserOwnedProperties(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to manage properties",
    };
  }

  // Initialize the array if it doesn't exist
  const ownedProperties = currentUser.ownedProperties || [];

  // Check if already owned
  if (ownedProperties.includes(propertyId)) {
    return { success: false, message: "Property already owned" };
  }

  // Add to owned properties
  ownedProperties.push(propertyId);

  // Update user
  return await updateUserProfile(currentUser.id, { ownedProperties });
}

// Add property to user's rented properties
async function addToUserRentedProperties(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to manage properties",
    };
  }

  // Initialize the array if it doesn't exist
  const rentedProperties = currentUser.rentedProperties || [];

  // Check if already rented
  if (rentedProperties.includes(propertyId)) {
    return { success: false, message: "Property already rented" };
  }

  // Add to rented properties
  rentedProperties.push(propertyId);

  // Update user
  return await updateUserProfile(currentUser.id, { rentedProperties });
}
