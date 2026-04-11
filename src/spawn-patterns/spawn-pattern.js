export default class SpawnPattern {
    constructor(player, arena, attack, telegraph) {
        this.player = player;
        this.arena = arena;
        this.attack = attack;
        this.telegraph = telegraph
    }

    animate() {

    }

    getRandomDirection() {
        const angle = Math.random() * 360;
        const rad = angle * (Math.PI / 180);

        const distance = 700;

        const x = Math.cos(rad) * distance;
        const y = Math.sin(rad) * distance;

        return { x, y };
    }
}