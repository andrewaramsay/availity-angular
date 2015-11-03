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
    var format = 'MM/DD/YYYY';

    $scope.isToggled = true;

    vm.setStartDate = function (date) {
      $scope.startDate = date.date.format(format);
    };

    vm.setEndDate = function (date) {
      $scope.endDate = date.date.format(format);
    };

    vm.getStartDate = function() {
      return moment($scope.startDate);
    };

    vm.getEndDate = function() {
      return moment($scope.endDate);
    };

    vm.cancel = function () {
      vm.hide();
    };

    vm.isValidDateRange = function () {
      var startDate = vm.getStartDate();
      var endDate = vm.getEndDate();
      if (startDate != null) {
        if (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
          console.log('valid date');
          vm.setDateRange();
        }
        else {
          $scope.startDate = endDate.format(format);
          $scope.endDate = null;
          console.log('endDate is before startDate');
        }
      }
    };

    vm.setDateRange = function () {
      //$scope.startDate = $scope.startDate.format(format);
      //$scope.endDate = $scope.endDate.format(format);
      vm.getStartDate();
      vm.getEndDate();

      vm.hide();
      vm.shadeRange();
    };

    // Shading should highlight each of the dates inBetween the startDate and endDate
    // currently does not function correctly.
    vm.shadeRange = function () {
      var rangeArray = [];
      var currentDate = moment($scope.startDate);
      var result = $element.children('.day');

      while(currentDate.isBefore($scope.endDate)){
        rangeArray.push(moment(currentDate, format));
        currentDate = currentDate.add(1,'days');
      };

      if (result in rangeArray) {
        console.log(result);
        result.addClass('hover');
      };

      return rangeArray;
    };

    vm.hide = function () {
        $scope.isToggled = !$scope.isToggled;
    };

    vm.show = function () {
      console.log('show() firing');
       $scope.isToggled = !scope.isToggled;
    };

    vm.toggle = function(e) {
      e.preventDefault();
      $scope.isToggled = !$scope.isToggled;
      console.log('toggle fired');
    };

  }

  availity.ui.controller('AvDateRangeController', AvDateRangeController);

  function avDateRangePickerDirective(avDateRangeConfig, $window) {
    return {
      restrict: 'EA',
      transclude: true,
      templateUrl: avDateRangeConfig.TEMPLATE,
      controller: 'AvDateRangeController',
      controllerAs: 'vm',
      scope: {
        startDate: '=',
        endDate: '='
      },
      link: function(scope, element, attrs) {
        var win = angular.element($window);

        win.bind('scroll', function() {
          console.log('scroll hide function');
          if(!scope.isToggled) {
            scope.vm.hide();
          }
          else{
            return;
          }
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


  // Need to refactor repeated code
  function avCalendarDirective(avCalendarConfig) {
    return {
      restrict: 'EA',
      templateUrl: avCalendarConfig.TEMPLATE,
      scope: {
        selectFrom: "&",
        selectTo: "&"
      },
      link: function(scope, element, attrs) {
        scope.selected = _removeTime(scope.selected || moment());

        scope.month = scope.selected.clone();
        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));


        scope.month2 = scope.selected.add(1,'M').clone();
        var start2 = scope.selected.clone();
        start2.date(1);
        _removeTime(start2.day(0));

        _buildMonthLeft(scope, start, scope.month);
        _buildMonthRight(scope, start2, scope.month2);

        scope.select = function(day) {
          scope.selected = day.date;
        };
        scope.selectEnd = function(day) {
          scope.selected2 = day.date;
        };

        scope.next = function() {
          var next = scope.month.clone();
          var next2 = scope.month2.clone();
          _removeTime(next.month(next.month()+1).date(1));
          _removeTime(next2.month(next2.month()+1).date(1));
          scope.month.month(scope.month.month()+1);
          scope.month2.month(scope.month2.month()+1);

          _buildMonthLeft(scope, next, scope.month);
          _buildMonthRight(scope, next2, scope.month2);
        };

        scope.previous = function() {
          var previous = scope.month.clone();
          var previous2 = scope.month2.clone();
          _removeTime(previous.month(previous.month()-1).date(1));
          _removeTime(previous2.month(previous2.month()-1).date(1));
          scope.month.month(scope.month.month()-1);
          scope.month2.month(scope.month2.month()-1);

          _buildMonthLeft(scope, previous, scope.month);
          _buildMonthRight(scope, previous2, scope.month2);
        };
      }
    };

    function _removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
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
