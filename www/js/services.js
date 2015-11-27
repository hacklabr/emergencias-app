angular.module('viradapp.services', [])

.factory('Virada', function($http, GlobalConfiguration, $cordovaFile, $ionicPlatform, MinhaVirada, $q, $cacheFactory) {
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
        events: function() {
            return data_source.then(function(data){
                return data.events;
            });
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
        getPalcos: function(){
            return data_source.then(function(data){
                return data.spaces_data.then(function(spaces){
                    return spaces;
                });
            });
        },
        getPalcoEvents: function(palco_id) {
            return data_source.then(function(data){
                return data.spaces_data.then(function(spaces){
                    var space = spaces.findWhere({
                        id : parseInt(palco_id)
                    });
                    return data.events.then(function(events){
                        var time = Date.now();
                        space.events = events.where({
                            spaceId : parseInt(palco_id)
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
