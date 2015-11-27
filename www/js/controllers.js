angular.module('viradapp.controllers', [])
.controller('PalcoCtrl', function($rootScope, $scope, $stateParams, Virada, Conn){
    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'palco';
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.curr = false;
    });

    if($stateParams.palco){
        Virada.getPalcoEvents($stateParams.palco)
        .then(function(data){
            $rootScope.palco = data;
            $scope.space = data;
            $scope.spaceEvents = data.events;
        });
    } else {
        // none selected
    }
})

.controller('AtracaoCtrl', function($rootScope, $scope, $stateParams, Virada, MinhaVirada, Date, $ionicModal, $state){
    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'atracao';
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.curr = false;
    });

    $scope.view = {
        hasMore : false
    }

    $scope.LL = Date.LL;
    if($stateParams.atracao){
        Virada.get($stateParams.atracao)
        .then(function(data){
            $rootScope.atracao = data;
            $scope.atracao = data;
            $scope.space = data.space;
            if(data.allFriends){
                $scope.view.delta = data.allFriends.length - data.friends.length;
                $scope.view.hasMore = true;
            }
        });
    } else {
        $state.go("virada.programacao()")
    }

    $ionicModal.fromTemplateUrl('friends-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

})
.controller('ButtonsCtrl', function($scope, $ionicSideMenuDelegate, $rootScope, Virada, MinhaVirada, $ionicGesture){
    ionic.Platform.ready(function(){
        $ionicGesture.on('swiperight', function(){

        }, angular.element(document.querySelector("#menu-view")), {});


        $scope.$watch(function(){
            return $ionicSideMenuDelegate.isOpenLeft();
        }, function(isOpen){
            var leftMenu = angular.element(document.querySelector("#left-menu"));
            if(isOpen){
                leftMenu.removeClass('hidden');
            } else {
                leftMenu.addClass('hidden');
            }
            $rootScope.$emit("sidemenu_toggle", isOpen);
        });

        $scope.toggleLeftSideMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        }
    });
})
.controller('FilterCtrl', function($rootScope, $scope, $stateParams, $filter, Programacao, Virada, $ionicModal, $timeout, $ionicSideMenuDelegate, Date, Filter, ListState) {
    var config = {
        duration : Date.oneDay(),
        start: Date.start(),
        end: Date.end(),
        loads: 100,
        A: new ListState(),
        L: new ListState(),
        H: new ListState()
    };

    $rootScope.timeSlider = {
        range: {
            min: 0,
            max: 96
        },
        model:{
            min:0,
            max:96
        },
        time:{
            min: '18:00',
            max: '17:59'
        },

        reset: function(){
            var m = moment();
            if(moment() >= moment('2015-06-20 18:00') && moment() < moment('2015-06-21 18:00')){
                var now = moment().subtract('minutes', 15);
                $scope.timeSlider.model.min = parseInt(parseInt(now.diff(moment('2015-06-20 18:00')) / 1000) / 60 / 60 * 4);
            }else{
                $scope.timeSlider.model.min = 0;
            }
            $scope.timeSlider.model.max = 96;
        },

        translate: function(val, includeDay){
            var format = includeDay ? 'YYYY-MM-DD HH:mm' : 'HH:mm';
            if(val > 0){
                return moment('2015-06-20 18:00').add(val * 15, 'minutes').format(format);
            }else{
                return moment('2015-06-20 18:00').format(format);
            }
        },

        minTimestamp: function(){
            return moment($rootScope.timeSlider.translate($rootScope.timeSlider.model.min, true)).format('x');
        },

        maxTimestamp: function(){
            return moment($rootScope.timeSlider.translate($rootScope.timeSlider.model.max, true)).format('x');
        }

    };

    $rootScope.timeSlider.reset();


    var startTimeSetted = false;


    if(!startTimeSetted){
        if(moment() >= moment('2015-06-20 18:00') && moment() < moment('2015-06-21 18:00')){
            var now = moment().subtract('minutes', 15);
            $rootScope.timeSlider.model.min = parseInt(parseInt(now.diff(moment('2015-06-20 18:00')) / 1000) / 60 / 60 * 4);
        }
    }

    var spaces = Lazy([]);
    var events = Lazy([]);

    $scope.filters = new Filter(config.start, config.end);
    $rootScope.view = {
        sorted : 'L'
    };
    $rootScope.ledata = [];

    /**
     * Init data, once initialized we have the following structures:
     * spaces as a Lazy.js sequence
     * events as a Lazy.js sequence
     *
     */
    function init (){
        Virada.spaces().then(function(data){
            if(data.length() == 0) {
                $rootScope.view.sorted = 'A';
            }
            $rootScope.hasData = true;
            function setPosition (space){
                var position = {};
                if(typeof plugin !== 'undefined'){
                    position = new plugin.google.maps
                    .LatLng(space.data.location.latitude,
                            space.data.location.longitude);
                } else {
                    position = {
                        "lat" : space.data.location.latitude,
                        "lng" : space.data.location.longitude
                    }
                }
                space.map = {
                    "position" : position,
                    "title" : space.name,
                    visible: false
                };
            }
            Virada.getPalcos().then(function(spaces_data){
                var i = 0;
                var count = 0;
                var d = data.async(2).tap(function(space){
                    var spaceData = spaces_data.findWhere({
                        id : parseInt(space.id)
                    });

                    space.index = i;
                    space.data = spaceData;
                    if(typeof space.data !== 'undefined')
                        setPosition(space);
                    else
                        count++;
                    i++;
                }).toArray().onComplete(function(a){
                    $rootScope.lespaces = a;
                    spaces = Lazy(a);

                    Virada.events().then(function(data){
                        events = data;
                        if(data.length() == 0){ //Nothing to do!
                            $rootScope.hasData = false;
                            return;
                        }
                        sortBy($rootScope.view.sorted);
                    });

                    return Lazy(a);
                });

            });
        });
    }

    // First run! After that, all sequence processing is on
    // the loadMore and filterDate methods
    ionic.Platform.ready(function(){
        if($rootScope.ledata.length === 0) {
            init();
        }
    });

    function filtering(){
        console.log('filtering');

        var data = $filter('lefilter')(events, spaces, $scope.filters);
        config.A.filtered = data.sortBy(function(event){
            return event.name;
        });
        config.H.filtered = data.sortBy(function(event){
            return event.timestamp;
        });
        config.L.filtered = Lazy($filter('toSpaces')(data, spaces));
    }

    /**
     * Sorted by
     */


    function sortBy(sorted){
        switch (sorted){
            case "A":
                $scope.filters.sorted = "A";
                // $rootScope.ledata = config.A.filtered.toArray();
                if(config.A.data.length > 0){
                    $rootScope.ledata = config.A.data;
                } else {
                    filtering();
                    $rootScope.ledata = [];
                }

            break;
            case "L":
                $scope.filters.sorted = "L";
                // $rootScope.ledata = config.L.filtered.toArray();
                if(config.L.data.length > 0){
                    $rootScope.ledata = config.L.data;
                } else {
                    filtering();
                    $rootScope.ledata = [];
                }
            break;
            case "H":
                $scope.filters.sorted = "H";
                // $rootScope.ledata = config.L.filtered.toArray();
                if(config.H.data.length > 0){
                    $rootScope.ledata = config.H.data;
                } else {
                    filtering();
                    $rootScope.ledata = [];
                }
            break;
        }
    };

    $rootScope.tempFilters = {
        filters: angular.copy($scope.filters),
        view: $rootScope.view.sorted,
        numSelectedSpaces: 0
    };

    $rootScope.clearFilters = function(){
        $rootScope.cannotLoadMore = false;
        $rootScope.renderDone = false;

        $scope.filters = new Filter(config.start, config.end);
        $rootScope.timeSlider.reset();

        $scope.filters.starting = $rootScope.timeSlider.minTimestamp();
        $scope.filters.ending = $rootScope.timeSlider.maxTimestamp();

        $rootScope.view.sorted = $scope.filters.sorted;

        $rootScope.tempFilters = {
            filters: angular.copy($scope.filters),
            view: $rootScope.view.sorted
        };

        $scope.filters.places.data = [];

        $scope.selectedSpaces = 0;

        $scope.lespaces.forEach(function(space){
            space.checked = false;
        });

        sortBy($rootScope.view.sorted);

        $ionicSideMenuDelegate.toggleRight();

        setTimeout(function(){
            watchHandler();
        });
    };

    $rootScope.applyFilters = function(){


        $rootScope.cannotLoadMore = false;
        $rootScope.renderDone = false;

        $scope.filters = angular.copy($rootScope.tempFilters.filters);
        $scope.filters.starting = $rootScope.timeSlider.minTimestamp();
        $scope.filters.ending = $rootScope.timeSlider.maxTimestamp();

        $rootScope.view.sorted = $rootScope.tempFilters.view;

        $scope.filters.places.data = [];

        $scope.lespaces.forEach(function(space){
            if(space.checked){
                $scope.filters.places.data.push(space.id);
            }
        });

        sortBy($rootScope.view.sorted);

        $ionicSideMenuDelegate.toggleRight();

        setTimeout(function(){
            watchHandler();
        },50);
    };

    $scope.selectedSpaces = 0;

    $scope.keyLog = function(evt){
        if(evt.keyCode == 13){
            evt.target.blur();
            $rootScope.applyFilters();
        }
    };

    $scope.countSpace = function(space){
        if(space.checked){
            $scope.selectedSpaces++;
        }else{
            $scope.selectedSpaces--;
        }
    };

    function watchHandler(){
        filtering();

        config.L.page = 1;
        config.L.data = config.L.filtered.take(config.loads).toArray();
        config.L.loaded = config.L.page*config.loads;

        config.H.page = 1;
        config.H.data = config.H.filtered.take(config.loads).toArray();
        config.H.loaded = config.H.page*config.loads;


        config.A.page = 1;
        config.A.data = config.A.filtered.take(config.loads).toArray();
        config.A.loaded = config.A.page*config.loads;

        switch($scope.filters.sorted){
            case "L":
                // $rootScope.ledata = config.L.filtered.toArray();
                $rootScope.ledata = config.L.data;
            break;
            case "A":
                // $rootScope.ledata = config.A.filtered.toArray();
                $rootScope.ledata = config.A.data;
            break;
            case "H":
                // $rootScope.ledata = config.A.filtered.toArray();
                $rootScope.ledata = config.H.data;
            break;
        }

        $rootScope.renderList();
    }

    $rootScope.cannotLoadMore = false;

    $rootScope.firstLoad = true;

    $rootScope.loadMore  = function(){

        if(!$rootScope.firstLoad && $rootScope.cannotLoadMore || !$rootScope.canLoad()){
            $rootScope.cannotLoadMore = true;
            return;
        }
        $rootScope.firstLoad = true;
        $rootScope.scrolling = true;

        switch ($scope.filters.sorted) {
            case "A":
                if(typeof config.A.filtered == 'undefined') return false;
                config.A.page++;
                var d = config.A.filtered
                        .drop(config.A.loaded)
                        .take(config.loads).toArray();


                config.A.loaded = config.A.page*config.loads;
                $rootScope.ledata.push.apply($rootScope.ledata, d);
                config.A.data = $rootScope.ledata;
                console.log("Loaded events (A): "  + config.A.loaded);
            break;
            case "L":
                if(typeof config.L.filtered == 'undefined') return false;
                config.L.page++;
                d = config.L.filtered
                    .drop(config.L.loaded)
                    .take(config.loads).toArray();


                config.L.loaded = config.L.page*config.loads;
                $rootScope.ledata.push.apply($rootScope.ledata, d);
                config.L.data = $rootScope.ledata;
                console.log("Loaded spaces (L): " + config.L.loaded);
            break;
            case "H":
                if(typeof config.H.filtered == 'undefined') return false;
                config.H.page++;
                d = config.H.filtered
                    .drop(config.H.loaded)
                    .take(config.loads).toArray();

                config.H.loaded = config.H.page*config.loads;
                $rootScope.ledata.push.apply($rootScope.ledata, d);
                config.H.data = $rootScope.ledata;
                console.log("Loaded events (H): " + config.H.loaded);
            break;

        }
        setTimeout(function(){
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
        }, 500);
    };

    $rootScope.canLoad = function(){
        var allShown = false;
        switch($scope.filters.sorted){
            case "A":
                if(typeof config.A.filtered !== 'undefined'){
                    allShown = config.A.loaded >= config.A.filtered.size();
                } else {
                    return false;
                }
            break;
            case "L":
                if(typeof config.L.filtered !== 'undefined'){
                    allShown = config.L.loaded >= config.L.filtered.size();
                } else {
                    return false;
                }

            break;
            case "H":
                if(typeof config.H.filtered !== 'undefined'){
                    allShown = config.H.loaded >= config.H.filtered.size();
                } else {
                    return false;
                }

            break;

        }

        $rootScope.$broadcast('scroll.infiniteScrollComplete');
        return typeof spaces !== 'undefined'
            && typeof events !== 'undefined'
            && !allShown;
    };


//    $rootScope.$on('$ionicView.beforeEnter', function(e,state){
//
//    });
//
//    $rootScope.$on('$ionicView.enter', function(e,state){
//
//    });

    $ionicModal.fromTemplateUrl('places.html', {
        scope: $scope,
        animation: 'show'
    }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.resetSearch = function() {
        $scope.filters.places.query = '';
    };

    $scope.openModal = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });

    $scope.$on('$stateChangeSuccess', function() {
        //$scope.loadMore();
    });
})
.controller('ProgramacaoCtrl', function($rootScope, $scope, Virada, MinhaVirada, $localStorage) {
    var eventsContainer = document.getElementById('programacao-container');
    var inscroll = false;

    document.getElementById('programacao-content').onscroll = function(){
        if(inscroll){
            return;
        }

        inscroll = true;

        if(!$rootScope.scrolling && this.offsetHeight + this.scrollTop >= this.scrollHeight - 1000){
            $rootScope.loadMore();
            $rootScope.renderList();
        }

        setTimeout(function(){
            inscroll = false;
        },300);
    };

    var interval = setInterval(function(){
        $rootScope.loadMore();
        if($rootScope.ledata.length){
            clearInterval(interval);
            $rootScope.renderList();
        }
    },50);

    $rootScope.$watch('connected', function(){
        Resig.clearCache();
        $rootScope.renderList();
    });

    window.minha_virada = function(event){
        $rootScope.minha_virada(event);
    };


    //
    var programacaoContent = document.getElementById('programacao-content');
    window.redirectFromListTo = function(url){
        window.listScrollTop = programacaoContent.scrollTop;
        document.location = url;
    };

    $rootScope.$on('$ionicView.beforeEnter', function(e,state){
        if(state.stateId === 'virada.programacao' && window.listScrollTop){
            programacaoContent.style.marginTop = -window.listScrollTop + 'px';
        }
    });

    $rootScope.$on('$ionicView.enter', function(e,state){
        if(state.stateId === 'virada.programacao' && window.listScrollTop){
            programacaoContent.style.marginTop = 0;
            programacaoContent.scrollTop = window.listScrollTop;
        }
    });

    $rootScope.NUM = 0;

    $rootScope.renderList = function(){
        var entities;



        $rootScope.NUM++;

        if(!$rootScope.scrolling){
            // se estiver renderizando a lista e não estiver scrollando, apaga a lista inteira e utiliza toda a coleção no loop
            eventsContainer.innerHTML = '';
            entities = $rootScope.ledata;
        }else{
            // se estiver scrollando, NÃO apaga a lista e utiliza somente os novos elementos da coleção para o loop
            entities = $rootScope.ledata.slice($rootScope.ldataLastLength);
        }

        entities.forEach(function(entity){
            var template;
            var show = true;

            if(entity.location){
                template = 'template-palco';
            }else{
                template = 'template-evento';

            }

            var data = {
                cacheId: entity.id,
                entity: entity,
                connected: $scope.connected
            };
            var el = Resig.renderElement(template, data, true);

            el.event = entity;

            eventsContainer.appendChild(el);

            if (!entity.watching){
                $rootScope.$watch(function(){ return entity.in_minha_virada; }, function(){
                    Resig.reRenderElement(template, data);
                });
            }

        });

        $rootScope.scrolling = false;

        $rootScope.ldataLastLength = $rootScope.ledata.length;

        setTimeout(function(){
            $rootScope.renderDone = true;
            $rootScope.$apply();
        },50);
    };



    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.programacao = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        // console.log(config);
        $rootScope.programacao = false;
    });

    $rootScope.$on('user_data_loaded', function(ev, user) {
        Virada.events().then(function(events){
            if (user.events && user.events.length > 0) {
                MinhaVirada.getFriendsOnEvents().then(function(friendsOnEvents){
                    if(!friendsOnEvents){
                        $rootScope.connected = false;
                        return false;
                    }
                    Lazy(user.events).tap(function(id){
                        var event = events.findWhere({id : id});
                        if(typeof event !== 'undefined'){
                            event.in_minha_virada = true;
                            if(typeof friendsOnEvents[id] !== 'undefined'){
                                var f = Lazy(friendsOnEvents[id]);
                                event.allFriends = f.toArray();
                                event.friends = f.take(5).toArray();
                            }

                        }
                    }).each(Lazy.noop);
                })
            };
        });
    });

})


