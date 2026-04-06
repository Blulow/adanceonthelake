import { Player } from "textalive-app-api";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const arena = document.getElementById("arena");

player.addListener({
	onAppReady: (app) => {
		if (!app.managed) {
			document.getElementById("play").addEventListener("click", () => {
				// player.requestMediaSeek(230 * 1000);
				player.requestPlay();
			});
		}
		if (!app.songUrl) {
			player.createFromSongUrl("https://piapro.jp/t/6W2N/20251215164617"); // song url
		}
	},
	onVideoReady: () => {
		if (!player.app.managed) {
			animateCharInWord();
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

function animateWord() {
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
					text.innerText = unit.text;
					arena.appendChild(text);

					text.style.top = `${Math.random() * (window.innerHeight - text.offsetHeight)}px`;
					text.style.left = `${Math.random() * (window.innerWidth - text.offsetWidth)}px`;
					const { x, y } = getRandomDirection();
					text.style.transform = `translate(${x}px, ${y}px)`;

					lastTextElement = text;
					lastWord = unit.text;
				}
			}
		};
		w = w.next;
	}
}

function animateCharInWord() {
	let c = player.video.firstChar;
	let lastWord = null;
	let lastChar = null;
	let lastTextElements = [];

	let textTopValue = "";
	let textLeftValue = "";
	let { x, y } = getRandomDirection();

	while(c) {
		c.animate = (now, unit) => {
			if (unit.contains(now)) {
				if (unit.text !== lastChar) {
					const text = document.createElement("div");
					text.id = "text";
					text.innerText = unit.text;
					arena.appendChild(text);
					
					if (unit.parent.text !== lastWord) {
						if (lastTextElements) {
							for (let i = 0; i < lastTextElements.length; i++) {
								lastTextElements[i].remove();
							}
						}
						//random text pos
						const fullWord = document.createElement("div");
						fullWord.innerText = unit.parent.text;
						fullWord.style.fontSize = "200px"
						arena.appendChild(fullWord);
						textTopValue = `${Math.random() * (window.innerHeight - fullWord.offsetHeight)}px`;
						textLeftValue = `${Math.random() * (window.innerWidth - fullWord.offsetWidth)}px`;
						fullWord.remove();
						({ x, y } = getRandomDirection());
						
						lastWord = unit.parent.text;
					}
					text.style.top = textTopValue;
					text.style.left = textLeftValue;
					text.style.transform = `translate(${x}px, ${y}px)`;

					lastTextElements.push(text);
					lastChar = unit.text;
				}
			}
		};
		c = c.next;
	}
}
