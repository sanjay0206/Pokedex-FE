document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const errorMessageElement = document.getElementById("error-message");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(loginForm);

    const loginData = {
      username: formData.get("username"),
      password: formData.get("password"),
    };

    sendLoginRequest(loginData)
      .then(handleSuccessfulLogin)
      .catch(handleLoginError);
  });

  async function sendLoginRequest(loginData) {
    const url = "http://localhost:8080/api/auth/login";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  }

  function handleSuccessfulLogin(data) {
    const { accessToken } = data;
    document.cookie = `accessToken=${accessToken}; path=/;`;

    const username = "Peter!";
    console.log(username);

    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.innerText = `Hello, ${username}!`;
    }

    window.location.href = "http://127.0.0.1:5500/html/pokemon.html";
  }

  function handleLoginError(error) {
    console.error("Error during login:", error.message);
    displayErrorMessage("Username or password is incorrect.");
  }

  function displayErrorMessage(message) {
    errorMessageElement.innerText = message;
  }
});
