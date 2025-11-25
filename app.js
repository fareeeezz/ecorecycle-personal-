// --- Constants (can be shown in report) ---
const RATE_PER_KG = 0.30;   // RM per kg
const POINTS_PER_KG = 10;   // points per kg
const ADMIN_WA_NUMBER = "60182177535"; 
// tukar ke nombor WhatsApp owner sebenar, format: negara + nombor, tanpa + dan tanpa 0 depan
// contoh Malaysia: 60 + 12xxxxxxx -> 6012xxxxxxx

// --- OOP CLASSES ---

class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class PickupRequest {
  constructor(user, material, weightKg) {
    this.user = user;
    this.material = material;
    this.weightKg = weightKg;
  }
}

class IncentiveCalculator {
  static calculate(request) {
    const totalIncentive = request.weightKg * RATE_PER_KG;
    const points = request.weightKg * POINTS_PER_KG;
    return { totalIncentive, points };
  }
}

// --- Helper functions (Model / Controller style) ---

function saveUser(user) {
  localStorage.setItem('eco_user', JSON.stringify(user));
}

function getUser() {
  const data = localStorage.getItem('eco_user');
  return data ? JSON.parse(data) : null;
}

function saveRequest(request) {
  localStorage.setItem('eco_request', JSON.stringify(request));
}

function getRequest() {
  const data = localStorage.getItem('eco_request');
  return data ? JSON.parse(data) : null;
}

// --- Event handlers ---

function handleLogin(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  const user = new User(name, email);
  saveUser(user);

  // go to next page
  window.location.href = 'request.html';
}

function handleRequestSubmit(event) {
  event.preventDefault();
  const user = getUser();
  if (!user) {
    alert('Sesi tamat. Sila log masuk semula.');
    window.location.href = 'index.html';
    return;
  }

  const material = document.getElementById('material').value;
  const weight = parseFloat(document.getElementById('weight').value);

  const request = new PickupRequest(user, material, weight);
  saveRequest(request);

  window.location.href = 'calculate.html';
}

function displayCalculation() {
  const container = document.getElementById('calcContainer');
  const reqData = getRequest();

  if (!reqData || !container) {
    container.innerHTML = '<p class="text-center">Tiada data. Sila buat request semula.</p>';
    return;
  }

  const user = reqData.user; // object dari localStorage
  const request = new PickupRequest(user, reqData.material, reqData.weightKg);
  const result = IncentiveCalculator.calculate(request);

  const totalRM = result.totalIncentive.toFixed(2);
  const totalPoints = result.points.toFixed(0);

  // --- Teks resit untuk preview / print ---
  const receiptText = `
RESIT PICKUP ECORCYCLE

Nama          : ${user.name}
Emel          : ${user.email}
Jenis barang  : ${request.material}
Berat         : ${request.weightKg} kg
Insentif      : RM ${totalRM}
Mata ganjaran : ${totalPoints}

Terima kasih kerana menyokong kitar semula.
  `.trim();

  // --- Mesej WhatsApp ke owner (alamat dibiarkan kosong) ---
  const waMessage = `
EcoRecycle Pickup Request

Nama: ${user.name}
Emel: ${user.email}
Jenis barang: ${request.material}
Berat: ${request.weightKg} kg
Insentif: RM ${totalRM}
Mata ganjaran: ${totalPoints}
Alamat: 
  `.trim(); // user akan isi address lepas "Alamat: "

  const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(waMessage)}`;

  // --- Papar dalam HTML ---
  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h2 class="mb-4 text-center">Resit & WhatsApp</h2>

        <!-- Card ringkasan resit -->
        <div class="card shadow-sm mb-4" id="receiptCard">
          <div class="card-body">
            <h5 class="card-title">Resit Pickup</h5>
            <p><strong>Nama:</strong> ${user.name}</p>
            <p><strong>Emel:</strong> ${user.email}</p>
            <p><strong>Jenis Barang:</strong> ${request.material}</p>
            <p><strong>Berat:</strong> ${request.weightKg} kg</p>
            <hr>
            <p class="fs-5"><strong>Insentif:</strong> RM ${totalRM}</p>
            <p class="fs-5"><strong>Mata Ganjaran:</strong> ${totalPoints} points</p>
          </div>
        </div>

        <!-- Teks resit untuk copy / simpan -->
        <div class="mb-3">
          <label class="form-label">Teks Resit (boleh copy / simpan)</label>
          <textarea class="form-control" rows="7" readonly>${receiptText}</textarea>
        </div>

        <!-- Seksyen WhatsApp -->
        <h4 class="mb-3">Hantar ke WhatsApp Owner</h4>
        <p class="text-muted">
          Bila tekan butang di bawah, WhatsApp akan terbuka dengan mesej yang sudah diisi
          (nama, emel, jenis barang, berat, harga, mata ganjaran).
          Bahagian <strong>"Alamat:"</strong> dibiarkan kosong supaya anda boleh isi alamat lengkap
          sebelum tekan butang send.
        </p>

        <a href="${waUrl}" target="_blank" class="btn btn-success w-100 mb-2">
          Buka WhatsApp &amp; Isi Alamat
        </a>

        <!-- Print / save sebagai PDF -->
        <button class="btn btn-outline-secondary w-100 mb-2" onclick="window.print()">
          Print / Save Resit sebagai PDF
        </button>

        <a href="request.html" class="btn btn-outline-success w-100 mt-2">
          Buat Request Baru
        </a>
      </div>
    </div>
  `;
}


// --- Attach events based on current page (very simple MVC-style Controller) ---

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    const user = getUser();
    const welcomeText = document.getElementById('welcomeText');
    if (user && welcomeText) {
      welcomeText.textContent = `Hai, ${user.name}. Sila isi maklumat pickup.`;
    }
    requestForm.addEventListener('submit', handleRequestSubmit);
  }

  const calcContainer = document.getElementById('calcContainer');
  if (calcContainer) {
    displayCalculation();
  }
});
