(function () {
  'use strict';
  angular.module('app.module.core')
    .factory('generateDataChllngeWeb', generateDataChllngeWeb)
    .factory('reviewChallengeWeb', reviewChallengeWeb);

  generateDataChllngeWeb.$inject = ['paramsFixed']

  function generateDataChllngeWeb(paramsFixed) {

    var factGenData = {},
      objGeneric = {
        "data": {
          "request": {
            "identificationData": {
              "orgName": undefined, // TIPO PERSONA
              "userName": undefined, //NUM CONTRATO
            },
            "channelIndicator": "WEB",
            "eventDataList": {
              "eventData": [{
                "eventType": undefined, // prev fraudes
                "clientDefinedAttributeList": {
                  "facts": []
                },

              }]
            }
          }
        },
        "subject": {
          "credencial": "",
          "principal": ""
        }
      }

    /**
     * rqstOutseer
     * @param {*} dataOrigin 
     * @param {*} dataDestiny 
     * @param {*} dataOper 
     * @param {*} dataOperCllnge 
     * @returns 
     */
    factGenData.rqstOutseer = function (dataOrigin, dataDestiny, dataOper, dataOperCllnge) {


      objGeneric['data']['request']["identificationData"] = {
        "orgName": (paramsFixed.user().profile == 'personaFisica' || paramsFixed.user().profile == 'pfae') ?  "FISICA" : '', // TIPO PERSONA
        "userName": paramsFixed.user().nroCliente, //NUM CONTRATO
      }


      var objGnricChllnge = objGeneric['data']['request']['eventDataList']['eventData'][0],
        s_user = paramsFixed.user().usuarioBE;

      objGnricChllnge['eventType'] = dataOperCllnge.eventType;
      objGnricChllnge['clientDefinedEventType'] = dataOperCllnge.clientDefinedEventType;
      objGnricChllnge['clientDefinedAttributeList']['facts'].push({ "name": "CveUsuario", "value": s_user }); // "usuario en sesión"

      objGeneric["usuario"] = {
        "usuarioId": null,
        "nroCliente": paramsFixed.user().nroCliente,
        "clasificacionId": 0,
        "usuarioBE": paramsFixed.user().usuarioBE,
        "nroCuenta": 0
      };


      return objGeneric;
    }

    return factGenData;
  }


  reviewChallengeWeb.$inject = ['serviceUtil', '$q']

  function reviewChallengeWeb(serviceUtil, $q) {
    var factStatic = {};
    factStatic.check = function (dataRqstChllnge) {

      var dferdChllnge = $q.defer(),
        chllngePromise = dferdChllnge.promise;

      serviceUtil.load('frama01', dataRqstChllnge)
        .then(function (resChallenge) {
          dferdChllnge.resolve(resChallenge);
        })
      return chllngePromise;
    }

    return factStatic;
  }

})();
