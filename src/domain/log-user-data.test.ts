import { AbortError } from 'node-fetch';
import type { FetchUserResponse } from '../data/fetch-user-info';

import assert from 'assert';

import { makeLogUserData } from './log-user-data';

describe('fetchUserInfo()', function() {
    it('extends delay when a rate limit error is returned', async function() {
        const delay = 100;

        const logUserData = makeLogUserData({
            minDelay: 100, 
            maxDelay: 10000, 
            fetchUserInfo: async () => {
                return {
                    error: {
                        message: '(#4) Application request limit reached',
                        type: 'OAuthException',
                        is_transient: true,
                        code: 4,
                        fbtrace_id: 'aaaaaa',
                    }
                };
            },
        });

        const newDelay = await logUserData({ delay, fields: ['id', 'name'] });

        assert(newDelay > delay, `expected newDelay to be increased`);
    });

    it('extends delay when AbortError error is returned', async function() {
        const delay = 100;

        const logUserData = makeLogUserData({
            minDelay: 100, 
            maxDelay: 10000, 
            fetchUserInfo: async () => {
                throw new AbortError('Aborting due to timeout');
            },
        });
        const newDelay = await logUserData({ delay, fields: ['id', 'name'] });

        assert(newDelay > delay, `expected newDelay to be increased`);
    });

    it('does not extend the delay on a successful response', async function() {
        const delay = 100;

        const logUserData = makeLogUserData({
            minDelay: 100, 
            maxDelay: 10000, 
            fetchUserInfo: async () => {
                return {
                    id: '1',
                    name: 'brian',
                };
            },
        });
        const newDelay = await logUserData({ delay, fields: ['id', 'name'] });

        assert(newDelay === delay, `expected newDelay(${newDelay}) to be the same as delay(${delay})`);
    });
});
