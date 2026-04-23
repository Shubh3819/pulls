let jsonData = [];
let currentOutput = "";

async function loadData() {
  const res = await fetch("http://localhost:5000/data");
  jsonData = await res.json();
  renderData();
}

function renderData() {
  const container = document.getElementById("data-container");
  container.innerHTML = "";

  jsonData.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <span>${JSON.stringify(item)}</span>
      <button onclick="removeItem(${index})">Remove</button>
    `;

    container.appendChild(div);
  });
}

function removeItem(index) {
  jsonData.splice(index, 1);
  renderData();
}

async function submitData() {
  const extra = document.getElementById("extraInput").value;

  const prompt = `
  Data: ${JSON.stringify(jsonData)}
  Requirements: ${extra}
  `;

  const res = await fetch("http://localhost:5000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  let data;

  try {
    data = await res.json();
  } catch (e) {
    const text = await res.text();
    console.error("Raw response:", text);
    alert("Backend error: " + text);
    return;
  }

  if (!res.ok) {
    console.error(data);
    alert("Error: " + (data.error || "Unknown error"));
    return;
  }
  currentOutput = data.output;

  document.getElementById("output").innerText = currentOutput;
}

async function sendFollowup() {
  const follow = document.getElementById("followup").value;

  const prompt = `
  Previous Output: ${currentOutput}
  Modify with: ${follow}
  `;

  const res = await fetch("http://localhost:5000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  currentOutput = data.output;

  document.getElementById("output").innerText = currentOutput;
}

async function downloadPDF() {
  const res = await fetch("http://localhost:5000/download-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: currentOutput }),
  });

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "output.pdf";
  a.click();
}

loadData();
