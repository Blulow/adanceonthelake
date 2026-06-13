import { Player } from "textalive-app-api";
import PlayerCharacter from "./player-character";
import Coin from "./coin";
import Chart from "./chart-data";

const player = new Player({
	app: { token: "4fLfxYZ0Ntw6flJe" }
});

const pc = new PlayerCharacter();

const lyricsArena = document.getElementById("lyrics");
let url = localStorage.getItem("url");
let chart = Chart.getChart(JSON.parse(localStorage.getItem("chart")));

let changes = 0;
let currentRound = null;
let isChorus = false;

player.addListener({
	onAppReady(app) {
		if (!app.managed) {
			console.log("e");
			window.setTimeout(() => {
				const start = document.getElementById("start");
				start.onclick = () => {
					player.requestPlay()
					// player.requestMediaSeek(230 * 1000);
					// player.requestMediaSeek(30 * 1000);
					// player.requestMediaSeek(18 * 1000);
					// player.requestMediaSeek(180000);
					new Coin().spawn({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, isChorus);
					start.style.display = "none";
				}
				start.classList.remove("disabled");
			}, 5000);
		}
		if (!app.songUrl) {
			player.createFromSongUrl(url);
		}
	},
	onVideoReady() {
		if (!player.app.managed) {
			console.log("ee")
			document.getElementById("lyrics").replaceChildren();
			document.getElementById("telegraphs").replaceChildren();
			document.getElementById("bullets").replaceChildren();
			pc.spawn();
			changes = 0;
			currentRound = createRound(chart[changes]);
			lyricUpdate(currentRound[0], chart[changes + 1] ? chart[changes + 1].time : null);
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
	let t = false;
	while (round.iter) {
		if (changeTime) {
			if (round.iter.startTime >= changeTime) {
				t = true;
			}
		}
		const anim = (t) => {
			round.iter.animate = (now, unit) => {
				if (player.findBeatChange(prev, player.mediaPosition).entered.length !== 0) console.log(now);
				if (unit.contains(now + 1500)) {
					if (!t) {
						round.animate(now, unit, isChorus);
					}
					updateRound(unit.startTime);
				}
				prev = player.mediaPosition;
			};
		};
		anim(t);
		if (t) break;
		round.iter = round.iter.next;
	}
}

const sunflowers = [];

let lastTime = 0;
function gameUpdate(timestamp) {
	let delta = timestamp - lastTime;
	if (!lastTime) delta = 0;
	delta = Math.min(delta, 1000);
	lastTime = timestamp;

	pc.update(isChorus);

	if (isChorus) drawSunflowers(delta);

	requestAnimationFrame(gameUpdate);
}
gameUpdate();

const sunflowerCanvasTop = document.getElementById("chorus-effect-top");
const ctxTop = sunflowerCanvasTop.getContext("2d");
const sunflowerCanvasBottom = document.getElementById("chorus-effect-bottom");
const ctxBottom = sunflowerCanvasBottom.getContext("2d");
const sunflowerCanvasLeft = document.getElementById("chorus-effect-left");
const ctxLeft = sunflowerCanvasLeft.getContext("2d");
const sunflowerCanvasRight = document.getElementById("chorus-effect-right");
const ctxRight = sunflowerCanvasRight.getContext("2d");
[...document.getElementsByClassName("chorus-effect")].forEach(e => {
	e.width = window.innerWidth;
	e.height = window.innerHeight;
	e.getContext("2d").imageSmoothingEnabled = false;
});

function drawSunflowers(delta) {
	ctxTop.clearRect(0, 0, sunflowerCanvasTop.width, sunflowerCanvasTop.height);
	ctxBottom.clearRect(0, 0, sunflowerCanvasBottom.width, sunflowerCanvasBottom.height);
	ctxLeft.clearRect(0, 0, sunflowerCanvasLeft.width, sunflowerCanvasLeft.height);
	ctxRight.clearRect(0, 0, sunflowerCanvasRight.width, sunflowerCanvasRight.height);

	for (let i = 0; i < sunflowers.length; i++) {
		const sunflowerData = sunflowers[i];

		const SUNFLOWER_IMGSIZE = 32;
		sunflowerData.ctx.drawImage(sunflowerData.image, SUNFLOWER_IMGSIZE * sunflowerData.step, 0, SUNFLOWER_IMGSIZE, SUNFLOWER_IMGSIZE, sunflowerData.x, sunflowerData.y, sunflowerData.width, sunflowerData.height);
		
		if (sunflowerData.timer < sunflowerData.interval) {
			sunflowerData.timer += delta;
		} else {
			if (sunflowerData.step < 3) sunflowerData.step++; else sunflowerData.step = 0;
			sunflowerData.timer = 0;
		}
	}
}

function chorusEffect() {
	isChorus = true;
	
	const maxWidth = Math.max(window.innerHeight, window.innerWidth);
	const SUNFLOWER_WIDTH = maxWidth > 1024 ? 64 : 24;
	const SUNFLOWER_HEIGHT = maxWidth > 1024 ? 64 : 24;

	function spawnSunflower(x, y, ctx) {
		const sunflowerImg = new Image();
		const SUNFLOWER_LARGE_SRC = "assets/images/game/sunflower/sunflower_large.png";
		const SUNFLOWER_SMALL_SRC = "assets/images/game/sunflower/sunflower_small.png";
		sunflowerImg.src = Math.random() > 0.5 ? SUNFLOWER_LARGE_SRC : SUNFLOWER_SMALL_SRC;
		
		const _sunflowerData = { ctx, image: sunflowerImg, step: 0, x, y, width: SUNFLOWER_WIDTH, height: SUNFLOWER_HEIGHT, timer: 0, interval: Math.random() * 2000 + 1000 };
		sunflowers.push(_sunflowerData);
	}
	
	for (let i = 0; i <= window.innerWidth - SUNFLOWER_WIDTH; i += Math.random() * SUNFLOWER_WIDTH / 3) {
		spawnSunflower(i, Math.random() * SUNFLOWER_HEIGHT * 1.5 - SUNFLOWER_HEIGHT / 2, ctxTop);
		sunflowerCanvasTop.style.transform = "translate(0, -20vw)";
		sunflowerCanvasTop.classList.add("sunflower-movein", "sunflower-top");
	}
	for (let i = 0; i <= window.innerWidth - SUNFLOWER_WIDTH; i += Math.random() * SUNFLOWER_WIDTH / 3) {
		spawnSunflower(i, window.innerHeight - SUNFLOWER_HEIGHT - Math.random() * SUNFLOWER_HEIGHT * 1.5 + SUNFLOWER_HEIGHT / 2, ctxBottom);
		sunflowerCanvasBottom.style.transform = "translate(0, 20vw)";
		sunflowerCanvasBottom.classList.add("sunflower-movein", "sunflower-bottom");
	}
	for (let i = 0; i <= window.innerHeight - SUNFLOWER_HEIGHT; i += Math.random() * SUNFLOWER_HEIGHT / 3) {
		spawnSunflower(Math.random() * SUNFLOWER_WIDTH * 1.5 - SUNFLOWER_WIDTH / 2, i, ctxLeft);
		sunflowerCanvasLeft.style.transform = "translate(-20vw, 0)";
		sunflowerCanvasLeft.classList.add("sunflower-movein", "sunflower-left");
	}
	for (let i = 0; i <= window.innerHeight - SUNFLOWER_HEIGHT; i += Math.random() * SUNFLOWER_HEIGHT / 3) {
		spawnSunflower(window.innerWidth - Math.random() * SUNFLOWER_WIDTH * 1.5 - SUNFLOWER_WIDTH / 2, i, ctxRight);
		sunflowerCanvasRight.style.transform = "translate(20vw, 0)";
		sunflowerCanvasRight.classList.add("sunflower-movein", "sunflower-right");
	}
}

function deChorusEffect() {
	[...document.getElementsByClassName("sunflower-top")].forEach(e => {
		e.classList.remove("sunflower-top");
		e.classList.add("sunflower-moveout-top");
		e.classList.remove("sunflower-movein");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-top") {
				e.classList.remove("sunflower-moveout-top");
				ctxTop.clearRect(0, 0, sunflowerCanvasTop.width, sunflowerCanvasTop.height);
			}
		});
	});
	[...document.getElementsByClassName("sunflower-bottom")].forEach(e => {
		e.classList.remove("sunflower-bottom");
		e.classList.add("sunflower-moveout-bottom");
		e.classList.remove("sunflower-movein");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-bottom") {
				e.classList.remove("sunflower-moveout-bottom");
				ctxBottom.clearRect(0, 0, sunflowerCanvasBottom.width, sunflowerCanvasBottom.height);
			}
		});
	});
	[...document.getElementsByClassName("sunflower-left")].forEach(e => {
		e.classList.remove("sunflower-left");
		e.classList.add("sunflower-moveout-left");
		e.classList.remove("sunflower-movein");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-left") {
				e.classList.remove("sunflower-moveout-left");
				ctxLeft.clearRect(0, 0, sunflowerCanvasLeft.width, sunflowerCanvasLeft.height);
			}
		});
	});
	[...document.getElementsByClassName("sunflower-right")].forEach(e => {
		e.classList.remove("sunflower-right");
		e.classList.add("sunflower-moveout-right");
		e.classList.remove("sunflower-movein");
		e.style.transform = "translate(0, 0)";
		e.addEventListener("animationend", a => {
			if (a.animationName === "sunflower-moveout-right") {
				e.classList.remove("sunflower-moveout-right");
				ctxRight.clearRect(0, 0, sunflowerCanvasRight.width, sunflowerCanvasRight.height);
			}
		});
	});

	while (sunflowers.length > 0) {
		sunflowers.pop();
	}
	isChorus = false;
}