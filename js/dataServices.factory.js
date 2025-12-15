/*
 * @license
 * eBanking v0.0.1
 * (c) 2015 Planet Media http://planetmedia.com.mx
 * License: MIT
 */
(function () {
	'use strict';
	angular.module('webApp.login.registro')
		.factory('serviceData', serviceData);
	serviceData.$inject = ['$rootScope', 'paramsFixed', '$http'];

	function serviceData($rootScope, paramsFixed, $http) {
    /**
     * @var {Object} obj Objeto que contiene los métodos getData, getParams, getSessionData
     * y que retorna la factoria.
     */
		var obj = {};
		obj.getData = function (modulo, servicio) {
	 
			var req = {};
			req.data = {};
			req.data.sesion = paramsFixed.session();
			req.data.sesion.userPrincipal = paramsFixed.user().usuarioBE;
			return req;
		};
		
		obj.getRequest = function (modulo, servicio) {
			var params = {};
			var tmp;
			switch (modulo) {
				case 'login':
					params = obj.getParams(servicio);
					break;
				case 'divisas':
					params = obj.getServicesByModule("divisas.json")[servicio];
					break;

			}
			return params;
		}

		obj.getParams = function (option) {
			var propertiesParams = {
				"ltcwb10": {},
				"lgtcwb11": {
					"listaTerminosCondiciones": []
				},
				"uisc01": {
					"numImagenes": 0,
					"servicioFinanciero": ""
				},
				"imgscwb01": {
					"clveServFinanc": "BANCO"
				},
				"imgscwb02": {
					"estatus": true,
					"imgSecretaId": ""
				},
				"imgscwb03": {
					"numeroImagenesSecretas": 0
				},
				"imgscwb04": {
					"clveServFinanc": "",
					"numImagenes": 0
				},
				"imgscwb05": {
					"clveServFinanc": ""
				},
				"imgscwb06": {
					"clveServFinanc": "",
					"imgSecId": 0
				},
				"imgscwb08": {
					"clveServFinanc": "",
					"imgSecId": 0
				},
				"imgstwb09": {
					"clveServFinanc": "",
					"imagenSecretaId": 0
				}
			};
			return propertiesParams[option];
		}
		return obj;
	}
})();
