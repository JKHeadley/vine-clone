(function() {
  'use strict';

  angular
    .module('vineClone')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
