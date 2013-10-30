/*jshint laxbreak:true */

var dateReg = /(\d{4})-(\d{2})-(\d{2})T/;
var util = {
    /**
     * Insert css text.
     *
     * @param {string} css css style text.
     * @return {Element} style element.
     */
    createStyle: function (css) {
        var style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            // IE
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        return style;
    },

    /**
     * format
     *      util.format('hello #{v}', 'world');
     *      util.format('hello #{a}, I like #{b}', {a: 'world', b: 'book'});
     *
     * @param {string} tmpl template text.
     * @param {string|Object} _key key or object.
     * @param {string} _value value.
     */
    format: function (tmpl, _key, _val) {
        if (!_key) {
            return tmpl;
        }
        var val;

        if (typeof _key !== 'object') {
            var key = _val ? _key : '#{v}';
            val = _val || _key;
            return tmpl.replace(new RegExp(key, 'g'), ('' + val));
        } else {
            var obj = _key;
            return tmpl.replace(_val || /#\{([^{}]+)\}/g, function(match, key) {
                val = obj[key];
                return (val !== undefined) ? ('' + val) : '';
            });
        }
    },

    cacheKey: 'githubcard-data',
    /**
     * Get JSONP call result cache.
     *
     * @param {string} url .
     * @return {Object} data.
     */
    getJSONPCache: function (url) {
        var value = localStorage.getItem(util.cacheKey);
        if (value) {
            value = JSON.parse(value);
            value = value[url.replace(
                /([?&])callback=[^$&]+(&?)/,
                function (str, $1) {
                    return $1;
                }
            )];
        }

        // not found
        if (!value) {
            return null;
        }

        // out of time
        var now = new Date();
        if (value.last <= now) {
            localStorage.removeItem(util.cacheKey);
            return null;
        }

        return value.data;
    },

    /**
     * Set JSONP cache.
     *
     * @param {string} url url string.
     * @param {Object} data .
     * @param {number} hour cache last `n` hour.
     */
    setJSONPCache: function (url, data, hour) {
        var value = localStorage.getItem(util.cacheKey);
        if (value) {
            value = JSON.parse(value);
        } else {
            value = {};
        }

        url = url.replace(
            /([?&])callback=[^$&]+(&?)/,
            function (str, $1) {
                return $1;
            }
        );
        value[url] = {
            last: util.getTime((-1 * hour) / 24).toString(),
            data: data
        };

        localStorage.setItem(util.cacheKey, JSON.stringify(value));
    },

    /**
     * jsonp
     *
     * @param {string} url .
     * @param {Function<Object>} success success callback.
     * @param {Function=} fail failed callback.
     */
    jsonp: function (url, success, fail) {
        /*
        // find cache
        var cache = util.getJSONPCache(url);
        if (cache) {
            success(cache);
            return;
        }
        */

        // no cache
        var script = document.createElement('script');
        var callbackName = 'githubcardjsonp' + (new Date().getTime());
        var timer;
        var timeout = 50000;
        var scriptLoaded = 0;
        var successed = false;

        // create script
        var re = url.match(/[?&]callback=([^$&]+)/);
        if (re) {
            // callback exist
            script.src = url.replace(/([?&]callback=)[^$&]+/, '$1' + callbackName);
        } else {
            // append url
            script.src = url
                + (url.indexOf('?') === -1 ? '?' : '&')
                + 'callback=' + callbackName;
        }
        script.type = 'text/javascript';
        script.charset = 'UTF-8';

        // jsonp callback
        window[callbackName] = function (data) {
            if (!data.success) {
                fail(data.message);
                successed = true;
                return;
            }
            successed = true;
            // util.setJSONPCache(url, data, 0.5);
            success(data.data);
            window[callbackName] = null;
        };

        // call fail function and clear script
        var callFail = function () {
            if (!successed && fail) {
                 fail('Server or network error.');
            }
            script.onload = script.onreadystatechange = null;
            document.body.removeChild(script);
        };

        // IE/opera support onreadystatechange
        // safari/chrome/opera support onload
        script.onload = script.onreadystatechange = function () {
            // for opera
            if (scriptLoaded) {
                return;
            }

            var readyState = script.readyState;
            if ('undefined' == typeof readyState ||
                readyState == 'loaded' ||
                readyState == 'complete') {

                scriptLoaded = 1;
                callFail();
                clearTimeout(timer);
            }
        };

        // timer
        timer = setTimeout(function () {
            callFail();
            // make it not report error
            // when callback fire too late
            window[callbackName] = function () {};
        }, timeout);

        document.body.appendChild(script);
    },
    /**
     * bind event
     *
     * @param {Element} element .
     * @param {string} event .
     * @param {Function} callback .
     */
    bind: function (element, event, callback) {
        if (element.addEventListener) {
            element.addEventListener(event, callback, false);
        } else {
            element.attachEvent('on' + event, callback);
        }
    },
    /**
     * reset time part of a date.
     *
     * @param {Date} date .
     * @return {Date} date.
     */
    resetTime: function (date) {
        date.setMilliseconds(0);
        date.setMinutes(0);
        date.setHours(0);
        date.setSeconds(0);
        return date;
    },
    /**
     * test same day.
     *
     * @param {Date} d1 date one.
     * @param {Date} d2 date two.
     * @return {boolean} is the same day.
     */
    isSameDay: function (d1, d2) {
        return d1.toDateString() === d2.toDateString();
    },
    /**
     * Get today, time is '00:00:00'
     *
     * @return {Date} today.
     */
    today: function () {
        return util.resetTime(new Date());
    },
    /**
     * next day, time is '00:00:00'
     *
     * @return {Date} next day.
     */
    nextDay: function (cur) {
        return new Date(cur.getTime() + 86400000);
    },
    /**
     * tomorrow, time is '00:00:00'
     *
     * @return {Date} tomorrow.
     */
    tomorrow: function () {
        return util.nextDay(util.today());
    },
    /**
     * time string to date
     *
     * @param {string} str time string.
     * @return {Date} date .
     */
    strToDate: function (str) {
        var r = str.match(dateReg);
        return new Date(r[1], r[2] - 1, r[3], 0, 0, 0, 0);
    },
    /**
     * time string to date string
     *
     * @param {string} str time string.
     * @return {string} date string .
     */
    strToDateStr: function (str) {
        var r = str.match(dateReg);
        return new Date(r[1], r[2] - 1, r[3], 0, 0, 0, 0).toDateString();
    }
};
