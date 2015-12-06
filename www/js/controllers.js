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
    Event.all.then(function(events) {
	       $scope.events = events
    });

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

    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.programacao = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.programacao = false;
    });
})

.controller('RedesCtrl', function($rootScope, $scope, Meeting, $localStorage) {
    Meeting.cached.then(function(meetings) {
	$scope.meetings = meetings
    });
    Meeting.renew.then(function(meetings) {
	if (meetings != null) {
	    console.log('renewed');
	    console.log(meetings);
	    $scope.meetings = meetings
	} else {
	    console.log('same data');
	}
    });
})

.controller('PercursosCtrl', function($rootScope, $scope, Territory, $localStorage) {
    Territory.cached.then(function(territories) {
	$scope.territories = territories
    });
    Territory.renew.then(function(territories) {
	if (territories != null) {
	    console.log('renewed');
	    console.log(territories);
	    $scope.territories = territories
	} else {
	    console.log('same data');
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
            $rootScope.event = event;
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

.controller('AppCtrl', function($scope, $rootScope, $localStorage, Notifications, $cordovaSocialSharing, $ionicPush, GlobalConfiguration) {
    $scope.notifications = Notifications
})

.controller('NotificationsCtrl', function($scope, $rootScope, Notifications, $localStorage, $ionicPush, GlobalConfiguration) {
    $scope.$on('$ionicView.beforeEnter', function(){
	Notifications.readAll();
    });
    $scope.notifications = Notifications
})
