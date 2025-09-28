let products = [];
let cart = [];
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

      const cardContainer = `
        <div class="card-container">
          <div class="vertical-shopping-container">
            <div class="top">
              <span>Shopping cart (0)</span>
              <img src="./images/xSign.svg" alt="" onclick="controlCardContainer()"/>
            </div>
            <div class="bottom">
              <div class="shopping-cart-container">
                <div class="chosen-products" id="chosen-products-cart">
                </div>
                <div class="totals">
                  
                </div>
              </div>
              <button id="checkout-redirection-button">
                <span>Go to checkout</span>
              </button>
              <div class="empty-cart-container">
                <div class="ooops-container">
                  <img
                    src="./images/cartArtyClickWarmRed.svg"
                    alt="Arty Click Warm Red Cart Icon"
                    id="cart-arty-click-warm-red-icon"
                  />
                  <p class="ooops-text">Ooops!</p>
                  <p class="nothing-yet-box">You've got nothing in your cart just yet...</p>
                </div>
                <button class="start-shopping-button" onclick="listingRedirection()">
                  <span> Start shopping </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      app.innerHTML += cardContainer;

      if (page == "checkoutPage") {
        renderCheckoutCartProducts();
        const subTotal_2 = document.querySelector(
          "#app .checkout-container .bottom .right .info-container .shopping-cart-container .totals"
        );
        renderCardProductTotals(subTotal_2);
      }
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

async function getCart() {
  try {
    // ავიღოთ ტოკენი localStorage-იდან
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch cart");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching cart:", error.message);
    return [];
  }
}

async function updateCartProductQuantity(productId, quantity) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/cart/products/${productId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update product quantity");
    }

    const data = await response.json();

    if (location.hash === "#/checkoutPage") {
      const subTotal_2 = document.querySelector(
        "#app .checkout-container .bottom .right .info-container .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_2);
    } else {
      const subTotal_1 = document.querySelector(
        "#app .card-container .vertical-shopping-container .bottom .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_1);
    }

    return data;
  } catch (error) {
    console.error("Error updating quantity:", error.message);
    return null;
  }
}

async function productDelete(productId, color, size) {
  try {
    const token = localStorage.getItem("token");

    // query params შექმნა
    const queryParams = new URLSearchParams();
    if (color) queryParams.append("color", color);
    if (size) queryParams.append("size", size);

    const url = `${API_URL}/cart/products/${productId}${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete product from cart");
    }

    if (location.hash === "#/checkoutPage") {
      const subTotal_2 = document.querySelector(
        "#app .checkout-container .bottom .right .info-container .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_2);
    } else {
      const subTotal_1 = document.querySelector(
        "#app .card-container .vertical-shopping-container .bottom .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_1);
    }

    return true;
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return false;
  }
}

// ეს ფუნქცია გამოიყენება ელემენტის წაშლისთვის კალათიდან
async function removingProductFromShoppingCart(
  element,
  productId,
  color,
  size
) {
  const deletedProduct = await productDelete(productId, color, size); // ვაგზავნით api - სთან წაშლის მოთხოვნას
  if (deletedProduct) {
    const numberOfProductIndicator = document.querySelector(
      "#app .card-container .vertical-shopping-container .top span .number"
    ); // აქ მოგვაქვს კალათაში საერთო პროდუქტების რაოდენობის რიცხვი

    if (numberOfProductIndicator) {
      numberOfProductIndicator.innerHTML =
        parseInt(numberOfProductIndicator.innerHTML) - 1; // სანამ ელემენტი წაიშლება საერთო რაოდენობას ვიზუალურად ვაკლებთ 1
      if (numberOfProductIndicator.innerHTML == 0) {
        // თუ პროდუქტები განულდა, ვხურავთ ქართის ბარათს.
        controlCardContainer();
      }
    }

    element.remove(); // ვიზუალურად იშლება ელემენტი კალათიდან
  }
}

