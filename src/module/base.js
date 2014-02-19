/*jshint laxbreak:true */

/**
 * Base module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var baseModule = function (card, callback) {
    var base = card.data.base;
    if (!base.name || base.name === base.login) {
        // If no name was set or name is login name
        // then only show login name.
        base.name = base.name || base.login;
        base._nameClass = 'octocard-m-base-noname';
    } else {
        base._login = base.login;
    }
    var html = util.format(baseModule.MOD_HTML, card.data.base);
    card.appendModHTML('base', html);
    callback();
};

baseModule.MOD_HTML = ''
    + '<a href="#{html_url}" target="_blank">'
    +     '<img src="#{avatar_url}" width="44" height="44"/>'
    +     '<h1 class="#{_nameClass}">#{name}</h1>'
    +     '<span>#{_login}</span>'
    + '</a>';

modules.add('base', baseModule);
