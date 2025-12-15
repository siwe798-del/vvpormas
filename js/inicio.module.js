(function() {
	'use strict';
	angular.module('webApp.inicio',['ngDragDrop'])
	.config(['$stateProvider','$urlRouterProvider','APP', 
	function($stateProvider, $urlRouterProvider, APP) {
		$urlRouterProvider.otherwise('/');
		$stateProvider
		.state('web', {
			url: '/:route',
			views: {
				'container': {
					templateUrl: 'modules/inicio/views/login.html?v=09122025-1104',
					controller: 'loginController',
					controllerAs: 'vm',
					resolve: {
                        loadMyFiles: function($ocLazyLoad) {
							return $ocLazyLoad.load(APP.lazyConfig({
								name: 'webApp.inicio',
								files: [
									'modules/inicio/controllers/login.controller.js'
								]
							}));
                        }
                    }
				}
			}
		})
		.state('ingresar', {
			url: '/ingresar/:route',
			views: {
				'container': {
					templateUrl: 'modules/inicio/views/ingresar.html?v=09122025-1104',
					controller: 'captchaController',
					controllerAs: 'vm',
					resolve: {
                        loadMyFiles: function($ocLazyLoad) {
							return $ocLazyLoad.load(APP.lazyConfig({
								name: 'webApp.inicio',
								files: [
									'modules/inicio/controllers/captcha.controller.js'
								]
							}));
                        }
                    }
				}
			}
		})
		.state('acceso', {
			url: '/acceso/:route',
			views: {
				'container': {
					templateUrl: 'modules/login/views/main.html?v=09122025-1104',
					controller: 'MainCtrlLogin',
					controllerAs: 'vm',
					resolve: {
                        loadMyFiles: function($ocLazyLoad) {
							return $ocLazyLoad.load(APP.lazyConfig({
								name: 'webApp.inicio',
								files: [
									'modules/login/controllers/main.controller.js'
								]
							}));
                        }
                    }
				}
			}
		})
		.state('acceso.terminos', {
			url: 'condiciones',			
			templateUrl: 'modules/login/views/primer-acceso/terminos-y-condiciones.html?v=09122025-1104',
			controller: 'ConfiguracionPrimerAccesoController',
			controllerAs: 'vm',
			resolve: {
                loadMyFiles: function($ocLazyLoad) {
					return $ocLazyLoad.load(APP.lazyConfig({
						name: 'webApp.inicio',
						files: [
							'modules/login/controllers/primer-acceso.controller.js'
						]
					}));
                }
            }				
		})
		.state('acceso.mediosNotificacion', {
			url: '/medios-de-notificacion',
			views: {
				'container': {
					templateUrl: 'modules/login/views/primer-acceso/medios-de-notificacion.html?v=09122025-1104',
					controller: 'ConfiguracionPrimerAccesoController',
					controllerAs: 'vm',
					resolve: {
                        loadMyFiles: function($ocLazyLoad) {
							return $ocLazyLoad.load(APP.lazyConfig({
								name: 'webApp.inicio',
								files: [
									'modules/login/controllers/primer-acceso-segundo.controller.js'
								]
							}));
                        }
                    }
				}
			}
		})
		    .state('acceso.sucursales', {
                    url: '/sucursales',
                    views: {
                        'container': {
                            templateUrl: 'modules/header/views/sucursales.html?v=09122025-1104',
                            controller: 'sucursalesController',
                            controllerAs: 'vm',
                            resolve: {
                                loadMyFiles: function($ocLazyLoad) {
									return $ocLazyLoad.load(APP.lazyConfig({
										name: 'webApp.login.registro',
										files: [
											'modules/header/controllers/sucursales.controller.js'
										]
									}));
								}
                            }
                        }
                    }
                })
                .state('acceso.contacto', {
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
											'modules/header/controllers/contacto.controller.js'
										]
									}));
                                }
                            }
                        }
                    }
                });
	}]);

})();
