export function rotate2D(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [
        v[0] * cos - v[1] * sin,
        v[0] * sin + v[1] * cos
    ];
}

export function normalize(v) {
    const len = Math.hypot(v[0], v[1]);
    if (len === 0) return [0, 0];
    return [v[0] / len, v[1] / len];
}

export function normalize3D(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    if (len === 0) return [0, 0];
    return [v[0] / len, v[1] / len, v[2] / len];
}

export function dotProduct(vector1, vector2) {
    let result = 0;
    for (let i = 0; i < vector1.length; i++) {
        result += vector1[i] * vector2[i];
    }
    return result;
}

export function GetHeadingFromDir(x: number, y: number) {
    const radians = Math.atan2(y, x)
    let heading = radians * (180 / Math.PI)

    // optional: normalize to [0, 360)
    heading = (heading % 360 + 360) % 360

    return heading
}

export function lerp(x: number, y: number, a: number) { return x * (1 - a) + y * a; }

export function Approach( cur: number, target: number, inc: number ) {
    if ( cur < target ) {
        return Math.min( cur + Math.abs( inc ), target )
    }

    if ( cur > target ) {
        return Math.max( cur - Math.abs( inc ), target )
    }

    return target
}

export function remap(value: number, x1: number, y1: number, x2: number, y2: number) {
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
}