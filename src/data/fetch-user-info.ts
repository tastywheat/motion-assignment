import fetch from 'node-fetch';
import configs from '../configs';
import z from 'zod';

const facebookUserSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export enum FBErrorCodes {
    RequestLimit = 4,
    SessionExpired = 190,
}

const facebookErrorSchema = z.object({
    error: z.union([
        z.object({
            message: z.literal('(#4) Application request limit reached'),
            type: z.literal('OAuthException'),
            is_transient: z.literal(true),
            code: z.literal(FBErrorCodes.RequestLimit),
            fbtrace_id: z.string(),
        }),
        z.object({
            message: z.string(),
            type: z.literal('OAuthException'),
            code: z.literal(FBErrorCodes.SessionExpired),
            error_subcode: z.literal(463),
            fbtrace_id: z.string(),
        }),
        z.object({
            message: z.string(),
            type: z.string(),
            code: z.number(),
            error_subcode: z.number(),
            fbtrace_id: z.string(),
        })
    ]),
});

const userOrErrorSchema = z.union([facebookUserSchema, facebookErrorSchema]);

export type FetchUserInfoFunc = <T extends keyof FacebookUser>(fields: T[]) => Promise<FetchUserResponse>;
export type FetchUserResponse = z.infer<typeof userOrErrorSchema>;
export type FacebookUser = z.infer<typeof facebookUserSchema>;
export type FacebookError = z.infer<typeof facebookErrorSchema>;

export const fetchUserInfo: FetchUserInfoFunc = async <T extends keyof FacebookUser>(fields: T[]): Promise<FetchUserResponse> => {
    // if the request hangs on FB's end, we'll abort the request
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 1000);

    const params = new URLSearchParams({
        fields: fields.join(','),
        access_token: configs.fbKey,
    });

    const url = `https://graph.facebook.com/v19.0/me?`;
    const res = await fetch(`${url}&${params}`, { signal: controller.signal });

    clearTimeout(timeout);

    const output = await res.json();

    // ensure data coming from a 3rd party is using a known schema
    const result = userOrErrorSchema.safeParse(output);

    if (result.success === false) {
        throw new Error(
            `Facebook returned unexpected schema. Received: ${JSON.stringify(output)}`
        );
    }

    return result.data;
}