.controller('SocialCtrl', function($scope, $rootScope, Virada, MinhaVirada,
                                   MapState, $state, $ionicPopup, $ionicPopover,
                                   $ionicModal, $timeout, $interval, $log,
                                   $localStorage, GlobalConfiguration) {

    ionic.Platform.ready(function () {
        if($localStorage.hasOwnProperty('mapOptions') === true){
            $scope.view = $localStorage.mapOptions;
        } else {
            $scope.view = {
                sendPosition : false,
                options : {
                    friends: false ,
                    palcos: false ,
                    services: true
                },
                terms_agreed: false
            };
            $localStorage.mapOptions = $scope.view;
        }

        var map;
        var position_interval;
        var friends_reload_interval;
        var mili_sec_interval = 7*60*1000;

        var spaces = [];
        var services = [];
        var servicesNames = [
            "wifi",
            "alimentacao",
            "postos",
            "banheiros",
            "ambulancia_uti",
            "ambulancia"
        ];

        $scope.$watch('view.sendPosition', function(newValue, oldValue) {
            if (newValue) {
                position_interval = $interval(function() {
                    map.getMyLocation(getMyLocation);
                }, mili_sec_interval);
            } else {
                $scope.view.options.friends = false;
                $interval.cancel(position_interval);
            }
        });

        $scope.$watch('view.options.services', function(newValue, oldValue) {
            showServices();
        });

        $scope.$watch('view.options.friends', function(newValue, oldValue) {
            showFriends();
            if (newValue) {
                friends_reload_interval = $interval(function() {
                    loadFriends();
                }, mili_sec_interval);
            } else {
                $interval.cancel(position_interval);
                $interval.cancel(friends_reload_interval)
            }
        });

        $scope.$watch('view.options.palcos', function(newValue, oldValue) {
            showPalcos();
        });


        $scope.$on('$ionicView.beforeEnter', function(){
            angular.element(document.querySelector("#left-menu")).addClass('hidden');
            angular.element(document.querySelector("#right-menu")).addClass('hidden');

            if(typeof map === 'undefined' && typeof plugin !== 'undefined')
                $timeout(init, 500);
        });

        $scope.$on('$ionicView.leave', function(){
            angular.element(document.querySelector("#left-menu")).removeClass('hidden');
            angular.element(document.querySelector("#right-menu")).removeClass('hidden');
        });

        $rootScope.$on('sidemenu_toggle', function(ev, isOpen){
            if(typeof map !== 'undefined' && typeof plugin !== 'undefined' ){
                if(isOpen){
                    map.setClickable(false);
                } else {
                    map.setClickable(true);
                }
            }
        });

        if(typeof plugin !== 'undefined'){
            var center = new plugin.google.maps.LatLng(-23.5408, -46.6400);
            var mapState = new MapState(plugin.google.maps.MapTypeId.ROADMAP, center);
        }
        function getMyLocation (location){
            // TODO mover camera para location do user
            if ($scope.view.sendPosition)
                return MinhaVirada.updateLocation(location);
        }

        function loadFriends() {
            MinhaVirada.getFriends().then(function(data){
                if(data){
                    Lazy(data).async(2).tap(function(friend){
                        if(friend.lat && friend.long){
                            if (friend.map_picture)
                                var picture = friend.map_picture
                            else
                            var picture = friend.picture
                            friend.map = {
                                position: new plugin.google.maps.LatLng(
                                    parseFloat(friend.lat),
                                    parseFloat(friend.long)),
                                'title': friend.name,
                                'icon': {
                                    'url': picture,
                                    'size': {
                                        width: 46,
                                        height: 46
                                    }
                                }
                            };
                            map.addMarker(friend.map, function(marker){
                                // marker.setIcon();
                                friend.marker = marker;
                                marker.addEventListener(
                                    plugin.google.maps.event.MARKER_CLICK,
                                    function(marker){
                                        marker.showInfoWindow();
                                    });
                            });
                            friends.push(friend);
                        }
                    }).toArray()
                    .then(function(data){
                        showFriends();
                    });
                }
            });
        }

        var div = document.getElementById("map_canvas");

        function init(){
            var w = angular.element(document.querySelector("#map-wrapper"));
            $scope.frameHeight = w[0].clientHeight;

            if(typeof plugin !== 'undefined'){
                // Initialize the map view
                map = plugin.google.maps.Map.getMap(div, mapState.options);

                map.setClickable(true);

                // Wait until the map is ready status.
                map.addEventListener(plugin.google.maps.event.MAP_READY,
                                     function(){$timeout(onMapReady, 500);});

                // map.addEventListener(plugin.google.maps.event.CAMERA_CHANGE,
                //                                           onCameraChange);
            }
            spaces = $rootScope.lespaces;

            function onMapReady() {
                if($scope.view.sendPosition){
                    map.getMyLocation(getMyLocation);
                    position_interval = $interval(function() {
                        map.getMyLocation(getMyLocation);
                    }, mili_sec_interval);
                }
                Lazy(spaces).async(2).tap(function(space){
                    if(typeof space.data !== 'undefined'){
                        map.addMarker(space.map, function(marker){
                            space.marker = marker;
                            marker.addEventListener(
                                plugin.google.maps.event.MARKER_CLICK,
                                function(){
                                    marker.hideInfoWindow();
                                    map.setClickable(false);
                                    $scope.showConfirm(space);
                                });
                        });
                    }
                }).toArray()
                .then(function(){
                    showPalcos();
                });

                Lazy(servicesNames).each(function(name){
                    MinhaVirada.getService(name).then(function(data){
                        if(data){
                            $scope.$emit("service_loaded", { data: data, name: name });
                        }
                    });
                });

                var servicesLoaded = 0;
                $scope.$on('service_loaded', function(ev, data){
                    var name = data.name;
                    var features = data.data.features;

                    Lazy(features).async(2).tap(function(feature){
                        var iconName = GlobalConfiguration.SOCIAL_API_URL
                        + "/map/icons/" + name + ".png";

                        feature.map = {
                            'title' : feature.properties.name,
                            icon: iconName,
                            visible: $scope.view.options.services === true,
                            position: new plugin.google.maps.LatLng(
                                feature.geometry.coordinates[1],
                                feature.geometry.coordinates[0]),
                        }

                        map.addMarker(feature.map, function(marker){
                            feature.marker = marker;
                            marker.addEventListener(
                                plugin.google.maps.event.MARKER_CLICK,
                                function(marker){
                                    marker.showInfoWindow();
                                });
                        });
                    }).toArray()
                    .then(function(data){
                        services.push.apply(services, features);
                        servicesLoaded++;
                        if(servicesLoaded == servicesNames.length)
                            $scope.$emit('all_services_ready');
                    });
                });

                $scope.$on('all_services_ready', function(ev){
                    showServices();
                });

                if(MinhaVirada.hasUser()){
                    loadFriends()
                    friends_reload_interval = $interval(function() {
                        loadFriends();
                    }, mili_sec_interval);
                }
            }
            // function onCameraChange(){
            //     map.getVisibleRegion(function(latLngBounds) {
            //         showPalcos(latLngBounds);
            //         showFriends(latLngBounds);
            //         showServices(latLngBounds);
            //     });
            // }
            // var isContained = latLngBounds.contains(friend.map.position);
        }

        function showPalcos(){
            for(var i = 0; i < spaces.length; i++){
                space = spaces[i];
                if(typeof space !== 'undefined' &&
                        typeof space.data !== 'undefined'&&
                        typeof space.marker !== 'undefined'){
                    if( $scope.view.options.palcos){
                        if(!space.marker.isVisible()){
                            space.marker.setVisible(true);
                        }
                    } else {
                        if(typeof space.marker !== 'undefined'){
                            space.marker.setVisible(false);
                        }
                    }
                }
            }
        }

        function showServices(){
            for(var i = 0; i < services.length; i++){
                var service = services[i];
                if(typeof service.marker !== 'undefined'){
                    if($scope.view.options.services){
                        if(!service.marker.isVisible()){
                            service.marker.setVisible(true);
                        }
                    } else {
                        service.marker.setVisible(false);
                    }
                } else {
                    // $log.log('********************************** Service undefined');
                }
            }
        }

        function showFriends(){
            var one_hour_ago = moment().subtract(1, 'hour');
            for(var i = 0; i < friends.length; i++){
                var friend = friends[i];
                if(typeof friend.marker !== 'undefined'){
                    if($scope.view.options.friends){
                        if(!friend.marker.isVisible()){
                            var position_timestamp = moment(friend.position_timestamp,
                                                "YYYY-MM-DD hh:mm");
                            if (position_timestamp > one_hour_ago)
                                friend.marker.setVisible(true);
                        }
                    } else {
                        friend.marker.setVisible(false);
                    }
                } else {
                    // $log.log('********************************** Friend marker undefined');
                }
            }
        }

        $scope.showConfirm = function(space) {
            var end = "";
            if(typeof space.data !== "undefined"){
                end = space.data.endereco;
            }
            var confirmPopup = $ionicPopup.confirm({
                title: space.name,
                template:
                    '<p>' + end  + '</p>'
                    + '<p>' + space.events.length + ' eventos nesse local!</p>'
                    + '<p>Ver a programação completa?</p>',
                buttons: [
                    { text: 'Voltar' },
                    {
                        text: '<b>Ver palco</b>',
                        type: 'button-assertive',
                        onTap: function (){return true;}
                    }
                ]
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $state.go('virada.palco-detail',
                              {palco : space.id});
                    map.setClickable(true);
                } else {
                    map.setClickable(true);
                }
            });
        };

        var friends = [];

        $ionicModal.fromTemplateUrl('map-config-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            if(typeof map !== 'undefined'){
                map.setClickable(false);
            }
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            if(typeof map !== 'undefined'){
                map.setClickable(true);
                showPalcos();
                showServices();
                showFriends();
            }

            $scope.modal.hide();
        };

        $scope.$on('modal.hidden', function() {
            if(typeof map !== 'undefined'){
                map.setClickable(true);
            }
        });

        $ionicPopover.fromTemplateUrl('map-confirm.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function($event) {
            if(typeof map !== 'undefined'){
                map.setClickable(false);
            }
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });

        // Execute action on hide popover
        $scope.$on('popover.hidden', function() {
            // Execute action
            if(typeof map !== 'undefined'){
                map.setClickable(true);
            }
        });

        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
        });

        $timeout(function(){
            $scope.showSendPositionConfirm(div);
        }, 1000);

        $scope.showSendPositionConfirm = function($event) {
            if(!$scope.view.sendPosition && !$scope.view.terms_agreed) {
                if(typeof $scope.modal !== 'undefined')
                    $scope.modal.hide();
                    $scope.openPopover(div);
            }
        };

        $scope.share_position = function(){
            $scope.view.sendPosition = true;
            $scope.view.terms_agreed = true;
            $scope.closePopover();
        }

        $scope.dont_share_position_now = function(){
            $scope.view.sendPosition = false;
            $scope.view.terms_agreed = true;
            $scope.closePopover();
        }

        $scope.login = function(){
            $scope.view.sendPosition = true;
            $scope.view.terms_agreed = true;
            $scope.closePopover();
            MinhaVirada.connect();
        }
    });
})
.controller('MinhaViradaCtrl', function($rootScope, $scope, $http, $location, $timeout, Virada, MinhaVirada, GlobalConfiguration, $localStorage, $ionicLoading, Date){
    $scope.view = {
        hasMessage : false
    };

    $scope.logout = function(){
        MinhaVirada.logout();
    }

    $rootScope.$on('logged_out', function(ev){
        console.log($localStorage);
    });


    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'minha_virada';
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.curr = false;
    });

    $ionicLoading.show({
        noBackdrop: true,
        duration: 20000,
        template: '<ion-spinner icon="ripple"></ion-spinner>'
    });

    $rootScope.$on('initialized', function(ev, uid){
        $ionicLoading.hide();
        $scope.initialized = true;
    });


    $scope.initialized = false;
    $scope.hasEvents = false;
    $scope.events = [];
    $scope.connected = false;
    $scope.terms_accepted = false;

    $scope.accept_terms = function() {
        $scope.terms_accepted = true;
    }

    // Test if user has a token
    // if true try to get data
    //     if it fails, try to login again to get another token
    // if false, emit initialized and show the button
    if($localStorage.hasOwnProperty("accessToken") === false) {
        $rootScope.$emit('initialized');
    } else {
        // Test if token is valid
        MinhaVirada.init($localStorage.accessToken, $localStorage.uid)
        .then(function(data){
            if(!data){
                $rootScope.$emit('initialized');
            }
        });
    }

    $scope.login = function(){
        MinhaVirada.connect();
    }

    $rootScope.$on('fb_app_connected', function(ev, userData) {
        $scope.connected = true;
        $scope.accessToken = $localStorage.accessToken;
        if(userData) populateUserInfo(userData);
    });

    $rootScope.$on('fb_not_connected', function(ev, uid) {
        showMessage("Não foi possível conectar");
    });

    $rootScope.$on('data_not_loaded', function(ev) {
        showMessage("Não foi possivel carregar os dados");
    });

    var showMessage = function(message){
        $scope.message = message;
        $scope.view.hasMessage = true;
        $timeout(function(){
            $scope.view.hasMessage = false;
            $scope.message = "";
        }, 3000)
    }


    $rootScope.$on('user_data_saved', function(ev){
        updateUserInfo($localStorage.user);
    });

    function updateUserInfo(user){
        if(typeof user.events === 'undefined'){
            user.events = [];
        }
        if(user.events.length !== $scope.events.length){
            // Events array has changed
            // $scope.events = [];
            fillEvents(user);
        }
    }
    function fillEvents(user){
        Virada.events().then(function(events){
            if (user.events && user.events.length > 0) {
                $scope.hasEvents = true;
                MinhaVirada.getFriendsOnEvents().then(function(friendsOnEvents){
                    newevents = [];
                    Lazy(user.events).tap(function(id){
                        var event = events.findWhere({id : id});
                        if(typeof event !== 'undefined'){
                            event.in_minha_virada = true;
                            if(typeof friendsOnEvents[id] !== 'undefined'){
                                var f = Lazy(friendsOnEvents[id]);
                                event.allFriends = f.toArray();
                                event.friends = f.take(5).toArray();
                            }
                            newevents.push(event);
                        }
                    }).each(Lazy.noop);
                    $scope.events = Lazy(newevents).sortBy(function(event){
                        if(typeof event !== 'undefined'){
                            return event.timestamp;
                        } else {
                            return false;
                        }
                    }).toArray();

                })
            };
        });
    }

    function populateUserInfo (data) {
        if ( typeof(data.picture) !== 'undefined' ) {
            $scope.user_picture = data.picture;
            $scope.user_name = data.name;
        }
        fillEvents(data);
    }
})
.controller('AppCtrl', function($scope, $rootScope, $localStorage, MinhaVirada, $ionicHistory, $cordovaSocialSharing, GlobalConfiguration){
    $scope.anon = true;
    if($localStorage.uid){
        $scope.anon = false;
        MinhaVirada.loadUserData($localStorage.uid).then(function(userData){
            if(userData){
                $localStorage.user = userData;
                $rootScope.connected = $localStorage.hasOwnProperty("accessToken") === true;
            }
        });
    }

    $rootScope.$on('fb_connected', function(ev, data) {
        $rootScope.connected = true;
    });

    $rootScope.minha_virada = function(event){
        // Toogle event.in_minha_virada.
        var eventId;

        if(typeof event === 'number'){
            eventId = event;
        }else{
            eventId = event.id;
        }

        if($localStorage.hasOwnProperty("accessToken") === false ||
           $localStorage.hasOwnProperty("uid") === false) {
            MinhaVirada.connect();
        } else {
            if(!MinhaVirada.hasUser()){
                MinhaVirada
                .init($localStorage.accessToken, $localStorage.uid)
                .then(function(connected){
                    if(connected){
                        event.in_minha_virada =  MinhaVirada.toogle(eventId);
                    } else {
                        MinhaVirada.connect().then(function(data){
                            if(data){
                                event.in_minha_virada =
                                    MinhaVirada.toogle(eventId);
                            }
                        });
                    }
                });
            } else {
                event.in_minha_virada = MinhaVirada.toogle(eventId);
            }
        }
    }

    $rootScope.is_in_minha_virada = function(eventId){
        return MinhaVirada.hasEvent(eventId);
    }

    $scope.shareButtons = ['palco', 'atracao', 'minha_virada'];

    $scope.share = function(b){
        var subject = "Virada Cultural 2015!";
        var message = "";
        var link = GlobalConfiguration.SHARE_URL;
        switch (b){
            case 'palco':
                message = "Venha conferir as atrações do Palco "
                    + $rootScope.palco.name;
                link = link + "/programacao/local/##" + $rootScope.palco.id;
                break;
            case 'atracao':
                message = "Venha conferir a atração "
                    + $rootScope.atracao.name;
                link = link + "/programacao/atracao/##" + $rootScope.atracao.id;
                break;
            case 'minha_virada':
                message = "Venha conferir a Minha Virada ";
                link = link + "/minha-virada/##" + $localStorage.uid;
                break;
        }

        $cordovaSocialSharing.share(message, subject, null, link)
        .then(function(result) {
            // Success!
        }, function(err) {
            // An error occured. Show a message to the user
        });
    }

    $scope.showMe = function(b){
        return b === $rootScope.curr;
    }

});
