export default eventHandler(async (event) => {

    const { code } = getQuery(event) as { code?: string }
    const getAccessTokenUrl = 'https://github.com/login/oauth/access_token?code=' + code + '&client_id=Ov23liyIh4bmA6HGwXhT&client_secret=6b7d561480948841902162fa6cdf71d6f7c2477e&redirect_uri=https://localhost:3000/githubcallback'

    try {
        const response = await $fetch(getAccessTokenUrl, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        return response
    } catch (error) {
        return error
    }
})
