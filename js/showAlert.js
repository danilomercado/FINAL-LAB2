export function showAlert(type, message) {
  const alertContainer = document.getElementById("alert-container");
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert", type);
  alertElement.textContent = message;
  alertContainer.appendChild(alertElement);

  setTimeout(() => {
    alertContainer.removeChild(alertElement);
  }, 3000);
}
