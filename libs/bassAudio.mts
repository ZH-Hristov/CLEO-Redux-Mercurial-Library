/**
 *
 * Usage:
 *   const sample = BASS.loadSample("horn.wav")
 *   const channel = sample.play()
 *   channel.setVolume(0.5)
 *
 *   // Effects require a stream, not a sample - BASS only allows
 *   // BASS_ChannelSetFX on streams and MOD music.
 *   const stream = BASS.loadStream("engine.wav", true)
 *   stream.play()
 *   stream.setReverb({ reverbMixDb: -10 })
 */

// Config

const isDebugEnabled = true

// BASS constants

const BASS_FILE_NAME = 0

const BASS_SAMPLE_LOOP = 0x4
const BASS_SAMPLE_FX = 0x80

const BASS_UNICODE = 0x80000000

const BASS_ATTRIB_FREQ = 1
const BASS_ATTRIB_VOL = 2
const BASS_ATTRIB_PAN = 3

export enum DX8EffectType {
    Chorus = 0,
    Compressor = 1,
    Distortion = 2,
    Echo = 3,
    Flanger = 4,
    Gargle = 5,
    I3DL2Reverb = 6,
    ParamEQ = 7,
    Reverb = 8,
}

const BASS_ERRORS: Record<number, string> = {
    [0]: "BASS_OK",
    [1]: "BASS_ERROR_MEM",
    [2]: "BASS_ERROR_FILEOPEN",
    [3]: "BASS_ERROR_DRIVER",
    [4]: "BASS_ERROR_BUFLOST",
    [5]: "BASS_ERROR_HANDLE",
    [6]: "BASS_ERROR_FORMAT",
    [7]: "BASS_ERROR_POSITION",
    [8]: "BASS_ERROR_INIT",
    [9]: "BASS_ERROR_START",
    [14]: "BASS_ERROR_ALREADY",
    [17]: "BASS_ERROR_NOTAUDIO",
    [18]: "BASS_ERROR_NOCHAN",
    [19]: "BASS_ERROR_ILLTYPE",
    [20]: "BASS_ERROR_ILLPARAM",
    [21]: "BASS_ERROR_NO3D",
    [23]: "BASS_ERROR_DEVICE",
    [24]: "BASS_ERROR_NOPLAY",
    [25]: "BASS_ERROR_FREQ",
    [31]: "BASS_ERROR_EMPTY",
    [34]: "BASS_ERROR_NOFX",
    [37]: "BASS_ERROR_NOTAVAIL",
    [41]: "BASS_ERROR_FILEFORM",
    [42]: "BASS_ERROR_SPEAKER",
    [43]: "BASS_ERROR_VERSION",
    [44]: "BASS_ERROR_CODEC",
    [45]: "BASS_ERROR_ENDED",
    [46]: "BASS_ERROR_BUSY",
    [47]: "BASS_ERROR_UNSTREAMABLE",
    [48]: "BASS_ERROR_PROTOCOL",
    [49]: "BASS_ERROR_DENIED",
    [50]: "BASS_ERROR_FREEING",
    [51]: "BASS_ERROR_CANCEL",
    [-1]: "BASS_ERROR_UNKNOWN",
}

// Types

type BassFn = (...args: number[]) => number

export interface Sample {
    handle: number
    maxChannels: number
    loop: boolean

    play(): Channel
    free(): void
}

export interface Channel {
    handle: number
    sample: Sample

    play(): void
    stop(): void
    pause(): void
    free(): void

    setVolume(volume: number): void
    setPan(pan: number): void
    setFrequency(frequency: number): void
    setPitch(pitch: number): void
}

export interface Stream {
    handle: number

    play(): void
    stop(): void
    pause(): void
    free(): void

    setVolume(volume: number): void
    setPan(pan: number): void
    setFrequency(frequency: number): void
    setPitch(pitch: number): void

    setChorus(params?: ChorusParams): number
    setCompressor(params?: CompressorParams): number
    setDistortion(params?: DistortionParams): number
    setEcho(params?: EchoParams): number
    setFlanger(params?: FlangerParams): number
    setGargle(params?: GargleParams): number
    setI3DL2Reverb(params?: I3DL2ReverbParams): number
    setParamEQ(params?: ParamEQParams): number
    setReverb(params?: ReverbParams): number
    removeFx(fx: number): void
}

/** Parameters for DX8EffectType.Chorus (BASS_DX8_CHORUS). */
export interface ChorusParams {
    /** Ratio of wet (affected) to dry (unaffected) signal, in %. Range [0, 100]. Default 50. */
    wetDryMix?: number
    /** Percentage by which the delay time is modulated, in %. Range [0, 100]. Default 10. */
    depth?: number
    /** Percentage of output fed back into input. Range [-99, 99]. Default 25. */
    feedback?: number
    /** LFO frequency, in Hz. Range [0, 10]. Default 1.1. */
    frequency?: number
    /** LFO waveform. Default "sine". */
    waveform?: "triangle" | "sine"
    /** Delay time in ms. Range [0, 20]. Default 16. */
    delay?: number
    /** Degree by which left/right channels are out of phase, 0 (none) to 4 (180 deg). Default 2. */
    phase?: number
}

