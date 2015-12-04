app = angular.module('emergencias.services', []);

var format_description = function(desc) {
    var ps = desc.split(/\n+/);
    var desc = ''
    for (var i=0; i<ps.length; i++) {
	desc += '<p>' + ps[i] + '</p>'
    }
    return desc;
}

app.service('Util', function() {
    this.index_obj = function(obj_list) {
        var indexed_obj = {};
        obj_list.forEach(function(obj) {
            indexed_obj[obj.id] = obj;
        });
        return indexed_obj;
    }
})

app.service('Space', function($http, GlobalConfiguration, Util) {

    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/spaces-' + language + '.json';
    this.spaces = $http.get(this.url, {cache : true});

    this.all = this.spaces.then(function(data) {
            return data.data;
        }
    );

    this.indexed_spaces = this.spaces.then(
        function(spaces_data) {
            return Util.index_obj(spaces_data.data);
        }
    )
})

app.service('Speaker', function($http, GlobalConfiguration, Util) {

    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/speakers-' + language + '.json';

    this.speakers = $http.get(this.url, {cache : true}).then(function(speakers_data) {
        return speakers_data.data;
    });

    this.all = this.speakers.then(function(data) {
        new_data = [];
        data.forEach(function(data, i){
            data.description = format_description(data.description);
            new_data.push(data);
        });
        return new_data;
    });

    this.indexed_speakers = this.speakers.then(
        function(speakers_data) {
            return Util.index_obj(speakers_data);
        }
    );

    this.get = function(speaker_id) {
        return this.indexed_speakers.then(
            function(indexed_speakers){
                return indexed_speakers[speaker_id]
            }
        );
    };
})

app.service('Meeting', function($http, GlobalConfiguration, Util) {
    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/meetings-' + language + '.json';

    this.meetings = $http.get(this.url, {cache : true}).then(function(meetings_data) {
        return meetings_data.data;
    });

    this.all = this.meetings.then(function(meetings_data) {
            return meetings_data;
        }
    );

    this.indexed_meetings = this.meetings.then(
        function(data) {
            return Util.index_obj(data);
        }
    );

    this.get = function(meeting_id) {
        return this.indexed_meetings.then(
            function(indexed_meetings) {
                return indexed_meetings[meeting_id];
            }
        );
    };
})

app.service('Territory', function($http, GlobalConfiguration, Util) {
    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/territories-' + language + '.json';

    this.territories = $http.get(this.url, {cache : true}).then(function(territories_data) {
        return territories_data.data;
    });

    this.all = this.territories.then(function(data) {
            return data;
        }
    );

    this.indexed_territories = this.territories.then(
        function(data) {
            return Util.index_obj(data);
        }
    );

    this.get = function(territory_id) {
        return this.indexed_territories.then(
            function(indexed_territories) {
                return indexed_territories[territory_id];
            }
        );
    };
})

app.service('Event', function($http, $q, GlobalConfiguration, Speaker, Space, Util) {

    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/events-' + language + '.json';
    this.events = $http.get(this.url, {cache : true}).then(function(events_data) {
        return events_data.data;
    });

    var week = [ 'Domingo',
		 '2ª feira',
                 '3ª feira',
                 '4ª feira',
                 '5ª feira',
                 '6ª feira',
                 'Sábado',
                 'Domingo' ]

    var format_date = function(date) {
    date = new Date(date)
    return date.getDate() + '/' + (date.getMonth()+1) + ' - ' + week[date.getDay()]
    }

    this.all = $q.all([this.events, Speaker.indexed_speakers, Space.indexed_spaces]).then(
        function(data) {
            events_data = data[0];
            indexed_speakers = data[1];
            indexed_spaces = data[2];
            new_events_data = [];
            events_data.forEach(function(event_data, i){
                speakers = [];
                event_data.speakers.forEach(function(speaker_id) {
                    speakers.push(indexed_speakers[parseInt(speaker_id)]);
                });
                event_data.space = indexed_spaces[parseInt(event_data.spaceId)];
                event_data.speakers = speakers;
                event_data.types = event_data.terms.types;
                event_data.meetings = event_data.terms.meetings;
                event_data.territories = event_data.terms.territories;
                event_data.date = format_date(event_data.startsOn);
                event_data.description = format_description(event_data.description);
                // indexed_events[event_data.id] = event_data;
                new_events_data.push(event_data);
            });
            return new_events_data;
        }
    );

    this.indexed_events = this.all.then(
        function(events_data) {
            return Util.index_obj(events_data);
        }
    );
    //
    this.get = function(event_id) {
        return this.indexed_events.then(
            function(indexed_events){
                return indexed_events[event_id]
            }
        );
    };
});

app.service('Notifications', function($http, $localStorage, $ionicPush) {

    var self = this;

    if (!$localStorage.messages) {
	$localStorage.messages = [];
	$localStorage.unread = 0;
    }

    this.messages = $localStorage.messages;
    this.unread = $localStorage.unread;

    this.commit = function() {
	$localStorage.messages = self.messages;
	$localStorage.unread = self.unread;
    }

    this.notify = function(message) {
	self.unread += 1;
	self.messages.unshift(message);

	self.commit();
    }

    this.getMessages = function() {
	return self.messages;
    }

    this.readAll = function(){
	self.unread = 0
	self.commit();
    }

    $ionicPush.init({
	"onNotification": function(notification) {
	    var message = {
		title: notification.title,
		message: notification.text
	    }
	    self.notify(message);
	}
    })


})

