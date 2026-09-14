/**
 * CLEO Redux Audio Library
 * Uses BASS (bass.dll)
 *
 * Intended for GTA San Andreas / CLEO Redux x86.
 *
 * Usage:
 *   const sample = BASS.loadSample("horn.wav")
 *   const channel = sample.play()
 *   channel.setVolume(0.5)
 */

// =============================================================================
// Config
// =============================================================================

const isDebugEnabled = true

// =============================================================================
// BASS constants
// =============================================================================

const BASS_FILE_NAME = 0

const BASS_SAMPLE_LOOP = 0x4
const BASS_SAMPLE_OVER_VOL = 0x10000
const BASS_SAMPLE_OVER_POS = 0x20000
const BASS_SAMPLE_OVER_DIST = 0x30000

const BASS_ATTRIB_FREQ = 1
const BASS_ATTRIB_VOL = 2
const BASS_ATTRIB_PAN = 3

const BASS_UNICODE = 0x80000000

/**
 * BASS_FX effect types, for use with BASS_ChannelSetFX.
 *
 * These require bass_fx.dll (the BASS_FX add-on) to be present alongside
 * bass.dll - it registers these effect types with BASS_ChannelSetFX /
 * BASS_FXSetParameters, which are otherwise core bass.dll exports.
 */
export enum FxType {
    Chorus = 0x10010,
    Distortion = 0x10011,
    PeakEQ = 0x10004,
    /** BASS_FX_BFX_ECHO4 - the current (non-deprecated) echo effect. */
    Echo = 0x10015,
    /** BASS_FX_BFX_FREEVERB - the current (non-deprecated) reverb effect. */
    Reverb = 0x10016,
}

/** Apply an effect to every channel (BASS_BFX_CHANALL). */
const BASS_BFX_CHANALL = -1

const BASS_ERRORS: Record<number, string> = {
    [0]: "BASS_OK",
    [1]: "BASS_ERROR_MEM",
    [2]: "BASS_ERROR_FILEOPEN",
    [3]: "BASS_ERROR_DRIVER",
    [5]: "BASS_ERROR_HANDLE",
    [6]: "BASS_ERROR_FORMAT",
    [8]: "BASS_ERROR_INIT",
    [14]: "BASS_ERROR_ALREADY",
    [17]: "BASS_ERROR_NOTAUDIO",
    [18]: "BASS_ERROR_NOCHAN",
    [20]: "BASS_ERROR_ILLPARAM",
    [21]: "BASS_ERROR_NO3D",
    [23]: "BASS_ERROR_DEVICE",
    [24]: "BASS_ERROR_NOPLAY",
    [25]: "BASS_ERROR_FREQ",
    [31]: "BASS_ERROR_EMPTY",
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

// =============================================================================
// Types
// =============================================================================

/** Signature shared by every stdcall BASS export we bind. */
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

    /** Attach an effect (requires bass_fx.dll). Returns an FX handle for removeFx() or updateX(). */
    setEcho(params?: EchoParams): number
    setReverb(params?: ReverbParams): number
    setChorus(params?: ChorusParams): number
    setDistortion(params?: DistortionParams): number
    setPeakEq(params: PeakEqParams): number
    removeFx(fx: number): void
}

/** Parameters for FxType.Echo (BASS_BFX_ECHO4). Unset fields use the defaults below. */
export interface EchoParams {
    /** Dry (unaffected) signal mix. Range [-2, 2]. Default 1. */
    dryMix?: number
    /** Wet (affected) signal mix. Range [-2, 2]. Default 0.5. */
    wetMix?: number
    /** How much delayed output feeds back into the input. Range [-1, 1]. Default 0.5. */
    feedback?: number
    /** Delay time in seconds. Must be > 0. Default 0.2. */
    delaySeconds?: number
    /** Echo adjoining channels into each other (needs an even channel count). Default false. */
    stereo?: boolean
}

/** Parameters for FxType.Reverb (BASS_BFX_FREEVERB). Unset fields use the defaults below. */
export interface ReverbParams {
    /** Dry (unaffected) signal mix. Range [-2, 2]. Default 1. */
    dryMix?: number
    /** Wet (affected) signal mix. Range [-2, 2]. Default 0.3. */
    wetMix?: number
    /** Room size, roughly how long the tail is. Range [0, 1]. Default 0.5. */
    roomSize?: number
    /** High-frequency damping of the tail. Range [0, 1]. Default 0.5. */
    damp?: number
    /** Stereo width of the reverb. Range [0, 1]. Default 1. */
    width?: number
    /** Freeze mode (infinite sustain) when true. Default false. */
    freeze?: boolean
}

