import { dataUrlToString, Player } from "textalive-app-api";
import PlayerCharacter from "./player-character";
import Coin from "./coin";
import Chart from "./chart-data";
import { glowParticles } from "./game-loop";
import { shotBullets } from "./game-loop";
import { lyrics } from "./game-loop";

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
			window.setTimeout(() => {
				const start = document.getElementById("start");
				start.onclick = () => {
					player.requestPlay()
					// player.requestMediaSeek(230 * 1000);
					// player.requestMediaSeek(30 * 1000);
					player.requestMediaSeek(18 * 1000);
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

const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

const lyricCanvas = document.getElementById("lyrics");
lyricCanvas.width = window.innerWidth;
lyricCanvas.height = window.innerHeight;
const ctxLyrics = lyricCanvas.getContext("2d");
document.fonts.load("16px GNUUnifont").then(() => {
	ctxLyrics.font = "16px GNUUnifon";
});

const LYRICS_FADE_LIFETIME = 500;

function drawLyrics() {
	ctxLyrics.clearRect(0, 0, lyricCanvas.width, lyricCanvas.height);
	
	for (const id in lyrics) {
		const text = lyrics[id];
		ctxLyrics.font = `${text.size}px GNUUnifont`;
		
		const lifetime = text.movein ? 1000 : text.movetoedge ? 3000 : 1000;

		if (text.progress < 1) {
			if (Object.hasOwn(text, "delay") && text.delayStart === null) text.delayStart = performance.now();

			if (Object.hasOwn(text, "delayProgress") && text.delayProgress < 1) {
				text.delayProgress = (performance.now() - text.delayStart) / text.delay;
			} else {
				if (!Object.hasOwn(text, "run")) {
					text.start = performance.now();
					text.run = true;
				}
				const x = lerp(text.startX, text.x, 1 - (1 - text.progress) ** 2);
				const y = lerp(text.startY, text.y, 1 - (1 - text.progress) ** 2);
				text.currentX = x + text.size / 15;
				text.currentY = y + text.size / 2;
				text.progress = (performance.now() - text.start) / lifetime;
			}
			
			if (text.bullet) {
				ctxLyrics.fillStyle = text.hit ? "#ffff00" : "#ffffff";
			} else {
				ctxLyrics.fillStyle = "#ffffffcc";
			}

			if (text.isWord) {
				if (text.column) {
					const renderY = text.currentY - text.size * (text.text.length - 1) / 2;
					for (let i = 0; i < text.text.length; i++) {
						ctxLyrics.fillText(text.text[i], text.currentX, renderY + i * text.size);
					}
				} else {
					const renderX = text.currentX - text.size * (text.text.length - 1) / 2;
					ctxLyrics.fillText(text.text, renderX, text.currentY);
				}
			} else {
				ctxLyrics.fillText(text.text, text.currentX, text.currentY);
			}
		} else {
			if (text.fadeStart === null) {
				text.bullet = false;
				text.fadeStart = performance.now();
				text.fadeProgress = (performance.now() - text.fadeStart) / lifetime;
				
				text.onMovedIn(text, text.attack, text.params);
			}

			if (text.fallin) text.currentY += 2;
			
			if (text.bullet) {
				ctxLyrics.fillStyle = text.hit ? `rgba(255, 255, 0, ${1 - text.fadeProgress}` : `rgba(255, 255, 255, ${1 - text.fadeProgress})`;
			} else {
				ctxLyrics.fillStyle = `rgba(255, 255, 255, ${0.8 - text.fadeProgress})`;
			}
			if (text.isWord) {
				if (text.column) {
					const renderY = text.currentY - text.size * (text.text.length - 1) / 2;
					for (let i = 0; i < text.text.length; i++) {
						ctxLyrics.fillText(text.text[i], text.currentX, renderY + i * text.size);
					}
				} else {
					const renderX = text.currentX - text.size * (text.text.length - 1) / 2;
					ctxLyrics.fillText(text.text, renderX, text.currentY);
				}
			} else {
				ctxLyrics.fillText(text.text, text.currentX, text.currentY);
			}
			
			text.fadeProgress = (performance.now() - text.fadeStart) / LYRICS_FADE_LIFETIME;
		}
		
		if (text.fadeProgress >= 1) {
			delete lyrics[id];
		}
	}
}

//water wave
const waterWaveCanvas = document.getElementById("water-wave");
waterWaveCanvas.width = window.innerWidth;
waterWaveCanvas.height = window.innerHeight;
const ctxWaterWave = waterWaveCanvas.getContext("2d");
ctxWaterWave.imageSmoothingEnabled = false;

const WATER_WAVE_IMG = new Image();
const WATER_WAVE_IMGSRC = "assets/images/game/water/water_wave.png";
WATER_WAVE_IMG.src = WATER_WAVE_IMGSRC
const WATER_WAVE_INTERVAL = 500 / 4;
const WATER_WAVE_IMGSIZE = 64;

function drawWaterWaves(delta) {
	ctxWaterWave.clearRect(0, 0, waterWaveCanvas.width, waterWaveCanvas.height);

	for (const id in lyrics) {
		const text = lyrics[id];
		if (text.waterWave) {
			if (!Object.hasOwn(text, "waterWaveTimer")) {
				text.waterWaveTimer = 0;
				text.waterWaveState = 0;
			}
			const size = window.innerWidth * 0.1;
			const x = text.currentX - size / 5;
			const y = text.currentY - size / 2 + window.innerWidth * 0.03;
			if (text.fadeStart !== null) {
				ctxWaterWave.globalAlpha = 1 - text.fadeProgress;
			} else {
				ctxWaterWave.globalAlpha = 1;
			}
			ctxWaterWave.drawImage(WATER_WAVE_IMG, WATER_WAVE_IMGSIZE * text.waterWaveState, 0, WATER_WAVE_IMGSIZE, WATER_WAVE_IMGSIZE, x, y, size, size);
		}


		if (text.waterWaveTimer <= WATER_WAVE_INTERVAL) {
			text.waterWaveTimer += delta;
		} else {
			if (text.waterWaveState > 2) {
				text.waterWaveState = 0;
				continue;
			}
			text.waterWaveState++;
			text.waterWaveTimer = 0;
		}
	}
}

//effects
//chorus effect
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

const GLOW_BORDER_WIDTH = 50;
const gradientTop = ctxTop.createLinearGradient(0, 0, 0, GLOW_BORDER_WIDTH);
gradientTop.addColorStop(0, "#ffffa8");
gradientTop.addColorStop(1, "#ffffa800");
const gradientBottom = ctxBottom.createLinearGradient(0, sunflowerCanvasBottom.height - GLOW_BORDER_WIDTH, 0, sunflowerCanvasBottom.height);
gradientBottom.addColorStop(0, "#ffffa800");
gradientBottom.addColorStop(1, "#ffffa8");
const gradientLeft = ctxLeft.createLinearGradient(0, 0, GLOW_BORDER_WIDTH, 0);
gradientLeft.addColorStop(0, "#ffffa8");
gradientLeft.addColorStop(1, "#ffffa800");
const gradientRight = ctxRight.createLinearGradient(sunflowerCanvasRight.width - GLOW_BORDER_WIDTH, 0, sunflowerCanvasRight.width, 0);
gradientRight.addColorStop(0, "#ffffa800");
gradientRight.addColorStop(1, "#ffffa8");
ctxTop.fillStyle = gradientTop;
ctxBottom.fillStyle = gradientBottom;
ctxLeft.fillStyle = gradientLeft;
ctxRight.fillStyle = gradientRight;

const sunflowers = [];

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

	ctxTop.fillRect(0, 0, sunflowerCanvasTop.width, GLOW_BORDER_WIDTH);
	ctxBottom.fillRect(0, sunflowerCanvasBottom.height - GLOW_BORDER_WIDTH, sunflowerCanvasBottom.width, GLOW_BORDER_WIDTH);
	ctxLeft.fillRect(0, 0, GLOW_BORDER_WIDTH, sunflowerCanvasLeft.height);
	ctxRight.fillRect(sunflowerCanvasRight.width - GLOW_BORDER_WIDTH, 0, GLOW_BORDER_WIDTH, sunflowerCanvasRight.height);
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

//lyric glow effect
const glowEffectCanvas = document.getElementById("glow-effect");
glowEffectCanvas.width = window.innerWidth;
glowEffectCanvas.height = window.innerHeight;
const ctxGlow = glowEffectCanvas.getContext("2d");
ctxGlow.shadowBlur = 1000;

const GLOW_LIFETIME = 800;

function drawGlow() {
	ctxGlow.clearRect(0, 0, glowEffectCanvas.width, glowEffectCanvas.height);

	for (let i = glowParticles.length - 1; i >= 0; i--) {
		const data = glowParticles[i];
		const x = data.text.currentX + data.size / 3;
		const y = data.text.currentY + data.size / 10;
		
		const t = performance.now() - data.start;
		const progress = t / GLOW_LIFETIME;
		
		let opacity = 0;
		if (progress < 0.1) {
			opacity = progress / 0.1;
		} else {
			opacity = (1 - progress) / 0.9;
		}

		if (opacity <= 0) {
			glowParticles.splice(i, 1);
			continue;
		}

		const gradient = ctxGlow.createRadialGradient(x, y, 0, x, y, data.size / 2);
		gradient.addColorStop(0, `rgba(255, 255, 52, ${opacity * 0.5})`);
		gradient.addColorStop(1, `rgba(255, 255, 52, 0)`);
		ctxGlow.fillStyle = gradient;
		
		ctxGlow.beginPath();
		ctxGlow.arc(x, y, data.size / 2, 0, Math.PI * 2);
		ctxGlow.fill();
	}
}

//trail effect
const trailEffectCanvas = document.getElementById("trail-effect");
trailEffectCanvas.width = window.innerWidth;
trailEffectCanvas.height = window.innerHeight;
const ctxTrail = trailEffectCanvas.getContext("2d");
ctxTrail.fillStyle = "#ffff34a7";

const trailParticles = [];
let trailParticlesLength = 0;
const MAX_PARTICLES = 30;
const TRAIL_LIFETIME = 300;

function drawTrail() {
	ctxTrail.setTransform(1, 0, 0, 1, 0, 0);
	ctxTrail.clearRect(0, 0, trailEffectCanvas.width, trailEffectCanvas.height);
	
	for (let i = trailParticles.length - 1; i >= 0; i--) {
		const data = trailParticles[i];
		
		const t = performance.now() - data.start;
		const progress = 1 - t / TRAIL_LIFETIME;

		if (data.x > 0 && data.x < trailEffectCanvas.width && data.y > 0 && data.y < trailEffectCanvas.height) {
			const size = data.size * progress;
			const cos = Math.cos(data.angle);
			const sin = Math.sin(data.angle);
			ctxTrail.setTransform(cos, sin, -sin, cos, data.x, data.y);
			ctxTrail.fillRect(0, 0, size, size);
		}

		if (progress <= 0) {
			trailParticles.splice(i, 1);
		}
	}
}

let trailSpawnTimer = 0;
const TRAIL_SPAWN_TIME = 200;
function spawnTrails(delta) {
	if (trailSpawnTimer < TRAIL_SPAWN_TIME) {
		trailSpawnTimer += delta;
	} else {
		trailSpawnTimer = 0;
		for (const id in lyrics) {
			const text = lyrics[id];

			if (trailParticles.length > MAX_PARTICLES) return;
			const x = text.currentX + text.size / 2;
			const y = text.currentY + text.size / 2;
			const offsetAngle = Math.random() * Math.PI * 2;
			const offsetDist = Math.random() * 25;
			const offsetX = Math.cos(offsetAngle) * offsetDist;
			const offsetY = Math.sin(offsetAngle) * offsetDist;
			spawnTrail(x + offsetX, y + offsetY);
		}
	}
}

function spawnTrail(x, y) {
	const size = Math.random() * 3 + (Math.max(window.innerWidth, window.innerHeight) > 1024 ? 10 : 5);
	const angle = Math.random() * Math.PI * 2;

	trailParticles.push({ x, y, size, angle, start: performance.now() });
}

//shot bullet movement
const bulletCanvas = document.getElementById("bullet-shoot-pattern");
bulletCanvas.width = window.innerWidth;
bulletCanvas.height = window.innerHeight;
const ctxBullet = bulletCanvas.getContext("2d");
function drawShotBullets() {
	ctxBullet.clearRect(0, 0, bulletCanvas.width, bulletCanvas.height);

	for (const id in shotBullets) {
		const bullet = shotBullets[id];
		
		bullet.x += bullet.dir.x * bullet.speed;
		bullet.y += bullet.dir.y * bullet.speed;
		
		if (bullet.x + bullet.width <= 0 ||
			bullet.x >= window.innerWidth ||
			bullet.y + bullet.height <= 0 ||
			bullet.y >= window.innerHeight) {
				delete shotBullets[id];
		}
		
		ctxBullet.fillStyle = bullet.hit ? "#ffff00" : "#ffffff";
		ctxBullet.beginPath();
		ctxBullet.arc(bullet.x, bullet.y, bullet.size / 2, 0, Math.PI * 2);
		ctxBullet.fill();
	}
}

//vignette
const vignetteCanvas = document.getElementById("vignette");
vignetteCanvas.width = window.innerWidth;
vignetteCanvas.height = window.innerHeight;
vignetteCanvas.style.top = 0;
const ctxVignette = vignetteCanvas.getContext("2d");
const vignetteCenterX = vignetteCanvas.width / 2;
const vignetteCenterY = vignetteCanvas.height / 2;
const vignetteInner = Math.max(vignetteCanvas.width, vignetteCanvas.height) / 2 * 0.8;
const vignetteOuter = Math.max(vignetteCanvas.width, vignetteCanvas.height) / 2 * 2;
const vignetteGradient = ctxVignette.createRadialGradient(vignetteCenterX, vignetteCenterY, vignetteInner, vignetteCenterX, vignetteCenterY, vignetteOuter);
vignetteGradient.addColorStop(0, "#00000000");
vignetteGradient.addColorStop(1, "#00000099");
ctxVignette.fillStyle = vignetteGradient;
ctxVignette.fillRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);

//game loop
let lastTime = 0;
function gameUpdate(timestamp) {
	let delta = timestamp - lastTime;
	if (!lastTime) delta = 0;
	delta = Math.min(delta, 1000);
	lastTime = timestamp;

	pc.update(isChorus);
	
	drawTrail();
	spawnTrails(delta);
	drawWaterWaves(delta);
	drawGlow();
	drawLyrics();

	drawShotBullets();

	if (isChorus) drawSunflowers(delta);

	requestAnimationFrame(gameUpdate);
}
gameUpdate();