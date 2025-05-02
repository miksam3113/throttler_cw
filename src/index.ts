import throttle from './throttler';

import { Hono} from 'hono';

import { State, RTThrottlerRequests } from './helpers/runtypes';
import {clearOldData} from "./service";

export const state: State = {};


const app = new Hono()

app.post('/api/events', async (c) => {
    const body = await c.req.json();
    const events = RTThrottlerRequests.check(body.events);

    const data = await throttle(events, state, Date.now());

    return c.json(data);
});


export default {
    fetch: app.fetch,
    scheduled() {
        clearOldData(state, Date.now())
    },
};

