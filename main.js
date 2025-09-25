let products = [];
const API_URL = "https://api.redseam.redberryinternship.ge/api";
let registrationLoading = false;
let logInLoading = false;

// Loading any page function

async function loadingPage(page) {
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

async function router() {
  const hash = location.hash.replace("#/", "") || "products"; // Products მთავარი გვერდი

  await loadingPage(hash);

  if (hash === "products") {
    setTimeout(() => {
      initProductsList(); // ეს გამოიძახებს getProducts-ს და შემდეგ initProductsList-ს
    }, 100);
  }
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
  profilePicture.style.backgroundImage = "url('./images/camera.svg')";
}

// This function is used by the $color_7 text at the end of log in/registrtion page to switch to and from each other

function switchLogInRegistration(value) {
  const logIn = document.querySelector(
    "html body main .authorization .right #log-in"
  );
  const registration = document.querySelector(
    "html body main .authorization .right #registration"
  );
  if (value == "Log in") {
    registration.style.display = "none";
    logIn.style.display = "flex";
  } else if (value == "Registration") {
    registration.style.display = "flex";
    logIn.style.display = "none";
  }
}

// This function is a supplementary function to registration(), and is used to data to the registration()

async function register(email, username, password, file) {
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
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

// Function that allows a person to register

async function registration() {
  const fileInput = document.getElementById("file-input");
  const profilePicture = document.getElementById("profile-picture");
  const usernameInput = document.querySelector(
    "html body main .authorization .right #registration .input-container .username-input-container .username-input"
  );
  const emailInput = document.querySelector(
    "html body main .authorization .right #registration .input-container .email-input-container .email-input"
  );
  const passwordInput = document.querySelector(
    "html body main .authorization .right #registration .input-container .password-input-container .password-input"
  );
  const confirmPasswordInput = document.querySelector(
    "html body main .authorization .right #registration .input-container .confirm-password-input-container .confirm-password-input"
  );
  const errorMessageDiv = document.querySelector(
    "html body main .authorization .right #registration .error-message"
  );
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  errorMessageDiv.innerHTML = ``;

  if (registrationLoading == false) {
    if (usernameInput.value.length < 3) {
      errorMessageDiv.innerHTML += `
        <p>
          * The username length must be minimum 3 charachters long!
        </p>
      `;

      registrationLoading = false;
    }

    if (!emailRegex.test(emailInput.value)) {
      errorMessageDiv.innerHTML += `
        <p>
          * The email format is incorrect!
        </p>
      `;

      registrationLoading = false;
    }

    if (passwordInput.value.length < 3) {
      errorMessageDiv.innerHTML += `
        <p>
          * The password must be minimum 8 charachters long!
        </p>
      `;

      registrationLoading = false;
    }

    if (passwordInput.value != confirmPasswordInput.value) {
      errorMessageDiv.innerHTML += `
        <p>
          * The the password is not matching!
        </p>
      `;

      registrationLoading = false;
    }

    if (errorMessageDiv.innerHTML == ``) {
      registrationLoading = true;

      try {
        const data = await register(
          emailInput.value,
          usernameInput.value,
          passwordInput.value,
          fileInput.files[0]
        );

        switchLogInRegistration("Log in");

        registrationLoading = false;

        profilePicture.style.backgroundImage = "url('./images/camera.svg')";
        fileInput.value = "";
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        confirmPasswordInput.value = "";
      } catch (error) {
        errorMessageDiv.innerHTML = `
          <p>
            * ${error.message}!
          </p>
        `;

        registrationLoading = false;
      }
    }
  }
}

// This function is a supplementary function to auth(), and is used to data to the auth()

async function logIn(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  // აქ შეიძლება დაგიბრუნოს access token
  // მაგ: data.token ან data.access_token
  return data;
}

// Function that allows a person to log in

async function auth() {
  const emailUsernameInput = document.querySelector(
    "html body main .authorization .right #log-in .input-container .email-username-container .email-or-username"
  );
  const password = document.querySelector(
    "html body main .authorization .right #log-in .input-container .password-container .password"
  );
  const errorMessageDiv = document.querySelector(
    "html body main .authorization .right #log-in .error-message"
  );

  errorMessageDiv.innerHTML = ``;

  if (logInLoading == false) {
    if (!emailUsernameInput.value) {
      errorMessageDiv.innerHTML += `
        <p>
          * The email or username is empty!
        </p>
      `;

      logInLoading = false;
    }

    if (!password.value) {
      errorMessageDiv.innerHTML += `
        <p>
          * The password is empty!
        </p>
      `;

      logInLoading = false;
    }

    if (errorMessageDiv.innerHTML == ``) {
      try {
        logInLoading = true;

        const data = await logIn(emailUsernameInput.value, password.value);

        // Saving in the local storage

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Rerouting to products page

        location.hash = "/products";

        // To change the header after logging in

        initUserInfo();

        logInLoading = false;
      } catch (error) {
        errorMessageDiv.innerHTML = `
          <p>
            * ${error.message}!
          </p>
        `;

        logInLoading = false;
      }
    }
  }
}

// This function changes the header's right after logging in the website

function initUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const profilePicture = document.querySelector(
    "html body header .right #after-log-in .profile-picture-after-log-in"
  );
  const beforeLogIn = document.getElementById("before-log-in");
  const afterLogIn = document.getElementById("after-log-in");

  if (user && token) {
    beforeLogIn.style.display = "none";
    afterLogIn.style.display = "flex";

    if (user.avatar) {
      profilePicture.style.backgroundImage = `url('${user.avatar}')`;
      profilePicture.style.backgroundSize = "cover";
      profilePicture.style.border = "none";
    } else {
      profilePicture.style.backgroundImage = 'url("./images/cameraIcon.svg")';
      profilePicture.style.backgroundSize = "none";
      profilePicture.style.border = "1px solid #e1dfe1";
    }
  }
}

// This function is used to get products

async function getProducts({ page = 1, priceFrom, priceTo, sort } = {}) {
  const queryParams = new URLSearchParams();

  queryParams.append("page", page);
  if (priceFrom !== undefined)
    queryParams.append("filter[price_from]", priceFrom);
  if (priceTo !== undefined) queryParams.append("filter[price_to]", priceTo);
  if (sort) queryParams.append("sort", sort);

  const response = await fetch(
    `${API_URL}/products?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch products");
  }

  return data;
}

// This functions formats the product's divs

function initProductsList() {
  const productsContainer = document.querySelector("html body main .products");
  if (!productsContainer) return; // stop if container is missing

  productsContainer.innerHTML = ``;

  if (products && products.data) {
    products.data.forEach((e) => {
      productsContainer.innerHTML += `
        <div class="product">
          <div class="top" style="background-image: url(${e.cover_image})"></div>
          <div class="bottom">
            <p class="product-name">${e.name}</p>
            <p class="price">$ ${e.price}</p>
          </div>
        </div>
      `;
    });
  }
}

// Filters the products in terms of a price

async function priceFilter(action, element) {
  const priceFilter = document.getElementById("price-filter");
  const priceFromEl = document.getElementById("price-from");
  const priceToEl = document.getElementById("price-to");

  const priceFrom = Number(priceFromEl.value);
  const priceTo = Number(priceToEl.value);

  // ამოვიღოთ ლინკიდან არსებული sort
  const params = new URLSearchParams(window.location.search);
  const currentSort = params.get("sort") || "price"; // default "price"

  if (!isNaN(priceFrom) && !isNaN(priceTo)) {
    if (action === "add") {
      // sort-იც გადაეცემა
      await loadFilteredProducts(1, priceFrom, priceTo, currentSort);

      chosenFilters(`Price: ${priceFrom}-${priceTo}`, `filter`);
      priceFilter.style.display = "none";

      // ლინკში filter-ის შენახვა
      params.set("price_from", priceFrom);
      params.set("price_to", priceTo);
      // sort უცვლელი რჩება თუ უკვე იყო
      window.history.replaceState({}, "", `?${params.toString()}`);
    } else if (action === "remove") {
      // sort-იც გადაეცემა
      await loadFilteredProducts(1, undefined, undefined, currentSort);

      if (element) {
        element.parentElement.remove();
      }

      // URL-დან წავშალოთ ფასის ფილტრი, მაგრამ sort არ შევეხოთ
      params.delete("price_from");
      params.delete("price_to");
      window.history.replaceState({}, "", `?${params.toString()}`);
    }
  }
}

async function priceSort(value, action, element) {
  const params = new URLSearchParams(window.location.search);
  const sortingFilter = document.getElementById("sorting-filter");

  if (action === "add") {
    if (value) {
      // თუ ლინკში არსებობს price_from და price_to → ამოვიღოთ
      const priceFrom = params.get("price_from")
        ? Number(params.get("price_from"))
        : undefined;
      const priceTo = params.get("price_to")
        ? Number(params.get("price_to"))
        : undefined;

      // მოვუხმოთ loadFilteredProducts
      await loadFilteredProducts(
        undefined, // page default
        priceFrom, // თუ არაა, default გამოიყენება
        priceTo,
        value // sort
      );

      // ლინკში ჩავწეროთ sort
      params.set("sort", value);
      window.history.replaceState({}, "", `?${params.toString()}`);

      chosenFilters(element.innerHTML, `sort`);

      sortingFilter.style.display = "none";
    }
  } else if (action === "remove") {
    if (element) {
      element.parentElement.remove();
    }

    // ლინკიდან წავშალოთ sort
    params.delete("sort");
    window.history.replaceState({}, "", `?${params.toString()}`);

    // თავიდან გავუშვათ default sort-ით
    await loadFilteredProducts();
  }
}

// This function inputs an elemnets inside a container to be seen as a chosen filter and also removes them

function chosenFilters(value, action) {
  let chosenFiltersContainer = document.getElementById("chosen-filters");
  if (!chosenFiltersContainer) return; // prevent error
  let chosenFilterDivs =
    chosenFiltersContainer.querySelectorAll(".chosen-filter");

  if (action == "filter") {
    chosenFilterDivs.forEach((e) => {
      if (/\d/.test(e.innerHTML)) {
        e.parentElement.removeChild(e);
      }
    });

    chosenFiltersContainer.innerHTML += `
      <div class="chosen-filter">
        <span class="chosen-filter-text">${value}</span>
        <img src="./images/deleteSign.svg" alt="Delete Sign" class="delete-sign" onclick="priceFilter('remove', this)"/>
      </div>
    `;
  } else if (action.trim() == "sort") {
    chosenFilterDivs.forEach((e) => {
      if (!/\d/.test(e.innerHTML)) {
        e.parentElement.removeChild(e);
      }
    });

    if (value == "price") {
      value = "Price, low to high";
    }
    else if (value == "-price") {
      value = "Price, high to low";
    }
    else if (value == "created_at") {
      value = "New products first";
    }

    chosenFiltersContainer.innerHTML += `
      <div class="chosen-filter">
        <span class="chosen-filter-text">${value}</span>
        <img src="./images/deleteSign.svg" alt="Delete Sign" class="delete-sign" onclick="priceSort('value', 'remove', this)"/>
      </div>
    `;
  }
}

// Used to recieve products from API and to showcase them as well

async function loadFilteredProducts(
  page = 1,
  from = 0,
  to = 100000000,
  sort = "price"
) {
  try {
    products = await getProducts({
      page: page,
      priceFrom: from,
      priceTo: to,
      sort: sort,
    });

    initProductsList();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// This is the main function of the website

async function main() {
  window.addEventListener("hashchange", router);

  // --- პირველი ჩატვირთვა ---
  document.addEventListener("DOMContentLoaded", () => {
    const init = async () => {
      await router();
      initUserInfo();

      // We are reseicing data from the URL address

      const params = new URLSearchParams(window.location.search);
      const priceFrom = params.get("price_from");
      const priceTo = params.get("price_to");
      const sort = params.get("sort") || "price"; // default sort

      if (priceFrom && priceTo) {
        await loadFilteredProducts(1, Number(priceFrom), Number(priceTo), sort); // This is used to get the products

        chosenFilters(`Price: ${priceFrom}-${priceTo}`, `filter`);
        document.getElementById("price-filter").style.display = "none";

        // ინპუტებში ჩასმა
        document.getElementById("price-from").value = priceFrom;
        document.getElementById("price-to").value = priceTo;
      } else {
        await loadFilteredProducts(1, undefined, undefined, sort);

        chosenFilters(sort, `sort`);
      }

      const beforeLogIn = document.getElementById("before-log-in");
      const mainLogo = document.getElementById("mainLogo");

      if (beforeLogIn) {
        beforeLogIn.addEventListener("click", () => (location.hash = "/auth"));
      }

      if (mainLogo) {
        mainLogo.addEventListener("click", () => (location.hash = "/products"));
      }
    };

    init(); // აქ უკვე რეალურად გაეშვება ყველაფერი
  });

  await loadFilteredProducts();
  const filtering = document.getElementById("filtering");
  const sorting = document.getElementById("sorting");
  const priceFilter = document.getElementById("price-filter");
  const sortingFilter = document.getElementById("sorting-filter");

  if (filtering) {
    filtering.addEventListener("click", () => {
      if (priceFilter) {
        priceFilter.style.display = "flex";
      }

      if (sortingFilter) {
        sortingFilter.style.display = "none";
      }
    });
  }

  if (sorting) {
    sorting.addEventListener("click", () => {
      if (priceFilter) {
        priceFilter.style.display = "none";
      }
      if (priceFilter) {
        sortingFilter.style.display = "flex";
      }
    });
  }
  document.addEventListener("click", (e) => {
    if (
      e.target.closest("#filtering") ||
      e.target.closest("#sorting") ||
      e.target.closest("#priceFilter") ||
      e.target.closest("#sortingFilter")
    ) {
      // თუ დაკლიკებულია #myElement ან მისი შიგნით, იგნორირება
      return;
    }

    priceFilter.style.display = "none";
    sortingFilter.style.display = "none";
  });
}

main();
