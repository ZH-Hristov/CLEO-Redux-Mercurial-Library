import { ImGuiCol, ImGuiCond, KeyCode } from "../.config/sa.enums.mts";
import { OnKeyPressed } from "./libs/controlUtils.mts";
import { modSettingType, SettingList, registerHgModEvent, rModData, sendSettingUpdate, sendButtonClick } from "./merc_interface.mts";

let menuOpen = false
const registeredMods: Record<string, rModData> = {}

async function initHgMenu() {
    menuOpen = true

    while (menuOpen) {
        ImGui.BeginFrame("8eHgMenu")
        ImGui.SetCursorVisible(menuOpen)
        ImGui.SetNextWindowSize(500, 600, ImGuiCond.Once)
        ImGui.Begin("Hydrargyrum Menu", menuOpen, false, false, false, false)

        const modKeys = Object.keys(registeredMods)
        const modCount = modKeys.length
        ImGui.Text(`There are ${modCount} mods registered to HgMenu`)

        let tab = ImGui.Tabs("RegMods", modKeys.join(","))
        const selectedModKey = modKeys[tab]

        if (modCount > 0 && selectedModKey) {
            ImGui.PushStyleColor( ImGuiCol.Text, 0, 255, 100, 255 )
            ImGui.TextWrapped("You can click on a slider and press TAB to input values with the keyboard.")
            ImGui.PopStyleColor(1)
            drawHgMod(selectedModKey)
        }

        ImGui.End()
        ImGui.EndFrame()
        await asyncWait(0)
    }
}

// The checkboxes always get clicked twice for me for some reason so I do this.
let clickCD = false
async function clickDCD() {
    if (clickCD) {return}
    clickCD = true
    await asyncWait(100)
    clickCD = false
}

async function drawHgMod(modName: string) {
    const mod: rModData = registeredMods[modName]
    ImGui.Spacing()
    for (const [setName, setData] of Object.entries(mod.settings.settingInfo)) {
        switch (setData.type) {
            case modSettingType.boolean:
                const curVal = mod.settings.getValue(setName)
                const opVal = !curVal
                ImGui.Checkbox(setName, curVal)
                if (ImGui.IsItemClicked(mod.name + "_" + setName) && !clickCD) {
                    mod.settings.setValue(setName, opVal)
                    sendSettingUpdate( mod.name, {[setName]: opVal} )
                    clickDCD()
                }
                break
            case modSettingType.number:
                ImGui.PushItemWidth(100)
                let newVal
                if(setData.isInt) {
                    newVal = ImGui.SliderInt(setName, mod.settings.getValue(setName), setData.min || 0, setData.max || 1)
                } else {
                    newVal = ImGui.SliderFloat(setName, mod.settings.getValue(setName), setData.min || 0, setData.max || 1)
                }
                
                ImGui.PopItemWidth()
                if (ImGui.IsItemFocused(mod.name + "_" + setName)) {
                    if (newVal != mod.settings.getValue(setName)) {
                        mod.settings.setValue(setName, newVal)
                        sendSettingUpdate( mod.name, {[setName]: newVal} )
                    }
                }
                break
        }
    }

    if (ImGui.Button("Reset to default settings", 300, 50)) {
        mod.settings.resetAll()
        for (const [k, v] of Object.entries(mod.settings.settingInfo)) {
            sendSettingUpdate( mod.name, {[k]: mod.settings.getValue(k)} )
            switch (v.type) {
                case modSettingType.number:
                    if (v.isInt) {
                        ImGui.SetItemValueInt(k, mod.settings.getValue(k))
                    } else {
                        ImGui.SetItemValueFloat(k, mod.settings.getValue(k))
                    }
            }
        }
    }

    if (ImGui.IsItemHovered("Merc_SettingReset")) {
        ImGui.SetTooltip("Reset all settings to their defaults.")
    }

    if (mod.buttons) {
        for (const [btnName, btnData] of Object.entries(mod.buttons)) {
            if (ImGui.Button(btnData.niceName, 300, 50)) {
                sendButtonClick(mod.name, btnName)
            }
            if (btnData.description && ImGui.IsItemHovered(btnData.niceName)) {
                ImGui.SetTooltip(btnData.description)
            }
        }
    }
}

async function rMod(modData: rModData) {
    registeredMods[modData.name] = {name: modData.name, settings: new SettingList(modData.settings as any), buttons: modData.buttons}
    ImGui.SetMessage("Registered HgMenu mod with name "+modData.name)
}

addEventListener<registerHgModEvent>("registerHgMenuMod", (event) => {
    if (event.data) {
        rMod(event.data.modData)
    }
})

addEventListener<OnKeyPressed>("KeyPressed", (ev) => {
    if (ev.data) {
        if(ev.data.keyCode == KeyCode.Oem3) {
            if (menuOpen) {
                menuOpen = false
            } else {
                initHgMenu()
            }
        }
    }
})