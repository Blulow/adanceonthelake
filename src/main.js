import { Player } from "textalive-app-api";
import PlayerCharacter from "./player-character";
import Coin from "./coin";
import WordType from "./spawn-type/word-type";
import CharInWordType from "./spawn-type/char-in-word-type";
import CharInChordType from "./spawn-type/char-in-chord-type";
import RandomDirPosPattern from "./spawn-patterns/random-dir-pos-pattern";
import RandomDirPattern from "./spawn-patterns/random-dir-pattern";
import FallingPattern from "./spawn-patterns/falling-pattern";
import AttackPattern from "./attack-patterns/attack-pattern";
import LinePattern from "./attack-patterns/line-pattern";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import Telegraph from "./telegraphs/telegraph";
import PosTelegraph from "./telegraphs/pos-telegraph";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const pc = new PlayerCharacter();

const lyricsArena = document.getElementById("lyrics");

const chart = [	
	{ time: 0, type: CharInChordType, pattern: RandomDirPosPattern, attack: AttackPattern, telegraph: PosTelegraph },
	{ time: 37414, type: CharInWordType, pattern: RandomDirPosPattern, attack: LinePattern, telegraph: PosTelegraph },
	{ time: 65565, type: CharInWordType, pattern: RandomDirPosPattern, attack: AttackPattern, telegraph: PosTelegraph },
	{ time: 78862, type: CharInWordType, pattern: RandomDirPattern, attack: AttackPattern, telegraph: Telegraph, chorusEffect: true },
	{ time: 118377, type: CharInWordType, pattern: RandomDirPosPattern, attack: LinePattern, telegraph: PosTelegraph },
	{ time: 132378, type: CharInWordType, pattern: FallingPattern, attack: AttackPattern, telegraph: PosTelegraph },
	{ time: 152943, type: CharInWordType, pattern: RandomDirPosPattern, attack: BulletShootPattern, telegraph: PosTelegraph },
	{ time: 168177, type: CharInWordType, pattern: RandomDirPosPattern, attack: LinePattern, telegraph: PosTelegraph },
	{ time: 182443, type: CharInWordType, pattern: FallingPattern, attack: AttackPattern, telegraph: PosTelegraph, chorusEffect: true },
	{ time: 222514, type: CharInWordType, pattern: RandomDirPattern, attack: AttackPattern, telegraph: PosTelegraph },
]

let changes = 0;
let currentRound = null;
let isChorus = false;

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				player.requestPlay();
				// player.requestMediaSeek(230 * 1000);
				// player.requestMediaSeek(30 * 1000);
				// player.requestMediaSeek(18 * 1000);
				player.requestMediaSeek(18000);
				new Coin().spawn();
			});
		}
		if (!app.songUrl) {
			player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617"); // song url
		}
	},
	onVideoReady() {
		if (!player.app.managed) {
			document.getElementById("lyrics").replaceChildren();
			document.getElementById("telegraphs").replaceChildren();
			document.getElementById("bullets").replaceChildren();
			pc.spawn();
			changes = 0;
			currentRound = createRound(chart[changes]);
			lyricUpdate(currentRound[0], chart[changes + 1].time);
		}
	}
});

function createRound(data) {
	return [new data.type(player, lyricsArena, new data.pattern(pc), data.attack, data.telegraph), data.chorusEffect];
}

function updateRound(now) {
	const next = chart[changes + 1];

	if (next && now >= next.time) {
		changes++;

		const newRound = createRound(next);
		if (newRound[1]) {
		 	chorusEffect();
		} else {
			if (isChorus) {
				deChorusEffect();
			}
		}
		const upcoming = chart[changes + 1];
		lyricUpdate(newRound[0], upcoming ? upcoming.time : null);
	}
}

