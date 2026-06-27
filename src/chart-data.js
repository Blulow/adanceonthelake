import WordType from "./spawn-type/word-type";
import CharInWordType from "./spawn-type/char-in-word-type";
import CharInChordType from "./spawn-type/char-in-chord-type";
import RandomDirPosPattern from "./spawn-patterns/random-dir-pos-pattern";
import RandomDirPattern from "./spawn-patterns/random-dir-pattern";
import FallingPattern from "./spawn-patterns/falling-pattern";
import AttackPattern from "./attack-patterns/attack-pattern";
import LinePattern from "./attack-patterns/line-pattern";
import BulletShootPattern from "./attack-patterns/bullet-shoot-pattern";
import Telegraph from "./telegraphs/telegraph";
import DirPosTelegraph from "./telegraphs/dir-pos-telegraph";
import { t } from "./localization";

const SpawnTypes = {
    "WordType": WordType,
    "CharInWordType": CharInWordType,
    "CharInChordType": CharInChordType
}
const SpawnPatterns = {
    "RandomDirPosPattern": RandomDirPosPattern,
    "RandomDirPattern": RandomDirPattern,
    "FallingPattern": FallingPattern
}
const AttackPatterns = {
    "AttackPattern": AttackPattern,
    "LinePattern": LinePattern,
    "BulletShootPattern": BulletShootPattern
}
const Telegraphs = {
    "Telegraph": Telegraph,
    "DirPosTelegraph": DirPosTelegraph
}

export default class Chart {
    constructor(data) {
        this.name = data.name;
        this.img = new Image();
        this.img.src = data.img
        this.url = data.url
        this.author = data.author;
        this.difficulty = data.difficulty;
        this.chart = data.chart;
    }

    addSongTo(chartList) {
        const chart = document.createElement("li");
        chart.onclick = () => {
            localStorage.setItem("chart", JSON.stringify(this.chart));
            localStorage.setItem("url", this.url);
            window.location.href = `game.html`;
        };

        chart.innerHTML = 
            `
            <p class="label-title">${t(this.name)}</p>
            <p class="label-author">${t(this.author)}</p>
            <p class="label-difficulty ${this.getDifficultyStyle(this.difficulty)}">${this.difficulty}</p>
            <div class="label-img">${this.img.outerHTML}</div>
            `;
        
        chartList.appendChild(chart);
    }

    static getChart(_chart = null) {
        const chart = _chart ?? this.chart;
        chart.forEach(e => {
            e.type = SpawnTypes[e.type];
            e.pattern = SpawnPatterns[e.pattern];
            e.attack = AttackPatterns[e.attack];
            e.telegraph = Telegraphs[e.telegraph];
        });

        return chart;
    }

    getDifficultyStyle(diff) {
        switch (diff) {
            case "EASY":
                return "difficulty-easy";
            case "NORMAL":
                return "difficulty-normal";
            case "HARD":
                return "difficulty-hard";
        }
    }
}