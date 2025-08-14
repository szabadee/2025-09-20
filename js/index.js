window.addEventListener("DOMContentLoaded", (event) => {
  event.preventDefault();
  localStorage.setItem("cd", window.location.protocol + "//" + window.location.hostname);
});

let params = new URL(window.location.href).searchParams;
const currentUrl = window.location.href;

const currentEventDate = "2025-05-10 11:00:00";

const getDataApiUrl = "https://www.nics.hu/function/registration-data.aspx";
const createApiUrl = "https://www.nics.hu/function/registration-create-and-modify.aspx";
const updateApiUrl = "https://www.nics.hu/function/registration-create-and-modify.aspx";
const deleteAPiUrl = "https://www.nics.hu/function/registration-delete.aspx";

let customer = {
  customer_id: params.get("cid"),
  event_id: params.get("eid"),
  guest_name: "",
};

let registration = [];
let apiResponse = [];

const form = document.getElementById("regForm");
let regActions = document.getElementById("regActions");
let customerName = document.getElementById("customerName");
let guestName = document.getElementById("guestName");
let createRegBtn = document.getElementById("createRegbtn");
let updateRegBtn = document.getElementById("updateRegBtn");
let deleteRegBtn = document.getElementById("deleteRegBtn");
let customerErrorMessage = document.getElementById("customerErrorMessage");
let guestErrorMessage = document.getElementById("guestErrorMessage");
let messageOnSubmit = document.getElementById("messageOnSubmit");
let regStatusInfo = document.getElementById("regStatusInfo");
let regStatus = document.getElementById("regStatus");
let guestBoxInfo = document.getElementById("guestBoxInfo");
let guestBox = document.getElementById("guestBox");
let guestNameLabel = document.getElementById("guestNameLabel");
let regIcon = document.getElementById("regIcon");
let statusBox = document.getElementById("statusBox");
let counterBox = document.getElementById("counterBox");
let gdpr = document.getElementById("gdpr");
let closedRegBox = document.getElementById("closedRegBox");
let infoSection = document.getElementById("infoSection");
let countdownTimer = document.getElementById("countdownTimer");

let actionName = "";
const defaultRegHour = "08:00:00";

function getActionName(id) {
  actionName = id;
}

function isValidText(text) {
  const textPattern = /[a-zA-Z,.-]+/g;
  return textPattern.test(text);
}

function refreshPage() {
  setTimeout(() => {
    loading();
  }, 9000);
}

function loading() {
  document.getElementById("bx").style.display = "none";
  messageOnSubmit.innerHTML = ``;
  window.open(currentUrl, "_self");
}

