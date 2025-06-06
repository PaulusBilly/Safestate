document.addEventListener("DOMContentLoaded", async () => {
  await updateFavoritesCount();
  const cartLinks = document.querySelectorAll(".cart-icon");
  cartLinks.forEach((cartLink) => {
    if (cartLink) {
      cartLink.href = "favorites.html";
    }
  });
});
