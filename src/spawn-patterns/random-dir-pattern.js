import SpawnPattern from "./spawn-pattern";

export default class RandomDirPattern extends SpawnPattern {
    constructor(player) {
        super();
        this.player = player;

        this.textTopValue = 0;
        this.textLeftValue = 0;

        this.textGroup = null;

        this.sides = {
            TOP: 0,
            BOTTOM: 1,
            LEFT: 2,
            RIGHT: 3
        }
        this.side = this.sides.TOP;
        this.unitDim = { width: 0, height: 0 };

        this.reverse = false;
    }

    spawnGroup(textInGroup, arena, isChorus, isWord = false) {
        if (Math.random() > 0.5) this.reverse = !this.reverse;

        let minHeight = 0;
        let maxHeight = window.innerHeight;
        let minWidth = 0;
        let maxWidth = window.innerWidth;

        if (isChorus) {
            const landscape = window.matchMedia("(orientation: landscape)").matches;
            minHeight = window.innerHeight * (landscape ? 0.03 : 0.05);
            maxHeight = window.innerHeight * (landscape ? 0.97 : 0.95);
            minWidth = window.innerWidth * (landscape ? 0.03 : 0.05);
            maxWidth = window.innerWidth * (landscape ? 0.97 : 0.95);
        }

        this.textGroup = document.createElement("div");
        this.textGroup.classList.add("text-group");
        arena.appendChild(this.textGroup);

        const unitWord = document.createElement("div");
        unitWord.innerText = textInGroup[0];
        unitWord.style.fontSize = Math.max(window.innerHeight, window.innerWidth) > 1024 ? "7vw" : "10vw";
        unitWord.style.lineHeight = "1";
        arena.appendChild(unitWord);

        this.side = Math.floor(Math.random() * 4);
        do {
            switch (this.side) {
                case this.sides.TOP:
                    this.textTopValue = minHeight - unitWord.clientHeight;
                    this.textLeftValue = minWidth + Math.random() * ((maxWidth - minWidth) + unitWord.clientWidth) - unitWord.clientWidth;
                    break;
                case this.sides.BOTTOM:
                    this.textTopValue = maxHeight - (window.innerHeight * 0.07);
                    this.textLeftValue = minWidth + Math.random() * ((maxWidth - minWidth) + unitWord.clientWidth) - unitWord.clientWidth;
                    break;
                case this.sides.LEFT:
                    this.textTopValue = minHeight + Math.random() * ((maxHeight - minHeight) + unitWord.clientHeight) - unitWord.clientHeight;
                    this.textLeftValue = minWidth - unitWord.clientWidth;
                    break;
                case this.sides.RIGHT:
                    this.textTopValue = minHeight + Math.random() * ((maxHeight - minHeight) + unitWord.clientHeight) - unitWord.clientHeight;
                    this.textLeftValue = maxWidth;
                    break;
            }
        } while ([...document.getElementsByClassName("text")].filter(e => !(
            this.textLeftValue + unitWord.offsetWidth < e.getBoundingClientRect().left ||
            this.textLeftValue > e.getBoundingClientRect().right ||
            this.textTopValue + unitWord.offsetHeight < e.getBoundingClientRect().top ||
            this.textTopValue > e.getBoundingClientRect().bottom
        )).length > 0);
        this.unitDim = { width: unitWord.clientWidth, height: unitWord.clientHeight };
        unitWord.remove();
        
        if (isWord) this.textGroup.dataset.length = 1;
        else this.textGroup.dataset.length = textInGroup.length;
    }
    
