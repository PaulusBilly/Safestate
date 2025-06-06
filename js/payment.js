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

  if (property.status === "FOR_RENT") {
    initializeRentalPayment(property);
  } else {
    initializePurchasePayment(property);
  }

  const notificationClose = document.querySelector(".notification-close");
  if (notificationClose) {
    notificationClose.addEventListener("click", hideNotification);
  }
}

function initializeRentalPayment(property) {
  const propertyPriceElement = document.querySelector(".property-price strong");
  if (propertyPriceElement) {
    const monthlyRent = property.pricePerMonth || property.price;
    propertyPriceElement.textContent = formatRupiah(monthlyRent) + "/month";
  }

  const paymentOptionsContainer = document.querySelector(".payment-options");
  if (paymentOptionsContainer) {
    paymentOptionsContainer.innerHTML = `
      <h3>Rental Payment</h3>
      <div id="depositDetails" class="rental-details">
        <div class="calculation">
          <p><strong>Security Deposit + First Month Rent</strong></p>
          <p>Security Deposit: <strong>${formatRupiah(
            property.pricePerMonth || property.price
          )}</strong></p>
          <p>First Month Rent: <strong>${formatRupiah(
            property.pricePerMonth || property.price
          )}</strong></p>
          <p>Total: <strong>${formatRupiah(
            (property.pricePerMonth || property.price) * 2
          )}</strong></p>
        </div>
        <div class="option-group">
          <p><strong>Payment Method</strong></p>
          <label><input type="radio" name="rentalMethod" value="credit" /> Credit Card</label>
          <label><input type="radio" name="rentalMethod" value="debit" /> Debit Card</label>
        </div>
      </div>
    `;
  }

  setupRentalPaymentListeners(property);
}

function initializePurchasePayment(property) {
  const propertyPriceElement = document.querySelector(".property-price strong");
  if (propertyPriceElement)
    propertyPriceElement.textContent = formatRupiah(property.price);

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
  const paymentOptionsContainer = document.querySelector(".payment-options");
  if (paymentOptionsContainer) {
    const downPaymentOption =
      paymentOptionsContainer.querySelector(".payment-option");

    const originalTitle = paymentOptionsContainer.querySelector("h3");

    let paymentOptionsWrapper = paymentOptionsContainer.querySelector(
      ".payment-options-wrapper"
    );
    if (!paymentOptionsWrapper) {
      if (downPaymentOption) {
        downPaymentOption.remove();
      }
      if (originalTitle) {
        originalTitle.remove();
      }

      paymentOptionsWrapper = document.createElement("div");
      paymentOptionsWrapper.className = "payment-options-wrapper";

      const titleElement = document.createElement("h3");
      titleElement.textContent = "Payment Options";
      paymentOptionsWrapper.appendChild(titleElement);

      const earnestMoneyDiv = document.createElement("div");
      earnestMoneyDiv.className = "payment-option";
      earnestMoneyDiv.innerHTML = `
        <span>Earnest Money</span>
        <input type="radio" name="payment" id="earnestMoneyRadio" />
      `;

      const newDownPaymentDiv = document.createElement("div");
      newDownPaymentDiv.className = "payment-option";
      newDownPaymentDiv.innerHTML = `
        <span>Down Payment</span>
        <input type="radio" name="payment" id="downPaymentRadio" />
      `;

      paymentOptionsWrapper.appendChild(earnestMoneyDiv);
      paymentOptionsWrapper.appendChild(newDownPaymentDiv);

      paymentOptionsContainer.insertBefore(
        paymentOptionsWrapper,
        paymentOptionsContainer.firstChild.nextSibling
      );

      const earnestMoneyDetails = document.createElement("div");
      earnestMoneyDetails.id = "earnestMoneyDetails";
      earnestMoneyDetails.className = "down-payment-details hidden";
      earnestMoneyDetails.innerHTML = `
        <div class="calculation">
          <p><strong>Calculation</strong></p>
          <p>5% x ${formattedPrice} → <strong>${formatRupiah(
        Math.floor(propertyPrice * 0.05)
      )}</strong></p>
        </div>
        <div class="option-group">
          <p><strong>Payment Method</strong></p>
          <label><input type="radio" name="emMethod" value="credit" /> Credit Card</label>
          <label><input type="radio" name="emMethod" value="debit" /> Debit Card</label>
        </div>
      `;

      paymentOptionsContainer.appendChild(earnestMoneyDetails);
    }
  }

  setupPaymentListeners(property.price);
}

