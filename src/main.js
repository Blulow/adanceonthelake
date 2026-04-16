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
			new CharInChordType(player, lyricsArena, new RandomDirPattern(pc), LinePattern, PosTelegraph).animate();
		}
	}
});

function gameUpdate() {
	pc.update();
	requestAnimationFrame(gameUpdate);
}
gameUpdate();