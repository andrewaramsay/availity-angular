(function(root) {
  'use strict';

  var availity = root.availity;

  availity.ui.constant('avDateRangeConfig', {
    TEMPLATE: 'ui/daterangepicker/daterangepicker-tpl.html'
  });

  avDateRangeController.$inject = ['$scope', '$element'];
  function avDateRangeController ($scope, $element) {
    var vm = this;

    vm.plugin = function() {
      return $element.data('daterangepicker');
    };

    vm.destroy = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.remove();
        $element.data('daterangepicker', null);
      }
    };

    vm.hide = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.hide();
      }
    };

  }

  availity.ui.controller('avDateRangeController', avDateRangeController);

  function avDateRangePickerDirective(avDateRangeConfig, $window) {
    return {
      restrict: 'EA',
      require: ['avDateRange'],
      templateUrl: avDateRangeConfig.TEMPLATE,
      controller: 'avDateRangeController',
      scope: {
        startDate: "=",
        endDate: "="
      },
      link: function(scope, element, attrs, controllers) {
        //var ngModel = controllers[0];
        var avDateRange = controllers[0];

        console.log('Date Range link function');

        var win = angular.element($window);

        win.bind('scroll', function() {
          console.log('scroll hide function');
          avDateRange.hide();
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
      //controller: 'AvBreadcrumbsController',
      scope: {
        selected: "="
      },
      link: function(scope, element, attrs) {
        scope.selected = _removeTime(scope.selected || moment());
        scope.month = scope.selected.clone();

        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        _buildMonth(scope, start, scope.month);

        scope.select = function(day) {
          scope.selected = day.date;
        };

        scope.next = function() {
          var next = scope.month.clone();
          _removeTime(next.month(next.month()+1)).date(1);
          scope.month.month(scope.month.month()+1);
          _buildMonth(scope, next, scope.month);
        };

        scope.previous = function() {
          var previous = scope.month.clone();
          _removeTime(previous.month(previous.month()-1).date(1));
          scope.month.month(scope.month.month()-1);
          _buildMonth(scope, previous, scope.month);
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
