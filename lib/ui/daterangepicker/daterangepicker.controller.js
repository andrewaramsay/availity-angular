(function(root) {
  'use strict';

  var availity = root.availity;

  //vm.setValue = function () {
  //  var viewValue = vm.ngModel.$modelValue;
  //  if (!viewValue ) {
  //    console.log('no viewValue');
  //    return;
  //  }
  //  return viewValue;
  //};

  //vm.setNgModel = function (ngModel) {
  //  this.ngModel = ngModel;
  //};

  //vm.findModel = function () {
  //
  //  var ngModel = null;
  //
  //  var $input = $element.find('input:first').andSelf();
  //  if ($input.length) {
  //    ngModel = $input.data(avDateRangeConfig.CONTROLLER);
  //    vm.setNgModel(ngModel);
  //  }
  //
  //  return ngModel;
  //};

  //vm.modelToView = function () {
  //  //debugger;
  //  var viewValue = vm.ngModel.$modelValue;
  //
  //  $scope.daterange.startDate = viewValue[0];
  //  $scope.daterange.endDate = viewValue[1];
  //
  //  //if (viewValue != null) {
  //  //  vm.ngModel.$setViewValue($scope.daterange);
  //  //  vm.ngModel.$render();
  //  //}
  //
  //  return viewValue;
  //};

  //vm.viewToModel = function () {
  //  //var localDate = vm.ngModel.$viewValue[0] + vm.ngModel.$viewValue[1];
  //  var localDate = vm.ngModel.$viewValue;
  //  return localDate;
  //};

  //vm.plugin = function () {
  //  return $element.data('daterangepicker');
  //};

  //if(!ngModel) {
  //  ngModel = scope.vm.findModel();
  //  if(!ngModel) {
  //    $log.error('avDatepicker requires ngModel');
  //    return;
  //  }
  //}

  //scope.vm.setNgModel(ngModel);
  //
  //// (view to model)
  //ngModel.$parsers.push(scope.vm.viewToModel);
  //
  //// (model to view) - added to end of formatters array
  //// because they are processed in reverse order.
  //// if the model is in Date format and send to the validation framework
  //// prior to getting converted to the expected $viewValue format,
  //// the validation will fail.
  //ngModel.$formatters.push(scope.vm.modelToView);
  //
  //var _$render = ngModel.$render;
  //ngModel.$render = function() {
  //  _$render();
  //  scope.vm.setValue();
  //};
})(window);
