(function () {

  angular.module('app.module.core')
    .service('RSAEnrichedRequestService', RSAEnrichedRequestServiceFunction);
    RSAEnrichedRequestServiceFunction.$inject = ['$log', 'paramsFixed'];

    function RSAEnrichedRequestServiceFunction($log, paramsFixed) {
      /* Private */
      /**
       * @name  findAccountData Obtiene la cuenta que haga match con numCta del array de cuentas.
       * @param  {Array} arrCuentas cuentas orginen destino
       * @param  {String} numCta     número de cuenta a buscar
       * @param  {String} nodeNumCta     Propiedad que debe hacer match vs numCta
       * @return {object}             la cuenta encontrada | undefined si no existe
       */
      function findAccountData (arrCuentas, numCta, nodeNumCta) {
        if (!arrCuentas) return undefined;
        return arrCuentas.find(function (account) {
          return account[nodeNumCta] == numCta;
        });
      }

      /**
       * Obtiene el response de algun endpoint almacenado en buffer
       * @param  {String} strEndpoint endpoint string a buscar
       * @param  {Array} buffer      
       * @return {Array}      response del endpoint
       */
      function getDataFromBuffer(strEndpoint, buffer) {
        return buffer.find(function (itemBuffer) {
          return Object.keys(itemBuffer)[0] === strEndpoint;
        });
      }

      function getUserProfile(){
        var user = paramsFixed.user();
        if (user == "") return user;   
        return user.hasOwnProperty('profile') && user['profile'] ? user['profile']: "";
      }

      function getConfigAttributes(endpoint) {
        var configTransaction = {
          "endpointCtaDestino":   "cdcc01",
          "propToEnrich":         "traspaso",
          "tipoBancoDestino":     "cuentasDestinoOtrosBancosList",
          "nodeAlias":            "alias",
          "nodeCtaOrigenMatch":   "nroCuenta",      // nodo a comparar, debe hacer match con numCtaOrigen
          "nodeCtaDestinoMatch":  "cuenta",         // nodo a comparar, debe hacer match con numCtaDestino
          "nodeNumCtaOrigen":     "cuentaOrigen",   // nodo de donde se toma el número de cta origen, de sourceDataRequest
          "nodeNumCtaDestino":    "cuentaDeposito"  // nodo de donde se toma el número de cta destino de sourceDataRequest
        };

        configTransaction.nodeWithNumCtaOrigen  = configTransaction.propToEnrich;
        configTransaction.nodeWithNumCtaDestino = configTransaction.propToEnrich; 

        switch(endpoint) {
          case "tx/tintwb04":     // internacional
              configTransaction.endpointCtaDestino  = "priwb01";
              configTransaction.propToEnrich        = "internacional";
              configTransaction.nodeNumCtaDestino   = "numeroCuentaDestino";
              configTransaction.nodeWithNumCtaOrigen= "internacional";
              configTransaction.nodeWithNumCtaDestino= "internacional";
            break;
          case "tx/tcptwb01":
              configTransaction.endpointCtaDestino  = "cccrwb01";
              configTransaction.nodeAlias           = "aliasCuenta";
              configTransaction.nodeCtaDestinoMatch = "nroCuenta";
            break;
          case "tx/tmbtwb02":
              configTransaction.endpointCtaDestino  = "cdcc01";
              configTransaction.tipoBancoDestino    = "cuentasDestinoMismoBancoList";
            break;
          case "tdcpwb01": //TDC
              configTransaction.endpointCtaDestino  = "tdccwb03";
              configTransaction.propToEnrich        = "pagotdc";
              configTransaction.tipoBancoDestino    = "list";
              configTransaction.nodeCtaDestinoMatch = "numTarjetaCredito";
              configTransaction.nodeNumCtaDestino   = "numTarjetaCredito";
              configTransaction.nodeNumCtaOrigen    = "nroCuenta";
              configTransaction.nodeWithNumCtaOrigen= "cuenta";
              configTransaction.nodeWithNumCtaDestino="pagotdc";
            break;
          case "sgttwb01": //SPID
              configTransaction.endpointCtaDestino  = "scpcwb04";
              configTransaction.tipoBancoDestino    = "preregistros";
              configTransaction.nodeCtaDestinoMatch = "clabeCtaDestino";
              configTransaction.nodeNumCtaDestino   = "nroCuentaDestino";
              configTransaction.nodeNumCtaOrigen    = "nroCuenta";
            break;
          case "pdspwb01": // PAGO SERVICIOS
              configTransaction.endpointCtaDestino  = "pdscgwb08";
              configTransaction.tipoBancoDestino    = "serviciosList";
              configTransaction.nodeNumCtaOrigen    = "nroCuenta";
            break;   
          case 'pdipr01': //pago de impuestos
              configTransaction.nodeWithNumCtaOrigen= "";
            break;
          case 'divisas/div05':
              configTransaction.nodeNumCtaOrigen    = "numeroCuentaCargo";
              configTransaction.nodeNumCtaDestino   = "numeroCuentaBeneficiario";
              configTransaction.tipoBancoDestino    = "cuentasDestinoMismoBancoList";
            break;
          case 'divisas/div06':
              configTransaction.nodeNumCtaOrigen    = "numeroCuentaCargo";
              configTransaction.nodeNumCtaDestino   = "numeroCuentaBeneficiario";
            break;
          case 'cdtm01': //modificacion de cuentas (spei & mismo banco)
              configTransaction.nodeNumCtaDestino   = "idPreRegistro";
              configTransaction.nodeCtaDestinoMatch = "idPreregistro";
            break;
          case 'cdtm02': //modificacion de cuentas propias
              configTransaction.endpointCtaDestino  = "cccsfwb11";
              configTransaction.nodeNumCtaDestino   = "nroCuentaDestino";
              configTransaction.nodeCtaDestinoMatch = "nroCuenta";
            break;
          case 'coptwb04':
              configTransaction.endpointCtaDestino  = "copcwb01";
              //[folio] - para saber cual operacion tomar del array de operaciones por autorizar
              configTransaction.nodeNumCtaDestino   = "folio";
              configTransaction.nodeCtaDestinoMatch = "folio";
        }
        return configTransaction;
      }

      /**
       * Obtiene el número cuenta destino para cada transacción.
       * @return {String} número de cuenta destino.
       */
      function getNumCuentaDestino(listaCuentas, numCtaDestino, nodeCtaDestinoMatch, endpoint, buffer) {
        var cuentaDestino = findAccountData( listaCuentas, numCtaDestino, nodeCtaDestinoMatch);
        var cuentaDestinoByBuffer, arrCtasDestino, 
            cuentasDestinoMismoBancoList, dobleSearch = ["divisas/div06", "cdtm01"];
        
        if (!cuentaDestino) {
          switch(true) {
            case endpoint == dobleSearch[0]:
              //buscando en cuentasDestinoMismoBancoList
              var ctasDestino = getDataFromBuffer("cdcc01", buffer);
              var arrCtas = ctasDestino[Object.keys(ctasDestino)[0]];
              cuentaDestino = findAccountData( arrCtas.data.data['cuentasDestinoMismoBancoList'], numCtaDestino, nodeCtaDestinoMatch);
              
              if (!cuentaDestino) { //buscando en priwb01
                cuentaDestinoByBuffer = getDataFromBuffer("priwb01", buffer)
                arrCtasDestino        = cuentaDestinoByBuffer[Object.keys(cuentaDestinoByBuffer)[0]]
                cuentaDestino         = findAccountData(arrCtasDestino.data.data, numCtaDestino, nodeCtaDestinoMatch)
              }
            break;
            case endpoint == dobleSearch[1]:
              //Sí no se encontró en cuentasDestinoOtrosBancosList buscamos en cuentasDestinoMismoBancoList, solo para MODIFICACION DE CUENTAS (SPEI & MISMO BANCO)
              cuentaDestinoByBuffer = getDataFromBuffer("cdcc01", buffer);
              arrCtasDestino        = cuentaDestinoByBuffer[Object.keys(cuentaDestinoByBuffer)[0]];
              cuentasDestinoMismoBancoList  = getArrCuentasDestino( endpoint, {"tipoBancoDestino": 'cuentasDestinoMismoBancoList'}, arrCtasDestino);
              cuentaDestino  = findAccountData(cuentasDestinoMismoBancoList, numCtaDestino, nodeCtaDestinoMatch);
          }
        }
        return cuentaDestino;
      }

      /**
       * Obtiene el número de cuenta origen del request de la transacción.  
       * @param  {String} endpoint          Servicio a evaluar  
       * @param  {object} sourceDataRequest Data del request
       * @param  {Object} config            Configuración para enriquecer request.
       * @return {string}                   numero de cuenta origen.
       */
      function getTransactionNumCtaOrigen (endpoint, sourceDataRequest, config) {
        switch(endpoint) {
          case "sgttwb01":      //spid
          case "divisas/div05": //
          case "divisas/div06": //
            return sourceDataRequest.data[config.nodeNumCtaOrigen];
            break;
          default:
            return sourceDataRequest.data[config.nodeWithNumCtaOrigen][config.nodeNumCtaOrigen] 
        }
      }

      /**
       * Obtiene el número de cuenta destino del request de la transacción.  
       * @param  {String} endpoint          Servicio a evaluar  
       * @param  {object} sourceDataRequest Data del request
       * @param  {Object} config            Configuración para enriquecer request.
       * @return {string}                   numero de cuenta destino.
       */
      function getTransactionNumCtaDestino (endpoint, sourceDataRequest, config) {
        switch(endpoint) {
          case "sgttwb01":      //spid
          case "divisas/div05": //
          case "divisas/div06": //
          case "cdtm01":
          case "cdtm02":
          case "coptwb04":
            return sourceDataRequest.data[config.nodeNumCtaDestino];
            break;
          default:
            return sourceDataRequest.data[config.nodeWithNumCtaDestino][config.nodeNumCtaDestino];  
        }
      }

      /**
       * Obtiene el array de cuentas destino de acuerdo a la transacción en curso.
       * @param  {String} endpoint       servicio a evaluar
       * @param  {object} config         configuración
       * @param  {Array} arrCtasDestino  response con data de cuentas destino.
       * @return {Array}                Lista de cuentas destino
       */
      function getArrCuentasDestino (endpoint, config, arrCtasDestino) {
        switch(endpoint) {
          case "tx/tintwb04": //internacional
            return arrCtasDestino.data.data;
            break;
          case 'tx/tcptwb01': //ctas propias
            return arrCtasDestino.data.data.cuentas.listaCuenta;
            break;
          case 'coptwb04':    //AUTORIZACION DE OPEACIONES
            return arrCtasDestino.data.data.operacionLista;
          default:
            return arrCtasDestino.data.data[config.tipoBancoDestino];
        }
      }

      function enrichedSourceDataRequest(sourceDataRequest, endpoint, config, cuentaOrigen, cuentaDestino) {

        var extraProps = {
            ctaOrigenSaldo:   cuentaOrigen  ? cuentaOrigen.saldoDisponibleCta: "",
            ctaOrigenAlias:   cuentaOrigen  ? cuentaOrigen.aliasCuenta ? cuentaOrigen.aliasCuenta: "": "",
            ctaDestinoAlias:  cuentaDestino ? cuentaDestino[config.nodeAlias]: "",
            ctaOrigenMoneda:  cuentaOrigen  ? cuentaOrigen.monedaCuenta: ""
        };

        switch(endpoint) {
          case "tx/tcptwb01":         //TRASPASO CUENTAS PROPIAS (MISMO BANCO)
              extraProps.tipoPersona = getUserProfile();
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              extraProps.tipoFirma = cuentaOrigen ? cuentaOrigen.tipoFirma: "";
              sourceDataRequest.data[config.propToEnrich] = angular.extend(sourceDataRequest.data[config.propToEnrich], extraProps);
            break;
          case "tx/tintwb04":         //TRANSFERENCIA INTERNACIONAL
              extraProps.tipoPersona = getUserProfile();
              extraProps.tipoFirma = cuentaOrigen ? cuentaOrigen.tipoFirma: "";
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              sourceDataRequest.data[config.propToEnrich] = angular.extend(sourceDataRequest.data[config.propToEnrich], extraProps);
            break;
          case "tx/tmbtwb02":         //TRASPASO CTAS TERCEROS (MISMO-BANCO)
              extraProps.tipoPersona = getUserProfile();
              extraProps.bancoDestino = cuentaDestino ? cuentaDestino.codigoBancoDestino: ""; 
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              extraProps.tipoFirma = cuentaOrigen ? cuentaOrigen.tipoFirma: "";
              sourceDataRequest.data[config.propToEnrich] = angular.extend(sourceDataRequest.data[config.propToEnrich], extraProps);
            break;
          case "tx/tobtwb03":         // SPEI
              extraProps.tipoFirma = cuentaOrigen ? cuentaOrigen.tipoFirma: "";
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";   
              extraProps.tipoPersona = getUserProfile();
              extraProps.ctaDestinoNombre = cuentaDestino ? cuentaDestino.beneficiario : '';
              sourceDataRequest.data[config.propToEnrich] = angular.extend(sourceDataRequest.data[config.propToEnrich], extraProps);
            break;
          case "tdcpwb01":            // TDC
              delete extraProps.ctaOrigenAlias;
              delete extraProps.ctaOrigenSaldo;
              delete extraProps.ctaOrigenMoneda;
              extraProps.ctaDestinoNombre = cuentaDestino ? cuentaDestino.nombreCompletoTDCCtaDestino : '';
              sourceDataRequest.data[config.propToEnrich] = angular.extend(sourceDataRequest.data[config.propToEnrich], extraProps);
              var extraPropsCta = {
                aliasCuenta:        cuentaOrigen ? cuentaOrigen.aliasCuenta : "",
                saldoDisponibleCta: cuentaOrigen ? cuentaOrigen.saldoDisponibleCta : "",
              };
              sourceDataRequest.data.cuenta = angular.extend(sourceDataRequest.data.cuenta, extraPropsCta);
            break;
          case "sgttwb01":            // SPID
              delete extraProps.ctaOrigenMoneda;
              extraProps.tipoPersona = getUserProfile();
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              extraProps.tipoFirma = cuentaOrigen ? cuentaOrigen.tipoFirma: "";   
              var enrichData = angular.extend(sourceDataRequest.data, extraProps);
              sourceDataRequest.data = {};
              sourceDataRequest.data = enrichData;
            break;
          case "divisas/div05":   //COMPRA DIVISAS
              extraProps.tipoPersona = getUserProfile();
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              extraProps.codigoBancoDestino = cuentaDestino ? cuentaDestino.codigoBancoDestino: "";
              extraProps.ctaDestinoNombre = cuentaDestino ? cuentaDestino.beneficiario : '';
              var enrichData = angular.extend(sourceDataRequest.data, extraProps);
              sourceDataRequest.data = {};
              sourceDataRequest.data = enrichData;
            break;
          case "divisas/div06":  //VENTA DIVISAS
              extraProps.tipoPersona = getUserProfile();
              extraProps.tipoProducto = cuentaOrigen ? cuentaOrigen.tipoProducto: "";
              extraProps.codigoBancoDestino = !cuentaDestino ? "":cuentaDestino.hasOwnProperty('bancoBeneficiarioClaveCuenta') ? 
                                              cuentaDestino.bancoBeneficiarioClaveCuenta: cuentaDestino.codigoBancoDestino; //from cdcc01 || priwb01
              extraProps.ctaDestinoNombre = cuentaDestino ? cuentaDestino.beneficiario : '';
              var enrichData = angular.extend(sourceDataRequest.data, extraProps);
              sourceDataRequest.data = {};
              sourceDataRequest.data = enrichData;
            break;
          case "cdtm01":       //MODIFICACION DE CTAS (SPEI & MISMO-BANCO)
              //sourceDataRequest.data = angular.extend(sourceDataRequest.data, {"nroCuentaDestino": cuentaDestino.cuenta})
              var extraProps =  {"monedaCuentaDestino": cuentaDestino.monedaCuentaDestino, "codigoBancoDestino": cuentaDestino.codigoBancoDestino};
              sourceDataRequest.data = angular.extend(sourceDataRequest.data, extraProps)
            break;
          case "coptwb04":    // AUTORIZACIÓN DE OPERACIONES.
              delete extraProps.ctaOrigenAlias;
              delete extraProps.ctaOrigenSaldo;
              delete extraProps.ctaOrigenMoneda;
              extraProps.moneda     = cuentaDestino ? cuentaDestino.divisa : "";
              extraProps.monto      = cuentaDestino ? cuentaDestino.monto : "";
              extraProps.ctaDestino = cuentaDestino ? cuentaDestino.cuentaDeposito : "";
              extraProps.ctaDestinoNombre = cuentaDestino ? cuentaDestino.beneficiario : "";
              extraProps.tipoPersona = getUserProfile();
              sourceDataRequest.data = angular.extend(sourceDataRequest.data, extraProps)
            break;
        }

        return sourceDataRequest;
      }

      /**
       * Enrich sourceDataRequest by transaction type
       * @param  {Object}  sourceDataRequest main request body
       * @param  {Array}  buffer            buffer 
       * @param  {String}  endpoint          current transaction to enrich
       * @return {Object}                   enriched source data trasaction
       */
      function isTransaction(sourceDataRequest, buffer, endpoint) {
        var config = getConfigAttributes(endpoint);
        
        var cuentaOrigenByBuffer  = getDataFromBuffer('cccwb01', buffer);
        var cuentaDestinoByBuffer = getDataFromBuffer(config.endpointCtaDestino, buffer);
 
        var arrCtasOrigen  = cuentaOrigenByBuffer[Object.keys(cuentaOrigenByBuffer)[0]];
        var arrCtasDestino = cuentaDestinoByBuffer[Object.keys(cuentaDestinoByBuffer)[0]];
        
        var numCtaOrigen  = getTransactionNumCtaOrigen(endpoint, sourceDataRequest, config);
        var numCtaDestino = getTransactionNumCtaDestino(endpoint, sourceDataRequest, config);

        var cuentaOrigen  = findAccountData( arrCtasOrigen.data.data.cuentas.listaCuenta, numCtaOrigen, config.nodeCtaOrigenMatch);
        
        var listaCuentas  = getArrCuentasDestino(endpoint, config, arrCtasDestino);

        var cuentaDestino = getNumCuentaDestino(listaCuentas, numCtaDestino, config.nodeCtaDestinoMatch, endpoint, buffer);
        
        var enrichedSourceData = enrichedSourceDataRequest(sourceDataRequest, endpoint, config, cuentaOrigen, cuentaDestino);
        return enrichedSourceData;
      }

      function createAndUpdateAccount(sourceDataRequest, buffer, endpoint) {
        var isCtasPropias = endpoint === "cdtm02";
        var config = getConfigAttributes(endpoint);
        var cuentaByBuffer  = getDataFromBuffer(config.endpointCtaDestino, buffer);

        var arrCtas         = cuentaByBuffer[Object.keys(cuentaByBuffer)[0]];
        if ( isCtasPropias ) {
          var numCtaDestino = getTransactionNumCtaDestino(endpoint, sourceDataRequest, config);
          var listaCuentas  = arrCtas.data.data.cuentas.listaCuenta;
          var ctaToModify   = findAccountData( listaCuentas, numCtaDestino, config.nodeCtaDestinoMatch);
          //sourceDataRequest.data = angular.extend(sourceDataRequest.data, {"tipoCuentaDestino": ctaToModify.tipoProducto})
          sourceDataRequest.data = angular.extend(sourceDataRequest.data, {"monedaCuentaDestino": ctaToModify.monedaCuenta})
          return sourceDataRequest;
        }
        //Obtenemos idPreregistro de la request (ya que es el unico dato con el cual podemos buscar en las cuentas de cdcc01) 
        var numIdPreregistro = getTransactionNumCtaDestino(endpoint, sourceDataRequest, config);
        var cuentasDestinoOtrosBancosList  = getArrCuentasDestino(endpoint, config, arrCtas);
        //como no sabemos si es modificacion SPEI o MISMO banco, buscamos {idPreregistro} en ambos arrays 
        //de cuentas en cdcc01 -> [cuentasDestinoMismoBancoList, cuentasDestinoOtrosBancosList]
        var ctaToModify = getNumCuentaDestino(cuentasDestinoOtrosBancosList, numIdPreregistro, config.nodeCtaDestinoMatch, endpoint, buffer);
        return enrichedSourceDataRequest(sourceDataRequest, endpoint, config, undefined, ctaToModify);
      }

      function authorizeOperations(sourceDataRequest, buffer, endpoint) {
        var config                = getConfigAttributes(endpoint);
        var cuentaDestinoByBuffer = getDataFromBuffer(config.endpointCtaDestino, buffer);
        var arrCtasDestino        = cuentaDestinoByBuffer[Object.keys(cuentaDestinoByBuffer)[0]];       
        var numFolio              = getTransactionNumCtaDestino(endpoint, sourceDataRequest, config);
        var listaCuentas          = getArrCuentasDestino(endpoint, config, arrCtasDestino);
        var operacionXAutorizar   = getNumCuentaDestino(listaCuentas, numFolio, config.nodeCtaDestinoMatch, endpoint, buffer);
        return enrichedSourceDataRequest(sourceDataRequest, endpoint, config, undefined, operacionXAutorizar);
      }
        

      /* Public */
      /**
       * @name RSAEnrichedRequestService.extend
       * @description ...
       * @requires ...
       * @param  {object} _sourceTransaction ...
       * @param  {object} _sourceDataRequest ...
       * @param  {Array} _buffer ...
       * @return {object} ...
       */
      function extendService(_sourceTransaction, _sourceDataRequest, _buffer) {
     
        switch(_sourceTransaction) {
          case 'tx/tobtwb03':   // ****            SPEI                       ****
          case 'tx/tintwb04':   // ****  TRANSFERENCIA INTERNACIONAL          ****
          case 'tx/tmbtwb02':   // **** TRASPASO CTAS TERCEROS (MISMO-BANCO)  ****
          case 'tx/tcptwb01':   // **** TRASPASO CTAS PROPIAS (MISMO BANCO)   ****
          case 'tdcpwb01':      // ****           PAGO TDC                    ****
          case 'sgttwb01':      // ****            SPID                       ****
          case 'divisas/div06': // ****         VENTA DIVISAS                 ****
          case 'divisas/div05': // ****         COMPRA DIVISAS                ****
            return isTransaction(_sourceDataRequest, _buffer, _sourceTransaction);
            break;
          case 'coptwb04':
            return authorizeOperations(_sourceDataRequest, _buffer, _sourceTransaction);
            break;
          //case 'pdipr01':     //               PAGO IMPUESTOS
          //case 'pdspwb01':    // ****          PAGO SERVICIOS               ****
          case 'cdtm01':        // **** MODIFICACION CTAS SPEI & MISMO BANCO  ****
          case 'cdtm02':        // ****    MODIFICACION DE CUENTAS PROPIAS    ****
            return createAndUpdateAccount(_sourceDataRequest, _buffer, _sourceTransaction);
            break;        
          case 'cdta01':        // ****   ALTA DE CTAS MISMO BANCO & SPEI     ****
          case 'priwb02':       // ****     ALTA DE CTAS INTERNACIONAL        ****
          case 'saptwb02':      // ****         ALTA DE CTAS SPID             ****
          case 'smptwb05':      // ****       MODIFICACION CTAS SPID          ****/
          case 'loginwb05':     // ****       LOGIN DON'T ENRICH DATA         ****
          default:
              return _sourceDataRequest;
        }
      }

      /////////////////////
      // Service exposes //
      /////////////////////
      return {
        extend: extendService
      }
    }
})();
