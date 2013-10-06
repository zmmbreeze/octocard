/*jshint laxbreak:true */

/**
 * Details module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var detailsModule = function (card, callback) {
    var data = card.data.base;
    var html = ''
        + '<ul>'
        + (data.email ? ('<li>' + data.email + '</li>') : '')
        + (data.blog
            ? ('<li><a href="' + data.blog + '" target="_blank">' + data.blog + '</a></li>')
            : '')
        + (data.bio ? ('<li>' + data.bio + '</li>') : '')
        + (data.location ? ('<li>' + data.location + '</li>') : '')
        + (data.company ? ('<li>' + data.company + '</li>') : '')
        + '</ul>';
    card.appendModHTML('details', html);
    callback();
};

modules.add('details', detailsModule);