let prev = 0;
function lyricUpdate(round, changeTime) {
	while (round.iter) {
		round.iter.animate = (now, unit) => {
			if (player.findBeatChange(prev, player.mediaPosition).entered.length !== 0) console.log(now);
			if (unit.contains(now)) {
				round.animate(now, unit);
				updateRound(unit.startTime);
			}
			prev = player.mediaPosition;
		};
		if (changeTime) {
			if (round.iter.startTime >= changeTime) break;
		}
		round.iter = round.iter.next;
	}
}

function gameUpdate() {
	pc.update();
	requestAnimationFrame(gameUpdate);
}
gameUpdate();

function chorusEffect() {
	isChorus = true;

	function spawnSunflower(x, y) {
		const sunflower = document.createElement("div");
		sunflower.classList.add(`sunflower-${Math.random() > 0.5 ? "large" : "small"}`);
		document.getElementById("chorus-effect").appendChild(sunflower);
		sunflower.style.left = `${x}px`;
		sunflower.style.top = `${y}px`;
		sunflower.style.transform = `rotate(${Math.floor(Math.random() * 4) * 90}deg)`;
		sunflower.style.setProperty("--anim-len", `${Math.random() * 2 + 1}s`);
		return sunflower;
	}
	const unitSunflower = spawnSunflower();
	const sunflowerWidth = unitSunflower.clientWidth;
	const sunflowerHeight = unitSunflower.clientHeight;
	unitSunflower.remove();

	for (let i = 0; i <= window.innerWidth - sunflowerWidth; i += Math.random() * sunflowerWidth / 3) {
        const flower = spawnSunflower(i, Math.random() * sunflowerHeight * 1.5 - sunflowerHeight / 2);
		flower.style.transform = "translate(0, -20vw) " + flower.style.transform;
		flower.classList.add("sunflower-movein", "sunflower-top");
	}
	for (let i = 0; i <= window.innerWidth - sunflowerWidth; i += Math.random() * sunflowerWidth / 3) {
		const flower = spawnSunflower(i, window.innerHeight - sunflowerHeight - Math.random() * sunflowerHeight * 1.5 + sunflowerHeight / 2);
		flower.style.transform = "translate(0, 20vw) " + flower.style.transform;
		flower.classList.add("sunflower-movein", "sunflower-bottom");
	}
	for (let i = 0; i <= window.innerHeight - sunflowerHeight; i += Math.random() * sunflowerHeight / 3) {
		const flower = spawnSunflower(Math.random() * sunflowerWidth * 1.5 - sunflowerWidth / 2, i);
		flower.style.transform = "translate(-20vw, 0) " + flower.style.transform;
		flower.classList.add("sunflower-movein", "sunflower-left");
	}
	for (let i = 0; i <= window.innerHeight - sunflowerHeight; i += Math.random() * sunflowerHeight / 3) {
		const flower = spawnSunflower(window.innerWidth - Math.random() * sunflowerWidth * 1.5 - sunflowerWidth / 2, i);
		flower.style.transform = "translate(20vw, 0) " + flower.style.transform;
		flower.classList.add("sunflower-movein", "sunflower-right");
	}
}

function deChorusEffect() {
	[...document.getElementsByClassName("sunflower-top")].forEach(e => {
		e.classList.remove("sunflower-top");
		e.classList.add("sunflower-moveout-top");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-top") {
				e.remove();
			}
		});
	});
	[...document.getElementsByClassName("sunflower-bottom")].forEach(e => {
		e.classList.remove("sunflower-bottom");
		e.classList.add("sunflower-moveout-bottom");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-bottom") {
				e.remove();
			}
		});
	});
	[...document.getElementsByClassName("sunflower-left")].forEach(e => {
		e.classList.remove("sunflower-left");
		e.classList.add("sunflower-moveout-left");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-left") {
				e.remove();
			}
		});
	});
	[...document.getElementsByClassName("sunflower-right")].forEach(e => {
		e.classList.remove("sunflower-right");
		e.classList.add("sunflower-moveout-right");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-right") {
				e.remove();
			}
		});
	});
}