    spawnLyric(lyric) {
        lyric.text.classList.add("bullet", "lyric-bullet");
        lyric.text.classList.add("text-movetoedge");
        if (this.side === this.sides.TOP || this.side === this.sides.BOTTOM) lyric.text.classList.add("column");
        
        const waterWave = document.createElement("div");
        waterWave.classList.add("water-wave");
        lyric.text.appendChild(waterWave);
        
        lyric.onMoveToEdge(() => {
            const text = lyric.text;
            text.parentElement.dataset.length--;
            if (text.parentElement.dataset.length <= 0) text.parentElement.remove();
        });
        
        const lyricPos = { x: this.textLeftValue, y: this.textTopValue };
        
        const endPos = this.getEndPos(lyricPos, this.unitDim);
        lyric.setPosAndMoveToEdge(this.textLeftValue, this.textTopValue, endPos.x - lyricPos.x, endPos.y - lyricPos.y);
        lyric.spawn(this.textGroup);
    }

    getEndPos(lyricPos, lyricDim) {
        const relX = this.player.x - lyricPos.x;
        const relY = this.player.y - lyricPos.y;

        const values = [];

        if (relX !== 0) {
            values.push((-lyricDim.width - lyricPos.x) / relX);
            values.push((window.innerWidth - lyricPos.x) / relX);
        }
        if (relY !== 0) {
            values.push((-lyricDim.height - lyricPos.y) / relY);
            values.push((window.innerHeight - lyricPos.y) / relY);
        }

        const closestValue = Math.min(...values.filter(t => t > 1));

        return { x: lyricPos.x + relX * closestValue, y: lyricPos.y + relY * closestValue };
    }

    offsetText(lyric) {
        switch (this.side) {
            case this.sides.TOP:
                if (this.reverse) {
                    this.textLeftValue -= lyric.text.clientWidth;
                    if (this.textLeftValue < 0) {
                        this.side = this.sides.LEFT;
                        this.textLeftValue = -lyric.text.clientWidth;
                        this.textTopValue = 0;
                    }
                } else {
                    this.textLeftValue += lyric.text.clientWidth;
                    if (this.textLeftValue + lyric.text.clientWidth > window.innerWidth) {
                        this.side = this.sides.RIGHT;
                        this.textLeftValue = window.innerWidth;
                        this.textTopValue = 0;
                    }
                }
                break;
            case this.sides.BOTTOM:
                if (this.reverse) {
                    this.textLeftValue += lyric.text.clientWidth;
                    if (this.textLeftValue + lyric.text.clientWidth > window.innerWidth) {
                        this.side = this.sides.RIGHT;
                        this.textLeftValue = window.innerWidth;
                        this.textTopValue = window.innerHeight - lyric.text.clientHeight;
                    }
                } else {
                    this.textLeftValue -= lyric.text.clientWidth;
                    if (this.textLeftValue < 0) {
                        this.side = this.sides.LEFT;
                        this.textLeftValue = -lyric.text.clientWidth;
                        this.textTopValue = window.innerHeight - lyric.text.clientHeight;
                    }
                }
                break;
            case this.sides.LEFT:
                if (this.reverse) {
                    this.textTopValue += lyric.text.clientHeight;
                    if (this.textTopValue + lyric.text.clientHeight > window.innerHeight) {
                        this.side = this.sides.BOTTOM;
                        this.textLeftValue = 0;
                        this.textTopValue = window.innerHeight;
                    }
                } else {
                    this.textTopValue -= lyric.text.clientHeight;
                    if (this.textTopValue < 0) {
                        this.side = this.sides.TOP;
                        this.textLeftValue = 0;
                        this.textTopValue = -lyric.text.clientHeight;
                    }
                }
                break;
            case this.sides.RIGHT:
                if (this.reverse) {
                    this.textTopValue -= lyric.text.clientHeight;
                    if (this.textTopValue < 0) {
                        this.side = this.sides.TOP;
                        this.textLeftValue = window.innerWidth - lyric.text.clientWidth;
                        this.textTopValue = -lyric.text.clientHeight;
                    }
                } else {
                    this.textTopValue += lyric.text.clientHeight;
                    if (this.textTopValue + lyric.text.clientHeight > window.innerHeight) {
                        this.side = this.sides.BOTTOM;
                        this.textLeftValue = window.innerWidth - lyric.text.clientWidth;
                        this.textTopValue = window.innerHeight;
                    }
                }
                break;
        }
    }
}