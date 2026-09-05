import { Vector3 } from "./vectorLibrary.mts";

export function getCarPos(car: Car): Vector3 {
    const coords = car.getCoordinates()
    return new Vector3(coords.x, coords.y, coords.z)
}

export function getCarForwardVector(car: Car): Vector3 {
    return Vector3.fromHeading(car.getHeading() + 90)
}

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

export function getCarRightVector(car: Car): Vector3 {
    return Vector3.fromHeading(car.getHeading())
}

export function getCarPitchDegrees(car: Car): float {
    const opitch = car.getPitch()

    if (opitch > 270) {
        return opitch - 360
    } else if (opitch > 90) {
        return 180 - opitch
    }

    return opitch
}

export function getCarSpeed(car: Car): Vector3 {
    const spd = car.getSpeedVector()
    return new Vector3(spd.x, spd.y, spd.z)
}