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

.controller('ProgramacaoCtrl', function($rootScope, $scope, $stateParams, Event, Meeting, $localStorage) {
    Event.all.then(function(events) {
	       $scope.events = events
    });

    if ($stateParams.meeting) {
	Meeting.get($stateParams.meeting).then(function(data) {
	    $scope.meeting = data;
	});
    }
    if ($stateParams.territory) {
	$scope.territory = $stateParams.territory;
    }

    $scope.$on('$ionicView.beforeEnter', function(){
        $rootScope.programacao = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
        $rootScope.programacao = false;
    });
})

.controller('RedesCtrl', function($rootScope, $scope, Meeting, $localStorage) {
    Meeting.all.then(function(meetings) {
	$scope.meetings = meetings
    });
})

// .controller('PercursosCtrl', function($rootScope, $scope, Territory, MeuPercurso, $localStorage) {
//     Territory.all.then(function(territories) {
// 	$scope.territories = territories
//     });
// })

.controller('FilterCtrl', function($rootScope, $scope, $localStorage) {
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

.controller('EventCtrl', function($rootScope, $scope, $stateParams, Event, Date, $ionicModal, $state){
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
