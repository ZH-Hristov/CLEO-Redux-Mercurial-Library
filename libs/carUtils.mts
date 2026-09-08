import { Vector3 } from "./vectorLibrary.mts";

/**Gets car position as Vector3. */
export function getCarPos(car: Car): Vector3 {
    const coords = car.getCoordinates()
    return new Vector3(coords.x, coords.y, coords.z)
}

/**Gets forward direction of car as a Vector3. No pitch value. */
export function getCarForwardVector(car: Car): Vector3 {
    return Vector3.fromHeading(car.getHeading() + 90)
}

/**Gets forward direction of car as a Vector3 */
export function getCarForwardWithPitchVector(car: Car): Vector3 {
    const heading = car.getHeading() + 90
    const pitch = getCarPitchDegrees(car)
    const h = heading * Math.PI / 180
    const p = pitch * Math.PI / 180
    const cosPitch = Math.cos(p)

    const carForw = new Vector3(
        Math.cos(h) * cosPitch,
        Math.sin(h) * cosPitch,
        Math.sin(p)
    ).normalize()
    return carForw
}

/**Gets right direction of car as a Vector3. No pitch/roll. */
export function getCarRightVector(car: Car): Vector3 {
    return Vector3.fromHeading(car.getHeading())
}

/**Gets car pitch in degrees. */
export function getCarPitchDegrees(car: Car): float {
    const opitch = car.getPitch()

    if (opitch > 270) {
        return opitch - 360
    } else if (opitch > 90) {
        return 180 - opitch
    }

    return opitch
}

/**Gets car velocity as a Vector3 */
export function getCarSpeed(car: Car): Vector3 {
    const spd = car.getSpeedVector()
    return new Vector3(spd.x, spd.y, spd.z)
}