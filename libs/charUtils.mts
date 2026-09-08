/**Returns forward direction of character or ScriptObject as a 2D vector. */
export function GetForwardDir(character: Char|ScriptObject) {
    const heading = character.getHeading() + 90
    const radians = heading * (Math.PI / 180)

    return {x: Math.cos(radians), y: Math.sin(radians)}
}

/**Returns right direction of character or ScriptObject as a 2D vector. */
export function GetRightDir(character: Char|ScriptObject) {
    const heading = character.getHeading()
    const radians = heading * (Math.PI / 180)

    return {x: Math.cos(radians), y: Math.sin(radians)}
}

