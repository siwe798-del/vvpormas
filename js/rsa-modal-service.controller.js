/**
 * @Controller
 * @name  rsaModalCtrl Sabe como tratar un [reto - SMS reto]
 */

(function () {
  angular.module('app.module.core')
    .controller('rsaModalCtrl', rsaModalCtrlFunction);
  rsaModalCtrlFunction.$inject = ['$scope', '$uibModalInstance', 'sessionHandler', 'RSAExceptionHandlerService', 'rsaData', 'config', 'doRsaRequest', 'blockUI'];

  function rsaModalCtrlFunction($scope, $uibModalInstance, sessionHandler, RSAExceptionHandler, rsaData, config, doRsaRequest, blockUI) {
    var vm = this;
    //determinar el tipo de acción:
    vm.actionType      = rsaData.actionType;
    vm.modalOptions    = config;
    vm.rsaAnswers      = {};
    vm.quizData        = { answers: [] };
    vm.requireToken    = rsaData.showToken;
    vm.isTokenStep     = false;
    
    //definimos el nodo donde tomar las preguntas...
    vm.questions = vm.actionType == 'enrollment'
      ? rsaData.rsa.data
      : (vm.actionType == 'challenge' && rsaData.hasOwnProperty('rsa') )
        ? rsaData.rsa.data.preguntas
        : rsaData.data.preguntas;

    if (vm.actionType == "challenge" && vm.questions.length == 0 ) {
      vm.actionType = "otp";
      vm.questions = [{"idPregunta": "otp", "pregunta": ""}];
    }
        
    /**
     * @name rsaModalCtrl.initModalInputs
     * @description ...
     * @requires null.
     * @return null.
     */
    function initModalInputs () {
      vm.quizData.answers = [];
      angular.forEach(vm.questions, function (value, key) {
        var answerData = "";
        vm.quizData.answers.splice(key+1, 0, answerData);
      });
      vm.modalOptions.challengeType = vm.actionType || 'EmptyActionType';
    }
    
    /**
     * @name rsaModalCtrl.continuar
     * @description ...
     * @requires Object - response.
     * @return null.
     */
    function continuar (response) {
        vm.isTokenStep = false;
        $uibModalInstance.close(response);
    };
    
    /**
     * @name rsaModalCtrl.doRsaRequestSuccess
     * @description ...
     * @requires Object - resp.
     * @return null.
     */
    function doRsaRequestSuccess(resp) {
      switch (parseInt(resp.data.code)) {
        // Allow pass ->
        case 200:
        case 202: //OTP was successfully validate , continue to next step [input token]
          if (vm.requireToken && !vm.isTokenStep) {
            nextStep(); //show next page
          } else {
            continuar(resp);
          }
          break;
        // Avoit pass -> Handle exception
        default:
          initModalInputs();
          RSAExceptionHandler.httpCode(resp.data);
      }
    };

    function nextStep() {
      vm.isTokenStep = true;
      //TODO some else action
    }
    
    /**
     * @name rsaModalCtrl.doRsaRequestFailure
     * @description ...
     * @requires Object - err.
     * @return null.
     */
    function doRsaRequestFailure(err) {
      initModalInputs();
    };
    
    /**
     * @name rsaModalCtrl.sendData
     * @description ...
     * @requires null.
     * @return null.
     */
    $scope.sendData = function sendData () {
      //prepare data for enrollment request
      if (vm.actionType == 'enrollment') {
        var dataEnrol = [];
        angular.forEach(vm.questions, function (pregunta, key) {
          dataEnrol.push({ "idPregunta": pregunta.idPregunta, "respuesta": vm.quizData.answers[key] });
        });
        vm.rsaAnswers['enrol'] = dataEnrol;
      }

      //prepare data for challenge request
      if (vm.actionType == 'challenge') {
        var dataChallenge = [];
        angular.forEach(vm.questions, function (pregunta, key) {
          dataChallenge.push({ "idPregunta": pregunta.idPregunta, "respuesta": vm.quizData.answers[key] });
        });
        vm.rsaAnswers['reto']           = dataChallenge;
        vm.rsaAnswers['idSession']      = rsaData.rsa.data.idSession;
        vm.rsaAnswers['idTransaccion']  = rsaData.rsa.data.idTransaccion;
      }

      //prepare data for OTP request
      if (vm.actionType == 'otp') {
        vm.rsaAnswers['otp']            = vm.quizData.answers[0];
        vm.rsaAnswers['idSession']      = rsaData.hasOwnProperty('rsa') ? rsaData.rsa.data.idSession: rsaData.data.idSession; 
        vm.rsaAnswers['idTransaccion']  = rsaData.hasOwnProperty('rsa') ? rsaData.rsa.data.idTransaccion: rsaData.data.idTransaccion;
      }

      switch(true) {
        case vm.isTokenStep && rsaData.sourceArguments[0] !== "loginwb05": // transaction request in token screen
          doRsaRequest(rsaData._context, rsaData.sourceArguments, vm.rsaAnswers, false).then(doRsaRequestSuccess, doRsaRequestFailure);  
          break;
        case rsaData.sourceArguments[0] === "loginwb05": // login request
        default:
          doRsaRequest(rsaData._context, rsaData.sourceArguments, vm.rsaAnswers, true).then(doRsaRequestSuccess, doRsaRequestFailure);
      }
    }
    
    //dismiss modal
    $scope.$on('$locationChangeStart', function handleOnRouteChange() {
      $uibModalInstance.close("cancel");
    });
    
    initModalInputs();
  }

})();
