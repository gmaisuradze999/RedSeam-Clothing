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

function profilePictureRemoval(element) {
  const profilePicture = document.getElementById("profile-picture");
  const fileInput = document.getElementById("file-input");
  fileInput.value = ""; // input-ის გასუფთავება
  profilePicture.style.backgroundImage = "url('./images/personSiluet.svg')";
}

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
