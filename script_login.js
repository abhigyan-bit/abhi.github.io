
var categories = [
  { id: "silent", name: "Silent Study", icon: "🤫", prefix: "S", total: 16,
    desc: "For students who need a quiet place to study." },
  { id: "group", name: "Group Discussion", icon: "👥", prefix: "G", total: 12,
    desc: "For group projects and teamwork." },
  { id: "computer", name: "Computer Lab", icon: "💻", prefix: "C", total: 12,
    desc: "For coding, research and computer-based activities." },
  { id: "teachers", name: "Teachers' Section", icon: "🎓", prefix: "T", total: 8,
    desc: "Reserved for teachers and library staff." }
];

// Sample seats that are already booked when the page opens
var alreadyBooked = ["S2", "S3", "S7", "S11", "S12", "G4", "G5", "G9", "C1", "C6", "C7", "T2", "T5"];

var seats = [];              // list of all seat objects
var selectedCategory = "silent";  // category currently shown
var selectedSeat = null;     // seat chosen by the user (or null)

// Build the seats list from the categories
function createSeats() {
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    for (var n = 1; n <= cat.total; n++) {
      var seatId = cat.prefix + n;
      seats.push({
        id: seatId,
        category: cat.id,
        booked: alreadyBooked.indexOf(seatId) !== -1
      });
    }
  }
}

/* ---------- 2. HELPER FUNCTIONS ---------- */
function $(id) { return document.getElementById(id); }

function getCategory(id) {
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === id) return categories[i];
  }
  return null;
}

// Count seats that are free (optionally only for one category)
function countAvailable(categoryId) {
  var count = 0;
  for (var i = 0; i < seats.length; i++) {
    var matches = !categoryId || seats[i].category === categoryId;
    if (matches && !seats[i].booked) count++;
  }
  return count;
}

// Today's date as YYYY-MM-DD using the computer's local time
function todayString() {
  var d = new Date();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

/* ---------- 3. DRAW THE PAGE ---------- */
function drawCategoryCards() {
  var html = "";
  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    html += '<article class="card' + (c.id === selectedCategory ? ' active' : '') + '">' +
      '<div class="icon">' + c.icon + '</div>' +
      '<h3>' + c.name + '</h3>' +
      '<p>' + c.desc + '</p>' +
      '<span class="count">' + countAvailable(c.id) + ' of ' + c.total + ' seats free</span>' +
      '<button class="btn btn-dark" data-category="' + c.id + '">Select category</button>' +
      '</article>';
  }
  $("cardContainer").innerHTML = html;
}

function drawCategoryDropdown() {
  var html = '<option value="">Choose…</option>';
  for (var i = 0; i < categories.length; i++) {
    html += '<option value="' + categories[i].id + '">' + categories[i].name + '</option>';
  }
  $("category").innerHTML = html;
  $("category").value = selectedCategory;
}

function drawSeatMap() {
  var cat = getCategory(selectedCategory);
  var html = "";
  for (var i = 0; i < seats.length; i++) {
    var seat = seats[i];
    if (seat.category !== selectedCategory) continue;   // filter by category

    var state = "available";
    if (seat.booked) state = "booked";
    else if (selectedSeat === seat.id) state = "selected";

    html += '<button type="button" class="seat ' + state + '" data-seat="' + seat.id + '"' +
      (seat.booked ? ' disabled' : '') +
      ' aria-label="Seat ' + seat.id + ', ' + state + '">' + seat.id + '</button>';
  }
  $("seatGrid").innerHTML = html;
  $("mapTitle").textContent = cat.name + " – seat map";
  $("availableCount").textContent = countAvailable(selectedCategory) + " of " + cat.total + " seats available";
}

function drawStats() {
  var free = countAvailable();
  $("statAvailable").textContent = free;
  $("statBooked").textContent = seats.length - free;
  $("statCategories").textContent = categories.length;

  var list = "";
  for (var i = 0; i < categories.length; i++) {
    list += '<div class="mini-row"><span>' + categories[i].name + '</span><strong>' +
      countAvailable(categories[i].id) + '</strong></div>';
  }
  $("heroList").innerHTML = list;
}

