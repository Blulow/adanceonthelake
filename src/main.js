import { Player } from "textalive-app-api";
import PlayerCharacter from "./player-character";
import Coin from "./coin";
import WordType from "./spawn-type/word-type";
import CharInWordType from "./spawn-type/char-in-word-type";
import CharInChordType from "./spawn-type/char-in-chord-type";
import RandomDirPosPattern from "./spawn-patterns/random-dir-pos-pattern";
import RandomDirPattern from "./spawn-patterns/random-dir-pattern";
import PosTelegraph from "./telegraphs/pos-telegraph";
import LinePattern from "./attack-patterns/line-pattern";
import AttackPattern from "./attack-patterns/attack-pattern";
import Telegraph from "./telegraphs/telegraph";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import FallingPattern from "./spawn-patterns/falling-pattern";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const pc = new PlayerCharacter();

const lyricsArena = document.getElementById("lyrics");

let changes = 0;

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				player.requestPlay();
				// player.requestMediaSeek(230 * 1000);
				// player.requestMediaSeek(30 * 1000);
				// player.requestMediaSeek(18 * 1000);
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
			let round = new CharInChordType(player, lyricsArena, new FallingPattern(pc), AttackPattern, PosTelegraph);
			lyricUpdate(round);
		}
	}
});

function lyricUpdate(round, changeTime) {
	while (round.iter) {
		round.iter.animate = (now, unit) => {
			if (unit.contains(now)) {
				round.animate(now, unit);
				
				// if (changes === 0 && unit.startTime >= 20000) {
				// 	changes++;
				// 	const newRound = new CharInChordType(player, lyricsArena, new RandomDirPattern(pc), AttackPattern, Telegraph);
				// 	lyricUpdate(newRound, 40000);
				// }
			}
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