async function reduceOrAdd(element, value, productId) {
  let quantityChanger = element.querySelector("input");

  let quantity = parseInt(quantityChanger.value);

  if (value === "minus" && quantity > 1) {
    quantity -= 1;
  } else if (value === "plus") {
    quantity += 1;
  }

  let updatedProductInfo = await updateCartProductQuantity(productId, quantity);

  if (updatedProductInfo) {
    if (location.hash === "#/checkoutPage") {
      const subTotal_2 = document.querySelector(
        "#app .checkout-container .bottom .right .info-container .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_2);
    } else {
      const subTotal_1 = document.querySelector(
        "#app .card-container .vertical-shopping-container .bottom .shopping-cart-container .totals"
      );
      await renderCardProductTotals(subTotal_1);
    }

    quantityChanger.value = quantity;

    // ვიპოვოთ პროდუქტის wrapper
    const productWrapper = element.closest(".chosen-product");

    // ავიღოთ ერთეულის ფასი data-price-დან
    const unitPrice = parseFloat(productWrapper.dataset.price);

    // განვაახლოთ ფასის span
    const priceElement = productWrapper.querySelector(
      "#price-of-chosen-product"
    );
    priceElement.textContent = `$ ${unitPrice * quantity}`;

    return quantity;
  }
}

async function renderCardProductTotals(subTotal) {
  cart = await getCart();

  let total = 0;
  let delivery = 5;
  cart.forEach((e) => {
    total += e.total_price;
  });

  subTotal.innerHTML = `
    <div class="suptotal">
      <span>Iteams subtotal</span>
      <span class="iteams-subtotal-number">$ ${total}</span>
    </div>
    <div class="delivery">
      <span>Delivery</span>
      <span class="delivery-total">$ ${delivery}</span>
    </div>
    <div class="total">
      <span>Delivery</span>
      <span class="total-number">$ ${total + delivery}</span>
    </div>
    `;
}

function renderCardProducts(element, cart) {
  element.innerHTML = ``;
  cart.forEach((e) => {
    element.innerHTML += `
      <div class="chosen-product" data-price="${e.price}">
        <div class="left-c" style="background-image: url('${
          e.cover_image
        }')"></div>
        <div class="right-c">
          <div class="name-price">
            <span id="name-of-chosen-product">${e.name}</span>
            <span id="price-of-chosen-product">$ ${e.price * e.quantity}</span>
          </div>
          <p id="color-of-chosen-product">${e.color}</p>
          <p id="size-of-chosen-product">${e.size}</p>
          <div class="increase-remove">
            <div class="flactuation">
              <img
                src="./images/minusSign.svg"
                alt="Minus Sign"
                id="minus-sign"
                onclick="reduceOrAdd(this.parentElement, 'minus', ${e.id})"
              />
              <input
                type="number"
                min="0"
                value="${e.quantity}"
                readonly
                id="number-of-chosen-products"
              />
              <img
                src="./images/plusSign.svg"
                alt="Plus Sign"
                id="plus-sign"
                onclick="reduceOrAdd(this.parentElement, 'plus', ${e.id})"
              />
            </div>
            <span id="removal" onclick="removingProductFromShoppingCart(this.parentElement.parentElement.parentElement, ${
              e.id
            }, '${e.color}','${e.size}')">Removal</span>
          </div>
        </div>
      </div>
    `;
  });
}

async function renderCheckoutCartProducts() {
  cart = await getCart();

  if (cart) {
    const checkoutChosenProducts = document.querySelector(
      "#app .checkout-container .bottom .right .info-container .shopping-cart-container .chosen-products"
    );
    if (checkoutChosenProducts) {
      renderCardProducts(checkoutChosenProducts, cart);
    }
  }
}

async function controlCardContainer() {
  let cardContainer = document.querySelector("#app .card-container");

  if (!cardContainer.style.display) {
    const numberOfProductIndicator = document.querySelector(
      "#app .card-container .vertical-shopping-container .top span"
    );
    const shoppingCartContainer = document.querySelector(
      "#app .card-container .vertical-shopping-container .bottom .shopping-cart-container"
    );
    const checkoutRedirectionButton = document.querySelector(
      "#app .card-container .vertical-shopping-container .bottom #checkout-redirection-button"
    );
    const emptyCartContainer = document.querySelector(
      "#app .card-container .vertical-shopping-container .bottom .empty-cart-container"
    );
    const startShoppingButton = document.querySelector(
      "#app .card-container .vertical-shopping-container .bottom .start-shopping-button"
    );
    cart = await getCart();

    if (cart.length > 0) {
      const chosenProducts =
        shoppingCartContainer.querySelector(".chosen-products");

      numberOfProductIndicator.innerHTML = `Shopping cart(<span class='number'>${cart.length}</span>)`;

      shoppingCartContainer.style.display = "flex";
      checkoutRedirectionButton.style.display = "block";
      emptyCartContainer.style.display = "none";
      startShoppingButton.style.display = "none";

      renderCardProducts(chosenProducts, cart);
      if (location.hash === "#/checkoutPage") {
        const subTotal_2 = document.querySelector(
          "#app .checkout-container .bottom .right .info-container .shopping-cart-container .totals"
        );
        await renderCardProductTotals(subTotal_2);
      } else {
        const subTotal_1 = document.querySelector(
          "#app .card-container .vertical-shopping-container .bottom .shopping-cart-container .totals"
        );
        await renderCardProductTotals(subTotal_1);
      }
    } else {
      numberOfProductIndicator.innerHTML = `Shopping cart(<span class='number'>0</span>)`;
      shoppingCartContainer.style.display = "none";
      checkoutRedirectionButton.style.display = "none";
      emptyCartContainer.style.display = "flex";
      startShoppingButton.style.display = "block";
    }
    cardContainer.style.display = "flex";
  } else {
    cardContainer.style.display = "";
  }
}

// Indicating which page must be loaded first when a user enters the website

async function router() {
  const hash = location.hash.replace("#/", "") || "products";
  let page = hash.split("/")[0];

  // mapping: product → productPage.html
  if (page === "product") page = "productPage";

  await loadingPage(page);

  // --- Products გვერდი ---
  if (hash === "products") {
    const params = new URLSearchParams(window.location.search);
    const priceFrom = params.get("price_from");
    const priceTo = params.get("price_to");
    const sort = params.get("sort") || "price";
    let currentPage = parseInt(params.get("page")) || 1;
    if (currentPage < 1) currentPage = 1;

    if (priceFrom !== null && priceTo !== null) {
      await loadFilteredProducts(
        currentPage,
        Number(priceFrom),
        Number(priceTo),
        sort
      );
      chosenFilters(sort, "sort");
      chosenFilters(`Price: ${priceFrom}-${priceTo}`, "filter");
    } else {
      await loadFilteredProducts(currentPage, undefined, undefined, sort);
      chosenFilters(sort, "sort");
    }

    renderPagination();

    // --- Product detail გვერდი ---
  } else if (hash.startsWith("product/")) {
    const productId = hash.split("/")[1];
    if (productId) {
      await forwardToProductPage(productId);
    }
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

async function getProduct(id) {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch product");
    }

    return data; // აქ გაქვს კონკრეტული პროდუქტის ინფორმაცია
  } catch (error) {
    console.error("Error fetching product:", error.message);
    throw error;
  }
}

// ამ ფუნქციაში არის ლოგიკა, როცა ფოტო იცვლება ფერიც შესაბამისი დგება, როცა ფერი იცვლება ფოტო შესაბამისი დგება.
function pictureChanger(element, type) {
  const displayedPicture = document.getElementById("displayed-picture");

  if (type === "img") {
    // img → მისი მშობელი .pickable-picture
    const pictureDiv = element.parentElement;
    const parent = pictureDiv.parentElement;
    const children = Array.from(parent.querySelectorAll(".pickable-picture"));
    const index = children.indexOf(pictureDiv);

    // სურათის დაყენება
    if (displayedPicture) {
      displayedPicture.style.backgroundImage = element.style.backgroundImage;
    }

    // შესაბამისი ფერის border-ის დაყენება
    const colorBorders = document.querySelectorAll(
      "#information-box .pickable-colors > div"
    );
    if (colorBorders[index]) {
      colorBorders.forEach((c) => c.classList.remove("border"));
      colorBorders[index].classList.add("border");
    }
  } else if (type === "color") {
    const borderDiv = element.parentElement; // border wrapper
    const parent = borderDiv.parentElement; // .pickable-colors
    const children = Array.from(parent.children);
    const index = children.indexOf(borderDiv);

    // ფერის border-ის დაყენება
    children.forEach((c) => c.classList.remove("border"));
    borderDiv.classList.add("border");

    // შესაბამისი სურათის დაყენება
    const pictures = document.querySelectorAll(
      "#pickable-pictures .pickable-picture .img"
    );
    if (pictures[index] && displayedPicture) {
      displayedPicture.style.backgroundImage =
        pictures[index].style.backgroundImage;
    }
  }
}

async function forwardToProductPage(id) {
  if (!id) return;

  location.hash = `/product/${id}`;

  setTimeout(async () => {
    const displayedPicture = document.getElementById("displayed-picture");
    const productName = document.querySelector(
      "#information-box .product-name span"
    );
    const productPrice = document.querySelector(
      "#information-box .product-price span"
    );
    const colorIndicator = document.querySelector(
      "#information-box .color-indicator span:nth-child(2)"
    );
    const pickableColors = document.querySelector(
      "#information-box .pickable-colors"
    );
    const sizeIndicator = document.querySelector(
      "#information-box .size-indicator span:nth-child(2)"
    );
    const pickableSizes = document.querySelector(
      "#information-box .pickable-sizes"
    );
    const numberOfProduct = document.getElementById("number-of-product");
    const brandImg = document.getElementById("brand-img");
    const brandName = document.getElementById("brand-name");
    const brandDescription = document.getElementById("brand-description");
    const pickablePictures = document.querySelector("#pickable-pictures");

    const productInfo = await getProduct(id);

    // --- აქ არის გამოსავალი: ჯერ ვასუფთავებთ ---
    pickablePictures.innerHTML = "";
    pickableColors.innerHTML = "";
    pickableSizes.innerHTML = "";
    numberOfProduct.innerHTML = "";
    brandImg.innerHTML = "";
    brandName.innerHTML = "";
    brandDescription.innerHTML = "";

    if (productInfo.cover_image) {
      displayedPicture.style.backgroundImage = `url("${productInfo.cover_image}")`;
    }

    // Images
    if (productInfo.images) {
      productInfo.images.forEach((img) => {
        pickablePictures.innerHTML += `
          <div class="pickable-picture">
              <div class="img" 
                  style="background-image: url('${img}')"
                  onclick="pictureChanger(this,'img')">
              </div>
          </div>
        `;
      });
    }

    // Name
    if (productInfo.name) {
      productName.innerHTML = productInfo.name;
    }

    // Price
    if (productPrice) {
      productPrice.innerHTML = `$ ${productInfo.price}`;
    }

    // Colors
    if (productInfo.available_colors) {
      productInfo.available_colors.forEach((color) => {
        let border = document.createElement("div");
        let pickableColor = document.createElement("div");
        pickableColor.classList.add("pickable-color");

        border.setAttribute("name", color);
        pickableColor.style.backgroundColor = color;
        pickableColor.onclick = () => {
          const borders = pickableColors.querySelectorAll(".border");
          borders.forEach((e) => e.classList.remove("border"));
          border.classList.add("border");
          colorIndicator.innerHTML = border.getAttribute("name");
          pictureChanger(pickableColor, "color");
        };

        border.appendChild(pickableColor);
        pickableColors.appendChild(border);
      });

      const first = pickableColors.querySelector("div:first-child");
      if (first) {
        first.classList.add("border");
        colorIndicator.innerHTML = productInfo.available_colors[0];
      }
    }

    // Sizes
    if (productInfo.available_sizes) {
      productInfo.available_sizes.forEach((size) => {
        let pickableSize = document.createElement("div");
        pickableSize.classList.add("pickable-size");
        let button = document.createElement("button");
        let span = document.createElement("span");

        span.innerHTML = size;
        button.appendChild(span);
        button.onclick = () => {
          let activeButtons = pickableSizes.querySelectorAll(
            ".button-active-class"
          );
          activeButtons.forEach((e) =>
            e.classList.remove("button-active-class")
          );
          sizeIndicator.innerHTML = size;
          button.classList.add("button-active-class");
        };

        pickableSize.appendChild(button);
        pickableSizes.appendChild(pickableSize);
      });
    }

    // Quantity
    if (productInfo.quantity) {
      for (let i = 0; i < productInfo.quantity; i++) {
        let option = document.createElement("option");
        option.value = i + 1;
        option.innerHTML = i + 1;
        numberOfProduct.appendChild(option);
      }
    }

    // Brand
    if (productInfo.brand.image) {
      let brandPicture = document.createElement("img");
      brandPicture.src = productInfo.brand.image;
      brandImg.appendChild(brandPicture);
    }

    if (productInfo.brand.name) {
      brandName.innerHTML = `Brand: ${productInfo.brand.name}`;
    }

    if (productInfo.description) {
      brandDescription.innerHTML = productInfo.description;
    }
  }, 100);
}

// This functions formats the product's divs

function initProductsList() {
  const productsContainer = document.querySelector("html body main .products");
  if (!productsContainer) return; // stop if container is missing

  productsContainer.innerHTML = ``;

  if (products && products.data) {
    products.data.forEach((e) => {
      productsContainer.innerHTML += `
        <div class="product" onclick="forwardToProductPage(${e.id})">
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

      await chosenFilters(`Price: ${priceFrom}-${priceTo}`, `filter`);
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

    renderPagination();
  }

  // changePage(1)
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

      await chosenFilters(element.innerHTML, `sort`);

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

async function chosenFilters(value, action) {
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
    } else if (value == "-price") {
      value = "Price, high to low";
    } else if (value == "created_at") {
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
    // changePage(1);
    // renderPagination();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// This function is a supplementary function to pagination() and is used to change pages visa arrow right and left symbols

function arrowPagination(value) {
  let activePage = document.querySelector(
    "html body main .pagination-container .pagination .active-page"
  );

  if (value == "next" && Number(activePage.nextElementSibling.innerHTML)) {
    pagination(activePage.nextElementSibling);
  } else if (value == "previous") {
    if (Number(activePage.previousElementSibling.innerHTML)) {
      pagination(activePage.previousElementSibling);
    } else {
      const page_1 = document.querySelector(
        "html body main .pagination-container .pagination .page:nth-child(2)"
      );
      const page_2 = document.querySelector(
        "html body main .pagination-container .pagination .page:nth-child(3)"
      );
      const threeDots = document.querySelector(
        "html body main .pagination-container .pagination .three-dots"
      );
      const page_4 = document.querySelector(
        "html body main .pagination-container .pagination .page:nth-child(5)"
      );
      const page_5 = document.querySelector(
        "html body main .pagination-container .pagination .page:nth-child(6)"
      );

      changePage(parseInt(page_1.innerHTML) - 1);

      if (parseInt(page_1.innerHTML) == 1) {
        return 0;
      }

      if (parseInt(page_1.innerHTML) + 3 == parseInt(page_4.innerHTML)) {
        threeDots.innerHTML = `...`;
      }
      if (parseInt(page_1.innerHTML) > 1) {
        page_2.innerHTML = page_1.innerHTML;
        page_1.innerHTML = parseInt(page_1.innerHTML) - 1;
      }
    }
  }
}

// This function is used to determine what kind of page we are in

function changePage(page) {
  const pages = document.querySelectorAll(
    "html body main .pagination-container .pagination span"
  );
  const page_4 = document.querySelector(
    "html body main .pagination-container .pagination .page:nth-child(5)"
  );
  const page_5 = document.querySelector(
    "html body main .pagination-container .pagination .page:nth-child(6)"
  );
  const url = new URL(window.location); // ამჟამინდელი მისამართი
  const params = url.searchParams;
  const priceFrom = params.get("price_from");
  const priceTo = params.get("price_to");
  const sort = params.get("sort") || "price"; // default sort

  params.set("page", page); // page query-ს ჩასმა/შეცვლა

  // მისამართის განახლება (reload-ის გარეშე)
  window.history.pushState({}, "", url);

  if (priceFrom && priceTo) {
    loadFilteredProducts(page, Number(priceFrom), Number(priceTo), sort);
  } else {
    loadFilteredProducts(page, undefined, undefined, sort);
  }
}

// This is a secondary function to the pagination() used alongside it to render the pages icons at the bottom of the website

function renderPagination() {
  let productIndicator = document.getElementById("productsIndicator");
  let paginationContainer = document.querySelector(
    "html body main .pagination-container .pagination"
  );

  if (!productIndicator || !paginationContainer) return;

  // ამოვიღოთ page query param
  const params = new URLSearchParams(window.location.search);
  let currentPage = parseInt(params.get("page")) || 1;

  productIndicator.innerHTML = `
    Showing 1–${products.meta.per_page} of ${products.meta.total} results
  `;

  if (products.meta.last_page >= 6) {
    paginationContainer.innerHTML = `
      <img src="./images/arrowLeft.svg" alt="" id="arrow-left" onclick="arrowPagination('previous')"/>
      <span class="page ${
        currentPage === 1 ? "active-page" : ""
      }" onclick="pagination(this)">1</span>
      <span class="page ${
        currentPage === 2 ? "active-page" : ""
      }" onclick="pagination(this)">2</span>
      <span class="page three-dots"> ... </span>
      <span class="page ${
        currentPage === products.meta.last_page - 1 ? "active-page" : ""
      }" onclick="pagination(this)">${products.meta.last_page - 1}</span>
      <span class="page ${
        currentPage === products.meta.last_page ? "active-page" : ""
      }" onclick="pagination(this)">${products.meta.last_page}</span>
      <img src="./images/arrowRight.svg" alt="" id="arrow-right" onclick="arrowPagination('next')"/>
    `;
  } else {
    paginationContainer.innerHTML = ``;
    let img_1 = document.createElement("img");
    let img_2 = document.createElement("img");
    img_1.src = `./images/arrowLeft.svg`;
    img_2.src = `./images/arrowRight.svg`;
    img_1.onclick = () => {
      arrowPagination("previous");
    };
    img_2.onclick = () => {
      arrowPagination("next");
    };
    paginationContainer.appendChild(img_1); // პირველი მიმთითებელი
    for (let i = 0; i < products.meta.last_page; i++) {
      let span = document.createElement("span");
      span.classList.add("page");
      span.innerHTML = `${i + 1}`;

      // თუ ეს გვერდი ემთხვევა URL-ში არსებულ page-ს → active-page
      if (i + 1 === currentPage) {
        span.classList.add("active-page");
      }

      span.onclick = () => {
        pagination(span);
      };
      paginationContainer.appendChild(span);
    }
    paginationContainer.appendChild(img_2); // მეორე მიმთითებელი
  }
}

// Main pagaination function

function pagination(element) {
  const pages = document.querySelectorAll(
    "html body main .pagination-container .pagination span"
  );

  const activePage = document.querySelector(
    "html body main .pagination-container .pagination .active-page"
  );

  if (activePage == element) {
    return 0;
  }

  pages.forEach((e) => {
    e.classList.remove("active-page");
  });

  if (
    pages.length > 4 &&
    parseInt(element.innerHTML) < parseInt(pages[pages.length - 2].innerHTML)
  ) {
    if (parseInt(pages[4].innerHTML) - 3 <= parseInt(pages[1].innerHTML)) {
      element.classList.add("active-page");
    } else {
      if (element == pages[1]) {
        pages[0].innerHTML = pages[1].innerHTML;
        pages[1].innerHTML = parseInt(pages[1].innerHTML) + 1;
        pages[0].classList.add("active-page");
      }

      if (parseInt(pages[0].innerHTML) + 3 == parseInt(pages[3].innerHTML)) {
        pages[2].innerHTML = parseInt(pages[0].innerHTML) + 2;
      }
    }
  } else {
    element.classList.add("active-page");

    if (pages.length >= 4) {
      pages[2].innerHTML = parseInt(pages[3].innerHTML) - 1;
      pages[1].innerHTML = parseInt(pages[3].innerHTML) - 2;
      pages[0].innerHTML = parseInt(pages[3].innerHTML) - 3;
    }
  }

  changePage(parseInt(element.innerHTML));
}

// This function's sole purpose is to redirect the webuser into the main page

function listingRedirection() {
  window.location.href = "index.html";
}

async function addProductToCart(productId, quantity = 1, color, size) {
  try {
    // ავიღოთ ტოკენი localStorage-იდან
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/cart/products/${productId}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // აქ ემატება ტოკენი
      },
      body: JSON.stringify({
        quantity: quantity,
        color: color,
        size: size,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add product to cart");
    }

    const data = await response.json();

    controlCardContainer();

    return data;
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    return null;
  }
}

function getProductIdFromQueryParams() {
  const hash = window.location.hash; // "#/product/12"
  const path = hash.replace("#", ""); // "/product/12"
  const parts = path.split("/"); // ["", "product", "12"]

  // სტრინგის ამოღება
  const idString = parts[2]; // "12"

  // რიცხვად გადაყვანა
  const productId = parseInt(idString, 10); // 12 (number)

  return productId;
}

async function addProductToCartInfoRedirection() {
  const colorIndicator = document.querySelector(
    "#information-box .color-indicator span:nth-child(2)"
  ).innerHTML;
  const sizeIndicator = document.querySelector(
    "#information-box .size-indicator span:nth-child(2)"
  ).innerHTML;
  const numberOfProduct = document.getElementById("number-of-product").value;
  const productId = getProductIdFromQueryParams();

  if (colorIndicator && sizeIndicator && numberOfProduct && productId) {
    let product = await addProductToCart(
      productId,
      numberOfProduct,
      colorIndicator,
      sizeIndicator
    );
  }
}

async function checkoutCart(userData) {
  const errorText = document.getElementById("error-text");
  const token = localStorage.getItem("token");

  errorText.innerHTML = ``;

  const response = await fetch(`${API_URL}/cart/checkout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData), // 👈 აქ ვაგზავნით მონაცემებს
  });

  if (!response.ok) {
    const errorData = await response.json(); // ნახე რატომ დააბრუნა 422
    errorText.innerHTML = `
    * Error: ${errorData.message}
    `;
    console.error("Checkout error details:", errorData);
    throw new Error("Checkout failed");
  }

  const data = await response.json();
  console.log("Checkout success:", data);

  const congratulationsContainer = document.getElementById(
    "congratulations-container"
  );
  congratulationsContainer.style.display = "flex";

  return data;
}

