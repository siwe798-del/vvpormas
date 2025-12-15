(function () {
  'use strict';

  angular.module('app.module.core')
    .factory('clearStorage', clearStorage)
    .factory('sweetAlert', ['SWL', sweetAlert])
    .factory('disableKeyboard', ['$document', disableKeyboard])
    .factory('sessionHandler', ['clearStorage', 'serviceUtil', 'paramsFixed', '$state', '$location', sessionHandler])
    .factory('injectStorage', ['$http', '$base64', injectStorage])
    .factory('servicesFactory', servicesFactory)
    .factory('paramsFixed', ['$base64', paramsFixed])
    .factory('dateTo', ['sweetAlert', dateTo])
    .factory('getPropertie', ['$base64',getPropertie])
    .factory('currentSession', currentSession);
  /**
* [currentSession]
* @param {*} $base64 
* @param {*} paramsFixed 
*/
  currentSession.$inject = ['$base64', 'paramsFixed']

  function currentSession($base64, paramsFixed) {
    var factCurrentSession = {}

    factCurrentSession.update = function (TokenID) {
      var thisSession = paramsFixed.session();
      thisSession.idSesion = TokenID;
      sessionStorage.setItem('sessionValue', $base64.encode(JSON.stringify(thisSession)));
    }
    return factCurrentSession;
  }

  /**
  * [getPropertie]
  * @param {*} $base64 
  */
  function getPropertie($base64) {
    var propertie = '', propertieEval;
    
    return {
      storage: function (propertie) {

        if (sessionStorage[propertie]) {
          propertieEval = $base64.decode(sessionStorage[propertie])

          if (propertieEval.indexOf('{') != -1) { // is String
            propertie = JSON.parse(propertieEval)
          } else { propertie = propertieEval }
        }

        return propertie;
      }
    }
  }
  /** [dateTo] convierte una cadena "date" a milisegundos
  la cadena se debe recibir en dd/mm/yyyy para ser convertida en yyyy/mm/dd
  @example
  dateTo.milliseconds('16/03/2016') dd/mm/yyyy
  */
  function dateTo(sweetAlert) {
    return {
      milliseconds: function (date) {
        var bloqueDate = date.split("/");
        if (typeof bloqueDate[2] === "undefined" || bloqueDate[2].length < 4) {
          sweetAlert.message('Formato fecha  año inválido', 'warning');
          return false;
        } else if (bloqueDate[0].length > 2 || bloqueDate[0] > 31) {
          sweetAlert.message('Formato fecha dia inválido', 'warning');
          return false;
        } else if (bloqueDate[1].length > 2 || bloqueDate[0] > 12) {
          sweetAlert.message('Formato fecha  mes inválido', 'warning');
          return false;

        } else {
          var dateComplex = bloqueDate[2] + '/' + bloqueDate[1] + '/' + bloqueDate[0],
            myDate = new Date(dateComplex),
            result = myDate.getTime();
          return result;
        }
      }
    };
  }

  function servicesFactory() {
    var objData;

    return {
      setData: function (data) {
        objData = data;
      },
      getData: function () {
        return objData;
      }
    };
  }

  /**
  * [paramsFixed description]
  * @param  {[type]} $base64 [description]
  * @return {[type]}         [description]
  */
  function paramsFixed($base64) {
    var objUser = {},
      objSession = {},
      objUsuIni, objSesIni;
    return {
      user: function (properties) {
        objUsuIni = {};
        if (typeof properties === 'undefined' || properties.lenght === 0) {
          objUser = sessionStorage.usrValue ? JSON.parse($base64.decode(sessionStorage.usrValue)) : '';
        } else {
          objUser = {};
          objUsuIni = sessionStorage.usrValue ? JSON.parse($base64.decode(sessionStorage.usrValue)) : '';
          angular.forEach(properties, function (valuePropertie) {
            angular.forEach(objUsuIni, function (value, key) {
              if (key === valuePropertie) {
                objUser[key] = value;
              }
            });
          });
        }
        return objUser;
      },
      session: function (properties) {
        objSesIni = {};
        if (typeof properties === 'undefined' || properties.lenght === 0) {
          objSession = sessionStorage.sessionValue ? JSON.parse($base64.decode(sessionStorage.sessionValue)) : '';
        } else {
          objSession = {};
          objSesIni = sessionStorage.sessionValue ? JSON.parse($base64.decode(sessionStorage.sessionValue)) : '';
          angular.forEach(properties, function (valuePropertie) {
            angular.forEach(objSesIni, function (value, key) {
              if (key === valuePropertie) {
                objSession[key] = value;
              }
            });
          });
        }
        return objSession;
      }

    };
  }

  /**
  * [disableKeyboard]
  * {backSpace} Previene el backSPace y sólo lo permite la tecla de retroceso en los input & textarea
  * {f5} Previene el uso de la tecla F5
  * {reload} Deshabilita el reload mediante Ctrl + R
  * @param  {[type]} $document [description]
  * @return {[type]}           [description]
  */
  function disableKeyboard($document) {

    return {
      backSpace: function () {
        $document.on('keydown', function (e) {
          var doPrevent = false;
          if ((e.which || e.keyCode) === 8) {
            var d = e.srcElement || e.target;
            if ((d.tagName.toUpperCase() === 'INPUT' &&
              (
                d.type.toUpperCase() === 'TEXT' ||
                d.type.toUpperCase() === 'PASSWORD' ||
                d.type.toUpperCase() === 'FILE' ||
                d.type.toUpperCase() === 'SEARCH' ||
                d.type.toUpperCase() === 'EMAIL' ||
                d.type.toUpperCase() === 'NUMBER' ||
                d.type.toUpperCase() === 'DATE' ||
                d.type.toUpperCase() === 'TEL')
            ) ||
              d.tagName.toUpperCase() === 'TEXTAREA') {
              doPrevent = d.readOnly || d.disabled;
            } else {
              doPrevent = true;
            }
          }

          if (doPrevent) {
            e.preventDefault();
          }
        });
      },
      f5: function () {
        $document.on('keydown', function (e) {
          var doPrevent = false;
          if ((e.which || e.keyCode) === 116) {
            doPrevent = true;
          }
          if (doPrevent) {
            e.preventDefault();

          }
        });
      },
      reload: function () {
        $document.on('keydown', function (e) {
          var doPrevent = false;
          if (e.metaKey && e.keyCode === 82 || e.ctrlKey && e.keyCode === 82) {
            doPrevent = true;
          }
          if (doPrevent) {
            e.preventDefault();
          }
        });
      }
    };
  }

  /**
  * [injectStorage description]
  * @param  {[type]} $http   [description]
  * @param  {[type]} $base64 [description]
  * @return {[type]}         [description]
  */
  function injectStorage($http, $base64) {
    var datosSAT = {},
      obj = {};

    function getUrlVars() {
      var vars = {};
      var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
      });

      return vars;
    }

    obj.datosSAT = function (dato, objectData, response) {
      if (dato) {
        datosSAT[dato.name] = dato.valor;
      } else {
        var vars = getUrlVars();
        if (vars.token) {
          sessionStorage.setItem('from', 'sat');
          sessionStorage.setItem('token_minisitio', vars.token);
          datosSAT = {
            token_minisitio: vars.token
          };
        }
      }
    };

    obj.fixedSession = function (data) {
      var response = '';
      var dataObject = {
        /*'sesion': {
        'idSesion': data.sesion.idSesion,
        'idCanal': data.sesion.idCanal,
        'hostName': data.sesion.hostName,
        'hostIpAddress': data.sesion.hostIpAddress,
        'sourceURL': data.sesion.sourceURL,
        'idUsuario': data.sesion.idUsuario,
        'idCustomer':data.sesion ? data.sesion.idCustomer:'',
        'userPrincipal':data.sesion ? data.sesion.userPrincipal:''
        }*/
        'sesion': {
          'idSesion': data.sesion.idSesion,
          'idCanal': '',
          'hostName': '',
          'hostIpAddress': '',
          'sourceURL': '',
          'idUsuario': '',
          'idCustomer': data.sesion ? data.sesion.idCustomer : '',
          'userPrincipal': data.sesion ? data.sesion.userPrincipal : ''
        }
      };

      sessionStorage.setItem('sessionValue', $base64.encode(JSON.stringify(dataObject.sesion)));

      if (data.user) {
        dataObject.usuario = {};
        dataObject.usuario.usuarioBE = data.user.usuarioBE;
        sessionStorage.setItem('usrValue', $base64.encode(JSON.stringify(dataObject.usuario)));
      }
    };

    obj.fixed = function (objectData, response) {
     
      var dataObject = {
        /* 'sesion': {
        'idSesion': objectData.sesion.idSesion,
        'idCanal': objectData.sesion.idCanal,
        'hostName': objectData.sesion.hostName,
        'hostIpAddress': objectData.sesion.hostIpAddress,
        'sourceURL': objectData.sesion.sourceURL,
        'idUsuario': response.user.userId,
        'idCustomer':response.user ? response.user.customerId:'',
        'userPrincipal':objectData.subject.principal
        },*/
        'sesion': {
          'idSesion': objectData.sesion.idSesion,
          'idCanal': '',
          'hostName': '',
          'hostIpAddress': '',
          'sourceURL': '',
          'idUsuario': '',
          'idCustomer': response.user ? response.user.customerId : '',
          'userPrincipal': objectData.subject.principal
        },
        'usuario': {
          'nroCliente': response.user.customerId,
          'usuarioId': response.user.userIdCore,
          'status': response.user.status,
          'type': response.user.userType,
          'securityPhrase': response.user.securityPhrase,
          'profile': response.user.profile,
          'nroCuenta': '0',
          'rfc': response.user.rfc,
          'clasificacionId': 0,
          'ultimoAcceso': response.user.lastAccessDateTime,
          'usuarioBE': objectData.subject.principal,
          'businessRoles': response.user.businessRoles,
          'nombreCliente': response.user.nombreCliente
        },
        'subject': {
          'credencial': '',
          'principal': ''
        }
      }, tmp = {
        nombreCliente :response.user.nombre + ' ' + response.user.apellidoPaterno + ' ' + response.user.apellidoMaterno
      };

      sessionStorage.setItem('usrValue', $base64.encode(JSON.stringify(dataObject.usuario)));
      sessionStorage.setItem('sessionValue', $base64.encode(JSON.stringify(dataObject.sesion)));
      sessionStorage.setItem('subjectValue', $base64.encode(JSON.stringify(dataObject.subject)));
      sessionStorage.setItem('realName', btoa(objectData.subject.principal));
      sessionStorage.setItem('nombreCliente', btoa(tmp.nombreCliente.trim()));

    };
    return obj;
  }

  /**
  * [sweetAlert description]
  * @param  {[type]} APP [description]
  * @param  {[type]} SWL [description]
  * @return {[type]}     [description]
  */
  function sweetAlert(SWL) {
    return {
      message: function (msg, type) {
        var title;
        if (type === 'success') {
          title = SWL.titleSuccess;
        }
        if (type === 'error') {
          title = SWL.titleError;
        }
        if (type === 'warning') {
          title = SWL.titleWarning;
        }
        swal({
          title: title,
          text: msg,
          width: SWL.width,
          type: type,
          confirmButtonClass: 'btn btn-success',
          confirmButtonText: SWL.confirmButtonText
        });
      }
    };
  }

  /**
  * [clearStorage description]
  * @return {[type]} [description]
  */
  function clearStorage() {
    return {
      all: function () {
        var i = sessionStorage.length;
        while (i--) {
          var key = sessionStorage.key(i);
          sessionStorage.removeItem(key);
        }
      },
      key: function (key) {
        if (sessionStorage[key]) {
          sessionStorage.removeItem(key);
        }
      },
      localKey: function (key) {
          localStorage.removeItem(key);
      }

    };
  }

  /**
  * [sessionHandler description]
  * @param  {[type]} $http        [description]
  * @param  {[type]} APP          [description]
  * @param  {[type]} clearStorage [description]
  * @return {[type]}              [description]
  */
  function sessionHandler(clearStorage, serviceUtil, paramsFixed, $state, $location) {
    return {
      logOut: function (customTimeout, callback) {
        var defaultCustomTimeout = 9000;    // 9 segundos por default
        var dataObject = { 'sesion': paramsFixed.session() };

        if (typeof callback == "function") {
      
          var theRealCallback = function () {
            clearStorage.all();
            callback();
          };

          customTimeout = (typeof customTimeout == "number") ? customTimeout : defaultCustomTimeout;
        
          serviceUtil.send('logoutwb09', dataObject, 1,'noAlert', customTimeout, theRealCallback)
            .then(function successCallback(response) {
              theRealCallback(); // is 99% probable that this callback makes a redirect to login
            });
        }

      },
      goToWeb: function () {
        var absoluteUrl = $location.absUrl();
        var anteriorUrl = absoluteUrl.split("#")[0];    // should be http://localhost:3000/web/index.html#/login/desbloqueo/usuario for example
        anteriorUrl = (anteriorUrl.indexOf("index.html") !== -1) ? anteriorUrl : anteriorUrl + "index.html";
        location.replace(anteriorUrl); // instead of $state.go()
      },
      flujoRedirect: function (where) {
        var noReplace = false;
        var angularPath = "";
        
        switch (where) {
          case 'desbloqueo':
            angularPath = 'login.desbloqueo';
            noReplace = true;
            break;
          case 'registro':
            angularPath = 'login.registro';
            noReplace = true;
            break;
          case 'recuperarContrasena':
            angularPath = 'login.recuperarContrasena';
            noReplace = true;
            break;
          case 'ingresar':
            angularPath = 'ingresar';
            noReplace = true;
            break;
          case 'desbloqueo-imagenes':
            angularPath = 'login.desbloqueo-imagenes';
            break;
          case 'registro-imagenes':
            angularPath = 'login.registro-contrasena';
            //angularPath = 'login.registro-imagenes';
            break;
          case 'recuperarUsuario':
            angularPath = 'login.recuperarUsuario';
            break;
          case 'recuperarContrasena2':
            angularPath = 'login.recuperarContrasena2';
            break;
          case 'recuperarContrasenaTipoNotificacion': //RECOVER PWD BY OTP - SELECT TYPE NOTIFICATION
            angularPath = 'login.recuperarTipoNotificacion';
            break;
          case 'registro-contrasena':
            angularPath = 'login.registro-contrasena';
            break;
          case 'desbloqueo-token':
            angularPath = 'login.desbloqueo-token';
            break;
          case 'desbloqueo-valida-otp': //nuevo flujo desbloqueo usuarios, sustituye a desbloqueo-imagenes
            angularPath = 'login.desbloqueo-valida-otp';
            break;
          case 'desbloqueo-notificacion':
            angularPath = 'login.desbloqueo-notificacion';
            break;
          case 'desbloqueo-token-otp': //nuevo flujo desbloqueo OTP, sustituye a desbloqueo token
            angularPath = 'login.desbloqueo-token-otp';
            break;
        }
        if (angularPath.length == 0) {
          return;
        }
        var absoluteUrl = $location.absUrl();
        var relativeUrl = $state.href(angularPath, {}, { absolute: false });
        var anteriorUrl = absoluteUrl.split("#")[0];
        anteriorUrl = (anteriorUrl.indexOf("index.html") !== -1) ? anteriorUrl : anteriorUrl + "index.html";
        var nuevaUrl = anteriorUrl + relativeUrl;
        if (noReplace) {
          location.assign(nuevaUrl);
        } else {
          location.replace(nuevaUrl); // instead of $state.go()
        }
      }
    };
  }

  /****** END FILE *******/

})();
