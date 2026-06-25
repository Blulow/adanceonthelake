const settings = {
    keybinds: {
        moveUp: ["ArrowUp"],
        moveLeft: ["ArrowLeft"],
        moveDown: ["ArrowDown"],
        moveRight: ["ArrowRight"],
        dash: ["Shift"]
    },
    joystickSize: 0.5,
    sounds: {
        music: 0.5,
        sfx: 0.5
    },
    vignette: 0.5,
    glow: true,
    particles: true,
    screenshake: true,
    comboPopups: true,
    coinAnimation: true
}

const options = document.getElementById("options");
const optionsPanelContainer = document.getElementById("options-panel-container");
const optionsOverlay = document.getElementById("options-overlay");
const optionsCloseBtn = document.getElementById("options-closebtn");
options.style.display = "none";

optionsCloseBtn.addEventListener("pointerup", closeOptionsPanel);

function openOptionsPanel() {
    options.style.display = "flex";
    options.offsetWidth;
    optionsPanelContainer.style.transform = "scale(1)";
    optionsOverlay.style.opacity = 1;
}

async function closeOptionsPanel() {
    optionsPanelContainer.style.transform = "scale(0)";
    optionsOverlay.style.opacity = 0;
    await waitTransition(optionsPanelContainer);
    options.style.display = "none";
    document.body.classList.add("game-mode");
}

const optionsExpandableButton = document.getElementsByClassName("options-expandable-btn");
const optionsExpandableContent = document.getElementsByClassName("options-expandable-content");

[...optionsExpandableButton].forEach(e => {
    [...optionsExpandableContent].forEach(f => {
        if (f.dataset.option !== e.dataset.option) return;
        if (e.dataset.expand === "false") {
            f.style.borderTopWidth = "0";
            f.style.borderBottomWidth = "0";
            f.style.maxHeight = "0";
        }
    });
});

[...optionsExpandableButton].forEach(e => e.addEventListener("pointerup", async() => {
    [...optionsExpandableContent].forEach(async(f) => {
        if (f.dataset.option !== e.dataset.option) return;
        if (e.dataset.expand === "false") {
            f.style.borderTopWidth = window.matchMedia("(orientation: portrait)").matches ? "1vw" : "1vh";
            f.style.borderBottomWidth = window.matchMedia("(orientation: portrait)").matches ? "1vw" : "1vh";
            await waitTransition(f);
            f.style.maxHeight = window.matchMedia("(orientation: portrait)").matches ? "16vw" : "16vh";
            e.dataset.expand = "true";
        } else {
            f.style.maxHeight = "0";
            await waitTransition(f);
            f.style.borderTopWidth = "0";
            f.style.borderBottomWidth = "0";
            e.dataset.expand = "false";
        }
    });
}));

const optionsKeybindConfig = document.getElementsByClassName("options-keybindconfig");
let listening = false;
let currentKeybindListener = null;
let currentKeybind = "";
let keys = [];
let keybind = "None";

[...optionsKeybindConfig].forEach(e => {
    e.children[0].children[0].innerText = mapKeysToString(settings.keybinds[e.dataset.keybind]);
});

[...optionsKeybindConfig].forEach(e => e.addEventListener("pointerup", () => {
    if (listening) return;
    e.children[0].children[0].style.color = "#ff0000";
    e.children[0].children[0].innerText = "Input key...";
    currentKeybindListener = e;
    currentKeybind = e.dataset.keybind;
    listening = true;
}));

document.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (!listening || !currentKeybindListener) return;
    e.preventDefault();

    if (e.key === "Escape") return;
    keys.push(e.key);
    
    keybind = mapKeysToString(keys);
    const span = currentKeybindListener.children[0].children[0];
    span.innerText = keybind;
    
    const overflow = span.scrollWidth - currentKeybindListener.clientWidth;
    if (overflow > 0) {
        span.style.setProperty("--scroll-dist", `-${overflow}px`);
        if (!span.classList.contains("marquee")) span.classList.add("marquee");
    } else {
        span.classList.remove("marquee");
    }
});

document.addEventListener("keyup", e => {
    if (!listening || !currentKeybindListener) return;
    e.preventDefault();
    
    currentKeybindListener.children[0].children[0].style.color = "#000000";
    if (Object.hasOwn(settings.keybinds, currentKeybind)) settings.keybinds[currentKeybind] = keys;
    console.log(settings.keybinds);

    const span = currentKeybindListener.children[0].children[0];
    const overflow = span.scrollWidth - currentKeybindListener.clientWidth;

    if (overflow > 0) {
        span.style.setProperty("--scroll-dist", `-${overflow}px`);
        span.classList.add("marquee");
    }

    keys = [];
    listening = false;
});

function mapKeysToString(keys) {
    const mappedKeys = [];

    for (let i = 0; i < keys.length; i++) {
        let mappedKey = "";

        if (/^[a-zA-Z]$/.test(keys[i])) mappedKey = keys[i].toUpperCase();

        switch (keys[i]) {
            case " ":
                mappedKey = "Space";
                break;
            case "Control":
                mappedKey = "Ctrl";
                break;
            case "ArrowUp":
                mappedKey = "Up Arrow";
                break;
            case "ArrowLeft":
                mappedKey = "Left Arrow";
                break;
            case "ArrowDown":
                mappedKey = "Down Arrow";
                break;
            case "ArrowRight":
                mappedKey = "Right Arrow";
                break;
        }

        mappedKeys.push(mappedKey.length > 0 ? mappedKey : keys[i]);
    }


    return mappedKeys.join("+");
}

const optionsMusicChannel = document.getElementsByClassName("options-musicchannel");
[...optionsMusicChannel].forEach(e => {
    if (!Object.hasOwn(settings.sounds, e.dataset.channel)) return;
    e.value = settings.sounds[e.dataset.channel] * 100;

    e.oninput = () => {
        settings.sounds[e.dataset.channel] = e.value / 100;
        console.log(settings.sounds);
    }
});