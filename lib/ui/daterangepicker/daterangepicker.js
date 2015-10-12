(function(root) {
  'use strict';

  var availity = root.availity;

  availity.ui.constant('avDateRangeConfig', {
    CONTROLLER: '$ngModelController',
    TEMPLATE: 'ui/daterangepicker/daterangepicker-tpl.html'
  });

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
      //vm.shadeRange();
    };

    vm.isValidDateRange = function () {
      if ($scope.startDate != null) {
        if ($scope.startDate.isBefore($scope.endDate) || $scope.startDate.isSame($scope.endDate)) {
          console.log('valid date');

          //vm.shadeRange();
          vm.setDateRange();
          return true;
        }
        else {
          $scope.startDate = $scope.endDate;
          $scope.endDate = null;
          console.log('endDate is before startDate');
          return false;
        }
      }
    };

    vm.shadeRange = function () {
      var btwDates = moment();
      if (vm.isValidDateRange()) {
        if (btwDates.isBetween($scope.daterange)) {
          console.log('dates exsist between');
          console.log(btwDates);
        }
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
      return $element.data('daterangepicker');
    };

    vm.destroy = function () {
      var plugin = this.plugin();
      if (plugin) {
        plugin.remove();
        $element.data('daterangepicker', null);
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
      console.log($element);
      $element.click(function (e) {
        $scope.isVisible = true;
      });
    };

  }

  availity.ui.controller('AvDateRangeController', AvDateRangeController);

  function avDateRangePickerDirective(avDateRangeConfig, $window) {
    return {
      restrict: 'EA',
      require: 'ngModel',
      templateUrl: avDateRangeConfig.TEMPLATE,
      controller: 'AvDateRangeController',
      controllerAs: 'vm',
      link: function(scope, element, attrs, ngModel) {


        element.click(function(e) {
          scope.vm.show();
        });

        if(!ngModel) {
          ngModel = scope.vm.findModel();
          if(!ngModel) {
            $log.error('avDatepicker requires ngModel');
            return;
          }
        }

        scope.vm.setNgModel(ngModel);

        // (view to model)
        ngModel.$parsers.push(scope.vm.viewToModel);

        // (model to view) - added to end of formatters array
        // because they are processed in reverse order.
        // if the model is in Date format and send to the validation framework
        // prior to getting converted to the expected $viewValue format,
        // the validation will fail.
        ngModel.$formatters.push(scope.vm.modelToView);


        //ngModel.$viewChangeListeners.push(scope.vm.viewToModel());

        var _$render = ngModel.$render;
        ngModel.$render = function() {
          _$render();
          scope.vm.setValue();
        };

        var win = angular.element($window);

        win.bind('scroll', function() {
          console.log('scroll hide function');
          scope.vm.hide();
        });

      }
    };
  }

  avDateRangePickerDirective.$inject = ['avDateRangeConfig', '$window'];
  availity.ui.directive('avDateRange', avDateRangePickerDirective);

  //////////////////////////////////
  // Calendar Building Directive //
  ////////////////////////////////

  availity.ui.constant('avCalendarConfig', {
    TEMPLATE: 'ui/daterangepicker/calendar-tpl.html'
  });

  function avCalendarDirective(avCalendarConfig) {
    return {
      restrict: 'EA',
      templateUrl: avCalendarConfig.TEMPLATE,
      scope: {
        startDate: "=",
        endDate: "="
      },
      link: function(scope, element, attrs) {
        /* Watcher example
        scope.$watch('startDate', function (newVal) {
          console.log('startDate', newVal);
        });
        */
        scope.selected = _removeTime(scope.selected || moment());

        // Need to refactor common code //
        scope.month = scope.selected.clone();
        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        // Need to refactor common code //
        scope.month2 = scope.selected.add(1,'M').clone();
        var start2 = scope.selected.clone();
        start2.date(1);
        _removeTime(start2.day(0));

        _buildMonthLeft(scope, start, scope.month);
        _buildMonthRight(scope, start2, scope.month2);
        //_buildMonth(scope, start, scope.month);

        scope.select = function(day) {
          scope.selected = day.date;
        };


        // Need to refactor common code //
        scope.next = function() {
          var next = scope.month.clone();
          var next2 = scope.month2.clone();
          _removeTime(next.month(next.month()+1).date(1));
          _removeTime(next2.month(next2.month()+1).date(1));
          scope.month.month(scope.month.month()+1);
          scope.month2.month(scope.month2.month()+1);

          //_buildMonth(scope, next, scope.month);
          _buildMonthLeft(scope, next, scope.month);
          _buildMonthRight(scope, next2, scope.month2);
        };

        // Need to refactor common code //
        scope.previous = function() {
          var previous = scope.month.clone();
          var previous2 = scope.month2.clone();
          _removeTime(previous.month(previous.month()-1).date(1));
          _removeTime(previous2.month(previous2.month()-1).date(1));
          scope.month.month(scope.month.month()-1);
          scope.month2.month(scope.month2.month()-1);

          //_buildMonth(scope, previous, scope.month);
          _buildMonthLeft(scope, previous, scope.month);
          _buildMonthRight(scope, previous2, scope.month2);
        };
      }
    };

    function _removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth(scope, start, month) {
      scope.weeks = [];
      var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
      while (!done) {
        scope.weeks.push({ days: _buildWeek(date.clone(), month) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }
    }

    function _buildMonthLeft(scope, start, month) {
      scope.weeksLeft = [];
      var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
      while (!done) {
        scope.weeksLeft.push({ days: _buildWeek(date.clone(), month) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }
    }

    function _buildMonthRight(scope, start, month) {
      scope.weeksRight = [];
      var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
      while (!done) {
        scope.weeksRight.push({ days: _buildWeek(date.clone(), month) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }
    }

    function _buildWeek(date, month) {
      var days = [];
      for (var i = 0; i < 7; i++) {
        days.push({
          name: date.format("dd").substring(0, 1),
          number: date.date(),
          isCurrentMonth: date.month() === month.month(),
          isToday: date.isSame(new Date(), "day"),
          date: date
        });
        date = date.clone();
        date.add(1, "d");
      }
      return days;
    }

  }

  avCalendarDirective.$inject = ['avCalendarConfig'];
  availity.ui.directive('avCalendar', avCalendarDirective);

})(window);
