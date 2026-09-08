// TODO: all this fake 2d vector bullshit is gross and old and i need to refactor it

interface Vec2 extends Array<number> {
    [0]: number
    [1]: number
}

/**Rotate a 2D vector by an angle. */
export function rotate2D(v: Vec2, angle: number): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        v[0] * cos - v[1] * sin,
        v[0] * sin + v[1] * cos
    ];
}

/**Normalizes a 2d vector. */
export function normalize2D(v: Vec2): Vec2 {
    const len = Math.hypot(v[0], v[1]);
    if (len === 0) return [0, 0];
    return [v[0] / len, v[1] / len];
}

/**Gets dot product of 2 Vec2 instances. */
export function dotProduct2D(vector1: Vec2, vector2: Vec2): number {
    let result = 0;
    for (let i = 0; i < vector1.length; i++) {
        result += vector1[i] * vector2[i];
    }
    return result;
}

/**Gets a heading number from a 2D direction vector. */
export function GetHeadingFromDir(x: number, y: number) {
    const radians = Math.atan2(y, x)
    let heading = radians * (180 / Math.PI)

    // optional: normalize to [0, 360)
    heading = (heading % 360 + 360) % 360

    return heading
}

export function lerp(x: number, y: number, a: number) { return x * (1 - a) + y * a; }

/**Returns number that approaches target number. Approaches by 3rd parameter, which acts as increment/step */
export function Approach( cur: number, target: number, inc: number ) {
    if ( cur < target ) {
        return Math.min( cur + Math.abs( inc ), target )
    }

    if ( cur > target ) {
        return Math.max( cur - Math.abs( inc ), target )
    }

    return target
}

/**Remaps a number from one range to another */
export function remap(value: number, x1: number, y1: number, x2: number, y2: number) {
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
}