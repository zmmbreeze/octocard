/*jshint laxbreak:true */

/**
 * Base module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var baseModule = function (card, callback) {
    var html = util.format(baseModule.MOD_HTML, card.data.base);
    card.appendModHTML('base', html);
    callback();
};

baseModule.MOD_HTML = ''
    + '<a href="#{html_url}" target="_blank">'
    +     '<img src="#{avatar_url}" width="44" height="44"/>'
    +     '<h1>#{name}</h1>'
    +     '<span>#{login}</span>'
    + '</a>';

modules.add('base', baseModule);
