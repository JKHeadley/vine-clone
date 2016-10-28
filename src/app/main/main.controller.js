(function() {
  'use strict';

  angular
    .module('vineClone')
    .controller('MainController', MainController)

    .directive('uiVideo', function () {
      var vp; // video player object to overcome one of the angularjs issues in #1352 (https://github.com/angular/angular.js/issues/1352). when the videojs player is removed from the dom, the player object is not destroyed and can't be reused.
      var videoId = Math.floor((Math.random() * 1000) + 100); // in random we trust. you can use a hash of the video uri

      return {
        scope: {
          video: '='
        },
        restrict: 'E',
        template: '<div class="video">' +
        '<video ng-src="{{video.src}}" id="video-' + videoId + '" class="video-js vjs-default-skin" controls preload="auto" >' +
        '</video></div>',
        link: function (scope, element, attrs) {
          vp = videojs('video-' + videoId, {width: 640, height: 480 });//NOTE: videoId isn't actually changing between instances. Need to fix this.
        }
      };
    });

  /** @ngInject */
  function MainController($log, $uibModal, $sce) {
    var vm = this;
    vm.videos = [];
    vm.upload = upload;

    function upload() {
      $uibModal.open({
        templateUrl: 'app/components/add-video/add-video-modal.html',
        controller: 'addVideoModal',
        backdrop: 'static'
      })
      .result
      .then(function (result) {
        $log.log("result:", result);
        result.src = $sce.trustAsResourceUrl(result.src);

        vm.videos.push(result);
      })
    }

  }
})();


