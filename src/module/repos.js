/*jshint laxbreak:true */

/**
 * Repos module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var reposModule = function (card, callback) {
    var i;
    var l;
    data = card.data.repos;
    // sort data by stars
    data.sort(function (a, b) {
        return b.watchers_count - a.watchers_count;
    });

    // calc ignore rule
    var reposIgnored = card.config.reposIgnored;
    var isIgnored = {};
    if (reposIgnored) {
        reposIgnored = reposIgnored.split(',');
        for (i = 0, l = reposIgnored.length; i < l; i++) {
            isIgnored[reposIgnored[i]] = 1;
        }
    }

    // max reposNum
    var reposNum = parseInt(card.config.reposNum, 10) || 3;
    var usedRepoNum;
    var html = '<ul>';
    for (i = 0, usedRepoNum = 0, l = data.length; i < l; i++) {
        if (usedRepoNum === reposNum) {
            break;
        }
        if (isIgnored[data[i].name]) {
            // ignore this repo
            continue;
        }

        // rend html
        usedRepoNum++;
        html += util.format(reposModule.MOD_LI_HTML, data[i]);
    }
    html += '</ul>';
    card.appendModHTML('repos', html);
    callback();
};

reposModule.MOD_LI_HTML = ''
    + '<li>'
    +     '<a href="#{html_url}" target="_blank">'
    +         '<h2>#{name}</h2>'
    +         '<p>#{description}</p>'
    +         '<span>#{watchers_count}&#10029;</span>'
    +     '</a>'
    + '</li>';

modules.add('repos', reposModule);

