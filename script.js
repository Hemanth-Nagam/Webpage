/* Navigation */
function openBlock(id) {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById(id).style.display = "block";

  if (id === "mapBlock") {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }
}

function closeBlock() {
  document.querySelectorAll(".expand").forEach((e) => {
    e.style.display = "none";
  });

  document.getElementById("dashboard").style.display = "block";
}

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyAfRYSlZU5LQWmnQIoNayaO4rVUbIjLVLY",
  authDomain: "pond-c58c4.firebaseapp.com",
  databaseURL: "https://pond-c58c4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pond-c58c4",
  storageBucket: "pond-c58c4.firebasestorage.app",
  messagingSenderId: "231727431743",
  appId: "1:231727431743:web:8f5186efce508ba348788a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const ref = firebase.database().ref("loradata");

/* Firebase Connection */
const connectedRef = firebase.database().ref(".info/connected");

connectedRef.on("value", (snap) => {
  if (snap.val() === true) {
    document.getElementById("deviceStatus").innerHTML = "🟢 online";
  } else {
    document.getElementById("deviceStatus").innerHTML = "🔴 offline";
  }
});

/* Arrays */
let labels = [];
let waterValues = [];
let historyData = [];

/* Chart */
const chart = new Chart(document.getElementById("chart"), {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Water Level (cm)",
        data: waterValues,
        borderColor: "blue",
        backgroundColor: "blue",
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      mode: "index",
      intersect: false
    },
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#1a73e8",
        borderWidth: 1,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold"
        },
        bodyFont: {
          size: 13
        },
        padding: 10,
        callbacks: {
          title: function (context) {
            return "Time : " + context[0].label;
          },
          label: function (context) {
            return "Water Level : " + context.parsed.y + " cm";
          }
        }
      }
    },
    hover: {
      mode: "nearest",
      intersect: true
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 540,
        title: {
          display: true,
          text: "Water Level (cm)"
        }
      },
      x: {
        title: {
          display: true,
          text: "Time"
        }
      }
    }
  }
});

/* Coordinates */
const sensorLat = 13.715955;
const sensorLng = 79.594557;

const gatewayLat = 13.714978467448718;
const gatewayLng = 79.59132112559648;

/* Distance Calculation */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;

  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;

  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* Distance */
const distance = calculateDistance(
  sensorLat,
  sensorLng,
  gatewayLat,
  gatewayLng
);

const distanceText = Math.round(distance) + " m";

/* Midpoint */
const midLat = (sensorLat + gatewayLat) / 2;
const midLng = (sensorLng + gatewayLng) / 2;

/* Small Map */
const mapSmall = L.map("mapSmall").setView([13.7155, 79.593], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
  mapSmall
);

L.marker([sensorLat, sensorLng]).addTo(mapSmall).bindPopup("Water Level Sensor");

L.marker([gatewayLat, gatewayLng]).addTo(mapSmall).bindPopup("LoRa Gateway");

L.polyline(
  [
    [sensorLat, sensorLng],
    [gatewayLat, gatewayLng]
  ],
  {
    color: "blue",
    weight: 4
  }
).addTo(mapSmall);

L.marker([midLat, midLng], {
  icon: L.divIcon({
    className: "distance-label",
    iconSize: [100, 30],
    iconAnchor: [50, 15],
    html: `
      <div style="
        background:white;
        padding:4px 8px;
        border-radius:15px;
        font-size:12px;
        font-weight:bold;
        border:1px solid #333;
        text-align:center;
      ">
        ${distanceText}
      </div>
    `
  })
}).addTo(mapSmall);

/* Main Map */
const map = L.map("map").setView([13.7155, 79.593], 15);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

L.marker([sensorLat, sensorLng]).addTo(map).bindPopup("Water Level Sensor");

L.marker([gatewayLat, gatewayLng]).addTo(map).bindPopup("LoRa Gateway");

L.polyline(
  [
    [sensorLat, sensorLng],
    [gatewayLat, gatewayLng]
  ],
  {
    color: "blue",
    weight: 5
  }
).addTo(map);

L.marker([midLat, midLng], {
  icon: L.divIcon({
    className: "distance-label",
    iconSize: [130, 35],
    iconAnchor: [65, 18],
    html: `
      <div style="
        background:white;
        padding:6px 10px;
        border-radius:20px;
        font-size:14px;
        font-weight:bold;
        border:2px solid #333;
        text-align:center;
        box-shadow:0 2px 5px rgba(0,0,0,0.3);
      ">
        Distance: ${distanceText}
      </div>
    `
  })
}).addTo(map);

