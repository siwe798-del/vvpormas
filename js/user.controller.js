(function() {
    'use strict';
    angular.module('webApp.inicio').controller('inicioController', inicioController);
    inicioController.$inject = ['$http', '$state', 'APP', '$scope', '$base64','$rootScope', '$window'];

    function inicioController($http, $state, APP, $scope, $base64,$rootScope, $window) {
        var api = APP.api,
            usuario = {},
            idSerValidaUsr = 'loc01',
            idSerGenCaptcha = 'lot10';//,
            //idSerValidarCaptcha = 'lot11';
        var vm = this;
        $scope.verifyUser = false;
        vm.logUser = function(usr) {
            $scope.sendService = true;
            if (vm.usr === '' || vm.usr === undefined) {
                $scope.verifyUser = true;
                $scope.sendService = false;
            } else {
                var arrUser = {
                    'usuario': usr
                };
                $http.post(api + idSerValidaUsr, arrUser).then(function(model) {
                    usuario = model.data.data;
                    if (usuario.esValido === true) {
                       
                        $scope.sendService = false;
                        sessionStorage.user = $base64.encode(usuario.idUsuario);
                        sessionStorage.realName = $base64.encode(usuario.nombreUsuario);
                        sessionStorage.idSesion = $base64.encode(usuario.idSesion);
                        sessionStorage.userName = $base64.encode(vm.usr);
                         vm.generaCaptcha();
                    } else {
                        $scope.verifyUser = true;
                    }
                }, function errorCallback(response) {
                    $scope.verifyUser = true;
                    $scope.sendService = false;
                    $scope.msgErrUsr = response.data.data;
                 
                });
            }
        };

         vm.generaCaptcha = function(){
           var arrCaptcha = {
                'usuario': $base64.decode(sessionStorage.userName),
                'idUsuario': parseInt($base64.decode(sessionStorage.user)),
                'idSesion': $base64.decode(sessionStorage.idSesion)
            };
        $http.post(api + idSerGenCaptcha, arrCaptcha).then(function(model) {
            $rootScope.captcha = model.data.data;
            $state.go('web.password');
        });   
        };
        vm.recuperarContrasena = function () {
            sessionStorage.realName = $base64.encode('Invitado');
            var params = ['height=' + screen.height, 'width=' + screen.width, 'fullscreen=yes', 'resizable=no', 'scrollbars=yes', 'toolbar=no', 'menubar=no', 'location=no', 'titlebar=Omnisuite Banking'].join(',');
            $window.open('../banking/#/login/recuperar-contrasena/recuperar-usuario', '_blank', params).moveTo(0, 0);

        };
    }
})();