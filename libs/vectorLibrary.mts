import { lerp } from "./mathUtils.mts"

export class Vector3 {
    constructor(
        public x = 0,
        public y = 0,
        public z = 0
    ) {}

    set(x: number, y: number, z: number): this {
        this.x = x
        this.y = y
        this.z = z
        return this
    }

    clone(): Vector3 {
        return new Vector3(this.x, this.y, this.z)
    }

    add(v: Vector3): Vector3 {
        return new Vector3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z,
        )
    }

    sub(v: Vector3): Vector3 {
        return new Vector3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z,
        )
    }

    mul(s: number): Vector3 {
        return new Vector3(
            this.x * s,
            this.y * s,
            this.z * s,
        )
    }

    mulVec(v: Vector3): Vector3 {
        return new Vector3(
            this.x * v.x,
            this.y * v.y,
            this.z * v.z,
        )
    }

    div(s: number): Vector3 {
        return new Vector3(
            this.x / s,
            this.y / s,
            this.z / s,
        )
    }

    divMut(s: number): this {
        this.x /= s
        this.y /= s
        this.z /= s
        return this
    }

    divVec(v: Vector3): Vector3 {
        return new Vector3(
            this.x / v.x,
            this.y / v.y,
            this.z / v.z,
        )
    }

    length(): number {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        )
    }

    lengthSquared(): number {
        return this.x * this.x +
               this.y * this.y +
               this.z * this.z
    }

    normalize(): this {
        const len = this.length()

        if (len > 0) {
            this.divMut(len)
        }

        return this
    }

    getNormalized(): Vector3 {
        const len = this.length()

        if (len > 0) {
            return this.div(len)
        }

        return Vector3.zero()
    }

    dot(v: Vector3): number {
        return this.x * v.x +
               this.y * v.y +
               this.z * v.z
    }

    cross(v: Vector3): Vector3 {
        return new Vector3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        )
    }

    distanceTo(v: Vector3): number {
        return Math.sqrt(
            this.distanceToSquared(v)
        )
    }

    distanceToSquared(v: Vector3): number {
        const x = this.x - v.x
        const y = this.y - v.y
        const z = this.z - v.z

        return x * x + y * y + z * z
    }

    equals(v: Vector3): boolean {
        return this.x === v.x &&
               this.y === v.y &&
               this.z === v.z
    }

    toString(): string {
        return `(${this.x}, ${this.y}, ${this.z})`
    }

    isZero(): boolean {
        return this.x == 0 && this.y == 0 && this.z == 0
    }

    getRotated(axis: Vector3, angle: number): Vector3 {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const dot = axis.dot(this)
        const cross = axis.cross(this)

        return new Vector3(
            this.x * cos + cross.x * sin + axis.x * dot * (1 - cos),
            this.y * cos + cross.y * sin + axis.y * dot * (1 - cos),
            this.z * cos + cross.z * sin + axis.z * dot * (1 - cos)
        )
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0)
    }

    static one(): Vector3 {
        return new Vector3(1, 1, 1)
    }

    /**Gets a direction vector from a heading value like Char.getHeading() */
    static fromHeading(heading: float): Vector3 {
        const radians = heading * (Math.PI / 180)
        return new Vector3(Math.cos(radians), Math.sin(radians), 0)
    }

    static lerp(from: Vector3, to: Vector3, a: number): Vector3 {
        return new Vector3( lerp(from.x, to.x, a), lerp(from.y, to.y, a), lerp(from.z, to.z, a) )
    }
}