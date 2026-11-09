const PREFIX = 'GATHER-CHEAT-MENU_';
const MENU_POS = PREFIX + 'memu_pos';
const MENU_IS_OPENED =  PREFIX + 'menu_is_opened';
const CUSTOM_TELEPORT_POS = PREFIX + 'custom_teleport_pos';
const OOB_IS_ENABLED = PREFIX + 'oob_is_enabled';
const SPEED_MODIFIER = PREFIX + 'speed_modifier';
const AUTO_WARP_ENABLED = PREFIX + 'auto_warp_enabled';
const EMOTE_TEXT = PREFIX + 'emote_text';

export const getMenuPos = (): {x: number, y: number} => {
    const value = localStorage.getItem(MENU_POS);
    if (!value) {
        return {x: 0, y: 0};
    }
    return JSON.parse(value);
};

export const setMenuPos = (value: {x: number, y: number}) => {
    localStorage.setItem(MENU_POS, JSON.stringify(value));
};

export const getMenuIsOpened = (): boolean => {
    return localStorage.getItem(MENU_IS_OPENED) === '1';
}

export const setMenuIsOpened = (value: boolean) => {
    localStorage.setItem(MENU_IS_OPENED, value ? '1' : '0');
};

type CustomTeleportPos = {label: string, mapId: string, x: number, y: number};

export const getCustomTeleportPos = (spaceId: string): CustomTeleportPos[] => {
    const value = localStorage.getItem(CUSTOM_TELEPORT_POS + '_' + spaceId);
    if (!value) {
        return [];
    }
    return JSON.parse(value);
};

export const setCustomTeleportPos = (spaceId: string, value: CustomTeleportPos) => {
    const current = getCustomTeleportPos(spaceId);
    current.push(value);
    localStorage.setItem(CUSTOM_TELEPORT_POS + '_' + spaceId, JSON.stringify(current));
};

export const getOoBIsEnabled = (): boolean => {
    return localStorage.getItem(OOB_IS_ENABLED) === '1';
}

export const setOoBIsEnabled = (value: boolean) => {
    localStorage.setItem(OOB_IS_ENABLED, value ? '1' : '0');
};

const SPEED_CHOICES = [1, 2, 3, 4];

export const getSavedSpeed = (): number => {
    const value = Number(localStorage.getItem(SPEED_MODIFIER));
    return SPEED_CHOICES.includes(value) ? value : 1;
};

export const setSavedSpeed = (value: number) => {
    localStorage.setItem(SPEED_MODIFIER, String(value));
};

export const getAutoWarpEnabled = (): boolean => {
    return localStorage.getItem(AUTO_WARP_ENABLED) === '1';
};

export const setAutoWarpEnabled = (value: boolean) => {
    localStorage.setItem(AUTO_WARP_ENABLED, value ? '1' : '0');
};

export const getEmoteText = (): string => {
    return localStorage.getItem(EMOTE_TEXT) ?? '';
};

export const setEmoteText = (value: string) => {
    localStorage.setItem(EMOTE_TEXT, value);
};
