import { currentLang, setCurrentLang, setLanguage } from "./localization";

let panelOpen = false;
document.getElementById("language-btn").onclick = () => {
    if (panelOpen) closeLanguagePanel(); else openLanguagePanel();
}

const langBtnLefts = {};

const language = document.getElementById("language");
const languagePanelContainer = document.getElementById("language-panel-container");
const languageContainer = document.getElementById("language-container");
const langBtn = document.getElementsByClassName("lang-btn");
const langCurrent = document.getElementById("lang-current");

[...langBtn].forEach(e => {
    const btnRect = e.getBoundingClientRect();
    const containerRect = languageContainer.getBoundingClientRect();
    const left = btnRect.x - containerRect.x;
    const leftC = left - (langCurrent.getBoundingClientRect().width - btnRect.width) / 2
    const leftP = leftC / containerRect.width * 100;
    
    langBtnLefts[e.dataset.langbtn] = `${leftP}%`;
    if (e.dataset.langbtn === currentLang) e.style.color = "#000000";
    
    e.onclick = async() => {
        if (e.dataset.langbtn === currentLang) return;
        [...langBtn].forEach(e => e.style.color = "#ffffff");
        langCurrent.style.left = langBtnLefts[e.dataset.langbtn];
        e.style.color = "#000000";
        setCurrentLang(e.dataset.langbtn);
        setLanguage(currentLang);
        await waitTransition(langCurrent);
        await closeLanguagePanel();
        setTimeout(() => location.reload(), 200);
    };
});
langCurrent.style.left = langBtnLefts[currentLang];
language.style.display = "none";
languagePanelContainer.style.transform = "scale(0)";
langCurrent.style.visibility = "hidden";

function openLanguagePanel() {
    language.style.display = "flex";
    language.offsetWidth;
    languagePanelContainer.style.transform = "scale(1)";
    langCurrent.style.visibility = "visible";
    panelOpen = true;
}

async function closeLanguagePanel() {
    languagePanelContainer.style.transform = "scale(0)";
    await waitTransition(languagePanelContainer);
    langCurrent.style.visibility = "hidden";
    panelOpen = false;
}
