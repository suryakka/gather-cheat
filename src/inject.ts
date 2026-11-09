import {addButton, addCheckbox, visibleMenu, setCurrentSpeed, setPressedButton, viewInit} from './modules/view';
import * as GatherHook from './modules/gather_hook';
import * as CspHook from './modules/csp_hook';
import {getAutoWarpEnabled, getCustomTeleportPos, getEmoteText, getMenuIsOpened, getMenuPos, getSavedSpeed, setAutoWarpEnabled, setEmoteText, setMenuPos, setCustomTeleportPos, setMenuIsOpened, setOoBIsEnabled, setSavedSpeed, getOoBIsEnabled} from './modules/localstorage';
import {setMuteButtonForPinP} from './modules/media_session';
import {DATA_I18N_KEY} from './constants';
import {sleep} from './util';

const MAX_CNT = 10;

// state
let autoWarpIntervalId: number | null = null;
let emoteSending = false;
let emoteStopRequested = false;

const randomWarp = () => {
    const maps = Object.values(gameSpace.mapState);
    if (maps.length === 0) {
        return;
    }
    const {id: mapId, dimensions: [mapWidth, mapHeight]} = maps[Math.floor(Math.random() * maps.length)];
    const x = Math.floor(Math.random() * mapWidth);
    const y = Math.floor(Math.random() * mapHeight);
    game.teleport(mapId, x, y);
};

const applySavedSpeed = () => {
    const speed = getSavedSpeed();
    try {
        game.setSpeedModifier(speed);
    } catch {
        // Player is not connected yet. The heartbeat handler retries.
    }
    setCurrentSpeed(speed);
    setPressedButton('speed', 'x' + speed);
};

const startAutoWarp = (button: HTMLButtonElement) => {
    if (autoWarpIntervalId !== null) {
        return;
    }
    button.setAttribute(DATA_I18N_KEY, 'STOP');
    autoWarpIntervalId = window.setInterval(() => {randomWarp()}, 2000);
    setAutoWarpEnabled(true);
};

const stopAutoWarp = (button: HTMLButtonElement) => {
    button.setAttribute(DATA_I18N_KEY, 'AUTO');
    if (autoWarpIntervalId !== null) {
        window.clearInterval(autoWarpIntervalId);
        autoWarpIntervalId = null;
    }
    setAutoWarpEnabled(false);
};

const main = async() => {
    // ページ読み込み後のタイミングではgame, gameSpaceがないケースがある
    for (let i = 0; i < MAX_CNT; i++) {
        if ('game' in window && 'gameSpace' in window && 'newrelic' in window) {
            break;
        }
        await sleep(1500);
    }

    CspHook.attach();

    viewInit(
        getMenuPos(),
        (menuPos: {x: number, y: number}) => setMenuPos(menuPos),
        getMenuIsOpened(),
        (isOpened: boolean) => setMenuIsOpened(isOpened)
    );
    // addButton('currentPosGroup', 'SAVE', () => {
    //     const label = window.prompt('Label');
    //     if (label) {
    //         const {id: mapId} = gameSpace.getCurrentMap();
    //         const {x, y} = gameSpace.getMyPredictedPos();
    //         setCustomTeleportPos(game.spaceId, {mapId, x, y, label});
    //     }
    // });

    // Teleport
    const autoWarpButton = addButton('teleport', 'AUTO', button => {
        if (autoWarpIntervalId !== null) {
            stopAutoWarp(button);
            return;
        }
        startAutoWarp(button);
    });
    if (getAutoWarpEnabled()) {
        startAutoWarp(autoWarpButton);
    }
    addButton('teleport', 'RANDOM', () => {randomWarp()});
    getCustomTeleportPos(game.spaceId).forEach(pos => {
        addButton('customTeleport', pos.label, () => {game.teleport(pos.mapId, pos.x, pos.y)});
    });
    // Speed mod
    GatherHook.attachGetMyPredictedPos();
    [1, 2, 3, 4].forEach(s => addButton('speed', 'x' + s, () => {
        setSavedSpeed(s);
        applySavedSpeed();
    }));
    applySavedSpeed();
    // Send Emote — spells out each character of the input text as a separate emote
    const emoteTextInput   = document.getElementById('emote-text-input') as HTMLInputElement;
    emoteTextInput.value = getEmoteText();
    emoteTextInput.addEventListener('input', () => {setEmoteText(emoteTextInput.value)});
    const emoteSendBtn     = document.getElementById('emote-send-btn')   as HTMLButtonElement;
    const emoteStopBtn     = document.getElementById('emote-stop-btn')   as HTMLButtonElement;
    const emoteStatusEl    = document.getElementById('emote-status')     as HTMLParagraphElement;

    const setEmoteBusy = (busy: boolean) => {
        emoteSendBtn.disabled = busy;
        emoteStopBtn.disabled = !busy;
    };

    const sendTextAsEmotes = async (text: string) => {
        if (emoteSending) return;
        const chars = [...text.toUpperCase()];
        if (chars.length === 0) return;

        emoteSending = true;
        emoteStopRequested = false;
        setEmoteBusy(true);

        for (let i = 0; i < chars.length; i++) {
            if (emoteStopRequested) break;
            const char = chars[i];
            emoteStatusEl.textContent =
                chars.slice(0, i).join('') + `[${char}]` + chars.slice(i + 1).join('');
            game.setEmote(char);
            // wait for this char to be visible; next setEmote call replaces it automatically
            await sleep(500);
        }

        // clear with empty string — passing null is silently ignored by Gather
        game.setEmote('');
        if (emoteStopRequested) {
            emoteStatusEl.textContent = '';
        } else {
            emoteTextInput.value = '';
            setEmoteText('');
            emoteStatusEl.textContent = '✓ Done';
        }
        emoteSending = false;
        emoteStopRequested = false;
        setEmoteBusy(false);
    };

    emoteSendBtn.addEventListener('click', () => {
        const text = emoteTextInput.value.trim();
        if (text) sendTextAsEmotes(text);
    });

    emoteStopBtn.addEventListener('click', () => {
        emoteStopRequested = true;
    });

    emoteTextInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !emoteSendBtn.disabled) emoteSendBtn.click();
    });

    // Misc
    const ooBIsEnabled = getOoBIsEnabled();
    ooBIsEnabled && GatherHook.attachMove();
    addCheckbox('misc', 'ENABLE_OOB', ooBIsEnabled, checked => {
        checked ? GatherHook.attachMove() : GatherHook.detachMove();
        setOoBIsEnabled(checked);
    });
    document.pictureInPictureEnabled && addButton('misc', 'MAIN_PINP', () => {document.querySelector<HTMLVideoElement>('.GameCanvasContainer-main video')?.requestPictureInPicture()});

    let menuShown = false;
    let speedRestoreTries = 0;
    const removeHeartbeatEvent = game.subscribeToEvent('serverHeartbeat', () => {
        if (!menuShown) {
            visibleMenu();
            setMuteButtonForPinP();
            menuShown = true;
        }

        const wanted = getSavedSpeed();
        const actual = game.getMyPlayer()?.speedModifier;
        if (actual === wanted || speedRestoreTries >= 8) {
            setCurrentSpeed(actual ?? wanted);
            setPressedButton('speed', 'x' + wanted);
            removeHeartbeatEvent();
            return;
        }

        try {
            game.setSpeedModifier(wanted);
        } catch {
            // Keep waiting for the player object.
        }
        setCurrentSpeed(wanted);
        speedRestoreTries++;
    });
};

main();

export {};
