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
