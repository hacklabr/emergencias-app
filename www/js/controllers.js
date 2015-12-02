angular.module('emergencias.controllers', [])

// .controller('TrackCtrl', function($rootScope, $scope, $stateParams, Emergencias, Conn){
//     $scope.tracks = [
// 	{ 'name': 'Hackers' },
// 	{ 'name': 'Feminismos' },
// 	{ 'name': 'Resistência Urbana na América Latina' },
// 	{ 'name': 'Redes, Movimentos e Entidades de Artes Cênicas' },
// 	{ 'name': 'Cultura e Infância' },
// 	{ 'name': 'Indigenas' },
// 	{ 'name': 'LGBT' },
//     ]
// })

.controller('ProgramacaoCtrl', function($rootScope, $scope, Event, MeuPercurso, $localStorage) {
    Event.all.then(function(events) {
	       $scope.events = events
    });

    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.programacao = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        // console.log(config);
        $rootScope.programacao = false;
    });
})

.controller('FilterCtrl', function($rootScope, $scope, Emergencias, MeuPercurso, $localStorage) {
    $scope.search_text = '';
})

// .controller('PlaceCtrl', function($rootScope, $scope, $stateParams, Emergencias, Conn){
//     $scope.$on('$ionicView.beforeEnter', function(){
//         $rootScope.curr = 'place';
//     });
//
//     $scope.$on('$ionicView.beforeLeave', function(){
//         $rootScope.curr = false;
//     });
//
//     if($stateParams.place){
//         Emergencias.getPlaceEvents($stateParams.place)
//         .then(function(data){
//             $rootScope.place = data;
//             $scope.space = data;
//             $scope.spaceEvents = data.events;
//         });
//     } else {
//         // none selected
//     }
// })

