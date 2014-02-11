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
 *              // 'Infinity' as default, show all organizations
 *              orgsNum: -1,
 *              // [optional][number]number of repos to show
 *              // '3' as default
 *              reposNum: 3,
 *              // [optional][number]repos which will not be shown
 *              // '' as default
 *              reposIgnored: 'reponame1,reponame2',
 *              // [optional][string]url of jsonp api
 *              // 'http://octocard.info/api' as default
 *              api: 'http://your-octocard.com/api',
 *              // [optional][boolean]show footer or not
 *              // 'false' as default
 *              noFooter: false,
 *              // [optional][boolean]
 *              // Use `shadowDom/iframe` to create isolate container or not
 *              // 'false' as default
 *              data-noIsolated="true"
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
            this.element.id = this.elementId;
        }
    }

    // create isolated container if needed
    if (!config.noIsolated || config.noIsolated === 'false') {
        this._createContainer();
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
    util.bind(reloadLink, 'click', function () {
        that.element.removeChild(errorRoot);
        that._updateContainer();
        that.setupModules(moduleNames);
    });
    errorRoot.appendChild(reloadLink);
    this.element.appendChild(errorRoot);
    this._updateContainer();
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
    // make sure className is lowercase, because of safari's bug
    // http://jsbin.com/yafog/3/edit
    modRoot.className = 'octocard-m octocard-m-' + name.toLowerCase();
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
 * @param {Function} callback .
 */
Octocard.prototype.setupModules = function (moduleNames, callback) {
    var that = this;
    var l = loader(this.element);
    that._updateContainer();

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
                        that._updateContainer();
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
 * create isolated container
 */
Octocard.prototype._createContainer = function () {
    var trueRoot = document.createElement('div');
    // if using shadow dom, same id will cause bug on opera 18.0
    this.elementId += new Date().getTime();
    trueRoot.id = this.elementId;

    var shadowRoot = util.createShadowRoot(this.element);
    if (shadowRoot) {
        // support shadow root
        shadowRoot.appendChild(trueRoot);
    } else {
        var iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;height:0;'
            + 'position:relative;top:0;left:0;right:0;bottom:0;'
            + 'display:block;padding:0;margin:0;border:none;';
        iframe.frameBorder = '0';
        this.element.appendChild(iframe);
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write('');
        doc.close();

        doc.body.style.cssText = 'overflow:hidden;margin:0;padding:0;';
        doc.body.appendChild(trueRoot);
        this.doc = doc;
        this.iframe = iframe;
    }

    this.isIsolated = true;
    this.element = trueRoot;
};

Octocard.prototype._updateContainer = function () {
    if (this.iframe) {
        var ua = navigator.userAgent;
        if((ua.match(/iPhone/i)) || (ua.match(/iPad/i))) {
            // Fixed iphone iframe bug
            // update container width
            var containerWidth = this.iframe.parentNode.offsetWidth;
            this.doc.body.style.width = containerWidth + 'px';
        }
        // update iframe height
        var h = util.getPageHeight(this.doc);
        this.iframe.style.height = h + 'px';
    }
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
    //     data-reposIgnored="reponame1,reponame2"
    //     data-orgsNum="2"
    //     data-element="OCTOCARD"
    //     data-api="http://127.0.0.1:8080/api"
    //     data-noIsolated="true"
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
        reposIgnored: '',
        orgsNum: '',
        element: '',
        api: '',
        noIsolated: false,
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