/** Parameters for FxType.Chorus (BASS_BFX_CHORUS). Unset fields use the defaults below. */
export interface ChorusParams {
    /** Dry (unaffected) signal mix. Range [-2, 2]. Default 1. */
    dryMix?: number
    /** Wet (affected) signal mix. Range [-2, 2]. Default 0.7. */
    wetMix?: number
    /** Feedback into the input. Range [-1, 1]. Default 0. */
    feedback?: number
    /** Minimum sweep delay in ms. Must be > 0, up to 6000. Default 30. */
    minSweepMs?: number
    /** Maximum sweep delay in ms. Up to 6000. Default 50. */
    maxSweepMs?: number
    /** Sweep rate in ms/sec. Must be > 0, up to 1000. Default 1.1. */
    rateMsPerSec?: number
}

/**
 * Parameters for FxType.Distortion (BASS_BFX_DISTORTION).
 * See the BASS_FX docs for this effect's exact parameter ranges.
 */
export interface DistortionParams {
    drive?: number
    dryMix?: number
    wetMix?: number
    feedback?: number
    volume?: number
}

/**
 * Parameters for FxType.PeakEQ (BASS_BFX_PEAKEQ) - a single parametric EQ band.
 * To EQ multiple bands, create multiple PeakEQ instances on the same channel.
 * See the BASS_FX docs for this effect's exact parameter ranges.
 */
export interface PeakEqParams {
    /** Band index - use a different index for each simultaneous band on a channel. */
    band: number
    bandwidth: number
    q: number
    /** Center frequency in Hz. */
    centerHz: number
    /** Gain in dB. Positive boosts, negative cuts. */
    gainDb: number
}

// =============================================================================
// BASS
// =============================================================================

export class BASS {

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    private static bass: any = null

    private static BASS_Init: BassFn | null = null
    private static BASS_Free: BassFn | null = null
    private static BASS_ErrorGetCode: BassFn | null = null

    private static BASS_SampleLoad: BassFn | null = null
    private static BASS_SampleGetChannel: BassFn | null = null
    private static BASS_SampleFree: BassFn | null = null

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

    /** bass_fx.dll itself - just needs to be loaded into the process, no init call. */
    private static bassFx: any = null
    private static fxInitialized = false

    private static initialized = false

    /** Handles we've created, so shutdown() can clean up anything a caller forgot to free. */
    private static activeSampleHandles = new Set<number>()
    private static activeChannelHandles = new Set<number>()

    private constructor() {
        // Static-only class - not meant to be instantiated.
    }

    // -------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------

