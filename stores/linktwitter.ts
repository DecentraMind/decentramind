

import axios from 'axios'

import { Client, auth } from "twitter-api-sdk";


const authClient = new auth.OAuth2User({
    client_id: "XzBHZjk5d3lKbjVuUDNHS2JKYm06MTpjaQ" as string,
    client_secret: "oeoEyYDBViAmODitZuMlh_IfcbnFB78QZsj2_pHdbFkUsS83_0" as string,
    callback: "http://localhost:3000/callback",
    scopes: ["tweet.read", "users.read", "offline.access"],
});

const client = new Client(authClient);

const STATE = "state";

export const linktwitter = defineStore('linktwitter', () => {
    let connectTwitter = $ref('')

    const callbackUrl = 'http://localhost:3000/callback'; // callback URL
    const consumerKey = 'XzBHZjk5d3lKbjVuUDNHS2JKYm06MTpjaQ'; // client identifier
    const consumerSecret = 'iq5S97n0VwrcpOu95xXiO6AC0wZgfZTIoYAubUj20KNF5p0_Hp'; // Client Key

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

        // Configuring headers
        const headers = {
            'User-Agent': 'v2SpacesSearchJS',
            Authorization: 'Basic eHZ6MWV2RlM0d0VFUFRHRUZQSEJvZzpMOHFxOVBaeVJn NmllS0dFS2hab2xHQzB2SldMdzhpRUo4OERSZHlPZw==',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length': '29'
        };

        // Configuring body (data)
        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');

        try {
            const response = await axios.post(url, data, { headers });
            console.log(response.data);
        } catch (error) {
            console.error('Error posting token:', error);
        }
    }

    const searchSpaceById = async () => {

        const url = '/spaces/1kvJpveMAnQKE'

        // Configuring headers
        const headers = {
            // 'User-Agent': 'v2RecentTweetCountsJS',
            Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAG5XuAEAAAAADQWNx%2FmfyBHNT4V71rSuwhzi4z0%3DQd5oXywZLlTyPArAnUVJMD6IuaBJrTuA3339oPjomyMKl4grXN',
        }
        const params = {
            'space.fields': 'creator_id,speaker_ids',
            'expansions': 'creator_id',
            'topic.fields': 'name'
        }

        // Configuring body (data)
        const data = new URLSearchParams()
        data.append('grant_type', 'client_credentials')

        try {
            const response = await axios.post(url, null, { headers, params })
            console.log(response.data)
        } catch (error) {
            console.error('Error posting token:', error)
        }
    }
    return $$({ gettoken, postToken, searchSpaceById })
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(linktwitter, import.meta.hot))

//const authUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
//window.location.href = authUrl;
