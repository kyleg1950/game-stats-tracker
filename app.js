const MAX_PLAYERS = 10;
const STATS = [
  { key: "points", label: "Points", btn: "+1 Point" },
  { key: "rebounds", label: "Rebounds", btn: "+1 Rebound" },
  { key: "assists", label: "Assists", btn: "+1 Assist" },
  { key: "fouls", label: "Fouls", btn: "+1 Foul" },
  { key: "steals", label: "Steals", btn: "+1 Steal" },
];

const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const teamNameInput = document.getElementById("team-name");
const rosterList = document.getElementById("roster-list");
const rosterCount = document.getElementById("roster-count");
const addPlayerBtn = document.getElementById("add-player");
const startBtn = document.getElementById("start-game");
const endBtn = document.getElementById("end-game");
const gameTitle = document.getElementById("game-title");
const playersBoard = document.getElementById("players-board");

let nextId = 1;
const roster = [];
let players = [];

function emptyStats() {
  return STATS.reduce((acc, s) => ({ ...acc, [s.key]: 0 }), {});
}

function renderRoster() {
  rosterList.innerHTML = "";
  roster.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "roster-row";
    row.innerHTML = `
      <span class="roster-index">${index + 1}</span>
      <div class="field roster-field">
        <label for="player-name-${entry.id}">Name</label>
        <input type="text" id="player-name-${entry.id}" data-field="name" value="${escapeAttr(entry.name)}" placeholder="Player name">
      </div>
      <div class="field roster-field roster-field-number">
        <label for="player-number-${entry.id}">#</label>
        <input type="number" id="player-number-${entry.id}" data-field="number" min="0" value="${escapeAttr(entry.number)}" placeholder="0">
      </div>
      <button type="button" class="button button-ghost roster-remove" aria-label="Remove player">Remove</button>
    `;

    const nameInput = row.querySelector('input[data-field="name"]');
    const numberInput = row.querySelector('input[data-field="number"]');
    nameInput.addEventListener("input", (e) => { entry.name = e.target.value; });
    numberInput.addEventListener("input", (e) => { entry.number = e.target.value; });

    row.querySelector(".roster-remove").addEventListener("click", () => {
      const idx = roster.findIndex((r) => r.id === entry.id);
      if (idx !== -1) roster.splice(idx, 1);
      renderRoster();
    });

    rosterList.appendChild(row);
  });

  rosterCount.textContent = `${roster.length} / ${MAX_PLAYERS} players`;
  addPlayerBtn.disabled = roster.length >= MAX_PLAYERS;
}

function escapeAttr(value) {
  return String(value ?? "").replace(/"/g, "&quot;");
}

function addRosterEntry(prefill = {}) {
  if (roster.length >= MAX_PLAYERS) return;
  roster.push({ id: nextId++, name: prefill.name || "", number: prefill.number || "" });
  renderRoster();
}

function renderBoard() {
  playersBoard.innerHTML = "";
  players.forEach((player) => {
    const card = document.createElement("article");
    card.className = "player-board-card";
    card.innerHTML = `
      <header class="player-board-header">
        <span class="player-jersey">#${escapeAttr(player.number)}</span>
        <h2>${escapeText(player.name)}</h2>
      </header>
      <div class="button-grid">
        ${STATS.map((s) => `<button type="button" class="button stat-btn" data-stat="${s.key}">${s.btn}</button>`).join("")}
      </div>
      <div class="stats-grid">
        ${STATS.map((s) => `<p data-readout="${s.key}">${s.label}: ${player.stats[s.key]}</p>`).join("")}
      </div>
    `;

    card.querySelectorAll("button[data-stat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-stat");
        player.stats[key] += 1;
        const readout = card.querySelector(`p[data-readout="${key}"]`);
        const label = STATS.find((s) => s.key === key).label;
        readout.textContent = `${label}: ${player.stats[key]}`;
      });
    });

    playersBoard.appendChild(card);
  });
}

function escapeText(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

addPlayerBtn.addEventListener("click", () => addRosterEntry());

startBtn.addEventListener("click", () => {
  const team = teamNameInput.value.trim();
  if (!team) {
    alert("Please enter a team name.");
    return;
  }
  if (roster.length === 0) {
    alert("Please add at least one player.");
    return;
  }
  const cleaned = roster.map((r) => ({ name: r.name.trim(), number: String(r.number).trim() }));
  if (cleaned.some((r) => !r.name || !r.number)) {
    alert("Each player needs a name and number.");
    return;
  }

  players = cleaned.map((r) => ({ name: r.name, number: r.number, stats: emptyStats() }));
  gameTitle.textContent = `${team} — ${players.length} player${players.length === 1 ? "" : "s"}`;
  setupScreen.style.display = "none";
  gameScreen.style.display = "block";
  renderBoard();
});

endBtn.addEventListener("click", () => {
  gameScreen.style.display = "none";
  setupScreen.style.display = "block";
});

addRosterEntry();
