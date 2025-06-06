async function loadProperties() {
  try {
    console.log("Loading properties from data/properties.json");
    const response = await fetch("data/properties.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Successfully loaded properties:", data.length);
    return data;
  } catch (error) {
    console.error("Error loading properties:", error);
    return [];
  }
}

async function loadUsers() {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }

  try {
    const response = await fetch("data/users.json");
    const data = await response.json();
    localStorage.setItem("users", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

async function getPropertyById(propertyId) {
  const properties = await loadProperties();
  return properties.find(
    (property) =>
      property.id === propertyId || property.id === String(propertyId)
  );
}

async function getPropertiesByStatus(status) {
  const properties = await loadProperties();
  return properties.filter((property) => property.status === status);
}

// Formats a number into Indonesian Rupiah currency format
function formatRupiah(amount) {
  return "Rp" + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
