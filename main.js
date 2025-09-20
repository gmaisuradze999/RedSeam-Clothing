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

// --- hash ცვლილებაზე loadPage იძახება მხოლოდ router-ის გავლით ---

window.addEventListener("hashchange", router);

// --- პირველი ჩატვირთვა ---
document.addEventListener("DOMContentLoaded", () => {
  router();
  // Click listener მხოლოდ hash-ს ცვლის
  const beforeLogIn = document.getElementById("before-log-in");
  if (beforeLogIn)
    beforeLogIn.addEventListener("click", () => (location.hash = "/auth"));
});