    /**
     * Initialize BASS.
     *
     * Safe to call more than once - subsequent calls are no-ops. You don't
     * need to call this yourself for default settings: every method below
     * calls it lazily on first use. Call it explicitly only if you need a
     * non-default output frequency.
     */
    static init(frequency: number = 44100): void {

        if (BASS.initialized) {
            return
        }

        BASS.debugLog("[Audio] Loading bass.dll...")

        BASS.bass = DynamicLibrary.Load("bass.dll")

        if (!BASS.bass) {
            throw new Error("[Audio] bass.dll not found")
        }

        BASS.debugLog("[Audio] bass.dll loaded")

        const initProc = BASS.bass.getProcedure("BASS_Init")
        const freeProc = BASS.bass.getProcedure("BASS_Free")
        const errorProc = BASS.bass.getProcedure("BASS_ErrorGetCode")

        const sampleLoadProc = BASS.bass.getProcedure("BASS_SampleLoad")
        const sampleGetChannelProc = BASS.bass.getProcedure("BASS_SampleGetChannel")
        const sampleFreeProc = BASS.bass.getProcedure("BASS_SampleFree")

        const channelPlayProc = BASS.bass.getProcedure("BASS_ChannelPlay")
        const channelStopProc = BASS.bass.getProcedure("BASS_ChannelStop")
        const channelPauseProc = BASS.bass.getProcedure("BASS_ChannelPause")
        const channelFreeProc = BASS.bass.getProcedure("BASS_ChannelFree")
        const channelGetAttributeProc = BASS.bass.getProcedure("BASS_ChannelGetAttribute")
        const channelSetAttributeProc = BASS.bass.getProcedure("BASS_ChannelSetAttribute")

        if (
            !initProc ||
            !freeProc ||
            !errorProc ||
            !sampleLoadProc ||
            !sampleGetChannelProc ||
            !sampleFreeProc ||
            !channelPlayProc ||
            !channelStopProc ||
            !channelPauseProc ||
            !channelFreeProc ||
            !channelGetAttributeProc ||
            !channelSetAttributeProc
        ) {
            throw new Error("[Audio] Missing required BASS procedures")
        }

        BASS.BASS_Init = Memory.Fn.Stdcall(initProc)
        BASS.BASS_Free = Memory.Fn.Stdcall(freeProc)
        BASS.BASS_ErrorGetCode = Memory.Fn.Stdcall(errorProc)

        BASS.BASS_SampleLoad = Memory.Fn.Stdcall(sampleLoadProc)
        BASS.BASS_SampleGetChannel = Memory.Fn.Stdcall(sampleGetChannelProc)
        BASS.BASS_SampleFree = Memory.Fn.Stdcall(sampleFreeProc)

        BASS.BASS_ChannelPlay = Memory.Fn.Stdcall(channelPlayProc)
        BASS.BASS_ChannelStop = Memory.Fn.Stdcall(channelStopProc)
        BASS.BASS_ChannelPause = Memory.Fn.Stdcall(channelPauseProc)
        BASS.BASS_ChannelFree = Memory.Fn.Stdcall(channelFreeProc)

        BASS.BASS_ChannelGetAttribute = Memory.Fn.Stdcall(channelGetAttributeProc)
        BASS.BASS_ChannelSetAttribute = Memory.Fn.Stdcall(channelSetAttributeProc)

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

    /**
     * Shut BASS down, freeing any samples/channels this class created that
     * weren't explicitly freed first.
     */
    static shutdown(): void {

        if (!BASS.initialized) {
            return
        }

        BASS.debugLog("[Audio] Shutting down BASS")

        for (const channel of [...BASS.activeChannelHandles]) {
            try {
                BASS.BASS_ChannelFree!(channel)
            } catch {
                // best-effort cleanup
            }
            BASS.activeChannelHandles.delete(channel)
        }

        for (const sample of [...BASS.activeSampleHandles]) {
            try {
                BASS.BASS_SampleFree!(sample)
            } catch {
                // best-effort cleanup
            }
            BASS.activeSampleHandles.delete(sample)
        }

        if (!BASS.BASS_Free!()) {
            BASS.throwBassError("BASS_Free failed")
        }

        BASS.initialized = false
    }

    /** Whether BASS has been initialized yet. */
    static isInitialized(): boolean {
        return BASS.initialized
    }

    /** Whether BASS_FX (bass_fx.dll) has been loaded yet. */
    static isFxInitialized(): boolean {
        return BASS.fxInitialized
    }

    // -------------------------------------------------------------------
    // Samples
    // -------------------------------------------------------------------

    /**
     * Load a sound effect.
     *
     * maxChannels controls how many simultaneous instances
     * of this sound can play.
     */
    static loadSample(
        path: string,
        maxChannels: number = 16,
        loop: boolean = false,
    ): Sample {

        BASS.ensureInitialized()

        BASS.debugLog(`[Audio] Loading sample: ${path}`)

        const pathPtr = BASS.allocWString(path)

        let flags = BASS_SAMPLE_OVER_POS

        if (loop) {
            flags |= BASS_SAMPLE_LOOP
        }

        const sampleHandle = BASS.BASS_SampleLoad!(
            BASS_FILE_NAME,
            pathPtr,
            0,
            0,
            0,
            maxChannels,
            flags | BASS_UNICODE,
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

    /**
     * Free a loaded sample.
     */
    static freeSample(sample: Sample): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_SampleFree!(sample.handle)) {
            BASS.throwBassError("BASS_SampleFree failed")
        }

        BASS.activeSampleHandles.delete(sample.handle)
    }

    /**
     * Quick-play a sample by handle, obtaining a fresh playback channel.
     *
     * Every call gets its own channel, so multiple calls can overlap. Prefer
     * Sample.play() if you already have a Sample object - it's the same
     * operation but returns a Channel wrapper instead of a raw handle.
     */
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

    // -------------------------------------------------------------------
    // Channels
    // -------------------------------------------------------------------

    /** Restart an existing channel from the beginning. */
    static replayChannel(channel: number): void {
        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelPlay!(channel, 1)) {
            BASS.throwBassError("BASS_ChannelPlay failed")
        }
    }

