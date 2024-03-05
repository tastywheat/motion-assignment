import type { FacebookError, FetchUserInfoFunc, FacebookUser } from '../data/fetch-user-info';
import { FBErrorCodes } from '../data/fetch-user-info';
import { AbortError } from 'node-fetch';
import logger from '../logger';

type MakeLogUserDataArgs = {
    minDelay: number
    maxDelay: number
    fetchUserInfo: FetchUserInfoFunc
}

type LogUserDataArgs<T> = {
    delay: number
    fields: T[]
}

export const makeLogUserData = ({ minDelay, maxDelay, fetchUserInfo }: MakeLogUserDataArgs) => 
    async <T extends keyof FacebookUser>({ delay, fields }: LogUserDataArgs<T>): Promise<number> => {
        try {
            const data = await fetchUserInfo(fields);

            if ('error' in data) {
                delay = extendDelay(delay, maxDelay);
                logFbError(data);
            } else if ('id' in data) {
                delay = minDelay;
                logFbData(data);
            } 
        } catch(err: unknown) {
            delay = extendDelay(delay, maxDelay);

            if (err instanceof AbortError) {
                logger.error(`Fetch timed out: ${err.message}`);
            } else if (err instanceof Error) {
                throw new Error(`Failed to fetch user info, encountered unknown error: ${err.message}`);
            }
        }

        return delay;
    };

function logFbError(data: FacebookError) {
    switch(data.error.code) {
        case FBErrorCodes.RequestLimit: 
            logger.error(`Request Limit Error: ${data.error.message}`);
            break;
        case FBErrorCodes.SessionExpired: 
            logger.error(`Session Expired Error: ${data.error.message}`);
            break;
        default:
            logger.error(`Unknown Facebook Error - ${JSON.stringify(data.error)}`);
    }
}

function logFbData(data: FacebookUser) {
    logger.info(`Found user ${data.id}: ${data.name}`);
}

function extendDelay(delay: number, maxDelay: number) {
    // we add 1000ms to the delay incase the delay is 0 to avoid 
    // continuously multiplying by 0
    return Math.min((1000+delay)*2, maxDelay);
}

