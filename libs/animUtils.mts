/**Queues an anim to play. */
export async function PlayAnim(char: Char, animName: string, animFile: string, blendSpeed: float, loop: boolean, lockX: boolean, lockY: boolean, keepLastFrame: boolean, time: int) {
    Streaming.RequestAnimation(animFile)
    Streaming.LoadAllModelsNow()
    Task.PlayAnim(char, animName, animFile, blendSpeed, loop, lockX, lockY, keepLastFrame, time)
    Streaming.RemoveAnimation(animFile)
}

/**Queues an anim to play which is not interruptable unless all Char tasks are immediately cleared. */
export async function PlayAnimNonInterruptable(char: Char, animName: string, animFile: string, blendSpeed: float, loop: boolean, lockX: boolean, lockY: boolean, keepLastFrame: boolean, time: int) {
    Streaming.RequestAnimation(animFile)
    Streaming.LoadAllModelsNow()
    Task.PlayAnimNonInterruptable(char, animName, animFile, blendSpeed, loop, lockX, lockY, keepLastFrame, time)
    Streaming.RemoveAnimation(animFile)
}
