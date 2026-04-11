import { Player } from "textalive-app-api";
import WordPattern from "./spawn-patterns/word-pattern";
import CharInWordPattern from "./spawn-patterns/char-in-word-pattern";
import CharInChordPattern from "./spawn-patterns/char-in-chord-pattern";
import PosTelegraph from "./telegraphs/pos-telegraph";
import LinePattern from "./attack-patterns/line-pattern";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const lyricsArena = document.getElementById("lyrics");

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				player.requestPlay();
				// player.requestMediaSeek(230 * 1000);
				// player.requestMediaSeek(189 * 1000);
			});
		}
		if (!app.songUrl) {
			player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617"); // song url
		}
	},
	onVideoReady() {
		if (!player.app.managed) {
			new CharInChordPattern(player, lyricsArena, LinePattern, PosTelegraph).animate();
		}
	}
});