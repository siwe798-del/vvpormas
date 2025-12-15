(function () {
    'use strict';
    angular.module('app.module.core')
        .controller('LayoutCtrl', LayoutCtrl);
    LayoutCtrl.$inject = ['$rootScope', '$scope', 'disableKeyboard', 'dateTo'];

    function LayoutCtrl($scope, $rootScope, disableKeyboard, dateTo) {

        $scope.date = new Date();

        /**
         * Previene el backSPace y sólo lo permite la tecla de retroceso en los input & textarea
         */
        disableKeyboard.backSpace();
        /**
         * Previene el uso de la tecla F5
         */
        // disableKeyboard.f5();

        /**
         * Deshabilita el reload mediante Ctrl + R o cmd + R
         */
        //disableKeyboard.reload();

        // window.onbeforeunload = function () {
        //    // handle the exit event
        // };

        // window.onbeforeunload = function() { return "You work will be lost."; };

    }
})();