/* Table */
const table = document.getElementById("dataTable");

/* CSV Download */
function downloadCSV() {
  let csv = "Date,Time,WaterLevel(cm)\n";

  historyData.forEach((item) => {
    csv += `${item.date},${item.time},${item.waterLevel}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "water_level_last_24_hours.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Load Last 24 Hours Data */
ref.once("value", function (snapshot) {

  labels = [];
  waterValues = [];
  historyData = [];

  table.innerHTML = `
    <tr>
      <th>Date & Time</th>
      <th>Water Level</th>
    </tr>
  `;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let sortedData = [];

  snapshot.forEach(function (childSnapshot) {

    const data = childSnapshot.val();

    if (!data?.uplink_message?.received_at) return;

    const distance = data?.uplink_message?.decoded_payload?.distance_cm ?? 0;

    if (distance === 0) return;

    let waterLevel = 540 - distance;

    if (waterLevel < 0) {
      waterLevel = 0;
    }

    const waterLevelMeter = (waterLevel / 100).toFixed(2);

    const timestamp = data.uplink_message.received_at;

    const firebaseDate = new Date(timestamp);

    if (firebaseDate >= oneDayAgo) {

      sortedData.push({
        firebaseDate,
        waterLevel,
        waterLevelMeter,
        data
      });
    }
  });

  /* SORT DATA BY TIME */
  sortedData.sort((a, b) => a.firebaseDate - b.firebaseDate);

  sortedData.forEach((item) => {

    const date = item.firebaseDate.toLocaleDateString();
    const time = item.firebaseDate.toLocaleTimeString();

    historyData.push({
      date: date,
      time: time,
      waterLevel: item.waterLevel
    });

    document.getElementById("waterLevelText").innerHTML =
      "Water Level: " + item.waterLevel + " cm (" + item.waterLevelMeter + " m)";

    document.getElementById("distanceLarge").innerHTML =
      "Water Level: " + item.waterLevel + " cm (" + item.waterLevelMeter + " m)";

    document.getElementById("lastUpdate").innerHTML = time;

    const rssi = item.data?.uplink_message?.rx_metadata?.[0]?.rssi ?? "--";
    const snr = item.data?.uplink_message?.rx_metadata?.[0]?.snr ?? "--";

    document.getElementById("rssiValue").innerHTML = rssi + " dBm";
    document.getElementById("snrValue").innerHTML = snr + " dB";

    labels.push(time);
    waterValues.push(item.waterLevel);

    if (labels.length > 20) {
      labels.shift();
      waterValues.shift();
    }

    const row = table.insertRow(-1);

    row.insertCell(0).innerHTML = date + " " + time;
    row.insertCell(1).innerHTML = item.waterLevel + " cm";
  });

  chart.data.labels = labels;
  chart.data.datasets[0].data = waterValues;
  chart.update();
});

/* Live Updates */
ref.limitToLast(1).on("child_added", function (snapshot) {
  const data = snapshot.val();

  const distance = data?.uplink_message?.decoded_payload?.distance_cm ?? 0;

  if (distance === 0) return;

  let waterLevel = 540 - distance;

  if (waterLevel < 0) {
    waterLevel = 0;
  }

  const waterLevelMeter = (waterLevel / 100).toFixed(2);

  const timestamp = data?.uplink_message?.received_at || new Date().toISOString();

  const firebaseDate = new Date(timestamp);

  const date = firebaseDate.toLocaleDateString();
  const time = firebaseDate.toLocaleTimeString();

  document.getElementById("waterLevelText").innerHTML =
    "Water Level: " + waterLevel + " cm (" + waterLevelMeter + " m)";

  document.getElementById("distanceLarge").innerHTML =
    "Water Level: " + waterLevel + " cm (" + waterLevelMeter + " m)";

  document.getElementById("lastUpdate").innerHTML = time;

  historyData.push({
    date: date,
    time: time,
    waterLevel: waterLevel
  });

  labels.push(time);
  waterValues.push(waterLevel);

  if (labels.length > 20) {
    labels.shift();
    waterValues.shift();
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = waterValues;
  chart.update();

  const row = table.insertRow(-1);
  row.insertCell(0).innerHTML = date + " " + time;
  row.insertCell(1).innerHTML = waterLevel + " cm";
});