// Update the live booking summary box
function drawSummary() {
  var cat = getCategory($("category").value);
  var duration = $("duration").value;
  $("sumSeat").textContent = selectedSeat || "–";
  $("sumCategory").textContent = cat ? cat.name : "–";
  $("sumDate").textContent = $("bookingDate").value || "–";
  $("sumTime").textContent = $("startTime").value || "–";
  $("sumDuration").textContent = duration ? duration + (duration === "1" ? " hour" : " hours") : "–";
  $("seatField").value = selectedSeat || "";
}

// Redraw everything that depends on seat data
function refreshAll() {
  drawCategoryCards();
  drawSeatMap();
  drawStats();
  drawSummary();
}

/* ---------- 4. ACTIONS ---------- */
// Switch the visible category (clears a seat from another category)
function chooseCategory(categoryId) {
  selectedCategory = categoryId;
  var seatObj = null;
  for (var i = 0; i < seats.length; i++) {
    if (seats[i].id === selectedSeat) seatObj = seats[i];
  }
  if (seatObj && seatObj.category !== categoryId) selectedSeat = null;
  $("category").value = categoryId;
  refreshAll();
}

function showError(fieldId, message) {
  var field = $(fieldId);
  field.querySelector(".error").textContent = message;
  field.classList.toggle("invalid", message !== "");
}

function clearErrors() {
  var ids = ["f-name", "f-id", "f-category", "f-date", "f-time", "f-duration", "f-seat"];
  for (var i = 0; i < ids.length; i++) showError(ids[i], "");
}

