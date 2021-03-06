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

.controller('ProgramacaoCtrl', function($rootScope, $scope, $stateParams, Event, Meeting, Territory, $localStorage) {
    if ($stateParams.meeting) {
        Meeting.get($stateParams.meeting).then(function(data) {
            $scope.meeting = data;
        });
    }

    if ($stateParams.territory) {
        Territory.get($stateParams.territory).then(function(data) {
            $scope.territory = data;
        });
    }

    Event.cached.then(function(events) {
        $scope.events = events
    });
    Event.renew.then(function(events) {
        if (events != null) {
            $scope.events = events
        }
    });

})

.controller('RedesCtrl', function($rootScope, $scope, Meeting, $localStorage) {
    Meeting.cached.then(function(meetings) {
        $scope.meetings = meetings
    });
    Meeting.renew.then(function(meetings) {
        if (meetings != null) {
            $scope.meetings = meetings
        }
    });
})

.controller('PercursosCtrl', function($rootScope, $scope, Territory, $localStorage) {
    Territory.cached.then(function(territories) {
	$scope.territories = territories
    });
    Territory.renew.then(function(territories) {
	if (territories != null) {
	    $scope.territories = territories
	}
    });
})

.controller('FilterCtrl', function($rootScope, $scope, $localStorage) {
    $scope.search_text = '';
})

.controller('EventCtrl', function($rootScope, $scope, $stateParams, Event, $ionicModal, $state){
    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.curr = 'event';
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.curr = false;
    });

    $scope.view = {
        hasMore : false
    }

    if($stateParams.event){
        Event.get($stateParams.event).then(function (event) {
            $scope.event = event;
        });
    } else {
        $state.go("emergencias.programacao()")
    }
})
.controller('ButtonsCtrl', function($scope, $ionicSideMenuDelegate, $rootScope, $ionicGesture){
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

.controller('AppCtrl', function($scope, $rootScope, $localStorage, Notifications, $cordovaSocialSharing, GlobalConfiguration) {
    Notifications.init();
    $scope.notifications = Notifications
})

.controller('NotificationsCtrl', function($scope, $rootScope, Notifications, $localStorage, $ionicPush, GlobalConfiguration) {
    $scope.$on('$ionicView.beforeEnter', function(){
	Notifications.readAll();
    });
    $scope.notifications = Notifications
})
