/*
 @example
 <form name="formExample" role="form">
 <input type="text" name="example" ng-model="example.model" validator="text">
 <button validation-submit="formExample">Prueba</button>
 </form>
 */

(function () {
  'use strict';
  angular.module('validation.rule', ['validation']).config(['$validationProvider',
    function ($validationProvider) {
      var expression = {
        /*  De esta forma comprobamos que los campos sean requeridos       */
        required: function (value, scope, element, attrs, param) {
          if (value === null) {
            return true;
          } else {
            return !!(value || element[0].value || attrs.value);
          }
        },
        /* Permite una cadena que posea letras de A a Z en mayúsculas y/o minusculas, números del 0 al 9 y con una extensión de entre 6 y 15 caracteres */
        token: /^[a-zA-Z0-9]{6,15}$/,
        /*  De esta forma comprobamos que un URL sea válido        */
        url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        /*  De esta forma comprobamos que sólo se introduzcan LETRAS sin NÜMEROS   */
        text: /^[a-zA-Z0-9_ ]*$/,
        /*  De esta forma comprobamos que sólo se introduzcan números ENTEROS sin DECIMALES       */
        number: /^\d+$/,
        /* De esta forma comprobamos que sólo se introduzcan números ENTEROS con hasta 7 DECIMALES */
        decimal: /^[0-9]+(\.[0-9]{1,7})?$/,
        /* De esta forma comprobamos que sólo se introduzcan números ENTEROS, NEGATIVOS, PUNTO y DECIMALES */
        latlong: /^-?([1-9]{1,3}?[1-9]{1,3}|[0-9]{1,3})\.{1}\d{1,6}/,
        /* De esta forma comprobamos que un Codigo Postal sea válido*/
        codepostal: /^([1-9]{2}|[0-9][1-9]|[1-9][0-9])[0-9]{3}$/,
        /*  De esta forma comprobamos que se introduzcan números separados por una coma divididos
         en segmentos de 3 y que contenga 2 decimales     */
        /*  De esta forma comprobamos que un E-MAIL sea válido        */
        email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
        currency: /^(?!0\.00)\d{1,3}(,\d{3})*(\.\d\d)?$/, //
        /*  De esta forma comprobamos FECHAS */
        dateShort: /(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d\d/, // dd/mm/yy
        dateLarge: /(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.](19|20)\d\d/, // dd/mm/yyyy
        dateSql: /(19|20)\d\d[- \/.](0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])/, // yyyy/mm/dd
        /**
         De esta forma comprobaremos:
         Contraseñas que contengan al menos una letra mayúscula.
         Contraseñas que contengan al menos una letra minúscula.
         Contraseñas que contengan al menos un número o caracter especial.
         Contraseñas cuya longitud sea como mínimo 8 caracteres.
         Contraseñas cuya longitud máxima no debe ser arbitrariamente limitada.
         */
        password: /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$ /,
        passwordDebilRojo: function (p) {
          var returnValue = true;
          var _lowerLetters = (p.match(/[a-z]/g) || []).length;
          var _upperLetters = (p.match(/[A-Z]/g) || []).length;
          var _numbers = (p.match(/[0-9]/g) || []).length;

          var _flags = [_lowerLetters, _upperLetters, _numbers];
          var _passedMatches = $.grep(_flags, function (item) {
            return item > 0;
          }).length;
          if (_passedMatches < 3 || p.length < 8) {
            returnValue = false;
          }
          return returnValue;
        },
        /*
         Con este se validarán todos los número de teléfono
         pertenecientes a los listados en la Wikipedia:
         https://en.wikipedia.org/wiki/List_of_country_calling_codes
         */
        numtel: /^\+?\d{1,3}?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$/,
        /*De esta forma comprobamos qué tipo de tarjeta está registrando*/
        visaCard: /^4[0-9]{3}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/,
        masterCard: /^5[1-5][0-9]{2}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$/,
        /*  De esta forma comprobamos un límite mínimo de caracteres*/
        minlength: function (value, scope, element, attrs, param) {
          return value.length >= param;
        },
        /*  De esta forma comprobamos un límite máximo de caracteres*/
        maxlength: function (value, scope, element, attrs, param) {
          return value.length <= param;
        },
        numMobil: function (value, scope, element, attrs, param) {
          if (value.length == param) {
            return true;
          } else {
            var myModelReference = _.get(scope, attrs.ngModel);

            if (myModelReference) {
              return false;
            }

            return true;
          }
        },
        optionalNumtel: function (value) {
          var regexNumtel = /^\+?\d{1,3}?[- .]?\(?(?:\d{2,3})\)?[- .]?\d\d\d[- .]?\d\d\d\d$/;

          function isBlank(str) {
            return ( !str || /^\s*$/.test(str) );
          }

          if (isBlank(value)) {
            return true;
          } else {
            return regexNumtel.test(value);
          }
        },
        optionalEmail: function (value) {

          var regexEmail = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

          function isBlank(str) {
            return (!str || /^\s*$/.test(str));
          }

          if (isBlank(value)) {
            return true;
          } else {
            if (regexEmail.test(value)) {
              return true;
            } else {
              return false;
            }
          }
        },
        alphaNumerictextsinesp: function (value) {

          var regexAlphaNumericText = /^[a-zA-Z0-9 ]*$/;

          function isBlank(str) {
            return (!str || /^\s*$/.test(str));
          }

          if (isBlank(value)) {
            return true;
          } else {
            if (regexAlphaNumericText.test(value)) {
              return true;
            } else {
              return false;
            }
          }
          /*  NÜMEROS sin el cero  */
        },
        /* Checamos numeros enteros y positivos sin signo - */
        positiveNumber: /^[1-9]\d*$/,
        /* Se valida una dirección de correo, pero que no sea obligatoria */
        //optionalEmail: /^$|^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/,
        /* Similar al filtro de Texto, pero permitiendo cadenas vacias (no obligatorio) */
        optionalText: /^[\w+\s]*$/,
        /* Expresion regular OFICIAL del SAT para validar el RFC Persona Fisica o Moral */
        /* Fuente: ftp://ftp2.sat.gob.mx/asistencia_servicio_ftp/publicaciones/cfd/iedu.pdf, página 3 */
        requiredRFC: /[A-Z,a-z,Ñ,ñ,&]{3,4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z,a-z,0-9]?[A-Z,a-z,0-9]?[0-9,A-Z,a-z]?/,
        /*  De esta forma comprobamos que sólo se introduzcan LETRAS sin NÜMEROS   */
        charSpecial: /^[a-zA-Z0-9]*$/,
        /*  De esta forma comprobamos que un E-MAIL sea válido        */
        alphaNumericText: /^[a-zA-Z0-9 ]*$/
      };
      var defaultMsg = {
        required: {
          error: 'Este campo es requerido',
          success: ' '
        },
        url: {
          error: 'Dirección URL no válida',
          success: ' '
        },
        email: {
          error: 'Dirección de correo electrónico no válido',
          success: ' '
        },
        text: {
          error: 'No se permiten caracteres especiales',
          success: ' '
        },
        number: {
          error: 'No se permiten letras ni espacios, sólo numeros [0-9]',
          success: ' '
        },
        decimal: {
          error: 'No se permiten letras, sólo numeros [0-9] y decimales ',
          success: ' '
        },
        latlong: {
          error: 'Formato de coordenadas incorrecto',
          success: ' '
        },
        codepostal: {
          error: 'El código postal está mal escrito o incompleto',
          success: ' '
        },
        currency: {
          error: 'Formato de moneda inválido',
          success: ' '
        },
        dateShort: {
          error: 'Formato de fecha inválido, el corecto debe ser día / mes / año ',
          success: ' '
        },
        dateLarge: {
          error: 'Formato de fecha inválido, el corecto debe ser día / mes / año',
          success: ' '
        },
        dateSql: {
          error: 'Formato de fecha inválido, el corecto debe ser año / mes / día',
          success: ' '
        },
        password: {
          error: 'La Contraseña no cumple con los requirimientos',
          success: ' '
        },
        passwordDebilRojo: {
          error: 'Contraseña incorrecta, intente nuevamente',
          success: ' '
        },
        numtel: {
          error: 'La estructura del número telefónico no es la correcta',
          success: ' '
        },
        numMobil: {
          error: 'La estructura del número telefónico no es la correcta',
          success: ' '
        },
        visaCard: {
          error: 'La estructura del número de tarjeta no es la correcta',
          success: ' '
        },
        masterCard: {
          error: 'La estructura del número de tarjeta no es la correcta',
          success: ' '
        },
        minlength: {
          error: 'Error.',
          // error: 'No cumple con el número mínimo de caracteres solicitados',
          success: ' '
        },
        maxlength: {
          error: 'Ha superado el número de caracteres permitidos',
          success: ' '
        },
        token: {
          error: 'El número de token no es validado. Sólo acepta numeros, letras mayúsculas y/o minúsculas y entre 6 y 15 caracteres',
          success: ''
        },
        positiveNumber: {
          error: 'Solo números positivos sin decimales',
          success: ' '
        },
        optionalNumtel: {
          error: 'La estructura del número telefónico no es la correcta',
          success: ''
        },
        optionalEmail: {
          error: 'Dirección de correo electrónico no válido',
          success: ' '
        },
        optionalText: {
          error: 'No se permiten caracteres especiales',
          success: ' '
        },
        charSpecial: {
          error: 'No se permiten caracteres especiales ni espacios',
          success: ''
        },
        requiredRFC: {
          error: 'El RFC es incorrecto',
          success: ' '
        },
        alphaNumerictextsinesp: {
          error: 'Sólo se permiten letras y números.',
          success: ''
        },
        alphaNumericText: {
          error: 'Solo se permiten letras, números y espacios.',
          success: ''
        }
      };
      $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
      $validationProvider.setErrorHTML(function (defaultMsg) {
        return "<div class='arrow-up'></div><p class='validation-invalid'>" + defaultMsg + "</p>";
      });
    }
  ]);
}).call(this);
