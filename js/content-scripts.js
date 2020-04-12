document.addEventListener('DOMContentLoaded', () => {
    initSearchWarp()
    HotKeyProcessor.push(searchRepoHotkeyProcessor)

    document.onkeydown = function (e) {
        HotKeyProcessor.forEach(func => func(e))
    }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
    switch (request.cmd) {
        case 'save-cole-github-token-and-username':
            saveTokenAndUsername(request.token, request.username);
            break;
        default:
            console.log('收到来自无法识别的消息类型', request);
            break;
    }
    sendResponse('ok')
});

const saveTokenAndUsername = (token, username) => {
    localStorage.setItem('cole-github-token', token)
    localStorage.setItem('cole-github-username', username)
}

const getTokenAndUsername = () => {
    return {
        token: localStorage.getItem('cole-github-token'),
        username: localStorage.getItem('cole-github-username')
    }
}

var keyCodeNumber = {
    o: 79, r: 82, f: 70, a: 65, s: 83, z: 90, t: 84, x: 88, one: 49, c: 67, dot: 190
}

const searchRepoHotkeyProcessor = (e) => {
    try {
        var keyCode = e.keyCode || e.which || e.charCode
        var shiftKey = e.shiftKey
        var cmdOrCtrlKey = e.metaKey || e.ctrlKey
        var altKey = e.altKey

        if (cmdOrCtrlKey && keyCode == keyCodeNumber.dot) {
            if (isSearchBarExist()) {
                closeSearchBar()
            } else {
                showSearchBar()
            }
            e.preventDefault()
            return
        }
    } catch (e) {
        console.log(e)
    }
}

const closeSearchBar = () => document.querySelector('.cole-search-warp').removeChild(document.querySelector('.cole-search'))

const isSearchBarExist = () => document.querySelector('.cole-search')

const initSearchWarp = () => {
    const warp = document.createElement('div')
    warp.className = 'cole-search-warp'
    document.body.appendChild(warp)
}

const loadAllRepos = () => {
    const {token, username} = getTokenAndUsername()
    const githubProvider = new GithubProvider(token, username)
    return Promise.all([githubProvider.getPriviteRepos(), githubProvider.getPublicRepos()])
}


const showSearchBar = () => {
    loadAllRepos()
    .then(([priviteRepos, publicRepos]) => {
        renderRepos(priviteRepos.concat(publicRepos).map(r => ({name: r.full_name, src: r.html_url})))
    })
    
}

const renderRepos = (repos) => {
    const panel = document.createElement('div')
	panel.className = 'cole-search'
    panel.innerHTML = 
    `
<div class="cole-search">
    <div class="cole-search-content">
        <div class="cole-search-bar">
            <input type="text" placeholder="Smart Search GitHub Repo" class="cole-search-bar-input">
        </div>
        <div class="cole-search-result">
        ${repos.map(r => buildItem(r.name, r.src)).join('')}
        </div>
    </div>
</div>
    `;
    document.querySelector('.cole-search-warp').appendChild(panel)
}

const buildItem = (name, src) => {
    return `
    <div class="cole-search-result-item">
        <a href="${src}" target="_blank">
            <span>${name}</span>
            <i>
                GO
                <svg t="1586665490274" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1656" width="200" height="200"><path d="M793.3 191.8h-185c-17.7 0-32 14.3-32 32s14.3 32 32 32h184.9c4.6 0 8.4 3.8 8.4 8.4v303.1c0 4.6-3.8 8.4-8.4 8.4h-507L458 403.9c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L213.2 558.3c-13.1 13.1-20.3 30.5-20.3 49s7.2 35.9 20.3 49l201.4 201.4c6.2 6.2 14.4 9.4 22.6 9.4 8.2 0 16.4-3.1 22.6-9.4 12.5-12.5 12.5-32.8 0-45.3L287.2 639.7h506.1c39.9 0 72.4-32.5 72.4-72.4V264.2c0-39.9-32.5-72.4-72.4-72.4z" p-id="1657"></path></svg>
            </i>
        </a>
    </div>
    `
}