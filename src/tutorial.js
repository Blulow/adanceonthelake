const tutorial = document.getElementById("tutorial");
const tutorialPanelContainer = document.getElementById("tutorial-panel-container");
const tutorialOverlay = document.getElementById("tutorial-overlay");
const tutorialCloseBtn = document.getElementById("tutorial-closebtn");
const tutorialDsta = document.getElementById("tutorial-dsta");
const tutorialDstaV = document.getElementById("tutorial-dsta-v");
const tutorialDstaX = document.getElementById("tutorial-dsta-x");

if (!localStorage.getItem("dsta") && !tutorial.dataset.index) {
    setTimeout(() => {
        openTutorialPanel();
    }, 100);
} else tutorial.style.display = "none";

tutorialCloseBtn.addEventListener("pointerup", async() => {
    if (!localStorage.getItem("dsta")) {
        tutorialDsta.style.display = "flex";
        tutorialDsta.offsetWidth;
        tutorialDsta.style.transform = "scale(1)";
        const closeBtnRect = tutorialCloseBtn.getBoundingClientRect();
        const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
        const dstaX = clamp(closeBtnRect.x - window.innerWidth * 0.06, window.innerWidth * 0.05, window.innerWidth * 0.95 - tutorialDsta.clientWidth);
        const dstaY = clamp(closeBtnRect.y + window.innerWidth * 0.04, window.innerWidth * 0.05, window.innerHeight - window.innerWidth * 0.05 - tutorialDsta.clientHeight);
        tutorialDsta.style.left = `${dstaX}px`;
        tutorialDsta.style.top = `${dstaY}px`;
        return;
    }
    closeTutorialPanel();
});

[tutorialDstaV, tutorialDstaX].forEach(e => e.addEventListener("pointerup", async() => {
    if (e === tutorialDstaV) localStorage.setItem("dsta", true);
    tutorialDsta.style.transform = "scale(0)";
    closeTutorialPanel();
    await waitTransition(tutorialDsta);
    tutorialDsta.style.display = "none";
}));

function waitTransition(e) {
    return new Promise(res => e.addEventListener("transitionend", res));
}

function openTutorialPanel() {
    tutorial.style.display = "flex";
    tutorial.offsetWidth;
    tutorialPanelContainer.style.transform = "scale(1)";
    tutorialOverlay.style.opacity = 1;
}

async function closeTutorialPanel() {
    tutorialPanelContainer.style.transform = "scale(0)";
    tutorialOverlay.style.opacity = 0;
    await waitTransition(tutorialPanelContainer);
    tutorial.style.display = "none";
    document.body.classList.add("game-mode");
}