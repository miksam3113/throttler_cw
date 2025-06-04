import { Hono } from 'hono';

import { RTThrottlerRequests, Bindings, StateEntry } from './helpers/runtypes';
import { DurableObject } from 'cloudflare:workers';
import { Env } from "./helpers/interfaces";
import { addState, clearData } from "./helpers/durableMethods";

export class DurableState extends DurableObject {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    async clearData(resourceId: string) {
        await this.ctx.storage.delete(resourceId);
    }

    async getState() {
        return this.ctx.storage.list();
    }

    async addData(resourceId: string, newState: StateEntry) {
        const state = (await this.ctx.storage.get(resourceId)) || {};
        await this.ctx.storage.put(resourceId, newState);
        return state;
    }
}

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/events', async (ctx) => {
    const body = await ctx.req.json();
    const env = ctx.env;
    const events = RTThrottlerRequests.check(body.events);

    const data = await addState(env, events);

    return ctx.json(data);
});

export default {
    fetch: app.fetch,
    async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
        await clearData(env);
    },
};