/** Parameters for DX8EffectType.Compressor (BASS_DX8_COMPRESSOR). */
export interface CompressorParams {
    /** Output gain in dB. Range [-60, 60]. Default 0. */
    gain?: number
    /** Attack time in ms. Range [0.01, 500]. Default 10. */
    attack?: number
    /** Release time in ms. Range [50, 3000]. Default 200. */
    release?: number
    /** Point at which compression begins, in dB. Range [-60, 0]. Default -20. */
    threshold?: number
    /** Compression ratio. Range [1, 100]. Default 3. */
    ratio?: number
    /** Predelay in ms. Range [0, 4]. Default 4. */
    predelay?: number
}

/** Parameters for DX8EffectType.Distortion (BASS_DX8_DISTORTION). */
export interface DistortionParams {
    /** Gain in dB. Range [-60, 0]. Default 0. */
    gain?: number
    /** Percentage of distortion intensity, in %. Range [0, 100]. Default 50. */
    edge?: number
    /** Center frequency of harmonic content addition, in Hz. Range [100, 8000]. Default 2400. */
    postEqCenterFrequency?: number
    /** Width of the harmonic content band, in Hz. Range [100, 8000]. Default 2400. */
    postEqBandwidth?: number
    /** Cutoff for the filter preceding distortion, in Hz. Range [100, 8000]. Default 8000. */
    preLowpassCutoff?: number
}

/** Parameters for DX8EffectType.Echo (BASS_DX8_ECHO). */
export interface EchoParams {
    /** Ratio of wet to dry signal, in %. Range [0, 100]. Default 50. */
    wetDryMix?: number
    /** Percentage of output fed back into input. Range [0, 100]. Default 50. */
    feedback?: number
    /** Delay for the left channel, in ms. Range [1, 2000]. Default 333. */
    leftDelay?: number
    /** Delay for the right channel, in ms. Range [1, 2000]. Default 333. */
    rightDelay?: number
    /** Swap left/right delays with each successive echo. Default false. */
    panDelay?: boolean
}

/** Parameters for DX8EffectType.Flanger (BASS_DX8_FLANGER). */
export interface FlangerParams {
    /** Ratio of wet to dry signal, in %. Range [0, 100]. Default 50. */
    wetDryMix?: number
    /** Percentage by which the delay time is modulated, in %. Range [0, 100]. Default 100. */
    depth?: number
    /** Percentage of output fed back into input. Range [-99, 99]. Default -50. */
    feedback?: number
    /** LFO frequency, in Hz. Range [0, 10]. Default 0.25. */
    frequency?: number
    /** LFO waveform. Default "sine". */
    waveform?: "triangle" | "sine"
    /** Delay time in ms. Range [0, 4]. Default 2. */
    delay?: number
    /** Degree by which left/right channels are out of phase, 0 (none) to 4 (180 deg). Default 2. */
    phase?: number
}

/** Parameters for DX8EffectType.Gargle (BASS_DX8_GARGLE). */
export interface GargleParams {
    /** Modulation rate in Hz. Range [1, 1000]. Default 20. */
    rateHz?: number
    /** LFO waveform. Default "triangle". */
    waveShape?: "triangle" | "square"
}

/** Parameters for DX8EffectType.I3DL2Reverb (BASS_DX8_I3DL2REVERB) - a detailed environmental reverb model. */
export interface I3DL2ReverbParams {
    /** Room effect level at low frequencies, in mB (100ths of a dB). Range [-10000, 0]. Default -1000. */
    room?: number
    /** Room effect high-frequency level, in mB. Range [-10000, 0]. Default -100. */
    roomHF?: number
    /** Room rolloff factor. Range [0, 10]. Default 0. */
    roomRolloffFactor?: number
    /** Reverberation decay time in seconds. Range [0.1, 20]. Default 1.49. */
    decayTime?: number
    /** High-frequency to low-frequency decay time ratio. Range [0.1, 2]. Default 0.83. */
    decayHFRatio?: number
    /** Early reflections level, in mB. Range [-10000, 1000]. Default -2602. */
    reflections?: number
    /** Delay before first reflection, in seconds. Range [0, 0.3]. Default 0.007. */
    reflectionsDelay?: number
    /** Late reverberation level, in mB. Range [-10000, 2000]. Default 200. */
    reverb?: number
    /** Delay for late reverberation, in seconds. Range [0, 0.1]. Default 0.011. */
    reverbDelay?: number
    /** Density of the late reverberation, in %. Range [0, 100]. Default 100. */
    diffusion?: number
    /** Density of the reverberation decay, in %. Range [0, 100]. Default 100. */
    density?: number
    /** Reference high frequency, in Hz. Range [20, 20000]. Default 5000. */
    hfReference?: number
}