function setupRentalPaymentListeners(property) {
  const totalPaymentElement = document.querySelector(".payment-summary strong");
  const rentalMethodOptions = document.querySelectorAll(
    'input[name="rentalMethod"]'
  );

  let selectedRentalMethod = null;

  const monthlyRent = property.pricePerMonth || property.price;
  const totalAmount = monthlyRent * 2;

  function updateTotalPayment() {
    if (totalPaymentElement) {
      totalPaymentElement.textContent = formatRupiah(totalAmount);
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

  updateTotalPayment();

  setTimeout(() => {
    const rentalMethods = document.querySelectorAll(
      'input[name="rentalMethod"]'
    );
    rentalMethods.forEach((option) => {
      option.addEventListener("change", () => {
        selectedRentalMethod = option.value;
        const continueButton = document.querySelector(".continue-button");
        if (continueButton && selectedRentalMethod) {
          continueButton.disabled = false;
        }
      });
    });
  }, 100);

  const continueButton = document.querySelector(".continue-button");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!selectedRentalMethod) {
        showNotification("Please select a payment method", "warning");
        return;
      }

      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.remove("hidden");
        autofillReceiptForm("rental", null, selectedRentalMethod);
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
      if (!validateConfirmPaymentForm()) return;
      const paymentOverlay = document.getElementById("paymentOverlay");
      const successOverlay = document.getElementById("successOverlay");

      if (paymentOverlay && successOverlay) {
        paymentOverlay.classList.add("hidden");
        successOverlay.classList.remove("hidden");

        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get("id");

        const rentalMethodInput = document.querySelector(
          'input[name="rentalMethod"]:checked'
        );
        const rentalMethod = rentalMethodInput ? rentalMethodInput.value : null;
        updateRentalReceiptDetails("deposit", rentalMethod);

        const currentUser = getCurrentUser();

        if (currentUser && propertyId) {
          try {
            const result = await addPropertyToUser(
              currentUser.id,
              propertyId,
              "rented"
            );
            if (result.success) {
              console.log(
                "Property successfully added to user as rented:",
                propertyId
              );
            } else {
              console.error("Failed to add property to user:", result.message);
            }
          } catch (error) {
            console.error("Error adding property to user:", error);
          }
        }

        showNotification("Rental payment processed successfully!", "success");
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

function setupPaymentListeners(propertyPrice) {
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  const downPaymentRadio = document.getElementById("downPaymentRadio");
  const earnestMoneyRadio = document.getElementById("earnestMoneyRadio");

  const downPaymentDetails = document.getElementById("downPaymentDetails");
  const totalPaymentElement = document.querySelector(".payment-summary strong");
  const remainingAmountElement = document.querySelector(".remaining-amount");

  const dpAmountOptions = document.querySelectorAll('input[name="dpAmount"]');
  const dpMethodOptions = document.querySelectorAll('input[name="dpMethod"]');

  window.paymentData = {
    selectedPayment: null,
    selectedDpAmount: null,
    selectedDpMethod: null,
    selectedEmMethod: null,
  };

  function updateTotalPayment() {
    let totalAmount = 0;
    let remainingAmount = propertyPrice;

    if (window.paymentData.selectedPayment === "downPayment") {
      if (window.paymentData.selectedDpAmount === "full") {
        totalAmount = Math.floor(propertyPrice * 0.2);
      } else if (window.paymentData.selectedDpAmount === "3x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 3);
      } else if (window.paymentData.selectedDpAmount === "5x") {
        totalAmount = Math.floor((propertyPrice * 0.2) / 5);
      }
      remainingAmount = propertyPrice - Math.floor(propertyPrice * 0.2);
    } else if (window.paymentData.selectedPayment === "earnestMoney") {
      totalAmount = Math.floor(propertyPrice * 0.05);
      remainingAmount = propertyPrice - Math.floor(propertyPrice * 0.05);
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

  function hideAllPaymentDetails() {
    if (downPaymentDetails) downPaymentDetails.classList.add("hidden");
    const earnestMoneyDetails = document.getElementById("earnestMoneyDetails");
    if (earnestMoneyDetails) earnestMoneyDetails.classList.add("hidden");
  }

  if (downPaymentRadio) {
    downPaymentRadio.addEventListener("click", () => {
      if (window.paymentData.selectedPayment === "downPayment") {
        downPaymentRadio.checked = false;
        downPaymentDetails.classList.add("hidden");
        window.paymentData.selectedPayment = null;
      } else {
        hideAllPaymentDetails();
        downPaymentDetails.classList.remove("hidden");
        window.paymentData.selectedPayment = "downPayment";
        if (earnestMoneyRadio) earnestMoneyRadio.checked = false;
      }
      updateTotalPayment();
    });
  }

  if (earnestMoneyRadio) {
    earnestMoneyRadio.addEventListener("click", () => {
      const earnestMoneyDetails = document.getElementById(
        "earnestMoneyDetails"
      );
      if (window.paymentData.selectedPayment === "earnestMoney") {
        earnestMoneyRadio.checked = false;
        if (earnestMoneyDetails) earnestMoneyDetails.classList.add("hidden");
        window.paymentData.selectedPayment = null;
      } else {
        hideAllPaymentDetails();
        if (earnestMoneyDetails) earnestMoneyDetails.classList.remove("hidden");
        window.paymentData.selectedPayment = "earnestMoney";
        if (downPaymentRadio) downPaymentRadio.checked = false;
      }
      updateTotalPayment();
    });
  }

  dpAmountOptions.forEach((option) => {
    option.addEventListener("change", () => {
      window.paymentData.selectedDpAmount = option.value;
      updateTotalPayment();
    });
  });

  setTimeout(() => {
    const emMethodOptions = document.querySelectorAll('input[name="emMethod"]');
    emMethodOptions.forEach((option) => {
      option.addEventListener("change", () => {
        window.paymentData.selectedEmMethod = option.value;
        const continueButton = document.querySelector(".continue-button");
        if (continueButton) {
          continueButton.disabled = false;
        }
      });
    });
  }, 100);

  dpMethodOptions.forEach((option) => {
    option.addEventListener("change", () => {
      window.paymentData.selectedDpMethod = option.value;
      const continueButton = document.querySelector(".continue-button");
      if (
        continueButton &&
        window.paymentData.selectedDpAmount &&
        window.paymentData.selectedDpMethod
      ) {
        continueButton.disabled = false;
      }
    });
  });

  const continueButton = document.querySelector(".continue-button");
  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!window.paymentData.selectedPayment) {
        showNotification("Please select a payment option", "warning");
        return;
      }

      if (
        window.paymentData.selectedPayment === "downPayment" &&
        (!window.paymentData.selectedDpAmount ||
          !window.paymentData.selectedDpMethod)
      ) {
        showNotification(
          "Please select both payment amount and method",
          "warning"
        );
        return;
      }

      if (
        window.paymentData.selectedPayment === "earnestMoney" &&
        !window.paymentData.selectedEmMethod
      ) {
        showNotification("Please select a payment method", "warning");
        return;
      }

      const paymentOverlay = document.getElementById("paymentOverlay");
      if (paymentOverlay) {
        paymentOverlay.classList.remove("hidden");
        autofillReceiptForm(
          window.paymentData.selectedPayment,
          window.paymentData.selectedDpAmount,
          window.paymentData.selectedDpMethod
        );
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
      if (!validateConfirmPaymentForm()) return;
      const paymentOverlay = document.getElementById("paymentOverlay");
      const successOverlay = document.getElementById("successOverlay");

      if (paymentOverlay && successOverlay) {
        paymentOverlay.classList.add("hidden");
        successOverlay.classList.remove("hidden");

        const urlParams = new URLSearchParams(window.location.search);
        const propertyId = urlParams.get("id");
        const property = await getPropertyById(propertyId);

        if (property && property.status === "FOR_RENT") {
          const rentalMethodInput = document.querySelector(
            'input[name="rentalMethod"]:checked'
          );
          const rentalMethod = rentalMethodInput
            ? rentalMethodInput.value
            : null;
          updateRentalReceiptDetails("deposit", rentalMethod);
        } else {
          updateReceiptDetails(
            window.paymentData.selectedPayment,
            window.paymentData.selectedDpAmount,
            window.paymentData.selectedPayment === "downPayment"
              ? window.paymentData.selectedDpMethod
              : window.paymentData.selectedEmMethod
          );
        }

        const currentUser = getCurrentUser();

        if (currentUser && propertyId) {
          try {
            // Add this block to ensure owned properties are added after purchase
            if (property && property.status !== "FOR_RENT") {
              const result = await addPropertyToUser(
                currentUser.id,
                propertyId,
                "owned"
              );
              if (result.success) {
                console.log(
                  "Property successfully added to user as owned:",
                  propertyId
                );
              } else {
                console.error(
                  "Failed to add property to user:",
                  result.message
                );
              }
            }
            const propertyType =
              property && property.status === "FOR_RENT" ? "rented" : "owned";
            const paymentDetails = {
              propertyId,
              type: propertyType,
              date: new Date().toISOString(),
              method:
                window.paymentData.selectedDpMethod ||
                window.paymentData.selectedEmMethod ||
                null,
              plan: window.paymentData.selectedDpAmount || null,
              nextPaymentDate: null, // You can calculate this based on plan
              nextPaymentAmount: null, // You can calculate this based on plan
            };
            // Save to user record
            let users = JSON.parse(localStorage.getItem("users")) || [];
            const userIndex = users.findIndex((u) => u.id === currentUser.id);
            if (userIndex !== -1) {
              if (!users[userIndex].payments) users[userIndex].payments = [];
              users[userIndex].payments = users[userIndex].payments.filter(
                (p) => p.propertyId !== propertyId
              );
              users[userIndex].payments.push(paymentDetails);
              localStorage.setItem("users", JSON.stringify(users));
              sessionStorage.setItem(
                "currentUser",
                JSON.stringify(users[userIndex])
              );
            }
          } catch (error) {
            console.error("Error saving payment details to user:", error);
          }
        }

        const message =
          property && property.status === "FOR_RENT"
            ? "Rental payment processed successfully!"
            : "Payment processed successfully!";
        showNotification(message, "success");
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
  const receiptInputs = document.querySelectorAll(".receipt-form input");
  if (receiptInputs.length >= 7) {
    for (let i = 0; i < receiptInputs.length - 1; i++) {
      receiptInputs[i].value = "";
      receiptInputs[i].readOnly = false;
    }
    const totalAmountInput = receiptInputs[receiptInputs.length - 1];
    totalAmountInput.readOnly = true;
  }
}

function updateRentalReceiptDetails(paymentType, rentalMethod) {
  const receiptInputs = document.querySelectorAll(".receipt-form input");
  if (receiptInputs.length >= 7) {
    for (let i = 0; i < receiptInputs.length - 1; i++) {
      receiptInputs[i].value = "";
      receiptInputs[i].readOnly = false;
    }
    const totalAmountInput = receiptInputs[receiptInputs.length - 1];
    totalAmountInput.readOnly = true;
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

function autofillReceiptForm(paymentType, dpAmount, dpMethod) {
  const receiptInputs = document.querySelectorAll(".receipt-form input");
  if (receiptInputs.length < 7) return;

  // Date (readonly, today)
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB");
  receiptInputs[0].value = formattedDate;
  receiptInputs[0].readOnly = true;

  // Payment Option (readonly)
  let paymentOption = "";
  if (paymentType === "downPayment") paymentOption = "Down Payment";
  else if (paymentType === "earnestMoney") paymentOption = "Earnest Money";
  else if (paymentType === "rental") paymentOption = "Rental Payment";
  else paymentOption = "";
  receiptInputs[1].value = paymentOption;
  receiptInputs[1].readOnly = true;

  // Payment Method (readonly, always use checked radio)
  let paymentMethod = "";
  if (paymentType === "downPayment") {
    const checked = document.querySelector('input[name="dpMethod"]:checked');
    if (checked) {
      paymentMethod =
        checked.value === "credit"
          ? "Credit Card"
          : checked.value === "debit"
          ? "Debit Card"
          : "";
    }
  } else if (paymentType === "earnestMoney") {
    const checked = document.querySelector('input[name="emMethod"]:checked');
    if (checked) {
      paymentMethod =
        checked.value === "credit"
          ? "Credit Card"
          : checked.value === "debit"
          ? "Debit Card"
          : "";
    }
  } else if (paymentType === "rental") {
    paymentMethod = dpMethod === "credit" ? "Credit Card" : "Debit Card";
  }
  receiptInputs[2].value = paymentMethod;
  receiptInputs[2].readOnly = true;

  // Card Number (editable, empty)
  receiptInputs[3].value = "";
  receiptInputs[3].readOnly = false;

  // Cardholder Name (editable, empty)
  receiptInputs[4].value = "";
  receiptInputs[4].readOnly = false;

  // Email (autofill from user, editable)
  const currentUser = getCurrentUser();
  receiptInputs[5].value =
    currentUser && currentUser.email ? currentUser.email : "";
  receiptInputs[5].readOnly = false;

  // Total Amount (readonly, set by updateTotalPayment logic)
  receiptInputs[6].readOnly = true;
}

function validateConfirmPaymentForm() {
  const receiptInputs = document.querySelectorAll(".receipt-form input");
  // Card Number: must be 16 digits
  const cardNumber = receiptInputs[3].value.replace(/\s+/g, "");
  if (!/^\d{16}$/.test(cardNumber)) {
    showNotification("Card Number must be 16 digits.", "error");
    return false;
  }
  // Cardholder Name: not empty
  const cardName = receiptInputs[4].value.trim();
  if (!cardName) {
    showNotification("Cardholder Name cannot be empty.", "error");
    return false;
  }
  return true;
}
