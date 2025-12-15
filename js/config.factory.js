(function () {
    'use strict';

    angular.module('app.module.core')
        .factory('readConfig', ['$http', '$q', 'sweetAlert', 'blockUI', '$base64', 'getPropertie', readConfig]);

    /**
     * [readConfig description]
     * @param  {[type]} $http [description]
     * @param  {[type]} $q    [description]
     * @return {[type]}       [description]
     */
    function readConfig($http, $q, sweetAlert, blockUI, $base64, getPropertie) {
        var factReadConfig = {},
            host = window.location.host,
            hostname = window.location.hostname,
            port = window.location.port,
            protocol = window.location.protocol;
        /**
         * [get]
         */
        factReadConfig.get = function () {
            var defered = $q.defer(),
                promise = defered.promise,
                pathRelative;

            if (hostname === 'localhost' || hostname.indexOf("192.168.") !== -1) {
                pathRelative = '';
            } else {
                pathRelative = '/ebanking';
                host = hostname;
                if (port) {
                    host = host + ":" + port;
                }
            }

            function reviewSetStorage(data) {
                if (!sessionStorage.api) {
                    sessionStorage.api = $base64.encode(JSON.stringify(data));
                }
            }

            $http({
                method: 'GET',
                cache:false,
                url: '../config.json?v=' + Date.now()
            }).success(function (data) {
                blockUI.stop();
                if (data !== null && data !== undefined && Object.keys(data).length !== 0) {
                    if (data.ipServer !== null && data.ipServer !== undefined) {
                        if (data.ipServer.replace(/^\s+|\s+$/g, '').length !== 0) {
                            data.pathApp = protocol + '//' + host + pathRelative;
                            reviewSetStorage(data)
                            defered.resolve(data);
                        } else {
                            sweetAlert.message('El atributo ipServer en el archivo de configuración se encuentra vacio.', 'error');
                        }
                    } else {
                        sweetAlert.message('El atributo ipServer no fue encontrado en el archivo de configuración.', 'error');
                    }
                } else {
                    sweetAlert.message('El archivo de configuración se encuentra vacío.', 'error');
                }
            }).error(function (data, status, headers, config) {
                sweetAlert.message('No fue posible encontrar el archivo de configuración.', 'warning');
                $q.reject(config);
                throw new Error('Fallo al obtener los datos:' + config.method + '\n' + config.url);
            });
            return promise;
        } //get

        /**
      * [reviewEnvDev]
      */
        factReadConfig.reviewEnvDev = function () {
            var dev;
            if (hostname === 'localhost' || hostname.indexOf("192.168.") !== -1) {
                dev = true;
            } else { dev = false; }

            return dev;
        }

        /**
         * [existMachine]
         * @param {[*]} machine 
         */
        factReadConfig.existMachine = function (machine) {
            var exist = false,
                api = getPropertie.storage('api');

            if (api[machine]) { exist = true; }

            return exist;
        } // existMachine

        return factReadConfig; //return
    } //readConfig Factory

    /****** END FILE *******/

})();
