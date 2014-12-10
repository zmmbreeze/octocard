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
 *              // [optional][string]specify the theme name to be used
 *              // 'default' as default
 *              theme: "azzura",
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
 *              // 'http://octocard.in/api' as default
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
    var that = this;
    if (that.host) {
        // loaded before
        that.host.innerHTML = '';
    }

    config = config || {};
    that.config = config;

    config.api = config.api || 'http://octocard.in/api';

    // setup element & elementId
    that.element = config.element || 'octocard';
    if (typeof that.element === 'string') {
        that.elementId = that.element;
        that.element = document.getElementById(that.element);
        if (!that.element) {
            that.element = document.createElement('div');
            that.element.id = that.elementId;
            lastScript.parentNode.insertBefore(that.element, lastScript);
        }
    } else {
        if (that.element.id) {
            that.elementId = that.element.id;
        } else {
            that.elementId = 'octocard' + new Date().getTime();
            that.element.id = that.elementId;
        }
    }

    that.host = that.element;
    // create isolated container if needed
    if (!config.noIsolated || config.noIsolated === 'false') {
        that._createContainer();
    }

    that._bindSizeClass();

    // setup style
    var themeName = config.theme;
    that.createStyle(themeName, function (styleElement) {
        that.element.appendChild(styleElement);

        // setup username & type
        that.username = config.name;
        // that.type = config.type || 'user';

        // setup modules
        var moduleNames = config.modules ||
            'base,details,stats,repos,eventsStatis,orgs';
        moduleNames = moduleNames.split(',');
        moduleNames.unshift('footer');
        that.setupModules(moduleNames);
    });

};

/**
 * Show load error message.
 *
 * @param {Array.<string>=} moduleNames module names.
 */
Octocard.prototype._showErrorMsg = function (msg, moduleNames) {
    var errorRoot = document.createElement('div');
    errorRoot.className = 'octocard-error';
    errorRoot.innerHTML = msg;

    if (moduleNames) {
        var that = this;
        var reloadLink = document.createElement('a');
        reloadLink.href = 'javascript:void(0)';
        reloadLink.innerHTML = 'Refresh';
        util.bind(reloadLink, 'click', function () {
            that.element.removeChild(errorRoot);
            that._updateContainer();
            that.setupModules(moduleNames);
        });
        errorRoot.appendChild(reloadLink);
    }

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
 * @param {string} themeName name of theme.
 * @param {function(Element)} complete
 * @return {Element} style element.
 */
Octocard.prototype.createStyle = function (themeName, complete) {
    var that = this;
    util.jsonp(
        that.config.api
            + '?dataType=theme'
            + '&name=' + (themeName || ''),
        function (data) {
            var styleElement = util.createStyle(
                util.format(data.css, '#root-id', '#' + that.elementId)
            );
            complete(styleElement);
        },
        function (msg) {
            that._showErrorMsg(msg);
        }
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

    if (that.config.data) {
        load(that.config.data);
        return;
    }

    // loading
    var l = loader(this.element);
    that._updateContainer();

    // load basic info and modules
    util.jsonp(
        this.config.api
            + '?mods=' + moduleNames.join(',')
            + '&login=' + this.username,
        load,
        // error
        function (msg) {
            if (l) {
                l.end();
            }
            that._showErrorMsg(msg, moduleNames);
        }
    );

    // success
    function load(data) {
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
                    if (l) {
                        l.end();
                    }
                    that._updateContainer();
                    if (callback) {
                        callback();
                    }
                }
            });
        }
        startLoadModule();
    }
};


/**
 * create isolated container
 */
Octocard.prototype._createContainer = function () {
    var trueRoot = document.createElement('div');
    // if using shadow dom, same id will cause bug on opera 18.0
    this.elementId += new Date().getTime();
    trueRoot.id = this.elementId;

    var shadowRoot = util.getShadowRoot(this.element);
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

/**
 * update container height and width
 */
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
 * Bind size class.
 */
Octocard.prototype._bindSizeClass = function () {
    var me = this;
    util.addSizeClass(me.host, me.element);

    if (me._binded) {
        return;
    }
    me._binded = true;

    var timeout;
    util.bind(window, 'resize', function resize() {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(function () {
            util.addSizeClass(me.host, me.element);
        }, 250);
    });
};

/**
 * create octocard instance
 *
 * @param {Object} config .
 */
window.octocard = function (config) {
    return new Octocard(config);
};

if (autorunConfig.name) {
    // `name` is required as config
    new Octocard(autorunConfig);
}