.controller('EventCtrl', function($rootScope, $scope, $stateParams, Event, MeuPercurso, Date, $ionicModal, $state){
    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'event';
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.curr = false;
    });

    $scope.view = {
        hasMore : false
    }

    $scope.LL = Date.LL;
    if($stateParams.event){

        Event.get($stateParams.event).then(function (event) {
            $rootScope.event = event;
            $scope.event = event;
        });
        // if(data.allFriends){
        //     $scope.view.delta = data.allFriends.length - data.friends.length;
        //     $scope.view.hasMore = true;
        // }
    } else {
        $state.go("emergencias.programacao()")
    }

    // $ionicModal.fromTemplateUrl('friends-modal.html', {
    //     scope: $scope,
    //     animation: 'slide-in-up'
    // }).then(function(modal) {
    //     $scope.modal = modal;
    // });

    // $scope.openModal = function() {
    //     $scope.modal.show();
    // };
    //
    // $scope.closeModal = function() {
    //     $scope.modal.hide();
    // };
    //
    // $scope.$on('$destroy', function() {
    //     $scope.modal.remove();
    // });

})
.controller('ButtonsCtrl', function($scope, $ionicSideMenuDelegate, $rootScope, Emergencias, MeuPercurso, $ionicGesture){
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
.controller('SocialCtrl', function($scope, $rootScope, Emergencias, MeuPercurso,
                                   MapState, $state, $ionicPopup, $ionicPopover,
                                   $ionicModal, $timeout, $interval, $log,
                                   $localStorage, GlobalConfiguration) {

    $scope.GlobalConfiguration = GlobalConfiguration;

    $scope.openWindow = function (url) {
        window.open(url, '_system', 'location=yes');
    };

    ionic.Platform.ready(function () {
        if($localStorage.hasOwnProperty('mapOptions') === true){
            $scope.view = $localStorage.mapOptions;
        } else {
            $scope.view = {
                sendPosition : false,
                options : {
                    friends: false ,
                    places: false ,
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

        $scope.$watch('view.options.places', function(newValue, oldValue) {
            showPlaces();
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
                return MeuPercurso.updateLocation(location);
        }

        function loadFriends() {
            MeuPercurso.getFriends().then(function(data){
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
                    showPlaces();
                });

                Lazy(servicesNames).each(function(name){
                    MeuPercurso.getService(name).then(function(data){
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

                if(MeuPercurso.hasUser()){
                    loadFriends()
                    friends_reload_interval = $interval(function() {
                        loadFriends();
                    }, mili_sec_interval);
                }
            }
            // function onCameraChange(){
            //     map.getVisibleRegion(function(latLngBounds) {
            //         showPlaces(latLngBounds);
            //         showFriends(latLngBounds);
            //         showServices(latLngBounds);
            //     });
            // }
            // var isContained = latLngBounds.contains(friend.map.position);
        }

        function showPlaces(){
            for(var i = 0; i < spaces.length; i++){
                space = spaces[i];
                if(typeof space !== 'undefined' &&
                        typeof space.data !== 'undefined'&&
                        typeof space.marker !== 'undefined'){
                    if( $scope.view.options.places){
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
                        text: '<b>Ver Espaço</b>',
                        type: 'button-assertive',
                        onTap: function (){return true;}
                    }
                ]
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $state.go('emergencias.place-detail',
                              {place : space.id});
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
                showPlaces();
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
            MeuPercurso.connect();
        }
    });
})
.controller('MeuPercursoCtrl', function($rootScope, $scope, $http, $location, $timeout, Emergencias, MeuPercurso, GlobalConfiguration, $localStorage, $ionicLoading, Date){

    $scope.GlobalConfiguration = GlobalConfiguration;

    $scope.openWindow = function (url) {
        window.open(url, '_system', 'location=yes');
    };

    $scope.view = {
        hasMessage : false
    };

    $scope.logout = function(){
        MeuPercurso.logout();
    }

    $rootScope.$on('logged_out', function(ev){
        console.log($localStorage);
    });


    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'meu_percurso';
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
        MeuPercurso.init($localStorage.accessToken, $localStorage.uid)
        .then(function(data){
            if(!data){
                $rootScope.$emit('initialized');
            }
        });
    }

    $scope.login = function(){
        MeuPercurso.connect();
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
        Emergencias.events().then(function(events){
            if (user.events && user.events.length > 0) {
                $scope.hasEvents = true;
                MeuPercurso.getFriendsOnEvents().then(function(friendsOnEvents){
                    newevents = [];
                    Lazy(user.events).tap(function(id){
                        var event = events.findWhere({id : id});
                        if(typeof event !== 'undefined'){
                            event.in_meu_percurso = true;
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
.controller('AppCtrl', function($scope, $rootScope, $localStorage, MeuPercurso, $ionicHistory, $cordovaSocialSharing, GlobalConfiguration){
    $scope.anon = true;
    if($localStorage.uid){
        $scope.anon = false;
        MeuPercurso.loadUserData($localStorage.uid).then(function(userData){
            if(userData){
                $localStorage.user = userData;
                $rootScope.connected = $localStorage.hasOwnProperty("accessToken") === true;
            }
        });
    }

    $rootScope.$on('fb_connected', function(ev, data) {
        $rootScope.connected = true;
    });

    $rootScope.meu_percurso = function(event){
        // Toogle event.in_meu_percurso.
        var eventId;

        if(typeof event === 'number'){
            eventId = event;
        }else{
            eventId = event.id;
        }

        if($localStorage.hasOwnProperty("accessToken") === false ||
           $localStorage.hasOwnProperty("uid") === false) {
            MeuPercurso.connect();
        } else {
            if(!MeuPercurso.hasUser()){
                MeuPercurso
                .init($localStorage.accessToken, $localStorage.uid)
                .then(function(connected){
                    if(connected){
                        event.in_meu_percurso =  MeuPercurso.toogle(eventId);
                    } else {
                        MeuPercurso.connect().then(function(data){
                            if(data){
                                event.in_meu_percurso =
                                    MeuPercurso.toogle(eventId);
                            }
                        });
                    }
                });
            } else {
                event.in_meu_percurso = MeuPercurso.toogle(eventId);
            }
        }
    }

    $rootScope.is_in_meu_percurso = function(eventId){
        return MeuPercurso.hasEvent(eventId);
    }

    $scope.shareButtons = ['place', 'event', 'meu_percurso'];

    $scope.share = function(b){
	// TODO EM
        var subject = "Emergências 2015!";
        var message = "";
        var link = GlobalConfiguration.SHARE_URL;
        switch (b){
            case 'place':
                message = "Venha conferir as atrações do Espaço "
                    + $rootScope.place.name;
                link = link + "/programacao/local/##" + $rootScope.place.id;
                break;
            case 'event':
                message = "Venha conferir a atração "
                    + $rootScope.event.name;
                link = link + "/programacao/event/##" + $rootScope.event.id;
                break;
            case 'meu_percurso':
                message = "Venha conferir a Minha Virada ";
                link = link + "/meu-percurso/##" + $localStorage.uid;
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
