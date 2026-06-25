import { settings } from "./settings";

const hitsItem = document.getElementById("item-hits");
const coinsItem = document.getElementById("item-coins");
const scoreItem = document.getElementById("item-score");
const comboBonusItem = document.getElementById("item-combobonus");
const hitPenaltyItem = document.getElementById("item-hitpenalty");
const maxComboItem = document.getElementById("item-maxcombo");
const rankItem = document.getElementById("item-rank");
hitsItem.innerText = "";
coinsItem.innerText = "";
scoreItem.innerText = "";
comboBonusItem.innerText = "";
hitPenaltyItem.innerText = "";
maxComboItem.innerText = "";
rankItem.innerText = "";
const hitsLabel = document.getElementById("hits").children[0];
const coinsLabel = document.getElementById("coins").children[0];
const scoreLabel = document.getElementById("score").children[0];
const comboBonusLabel = document.getElementById("combobonus").children[0];
const hitPenaltyLabel = document.getElementById("hitpenalty").children[0];
const maxComboLabel = document.getElementById("maxcombo").children[0];
const posSign = document.getElementById("combobonus").children[1];
const negSign = document.getElementById("hitpenalty").children[1];
const rankLabel = document.getElementById("rank").children[0];
hitsLabel.style.opacity = 0;
coinsLabel.style.opacity = 0;
scoreLabel.style.opacity = 0;
comboBonusLabel.style.opacity = 0;
hitPenaltyLabel.style.opacity = 0;
maxComboLabel.style.opacity = 0;
posSign.style.opacity = 0;
negSign.style.opacity = 0;
rankLabel.style.opacity = 0;
const rankBar = document.getElementById("rankbar-progress");
rankBar.style.opacity = 0;

const hits = parseInt(localStorage.getItem("hits"));
const coins = parseInt(localStorage.getItem("coins"));
const maxCombo = parseInt(localStorage.getItem("maxCombo"));
const score = coins * 100;
const comboBonus = parseInt(localStorage.getItem("comboBonus"));
const hitPenalty = hits * 50;
const totalScore = parseInt(localStorage.getItem("score"));
const maxScore = parseInt(localStorage.getItem("maxScore"));

class Rank {
    static NOHIT = "N";
    static SS = "SS";
    static S = "S";
    static A = "A";
    static B = "B";
    static C = "C";
    static D = "D";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateItemNumber(item, _start, _end, sixDigit = false) {
    const start = parseInt(_start);
    const end = parseInt(_end);
    const increment = Math.max(1, Math.ceil(Math.abs(end - start) / 39));

    if (start < end) {
        for (let count = start; count <= end; count += increment) {
            item.innerText = sixDigit ? count.toString().padStart(6, "0") : count;
            await sleep(10);
        }
    } else {
        for (let count = start; count >= end; count -= increment) {
            item.innerText = sixDigit ? count.toString().padStart(6, "0") : count;
            await sleep(10);
        }
    }

    item.innerText = sixDigit ? end.toString().padStart(6, "0") : end;
}

function getRank(score) {
    const relScore = score / maxScore;
    switch (true) {
        case relScore >= 0.95 && hits === 0:
            return Rank.SS;
        case relScore >= 0.8:
            return Rank.S;
        case relScore >= 0.7:
            return Rank.A;
        case relScore >= 0.6:
            return Rank.B;
        case relScore >= 0.5:
            return Rank.C;
    }
    return Rank.D;
}

async function animSequence() {
    hitsLabel.style.opacity = 1;
    hitsLabel.classList.add("label-pop");
    await updateItemNumber(hitsItem, 0, hits);
    coinsLabel.style.opacity = 1;
    coinsLabel.classList.add("label-pop");
    await updateItemNumber(coinsItem, 0, coins);
    maxComboLabel.style.opacity = 1;
    maxComboLabel.classList.add("label-pop");
    await updateItemNumber(maxComboItem, 0, maxCombo);
    scoreLabel.style.opacity = 1;
    scoreLabel.classList.add("label-pop");
    rankBar.style.opacity = 1;
    rankBar.style.height = `${score / maxScore * 100}%`;
    await updateItemNumber(scoreItem, 0, score, true);
    comboBonusLabel.style.opacity = 1;
    posSign.style.opacity = 1;
    comboBonusLabel.classList.add("label-pop");
    rankBar.style.height = `${(score + comboBonus) / maxScore * 100}%`;
    await Promise.all([
        updateItemNumber(comboBonusItem, 0, comboBonus, true),
        updateItemNumber(scoreItem, score, score + comboBonus, true)
    ]);
    hitPenaltyLabel.style.opacity = 1;
    negSign.style.opacity = 1;
    hitPenaltyLabel.classList.add("label-pop");
    rankBar.style.height = `${totalScore / maxScore * 100}%`;
    await Promise.all([
        updateItemNumber(hitPenaltyItem, 0, hitPenalty, true),
        updateItemNumber(scoreItem, score + comboBonus, totalScore, true)
    ]);
    rankLabel.style.opacity = 1;
    rankLabel.classList.add("label-pop");
    rankItem.innerText = getRank(totalScore);
    rankItem.classList.add("rank-pop");
    if ((JSON.parse(localStorage.getItem("settings")) ?? settings).screenshake) document.body.classList.add("screenshake");
}

animSequence();

window.addEventListener("keydown", e => {
    window.location.href = "level-select.html";
    localStorage.removeItem("chart");
    localStorage.removeItem("url");
});