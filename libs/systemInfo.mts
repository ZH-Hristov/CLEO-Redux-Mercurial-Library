const user32 = DynamicLibrary.Load("user32.dll")

if (!user32) {throw new Error("user32.dll failed to load")}

const getSystemMetricsProc = user32.getProcedure("GetSystemMetrics")
if(!getSystemMetricsProc) {throw new Error("getSystemMetricsProc procedure failed to load!")}

const getSystemMetrics = Memory.Fn.Stdcall(getSystemMetricsProc)
if(!getSystemMetrics) {throw new Error("getSystemMetrics function failed to load!")}

/**Returns the primary monitor's resolution */
export class sysInfo {
    static getResolution() {
        const width = getSystemMetrics(0)
        const height = getSystemMetrics(1)

        return {w: width, h: height}
    }
}