// Check every field; returns true only if everything is valid
function validateForm() {
  clearErrors();
  var valid = true;
  var name = $("fullName").value.trim();
  var userId = $("userId").value.trim();
  var date = $("bookingDate").value;
  var time = $("startTime").value;

  if (name.length < 3 || !/^[A-Za-z .'-]+$/.test(name)) {
    showError("f-name", "Enter your full name (letters only, at least 3 characters)."); valid = false;
  }
  if (!/^[A-Za-z0-9]{4,15}$/.test(userId)) {
    showError("f-id", "ID must be 4–15 letters or digits, no spaces."); valid = false;
  }
  if ($("category").value === "") {
    showError("f-category", "Please choose a category."); valid = false;
  }
  if (date === "") {
    showError("f-date", "Choose a booking date."); valid = false;
  } else if (date < todayString()) {
    showError("f-date", "Past dates cannot be booked."); valid = false;
  }
  if (time === "") {
    showError("f-time", "Choose a start time."); valid = false;
  } else if (time < "08:00" || time > "20:00") {
    showError("f-time", "Library hours are 08:00 to 20:00."); valid = false;
  } else if (date === todayString()) {
    // If booking for today, the time must not already be over
    var now = new Date();
    var nowText = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    if (time < nowText) { showError("f-time", "That time has already passed today."); valid = false; }
  }
  if ($("duration").value === "") {
    showError("f-duration", "Choose a duration."); valid = false;
  }
  if (!selectedSeat) {
    showError("f-seat", "Select an available seat from the map."); valid = false;
  }
  return valid;
}

// Reset the form and the current seat choice
function clearSelection() {
  $("bookingForm").reset();
  selectedSeat = null;
  clearErrors();
  $("successBox").classList.remove("show");
  chooseCategory(selectedCategory);
}

function confirmBooking(event) {
  event.preventDefault();               // stop the page from reloading
  if (!validateForm()) return;

  // Save the details before the form is reset
  var name = $("fullName").value.trim();
  var seatId = selectedSeat;
  var cat = getCategory($("category").value);
  var date = $("bookingDate").value;
  var time = $("startTime").value;
  var hours = $("duration").value;

  // Mark the seat as booked
  for (var i = 0; i < seats.length; i++) {
    if (seats[i].id === seatId) seats[i].booked = true;
  }

  clearSelection();
  $("successBox").innerHTML = "<h4>Booking confirmed ✔</h4>" +
    "<p>Thank you, <strong>" + name.replace(/</g, "&lt;") + "</strong>. Your seat is reserved.</p>" +
    "<p>Seat <strong>" + seatId + "</strong> · " + cat.name + "<br>" +
    date + " at " + time + " for " + hours + (hours === "1" ? " hour" : " hours") + "</p>";
  $("successBox").classList.add("show");
}

/* ---------- 5. EVENT LISTENERS ---------- */
// Click on a category card button
$("cardContainer").addEventListener("click", function (e) {
  var id = e.target.getAttribute("data-category");
  if (id) {
    chooseCategory(id);
    $("book").scrollIntoView();
  }
});

// Click on a seat
$("seatGrid").addEventListener("click", function (e) {
  var seatId = e.target.getAttribute("data-seat");
  if (!seatId) return;
  for (var i = 0; i < seats.length; i++) {
    if (seats[i].id === seatId && !seats[i].booked) {
      selectedSeat = (selectedSeat === seatId) ? null : seatId;  // click again to un-select
      showError("f-seat", "");
      drawSeatMap();
      drawSummary();
    }
  }
});

// Changing the category dropdown filters the seat map
$("category").addEventListener("change", function () {
  if ($("category").value !== "") chooseCategory($("category").value);
});

// Keep the summary up to date while typing
["bookingDate", "startTime", "duration"].forEach(function (id) {
  $(id).addEventListener("change", drawSummary);
});

$("bookingForm").addEventListener("submit", confirmBooking);
$("clearBtn").addEventListener("click", clearSelection);

/* ---------- 6. START ---------- */
createSeats();
$("bookingDate").min = todayString();   // blocks past dates in the date picker
drawCategoryDropdown();
refreshAll();

/* ============================================================
   LOGIN (demo, no backend)
   Rule: User ID = any whole number, Password = any characters.
   ============================================================ */
(function () {
  var loginView = document.getElementById("loginView");
  var portalView = document.getElementById("portalView");
  var form = document.getElementById("loginForm");
  var userInput = document.getElementById("userId_login");
  var passInput = document.getElementById("password");
  var humanCheck = document.getElementById("humanCheck");
  var humanText = document.getElementById("humanText");
  var verified = false;

  function showPortal(id) {
    $("userBadge").textContent = "\uD83D\uDC64 " + id;   // user icon + ID (top right)
    $("userId").value = id;                              // prefill booking form
    loginView.hidden = true;
    portalView.hidden = false;
    document.title = "StudyNest \u2013 Student Portal";
    window.scrollTo(0, 0);
  }

  function showLogin() {
    portalView.hidden = true;
    loginView.hidden = false;
    document.title = "StudyNest \u2013 Login";
    userInput.value = "";
    passInput.value = "";
    window.scrollTo(0, 0);
  }

  function setError(groupId, errorId, message) {
    document.getElementById(errorId).textContent = message;
    document.getElementById(groupId).classList.toggle("invalid", message !== "");
  }

  // Fake "Verifying..." box (demo): becomes Verified after 1.2 seconds
  setTimeout(function () {
    verified = true;
    humanCheck.classList.add("done");
    humanText.textContent = "Verified";
  }, 1200);

  document.getElementById("togglePass").addEventListener("click", function () {
    passInput.type = passInput.type === "password" ? "text" : "password";
  });

  document.getElementById("forgot").addEventListener("click", function (e) {
    e.preventDefault();
    alert("Demo only \u2013 any password works.");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = userInput.value.trim();
    var ok = true;
    setError("g-user", "e-user", "");
    setError("g-pass", "e-pass", "");
    if (!/^[0-9]+$/.test(id)) { setError("g-user", "e-user", "Enter a valid User ID (numbers only)."); ok = false; }
    if (passInput.value.length === 0) { setError("g-pass", "e-pass", "Enter your password."); ok = false; }
    if (!ok) return;
    try { sessionStorage.setItem("lmsUserId", id); } catch (err) { /* storage blocked - still open portal */ }
    showPortal(id);
  });

  $("logoutBtn").addEventListener("click", function () {
    try { sessionStorage.removeItem("lmsUserId"); } catch (err) {}
    showLogin();
  });

  // On page open: stay logged in if already logged in this tab
  var saved = null;
  try { saved = sessionStorage.getItem("lmsUserId"); } catch (err) {}
  if (saved) { showPortal(saved); }
})();
