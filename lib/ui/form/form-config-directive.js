(function(root) {
  "use strict";

  var availity = root.availity;

  //require('foundation/js/av-core/ui/form-config/form.config.service');

  availity.ui.directive('avFormConfig', function(avFormConfigService, $compile, $timeout) {
    return {
      restrict: "A",
      scope: {
        baseFormConfig: "=",
        baseOverrides: "=",
        payerConfigMap: "=",
        defaultConfigs: "=",
        tranType: "@",
        customerId: "=",
        payerId: "=",
        requestModels: '=',
        ruleSet: '=',
        runOnLoad: '@',
        editMode: '='
      },
      link: function($scope, element, attributes) {
        var mode, form;

        var getRequestForm = function(deferred) {
          mode = $scope.editMode;
          $timeout(function() {
            if(form) {
              form.scope().$destroy();
            }
            avFormConfigService.getRequestForm(
              $scope.baseFormConfig,
              $scope.baseOverrides,
              $scope.payerConfigMap,
              $scope.defaultConfigs,
              $scope.tranType,
              $scope.payerId,
              $scope.customerId,
              $scope.requestModels,
              $scope.ruleSet,
              $scope.editMode
            ).then(function(formData) {
              form = formData.form;
              $scope.$parent.formConfigData = formData.customScope;
              form = $compile(form)($scope.$parent.$new());
              element.html(form);
              if(deferred) {
                deferred.resolve(form);
              }
            });
          });
        };

        var resetForm = function(deferred) {
          element.find('form').controller('form').$setPristine();
          $timeout(function() {
            if($scope.editMode !== mode) {
              getRequestForm(deferred);
            } else {
              avFormConfigService.setDefaultValues($scope.requestModels);
              getRequestForm(deferred);
            }
          });
        };

        var myId = attributes.formConfigId;
        if(myId) {
          avFormConfigService.registerInstance(myId, {update: getRequestForm, reset: resetForm});
        }
        $scope.$on("$destroy", function() {
          avFormConfigService.unregisterInstance(myId);
        });
        if($scope.runOnLoad) {
          getRequestForm();
        }
      }
    };
  });

})(window);
