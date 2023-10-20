import {get, set, has, isString, isArray, every, isNil, isObject} from 'lodash';
import type {FeatsObject} from "./winDef";

export interface ModdedClothesFeatsParams {
    feats: string[];
}

export function checkParams(a: any): a is ModdedClothesFeatsParams {
    return a && a.feats && isArray(a.feats) && a.feats.every(isString);
}

export function checkFeatsItem(a: any): a is FeatsObject {
    return a && every(Object.keys(a), (k) => {
        const c = a[k];
        return c && isObject(c)
            && isString(get(c, 'title'))
            && isString(get(c, 'desc'));
    });
}

