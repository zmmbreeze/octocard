/*jshint laxbreak:true */

/**
 * eventsStatis module.
 *
 * @param {Octocard} card .
 * @param {Function} callback .
 */
var eventsStatisModule = function (card, callback) {
    var data = card.data.eventsStatis;

    // if input user has no Organization,
    // don't show this module
    if (data.length === 0) {
        callback();
        return;
    }

    var d;

    // organize data
    var maxCounter = 0;
    var i = data.length - 1;
    var result = [];
    var date;
    var nextDate;
    for (; i >= 0; i--) {
        d = data[i];
        maxCounter = Math.max(maxCounter, d.counter);
        result.push(d);

        if (i === 0) {
            break;
        }

        date = util.resetTime(new Date(d.date));
        // 24 * 3600 * 1000 = 86400000
        date = new Date(86400000 + date.getTime());
        nextDate = util.resetTime(new Date(data[i - 1].date));
        while (date < nextDate) {
            result.push({
                date: date,
                counter: 0
            });
            date = new Date(86400000 + date.getTime());
        }
    }

    // generate event statistic map
    var html = '';
    i = 0;
    var l = result.length;
    var width = 100 / l;
    for (; i < l; i++) {
        d = result[i];
        html += util.format(eventsStatisModule.MOD_BAR_HTML, {
            date: new Date(d.date).toDateString(),
            counter: d.counter,
            width: width,
            height: (Math.max(1, d.counter) / maxCounter) * 100,
            visibility: d.counter ? 'visible' : 'hidden'
        });
    }

    // rend all
    card.appendModHTML(
        'eventsStatis',
        util.format(eventsStatisModule.MOD_HTML, {
            map: html,
            startDate: new Date(data[data.length - 1].date).toDateString(),
            endDate: new Date(data[0].date).toDateString()
        })
    );
    callback();
};

eventsStatisModule.MOD_HTML = ''
    + '<h2>Events statistic</h2>'
    + '<div class="octocard-m-eventsStatis-bd">#{map}</div>'
    + '<div class="octocard-m-eventsStatis-date">'
    +     '<span class="octocard-m-eventsStatis-date-start">'
    +         '#{startDate}'
    +     '</span>'
    +     '<span class="octocard-m-eventsStatis-date-end">'
    +         '#{endDate}'
    +     '</span>'
    + '</div>';
eventsStatisModule.MOD_BAR_HTML = ''
    + '<a href="javascript:void(0);" style="width:#{width}%;">'
    +     '<div style="height:#{height}%;visibility:#{visibility};">'
    +         '#{date} - #{counter}'
    +     '</div>'
    + '</a>';

modules.add('eventsStatis', eventsStatisModule);



