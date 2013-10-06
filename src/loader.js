/*jshint laxbreak:true */

var LOADER_HTML = ''
    + '<div class="octocard-loading-inner">'
    +     '<div class="octocard-loading-0"></div>'
    +     '<div class="octocard-loading-1"></div>'
    +     '<div class="octocard-loading-2"></div>'
    + '</div>';

/**
 * Loader
 *
 * @constructor
 * @param {Element} element .
 * @param {number} zIndex .
 */
var Loader = function (element, zIndex) {
    this.element = element;

    // create and append loader root
    var loaderRoot = document.createElement('div');
    loaderRoot.style.zIndex = zIndex || 9;
    loaderRoot.className = 'octocard-loading';
    this.element.appendChild(loaderRoot);
    this.root = loaderRoot;

    // init html and css
    loaderRoot.innerHTML = LOADER_HTML;

    this.highlightNum = 2;
    this.start();
};

/**
 * start loading animation.
 */
Loader.prototype.start = function () {
    var nodes = this.root.firstChild.childNodes;
    var that = this;

    this.timer = setInterval(function() {
        var highlightNum = that.highlightNum;
        nodes[highlightNum].className = '' +
            'octocard-loading-' + highlightNum;
        that.highlightNum = highlightNum = (highlightNum + 1) % 3;
        nodes[highlightNum].className = '' +
            'octocard-loading-' + highlightNum +
            ' octocard-loading-cur';
    }, 500);
};

/**
 * stop loading animation.
 */
Loader.prototype.stop = function () {
    clearInterval(this.timer);
};

/**
 * end loading animation.
 */
Loader.prototype.end = function () {
    this.stop();
    if (this.root) {
        this.element.removeChild(this.root);
        delete this.root;
    }
};

var loader = function (element, zIndex) {
    return new Loader(element, zIndex);
};
