(function() {
    'use strict';
/**
 * [crea un filtro de búsqueda  en el componente Select2] 
 * @param  {Array}  ) {             return function(items, props) {    var out [description]
 * @return {[type]}   [description]
 */
angular.module('app.module.core')
.filter('propsFilter', propsFilter)
.filter('fillZeroes', fillZeroes)
.filter('phonenumber', phonenumber)
.filter('numPropObj', numPropObj)
.filter('htmlAs',htmlAs);


  /**
    * [numPropObj]
    */
  function numPropObj() {
    return function (object) {
      if (object) { return Object.keys(object).length; }
    }
  }
function propsFilter (){

  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };

}

function phonenumber(){

      /* 
      Format phonenumber as: c (xxx) xxx-xxxx
        or as close as possible if phonenumber length is not 10
        if c is not '1' (country code not USA), does not use country code
      */
      
      return function (number) {
        /* 
        @param {Number | String} number - Number that will be formatted as telephone number
        Returns formatted number: (###) ###-####
          if number.length < 4: ###
          else if number.length < 7: (###) ###
 
        Does not handle country codes that are not '1' (USA)
        */
          if (!number) { return ''; }
 
          number = String(number);
 
          // Will return formattedNumber. 
          // If phonenumber isn't longer than an area code, just show number
          var formattedNumber = number;
 
      // if the first character is '1', strip it out and add it back
    //var c = (number[0] == '1') ? '' : '';
    //number = number[0] == '1' ? number.slice(1) : number;
 
      // # (###) ###-#### as c (area) front-end
      var area = number.substring(0,2);
      var front = number.substring(2, 6);
      var end = number.substring(6, 10);
 
      if (front) {
        //formattedNumber = (c + "(" + area + ") " + front); 
        formattedNumber = ( area + " " + front );   
      }
      if (end) {
        formattedNumber += (" - " + end);
      }
      return formattedNumber;
      };
 
}


function fillZeroes() {

  return function( number, length ) {
    var n = number;
    var num = parseInt( n, 10 );

    if ( isNaN( num ) || isNaN( length ) ) {
      return n;
    }

    if ( num >= 0 ) {
      num = '' + num;
      while ( num.length < length ) {
        num = '0' + num;
      }
    }
    return num;
  }

}

function htmlAs($sce){
  return function(input){
    return $sce.trustAsHtml(input);
  }
}



})();
