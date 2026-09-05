export default class Noise {
    private seed: number;

    constructor(seed = 12345) {
        this.seed = seed;
    }

    private random(x: number, y: number): number {
        let n = x * 374761393 + y * 668265263 + this.seed * 1442695041;
        n = (n ^ (n >> 13)) * 1274126177;
        n ^= n >> 16;

        return (n >>> 0) / 4294967295;
    }

    private fade(t: number): number {
        // Quintic interpolation
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    noise2D(x: number, y: number): number {
        const x0 = Math.floor(x);
        const y0 = Math.floor(y);

        const tx = x - x0;
        const ty = y - y0;

        const a = this.random(x0,     y0);
        const b = this.random(x0 + 1, y0);
        const c = this.random(x0,     y0 + 1);
        const d = this.random(x0 + 1, y0 + 1);

        const u = this.fade(tx);
        const v = this.fade(ty);

        const top = a + (b - a) * u;
        const bottom = c + (d - c) * u;

        return (top + (bottom - top) * v) * 2 - 1;
    }
}