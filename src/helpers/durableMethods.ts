import { Env } from "./interfaces";
import {clearOldData} from "../service";
import { ThrottlerRequests} from "./runtypes";
import throttle from "../throttler";

async function getState (env: Env) {
    const id = env.STATE.idFromName("state");
    const stub = env.STATE.get(id);

    const durableState = await stub.getState();

    return durableState;
}

async function clearData (env: Env) {
    const id = env.STATE.idFromName("state");
    const stub = env.STATE.get(id);

    const durableState = await stub.getState();
    const resourceIds = clearOldData(durableState, Date.now());

    for (const resourceId of resourceIds) {
        await stub.clearData(resourceId);
    }
}

async function addState (env: Env, events: ThrottlerRequests) {
    const id = env.STATE.idFromName("state");
    const stub = env.STATE.get(id);

    const durableState = await stub.getState();

    const data = await throttle(events, durableState, Date.now());

    for(const resourceId of Object.keys(durableState)) {
        await stub.addData(resourceId, durableState[resourceId]);
    }

    return data;
}

export {
    getState,
    clearData,
    addState
}