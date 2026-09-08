import { KeyCode, PadId } from "../../.config/sa.enums.mts"
import { getStickDir } from "./controlUtils.mts"
import { normalize2D, rotate2D, dotProduct2D } from "./mathUtils.mts"
import { Vector3 } from "./vectorLibrary.mts"

export let camStickDotForw: number = 0
export let camStickDotRight: number = 0

// TODO: this probably won't work now that the libs have been converted to .mts, probably will have to refactor it
async function cameraStickRelativity() {
    while (true) {
        const remInfo = getStickDir(PadId.Pad1)
        const camDir = getCamDir()
        const camDirRight = getCamDirRight()

        const v1 = normalize2D([remInfo.lx, remInfo.ly])
        const v2 = normalize2D([-camDir.x, camDir.y])
        const v2r = normalize2D([-camDirRight.x, camDirRight.y])

        const stickWorld = rotate2D(v1, (Camera.GetActiveRotation().z * (Math.PI / 180) ))
        camStickDotForw = dotProduct2D(stickWorld, v2)
        camStickDotRight = dotProduct2D(stickWorld, v2r) * -1
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

/**Returns forward direction of the camera as a Vector3. */
export function getCamDir(): Vector3 {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z

    const radians = oYaw * (Math.PI / 180)

    return new Vector3(Math.sin(radians), Math.cos(radians), pitch)
}

/**Returns right direction of the camera as a Vector3. */
export function getCamDirRight(): Vector3 {
    const camRot = Camera.GetActiveRotation()
    const pitch = remapCamPitchFrac()
    const oYaw = camRot.z + 90

    const radians = oYaw * (Math.PI / 180)

    return new Vector3(Math.sin(radians), Math.cos(radians), pitch)
}

/**Shows debug info about the camera on screen. Press TAB to hide. */
export async function camInfo() {

    while(!Pad.IsKeyPressed(KeyCode.Tab)) {
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
