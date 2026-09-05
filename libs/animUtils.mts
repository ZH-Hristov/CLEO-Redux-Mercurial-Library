export function PlayAnim(char: Char, animName: string, animFile: string, blendSpeed: float, loop: boolean, lockX: boolean, lockY: boolean, keepLastFrame: boolean, time: int) {
    Streaming.RequestAnimation(animFile)
    Streaming.LoadAllModelsNow()
    Task.PlayAnim(char, animName, animFile, blendSpeed, loop, lockX, lockY, keepLastFrame, time)
    Streaming.RemoveAnimation(animFile)
}
