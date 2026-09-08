import { SurfaceType } from "../../.config/sa.enums.mts";
import { Vector3 } from "./vectorLibrary.mts";

//CWorld::ProcessLineOfSight
//Memory.Fn.CdeclI32(0x56BA00)(origin: int /*CVector const&*/, target: int /*CVector const&*/, outColPoint: int /*CColPoint&*/, outEntity: int, buildings: boolean, vehicles: boolean, peds: boolean, objects: boolean, dummies: boolean, doSeeThroughCheck: boolean, doCameraIgnoreCheck: boolean, doShootThroughCheck: boolean)

export interface traceData {
    hitPos: Vector3
    normal: Vector3
    depth: float
    surfaceType: SurfaceType
}

export class trace {

    /**Casts a ray from startPos to endPos and returns a structure with hit data if the ray hit anything.
     * @param startPos Position ray will start from
     * @param endPos Position ray will try to travel to
     * @param ignoreEnt Address of entity to ignore, e.g. the player character
     * @returns Hit data. See exported traceData interface
     */
    static line(startPos: Vector3, endPos: Vector3, ignoreEnt?: int): traceData | undefined {
        const SPCVecAddr = Memory.Allocate(8)
        const EPCVecAddr = Memory.Allocate(8)
        const CColPointAddr = Memory.Allocate(0x2C)
        const OutEntity = Memory.Allocate(4)
        // CVector Constructor
        //Memory.Fn.ThiscallI32(0x406D20, self: int /*CVector*/)(Memory.FromFloat(x), Memory.FromFloat(y), Memory.FromFloat(z))
        const startVec = Memory.Fn.ThiscallI32(0x406D20, SPCVecAddr)(Memory.FromFloat(startPos.x), Memory.FromFloat(startPos.y), Memory.FromFloat(startPos.z))
        const endVec = Memory.Fn.ThiscallI32(0x406D20, EPCVecAddr)(Memory.FromFloat(endPos.x), Memory.FromFloat(endPos.y), Memory.FromFloat(endPos.z))

        if(ignoreEnt) {Memory.WriteI32(0xB7CD68, ignoreEnt)} // seems to crash
        const hitSomething = Memory.Fn.CdeclU8(0x56BA00)(startVec, endVec, CColPointAddr, OutEntity, 1, 1, 1, 1, 0, 0, 0, 0)
        if(ignoreEnt) {Memory.WriteI32(0xB7CD68, 0)}
    
        let retStruct

        if (hitSomething == 1) {
            retStruct = {} as traceData
            const normX = Memory.ReadFloat( CColPointAddr + 0x10 )
            const normY = Memory.ReadFloat( CColPointAddr + 0x10 + 4 )
            const normZ = Memory.ReadFloat( CColPointAddr + 0x10 + 8 )

            const hitX = Memory.ReadFloat( CColPointAddr + 0x0 )
            const hitY = Memory.ReadFloat( CColPointAddr + 0x0 + 4 )
            const hitZ = Memory.ReadFloat( CColPointAddr + 0x0 + 8 )

            retStruct.hitPos = new Vector3( hitX, hitY, hitZ )
            retStruct.normal = new Vector3( normX, normY, normZ )
            retStruct.depth = Memory.ReadFloat( CColPointAddr + 0x28 )
            retStruct.surfaceType = Memory.ReadI32( CColPointAddr + 0x20 )
        }
    
        Memory.Free(SPCVecAddr)
        Memory.Free(EPCVecAddr)
        Memory.Free(CColPointAddr)
        Memory.Free(OutEntity)

        return retStruct
    }

/*     static sphere(startPos: Vector3, endPos: Vector3, radius: number, step: number = 0.05): boolean {
        //TODO: make this shit. it's gonna be hacky, we don't have access to any functions that test collision against the world with a sphere
    } */
}