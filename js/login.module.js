(function() {
	'use strict';
	angular.module('webApp.login',[
		'webApp.login.registro',
		'webApp.login.recuperarContrasena',
		'webApp.login.desbloqueo' 
	]).config(['$stateProvider', function ($stateProvider) {
		$stateProvider
		.state('login', {
			abstract:true,
			url: '/login',
			views: { 'container': { template: '<div ui-view="container"></div>' }}
		});
	}]);
})();