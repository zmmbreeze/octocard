/*jshint laxbreak:true */

/**
 * Orgs module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var orgsModule = function (card, callback) {
    var data = card.data.orgs;

    // if input user has no Organization,
    // don't show this module
    if (data.length === 0) {
        callback();
        return;
    }

    var orgsNum = parseInt(card.config.orgsNum, 10) || -1;
    if (orgsNum >= 0) {
        data = data.slice(0, orgsNum);
    }

    var liHtml = '';
    for (var i = 0, l = data.length; i < l; i++) {
        liHtml += util.format(orgsModule.MOD_LI_HTML, data[i]);
    }
    card.appendModHTML(
        'orgs',
        util.format(orgsModule.MOD_HTML, liHtml)
    );
    callback();
};

orgsModule.MOD_HTML = ''
    + '<h2>Organizations</h2>'
    + '<ul>'
    +     '#{v}'
    + '</ul>';
orgsModule.MOD_LI_HTML = ''
    + '<li>'
    +     '<a href="https://github.com/#{login}" target="_blank" title="#{login}">'
    +         '<img src="#{avatar_url}" alt="#{login}" height="32" width="32" />'
    +     '</a>'
    + '</li>';

modules.add('orgs', orgsModule);


