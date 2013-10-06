/*jshint laxbreak:true */

/**
 * Repos module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var reposModule = function (card, callback) {
    data = card.data.repos;
    // sort data by stars
    data.sort(function (a, b) {
        return b.watchers_count - a.watchers_count;
    });

    //  get max reposNum
    var reposNum = card.config.reposNum || 3;
    data = data.slice(0, reposNum);

    var html = '<ul>';
    for (var i = 0, l = data.length; i < l; i++) {
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