async function pay() {
  const nameInput = document.getElementById("name-input");
  const surnameInput = document.getElementById("surname-input");
  const emailInput = document.getElementById("email-input");
  const addressInput = document.getElementById("address-input");
  const zipCodeInput = document.getElementById("zip-code-input");

  if (!nameInput.value) {
    nameInput.style.border = "1px solid #ff4000";

    return;
  } else {
    nameInput.style.border = "1px solid #e1dfe1";
  }

  if (!surnameInput.value) {
    surnameInput.style.border = "1px solid #ff4000";

    return;
  } else {
    surnameInput.style.border = "1px solid #e1dfe1";
  }

  if (!emailInput.value) {
    emailInput.style.border = "1px solid #ff4000";

    return;
  } else {
    emailInput.style.border = "1px solid #e1dfe1";
  }

  if (!addressInput.value) {
    addressInput.style.border = "1px solid #ff4000";

    return;
  } else {
    addressInput.style.border = "1px solid #e1dfe1";
  }

  if (!zipCodeInput.value) {
    zipCodeInput.style.border = "1px solid #ff4000";

    return;
  } else {
    zipCodeInput.style.border = "1px solid #e1dfe1";
  }

  // ... შენი ვალიდაციები რჩება იგივე ...

  const userData = {
    name: nameInput.value,
    surname: surnameInput.value,
    email: emailInput.value,
    address: addressInput.value,
    zip_code: zipCodeInput.value,
  };

  await checkoutCart(userData);
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

      renderPagination();

      const beforeLogIn = document.getElementById("before-log-in");
      const mainLogo = document.getElementById("mainLogo");
      const checkout = document.getElementById("checkout-redirection-button");

      if (beforeLogIn) {
        beforeLogIn.addEventListener("click", () => (location.hash = "/auth"));
      }

      if (mainLogo) {
        mainLogo.addEventListener("click", () => {
          listingRedirection();
        });
      }

      document.addEventListener("click", (e) => {
        if (e.target.closest("#checkout-redirection-button")) {
          location.hash = "/checkoutPage";
        }
      });
    };

    init(); // აქ უკვე რეალურად გაეშვება ყველაფერი
  });

  const params = new URLSearchParams(window.location.search);

  const priceFrom = params.get("price_from");
  const priceTo = params.get("price_to");
  const sort = params.get("sort") || "price"; // default sort

  // აქ ვიღებთ გვერდს სწორად
  let page = parseInt(params.get("page")) || 1;
  if (page < 1) page = 1;

  if (priceFrom !== null && priceTo !== null) {
    products = await loadFilteredProducts(
      page,
      Number(priceFrom),
      Number(priceTo),
      sort
    );

    chosenFilters(sort, "sort");
    chosenFilters(`Price: ${priceFrom}-${priceTo}`, "filter");

    const pf = document.getElementById("price-filter");
    if (pf) pf.style.display = "none";

    // ინპუტებში ჩასმა
    const pfInput = document.getElementById("price-from");
    const ptInput = document.getElementById("price-to");
    if (pfInput) pfInput.value = priceFrom;
    if (ptInput) ptInput.value = priceTo;
  } else {
    products = await loadFilteredProducts(page, undefined, undefined, sort);
    chosenFilters(sort, "sort");
  }

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

    if (priceFilter) {
      priceFilter.style.display = "none";
    }
    if (sortingFilter) {
      sortingFilter.style.display = "none";
    }
  });
  renderPagination();
}

main();