/** Parameters for DX8EffectType.ParamEQ (BASS_DX8_PARAMEQ) - a single parametric EQ band. */
export interface ParamEQParams {
    /** Center frequency in Hz. Range [80, 16000]. Default 8000. */
    centerHz?: number
    /** Bandwidth in semitones. Range [1, 36]. Default 12. */
    bandwidthSemitones?: number
    /** Gain in dB. Range [-15, 15]. Default 0. */
    gainDb?: number
}

/** Parameters for DX8EffectType.Reverb (BASS_DX8_REVERB) - a simple algorithmic reverb. */
export interface ReverbParams {
    /** Input gain in dB. Range [-96, 0]. Default 0. */
    inGainDb?: number
    /** Reverb mix in dB. Range [-96, 0]. Default 0. */
    reverbMixDb?: number
    /** Reverb time in ms. Range [0.001, 3000]. Default 1000. */
    reverbTimeMs?: number
    /** Ratio of high-frequency to low-frequency reverb time. Range [0.001, 0.999]. Default 0.001. */
    highFreqRTRatio?: number
}

// =============================================================================
// BASS
// =============================================================================

export class BASS {

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    private static bass: any = null
    private static bassDllPath = __dirname + "\\bass.dll"

    private static BASS_Init: BassFn | null = null
    private static BASS_Free: BassFn | null = null
    private static BASS_ErrorGetCode: BassFn | null = null
    private static BASS_GetVersion: BassFn | null = null

    private static BASS_SampleLoad: BassFn | null = null
    private static BASS_SampleGetChannel: BassFn | null = null
    private static BASS_SampleFree: BassFn | null = null

    private static BASS_StreamCreateFile: BassFn | null = null
    private static BASS_StreamFree: BassFn | null = null

    private static BASS_ChannelPlay: BassFn | null = null
    private static BASS_ChannelStop: BassFn | null = null
    private static BASS_ChannelPause: BassFn | null = null
    private static BASS_ChannelFree: BassFn | null = null
    private static BASS_ChannelGetAttribute: BassFn | null = null
    private static BASS_ChannelSetAttribute: BassFn | null = null

    private static BASS_ChannelSetFX: BassFn | null = null
    private static BASS_ChannelRemoveFX: BassFn | null = null
    private static BASS_FXSetParameters: BassFn | null = null
    private static BASS_FXGetParameters: BassFn | null = null

    private static initialized = false

    /** Handles we've created, so shutdown() can clean up anything a caller forgot to free. */
    private static activeSampleHandles = new Set<number>()
    private static activeChannelHandles = new Set<number>()
    private static activeStreamHandles = new Set<number>()

    private constructor() {}

    // Lifecycle

