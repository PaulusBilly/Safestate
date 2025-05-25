window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navigation");
  const navBar = document.querySelector(".navBar");
  const navTop = nav.offsetTop;

  if (window.scrollY >= navTop) {
    navBar.classList.add("sticky-full");
  } else {
    navBar.classList.remove("sticky-full");
  }
});

// Update navigation based on login status
function updateNavigation() {
  const accountLink = document.querySelector(".cta a");
  if (!accountLink) return;

  if (isLoggedIn()) {
    accountLink.textContent = "Logout";
    accountLink.href = "#";
    accountLink.onclick = (e) => {
      e.preventDefault();
      logoutUser();
      updateNavigation(); // Update nav after logout
      window.location.href = "index.html";
    };
  } else {
    accountLink.textContent = "Login";
    accountLink.href = "account.html";
    accountLink.onclick = null;
  }
}

// Initialize navigation on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
});
