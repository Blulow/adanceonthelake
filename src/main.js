import { Player } from "textalive-app-api";
import WordPattern from "./spawn-patterns/word-pattern";
import CharInWordPattern from "./spawn-patterns/char-in-word-pattern";
import CharInChordPattern from "./spawn-patterns/char-in-chord-pattern";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const arena = document.getElementById("arena");

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				// player.requestMediaSeek(230 * 1000);
				player.requestMediaSeek(15 * 1000);
				player.requestPlay();
			});
		}
		if (!app.songUrl) {
			player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617"); // song url
		}
	},
	onVideoReady() {
		if (!player.app.managed) {
			new CharInWordPattern(player, arena).animate();
		}
	}
});