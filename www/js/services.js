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
	$localStorage.apiVersion = API_VERSION;
	$localStorage.cachedChecksum = checksum;
	$localStorage.cachedData = data;
	$localStorage.cachedIndex = {
	    'meetings': Util.index_obj(data.meetings),
	    'territories': Util.index_obj(data.territories),
	    'events': Util.index_obj(data.events)
	}
	$localStorage.lastUpdate = new Date().getTime()
    }

    if (!$localStorage.apiVersion || $localStorage.apiVersion < API_VERSION) {
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

app.service('Notifications', function($http, $localStorage) {

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

    this.init = function(){

        Ionic.io();

        var push_register_callback = function(pushToken) {
          console.log('Registered token:', pushToken.token);
          user.addPushToken(pushToken);
          user.save(); // you NEED to call a save after you add the token
      };

        var push_config = {
            "debug": true,
            canShowAlert: true, //Can pushes show an alert on your screen?
            canSetBadge: true, //Can pushes update app icon badges?
            canPlaySound: true, //Can notifications play a sound?
            canRunActionsOnWake: true, //Can run actions outside the app,
            // android: {
            //     icon: 'icon'
            // },
            "onNotification": function(notification) {

                var message = {};
                message.message = notification.text;
                if (notification.title === 'emergencias-app') {
                    if (notification.payload && notification.payload.title) {
                        message.title = notification.payload.title;
                        notification.title = notification.payload.title;
                    } else {
                        notification.title = '';
                    }
                } else {
                    message.title = notification.title;
                }
                // notification.image = ''
                self.notify(message);
                return notification;
            },
            "onRegister": push_register_callback
        };
        var push = new Ionic.Push(push_config);
        // FIXME: the above method should be used
        // $ionicPush.init(push_config);

        var user = Ionic.User.current();
        // this will give you a fresh user or the previously saved 'current user'
        // var user = $ionicUser.current();
        // if the user doesn't have an id, you'll need to give it one.
        if (!user.id) {
            user.id = Ionic.User.anonymousId();
        }

        // Identify your user with the Ionic User Service
        user.save();

        push.register(push_register_callback);
        // $ionicPush.register(push_config);
    };
})
