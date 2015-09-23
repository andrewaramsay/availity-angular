/**
 * Inspiration https://github.com/luisfarzati/ng-bs-daterangepicker
 */
(function(root) {

  'use strict';

  var availity = root.availity;

  // Options: http://www.daterangepicker.com/#options
  availity.ui.constant('AV_DATERANGE', {
    CONTROLLER: '$ngModelController',
    ADD_ON_SELECTOR: '[data-toggle="daterange"]',
    OPTIONS: [
      'startDate',
      'endDate',
      'minDate',
      'maxDate',
      'dateLimit',
      'timeZone',
      'showDropdowns',
      'showWeekNumbers',
      'timePicker',
      'timePickerIncrement',
      'timePicker24Hour',
      'timePickerSeconds',
      'ranges',
      'opens',
      'drops',
      'buttonClasses',
      'applyClass',
      'cancelClass',
      'locale',
      'singleDatePicker',
      'autoApply',
      'linkedCalendars',
      'parentEl',
      'isInvalidDate',
      'autoUpdateInput',
      'modelFormat'
    ],
    DEFAULTS: {
      FORMAT: 'mm/dd/yyyy',
      CLOSE: true,
      TODAY: true,
      MODELFORMAT: 'YYYY-MM-DD'
    }
  });

  availity.ui.controller('AvDaterangeController', function($element, $attrs, AV_DATERANGE, $scope) {

    var self = this;
    this.options = {};

    this.setValue = function() {

      var viewValue = self.ngModel.$modelValue;
      var plugin = this.plugin();

      if(!viewValue || !plugin) {
        return;
      }

      plugin.setDate(viewValue);
    };

    this.setNgModel = function(ngModel) {
      this.ngModel = ngModel;
    };

    this.findModel = function() {

      var ngModel = null;

      var $input = $element.find('input:first').andSelf();
      if($input.length) {
        ngModel = $input.data(AV_DATERANGE.CONTROLLER);
        this.setNgModel(ngModel);
      }

      return ngModel;
    };

    debugger;

    this.modelToView = function() {
      var viewValue = $.fn.daterangepicker.DPGlobal.formatDate(self.ngModel.$modelValue, self.options.format, 'en');
      return viewValue;
    };

    this.wrapIsoDate = function() {
      var date = self.ngModel.$modelValue;

      if(date !== undefined && date !== null && !moment.isDate(date)) {
        var m = moment(date);
        self.ngModel.$modelValue = m.isValid() ? m.toDate() : null;
      }

      return self.ngModel.$modelValue;
    };

    this.viewToModel = function() {
      //var format = $.fn.daterangepicker.DPGlobal.parseFormat(self.options.format);
      var utcDate = $.fn.daterangepicker.DPGlobal.parseDate(self.ngModel.$viewValue, format, 'en');

      var plugin = self.plugin();

      if(!plugin) {
        return;
      }

      // jscs: disable
      var localDate = plugin._utc_to_local(utcDate);
      // jscs: enable

      if(self.options.modelFormat && localDate) {
        localDate = moment(localDate).format(self.options.modelFormat);
      }

      return localDate;
    };

    this.init = function() {

      _.forEach($attrs, function(value, key) {
        if(_.contains(AV_DATERANGE.OPTIONS, key.replace('data-', ''))) {
          self.options[key] = $scope.$eval(value);
        }
      });

      // self.options = _.extend{}, optionsDefault, userOptions);

      self.options.autoclose = self.options.autoclose ? self.options.autoclose : AV_DATERANGE.DEFAULTS.CLOSE;
      self.options.todayHighlight = self.options.todayHighlight ? self.options.todayHighlight : AV_DATERANGE.DEFAULTS.TODAY;
      //self.options.format = self.options.format ? self.options.format : AV_DATERANGE.DEFAULTS.FORMAT;

      if(self.options.modelFormat && self.options.modelFormat.toLowerCase() === 'default') {
        self.options.modelFormat = AV_DATERANGE.DEFAULTS.MODELFORMAT;
      }
    };

    this.plugin = function() {
      return $element.data('daterangepicker');
    };

    this.destroy = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.remove();
        $element.data('daterangepicker', null);
      }
    };

    this.hide = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.hide();
      }
    };
  });

  availity.ui.directive('avDaterange', function($window, $log, AV_DATERANGE) {
    return {
      restrict: 'A',
      require: ['ngModel', 'avDaterange'],
      controller: 'AvDaterangeController',
      link: function(scope, element, attrs, controllers) {
        var ngModel = controllers[0];
        var avDaterange = controllers[1];

        if(!ngModel) {
          ngModel = avDaterange.findModel();
          if(!ngModel) {
            $log.error('avDaterange requires ngModel');
            return;
          }
        }

        avDaterange.init();
        avDaterange.setNgModel(ngModel);

        element.on('changeDate', function(e) {
          $log.info('avDaterange changeDate {0}', [e]);
        });

        // (view to model)
        ngModel.$parsers.push(avDaterange.viewToModel);

        // (model to view) - added to end of formatters array
        // because they are processed in reverse order.
        // if the model is in Date format and send to the validation framework
        // prior to getting converted to the expected $viewValue format,
        // the validation will fail.
        ngModel.$formatters.push(avDaterange.modelToView);
        ngModel.$formatters.push(avDaterange.wrapIsoDate);

        var _$render = ngModel.$render;
        ngModel.$render = function() {
          _$render();
          avDaterange.setValue();
        };

        var win = angular.element($window);

        win.bind('scroll', function() {
          avDaterange.hide();
        });

        var target = element.siblings(AV_DATERANGE.ADD_ON_SELECTOR);
        if(target.length) {
          target.on('click.daterangepicker', function() {
            if(!element.prop('disabled')) { // Hack check for IE 8
              element.focus();
            }
          });
        }

        scope.$on('destroy', function() {
          avDaterange.destroy();
          if(target.length) {
            target.off('click.daterangepicker');
          }
        });

        scope.$evalAsync(function() {
          element.daterangepicker(avDaterange.options);
        });
      }
    };
  });
})(window);
