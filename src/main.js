/*jshint laxbreak:true, scripturl:true */

/**
 * Github card
 *
 * @constructor
 * @param {Object=} config
 */
var Octocard = function (config) {
    this.reload(config);
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

    config = config || {};
    this.config = config;

    config.api = config.api || 'http://octocard.info/api';

    // setup element & elementId
    this.element = config.element || 'octocard';
    if (typeof this.element === 'string') {
        this.elementId = this.element;
        this.element = document.getElementById(this.element);
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.id = this.elementId;
            lastScript.parentNode.insertBefore(this.element, lastScript);
        }
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
    this.username = config.name;
    // this.type = config.type || 'user';

    // setup modules
    var moduleNames = config.modules ||
        'base,details,stats,repos,eventsStatis,orgs';
    moduleNames = moduleNames.split(',');
    moduleNames.unshift('footer');
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

/**
 * create octocard instance
 *
 * @param {Object} config .
 */
window.octocard = function (config) {
    return new Octocard(config);
};

// autorun Octocard
var autorunConfig;
if (typeof OCTOCARD === 'object') {
    // use `OCTOCARD`
    autorunConfig = OCTOCARD;
} else {
    // get config from script tag
    // eg:
    //   <script
    //     data-name="zmmbreeze"
    //     data-modules="base,stats,repos,orgs,eventsStatis"
    //     data-reposNum="3"
    //     data-orgsNum="2"
    //     data-element="OCTOCARD"
    //     data-api="http://127.0.0.1:8080/api"
    //     data-noFooter="false"
    //     src="src/octocard.js"></script>
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length - 1];
    if (!lastScript) {
        return;
    }
    autorunConfig = {
        name: '',
        modules: '',
        reposNum: '',
        orgsNum: '',
        element: '',
        api: '',
        noFooter: false
    };
    for (var key in autorunConfig) {
        autorunConfig[key] = lastScript.getAttribute('data-' + key);
    }
}

if (autorunConfig.name) {
    // `name` is required as config
    new Octocard(autorunConfig);
}






