import { PadId } from "../../.config/sa.enums.mts"
import { getStickDir } from "./controlUtils.mts"
import { normalize, rotate2D, dotProduct, normalize3D } from "./mathUtils.mts"

export let camStickDotForw: number = 0
export let camStickDotRight: number = 0

async function cameraStickRelativity() {
    while (true) {
        const remInfo = getStickDir(PadId.Pad1)
        const camDir = getCamDir()
        const camDirRight = getCamDirRight()

        const v1 = normalize([remInfo.lx, remInfo.ly])
        const v2 = normalize([-camDir.x, camDir.y])
        const v2r = normalize([-camDirRight.x, camDirRight.y])

        const stickWorld = rotate2D(v1, (Camera.GetActiveRotation().z * (Math.PI / 180) ))
        camStickDotForw = dotProduct(stickWorld, v2)
        camStickDotRight = dotProduct(stickWorld, v2r) * -1
        await asyncWait(0)
    }
}
cameraStickRelativity()

export function remapCamPitch() {
    const camRot = Camera.GetActiveRotation()
    const oPitch = camRot.y

    if (oPitch >= 0 && oPitch <= 90) {
        return oPitch
    } else if (oPitch >= 275 && oPitch <= 360) {
        const frac = 1 - ((oPitch - 275) / 85)
        return frac * -85
    }
}

export function remapCamPitchFrac() {
    const camRot = Camera.GetActiveRotation()
    const oPitch = camRot.y

    if (oPitch >= 0 && oPitch <= 90) {
        return oPitch / 90
    } else if (oPitch >= 275 && oPitch <= 360) {
        const frac = 1 - ((oPitch - 275) / 85)
        return frac * -1
    }
}

export function getCamDir() {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z

    const radians = oYaw * (Math.PI / 180)

    return {x: Math.sin(radians), y: Math.cos(radians), z: pitch}
}

export function getCamDirNormalized() {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z

    const radians = oYaw * (Math.PI / 180)

    const dir = {x: Math.sin(radians), y: Math.cos(radians), z: pitch}
    const normaled = normalize3D( [dir.x, dir.y, dir.z] )

    return {x: normaled[0], y: normaled[1], z: normaled[2]}
}

export function getCamDirRight() {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z + 90

    const radians = oYaw * (Math.PI / 180)

    return {x: Math.sin(radians), y: Math.cos(radians), z: pitch}
}


export function getCamDirRightNormalized() {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z + 90

    const radians = oYaw * (Math.PI / 180)

    const dir = {x: Math.sin(radians), y: Math.cos(radians), z: pitch}
    const normaled = normalize3D( [dir.x, dir.y, dir.z] )

    return {x: normaled[0], y: normaled[1], z: normaled[2]}
}

export async function camInfo() {

    while(true) {
        const camRot = Camera.GetActiveRotation()
        const remapped = remapCamPitch()

        Text.UseCommands(true)
        Text.DisplayFormatted(300, 260, `X: ${camRot.x} Y: ${camRot.y} Z: ${camRot.z}`)
        Text.DisplayFormatted(300, 240, `Remapped: ${remapped}`)
        Text.UseCommands(false)

        await asyncWait(0)
    }
}

const FOVAddr = 0xb6f028 + 0xcb8
export function getCamFOV(): number {
    return Memory.ReadFloat(FOVAddr, false)
}

/**
 * Sets the camera's FOV. Requires Camera.PersistFOV(true)
 * @param newFov The new FOV number.
 */
export function setCamFOV(newFov: number) {
    Memory.WriteFloat(FOVAddr, newFov, false)
}
