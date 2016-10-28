(function() {
    'use strict';

    angular
    .module('vineClone')
    .controller('addVideoModal', addVideoModal);

    function addVideoModal($scope, $log, $http, Upload, $uibModalInstance) {
        $scope.vm = {
            title: null,
            video: null,
            progress: 0,
            addVideoFile: addVideoFile,
            upload: upload,
            cancel: cancel,
            done: done
        };

        var config = {};

        function init() {
            $http.get('./assets/config.json').success(function (data){
                config["AWSAccessKeyId"] = data.AWSAccessKeyId;
                config["policy"] = data.policy;
                config["signature"] = data.signature;
                config["s3url"] = data.s3url;
            });
        }

        init();

        var videoExtension = "";

        function addVideoFile(file) {
            if (file) {
                $scope.vm.video = file;
                $scope.add_video.file.$invalid = false;
                $scope.add_video.file.$error.required = false;

                videoExtension = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
            }
        }

        function upload() {
            if ($scope.add_video.$valid && $scope.vm.video) {
                Upload.upload({
                    url: config.s3url, //S3 upload url including bucket name
                    method: 'POST',
                    data: {
                        key: $scope.vm.title + "." + videoExtension, // the key to store the file on S3, could be file name or customized
                        AWSAccessKeyId: config.AWSAccessKeyId,
                        acl: 'public-read', // sets the access to the uploaded file in the bucket: private, public-read, ...
                        policy: config.policy,
                        signature: config.signature, // base64-encoded signature based on policy string (see article below)
                        "Content-Type": $scope.vm.video.type != '' ? $scope.vm.video.type : 'application/octet-stream', // content type of the file (NotEmpty)
                        filename: $scope.vm.title + "." + videoExtension, // this is needed for Flash polyfill IE8-9
                        file: $scope.vm.video
                    }
                }).then(function (resp) {
                    $log.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                    $log.log(resp);
                }, function (resp) {
                    $log.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.vm.progress = progressPercentage;
                    $log.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
            else {
                $scope.add_video.submitted = true;
                if (!$scope.vm.video) {
                    $scope.add_video.file.$invalid = true;
                    $scope.add_video.file.$error.required = true;
                }
            }
        }

        function cancel() {
            $uibModalInstance.close();
        }

        function done() {
            $log.log($scope.vm.video)
            $uibModalInstance.close({
                src: config.s3url + $scope.vm.title + "." + videoExtension,
                title: $scope.vm.title,
                ext: videoExtension
            })
        }

    }

})();
