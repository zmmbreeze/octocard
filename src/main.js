/*jshint laxbreak:true, scripturl:true */

/**
 * Github card
 *
 * @constructor
 */
var Octocard = function () {
    this.reload();
};

/**
 * Reload card.
 *
 * @param {Object=} config
 *          OCTOCARD = {
 *              // [required][string]
 *              // username
 *              name: 'zmmbreeze',
 *              // [optional][string|Element]
 *              // element or elementId, 'octocard' as default
 *              element: 'octocard',
 *              // [optional][string]
 *              // module names, default is
 *              // 'base,details,stats,repos,eventsStatis,orgs'
 *              modules: 'base',
 *              // [optional][number]number of organizations to show
 *              // '-1' as default, show all organizations
 *              orgsNum: -1,
 *              // [optional][number]number of repos to show
 *              // '3' as default
 *              reposNum: 3,
 *              // [optional][string]url of jsonp api
 *              // 'http://octocard.info/api' as default
 *              api: 'http://your-octocard.com/api',
 *              // [optional][boolean]show footer or not
 *              // 'false' as default
 *              noFooter: false
 *          }
 */
Octocard.prototype.reload = function (config) {
    if (this.element) {
        // loaded before
        this.element.innerHTML = '';
    }

    config = config || OCTOCARD || {};
    this.config = config;

    config.api = config.api || 'http://octocard.info/api';

    // setup element & elementId
    this.element = config.element || 'octocard';
    if (typeof this.element === 'string') {
        this.elementId = this.element;
        this.element = document.getElementById(this.element);
    } else {
        if (this.element.id) {
            this.elementId = this.element.id;
        } else {
            this.elementId = 'octocard' + new Date().getTime();
        }
    }

    // setup style
    if (typeof THEME_CSS === 'undefined') {
        throw new Error('Theme css not found!');
    }
    var style = this.createStyle(THEME_CSS);
    this.element.appendChild(style);

    // setup username & type
    this.username = config.name || 'github';
    // this.type = config.type || 'user';

    // setup modules
    var moduleNames = config.modules ||
        'base,details,stats,repos,eventsStatis,orgs';
    moduleNames = moduleNames.split(',');
    moduleNames.push('footer');
    this.setupModules(moduleNames);
};

/**
 * Show load error message.
 *
 * @param {Array.<string>} moduleNames module names.
 */
Octocard.prototype._showErrorMsg = function (msg, moduleNames) {
    var errorRoot = document.createElement('div');
    errorRoot.className = 'octocard-error';
    errorRoot.innerHTML = msg;
    var reloadLink = document.createElement('a');
    reloadLink.href = 'javascript:void(0)';
    reloadLink.innerHTML = 'Refresh';
    var that = this;
    util.bind(reloadLink, 'click', function() {
        that.element.removeChild(errorRoot);
        that.setupModules(moduleNames);
    });
    errorRoot.appendChild(reloadLink);
    this.element.appendChild(errorRoot);
};

/**
 * load module.
 *
 * @param {string} name module name.
 * @param {Function} callback .
 */
Octocard.prototype.loadModule = function (name, callback) {
    var m = modules.get(name);
    if (m) {
        m(this, callback);
    }
};

/**
 * append module html.
 *
 * @param {string} name module name.
 * @param {string} html html string.
 */
Octocard.prototype.appendModHTML = function (name, html) {
    var modRoot = document.createElement('div');
    modRoot.className = 'octocard-m octocard-m-' + name;
    modRoot.innerHTML = html;
    this.element.appendChild(modRoot);

    return modRoot;
};

/**
 * create CSS style, and replace '#{id}' to elementId.
 *
 * @param {string} css css text.
 * @return {Element} style element.
 */
Octocard.prototype.createStyle = function (css) {
    return util.createStyle(
        util.format(css, '#root-id', '#' + this.elementId)
    );
};

/**
 * setup modules.
 *
 * @param {Array.<string>} moduleNames .
 */
Octocard.prototype.setupModules = function (moduleNames, callback) {
    var that = this;
    var l = loader(this.element);

    // load basic info and modules
    util.jsonp(
        this.config.api
            + '?mods=' + moduleNames.join(',')
            + '&login=' + this.username,
        // success
        function (data) {
            that.data = data;

            // start loading modules in turn
            var i = 0;
            var length = moduleNames.length;
            function startLoadModule() {
                that.loadModule(moduleNames[i], function () {
                    i++;
                    if (i < length) {
                        startLoadModule();
                    } else {
                        l.end();
                        if (callback) {
                            callback();
                        }
                    }
                });
            }
            startLoadModule();
        },
        // error
        function (msg) {
            l.end();
            that._showErrorMsg(msg, moduleNames);
        }
    );
};

window.octocard = new Octocard();






