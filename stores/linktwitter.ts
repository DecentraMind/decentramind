

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
        const authUrl = authClient.generateAuthURL({
            state: STATE,
            code_challenge_method: "plain",
            code_challenge: "test",
        });
        window.open(authUrl, '_blank');

        return authUrl
    }

    const postToken = async () => {

        const url = 'https://api.twitter.com/oauth2/token';

        // 配置 headers
        const headers = {
            'User-Agent': 'v2SpacesSearchJS',
            Authorization: 'Basic eHZ6MWV2RlM0d0VFUFRHRUZQSEJvZzpMOHFxOVBaeVJn NmllS0dFS2hab2xHQzB2SldMdzhpRUo4OERSZHlPZw==',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': '29'
        };

        // 配置 body (data)
        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');

        try {
            const response = await axios.post(url, data, { headers });
            console.log(response.data);
        } catch (error) {
            console.error('Error posting token:', error);
        }
    }
    return $$({ gettoken, postToken })
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(linktwitter, import.meta.hot))

//const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
//window.location.href = authUrl;