// Payment calculation functions

// Custom notification system
function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const messageElement = notification.querySelector(".notification-message");

  // Set message and type
  messageElement.textContent = message;
  notification.className = `notification ${type}`;

  // Show notification
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Auto hide after 5 seconds
  setTimeout(() => {
    hideNotification();
  }, 5000);
}

function hideNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("show");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 300);
}

// Initialize payment page
async function initializePaymentPage() {
  // Get property ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("id");

  if (!propertyId) {
    showNotification(
      "No property selected. Redirecting to marketplace...",
      "error"
    );
    setTimeout(() => {
      window.location.href = "marketplace.html";
    }, 2000);
    return;
  }

  // Get property details
  const property = await getPropertyById(propertyId);
  if (!property) {
    showNotification(
      "Property not found. Redirecting to marketplace...",
      "error"
    );
    setTimeout(() => {
      window.location.href = "marketplace.html";
    }, 2000);
    return;
  }

  // Update property info in payment page
  const propertyNameElement = document.querySelector(".property-name");
  if (propertyNameElement) propertyNameElement.textContent = property.name;

  const propertyLocationElement = document.querySelector(".property-location");
  if (propertyLocationElement)
    propertyLocationElement.textContent = property.location;

  const propertyPriceElement = document.querySelector(".property-price strong");
  if (propertyPriceElement)
    propertyPriceElement.textContent = formatRupiah(property.price);

  // Update property images
  const propertyImageElement = document.querySelector(".property-image");
  if (propertyImageElement) {
    propertyImageElement.src = property.mainImage || "img/prop1.jpg";
    propertyImageElement.alt = property.name;
  }

  // Update thumbnails
  const thumbnails = document.querySelectorAll(".thumbnail");
  if (property.thumbnails && property.thumbnails.length > 0) {
    thumbnails.forEach((thumbnail, index) => {
      if (property.thumbnails[index]) {
        thumbnail.src = property.thumbnails[index];
        thumbnail.alt = `${property.name} thumbnail ${index + 1}`;
        thumbnail.addEventListener("click", () => {
          propertyImageElement.src = property.thumbnails[index];
        });
      }
    });
  }

  // Set property price
  const propertyPrice = property.price;
  const formattedPrice = formatRupiah(propertyPrice);

  // Update down payment calculation display
  const dpCalculation = document.querySelector(
    "#downPaymentDetails .calculation p:nth-child(2)"
  );
  if (dpCalculation) {
    const downPaymentAmount = Math.floor(propertyPrice * 0.2);
    dpCalculation.innerHTML = `20% x ${formattedPrice} → <strong>${formatRupiah(
      downPaymentAmount
    )}</strong>`;
  }
  // Dynamically set down payment option labels
  const downGroup = document.querySelector("#downPaymentDetails .option-group");
  if (downGroup) {
    const dpLabels = downGroup.querySelectorAll("label");
    if (dpLabels.length >= 3) {
      const fullAmt = Math.floor(propertyPrice * 0.2);
      dpLabels[0].innerHTML = `<input type=\"radio\" name=\"dpAmount\" value=\"full\" /> Full Payment - ${formatRupiah(
        fullAmt
      )}`;
      const amt3x = Math.floor((propertyPrice * 0.2) / 3);
      dpLabels[1].innerHTML = `<input type=\"radio\" name=\"dpAmount\" value=\"3x\" /> 3x Installments - ${formatRupiah(
        amt3x
      )} each`;
      const amt5x = Math.floor((propertyPrice * 0.2) / 5);
      dpLabels[2].innerHTML = `<input type=\"radio\" name=\"dpAmount\" value=\"5x\" /> 5x Installments - ${formatRupiah(
        amt5x
      )} each`;
    }
  }

  // Update UTJ amount
  const utjAmount = document.querySelector(".utj-amount");
  if (utjAmount) {
    utjAmount.textContent = formatRupiah(20000000);
  }

  // Add event listeners for payment options
  setupPaymentListeners(propertyPrice);

  // Setup notification close button
  const notificationClose = document.querySelector(".notification-close");
  if (notificationClose) {
    notificationClose.addEventListener("click", hideNotification);
  }
}