    static init(frequency: number = 44100): void {

        if (BASS.initialized) {
            return
        }

        BASS.debugLog("[Audio] Loading bass.dll...")

        BASS.bass = DynamicLibrary.Load(BASS.bassDllPath)

        if (!BASS.bass) {
            throw new Error(`[Audio] bass.dll not found at "${BASS.bassDllPath}"`)
        }

        BASS.debugLog("[Audio] bass.dll loaded")

        const initProc = BASS.bass.getProcedure("BASS_Init")
        const freeProc = BASS.bass.getProcedure("BASS_Free")
        const errorProc = BASS.bass.getProcedure("BASS_ErrorGetCode")
        const getVersionProc = BASS.bass.getProcedure("BASS_GetVersion")

        const sampleLoadProc = BASS.bass.getProcedure("BASS_SampleLoad")
        const sampleGetChannelProc = BASS.bass.getProcedure("BASS_SampleGetChannel")
        const sampleFreeProc = BASS.bass.getProcedure("BASS_SampleFree")

        const streamCreateFileProc = BASS.bass.getProcedure("BASS_StreamCreateFile")
        const streamFreeProc = BASS.bass.getProcedure("BASS_StreamFree")

        const channelPlayProc = BASS.bass.getProcedure("BASS_ChannelPlay")
        const channelStopProc = BASS.bass.getProcedure("BASS_ChannelStop")
        const channelPauseProc = BASS.bass.getProcedure("BASS_ChannelPause")
        const channelFreeProc = BASS.bass.getProcedure("BASS_ChannelFree")
        const channelGetAttributeProc = BASS.bass.getProcedure("BASS_ChannelGetAttribute")
        const channelSetAttributeProc = BASS.bass.getProcedure("BASS_ChannelSetAttribute")

        const channelSetFXProc = BASS.bass.getProcedure("BASS_ChannelSetFX")
        const channelRemoveFXProc = BASS.bass.getProcedure("BASS_ChannelRemoveFX")
        const fxSetParamsProc = BASS.bass.getProcedure("BASS_FXSetParameters")
        const fxGetParamsProc = BASS.bass.getProcedure("BASS_FXGetParameters")

        if (
            !initProc ||
            !freeProc ||
            !errorProc ||
            !sampleLoadProc ||
            !sampleGetChannelProc ||
            !sampleFreeProc ||
            !streamCreateFileProc ||
            !streamFreeProc ||
            !channelPlayProc ||
            !channelStopProc ||
            !channelPauseProc ||
            !channelFreeProc ||
            !channelGetAttributeProc ||
            !channelSetAttributeProc ||
            !channelSetFXProc ||
            !channelRemoveFXProc ||
            !fxSetParamsProc ||
            !fxGetParamsProc
        ) {
            throw new Error("[Audio] Missing required BASS procedures")
        }

        BASS.BASS_Init = Memory.Fn.Stdcall(initProc)
        BASS.BASS_Free = Memory.Fn.Stdcall(freeProc)
        BASS.BASS_ErrorGetCode = Memory.Fn.Stdcall(errorProc)

        // Diagnostic only - not in the required-procs check above, since
        // audio playback doesn't depend on it.
        if (getVersionProc) {
            BASS.BASS_GetVersion = Memory.Fn.Stdcall(getVersionProc)
            const rawVersion = BASS.BASS_GetVersion()
            const major = (rawVersion >>> 24) & 0xff
            const minor = (rawVersion >>> 16) & 0xff
            const build = (rawVersion >>> 8) & 0xff
            const revision = rawVersion & 0xff
            BASS.debugLog(
                `[Audio] bass.dll version: ${major}.${minor}.${build}.${revision} ` +
                `loaded from "${BASS.bassDllPath}"`
            )
        }

        BASS.BASS_SampleLoad = Memory.Fn.Stdcall(sampleLoadProc)
        BASS.BASS_SampleGetChannel = Memory.Fn.Stdcall(sampleGetChannelProc)
        BASS.BASS_SampleFree = Memory.Fn.Stdcall(sampleFreeProc)

        BASS.BASS_StreamCreateFile = Memory.Fn.Stdcall(streamCreateFileProc)
        BASS.BASS_StreamFree = Memory.Fn.Stdcall(streamFreeProc)

        BASS.BASS_ChannelPlay = Memory.Fn.Stdcall(channelPlayProc)
        BASS.BASS_ChannelStop = Memory.Fn.Stdcall(channelStopProc)
        BASS.BASS_ChannelPause = Memory.Fn.Stdcall(channelPauseProc)
        BASS.BASS_ChannelFree = Memory.Fn.Stdcall(channelFreeProc)

        BASS.BASS_ChannelGetAttribute = Memory.Fn.Stdcall(channelGetAttributeProc)
        BASS.BASS_ChannelSetAttribute = Memory.Fn.Stdcall(channelSetAttributeProc)

        BASS.BASS_ChannelSetFX = Memory.Fn.Stdcall(channelSetFXProc)
        BASS.BASS_ChannelRemoveFX = Memory.Fn.Stdcall(channelRemoveFXProc)
        BASS.BASS_FXSetParameters = Memory.Fn.Stdcall(fxSetParamsProc)
        BASS.BASS_FXGetParameters = Memory.Fn.Stdcall(fxGetParamsProc)

        BASS.debugLog("[Audio] BASS procedures loaded")

        /*
         * device = -1
         * frequency = 44100
         * flags = 0
         * window = 0
         * clsid = 0
         */
        const result = BASS.BASS_Init(-1, frequency, 0, 0, 0)

        if (!result) {
            const curErrorCode = BASS.getErrorCode()
            if (curErrorCode != 14) {
                // Don't error if we have already initialized
                BASS.throwBassError("BASS_Init failed")
            }
        }

        BASS.initialized = true

        BASS.debugLog("[Audio] BASS initialized")
    }

    static shutdown(): void {

        if (!BASS.initialized) {
            return
        }

        BASS.debugLog("[Audio] Shutting down BASS")

        for (const channel of [...BASS.activeChannelHandles]) {
            try {
                BASS.BASS_ChannelFree!(channel)
            } catch {

            }
            BASS.activeChannelHandles.delete(channel)
        }

        for (const stream of [...BASS.activeStreamHandles]) {
            try {
                BASS.BASS_StreamFree!(stream)
            } catch {

            }
            BASS.activeStreamHandles.delete(stream)
        }

        for (const sample of [...BASS.activeSampleHandles]) {
            try {
                BASS.BASS_SampleFree!(sample)
            } catch {

            }
            BASS.activeSampleHandles.delete(sample)
        }

        if (!BASS.BASS_Free!()) {
            BASS.throwBassError("BASS_Free failed")
        }

        BASS.initialized = false
    }

    static isInitialized(): boolean {
        return BASS.initialized
    }

    static setLibraryPath(path: string): void {
        if (BASS.initialized) {
            throw new Error("[Audio] setLibraryPath() must be called before BASS is initialized")
        }
        BASS.bassDllPath = path
    }

