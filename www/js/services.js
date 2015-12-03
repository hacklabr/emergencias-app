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
            return data;
        }
    );

    this.indexed_speakers = this.speakers.then(
        function(speakers_data) {
            return Util.index_obj(speakers_data);
        }
    );

    this.get = function(speaker_id) {
        return this.speakers.then(
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
})

app.service('Event', function($http, $q, GlobalConfiguration, Speaker, Space, Util) {

    var language = 'pb';
    this.url = GlobalConfiguration.BASE_URL + '/events-' + language + '.json';
    this.events = $http.get(this.url, {cache : true}).then(function(events_data) {
        return events_data.data;
    });

    var week = [ '2ª feira',
		 '3ª feira',
		 '4ª feira',
		 '5ª feira',
		 '6ª feira',
		 'Sábado',
		 'Domingo' ]

    var format_date = function(date) {
	date = new Date(date)
	console.log(date)
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
		event_data.date = format_date(event_data.startsOn)
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
})

app.factory('Emergencias', function($http, GlobalConfiguration, $cordovaFile, $ionicPlatform, MeuPercurso, $q, $cacheFactory) {
    var conf = {
        assets : "/assets/old/",
        spaces_data : {
            file: "spaces.json"
        },
        spaces: {
            file: "spaces-order.json"
        },
        events: {
            file: "events.json"
        }
    };
    var spaces = [];
    var spaces_data = [];
    var events = [];

    function getSpaces(){
        var $httpCache = $cacheFactory.get('$http');
        var deferred = $q.defer();

        spaces = $httpCache.get(conf.spaces.url);
        if(!spaces){
            console.log("not using cache");
            $http.get(conf.spaces.url, {cache : true})
            .then(function(res){
                // return Lazy(res.data);
                console.log(res);
                deferred.resolve(Lazy(res.data));
            });
        } else {
            deferred.resolve(spaces);
        }
        console.log(deferred.promise);
        spaces = deferred.promise;
    }

    function getSpacesData(){
        spaces_data = $http.get(conf.spaces_data.url, {cache : true})
        .then(function(res){
            return Lazy(res.data);
        });
    }

    function getEvents(){
        events = $http.get(conf.events.url, {cache :  true})
        .then(function(res){
            return Lazy(res.data);
        });
    }

    // FIXME Change md5 file get data
    var data_source = $http.get("assets/new/objects-md5.json")
    .then(function(newMD5){
        return $http.get("assets/objects-md5.json").then(function(oldMD5){
            $ionicPlatform.ready(function(){
                if(newMD5.data[conf.spaces.file]
                        !== oldMD5.data[conf.spaces.file]
                    || newMD5.data[conf.spaces_data.file]
                        !== oldMD5.data[conf.spaces_data.file]
                    || newMD5.data[conf.events.file]
                    !== oldMD5.data[conf.events.file] ){

                        // if(typeof cordova !== 'undefined'){
                        // $cordovaFile.checkDir(cordova.file.dataDirectory,
                        //                       "objects1")
                        // .then(function(data){
                        // console.log(JSON.stringify(data));
                        // }, function (error) {
                        // console.log(JSON.stringify(error));
                        // });
                        // }

                }
            });


            conf.spaces.url = newMD5.data[conf.spaces.file] === oldMD5.data[conf.spaces.file] ?
                conf.assets + conf.spaces.file :
                GlobalConfiguration.BASE_URL + "/" + conf.spaces.file + "?v=" + newMD5.data[conf.spaces.file];
            getSpaces();

            conf.events.url = newMD5.data[conf.events.file] === oldMD5.data[conf.events.file] ?
                conf.assets + conf.events.file :
                GlobalConfiguration.BASE_URL + "/" + conf.events.file + "?v=" + newMD5.data[conf.events.file];
            getEvents();

            conf.spaces_data.url = newMD5.data[conf.spaces_data.file] ===
                oldMD5.data[conf.spaces_data.file] ?
                conf.assets + conf.spaces_data.file :
                GlobalConfiguration.BASE_URL + "/" + conf.spaces_data.file + "?v=" + newMD5.data[conf.spaces_data.file];
            getSpacesData();

            return {spaces : spaces, events: events, spaces_data: spaces_data};
        }).catch(function(){
            conf.spaces.url = GlobalConfiguration.BASE_URL + "/" + conf.spaces.file + "?v="
            + newMD5.data[conf.spaces.file];
            getSpaces();

            conf.events.url = GlobalConfiguration.BASE_URL + "/" + conf.events.file + "?v="
            + newMD5.data[conf.events.file];
            getEvents();

            conf.spaces_data.url = GlobalConfiguration.BASE_URL + "/" + conf.spaces_data.file
            + "?v=" + newMD5.data[conf.spaces_data.file];
            getSpacesData();

            return {spaces : spaces, events: events, spaces_data: spaces_data};
        });
    }).catch(function(data, status, header, config){
        // FIXME change md5 file get data
        return $http.get("assets/objects-md5.json").then(function(oldMD5){
            conf.spaces.url = conf.assets + conf.spaces.file;
            getSpaces();
            conf.events.url = conf.assets + conf.events.file;
            getEvents();
            conf.spaces_data.url = conf.assets + conf.spaces_data.file;
            getSpacesData();

            return {spaces : spaces, events: events, spaces_data: spaces_data};
        }).catch(function(){
            console.log("No new file, no old file, first run?");
            return {spaces: Lazy(spaces), events: Lazy(events), spaces_data: Lazy(spaces_data)};
        });
    });


    return {
	tracks: function() {
	    var url = GlobalConfiguration.BASE_URL + '/tracks.json';
	    return $http.get(url)
	},

        spaces: function() {
            return data_source.then(function(data){
                console.log(data);
                return data.spaces;
            });
        },

        get: function(event_id) {
            return data_source.then(function(data){
                return data.events.then(function(events){
                    return data.spaces_data.then(function(data){
                        data = Lazy(data);
                        var event = events.findWhere({
                            id : parseInt(event_id)
                        });
                        event.space = data.findWhere({
                            id : parseInt(event.spaceId)
                        });
                        return event;
                    });
                });
            });
        },
        getPlaces: function(){
            return data_source.then(function(data){
                return data.spaces_data.then(function(spaces){
                    return spaces;
                });
            });
        },
        getPlaceEvents: function(place_id) {
            return data_source.then(function(data){
                return data.spaces_data.then(function(spaces){
                    var space = spaces.findWhere({
                        id : parseInt(place_id)
                    });
                    return data.events.then(function(events){
                        var time = Date.now();
                        space.events = events.where({
                            spaceId : parseInt(place_id)
                        }).filter(function(ev){
                            // TODO Show only events in the future
                            // Here is just the basic idea!
                            stOn = new Date(ev.startsOn).getTime();
                            // FIXME Its to be greater than
                            // return stOn >= time;
                            return true;
                        }).toArray();
                        return space;
                    });
                });
            });
        }
    };
});
