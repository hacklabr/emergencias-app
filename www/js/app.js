var emergencias = angular.module("emergencias", ['ionic', 'rzModule', 'emergencias.wrappers', 'emergencias.controllers', 'emergencias.services', 'emergencias.config', 'emergencias.meu_percurso', 'emergencias.programacao', 'ngStorage', 'ngCordova']);

emergencias.config(function($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {
    //$ionicConfigProvider.scrolling.jsScrolling(false);
    $httpProvider.defaults.cache = true;

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|geo|ms-appx|x-wmapp0):/);

    $stateProvider
    .state('emergencias', {
        url: "/emergencias",
        abstract: true,
        templateUrl: 'templates/menu.html',
        // template: "<ion-nav-view name='template' />",
        controller: 'AppCtrl'
    })

    .state('emergencias.programacao', {
        url: '/programacao',
        views: {
            'menu-view': {
                templateUrl: 'templates/programacao.html',
                controller: 'ProgramacaoCtrl'
            },
        }
    })

    .state('emergencias.meu-percurso', {
        url: '/programacao/meu-percurso',
        views: {
            'menu-view': {
                templateUrl: 'templates/meu-percurso.html',
                controller: 'MeuPercursoCtrl'
            },
        }
    })

    .state('emergencias.atracao-detail', {
        url: '/programacao/atracao/:atracao',
        views: {
            'menu-view': {
                templateUrl: 'templates/atracao-detail.html',
                controller: 'AtracaoCtrl'
            }
        }
    })

    .state('emergencias.palco-detail', {
        url: '/programacao/palco/:palco',
        views: {
            'menu-view': {
                templateUrl: 'templates/palco-detail.html',
                controller: 'PalcoCtrl'
            }
        }
    })

    .state('emergencias.about', {
        url: '/programacao/sobre',
        views: {
            'menu-view': {
                templateUrl: 'templates/about.html',
            }
        }
    })

    .state('emergencias.social', {
        url: '/emergencias/social',
        views: {
            'menu-view': {
                templateUrl: 'templates/social.html',
                controller: 'SocialCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/emergencias/programacao');
});