// Countdown Timer
function initializeCountdownTimers() {
  const timers = document.querySelectorAll(".countdown-timer");

  timers.forEach((timer) => {
    const dateAttr = timer.getAttribute("data-date");
    const timeAttr = timer.getAttribute("data-time") || "00:00:00";
    const targetDate = new Date(`${dateAttr}T${timeAttr}`).getTime();

    if (isNaN(targetDate)) {
      console.error("Invalid date or time in data attributes:", dateAttr, timeAttr);
      return;
    }

    function swapNumbers(element, value, type) {
      const current = element.querySelector(`.current.${type}`);
      const next = element.querySelector(`.next.${type}`);

      if (current.textContent === value) return;

      next.textContent = value;
      current.classList.add("animate-out");
      next.classList.add("animate-in");

      setTimeout(() => {
        current.textContent = value;
        current.classList.remove("animate-out");
        next.classList.remove("animate-in");

        current.classList.remove("current");
        current.classList.add("next");
        next.classList.remove("next");
        next.classList.add("current");
      }, 500);
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        timer.querySelectorAll(".number-wrapper .current").forEach((span) => (span.textContent = "00"));
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        .toString()
        .padStart(2, "0");
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        .toString()
        .padStart(2, "0");
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        .toString()
        .padStart(2, "0");

      swapNumbers(timer.querySelector(".days").parentElement, days, "days");
      swapNumbers(timer.querySelector(".hours").parentElement, hours, "hours");
      swapNumbers(timer.querySelector(".minutes").parentElement, minutes, "minutes");
      swapNumbers(timer.querySelector(".seconds").parentElement, seconds, "seconds");
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
  });
}

// *** Get customer from DB *** //
if (`${params}` != "") {
  async function postData(url, data) {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
  delete customer.guest_name;

  postData(getDataApiUrl, customer)
    .then((data) => {
      registration = data;

      // let freeSeats = registration.maximum_number_of_registrants - registration.current_number_of_registrants;
      const currentTime = new Date().getTime();
      const closingTime = new Date(registration.event_date.slice(0, 10) + " " + defaultRegHour).getTime();

      if (currentTime > closingTime) {
        registration.status_id = 5;
      }

      if (currentEventDate != registration.event_date) {
        registration.status_id = 0;
      }

      countdownTimer.setAttribute("data-date", registration.event_date.slice(0, 10));
      countdownTimer.setAttribute("data-time", defaultRegHour);
      customerName.innerText = registration.customer_name;
      guestName.value = registration.guest_name;

      initializeCountdownTimers();

      switch (registration.status_id) {
        case 2:
          regActions.innerHTML = `

          <div class="col-lg-4">
            <button type="submit" onclick="getActionName(this.id)" id="createRegBtn" class="btn btn-create">Regisztráció elküldése</button>
          </div>

          `;
          regStatus.innerText = "Még nem jelentkeztél";
          guestBoxInfo.innerHTML = `<span>Ha élsz a lehetőséggel és hozol magaddal egy vagy több érdeklődőt, kérlek, add meg a nevét, <strong>több név esetén, vesszővel elválasztva.</strong></span>`;
          gdpr.innerHTML = `
          
          <p class="small-font">Az előadás helyszínén, az <strong>Adatkezelési tájékoztatónk</strong> elfogadása szükséges, a rendezvényen készült kép-, hang- és videófelvétel felhasználásához kapcsolódóan,
          melyet előzetesen <a href="docs/nics-adatkezelesi-tajekoztato.pdf" target="_blank">ide kattintva</a> tudsz elolvasni.</p>
          `;
          break;
        case 1:
          regActions.innerHTML = `

            <div class="">
              <button type="submit" onclick="getActionName(this.id)" id="updateRegBtn" class="btn btn-update">Regisztráció frissítése</button>
            </div>
            <br>
            <hr>
            <span>Ha valamilyen oknál fogva nem tudsz eljönni az előadásra, kérlek, töröld a regisztrációdat, segítve ezzel a szervezésünket és az előkészületeket.</span>
            <div class="pt-20">
              <button type="submit" onclick="getActionName(this.id)" id="deleteRegBtn" class="btn btn-delete">Regisztráció törlése</button>
            </div>

          `;
          customerName.classList.remove("nonreg-customer-name");
          customerName.classList.add("reg-customer-name");
          guestBox.classList.remove("guest-box-first");
          guestBox.classList.add("guest-box-second");
          regIcon.classList.remove("text-orange");
          regIcon.classList.add("text-green");
          statusBox.classList.remove("nonreg-status-box");
          statusBox.classList.add("reg-status-box");
          regStatus.innerText = "Már elküldted a jelentkezésedet";
          guestBoxInfo.innerHTML = `
          A vendéged/vendégeid nevét utólag is tudod módosítani vagy a részvételét lemondani, úgy hogy <strong>átírod a mezőben a nevet vagy törlöd a mező tartalmát és frissíted a regisztrációdat.</strong>`;
          guestNameLabel.innerText = "Vendéged neve:";
          regIcon.innerText = "check_circle";
          gdpr.innerHTML = `
      
          <p class="small-font">Az előadás helyszínén, az <strong>Adatkezelési tájékoztatónk</strong> elfogadása szükséges, a rendezvényen készült kép-, hang- és videófelvétel felhasználásához kapcsolódóan,
          melyet előzetesen <a href="docs/nics-adatkezelesi-tajekoztato.pdf" target="_blank">ide kattintva</a> tudsz elolvasni.</p>
    
          `;
          break;
        case 0:
          customerName.classList.remove("nonreg-customer-name");
          customerName.classList.add("error-message");
          customerName.innerText = "Nem sikerült az azonosítás!";
          regForm.innerHTML = ``;
          regStatusInfo.innerHTML = ``;
          countdownTimer.innerHTML = ``;
          break;
        case 5:
          infoSection.innerHTML = ``;
          regForm.innerHTML = ``;
          closedRegBox.innerHTML = `
            
            <p class="closed-reg-box text-center">
            <span class="material-icons text-red" id="regIcon">lock</span>
              <span><strong>Ehhez az előadáshoz tartozó jelentkezési felületet már lezártuk!</strong><br>
              <span class="d-block pt-10">A soron következő előadásra egy másik linken keresztül tudsz regisztrálni, mely linkhez a kiküldött email-ben vagy a webirodádban férsz hozzá.</span>
              </span>
            </p>
            
            `;
          break;

        default:
          break;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      console.log(registration);
      console.log(registration.status_message);
      customerName.classList.remove("nonreg-customer-name");
      customerName.classList.add("error-message");
      customerName.innerText = "Nem sikerült az azonosítás!";
      regForm.innerHTML = ``;
      regStatusInfo.innerHTML = ``;
      countdownTimer.innerHTML = ``;
    });
} else {
  console.log("no param in url");
  console.log(registration.status_message);
  customerName.classList.remove("nonreg-customer-name");
  customerName.classList.add("error-message");
  customerName.innerText = "Nem sikerült az azonosítás!";
  regForm.innerHTML = ``;
  regStatusInfo.innerHTML = ``;
  countdownTimer.innerHTML = ``;
}

function clearStorage() {
  if (!localStorage.getItem("storageCreatedAt")) {
    localStorage.setItem("storageCreatedAt", Date.now());
  } else {
    const storageCreatedAt = localStorage.getItem("storageCreatedAt");
    const timePassed = Date.now() - Number(storageCreatedAt);

    if (timePassed > 24 * 60 * 60 * 1000) {
      localStorage.clear();
    }

    return localStorage.getItem("storageCreatedAt");
  }
}
clearStorage();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (guestName.value.trim() !== "" && !isValidText(guestName.value)) {
    guestName.classList.add("input-error");
    guestErrorMessage.innerHTML = `<label class"d-block pt-10">Kérlek, csak betűt adj meg!</label>`;
  } else {
    guestName.classList.remove("input-error");
    guestErrorMessage.textContent = "";
    customer.guest_name = guestName.value;

    // *** Create registration *** //
    if (actionName === "createRegBtn") {
      async function postData(url, data) {
        const response = await fetch(url, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      }

      postData(createApiUrl, customer)
        .then((data) => {
          apiResponse = data;
          if (apiResponse.status_id === 1) {
            refreshPage();
            messageOnSubmit.innerHTML = `
        
            <div class="alert alert-success" role="alert" id="bx">Köszönjük, sikeresen regisztráltál!
              <br>
              <br>
              <div class="loader">
                <div class="bar"></div>
              </div>
              <br>
              <i>Néhány másodperc múlva frissítjük a regisztrációdat, melyet ugyanezen az oldalon <strong>ellenőrizhetsz, módosíthatsz vagy törölhetsz.</strong></i>
            </div>
            
              `;
            document.getElementById("createRegBtn").disabled = true;
          } else {
            messageOnSubmit.innerHTML = `<span class="alert alert-danger" role="alert">Hiba történt a regisztráció során!</span>`;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    // *** Update registration *** //
    if (actionName === "updateRegBtn") {
      async function postData(url, data) {
        const response = await fetch(url, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      }

      postData(updateApiUrl, customer)
        .then((data) => {
          apiResponse = data;
          if (apiResponse.status_id === 1) {
            messageOnSubmit.innerHTML = `
            
            <div class="alert alert-success" role="alert" id="bx">Sikeresen módosítottad a regisztrációdat!
              <br>
              <br>
              <div class="loader">
                <div class="bar"></div>
              </div>
              <br>
              <i>Néhány másodperc múlva frissítjük a regisztrációdat, melyet ugyanezen az oldalon <strong>ellenőrizhetsz, módosíthatsz vagy törölhetsz.</strong></i>
            </div>
            
            `;
            document.getElementById("updateRegBtn").disabled = true;
            document.getElementById("deleteRegBtn").disabled = true;
            refreshPage();
          } else {
            messageOnSubmit.innerHTML = `<span class="alert alert-danger" role="alert">Hiba történt a regisztráció módosítása során!</span>`;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    // *** Delete registration *** //
    if (actionName === "deleteRegBtn") {
      async function postData(url, data) {
        const response = await fetch(url, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      }

      postData(deleteAPiUrl, customer)
        .then((data) => {
          apiResponse = data;
          if (apiResponse.status_id === 1) {
            messageOnSubmit.innerHTML = `
            
            <div class="alert alert-success" role="alert" id="bx">Sikeresen törölted a regisztrációdat!
              <br>
              <br>
              <div class="loader">
                <div class="bar"></div>
              </div>
              <br>
              <i>Néhány másodperc múlva frissítjük a regisztrációd állapotát, melyet ugyanezen az oldalon <strong>ellenőrizhetsz, illetve igény esetén újra regisztrálhatsz.</strong></i>
            </div>
            
            `;
            document.getElementById("updateRegBtn").disabled = true;
            document.getElementById("deleteRegBtn").disabled = true;
            refreshPage();
          } else {
            messageOnSubmit.innerHTML = `<span class="alert alert-danger" role="alert">Hiba történt a regisztráció törlése során!</span>`;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
});
