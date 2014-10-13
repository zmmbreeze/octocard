/*jshint laxbreak:true */

/**
 * private footer module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var footerModule = function (card, callback) {
    var noFooter = card.config.noFooter;
    if (noFooter && noFooter !== 'false') {
        callback();
        return;
    }

    var link = document.createElement('a');
    link.href = 'http://octocard.in/';
    link.target = '_blank';
    link.className = 'octocard-footer';
    link.innerHTML = 'Octocard.in';
    card.element.appendChild(link);
    callback();
};

modules.add('footer', footerModule);