    /**
     * Stop a currently playing channel.
     */
    static stop(channel: number): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelStop!(channel)) {
            BASS.throwBassError("BASS_ChannelStop failed")
        }
    }

    /**
     * Pause a channel.
     */
    static pause(channel: number): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelPause!(channel)) {
            BASS.throwBassError("BASS_ChannelPause failed")
        }
    }

    /**
     * Free a playback channel.
     */
    static freeChannel(channel: number): void {

        BASS.ensureInitialized()

        if (!BASS.BASS_ChannelFree!(channel)) {
            BASS.throwBassError("BASS_ChannelFree failed")
        }

        BASS.activeChannelHandles.delete(channel)
    }

    /** Set a channel's volume (clamped to >= 0). */
    static setVolume(channel: number, volume: number): void {
        BASS.ensureInitialized()
        BASS.setChannelAttribute(
            channel,
            BASS_ATTRIB_VOL,
            Math.max(volume, 0),
            "BASS_ChannelSetAttribute(volume) failed",
        )
    }

    /** Get a channel's current volume. */
    static getVolume(channel: number): number {
        BASS.ensureInitialized()
        return BASS.getChannelAttribute(channel, BASS_ATTRIB_VOL, "BASS_ChannelGetAttribute(VOL) failed")
    }

    /** Set a channel's panning, clamped to [-1, 1]. */
    static setPan(channel: number, pan: number): void {
        BASS.ensureInitialized()
        BASS.setChannelAttribute(
            channel,
            BASS_ATTRIB_PAN,
            BASS.clamp(pan, -1, 1),
            "BASS_ChannelSetAttribute(pan) failed",
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

    // -------------------------------------------------------------------
    // FX (BASS_FX effects - requires bass_fx.dll)
    // -------------------------------------------------------------------

    /** Attach an echo effect to a channel and return its FX handle. */
    static setEcho(channel: number, params: EchoParams = {}): number {
        const fx = BASS.addFx(channel, FxType.Echo)
        BASS.updateEcho(fx, params)
        return fx
    }

    /** Update an existing echo effect's parameters (only the fields you pass are changed). */
    static updateEcho(fx: number, params: EchoParams): void {
        BASS.ensureFxInitialized()

        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.dryMix ?? 1 },
            { type: "float", value: params.wetMix ?? 0.5 },
            { type: "float", value: params.feedback ?? 0.5 },
            { type: "float", value: params.delaySeconds ?? 0.2 },
            { type: "int", value: params.stereo ? 1 : 0 },
            { type: "int", value: BASS_BFX_CHANALL },
        ])

        BASS.applyFxParams(fx, ptr, "Failed to set echo parameters")
    }

    /** Attach a reverb effect to a channel and return its FX handle. */
    static setReverb(channel: number, params: ReverbParams = {}): number {
        const fx = BASS.addFx(channel, FxType.Reverb)
        BASS.updateReverb(fx, params)
        return fx
    }

    /** Update an existing reverb effect's parameters (only the fields you pass are changed). */
    static updateReverb(fx: number, params: ReverbParams): void {
        BASS.ensureFxInitialized()

        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.dryMix ?? 1 },
            { type: "float", value: params.wetMix ?? 0.3 },
            { type: "float", value: params.roomSize ?? 0.5 },
            { type: "float", value: params.damp ?? 0.5 },
            { type: "float", value: params.width ?? 1 },
            { type: "int", value: params.freeze ? 1 : 0 },
            { type: "int", value: BASS_BFX_CHANALL },
        ])

        BASS.applyFxParams(fx, ptr, "Failed to set reverb parameters")
    }

    /** Attach a chorus effect to a channel and return its FX handle. */
    static setChorus(channel: number, params: ChorusParams = {}): number {
        const fx = BASS.addFx(channel, FxType.Chorus)
        BASS.updateChorus(fx, params)
        return fx
    }

    /** Update an existing chorus effect's parameters (only the fields you pass are changed). */
    static updateChorus(fx: number, params: ChorusParams): void {
        BASS.ensureFxInitialized()

        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.dryMix ?? 1 },
            { type: "float", value: params.wetMix ?? 0.7 },
            { type: "float", value: params.feedback ?? 0 },
            { type: "float", value: params.minSweepMs ?? 30 },
            { type: "float", value: params.maxSweepMs ?? 50 },
            { type: "float", value: params.rateMsPerSec ?? 1.1 },
            { type: "int", value: BASS_BFX_CHANALL },
        ])

        BASS.applyFxParams(fx, ptr, "Failed to set chorus parameters")
    }

    /** Attach a distortion effect to a channel and return its FX handle. */
    static setDistortion(channel: number, params: DistortionParams = {}): number {
        const fx = BASS.addFx(channel, FxType.Distortion)
        BASS.updateDistortion(fx, params)
        return fx
    }

    /** Update an existing distortion effect's parameters (only the fields you pass are changed). */
    static updateDistortion(fx: number, params: DistortionParams): void {
        BASS.ensureFxInitialized()

        const ptr = BASS.writeFxStruct([
            { type: "float", value: params.drive ?? 0.5 },
            { type: "float", value: params.dryMix ?? 1 },
            { type: "float", value: params.wetMix ?? 0.5 },
            { type: "float", value: params.feedback ?? 0 },
            { type: "float", value: params.volume ?? 1 },
            { type: "int", value: BASS_BFX_CHANALL },
        ])

        BASS.applyFxParams(fx, ptr, "Failed to set distortion parameters")
    }

    /**
     * Attach one parametric EQ band to a channel and return its FX handle.
     * Call this again with a different `band` index to add more bands.
     */
    static setPeakEq(channel: number, params: PeakEqParams): number {
        const fx = BASS.addFx(channel, FxType.PeakEQ)
        BASS.updatePeakEq(fx, params)
        return fx
    }

    /** Update an existing EQ band's parameters. */
    static updatePeakEq(fx: number, params: PeakEqParams): void {
        BASS.ensureFxInitialized()

        const ptr = BASS.writeFxStruct([
            { type: "int", value: params.band },
            { type: "float", value: params.bandwidth },
            { type: "float", value: params.q },
            { type: "float", value: params.centerHz },
            { type: "float", value: params.gainDb },
            { type: "int", value: BASS_BFX_CHANALL },
        ])

        BASS.applyFxParams(fx, ptr, "Failed to set peak EQ parameters")
    }

    /**
     * Remove a previously attached effect from a channel. Not required before
     * freeing the channel itself - BASS drops attached effects automatically
     * when the channel is freed.
     */
    static removeFx(channel: number, fx: number): void {
        BASS.ensureFxInitialized()

        if (!BASS.BASS_ChannelRemoveFX!(channel, fx)) {
            BASS.throwBassError("BASS_ChannelRemoveFX failed")
        }
    }

    /**
     * Get the most recent BASS error code.
     */
    static getErrorCode(): number {

        if (!BASS.BASS_ErrorGetCode) {
            return -1
        }

        return BASS.BASS_ErrorGetCode()
    }

    // -------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------

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

            setEcho(params?: EchoParams): number {
                return BASS.setEcho(channel.handle, params)
            },
            setReverb(params?: ReverbParams): number {
                return BASS.setReverb(channel.handle, params)
            },
            setChorus(params?: ChorusParams): number {
                return BASS.setChorus(channel.handle, params)
            },
            setDistortion(params?: DistortionParams): number {
                return BASS.setDistortion(channel.handle, params)
            },
            setPeakEq(params: PeakEqParams): number {
                return BASS.setPeakEq(channel.handle, params)
            },
            removeFx(fx: number): void {
                BASS.removeFx(channel.handle, fx)
            },
        }

        /*
         * BASS_SampleGetChannel creates a new channel in the
         * paused state.
         */
        channel.play()

        return channel
    }

    /**
     * Lazily load bass_fx.dll and bind the FX procedures. Only called by
     * methods that actually use effects, so nothing here is required if you
     * never touch the FX API - and it doesn't run until you do.
     */
    private static ensureFxInitialized(): void {

        BASS.ensureInitialized()

        if (BASS.fxInitialized) {
            return
        }

        BASS.debugLog("[Audio] Loading bass_fx.dll...")

        BASS.bassFx = DynamicLibrary.Load("bass_fx.dll")

        if (!BASS.bassFx) {
            throw new Error("[Audio] bass_fx.dll not found")
        }

        // BASS_ChannelSetFX / BASS_FXSetParameters / BASS_FXGetParameters /
        // BASS_ChannelRemoveFX are core bass.dll exports - bass_fx.dll just
        // needs to be loaded into the process for its effect types to work
        // through them.
        const setFxProc = BASS.bass.getProcedure("BASS_ChannelSetFX")
        const removeFxProc = BASS.bass.getProcedure("BASS_ChannelRemoveFX")
        const setParamsProc = BASS.bass.getProcedure("BASS_FXSetParameters")
        const getParamsProc = BASS.bass.getProcedure("BASS_FXGetParameters")

        if (!setFxProc || !removeFxProc || !setParamsProc || !getParamsProc) {
            throw new Error("[Audio] Missing required BASS FX procedures")
        }

        BASS.BASS_ChannelSetFX = Memory.Fn.Stdcall(setFxProc)
        BASS.BASS_ChannelRemoveFX = Memory.Fn.Stdcall(removeFxProc)
        BASS.BASS_FXSetParameters = Memory.Fn.Stdcall(setParamsProc)
        BASS.BASS_FXGetParameters = Memory.Fn.Stdcall(getParamsProc)

        BASS.fxInitialized = true

        BASS.debugLog("[Audio] BASS_FX initialized")
    }

    /** Attach a new, unconfigured effect instance to a channel. */
    private static addFx(channel: number, type: FxType): number {

        BASS.ensureFxInitialized()

        const fx = BASS.BASS_ChannelSetFX!(channel, type, 0)

        if (!fx) {
            BASS.throwBassError("BASS_ChannelSetFX failed")
        }

        return fx
    }

    /** Write a param struct to memory, hand it to BASS_FXSetParameters, then free it. */
    private static applyFxParams(fx: number, ptr: number, errorMessage: string): void {
        try {
            if (!BASS.BASS_FXSetParameters!(fx, ptr)) {
                BASS.throwBassError(errorMessage)
            }
        } finally {
            Memory.Free(ptr)
        }
    }

    /**
     * Allocate and fill a native struct for an FX parameter block. Every
     * BASS_BFX_* struct used here is a flat sequence of 4-byte fields
     * (float or int32), so a field list fully describes the layout.
     *
     * NOTE: this assumes your CLEO Redux Memory API exposes WriteFloat and
     * WriteI32. The rest of this file only demonstrated WriteU8/ReadFloat -
     * if your Memory namespace names these differently, update this one
     * function to match.
     */
    private static writeFxStruct(fields: { type: "float" | "int", value: number }[]): number {

        const ptr = Memory.Allocate(fields.length * 4)

        if (!ptr) {
            throw new Error("[Audio] Failed to allocate memory for FX parameters")
        }

        fields.forEach((field, i) => {
            const offset = ptr + i * 4
            if (field.type === "float") {
                Memory.WriteFloat(offset, field.value, false)
            } else {
                Memory.WriteI32(offset, field.value, false)
            }
        })

        return ptr
    }

    private static setChannelAttribute(
        channel: number,
        attrib: number,
        value: number,
        errorMessage: string,
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

    /**
     * Convert a BASS error code to a readable string.
     */
    private static errorName(code: number): string {
        return BASS_ERRORS[code] ?? "UNKNOWN_ERROR"
    }

    /**
     * Throw an error containing the current BASS error.
     */
    private static throwBassError(message: string): never {
        const code = BASS.getErrorCode()
        throw new Error(`${message}: ${BASS.errorName(code)} (${code})`)
    }

    /**
     * Make sure BASS has been initialized, lazily initializing with default
     * settings if init() hasn't been called explicitly yet.
     */
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

    /**
     * Allocate a UTF-16 null-terminated string.
     *
     * BASS_UNICODE tells BASS that the filename pointer is UTF-16.
     */
    private static allocWString(str: string): number {

        const encoded = BASS.encodeUtf16(`${str}\0`)

        let buffer = Memory.Allocate(encoded.length)

        if (!buffer) {
            throw new Error(`[Audio] Failed to allocate ${encoded.length} bytes`)
        }

        // Some allocators can hand back an address that reads as negative in
        // JS; treat it as an unsigned 32-bit pointer.
        if (buffer < 0) {
            buffer = buffer >>> 0
        }

        for (let i = 0; i < encoded.length; i++) {
            Memory.WriteU8(buffer + i, encoded[i], false)
        }

        return buffer
    }

    /**
     * Encode a JS string as UTF-16LE.
     */
    private static encodeUtf16(str: string): Uint8Array {

        const bytes: number[] = []

        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i)
            bytes.push(code & 0xff, (code >>> 8) & 0xff)
        }

        return new Uint8Array(bytes)
    }
}