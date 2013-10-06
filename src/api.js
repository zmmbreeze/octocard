/*jshint laxbreak:true */

var api = {
    prefix: 'https://api.github.com/',
    /**
     * Get user info.
     *
     * @param {string} username .
     * @param {Function} success success callback.
     * @param {Function} failed failed callback.
     */
    getBasicInfo: function (username, success, failed) {
        util.jsonp(
            api.prefix + 'users/' + encodeURI(username),
            function (data) {
                data = data.data;
                success(data);
            },
            failed
        );
    },
    /**
     * Get events after a specify time.
     *
     * @param {string} eventUrl .
     * @param {Date} startDate .
     * @param {Function} success .
     * @param {Function} transform change input event date to other format.
     * @param {Function} failed .
     */
    getContributeEvents: function (eventUrl, startDate, success, transform, failed) {
        // Contribute event types
        var eventTypes = {
            'IssuesEvent': 1,
            'PublicEvent': 1,
            'PullRequestEvent': 1,
            'PushEvent': 1
        };
        // Contribute events
        var events = [];

        function getEvents(url) {
            util.jsonp(url, function (data) {
                var d = data.data;
                var time;
                for (var i = 0, l = d.length; i < l; i++) {
                    time = new Date(d[i].created_at);
                    if (time < startDate) {
                        // end of date
                        success(events);
                        return;
                    } else if (eventTypes[d[i].type]) {
                        // if it's contribute event
                        // then save it.
                        events.push(transform(d[i], time));
                    }
                }

                var nextUrl = util.getUrls(data).next;
                if (nextUrl) {
                    // go next request
                    getEvents(nextUrl);
                } else {
                    // no further events
                    success(events);
                }
            }, failed);
        }

        getEvents(eventUrl);
    }
};
