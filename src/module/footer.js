/*jshint laxbreak:true */

/**
 * private footer module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var footerModule = function (card, callback) {
    var noFooter = card.config.noFooter;
    if (noFooter) {
        callback();
        return;
    }

    var link = document.createElement('a');
    link.href = 'http://octocard.info/';
    link.target = '_blank';
    link.className = 'ocotocard-footer';
    link.innerHTML = 'Octocard.info';
    card.element.appendChild(link);
    callback();
};

modules.add('footer', footerModule);