    static loadSample(
        path: string,
        maxChannels: number = 16,
        loop: boolean = false,
    ): Sample {

        BASS.ensureInitialized()

        BASS.debugLog(`[Audio] Loading sample: ${path}`)

        const pathPtr = BASS.allocWString(path)

        const flags = (loop ? BASS_SAMPLE_LOOP : 0) | BASS_UNICODE

        const sampleHandle = BASS.BASS_SampleLoad!(
            BASS_FILE_NAME,
            pathPtr,
            0,
            0,
            0,
            maxChannels,
            flags,
        )

        Memory.Free(pathPtr)

        if (!sampleHandle) {
            const error = BASS.getErrorCode()
            throw new Error(
                `[Audio] Failed to load "${path}": ${BASS.errorName(error)} (${error})`
            )
        }

        BASS.debugLog(`[Audio] Sample loaded: ${sampleHandle}`)

        BASS.activeSampleHandles.add(sampleHandle)

        const sample: Sample = {
            handle: sampleHandle,
            maxChannels,
            loop,

            play(): Channel {
                return BASS.createChannel(sample)
            },

            free(): void {
                BASS.freeSample(sample)
            },
        }

        return sample
    }

    static freeSample(sample: Sample): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_SampleFree!(sample.handle)) {
            BASS.throwBassError("BASS_SampleFree failed")
        }

        BASS.activeSampleHandles.delete(sample.handle)
    }

    static play(sample: number): number {

        BASS.ensureInitialized()

        const channel = BASS.BASS_SampleGetChannel!(sample, 0)

        if (!channel) {
            BASS.throwBassError("BASS_SampleGetChannel failed")
        }

        if (!BASS.BASS_ChannelPlay!(channel, 1)) {
            BASS.BASS_ChannelFree!(channel)
            BASS.throwBassError("BASS_ChannelPlay failed")
        }

        BASS.activeChannelHandles.add(channel)

        return channel
    }

    static loadStream(path: string, loop: boolean = false): Stream {

        BASS.ensureInitialized()

        BASS.debugLog(`[Audio] Loading stream: ${path}`)

        const pathPtr = BASS.allocWString(path)

        const flags = (loop ? BASS_SAMPLE_LOOP : 0) | BASS_SAMPLE_FX | BASS_UNICODE

        const streamHandle = BASS.BASS_StreamCreateFile!(0, pathPtr, 0, 0, 0, 0, flags)

        Memory.Free(pathPtr)

        if (!streamHandle) {
            const error = BASS.getErrorCode()
            throw new Error(
                `[Audio] Failed to load stream "${path}": ${BASS.errorName(error)} (${error})`
            )
        }

        BASS.debugLog(`[Audio] Stream loaded: ${streamHandle}`)

        if (isDebugEnabled) {
            try {
                const vol = BASS.getVolume(streamHandle)
                BASS.debugLog(`[Audio] debugProbeVolume for stream=${streamHandle}: ${vol}`)
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err)
                BASS.debugLog(`[Audio] debugProbeVolume failed: ${message}`)
            }
        }

        BASS.activeStreamHandles.add(streamHandle)

        const stream: Stream = {
            handle: streamHandle,

            play(): void {
                BASS.replayChannel(stream.handle)
            },
            stop(): void {
                BASS.stop(stream.handle)
            },
            pause(): void {
                BASS.pause(stream.handle)
            },
            free(): void {
                BASS.freeStream(stream)
            },

            setVolume(volume: number): void {
                BASS.setVolume(stream.handle, volume)
            },
            setPan(pan: number): void {
                BASS.setPan(stream.handle, pan)
            },
            setFrequency(frequency: number): void {
                BASS.setFrequency(stream.handle, frequency)
            },
            setPitch(pitch: number): void {
                BASS.setPitch(stream.handle, pitch)
            },

            setChorus(params?: ChorusParams): number {
                return BASS.setChorus(stream.handle, params)
            },
            setCompressor(params?: CompressorParams): number {
                return BASS.setCompressor(stream.handle, params)
            },
            setDistortion(params?: DistortionParams): number {
                return BASS.setDistortion(stream.handle, params)
            },
            setEcho(params?: EchoParams): number {
                return BASS.setEcho(stream.handle, params)
            },
            setFlanger(params?: FlangerParams): number {
                return BASS.setFlanger(stream.handle, params)
            },
            setGargle(params?: GargleParams): number {
                return BASS.setGargle(stream.handle, params)
            },
            setI3DL2Reverb(params?: I3DL2ReverbParams): number {
                return BASS.setI3DL2Reverb(stream.handle, params)
            },
            setParamEQ(params?: ParamEQParams): number {
                return BASS.setParamEQ(stream.handle, params)
            },
            setReverb(params?: ReverbParams): number {
                return BASS.setReverb(stream.handle, params)
            },
            removeFx(fx: number): void {
                BASS.removeFx(stream.handle, fx)
            },
        }

        return stream
    }

    static freeStream(stream: Stream): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_StreamFree!(stream.handle)) {
            BASS.throwBassError("BASS_StreamFree failed")
        }

        BASS.activeStreamHandles.delete(stream.handle)
    }

    // Channels

    static replayChannel(channel: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelPlay!(channel, 1)) {
            BASS.throwBassError("BASS_ChannelPlay failed")
        }
    }

    static stop(channel: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelStop!(channel)) {
            BASS.throwBassError("BASS_ChannelStop failed")
        }
    }

    static pause(channel: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelPause!(channel)) {
            BASS.throwBassError("BASS_ChannelPause failed")
        }
    }

    static freeChannel(channel: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelFree!(channel)) {
            BASS.throwBassError("BASS_ChannelFree failed")
        }

        BASS.activeChannelHandles.delete(channel)
    }

    static setVolume(channel: number, volume: number): void {
        BASS.ensureInitialized()
        BASS.setChannelAttribute(
            channel, BASS_ATTRIB_VOL, Math.max(volume, 0), "BASS_ChannelSetAttribute(volume) failed",
        )
    }

    static getVolume(channel: number): number {
        BASS.ensureInitialized()
        return BASS.getChannelAttribute(channel, BASS_ATTRIB_VOL, "BASS_ChannelGetAttribute(VOL) failed")
    }

    /** Set a channel's panning, clamped to [-1, 1]. */
    static setPan(channel: number, pan: number): void {
        BASS.ensureInitialized()
        BASS.setChannelAttribute(
            channel, BASS_ATTRIB_PAN, BASS.clamp(pan, -1, 1), "BASS_ChannelSetAttribute(pan) failed",
        )
    }

    /** Get a channel's current panning. */
    static getPan(channel: number): number {
        BASS.ensureInitialized()
        return BASS.getChannelAttribute(channel, BASS_ATTRIB_PAN, "BASS_ChannelGetAttribute(PAN) failed")
    }

    /** Set a channel's playback frequency directly. */
    static setFrequency(channel: number, frequency: number): void {
        BASS.ensureInitialized()

        if (frequency <= 0) {
            throw new Error("[Audio] Channel frequency must be greater than 0")
        }

        BASS.setChannelAttribute(channel, BASS_ATTRIB_FREQ, frequency, "Failed to set channel frequency")
    }

    /** Get a channel's current playback frequency. */
    static getFrequency(channel: number): number {
        BASS.ensureInitialized()
        return BASS.getChannelAttribute(channel, BASS_ATTRIB_FREQ, "BASS_ChannelGetAttribute(FREQ) failed")
    }

    /** Set a channel's pitch as a multiplier of its original frequency (1.0 = normal). */
    static setPitch(channel: number, pitch: number): void {
        BASS.ensureInitialized()

        if (pitch <= 0) {
            throw new Error("[Audio] Pitch must be greater than 0")
        }

        const frequency = BASS.getFrequency(channel)
        BASS.setChannelAttribute(channel, BASS_ATTRIB_FREQ, frequency * pitch, "Failed to set channel pitch")
    }

    // DX8 effects - not working rn

    static setChorus(channel: number, params: ChorusParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Chorus)
        BASS.updateChorus(fx, params)
        return fx
    }

    static updateChorus(fx: number, params: ChorusParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.wetDryMix ?? 50 },
            { type: "float", value: params.depth ?? 10 },
            { type: "float", value: params.feedback ?? 25 },
            { type: "float", value: params.frequency ?? 1.1 },
            { type: "int", value: params.waveform === "triangle" ? 0 : 1 },
            { type: "float", value: params.delay ?? 16 },
            { type: "int", value: params.phase ?? 2 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set chorus parameters")
    }

    static setCompressor(channel: number, params: CompressorParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Compressor)
        BASS.updateCompressor(fx, params)
        return fx
    }

    static updateCompressor(fx: number, params: CompressorParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.gain ?? 0 },
            { type: "float", value: params.attack ?? 10 },
            { type: "float", value: params.release ?? 200 },
            { type: "float", value: params.threshold ?? -20 },
            { type: "float", value: params.ratio ?? 3 },
            { type: "float", value: params.predelay ?? 4 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set compressor parameters")
    }

    static setDistortion(channel: number, params: DistortionParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Distortion)
        BASS.updateDistortion(fx, params)
        return fx
    }

    static updateDistortion(fx: number, params: DistortionParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.gain ?? 0 },
            { type: "float", value: params.edge ?? 50 },
            { type: "float", value: params.postEqCenterFrequency ?? 2400 },
            { type: "float", value: params.postEqBandwidth ?? 2400 },
            { type: "float", value: params.preLowpassCutoff ?? 8000 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set distortion parameters")
    }

    static setEcho(channel: number, params: EchoParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Echo)
        BASS.updateEcho(fx, params)
        return fx
    }

    static updateEcho(fx: number, params: EchoParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.wetDryMix ?? 50 },
            { type: "float", value: params.feedback ?? 50 },
            { type: "float", value: params.leftDelay ?? 333 },
            { type: "float", value: params.rightDelay ?? 333 },
            { type: "int", value: params.panDelay ? 1 : 0 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set echo parameters")
    }

    static setFlanger(channel: number, params: FlangerParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Flanger)
        BASS.updateFlanger(fx, params)
        return fx
    }

    static updateFlanger(fx: number, params: FlangerParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.wetDryMix ?? 50 },
            { type: "float", value: params.depth ?? 100 },
            { type: "float", value: params.feedback ?? -50 },
            { type: "float", value: params.frequency ?? 0.25 },
            { type: "int", value: params.waveform === "triangle" ? 0 : 1 },
            { type: "float", value: params.delay ?? 2 },
            { type: "int", value: params.phase ?? 2 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set flanger parameters")
    }

    static setGargle(channel: number, params: GargleParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Gargle)
        BASS.updateGargle(fx, params)
        return fx
    }

    static updateGargle(fx: number, params: GargleParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "int", value: params.rateHz ?? 20 },
            { type: "int", value: params.waveShape === "square" ? 1 : 0 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set gargle parameters")
    }

    static setI3DL2Reverb(channel: number, params: I3DL2ReverbParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.I3DL2Reverb)
        BASS.updateI3DL2Reverb(fx, params)
        return fx
    }

    static updateI3DL2Reverb(fx: number, params: I3DL2ReverbParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "int", value: params.room ?? -1000 },
            { type: "int", value: params.roomHF ?? -100 },
            { type: "float", value: params.roomRolloffFactor ?? 0 },
            { type: "float", value: params.decayTime ?? 1.49 },
            { type: "float", value: params.decayHFRatio ?? 0.83 },
            { type: "int", value: params.reflections ?? -2602 },
            { type: "float", value: params.reflectionsDelay ?? 0.007 },
            { type: "int", value: params.reverb ?? 200 },
            { type: "float", value: params.reverbDelay ?? 0.011 },
            { type: "float", value: params.diffusion ?? 100 },
            { type: "float", value: params.density ?? 100 },
            { type: "float", value: params.hfReference ?? 5000 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set I3DL2 reverb parameters")
    }

    static setParamEQ(channel: number, params: ParamEQParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.ParamEQ)
        BASS.updateParamEQ(fx, params)
        return fx
    }

    static updateParamEQ(fx: number, params: ParamEQParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.centerHz ?? 8000 },
            { type: "float", value: params.bandwidthSemitones ?? 12 },
            { type: "float", value: params.gainDb ?? 0 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set parametric EQ parameters")
    }

    static setReverb(channel: number, params: ReverbParams = {}): number {
        const fx = BASS.addFx(channel, DX8EffectType.Reverb)
        BASS.updateReverb(fx, params)
        return fx
    }

    static updateReverb(fx: number, params: ReverbParams): void {
        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.inGainDb ?? 0 },
            { type: "float", value: params.reverbMixDb ?? 0 },
            { type: "float", value: params.reverbTimeMs ?? 1000 },
            { type: "float", value: params.highFreqRTRatio ?? 0.001 },
        ])
        BASS.applyFxParams(fx, ptr, "Failed to set reverb parameters")
    }

    static removeFx(channel: number, fx: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelRemoveFX!(channel, fx)) {
            BASS.throwBassError("BASS_ChannelRemoveFX failed")
        }
    }

    static getErrorCode(): number {
        if (!BASS.BASS_ErrorGetCode) {
            return -1
        }
        return BASS.BASS_ErrorGetCode()
    }

    // Private helpers

    private static createChannel(sample: Sample): Channel {

        BASS.ensureInitialized()

        const channelHandle = BASS.BASS_SampleGetChannel!(sample.handle, 0)

        if (!channelHandle) {
            BASS.throwBassError("BASS_SampleGetChannel failed")
        }

        BASS.activeChannelHandles.add(channelHandle)

        const channel: Channel = {
            handle: channelHandle,
            sample,

            play(): void {
                BASS.replayChannel(channel.handle)
            },
            stop(): void {
                BASS.stop(channel.handle)
            },
            pause(): void {
                BASS.pause(channel.handle)
            },
            free(): void {
                BASS.freeChannel(channel.handle)
            },

            setVolume(volume: number): void {
                BASS.setVolume(channel.handle, volume)
            },
            setPan(pan: number): void {
                BASS.setPan(channel.handle, pan)
            },
            setFrequency(frequency: number): void {
                BASS.setFrequency(channel.handle, frequency)
            },
            setPitch(pitch: number): void {
                BASS.setPitch(channel.handle, pitch)
            },
        }

        channel.play()

        return channel
    }

    private static addFx(channel: number, type: DX8EffectType): number {

        BASS.ensureInitialized()

        try {
            // Real-world examples consistently use priority 1, not 0 - cheap to match.
            const fx = BASS.BASS_ChannelSetFX!(channel, type, 1)

            if (!fx) {
                BASS.throwBassError("BASS_ChannelSetFX failed")
            }

            BASS.debugProbeFxDefaults(fx)

            return fx
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            BASS.debugLog(`[Audio] addFx(type=${type}) failed: ${message}`)
            throw err
        }
    }

    private static debugProbeFxDefaults(fx: number): void {
        if (!isDebugEnabled) {
            return
        }
        try {
            const fieldCount = 12
            const ptr = Memory.Allocate(fieldCount * 4)
            if (!ptr) {
                BASS.debugLog("[Audio] debugProbeFxDefaults: allocation failed")
                return
            }
            const ok = BASS.BASS_FXGetParameters!(fx, ptr)
            if (!ok) {
                const err = BASS.getErrorCode()
                BASS.debugLog(
                    `[Audio] debugProbeFxDefaults: BASS_FXGetParameters failed: ` +
                    `${BASS.errorName(err)} (${err})`
                )
                Memory.Free(ptr)
                return
            }
            const values: number[] = []
            for (let i = 0; i < fieldCount; i++) {
                values.push(Memory.ReadFloat(ptr + i * 4, false))
            }
            BASS.debugLog(`[Audio] debugProbeFxDefaults for fx=${fx}: [${values.join(", ")}]`)
            Memory.Free(ptr)
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            BASS.debugLog(`[Audio] debugProbeFxDefaults threw: ${message}`)
        }
    }

    private static applyFxParams(fx: number, ptr: number, errorMessage: string): void {
        try {
            if (!BASS.BASS_FXSetParameters!(fx, ptr)) {
                BASS.throwBassError(errorMessage)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            BASS.debugLog(`[Audio] applyFxParams failed: ${message}`)
            throw err
        } finally {
            Memory.Free(ptr)
        }
    }

    private static writeFxStruct(fields: { type: "float" | "int", value: number }[]): number {

        const ptr = Memory.Allocate(64)

        if (!ptr) {
            throw new Error("[Audio] Failed to allocate memory for FX parameters")
        }

        fields.forEach((field, i) => {
            const offset = ptr + i * 4
            if (field.type === "float") {
                Memory.WriteFloat(offset, field.value, false)
                // Verify the write actually landed where/what we expect.
                const readBack = Memory.ReadFloat(offset, false)
                if (Math.abs(readBack - field.value) > 0.001) {
                    BASS.debugLog(
                        `[Audio] writeFxStruct mismatch at field ${i} (float): ` +
                        `wrote ${field.value}, read back ${readBack}`
                    )
                }
            } else {
                BASS.writeInt32LE(offset, field.value)
            }
        })

        return ptr
    }

    private static writeInt32LE(offset: number, value: number): void {
        const u = value >>> 0  // coerce to unsigned 32-bit for correct byte extraction
        Memory.WriteU8(offset, u & 0xff, false)
        Memory.WriteU8(offset + 1, (u >>> 8) & 0xff, false)
        Memory.WriteU8(offset + 2, (u >>> 16) & 0xff, false)
        Memory.WriteU8(offset + 3, (u >>> 24) & 0xff, false)
    }

    private static setChannelAttribute(
        channel: number, attrib: number, value: number, errorMessage: string,
    ): void {
        if (!BASS.BASS_ChannelSetAttribute!(channel, attrib, Memory.FromFloat(value))) {
            BASS.throwBassError(errorMessage)
        }
    }

    private static getChannelAttribute(channel: number, attrib: number, errorMessage: string): number {

        const valuePtr = Memory.Allocate(4)

        if (!valuePtr) {
            throw new Error("[Audio] Failed to allocate memory for channel attribute")
        }

        const result = BASS.BASS_ChannelGetAttribute!(channel, attrib, valuePtr)

        if (!result) {
            Memory.Free(valuePtr)
            BASS.throwBassError(errorMessage)
        }

        const value = Memory.ReadFloat(valuePtr, false)

        Memory.Free(valuePtr)

        return value
    }

    private static clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max)
    }

    private static errorName(code: number): string {
        return BASS_ERRORS[code] ?? "UNKNOWN_ERROR"
    }

    private static throwBassError(message: string): never {
        const code = BASS.getErrorCode()
        throw new Error(`${message}: ${BASS.errorName(code)} (${code})`)
    }

    private static ensureInitialized(): void {
        if (!BASS.initialized) {
            BASS.init()
        }
    }

    private static debugLog(message: string): void {
        if (isDebugEnabled) {
            log(message)
        }
    }

    private static allocWString(str: string): number {

        const encoded = BASS.encodeUtf16(`${str}\0`)

        let buffer = Memory.Allocate(encoded.length)

        if (!buffer) {
            throw new Error(`[Audio] Failed to allocate ${encoded.length} bytes`)
        }

        if (buffer < 0) {
            buffer = buffer >>> 0
        }

        for (let i = 0; i < encoded.length; i++) {
            Memory.WriteU8(buffer + i, encoded[i], false)
        }

        return buffer
    }

    private static encodeUtf16(str: string): Uint8Array {
        const bytes: number[] = []
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i)
            bytes.push(code & 0xff, (code >>> 8) & 0xff)
        }
        return new Uint8Array(bytes)
    }
}
