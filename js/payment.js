function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const messageElement = notification.querySelector(".notification-message");

  messageElement.textContent = message;
  notification.className = `notification ${type}`;

  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

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

async function initializePaymentPage() {
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

  const propertyNameElement = document.querySelector(".property-name");
  if (propertyNameElement) propertyNameElement.textContent = property.name;

  const propertyLocationElement = document.querySelector(".property-location");
  if (propertyLocationElement)
    propertyLocationElement.textContent = property.location;

  const propertyPriceElement = document.querySelector(".property-price strong");
  if (propertyPriceElement)
    propertyPriceElement.textContent = formatRupiah(property.price);

  const propertyImageElement = document.querySelector(".property-image");
  if (propertyImageElement) {
    propertyImageElement.src = property.mainImage || "img/prop1.jpg";
    propertyImageElement.alt = property.name;
  }

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

  const propertyPrice = property.price;
  const formattedPrice = formatRupiah(propertyPrice);
  const dpCalculation = document.querySelector(
    "#downPaymentDetails .calculation p:nth-child(2)"
  );
  if (dpCalculation) {
    const downPaymentAmount = Math.floor(propertyPrice * 0.2);
    dpCalculation.innerHTML = `20% x ${formattedPrice} → <strong>${formatRupiah(
      downPaymentAmount
    )}</strong>`;
  }
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

  const utjAmount = document.querySelector(".utj-amount");
  if (utjAmount) {
    utjAmount.textContent = formatRupiah(20000000);
  }

  setupPaymentListeners(propertyPrice);

  const notificationClose = document.querySelector(".notification-close");
  if (notificationClose) {
    notificationClose.addEventListener("click", hideNotification);
  }
}

function setupPaymentListeners(propertyPrice) {
  const downPaymentRadio = document.querySelectorAll(
    'input[name="payment"]'
  )[0];
  const tandaJadiRadio = document.querySelectorAll('input[name="payment"]')[1];
  const downPaymentDetails = document.getElementById("downPaymentDetails");
  const utjDetails = document.getElementById("utjDetails");
  const totalPaymentElement = document.querySelector(".payment-summary strong");
  const remainingAmountElement = document.querySelector(".remaining-amount");

  const dpAmountOptions = document.querySelectorAll('input[name="dpAmount"]');

  const dpMethodOptions = document.querySelectorAll('input[name="dpMethod"]');

  let selectedPayment = null;
  let selectedDpAmount = null;
  let selectedDpMethod = null;

  function updateTotalPayment() {
    let totalAmount = 0;
    let remainingAmount = propertyPrice;

    if (selectedPayment === "downPayment") {
      if (selectedDpAmount === "full") {
        totalAmount = Math.floor(propertyPrice * 0.2);
      } else if (selectedDpAmount === "3x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 3);
      } else if (selectedDpAmount === "5x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 5);
      }
      remainingAmount = propertyPrice - Math.floor(propertyPrice * 0.2);
    } else if (selectedPayment === "utj") {
      totalAmount = 20000000;
      remainingAmount = propertyPrice - 20000000;
    }

    if (totalPaymentElement) {
      totalPaymentElement.textContent = formatRupiah(totalAmount);
    }

    if (remainingAmountElement) {
      remainingAmountElement.textContent = formatRupiah(remainingAmount);
    }

    const receiptInputs = document.querySelectorAll(
      ".receipt-form input[readonly]"
    );
    const receiptAmount = receiptInputs[receiptInputs.length - 1];
    if (receiptAmount) {
      receiptAmount.value = formatRupiah(totalAmount);
    }

    const successAmount = document.querySelector(".success-container p strong");
    if (successAmount) {
      successAmount.textContent = formatRupiah(totalAmount);
    }
  }

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

  dpAmountOptions.forEach((option) => {
    option.addEventListener("change", () => {
      selectedDpAmount = option.value;
      updateTotalPayment();
    });
  });

  dpMethodOptions.forEach((option) => {
    option.addEventListener("change", () => {
      selectedDpMethod = option.value;
      const continueButton = document.querySelector(".continue-button");
      if (continueButton && selectedDpAmount && selectedDpMethod) {
        continueButton.disabled = false;
      }
    });
  });

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

      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.remove("hidden");
      }
    });
  }

  const cancelButton = document.getElementById("cancelButton");
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.add("hidden");
      }
    });
  }

  const confirmButton = document.querySelector(".confirm-button");
  if (confirmButton) {
    confirmButton.addEventListener("click", async () => {
      const paymentOverlay = document.getElementById("paymentOverlay");
      const successOverlay = document.getElementById("successOverlay");

      if (paymentOverlay && successOverlay) {
        paymentOverlay.classList.add("hidden");
        successOverlay.classList.remove("hidden");

        updateReceiptDetails(
          selectedPayment,
          selectedDpAmount,
          selectedDpMethod
        );

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

function updateReceiptDetails(paymentType, dpAmount, dpMethod) {
  const receiptInputs = document.querySelectorAll(
    ".receipt-form input[readonly]"
  );
  const currentDate = new Date().toLocaleDateString("en-GB");

  if (receiptInputs.length >= 7) {
    receiptInputs[0].value = currentDate;
    receiptInputs[1].value =
      paymentType === "downPayment"
        ? "Down Payment"
        : "Earnest Money (Uang Tanda Jadi)";
    receiptInputs[2].value =
      dpMethod === "credit"
        ? "Credit Card"
        : dpMethod === "debit"
        ? "Debit Card"
        : "Not Specified";
    receiptInputs[3].value = "**** **** **** 1234";
    receiptInputs[4].value = "John Doe";
    receiptInputs[5].value = "johndoe@example.com";
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  if (typeof updateNavigation === "function") {
    updateNavigation();
  }

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false;
  });

  initializePaymentPage();
});
