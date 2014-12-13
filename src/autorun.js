// autorun Octocard
var MARK = 'e3dfd93b0a15118dd0f9c73013a6b2e9';
var isLoadedBefore = window.octocard && window.octocard.octocard === MARK;
var autorunConfig;
// get config from script tag
// eg:
//   <script
//     data-name="zmmbreeze"
//     data-modules="base,stats,repos,orgs,eventsStatis"
//     data-theme="azzura"
//     data-reposNum="3"
//     data-reposIgnored="reponame1,reponame2"
//     data-orgsNum="2"
//     data-element="OCTOCARD"
//     data-api="http://127.0.0.1:8080/api"
//     data-noIsolated="true"
//     data-noFooter="false"
//     src="src/octocard.js"></script>
var scripts = document.getElementsByTagName('script');
var lastScript = scripts[scripts.length - 1];
var hasConfig;              // has config
var useOctocardConfig;      // use OCTOCARD as config
if (lastScript && lastScript.getAttribute('data-name')) {
    // Use attribute
    useOctocardConfig = false;
    hasConfig = true;
} else if (typeof OCTOCARD === 'object' && OCTOCARD.name) {
    useOctocardConfig = true;
    hasConfig = true;
} else if (isLoadedBefore) {
    // if no config found and octocard was loaded before
    return;
} else {
    // if no config found and octocard not loaded
    hasConfig = false;
}

autorunConfig = {
    name: '',
    modules: '',
    theme: '',
    reposNum: '',
    reposIgnored: '',
    orgsNum: '',
    element: '',
    api: '',
    noIsolated: false,
    noFooter: false,
    themeCSS: ''
};
for (var key in autorunConfig) {
    if (useOctocardConfig) {
        autorunConfig[key] = OCTOCARD[key];
    }
    else {
        autorunConfig[key] = lastScript.getAttribute('data-' + key);
    }
}

if (hasConfig && isLoadedBefore) {
    // if octocard was included already,
    // then create a new octocard.
    if (!autorunConfig.element && document.getElementById('octocard')) {
        // if id octocard was used, use `octocard + timeString`.
        autorunConfig.element = 'octocard' + new Date().getTime();
    }
    window.octocard(autorunConfig);
    return;
}

