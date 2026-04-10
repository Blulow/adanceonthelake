export default class SpawnPattern {
    constructor(player, arena, telegraph) {
        this.player = player;
        this.arena = arena;
        this.telegraph = telegraph;
    }

    animate() {

    }

    getRandomDirection() {
        const angle = Math.random() * 360;
        const rad = angle * (Math.PI / 180);

        const distance = 300;

        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;

        return { x, y };
    }
}