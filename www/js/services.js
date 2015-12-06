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
    var timeout = 5;
    this.store = function(data, checksum) {
	$localStorage.cachedChecksum = checksum;
	$localStorage.cachedData = data;
	$localStorage.cachedIndex = {
	    'meetings': Util.index_obj(data.meetings),
	    'territories': Util.index_obj(data.territories),
	    'events': Util.index_obj(data.events)
	}
	$localStorage.lastUpdate = new Date().getTime()
    }

    if (!$localStorage.cachedData) {
	self.store(INITIAL_DATA, INITIAL_CHECKSUM);
    }

    this.getIndex = function(name) {
	return $q.when($localStorage.cachedIndex[name]);
    }
    this.getCached = function(name) {
	return $q.when($localStorage.cachedData[name]);
    }
    this.getNew = function(name) {
	var diff = new Date().getTime() - $localStorage.lastUpdate
	if (diff  < timeout) {
	    return $q.when(null);
	}
	var url = GlobalConfiguration.BASE_URL + '/data-pb.md5?'+name;
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
	    return $localStorage.cachedData[name];
	})
    }
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

app.service('Event', function($q, $http, GlobalConfiguration, Cache) {
    var self = this;
    this.cached = Cache.getCached('events').then(function(data) {
	return data;
    })
    this.renew = Cache.getNew('events').then(function(data) {
	return data
    })
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

