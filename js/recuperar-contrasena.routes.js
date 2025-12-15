(function () {
  'use strict';
  angular.module('webApp.login.recuperarContrasena')
    .config(['$stateProvider','APP', function ($stateProvider, APP) {
      $stateProvider
        .state('login.recuperarContrasena', {
          url: '/recuperar-contrasena',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-contrasena.html?v=09122025-1104',
              controller: 'RecuperarController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: ["modules/login/recuperar-contrasena/controllers/recuperar.controller.js"]
                  }))
                }
              }
            }

          }
        })
        .state('login.recuperarContrasena2', {
          url: '/recuperar-contrasena2',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-contrasena2.html?v=09122025-1104',
              controller: 'RecuperarPwdValidaOtpController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: [
                      'modules/login/recuperar-contrasena/controllers/recuperarPwdValidaOtp.controller.js'
                    ]
                  }));
                }
              }
            }
          }
        })
        .state('login.recuperarTipoNotificacion', {
          url: '/recuperar-contrasena2-tipo-notificacion',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-pwd-tipo-notificacion.html?v=09122025-1104',
              controller: 'RecuperarPwdTipoNotificacion',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: [
                      'modules/login/recuperar-contrasena/controllers/recuperarPwdTipoNotificacion.controller.js'
                    ]
                  }));
                }
              }
            }
          }
        })
        .state('login.recuperarContrasena3', {
          url: '/recuperar-contrasena3',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-contrasena3.html?v=09122025-1104',
              controller: 'RecuperarPswController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: ["modules/login/recuperar-contrasena/controllers/recuperarContrasena.controller.js"]
                  }))
                }
              }
            }
          }
        })
        .state('login.recuperarContrasena4', {
          url: '/recuperar-contrasena4',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-contrasena4.html?v=09122025-1104',
              controller: 'RecuperarPwdFinalizarController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: ["modules/login/recuperar-contrasena/controllers/recuperarPwdFinalizar.controller.js"]
                  }))
                }
              }
            }
          }
        })
        .state('login.recuperarUsuario', {
          url: '/recuperar-usuario',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-usuario.html?v=09122025-1104',
              controller: 'RecuperarUsuarioController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: ["modules/login/recuperar-contrasena/controllers/recuperarUsuario.controller.js"]
                  }))
                }
              }
            }
          }
        })
        .state('login.recuperarUsuario2', {
          url: '/recuperar-usuario2',
          views: {
            'container': {
              templateUrl: 'modules/login/recuperar-contrasena/views/recuperar-usuario2.html?v=09122025-1104',
              controller: 'RecuperarUsuarioFinalizarController',
              controllerAs: 'vm',
              resolve: {
                loadMyFiles: function ($ocLazyLoad) {
                  return $ocLazyLoad.load(APP.lazyConfig({
                    name: 'webApp.login.recuperarContrasena',
                    files: ["modules/login/recuperar-contrasena/controllers/recuperarUsuarioFinalizar.controller.js"]
                  }))
                }
              }
            }
          }
        });
    }]);
})();
