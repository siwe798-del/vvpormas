(function () {
    'use strict';
    //este es otro cmabio en web
    angular.module('webApp.login.desbloqueo', ['blockUI'])
        .config(['$stateProvider','APP', function ($stateProvider, APP) {
            $stateProvider
                .state('login.desbloqueo', {
                    url: '/desbloqueo/usuario',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/desbloqueo/views/desbloqueo.html?v=09122025-1104',
                            controller: 'loginDesbloqueoController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.desbloqueo',
                                        files: ["modules/login/desbloqueo/controllers/desbloqueo.controller.js"]
                                    }))
                                }
                            }
                        }
                    }
                })
                .state('login.desbloqueo-notificacion', {
                    url: '/desbloqueo/medio-notificacion',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/desbloqueo/views/desbloqueo-medio-notificacion.html?v=09122025-1104',
                            controller: 'loginDesbloqueoTypeNotificationController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.desbloqueo',
                                        files: [
                                            'modules/login/desbloqueo/controllers/desbloqueo-medio-notificacion.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.desbloqueo-valida-otp', { //Sustituye a login.desbloqueo-imagenes
                    url: '/desbloqueo/valida-otp',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/desbloqueo/views/desbloqueo-valida-otp.html?v=09122025-1104',
                            controller: 'loginDesbloqueoValidaOtpController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.desbloqueo',
                                        files: [
                                            'modules/login/desbloqueo/controllers/desbloqueo-valida-otp.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.desbloqueo-token-otp', { //Sustituye a login.desbloqueo-token
                    url: '/desbloqueo/token-otp',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/desbloqueo/views/desbloqueo-token-otp.html?v=09122025-1104',
                            controller: 'loginDesbloqueoTokenOtpController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function ($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.desbloqueo',
                                        files: [
                                            'modules/login/desbloqueo/controllers/desbloqueo-token-otp.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                });
        }]).config(['blockUIConfig', function (blockUIConfig) {
            blockUIConfig.message = 'Cargando datos';
        }]);
})();