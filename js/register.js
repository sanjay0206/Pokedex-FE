document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const errorMessageElement = document.getElementById("error-message");

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(registerForm);

    const registerData = {
      username: formData.get("username"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    // Frontend validation for password confirmation
    if (registerData.password !== registerData.confirmPassword) {
      errorMessageElement.innerText = "Passwords do not match.";
      return;
    }

    sendRegisterRequest(registerData)
      .then(handleSuccessfulRegistration)
      .catch(handleRegistrationError);
  });

  async function sendRegisterRequest(registerData) {
    const url = "http://localhost:8080/api/auth/register";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }
  }

  function handleSuccessfulRegistration(data) {
    console.log("Registration successful:", data);
    window.location.href = "http://127.0.0.1:5500/html/login.html";
  }

  function handleRegistrationError(error) {
    errorMessageElement.innerText = error.message;
    console.error("Error during registration:", error.message);
  }
});
