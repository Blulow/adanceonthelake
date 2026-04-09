export default class SpawnPattern {
    constructor(player, arena) {
        this.player = player;
        this.arena = arena;
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