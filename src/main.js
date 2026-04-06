import { Player } from "textalive-app-api";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const arena = document.getElementById("arena");
let lyrics = [];
let unitIndex = 0;

player.addListener({
	onAppReady: (app) => {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				player.requestMediaSeek(230 * 1000)
				player.requestPlay();
			});
		}
		if (!app.songUrl) {
			player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617"); // song url
		}
	},
	onVideoReady: () => {
		if (!player.app.managed) {
			let w = player.video.firstWord;
			let lastWord = null;
			let lastTextElement = null;
			
			while(w) {
				w.animate = (now, unit) => {
					if (unit.contains(now)) {
						if (unit.text !== lastWord) {
							if (lastTextElement) lastTextElement.remove();
							const text = document.createElement("div");
							text.id = "text";
							
							text.style.top = `${Math.random() * 80 + 10}%`;
							text.style.left = `${Math.random() * 80 + 10}%`;
							const { x, y } = getRandomDirection();
							text.style.transform = `translate(${x}px, ${y}px)`;
							
							text.innerText = unit.text;
							arena.appendChild(text);
							lastTextElement = text;
							lastWord = unit.text;
						}
					}
				};
				w = w.next;
			}
		}
	}
});

function getRandomDirection() {
  const angle = Math.random() * 360;
  const rad = angle * (Math.PI / 180);

  const distance = 300;

  const x = Math.cos(rad) * distance;
  const y = Math.sin(rad) * distance;

  return { x, y };
}
