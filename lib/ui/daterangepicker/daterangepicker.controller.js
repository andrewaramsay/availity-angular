(function(root) {
  'use strict';

  var availity = root.availity;

  AvDateRangeController.$inject = ['$scope', '$element', 'avDateRangeConfig'];
  function AvDateRangeController($scope, $element, avDateRangeConfig) {
    var vm = this;

    $scope.startDate = '';
    $scope.endDate = '';
    $scope.daterange = [];

    vm.setStartDate = function (date) {
      $scope.startDate = date;
      return startDate;
    };

    vm.setDateRange = function () {
      $scope.daterange = [];
      $scope.daterange.push($scope.startDate.format('MM-DD-YYYY'));
      $scope.daterange.push($scope.endDate.format('MM-DD-YYYY'));

      alert($scope.daterange);
      return $scope.daterange;
    };

    vm.getDateRange = function () {
      return $scope.daterange;
    };

    vm.open = function () {

    };

    vm.checkRange = function () {
      console.log('cancel');
    };

    vm.isValidDateRange = function () {
      if ($scope.startDate != null) {
        if ($scope.startDate.isBefore($scope.endDate) || $scope.startDate.isSame($scope.endDate)) {
          console.log('valid date');

          //vm.shadeRange();
          vm.setDateRange();

        }
        else {
          $scope.startDate = $scope.endDate;
          $scope.endDate = null;
          console.log('endDate is before startDate');
          return false;
        }
      }
      return true;
    };

    vm.shadeRange = function () {
      var btwDates = moment();
      if (vm.isValidDateRange()) {
        if (btwDates.isBetween($scope.daterange)) {
          btwDates.addClass('.hover');
        }
        debugger;
        return;
      }
    };

    vm.hoverRange = function () {
      if ($scope.startDate) {

      }
    };

    vm.setValue = function () {

      var viewValue = vm.ngModel.$modelValue;
      var plugin = this.plugin();

      if (!viewValue || !plugin) {
        return;
      }

      plugin.setDates(viewValue);
    };

    vm.setNgModel = function (ngModel) {
      this.ngModel = ngModel;
    };

    vm.findModel = function () {

      var ngModel = null;

      var $input = $element.find('input:first').andSelf();
      if ($input.length) {
        ngModel = $input.data(avDateRangeConfig.CONTROLLER);
        vm.setNgModel(ngModel);
      }

      return ngModel;
    };

    vm.modelToView = function () {
      var viewValue = vm.ngModel.$modelValue;
      return viewValue;
    };

    vm.viewToModel = function () {
      var format = 'MM-DD-YYYY';

      var localDate = vm.ngModel.$viewValue;
      console.log(localDate);
      return localDate;
    };

    vm.plugin = function () {
      return $element.data('');
    };

    vm.destroy = function () {
      var plugin = this.plugin();
      if (plugin) {
        plugin.remove();
        $element.data('daterange', null);
      }
    };

    vm.hide = function () {
      var plugin = this.plugin();
      if (plugin) {
        plugin.hide();
      }
    };


    $scope.isVisible = false;

    vm.show = function () {
      $element.click(function (e) {
        $scope.isVisible = true;
      });
    };

  }

  availity.ui.controller('AvDateRangeController', AvDateRangeController);
})(window);
