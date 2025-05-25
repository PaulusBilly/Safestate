async function getUserOwnedProperties() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.ownedProperties) {
    return [];
  }

  const properties = await loadProperties();
  return properties.filter((property) =>
    currentUser.ownedProperties.includes(property.id)
  );
}

async function getUserRentedProperties() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.rentedProperties) {
    return [];
  }

  const properties = await loadProperties();
  return properties.filter((property) =>
    currentUser.rentedProperties.includes(property.id)
  );
}

async function getAllUserProperties() {
  const ownedProperties = await getUserOwnedProperties();
  const rentedProperties = await getUserRentedProperties();

  return [...ownedProperties, ...rentedProperties];
}

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

async function addToUserOwnedProperties(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to manage properties",
    };
  }

  const ownedProperties = currentUser.ownedProperties || [];

  if (ownedProperties.includes(propertyId)) {
    return { success: false, message: "Property already owned" };
  }

  ownedProperties.push(propertyId);

  return await updateUserProfile(currentUser.id, { ownedProperties });
}

async function addToUserRentedProperties(propertyId) {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You must be logged in to manage properties",
    };
  }

  const rentedProperties = currentUser.rentedProperties || [];

  if (rentedProperties.includes(propertyId)) {
    return { success: false, message: "Property already rented" };
  }

  rentedProperties.push(propertyId);

  return await updateUserProfile(currentUser.id, { rentedProperties });
}

async function ensureUserPropertiesInitialized() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  if (!currentUser.ownedProperties) {
    currentUser.ownedProperties = [];
    await updateUserProfile(currentUser.id, {
      ownedProperties: currentUser.ownedProperties,
    });
  }

  if (!currentUser.boughtProperties) {
    currentUser.boughtProperties = [];
    await updateUserProfile(currentUser.id, {
      boughtProperties: currentUser.boughtProperties,
    });
  }

  if (!currentUser.rentedProperties) {
    currentUser.rentedProperties = [];
    await updateUserProfile(currentUser.id, {
      rentedProperties: currentUser.rentedProperties,
    });
  }
}
