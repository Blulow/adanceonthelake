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

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const pc = new PlayerCharacter();

const lyricsArena = document.getElementById("lyrics");

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
			let changes = 0;
			let round = new WordType(player, lyricsArena, new RandomDirPosPattern(pc), BulletShootPattern, PosTelegraph);
			while (round.iter) {
				round.iter.animate = (now, unit) => {
					if (unit.contains(now)) {
						round.animate(now, unit);

						if (changes === 0 && now >= 30000) {
							round = new CharInChordType(player, lyricsArena, new RandomDirPattern(pc), AttackPattern, Telegraph);
							changes++;
						}
					}
				};
				round.iter = round.iter.next;
			}
		}
	}
});

function gameUpdate() {
	pc.update();
	requestAnimationFrame(gameUpdate);
}
gameUpdate();