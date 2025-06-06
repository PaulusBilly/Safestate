document.addEventListener("DOMContentLoaded", () => {
  const faqQuestions = document.querySelectorAll(".faq-question");
  const categoryBtns = document.querySelectorAll(".category-btn");
  const searchInput = document.getElementById("faqSearch");
  const faqItems = document.querySelectorAll(".faq-item");
  const faqSections = document.querySelectorAll(".faq-section");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isActive = question.classList.contains("active");

      faqQuestions.forEach((q) => {
        q.classList.remove("active");
        q.nextElementSibling.classList.remove("active");
      });

      if (!isActive) {
        question.classList.add("active");
        answer.classList.add("active");
      }
    });
  });

  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      categoryBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (category === "all") {
        faqSections.forEach((section) => (section.style.display = "block"));
        faqItems.forEach((item) => (item.style.display = "block"));
      } else {
        faqSections.forEach((section) => {
          if (section.dataset.category === category) {
            section.style.display = "block";
          } else {
            section.style.display = "none";
          }
        });

        faqItems.forEach((item) => {
          if (item.dataset.category === category) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      }

      searchInput.value = "";
    });
  });

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    faqItems.forEach((item) => {
      const question = item
        .querySelector(".faq-question")
        .textContent.toLowerCase();
      const answer = item
        .querySelector(".faq-answer")
        .textContent.toLowerCase();

      if (question.includes(searchTerm) || answer.includes(searchTerm)) {
        item.style.display = "block";
        item.closest(".faq-section").style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    if (searchTerm) {
      faqSections.forEach((section) => {
        const visibleItems = section.querySelectorAll(
          '.faq-item[style*="block"]'
        );
        if (visibleItems.length === 0) {
          section.style.display = "none";
        }
      });

      categoryBtns.forEach((b) => b.classList.remove("active"));
      categoryBtns[0].classList.add("active");
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  });

  faqItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(item);
  });
});
