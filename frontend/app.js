const API = "https://YOUR-BACKEND.onrender.com/api";

async function load() {
  const res = await fetch(API + "/content");
  const data = await res.json();

  document.getElementById("home").innerText = data.home;
  document.getElementById("about").innerText = data.about;
}

load();
