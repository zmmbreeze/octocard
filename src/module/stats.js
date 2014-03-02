/*jshint laxbreak:true */

/**
 * Stats module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var statsModule = function (card, callback) {
    var html = util.format(statsModule.MOD_HTML, card.data.base);
    card.appendModHTML('stats', html);
    callback();
};

statsModule.MOD_HTML = ''
    + '<ul>'
    +     '<li>'
    +         '<a target="_blank" href="#{html_url}/followers">'
    +             '<strong>#{followers}</strong>'
    +             '<span>followers</span>'
    +         '</a>'
    +     '</li>'
    +     '<li>'
    +         '<a target="_blank" href="#{html_url}/following">'
    +             '<strong>#{following}</strong>'
    +             '<span>following</span>'
    +         '</a>'
    +     '</li>'
    +     '<li>'
    +         '<a target="_blank" href="#{html_url}?tab=repositories">'
    +             '<strong>#{public_repos}</strong>'
    +             '<span>repos</span>'
    +         '</a>'
    +     '</li>'
    +     '<li>'
    +         '<a target="_blank" href="https://gist.github.com/#{login}">'
    +             '<strong>#{public_gists}</strong>'
    +             '<span>gists</span>'
    +         '</a>'
    +     '</li>'
    + '</ul>';

modules.add('stats', statsModule);