// Setup payment option listeners
function setupPaymentListeners(propertyPrice) {
  const downPaymentRadio = document.querySelectorAll(
    'input[name="payment"]'
  )[0];
  const tandaJadiRadio = document.querySelectorAll('input[name="payment"]')[1];
  const downPaymentDetails = document.getElementById("downPaymentDetails");
  const utjDetails = document.getElementById("utjDetails");
  const totalPaymentElement = document.querySelector(".payment-summary strong");
  const remainingAmountElement = document.querySelector(".remaining-amount");

  // Down payment amount options
  const dpAmountOptions = document.querySelectorAll('input[name="dpAmount"]');

  // Down payment method options
  const dpMethodOptions = document.querySelectorAll('input[name="dpMethod"]');

  // Initialize selected options
  let selectedPayment = null;
  let selectedDpAmount = null;
  let selectedDpMethod = null;

  // Update total payment and remaining amount
  function updateTotalPayment() {
    let totalAmount = 0;
    let remainingAmount = propertyPrice;

    if (selectedPayment === "downPayment") {
      if (selectedDpAmount === "full") {
        totalAmount = Math.floor(propertyPrice * 0.2); // Using floor to avoid decimals
      } else if (selectedDpAmount === "3x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 3); // Using floor to avoid decimals
      } else if (selectedDpAmount === "5x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 5); // Using floor to avoid decimals
      }
      remainingAmount = propertyPrice - Math.floor(propertyPrice * 0.2);
    } else if (selectedPayment === "utj") {
      totalAmount = 20000000; // Fixed UTJ amount
      remainingAmount = propertyPrice - 20000000;
    }

    if (totalPaymentElement) {
      totalPaymentElement.textContent = formatRupiah(totalAmount);
    }

    if (remainingAmountElement) {
      remainingAmountElement.textContent = formatRupiah(remainingAmount);
    }

    // Update receipt amount (find the last readonly input which should be the amount)
    const receiptInputs = document.querySelectorAll(
      ".receipt-form input[readonly]"
    );
    const receiptAmount = receiptInputs[receiptInputs.length - 1];
    if (receiptAmount) {
      receiptAmount.value = formatRupiah(totalAmount);
    }

    // Update success message amount
    const successAmount = document.querySelector(".success-container p strong");
    if (successAmount) {
      successAmount.textContent = formatRupiah(totalAmount);
    }
  }

  // Down payment radio
  downPaymentRadio.addEventListener("click", () => {
    if (selectedPayment === "downPayment") {
      downPaymentRadio.checked = false;
      downPaymentDetails.classList.add("hidden");
      selectedPayment = null;
    } else {
      downPaymentDetails.classList.remove("hidden");
      utjDetails.classList.add("hidden");
      selectedPayment = "downPayment";
    }
    updateTotalPayment();
  });

  // Tanda Jadi radio
  tandaJadiRadio.addEventListener("click", () => {
    if (selectedPayment === "utj") {
      tandaJadiRadio.checked = false;
      utjDetails.classList.add("hidden");
      selectedPayment = null;
    } else {
      utjDetails.classList.remove("hidden");
      downPaymentDetails.classList.add("hidden");
      selectedPayment = "utj";
    }
    updateTotalPayment();
  });

  // Down payment amount options
  dpAmountOptions.forEach((option) => {
    option.addEventListener("change", () => {
      selectedDpAmount = option.value;
      updateTotalPayment();
    });
  });

  // Down payment method options
  dpMethodOptions.forEach((option) => {
    option.addEventListener("change", () => {
      selectedDpMethod = option.value;
      // Enable continue button if both amount and method are selected
      const continueButton = document.querySelector(".continue-button");
      if (continueButton && selectedDpAmount && selectedDpMethod) {
        continueButton.disabled = false;
      }
    });
  });

  // Continue button
  const continueButton = document.querySelector(".continue-button");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!selectedPayment) {
        showNotification("Please select a payment option", "warning");
        return;
      }

      if (
        selectedPayment === "downPayment" &&
        (!selectedDpAmount || !selectedDpMethod)
      ) {
        showNotification(
          "Please select both payment amount and method",
          "warning"
        );
        return;
      }

      // Show payment overlay
      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.remove("hidden");
      }
    });
  }

  // Cancel button
  const cancelButton = document.getElementById("cancelButton");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.add("hidden");
      }
    });
  }

  // Confirm payment button
  const confirmButton = document.querySelector(".confirm-button");
  if (confirmButton) {
    confirmButton.addEventListener("click", async () => {
      const paymentOverlay = document.getElementById("paymentOverlay");
      const successOverlay = document.getElementById("successOverlay");

      if (paymentOverlay && successOverlay) {
        paymentOverlay.classList.add("hidden");
        successOverlay.classList.remove("hidden");

        // Update receipt details with actual values
        updateReceiptDetails(
          selectedPayment,
          selectedDpAmount,
          selectedDpMethod
        );

        // Add property to user's owned properties
        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get("id");
        const currentUser = getCurrentUser();

        if (currentUser && propertyId) {
          try {
            const result = await addPropertyToUser(
              currentUser.id,
              propertyId,
              "owned"
            );
            if (result.success) {
              console.log("Property successfully added to user:", propertyId);
            } else {
              console.error("Failed to add property to user:", result.message);
            }
          } catch (error) {
            console.error("Error adding property to user:", error);
          }
        }

        showNotification("Payment processed successfully!", "success");
      }
    });
  }

  // Success close button
  const successCloseButton = document.getElementById("successCloseButton");
  if (successCloseButton) {
    successCloseButton.addEventListener("click", () => {
      showNotification("Redirecting to your properties...", "info");
      setTimeout(() => {
        window.location.href = "properties.html";
      }, 1000);
    });
  }
}

// Update receipt details with accurate information
function updateReceiptDetails(paymentType, dpAmount, dpMethod) {
  const receiptInputs = document.querySelectorAll(
    ".receipt-form input[readonly]"
  );
  const currentDate = new Date().toLocaleDateString("en-GB");

  if (receiptInputs.length >= 7) {
    receiptInputs[0].value = currentDate; // Date
    receiptInputs[1].value =
      paymentType === "downPayment"
        ? "Down Payment"
        : "Earnest Money (Uang Tanda Jadi)"; // Payment Option
    receiptInputs[2].value =
      dpMethod === "credit"
        ? "Credit Card"
        : dpMethod === "debit"
        ? "Debit Card"
        : "Not Specified"; // Payment Method
    receiptInputs[3].value = "**** **** **** 1234"; // Card Number (placeholder)
    receiptInputs[4].value = "John Doe"; // Cardholder Name (placeholder)
    receiptInputs[5].value = "johndoe@example.com"; // Email (placeholder)
    // receiptInputs[6] is amount - already updated in updateTotalPayment
  }
}

// Function to handle initial page load error if no property ID
function handleMissingProperty() {
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
      <h2 style="color: #e74c3c;">Property Not Found</h2>
      <p>No property selected for payment.</p>
      <button onclick="window.location.href='marketplace.html'" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Go to Marketplace
      </button>
    </div>
  `;
}

// Initialize payment page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize navbar
  if (typeof updateNavigation === "function") {
    updateNavigation();
  }

  // Ensure no radio buttons are checked by default
  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  initializePaymentPage();
});
