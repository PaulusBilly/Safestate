async function registerUser(username, email, password, age, city) {
  const users = await loadUsers();

  if (users.some((user) => user.email === email)) {
    return { success: false, message: "Email already registered" };
  }

  const newUser = {
    id: "user-" + (users.length + 1).toString().padStart(3, "0"),
    username,
    email,
    password,
    age,
    city,
    favorites: [],
    ownedProperties: [],
    rentedProperties: [],
  };

  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));

  return { success: true, user: newUser };
}

async function loginUser(email, password) {
  const users = await loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    return { success: true, user };
  } else {
    return { success: false, message: "Invalid email or password" };
  }
}

function getCurrentUser() {
  const userJson = sessionStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

function logoutUser() {
  sessionStorage.removeItem("currentUser");
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

async function updateUserProfile(userId, updates) {
  const users = await loadUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }

  users[userIndex] = { ...users[userIndex], ...updates };

  localStorage.setItem("users", JSON.stringify(users));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    sessionStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
  }

  return { success: true, user: users[userIndex] };
}

// Add property to user's owned properties when purchased
async function addPropertyToUser(userId, propertyId, propertyType = "owned") {
  const users = await loadUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }

  const user = users[userIndex];

  // Initialize arrays if they don't exist
  if (!user.ownedProperties) user.ownedProperties = [];
  if (!user.rentedProperties) user.rentedProperties = [];

  // Add property to appropriate array
  if (propertyType === "owned" && !user.ownedProperties.includes(propertyId)) {
    user.ownedProperties.push(propertyId);
  } else if (
    propertyType === "rented" &&
    !user.rentedProperties.includes(propertyId)
  ) {
    user.rentedProperties.push(propertyId);
  }

  // Update users in localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Update current session
  sessionStorage.setItem("currentUser", JSON.stringify(user));

  return { success: true, user };
}

// Remove property from user's properties
async function removePropertyFromUser(userId, propertyId) {
  const users = await loadUsers();
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }

  const user = users[userIndex];

  // Remove from both arrays
  if (user.ownedProperties) {
    user.ownedProperties = user.ownedProperties.filter(
      (id) => id !== propertyId
    );
  }
  if (user.rentedProperties) {
    user.rentedProperties = user.rentedProperties.filter(
      (id) => id !== propertyId
    );
  }

  // Update users in localStorage
  localStorage.setItem("users", JSON.stringify(users));

  // Update current session
  sessionStorage.setItem("currentUser", JSON.stringify(user));

  return { success: true, user };
}

document.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.querySelector(".sign-up-container form");
  const signInForm = document.querySelector(".sign-in-container form");
  if (!signUpForm && !signInForm) return;

  if (signUpForm) {
    signUpForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = signUpForm
        .querySelector('input[placeholder="Username"]')
        .value.trim();
      const email = signUpForm
        .querySelector('input[type="email"]')
        .value.trim();
      const password = signUpForm.querySelector('input[type="password"]').value;
      const age = parseInt(
        signUpForm.querySelector('input[name="age"]').value,
        10
      );
      const city = signUpForm.querySelector('input[name="city"]').value.trim();

      if (isNaN(age) || age < 18) {
        alert("You must be at least 18 years old to register.");
        return;
      }

      const result = await registerUser(username, email, password, age, city);

      if (result.success) {
        alert("Registration successful! Please sign in.");
        const signInBtn = document.getElementById("signIn");
        if (signInBtn) signInBtn.click();
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    });
  }

  if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = signInForm
        .querySelector('input[type="email"]')
        .value.trim();
      const password = signInForm.querySelector('input[type="password"]').value;

      const result = await loginUser(email, password);

      if (result.success) {
        window.location.href = "index.html";
      } else {
        alert(result.message || "Login failed. Please check your credentials.");
      }
    });
  }
});
