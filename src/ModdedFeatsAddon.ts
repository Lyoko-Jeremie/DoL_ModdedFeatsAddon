import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import JSZip from "jszip";
import * as JSON5 from "json5";
import {get, set, has, isString, isArray, every, isNil, cloneDeep} from 'lodash';
import {checkFeatsItem, checkParams} from "./ModdedFeatsAddonParams";
import {FeatsObject} from "./winDef";

export class ModdedFeatsAddon implements LifeTimeCircleHook, AddonPluginHookPointEx {
    logger: LogWrapper;

    isInit = false;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
        this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('ModdedFeatsAddon', this);
        this.gModUtils.getAddonPluginManager().registerAddonPlugin(
            'ModdedFeatsAddon',
            'ModdedFeatsAddon',
            this,
        );
        // we must init it in first passage init
        this.gSC2DataManager.getSc2EventTracer().addCallback({
            whenSC2PassageInit: () => {
                if (this.isInit) {
                    return;
                }
                this.isInit = true;
                this.init();
            },
        });
    }

    featsData: Map<string, FeatsObject> = new Map<string, FeatsObject>();

    async registerMod(addonName: string, mod: ModInfo, modZip: ModZipReader) {
        if (!mod) {
            console.error('registerMod() (!mod)', [addonName, mod]);
            this.logger.error(`registerMod() (!mod): addon[${addonName}] mod[${mod}]`);
            return;
        }
        const pp = mod.bootJson.addonPlugin?.find((T: ModBootJsonAddonPlugin) => {
            return T.modName === 'ModdedFeatsAddon'
                && T.addonName === 'ModdedFeatsAddon';
        })?.params;
        if (!checkParams(pp)) {
            console.error('[ModdedFeatsAddon] registerMod() ParamsInvalid', [addonName, mod, pp]);
            this.logger.error(`[ModdedFeatsAddon] registerMod() ParamsInvalid: addon[${addonName}]`);
            return;
        }
        let ff: FeatsObject = {};
        for (const ft of pp.feats) {
            const data = await modZip.zip.file(ft)?.async('string');
            if (isNil(data)) {
                console.error('[ModdedFeatsAddon] registerMod() feats data file not found', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedFeatsAddon] registerMod() feats data file not found: addon[${addonName}] file[${ft}]`);
                return;
            }
            if (!data) {
                console.error('[ModdedFeatsAddon] registerMod() feats data file empty', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedFeatsAddon] registerMod() feats data file empty: addon[${addonName}] file[${ft}]`);
                return;
            }
            try {
                const f = JSON5.parse(data);
                if (!checkFeatsItem(f)) {
                    console.error('[ModdedFeatsAddon] registerMod() feats data invalid', [addonName, mod, pp, ft, data, f]);
                    this.logger.error(`[ModdedFeatsAddon] registerMod() feats data invalid: addon[${addonName}] file[${ft}]`);
                    return;
                }
                ff = mergeFeatsObject(ff, f, mod.name, this.logger);
            } catch (e) {
                console.error('[ModdedFeatsAddon] registerMod() feats data invalid', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedFeatsAddon] registerMod() feats data invalid: addon[${addonName}] file[${ft}]`);
                return;
            }
        }
        if (this.featsData.has(mod.name)) {
            console.warn('[ModdedFeatsAddon] registerMod() feats data already exists', [addonName, mod, pp]);
            this.logger.warn(`[ModdedFeatsAddon] registerMod() feats data already exists: addon[${addonName}]`);
        }
        this.featsData.set(mod.name, ff);
    }

    async exportDataZip(zip: JSZip): Promise<JSZip> {
        zip.file(`ModdedFeatsAddon/setup/feats`, JSON.stringify(get(window.DOL.setup, 'feats'), undefined, 2));
        return zip;
    }

    init() {
        if (!has(window, 'DOL.setup.feats')) {
            console.error('[ModdedFeatsAddon] window.DOL.setup.feats not found');
            this.logger.error(`[ModdedFeatsAddon] window.DOL.setup.feats not found`);
            return;
        }
        try {
            for (const [k, v] of this.featsData) {
                appendFeatsObject(get(window.DOL.setup, 'feats'), v, this.logger);
            }
        } catch (e) {
            console.error('[ModdedFeatsAddon] init() feats error', [e]);
            this.logger.error(`[ModdedFeatsAddon] init() feats error: ${e}`);
        }
        console.log('[ModdedFeatsAddon] init() feats end', [get(window.DOL.setup, 'feats')]);
        this.logger.log(`[ModdedFeatsAddon] init() feats end`);
    }
}

/**
 * Merge feats object o and b, create new one. check same key and error it.
 */
export function mergeFeatsObject(b: FeatsObject, o: FeatsObject, modName: string, logger: LogWrapper) {
    const out = cloneDeep(b);
    for (const k in o) {
        if (has(out, k)) {
            console.error(`[ModdedFeatsAddon] mergeFeatsObject() key already exists, will be overwrite. `, [modName, k, cloneDeep(b), cloneDeep(o)]);
            logger.error(`[ModdedFeatsAddon] mergeFeatsObject() key already exists, will be overwrite: [${modName}] [${k}]`);
        }
        set(out, k, get(o, k));
    }
    return out;
}

export function appendFeatsObject(b: FeatsObject, o: FeatsObject, logger: LogWrapper) {
    for (const k in o) {
        if (has(b, k)) {
            console.warn(`[ModdedFeatsAddon] appendFeatsObject() key already exists, will be overwrite. `, [k, cloneDeep(b), cloneDeep(o)]);
            logger.warn(`[ModdedFeatsAddon] appendFeatsObject() key already exists, will be overwrite: [${k}]`);
        }
        set(b, k, get(o, k));
    }
}
