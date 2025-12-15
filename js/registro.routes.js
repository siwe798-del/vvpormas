(function() {
    'use strict';
    angular.module('webApp.login.registro', ['blockUI'])
        .config(['$stateProvider','APP', function($stateProvider, APP) {
            $stateProvider
                .state('login.registro', {
                    url: '/registro',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/registro/views/registro.html?v=09122025-1104',
                            controller: 'loginRegistroController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/registro.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.registro-preguntas', {
                    url: '/registro/preguntas',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/registro/views/registro-preguntas.html?v=09122025-1104',
                            controller: 'loginRegistroPreguntasController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/registro-preguntas.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.registro-imagenes', {
                    url: '/registro/imagenes',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/registro/views/registro-imagenes.html?v=09122025-1104',
                            controller: 'loginRegistroImagenesController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/registro-imagenes.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.registro-contrasena', {
                    url: '/registro/contrasena',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/registro/views/registro-contrasena.html?v=09122025-1104',
                            controller: 'loginRegistroContrasenaController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/registro-contrasena.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.sucursales', {
                    url: '/sucursales',
                    views: {
                        'container': {
                            templateUrl: 'modules/login/registro/views/sucursales.html?v=09122025-1104',
                            controller: 'sucursalesController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/informacion-sucursales.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                })
                .state('login.contacto', {
                    url: '/contacto',
                    views: {
                        'container': {
                            templateUrl: 'modules/header/views/contacto.html?v=09122025-1104',
                            controller: 'informacionContactoController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
                                    return $ocLazyLoad.load(APP.lazyConfig({
                                        name: 'webApp.login.registro',
                                        files: [
                                            'modules/login/registro/controllers/informacion-contactos.controller.js'
                                        ]
                                    }));
                                }
                            }
                        }
                    }
                });
        }])
        .config(['blockUIConfig', function(blockUIConfig) {
            blockUIConfig.message = 'Cargando datos';
        }]);
})();