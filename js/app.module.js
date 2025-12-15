(function() {
    'use strict';

    var appWeb = angular.module('webApp', [
        'pascalprecht.translate',
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'oc.lazyLoad',
        'componentsPlanetMedia',
        'base64',
        'angular-loading-bar',
        'config',
        'webApp.inicio',
        'app.module.core',
        'webApp.login',
        'validation',
        'validation.rule',
        'ngMap'
    ]);

    appWeb.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');
        $httpProvider.defaults.headers.common['clearForceChache'] = false;
    }]);

    appWeb.constant('APP', {
        name: 'Omnisuite',
        app: 'omnisuite',
        images: 'assets/images/'
    });

    appWeb.constant('SWL', {
        titleError: 'Error',
        titleSuccess: 'Correcto',
        titleWarning: 'Atención',
        width: 380,
        confirmButtonText: 'Continuar'
    });

    appWeb.config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http|localhost|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }]);

    appWeb.config(['$translateProvider', '$locationProvider',
        function($translateProvider) {
            $translateProvider.useStaticFilesLoader({
                prefix: 'i18n/locale-',
                suffix: '.json'
            });
            $translateProvider.preferredLanguage('esp');
            $translateProvider.useSanitizeValueStrategy(null);
            $translateProvider.useStorage();
        }
    ]);
    appWeb.run(['$rootScope','$templateCache', function ($rootScope, $templateCache) {
        $rootScope.$on("$stateChangeSuccess", function (ev, to, toParams, from, fromParams, fromState) {

           $templateCache.remove(to.views.container.templateUrl);
           $templateCache.remove(to.templateUrl);
       });
    }]);

})();
