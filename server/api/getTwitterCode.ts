import { auth, Client } from 'twitter-api-sdk'

export default eventHandler(async (event) => {
  // const { authClient } = $(linktwitter())
  const STATE = "state";
  const authClient = new auth.OAuth2User({
    client_id: "ZkJXajNiRUdwanFQTkZOenZBUzA6MTpjaQ" as string,
    client_secret: "H29N3gUVa0CwQkZ0Ky9tNqXRu1QzgpISaH9GIGQ5poArbPsdfE" as string,
    callback: "https://decentramind.club/callback",
    scopes: ["tweet.read", "users.read"],
  });
  const client = new Client(authClient);
  // const authUrl = authClient.generateAuthURL({
  //   state: STATE,
  //   code_challenge_method: "s256",
  // });
  // window.open(authUrl, '_blank');
  const { code } = getQuery(event) as { code?: string }
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "plain",
    code_challenge: "test",
  });
  // window.open(authUrl, '_blank');
  // 替换为你要跳转的 URL
  // 返回重定向响应
  // return { statusCode: 302, headers: { Location: authUrl } }
  return authUrl
})
