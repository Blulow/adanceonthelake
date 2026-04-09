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
					text.classList.add("text");
					text.innerText = unit.text;
					arena.appendChild(text);
					
					if (unit.parent.text !== lastWord) {
						if (lastTextElements) {
							for (let i = 0; i < lastTextElements.length; i++) {
								lastTextElements[i].remove();
							}
						}
						
						const fullWord = document.createElement("div");
						fullWord.innerText = unit.parent.text;
						fullWord.style.fontSize = "10vw";
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
			if (!player.video.findChar(now)) {
				if (lastTextElements) {
					for (let i = 0; i < lastTextElements.length; i++) {
						lastTextElements[i].remove();
					}
				}
			}
		};
		c = c.next;
	}
}

function animateCharInChord() {
	let c = player.video.firstChar;
	let lastWord = null;
	let lastChar = null;
	let lastTextGroups = [];
	let lastChord = null;
	
	let textTopValue = "";
	let textLeftValue = "";
	let { x, y } = getRandomDirection();

	let textGroup = null;

	while(c) {
		c.animate = (now, unit) => {
			if (unit.contains(now)) {
				if (unit.text !== lastChar) {
					const chordChange = player.findChordChange(player.videoPosition, now);
					const chord = chordChange.current;
					
					const text = document.createElement("div");
					text.classList.add("text");
					text.innerText = unit.text;

					if (chord !== lastChord) {
						textGroup = document.createElement("div");
						textGroup.classList.add("text-group");
						arena.appendChild(textGroup);
								
						const charsInChord = player.video.chars
							.filter(w => w.startTime >= chord.startTime && w.startTime < chord.endTime)
							.map(w => w.text)
							.join("");
							
						const fullWord = document.createElement("div");
						fullWord.innerText = charsInChord;
						fullWord.style.fontSize = "10vw";
						arena.appendChild(fullWord);
						textTopValue = `${Math.random() * (window.innerHeight - fullWord.offsetHeight)}px`;
						textLeftValue = `${Math.random() * (window.innerWidth - fullWord.offsetWidth)}px`;
						fullWord.remove();
						({ x, y } = getRandomDirection());
						
						lastWord = charsInChord;
						lastChord = chord;
						lastTextGroups.push(textGroup);
					}

					text.addEventListener("animationend", e => {
						if (e.animationName === "movein") {
							text.classList.add("fadeout");
						} else if (e.animationName === "fadeout") {
							if (Array.from(text.parentElement.children).indexOf(text) === text.parentElement.children.length - 1) {
								text.parentElement.remove();
								lastTextGroups.splice(lastTextGroups.indexOf(text.parentElement), 1);
							}
						}
					});
					textGroup.appendChild(text);
					text.style.top = textTopValue;
					text.style.left = textLeftValue;
					text.style.setProperty("--start-x", `${x}px`);
					text.style.setProperty("--start-y", `${y}px`);
					
					lastChar = unit.text;
				}
			}
		};
		c = c.next;
	}
}
