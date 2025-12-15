(function() {
    'use strict';
    angular.module('webApp.inicio').controller('passwordController', passwordController);
    passwordController.$inject = ['$http', '$state', 'APP', '$scope', '$rootScope', '$base64'];

    function passwordController($http, $state, APP, $scope, $rootScope, $base64) {
        var vm = this;
        var api = APP.api,
            captcha = {},
            idSerValidaPwd = 'loc02',
            idSerGenCaptcha = 'lot10',
            idSerValidarCaptcha = 'lot11';
        $scope.nombreUsuario = $base64.decode(sessionStorage.realName);

        /**
         * [logPass description]
         * @return {[type]} [description]
         */
        vm.logPass = function() {
                $scope.sendService = true;
                var arrValCaptcha = {
                        'usuario': $base64.decode(sessionStorage.userName),
                        'idSesion': $base64.decode(sessionStorage.idSesion),
                        'palabras': [{
                            palabra: vm.codCaptcha
                        }]
                    };
                if (vm.codCaptcha === '' || vm.codCaptcha === undefined) {
                    vm.Errorcaptcha = true;
                    $scope.sendService = false;
                } else {
                    //validar captcha
                    $http.post(api + idSerValidarCaptcha, arrValCaptcha).
                    then(function(model) {
                        if (model.data.data.esValido === true) {
                           vm.validaPassword();
                        } else {
                            vm.Errorcaptcha = true;
                            $scope.sendService = false;
                        }
                    }, function errorCallback() {//response) {
                        vm.Errorcaptcha = true;
                        $scope.sendService = false;
                    });
                    //end validar captcha
                }
            };

        /**
         * [validaPassword] Valida que el password proporcionado sea correcto
         * @return {[type]} [description]
         */
         vm.validaPassword = function(){
            var arrPwd = {
                        'usuario': $base64.decode(sessionStorage.userName),
                        'idUsuario': parseInt($base64.decode(sessionStorage.user)),
                        'contrasena': vm.usrpass
                    };
            //validar pwd */
            $http.post(api + idSerValidaPwd, arrPwd)
                .then(function(modelpwd) {
                if (modelpwd.data.code === 202) {
                    $rootScope.statusSteps = {
                        'primer_ingreso': false,
                        'segundo_ingreso': false,
                        'temporal': false
                    };
                    $state.go('web.appRoute');
                    var timeSession = new Date().setMilliseconds(1200000);
                    sessionStorage.timeSession = new Date(timeSession);
                }
            }, function errorCallback(response) {
                vm.verifyPass = true;
                $scope.sendService = false;
                 $scope.msgErrPass = response.data.data;
                 
            }); //end pwd
         };
        /**
         * Carga Captcha en automático
         * @type {Object}
         */
        vm.generaCaptcha = function(){
           var arrCaptcha = {
                'usuario': $base64.decode(sessionStorage.userName),
                'idUsuario': parseInt($base64.decode(sessionStorage.user)),
                'idSesion': $base64.decode(sessionStorage.idSesion)
            };
        $http.post(api + idSerGenCaptcha, arrCaptcha).then(function(model) {
            captcha = model.data.data;
            $scope.captcha = captcha;
        });
        };

        /**
         * Boton cancelar
         * @return {[type]} [description]
         */
        vm.cancelLog = function() {
            $state.go('web');
            $scope.vm.usr = '';
            vm.clearSession();
        };
        /**
         * [clearSession] Limpia los valores de sessionStorage
         * @return {[type]} [description]
         */
        vm.clearSession = function() {
            var i = sessionStorage.length;
            while (i--) {
                var key = sessionStorage.key(i);
                sessionStorage.removeItem(key);
            }
        };
    } // end function
})();
