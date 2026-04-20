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
	{ time: 0, type: CharInChordType, pattern: FallingPattern, attack: AttackPattern, telegraph: PosTelegraph },
	{ time: 20000, type: WordType, pattern: RandomDirPattern, attack: AttackPattern, telegraph: Telegraph },
	{ time: 25000, type: CharInWordType, pattern: RandomDirPosPattern, attack: LinePattern, telegraph: PosTelegraph },
]

let changes = 0;
let currentRound = null;

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				player.requestPlay();
				// player.requestMediaSeek(230 * 1000);
				// player.requestMediaSeek(30 * 1000);
				player.requestMediaSeek(18 * 1000);
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
			// let round = new CharInChordType(player, lyricsArena, new FallingPattern(pc), AttackPattern, PosTelegraph);
			// lyricUpdate(round, 20000);
			lyricUpdate(currentRound, chart[changes + 1].time);
		}
	}
});

function createRound(data) {
	return new data.type(player, lyricsArena, new data.pattern(pc), data.attack, data.telegraph);
}

function updateRound(now) {
	const next = chart[changes + 1];

	if (next && now >= next.time) {
		changes++;

		const newRound = createRound(next);
		const upcoming = chart[changes + 1];
		lyricUpdate(newRound, upcoming ? upcoming.time : null);
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