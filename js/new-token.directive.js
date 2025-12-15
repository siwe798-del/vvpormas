/*global angular:true*/
/*global swal:true*/

(function () {
  'use strict';
  angular.module('app.module.core')
    .directive('appNewToken', [ '$rootScope', '$filter', 'numPropObjFilter', appNewToken]);


  /**
 * [appPanelToken description]
 * @param  {[type]} $http      [description]
 * @param  {[type]} $state     [description]
 * @param  {[type]} $rootScope [description]
 * @param  {[type]} APP        [description]
 * @return {[type]}            [description]
 */
  function appNewToken( $rootScope, $filter, numPropObjFilter) {
    var directiveNewToken = {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {

      },
      templateUrl: 'modules/core/views/elements/new-token.directive.html',
      controller: ['$scope', '$rootScope', '$state', function ($scope, $rootScope, $state) { }],
      link: function (scope, element, attrs) {

        scope.softOK = false;
        scope.sofToken = {};
        $rootScope.newToken = '';

        scope.$watch('sofToken', function (newVal, oldVal) {
           if (($filter('numPropObj')(newVal) == 6) && newVal.f  ){ 
             scope.softOK = true; $rootScope.newToken = scope.joinToken(newVal) 
            } 
           else { scope.softOK = false; $rootScope.newToken = ''; }  
        }, true);


        scope.joinToken = function (objtoken) {
          return  Object.keys(objtoken).map(function (key) {
            return objtoken[key]
          }).join("")
         
        } 


        angular.element(document).ready(function () {
          angular.element('.toknInpt').on("keyup", function (e) {
            var $input = $(this);
            if ($input.val().length == 0 && e.which == 8) {
              $input.toggleClass("tkn- tkn").prev('.toknInpt').focus();
            }
            else if ($input.val().length >= parseInt($input.attr("maxlength"), 10)) {
              $input.toggleClass("tkn tkn-").next('.toknInpt').focus();
            }
          });
        });

      }
    } ;
    return directiveNewToken;

  }
})();