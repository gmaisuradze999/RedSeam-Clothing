const API_URL = "https://api.redseam.redberryinternship.ge/api";

// Loading any page function

function loadingPage(page) {
  fetch(page + ".html")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Page not found");
      }
      return res.text();
    })
    .then((html) => {
      let app = document.getElementById("app");
      app.innerHTML = html;
    })
    .catch((err) => {
      let app = document.getElementById("app");
      app.innerHTML = `
            <h1>
                Page not found
            </h1>
        `;
    });
}

// Indicating which page must be loaded first when a user enters the website

function router() {
  const hash = location.hash.replace("#/", "") || "products"; // Products მთავარი გვერდი
  loadingPage(hash);
}

// This is for the orange '*' that cannot be seperate color whilst also being part of the input's placeholder

function fakePlaceholderDisplay(element, event) {
  const fakePlaceholder =
    element.parentElement.querySelector(".fake-placeholder");

  // თუ კლავიატურიდან წაშლის ღილაკები (Backspace, Delete) ან value ცარიელია
  if (
    (event.key === "Backspace" || event.key === "Delete") &&
    element.value.length == 1
  ) {
    fakePlaceholder.style.display = "block"; // აჩვენებს placeholder-ს
  } else if (event.key != "Backspace" && event.key != "Delete") {
    fakePlaceholder.style.display = "none"; // დამალვა, თუ არის ტექსტი
  }
}

// This is for the customised eye symbol for the password type input tag

function fakeEyeDisplay(element) {
  const passwordInput = element.parentElement.querySelector(".password");

  if (passwordInput.type == "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

// This function is used to upload the profile picture

function profilePictureSelector(element) {
  const file = element.files[0]; // მხოლოდ პირველი (და ერთადერთი) ფაილი
  const profilePicture = document.querySelector("#profile-picture");

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log(e);

      profilePicture.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
  }
}

// This function is used to remove the profile picture

function profilePictureRemoval(element) {
  const profilePicture = document.getElementById("profile-picture");
  const fileInput = document.getElementById("file-input");
  fileInput.value = ""; // input-ის გასუფთავება
  profilePicture.style.backgroundImage = "url('./images/personSiluet.svg')";
}

// This function is used by the $color_7 text at the end of log in/registrtion page to switch to and from each other

function switchLogInRegistration(value) {
  const logIn = document.querySelector("html body main .authorization .right #log-in")
  const registration = document.querySelector("html body main .authorization .right #registration")
  if (value == "Log in") {
    registration.style.display = "none";
    logIn.style.display = "flex";
  }
  else if (value == "Registration") {
    registration.style.display = "flex";
    logIn.style.display = "none";
  }
}

async function Register(email, username, password, file) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("password_confirmation", password);
  
  if (file) {
    formData.append("avatar", file); // თუ ფაილი სერვერზე ამ key-თაა საჭირო
  }

  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      // Content-Type არ უნდა ჩავწეროთ ხელით, 
      // FormData თვითონ აგენერირებს სწორ boundary-ს
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

async function registration() {
  const fileInput = document.getElementById("file-input");
  const usernameInput = document.querySelector("html body main .authorization .right #registration .input-container .username-input-container .username-input");
  const emailInput = document.querySelector("html body main .authorization .right #registration .input-container .email-input-container .email-input");
  const passwordInput = document.querySelector("html body main .authorization .right #registration .input-container .password-input-container .password-input");
  const confirmPasswordInput = document.querySelector("html body main .authorization .right #registration .input-container .confirm-password-input-container .confirm-password-input");
  const errorMessageDiv = document.querySelector("html body main .authorization .right #registration .error-message");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  errorMessageDiv.innerHTML = ``;

  if (usernameInput.value.length < 3) {
    errorMessageDiv.innerHTML += `
      <p>
        * The username length must be minimum 3 charachters long!
      </p>
    `;
    
  }
  
  if (!emailRegex.test(emailInput.value)) {
    errorMessageDiv.innerHTML += `
      <p>
        * The email format is incorrect!
      </p>
    `;
  }
  
  if (passwordInput.value.length < 8) {
    errorMessageDiv.innerHTML += `
      <p>
        * The password must be minimum 8 charachters long!
      </p>
    `;
  }
  
  if (passwordInput.value != confirmPasswordInput.value) {
    errorMessageDiv.innerHTML += `
      <p>
        * The the password is not matching!
      </p>
    `;
  }

  if (errorMessageDiv.innerHTML == ``) {
    try {
      const data = await Register(emailInput.value, usernameInput.value, passwordInput.value, fileInput.files[0]);

      switchLogInRegistration("Log in");
      console.log(data);
    }
    catch (error) {
      errorMessageDiv.innerHTML = `
        <p>
          * ${error.message}!
        </p>
      `;
    }
  }
}

async function main() {
  // --- hash ცვლილებაზე loadPage იძახება მხოლოდ router-ის გავლით ---

  window.addEventListener("hashchange", router);

  // --- პირველი ჩატვირთვა ---
  document.addEventListener("DOMContentLoaded", () => {
    router();
    // Click listener მხოლოდ hash-ს ცვლის
    const beforeLogIn = document.getElementById("before-log-in");
    if (beforeLogIn) {
      beforeLogIn.addEventListener("click", () => (location.hash = "/auth"));
    }
    const mainLogo = document.getElementById("mainLogo");
    if (mainLogo) {
      mainLogo.addEventListener("click", () => (location.hash = "/products"));
    }
  });
}

main();
