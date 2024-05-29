

import axios from 'axios'

import { Client, auth } from "twitter-api-sdk";


const authClient = new auth.OAuth2User({
    client_id: "SzFvUDZjd1Z5RUdIR1RXOXduYXA6MTpjaQ" as string,
    client_secret: "YUOQkL6NUbbWCtVghkXsTvaH753Pnre6KOcur4O2h5cCRpGQr0" as string,
    callback: "http://localhost:3000/callback",
    scopes: ["tweet.read", "users.read", "offline.access"],
});

const client = new Client(authClient);

const STATE = "state";

export const linktwitter = defineStore('linktwitter', () => {

    const callbackUrl = 'http://localhost:3000/callback'; // 回调 URL
    const consumerKey = 'XzBHZjk5d3lKbjVuUDNHS2JKYm06MTpjaQ'; // 客户端标识
    const consumerSecret = 'iq5S97n0VwrcpOu95xXiO6AC0wZgfZTIoYAubUj20KNF5p0_Hp'; // 客户端密钥

    const gettoken = () => {
        console.log("-----111", process.env.SUPABASE_URL)
        const authUrl = authClient.generateAuthURL({
            state: STATE,
            code_challenge_method: "plain",
            code_challenge: "test",
        });
        window.open(authUrl, '_blank');

        return authUrl
    }
    return $$({ gettoken })
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(linktwitter, import.meta.hot))

//const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
//window.location.href = authUrl;