var viradapp = angular.module("viradapp", ['ionic', 'rzModule', 'viradapp.wrappers', 'viradapp.controllers', 'viradapp.services', 'viradapp.config', 'viradapp.minha_virada', 'viradapp.programacao', 'ngStorage', 'ngCordova']);

viradapp.config(function($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {
    //$ionicConfigProvider.scrolling.jsScrolling(false);
    $httpProvider.defaults.cache = true;

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|geo|ms-appx|x-wmapp0):/);

    $stateProvider
    .state('virada', {
        url: "/virada",
        abstract: true,
        templateUrl: 'templates/menu.html',
        // template: "<ion-nav-view name='template' />",
        controller: 'AppCtrl'
    })

    .state('virada.programacao', {
        url: '/programacao',
        views: {
            'menu-view': {
                templateUrl: 'templates/programacao.html',
                controller: 'ProgramacaoCtrl'
            },
        }
    })

    .state('virada.minha-virada', {
        url: '/programacao/minha-virada',
        views: {
            'menu-view': {
                templateUrl: 'templates/minha-virada.html',
                controller: 'MinhaViradaCtrl'
            },
        }
    })

    .state('virada.atracao-detail', {
        url: '/programacao/atracao/:atracao',
        views: {
            'menu-view': {
                templateUrl: 'templates/atracao-detail.html',
                controller: 'AtracaoCtrl'
            }
        }
    })

    .state('virada.palco-detail', {
        url: '/programacao/palco/:palco',
        views: {
            'menu-view': {
                templateUrl: 'templates/palco-detail.html',
                controller: 'PalcoCtrl'
            }
        }
    })

    .state('virada.about', {
        url: '/programacao/sobre',
        views: {
            'menu-view': {
                templateUrl: 'templates/about.html',
            }
        }
    })

    .state('virada.social', {
        url: '/virada/social',
        views: {
            'menu-view': {
                templateUrl: 'templates/social.html',
                controller: 'SocialCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/virada/programacao');
});

