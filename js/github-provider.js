class GithubProvider {
    accessToken = ''
    baseUrl = 'https://api.github.com'
    username = ''
    constructor(accessToken, username) {
        this.accessToken = accessToken
        this.username = username
    }

    get priviteReposUrl() {
        return `user/repos`
    }

    get publicReposUrl() {
        return `users/${this.username}/repos`
    }

    getPriviteRepos() {
        return this.AJAX(this.priviteReposUrl)
    }

    getPublicRepos() {
        return this.AJAX(this.publicReposUrl)
    }


    AJAX(url, data = {}, method = 'GET') {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: method,
                url: this.wrapWithToken(url),
                data,
                success: repsonse => {
                    resolve(repsonse)
                },
                error: (repsonse) => {
                    reject(repsonse)
                }
            })
        })
    }

    wrapWithToken(url) {
        return `${this.baseUrl}/${url}?access_token=${this.accessToken}`
    }
}