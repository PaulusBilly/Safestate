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

function updateNavigation() {
  const accountLink = document.querySelector(".cta a");
  if (!accountLink) return;

  if (isLoggedIn()) {
    accountLink.textContent = "Logout";
    accountLink.href = "#";
    accountLink.onclick = (e) => {
      e.preventDefault();
      logoutUser();
      updateNavigation();
      window.location.href = "index.html";
    };
  } else {
    accountLink.textContent = "Login";
    accountLink.href = "account.html";
    accountLink.onclick = null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavigation();
});

const propertiesLink = document.querySelector(
  '.navBar .nav-left a[href="properties.html"]'
);
if (propertiesLink) {
  propertiesLink.addEventListener("click", function (e) {
    if (!isLoggedIn()) {
      e.preventDefault();
      showNotification("Please log in to access your properties.", "warning");
    }
  });
}
