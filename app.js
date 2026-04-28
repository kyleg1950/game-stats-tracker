import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDpJvZFbQiTf9K-L7J9fK3N8pX5qR1vZ9E",
    authDomain: "game-stats-tracker-demo.firebaseapp.com",
    databaseURL: "https://game-stats-tracker-demo-default-rtdb.firebaseio.com",
    projectId: "game-stats-tracker-demo",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let gameRef = ref(db, "liveGame");
let game = { team: "", opponent: "", players: [] };
let selected = null;

onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
        game = snapshot.val();
        render();
    }
});

function save() {
    set(gameRef, game);
}

window.startGame = function () {
    const teamName = document.getElementById("team-name").value.trim();
    const opponent = document.getElementById("opponent").value.trim();
    if (!teamName || !opponent) {
        alert("Please enter both team names");
        return;
    }
    game = { team: teamName, opponent: opponent, players: [] };
    save();
    showGameScreen();
};

window.addPlayer = function () {
    const playerNum = game.players.length + 1;
    game.players.push({ name: `Player ${playerNum}`, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0 });
    save();
};

window.select = function (i) {
    selected = i;
    showDetailsPanel();
};

window.stat = function (s) {
    if (selected == null) return;
    if (s === "2pm") game.players[selected].pts += 2;
    else if (s === "3pm") game.players[selected].pts += 3;
    else if (s === "ftm") game.players[selected].pts += 1;
    else game.players[selected][s]++;
    save();
    updateDetailsPanel();
};

window.updatePlayerName = function () {
    if (selected == null) return;
    const newName = document.getElementById("editPlayerName").value.trim();
    if (newName) {
        game.players[selected].name = newName;
        save();
        updateDetailsPanel();
        document.getElementById("editPlayerName").value = "";
    }
};

window.closeDetails = function () {
    selected = null;
    document.getElementById("detailsPanel").style.display = "none";
    render();
};

window.endGame = function () {
    if (confirm("Are you sure you want to end this game?")) {
        game = { team: "", opponent: "", players: [] };
        save();
        showSetupScreen();
    }
};

function showGameScreen() {
    document.getElementById("setup-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("teamDisplay").textContent = game.team;
    document.getElementById("opponentDisplay").textContent = game.opponent;
    render();
}

function showSetupScreen() {
    document.getElementById("game-screen").style.display = "none";
    document.getElementById("setup-screen").style.display = "block";
    document.getElementById("team-name").value = "";
    document.getElementById("opponent").value = "";
}

function showDetailsPanel() {
    if (selected === null) return;
    const panel = document.getElementById("detailsPanel");
    panel.style.display = "block";
    updateDetailsPanel();
}

function updateDetailsPanel() {
    if (selected === null) return;
    const player = game.players[selected];
    document.getElementById("playerName").textContent = player.name;
    document.getElementById("detailPts").textContent = player.pts;
    document.getElementById("detailReb").textContent = player.reb;
    document.getElementById("detailAst").textContent = player.ast;
    document.getElementById("detailStl").textContent = player.stl;
    document.getElementById("detailBlk").textContent = player.blk;
    document.getElementById("detailTo").textContent = player.to;
    document.getElementById("editPlayerName").value = player.name;
}

function render() {
    const el = document.getElementById("players");
    el.innerHTML = "";
    game.players.forEach((p, i) => {
        const isSelected = selected === i ? "selected" : "";
        el.innerHTML += `
            <div class="card ${isSelected}" onclick="select(${i})">
                <div class="card-name">${p.name}</div>
                <div class="card-stats">
                    <div>🏀 ${p.pts}</div>
                    <div>📦 ${p.reb}</div>
                    <div>🏷️ ${p.ast}</div>
                </div>
            </div>
        `;
    });
}

if (game.team) {
    showGameScreen();
} else {
    showSetupScreen();
}