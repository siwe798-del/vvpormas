(function () {
  'use strict';
  angular.module('app.module.core')
    .factory('listLinks', listLinks)

  /**
   * [reviewXTokenID]
   * Exist Review TokenID in HEADERs 
   */
  function listLinks() {
    var factListLinks = {},
      pathResourses = 'https://www.vepormas.com/recursos',
      pathFwpfPortal = 'https://www.vepormas.com/fwpf/portal',
      pathBannerImages = 'assets/images/banners/';

    //*bannersList
    factListLinks.bannersList = [{
        path: pathBannerImages + 'bnnr_mtu.jpg', //  MTU límite de operaciones
        withFunction: false
      },
      {
        path: pathBannerImages + 'bnnr_persona_vuln.jpg', //  personas vulnerables
        withFunction: false
      },
      {
        path: pathBannerImages + 'BANNER_BancaEnLinea_1_1.jpg', //  boomerang
        withFunction: 'modal',
        openModal: 'cashback'
      },
      {
        path: pathBannerImages + 'prevencion_fraudes.jpg', //  Prevención de Fraudes
        withFunction: false
      },
      {
        path: pathBannerImages + 'pagoServicios.jpg', //  Pago de Servicios
        withFunction: false
      },
      {
        path: pathBannerImages + 'imss.jpg', // IMSS - SIPARE
        withFunction: false
      },
      {
        path: pathBannerImages + 'tdd_digital.jpg', // TDD Digital
        withFunction: false
      },
      {
        path: pathBannerImages + 'convenio_imss.jpg', // Pensionados
        withFunction: false
      },
      {
        path: pathBannerImages + 'bancaLineaApple.jpg', // Apple Pay
        withFunction: 'link',
        urlRef: 'https://www.vepormas.com/fwpf/portal/documents/servicios-apple-pay',
        target: '_blank'
      }
    ];

    // *footerListLnk
    factListLinks.footerListLnk = [{
        href: pathResourses + '/resources/img/03MAY_GUIA_INVERSION.PDF',
        target: '_blank',
        txtFtrLnk: 'Guía de servicios de inversión'
      },
      {
        href: pathFwpfPortal + '/documents/tips-de-seguridad',
        target: '_blank',
        txtFtrLnk: 'Tips de seguridad'
      },
      {
        href: pathResourses + '/res/html/terminos_condiciones.pdf',
        target: '_blank',
        txtFtrLnk: 'Términos y condiciones'
      },
      {
        href: pathFwpfPortal + '/documents/aviso-legal',
        target: '_blank',
        txtFtrLnk: 'Aviso legal'
      }
    ];

    // *headerListLnk
    factListLinks.headerListLnk = [{
        href: pathFwpfPortal + '/documents/sucursales',
        target: '_blank',
        txtHdrLnk: 'Sucursales',
      },
      {
        href: pathFwpfPortal + '/documents/llamenme-ahora',
        target: '_blank',
        txtHdrLnk: 'Contacto'
      },
      {
        href: pathFwpfPortal + '/documents/manuales-banca-en-linea',
        target: '_blank',
        txtHdrLnk: 'Ayuda'
      }
    ];

    //*operativeListLnk
    factListLinks.operativeListLnk = [{
        callFunction: 'sincronizar',
        txtOperLnk: 'Sincroniza tu token',
      },
      {
        callFunction: 'desbloqueo',
        txtOperLnk: ' Desbloqueo'
      },
      {
        callFunction: 'recuperarContrasena',
        txtOperLnk: '¿Olvidaste tu contraseña?'
      }
    ];




    return factListLinks;
  }

  /****** Fin del archivo ****/
})();
