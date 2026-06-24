const tutorial = document.getElementById("tutorial");
const panelContainer = document.getElementById("tutorial-panel-container");
const overlay = document.getElementById("tutorial-overlay");
const closeBtn = document.getElementById("tutorial-closebtn");
const dsta = document.getElementById("tutorial-dsta");
const dstaV = document.getElementById("tutorial-dsta-v");
const dstaX = document.getElementById("tutorial-dsta-x");

if (!localStorage.getItem("dsta") && !tutorial.dataset.index) {
    setTimeout(() => {
        openTutorialPanel();
    }, 100);
} else tutorial.style.display = "none";

closeBtn.addEventListener("pointerup", async() => {
    if (!localStorage.getItem("dsta")) {
        dsta.style.transform = "scale(1)";
        const closeBtnRect = closeBtn.getBoundingClientRect();
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        const dstaX = clamp(closeBtnRect.x - window.innerWidth * 0.06, window.innerWidth * 0.05, window.innerWidth * 0.95 - dsta.clientWidth);
        const dstaY = clamp(closeBtnRect.y + window.innerWidth * 0.04, window.innerWidth * 0.05, window.innerHeight - window.innerWidth * 0.05 - dsta.clientHeight);
        dsta.style.left = `${dstaX}px`;
        dsta.style.top = `${dstaY}px`;
        return;
    }
    closeTutorialPanel();
});

[dstaV, dstaX].forEach(e => e.addEventListener("pointerup", async() => {
    if (e === dstaV) localStorage.setItem("dsta", true);
    dsta.style.transform = "scale(0)";
    closeTutorialPanel();
    await waitTransition(dsta);
    dsta.style.display = "none";
}));

function waitTransition(e) {
    return new Promise(res => e.addEventListener("transitionend", res));
}

function openTutorialPanel() {
    tutorial.style.display = "flex";
    tutorial.offsetWidth;
    panelContainer.style.transform = "scale(1)";
    overlay.style.opacity = 1;
}

async function closeTutorialPanel() {
    panelContainer.style.transform = "scale(0)";
    overlay.style.opacity = 0;
    await waitTransition(panelContainer);
    tutorial.style.display = "none";
    document.body.classList.add("game-mode");
}