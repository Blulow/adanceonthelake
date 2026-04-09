import SpawnPattern from "./spawn-pattern";

export default class WordPattern extends SpawnPattern {
    constructor(player, arena) {
        super(player, arena);
        this.w = player.video.firstWord;
        this.lastWord = null;
        this.lastTextElement = null;
    }

    animate() {
        while(this.w) {
            console.log(this.w);
            this.w.animate = (now, unit) => {
                if (unit.contains(now)) {
                    if (unit.text !== lastWord) {
                        if (this.lastTextElement) this.lastTextElement.remove();
                        const text = document.createElement("div");
                        text.classList.add("text");
                        text.innerText = unit.text;
                        this.arena.appendChild(text);

                        text.style.top = `${Math.random() * (window.innerHeight - text.offsetHeight)}px`;
                        text.style.left = `${Math.random() * (window.innerWidth - text.offsetWidth)}px`;
                        const { x, y } = getRandomDirection();
                        text.style.transform = `translate(${x}px, ${y}px)`;

                        this.lastTextElement = text;
                        this.lastWord = unit.text;
                    }
                }
                if (!this.player.video.findChar(now)) {
                    if (this.lastTextElement) this.lastTextElement.remove();
                }
            };
            this.w = this.w.next;
        }
    }
}