app = angular.module('emergencias.services', []);

app.service('Util', function() {
    this.index_obj = function(obj_list) {
        var indexed_obj = {};
        obj_list.forEach(function(obj) {
            indexed_obj[obj.id] = obj;
        });
        return indexed_obj;
    }
})

app.service('Cache', function($http, $q, GlobalConfiguration, $localStorage, Util) {
    var self = this;

    this.store = function(data, checksum) {
	$localStorage.cachedChecksum = checksum;
	$localStorage.cachedData = data;
	$localStorage.cachedIndex = {
	    'spaces': Util.index_obj(data.spaces),
	    'speakers': Util.index_obj(data.speakers),
	    'meetings': Util.index_obj(data.meetings),
	    'territories': Util.index_obj(data.territories),
	    'events': Util.index_obj(data.events)
	}
    }

    if (true || !$localStorage.cachedData) {
	console.log('storing initial data')
	self.store(INITIAL_DATA, INITIAL_CHECKSUM);
    }

    this.getIndex = function(name) {
	return $q.when($localStorage.cachedIndex[name]);
    }
    this.getCached = function(name) {
	return $q.when($localStorage.cachedData[name])
    }
    this.getNew = function(name) {
	var url = GlobalConfiguration.BASE_URL + '/data-pb.md5';
	return $http.get(url, {cache : false}).then(function(data) {
	    var checksum = data.data
	    if ($localStorage.cachedChecksum == checksum)
		return null;
	    url = GlobalConfiguration.BASE_URL + '/data-pb.json';
	    return $http.get(url, {cache: false}).then(function(data) {
		self.store(data.data, checksum)
		return data.data[name];
	    });
	});
    }
    this.get = function(name) {
	return self.getNew(name).then(function(data) {
	    return $localStorage.cachedData[name]
	})
    }
})

app.service('Space', function($http, GlobalConfiguration, Cache) {
    this.indexed_spaces = Cache.getIndex('spaces')
})

app.service('Speaker', function($http, GlobalConfiguration, Cache) {
    this.indexed_speakers = Cache.getIndex('speakers')
})

app.service('Meeting', function($q, $http, GlobalConfiguration, Cache) {
    var self = this;
    this.cached = Cache.getCached('meetings').then(function(data) {
	return data;
    })
    this.renew = Cache.getNew('meetings').then(function(data) {
	return data
    })
    this.indexed_meetings = Cache.getIndex('meetings')
    this.get = function(id) {
	return self.indexed_meetings.then(function(index) {
	    return index[id]
	})
    }

})

app.service('Territory', function($http, GlobalConfiguration, Cache) {
    var self = this;
    this.cached = Cache.getCached('territories').then(function(data) {
	return data;
    })
    this.renew = Cache.getNew('territories').then(function(data) {
	return data
    })
    this.indexed_territories = Cache.getIndex('territories')
    this.get = function(id) {
	return self.indexed_territories.then(function(index) {
	    return index[id]
	})
    }
})

app.service('Event', function($q, $http, GlobalConfiguration, Speaker, Space, Cache) {
    var self = this;

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

    this.events = Cache.getCached('events')

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
                event_data.speakers = speakers;
                event_data.space = indexed_spaces[parseInt(event_data.spaceId)];
                event_data.date = format_date(event_data.startsOn);
                new_events_data.push(event_data);
            });
            return new_events_data;
        }
    );

    this.indexed_events = Cache.getIndex('events')
    this.get = function(id) {
	return self.indexed_events.then(function(index) {
	    return index[id]
	})
    }
    
});

app.service('Notifications', function($http, $localStorage, $ionicPush) {

    var self = this;

    if (!$localStorage.messages) {
	$localStorage.messages = [];
	$localStorage.unread = 0;
    }

    this.messages = $localStorage.messages;
    this.unread = $localStorage.unread;
    this.count = this.messages.length

    this.commit = function() {
	$localStorage.messages = self.messages;
	$localStorage.unread = self.unread;
    }

    this.notify = function(message) {
	self.unread += 1;
	self.messages.unshift(message);
	self.count = self.messages.length;

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

