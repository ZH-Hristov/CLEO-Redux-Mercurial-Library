export interface modSetting {
    type: modSettingType,
    value: any,
    default?: any,
    min?: number,
    max?: number,
    clamp?: boolean,
    isInt?: boolean
}

export interface modButton {
    niceName: string,
    description?: string
}

export interface buttonDict {
    [key: string]: modButton
}

export enum modSettingType {
    boolean,
    number
}

export interface rModData {
    name: string,
    settings: SettingList,
    buttons?: buttonDict
}

export interface registerHgModEvent {
    modData: rModData
}

export interface registerHgListenerEvent {
    modName: string
    newSettings: { [key: string]: number|boolean }
}

export interface OnHgMenuButtonClickEvent {
    modName: string
    btnId: string
}

export interface settingUpdateInterface {
    modName: string
    newSettings: { [key: string]: number|boolean }
}

export async function registerUpdateListener(modName: string, setList: SettingList) {
    addEventListener<registerHgListenerEvent>( "OnHgMenuSettingUpdate", (ev) => {
        const evData = ev.data as settingUpdateInterface
        if (modName != evData.modName) {return} 
        const setData = evData.newSettings
        for (const [k, v] of Object.entries(setData)) {
            setList.setValue(k, v)
        }
    } )
}

export async function sendSettingUpdate( modName: string, data: { [key: string]: any } ) {
    dispatchEvent<settingUpdateInterface>( "OnHgMenuSettingUpdate", {
        modName: modName,
        newSettings: data
    } )
}

export async function sendButtonClick( modName: string, btnId: string ) {
    dispatchEvent<OnHgMenuButtonClickEvent>("OnHgMenuButtonClick", {
        modName: modName,
        btnId: btnId
    })
}

export async function registerHgMod( modName: string, settings: SettingList, buttons?: buttonDict ) {
    const newModData: rModData = {
        name: modName,
        settings: settings.getRegisterTable() as SettingList,
        buttons: buttons
    }

    registerUpdateListener(modName, settings)

    await asyncWait(3000)
    dispatchEvent<registerHgModEvent>("registerHgMenuMod", {modData: newModData})
}

export class SettingList {
    settingInfo: { [key: string]: modSetting }
    settingValues: { [key: string]: modSetting|number|string }

    constructor( setDict: { [key: string]: modSetting } ) {
        this.settingInfo = {}
        this.settingValues = {}

        for (const [sn, ms] of Object.entries(setDict)) {
            this.settingInfo[sn] = {} as modSetting


            for (const [k, v] of Object.entries(ms)) {
                if (k == "value") {
                    this.settingValues[sn] = v
                    if (!this.settingInfo[sn].default) {
                        this.settingInfo[sn].default = v
                    }
                } else {
                    this.settingInfo[sn][k as keyof modSetting] = v
                }
            }
        }
    }

    getValue(k: string): any {
        return this.settingValues[k]
    }

    /**Sets a value in the list, clamps to min and max if defined. */
    setValue(k: string, v: any) {
        this.settingValues[k] = v
        if(this.settingInfo[k].clamp && this.settingInfo[k].min && this.settingInfo[k].max) {
            this.settingValues[k] = Math.ClampFloat(v, this.settingInfo[k].min as float, this.settingInfo[k].max as float)
        }
    }

    /**Reset a setting to its default value */
    resetValue(k: string) {
        this.settingValues[k] = this.settingInfo[k].default
    }

    /**Reset all settings to their default values */
    resetAll() {
        for (const [k, _] of Object.entries(this.settingValues)) {
            this.resetValue(k)
        }
    }

    getInfo(k: string) {
        return this.settingInfo[k]
    }

    /**Saves all current settings to mod.ini where mod is located. */
    saveToIni() {
        for (const [k, v] of Object.entries(this.settingInfo)) {
            switch (v.type) {
                case modSettingType.number:
                    if (v.isInt) {
                        IniFile.WriteInt(this.getValue(k), "./mod.ini", "CONFIG", k)
                    } else {
                        IniFile.WriteFloat(this.getValue(k), "./mod.ini", "CONFIG", k)
                    }
                    break
                case modSettingType.boolean:
                    IniFile.WriteInt( this.getValue(k) ? 1 : 0, "./mod.ini", "CONFIG", k )
                    break
            }
        }
    }

    loadFromIni(modName?: string) {
        for (const [k, v] of Object.entries(this.settingInfo)) {
            switch(v.type) {
                case modSettingType.number:
                    if (v.isInt) {
                        const retInt = IniFile.ReadInt("./mod.ini", "CONFIG", k)
                        if (retInt) {
                            this.setValue(k, retInt)
                            if(modName) {sendSettingUpdate(modName, {[k]: retInt})}
                        }
                    } else {
                        const retFloat = IniFile.ReadFloat("./mod.ini", "CONFIG", k)
                        if (retFloat) {
                            this.setValue(k, retFloat)
                            if(modName) {sendSettingUpdate(modName, {[k]: retFloat})}
                        }
                    }
                    break
                case modSettingType.boolean:
                    const retInt = IniFile.ReadInt("./mod.ini", "CONFIG", k)
                    if (typeof retInt != undefined) {
                        const booled = retInt == 1 ? true : false
                        this.setValue(k, booled)
                        if(modName) {sendSettingUpdate(modName, {[k]: booled})}
                    }
                    break
            }
        }
    }

    getRegisterTable() {
        const retTable: { [key: string]: any } = {}
        for (const [k, v] of Object.entries(this.settingInfo)) {
            retTable[k] = v
            if(!retTable[k].value) {
                retTable[k].value = this.settingValues[k]
            }
        }

        return retTable
    }
}