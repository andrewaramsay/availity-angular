(function(root) {
  'use strict';

  var availity = root.availity;

  availity.ui.constant('avDateRangeConfig', {
    CONTROLLER: '$ngModelController',
    ADD_ON_SELECTOR: '[data-toggle="daterange"]',
    TEMPLATE: 'ui/daterangepicker/daterangepicker-tpl.html',
    OPTIONS: [
      'startDate',
      'endDate',
      'minDate',
      'maxDate',
      'dateLimit',
      'timeZone',
      'showDropdowns',
      'ranges',
      'opens',
      'drops',
      'buttonClasses',
      'applyClass',
      'cancelClass',
      'format',
      'singleDatePicker',
      'autoApply',
      'linkedCalendars',
      'parentEl',
      'isInvalidDate',
      'autoUpdateInput',
      'modelFormat'
    ]
  });
/*
    DEFAULTS: {
      FORMAT: 'mm/dd/yyyy',
      CLOSE: true,
      TODAY: true,
      MODELFORMAT: 'YYYY-MM-DD'
    }*/

    //ERRORS


  avDateRangeController.$inject = ['$scope', '$element', 'avDateRangeConfig'];
  function avDateRangeController($scope, $element, options, avDateRangeConfig) {

    var self = this;

    //default settings for options
    self.element = $element;
    self.startDate = moment().startOf('day');
    self.endDate = moment().endOf('day');
    self.timeZone = moment().utcOffset();
    self.minDate = false;
    self.maxDate = false;
    self.dateLimit = false;
    self.autoApply = false;
    self.singleDatePicker = false;
    self.showDropdowns = false;
    self.showWeekNumbers = false;
    self.timePicker = false;
    self.timePicker24Hour = false;
    self.timePickerIncrement = 1;
    self.timePickerSeconds = false;
    self.linkedCalendars = true;
    self.autoUpdateInput = true;
    self.ranges = {};

    // state info
    self.isShowing = false;
    self.leftCalendar = {};
    self.rightCalendar = {};

    self.locale = {
      format: 'MM-DD-YYYY',
      separator: ' - ',
      applyLabel: 'Apply',
      cancelLabel: 'Cancel',
      weekLabel: 'W',
      customRangeLabel: 'Custom Range',
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek()
    };

    self.getStartDate = function() {
      //console.log(vm.startDate);
      return self.startDate;
    };

    // Controller Methods
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
        ngModel = $input.data(avDateRangeConfig.CONTROLLER);
        this.setNgModel(ngModel);
      }

      return ngModel;
    };

    this.modelToView = function() {
      var viewValue = proto.formatDate(self.ngModel.$modelValue, self.options.format, 'en');
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
      var format = $.fn.datepicker.DPGlobal.parseFormat(self.options.format);
      var utcDate = $.fn.datepicker.DPGlobal.parseDate(self.ngModel.$viewValue, format, 'en');

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
        if(_.contains(avDateRangeConfig.OPTIONS, key.replace('data-', ''))) {
          self.options[key] = $scope.$eval(value);
        }
      });

      // self.options = _.extend{}, optionsDefault, userOptions);

      self.options.autoclose = self.options.autoclose ? self.options.autoclose : avDateRangeConfig.DEFAULTS.CLOSE;
      self.options.todayHighlight = self.options.todayHighlight ? self.options.todayHighlight : avDateRangeConfig.DEFAULTS.TODAY;
      self.options.format = self.options.format ? self.options.format : avDateRangeConfig.DEFAULTS.FORMAT;
      self.options.forceParse = self.options.forceParse ? self.options.forceParse : avDateRangeConfig.DEFAULTS.FORCEPARSE;

    };

    this.plugin = function() {
      return $element.data('daterange');
    };

    this.destroy = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.remove();
        $element.data('daterange', null);
      }
    };

    this.hide = function() {
      var plugin = this.plugin();
      if(plugin) {
        plugin.hide();
      }
    };
    // END Controller Methods

    //custom options from user
    if (typeof options !== 'object' || options === null)
      options = {};

    //allow setting options with data attributes
    //data-api options will be overwritten with custom javascript options
    options = $.extend(this.element.data(), options);


    // Possible override values
    if (typeof options.locale === 'object') {

      if (typeof options.locale.format === 'string')
        self.locale.format = options.locale.format;

      if (typeof options.locale.daysOfWeek === 'object')
        self.locale.daysOfWeek = options.locale.daysOfWeek.slice();

      if (typeof options.locale.monthNames === 'object')
        self.locale.monthNames = options.locale.monthNames.slice();

      if (typeof options.locale.firstDay === 'number')
        self.locale.firstDay = options.locale.firstDay;

      //if (typeof options.locale.applyLabel === 'string')
      //  this.locale.applyLabel = options.locale.applyLabel;
      //
      //if (typeof options.locale.cancelLabel === 'string')
      //  this.locale.cancelLabel = options.locale.cancelLabel;
      //
      //if (typeof options.locale.weekLabel === 'string')
      //  this.locale.weekLabel = options.locale.weekLabel;

      if (typeof options.locale.customRangeLabel === 'string')
        self.locale.customRangeLabel = options.locale.customRangeLabel;

    }

    if (typeof options.startDate === 'string')
      self.startDate = moment(options.startDate, self.locale.format);

    if (typeof options.endDate === 'string')
      self.endDate = moment(options.endDate, self.locale.format);

    if (typeof options.minDate === 'string')
      self.minDate = moment(options.minDate, self.locale.format);

    if (typeof options.maxDate === 'string')
      self.maxDate = moment(options.maxDate, self.locale.format);

    if (typeof options.startDate === 'object')
      self.startDate = moment(options.startDate);

    if (typeof options.endDate === 'object')
      self.endDate = moment(options.endDate);

    if (typeof options.minDate === 'object')
      self.minDate = moment(options.minDate);

    if (typeof options.maxDate === 'object')
      self.maxDate = moment(options.maxDate);

    // END override option values

    // update day names order to firstDay
    if (this.locale.firstDay != 0) {
      var iterator = this.locale.firstDay;
      while (iterator > 0) {
        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
        iterator--;
      }
    }

    // start/end date check (Copied over atm)
    var start, end, range;

    //if no start/end dates set, check if an input element contains initial values
    if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
      if (this.element.is('input[type=text]')) {
        var val = $(this.element).val(),
          split = val.split(self.locale.separator);

        start = end = null;

        if (split.length == 2) {
          start = moment(split[0], self.locale.format);
          end = moment(split[1], self.locale.format);
        } else if (this.singleDatePicker && val !== "") {
          start = moment(val, self.locale.format);
          end = moment(val, self.locale.format);
        }
        if (start !== null && end !== null) {
          self.setStartDate(start);
          self.setEndDate(end);
        }
      }
    }
    // END start/end/ranges



    // Prototype Methods/Functions
    var proto = avDateRangeController.prototype;

    proto.setStartDate = function(startDate) {
      if (typeof startDate === 'string')
        self.startDate = moment(startDate, self.locale.format).utcOffset(self.timeZone);

      if (typeof startDate === 'object')
        self.startDate = moment(startDate);

      if (!self.timePicker)
        self.startDate = self.startDate.startOf('day');

      if (self.timePicker && self.timePickerIncrement)
        self.startDate.minute(Math.round(self.startDate.minute() / self.timePickerIncrement) * self.timePickerIncrement);

      if (self.minDate && self.startDate.isBefore(self.minDate))
        self.startDate = self.minDate;

      if (self.maxDate && self.startDate.isAfter(self.maxDate))
        self.startDate = self.maxDate;

      self.updateMonthsInView();
    };

    proto.setEndDate = function(endDate) {
      if (typeof endDate === 'string')
        self.endDate = moment(endDate, self.locale.format).utcOffset(self.timeZone);

      if (typeof endDate === 'object')
        self.endDate = moment(endDate);

      if (!self.timePicker)
        self.endDate = self.endDate.endOf('day');

      if (self.timePicker && self.timePickerIncrement)
        self.endDate.minute(Math.round(self.endDate.minute() / self.timePickerIncrement) * self.timePickerIncrement);

      if (self.endDate.isBefore(self.startDate))
        self.endDate = self.startDate.clone();

      if (self.maxDate && self.endDate.isAfter(self.maxDate))
        self.endDate = self.maxDate;

      if (self.dateLimit && self.startDate.clone().add(self.dateLimit).isBefore(self.endDate))
        self.endDate = self.startDate.clone().add(self.dateLimit);

      self.updateMonthsInView();
    };

    proto.isInvalidDate = function() {
      return false;
    };

    proto.updateView = function() {
      if (self.timePicker) {
        self.renderTimePicker('left');
        self.renderTimePicker('right');
        if (!self.endDate) {
          self.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
        } else {
          self.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
        }
      }
      if (self.endDate) {
        self.container.find('input[name="daterangepicker_end"]').removeClass('active');
        self.container.find('input[name="daterangepicker_start"]').addClass('active');
      } else {
        self.container.find('input[name="daterangepicker_end"]').addClass('active');
        self.container.find('input[name="daterangepicker_start"]').removeClass('active');
      }
      self.updateMonthsInView();
      self.updateCalendars();
      self.updateFormInputs();
    };

    proto.updateMonthsInView = function() {
      if (self.endDate) {
        self.leftCalendar.month = self.startDate.clone().date(2);
        if (!self.linkedCalendars && (self.endDate.month() != self.startDate.month() || self.endDate.year() != self.startDate.year())) {
          self.rightCalendar.month = self.endDate.clone().date(2);
        } else {
          self.rightCalendar.month = self.startDate.clone().date(2).add(1, 'month');
        }
      } else {
        if (self.leftCalendar.month.format('YYYY-MM') != self.startDate.format('YYYY-MM') && self.rightCalendar.month.format('YYYY-MM') != self.startDate.format('YYYY-MM')) {
          self.leftCalendar.month = self.startDate.clone().date(2);
          self.rightCalendar.month = self.startDate.clone().date(2).add(1, 'month');
        }
      }
    };

    proto.updateCalendars = function() {
      if (self.timePicker) {
        var hour, minute, second;
        if (self.endDate) {
          hour = parseInt(self.container.find('.left .hourselect').val(), 10);
          minute = parseInt(self.container.find('.left .minuteselect').val(), 10);
          second = self.timePickerSeconds ? parseInt(self.container.find('.left .secondselect').val(), 10) : 0;
          if (!self.timePicker24Hour) {
            var ampm = self.container.find('.left .ampmselect').val();
            if (ampm === 'PM' && hour < 12)
              hour += 12;
            if (ampm === 'AM' && hour === 12)
              hour = 0;
          }
        } else {
          hour = parseInt(self.container.find('.right .hourselect').val(), 10);
          minute = parseInt(self.container.find('.right .minuteselect').val(), 10);
          second = self.timePickerSeconds ? parseInt(self.container.find('.right .secondselect').val(), 10) : 0;
          if (!self.timePicker24Hour) {
            var ampm = self.container.find('.left .ampmselect').val();
            if (ampm === 'PM' && hour < 12)
              hour += 12;
            if (ampm === 'AM' && hour === 12)
              hour = 0;
          }
        }
        self.leftCalendar.month.hour(hour).minute(minute).second(second);
        self.rightCalendar.month.hour(hour).minute(minute).second(second);
      }

      self.renderCalendar('left');
      self.renderCalendar('right');

      //highlight any predefined range matching the current start and end dates
      self.container.find('.ranges li').removeClass('active');
      if (self.endDate == null) return;

      var customRange = true;
      var i = 0;
      for (var range in self.ranges) {
        if (self.timePicker) {
          if (self.startDate.isSame(self.ranges[range][0]) && self.endDate.isSame(self.ranges[range][1])) {
            customRange = false;
            self.chosenLabel = self.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
            break;
          }
        } else {
          //ignore times when comparing dates if time picker is not enabled
          if (self.startDate.format('YYYY-MM-DD') == self.ranges[range][0].format('YYYY-MM-DD') && self.endDate.format('YYYY-MM-DD') == self.ranges[range][1].format('YYYY-MM-DD')) {
            customRange = false;
            self.chosenLabel = self.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
            break;
          }
        }
        i++;
      }
      if (customRange) {
        self.chosenLabel = self.container.find('.ranges li:last').addClass('active').html();
        self.showCalendars();
      }
    };

    proto.renderCalendar = function(side) {
      //
      // Build the matrix of dates that will populate the calendar
      //

      var calendar = side == 'left' ? self.leftCalendar : self.rightCalendar;
      var month = calendar.month.month();
      var year = calendar.month.year();
      var hour = calendar.month.hour();
      var minute = calendar.month.minute();
      var second = calendar.month.second();
      var daysInMonth = moment([year, month]).daysInMonth();
      var firstDay = moment([year, month, 1]);
      var lastDay = moment([year, month, daysInMonth]);
      var lastMonth = moment(firstDay).subtract(1, 'month').month();
      var lastYear = moment(firstDay).subtract(1, 'month').year();
      var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
      var dayOfWeek = firstDay.day();

      //initialize a 6 rows x 7 columns array for the calendar
      var calendar = [];
      calendar.firstDay = firstDay;
      calendar.lastDay = lastDay;

      for (var i = 0; i < 6; i++) {
        calendar[i] = [];
      }

      //populate the calendar with date objects
      var startDay = daysInLastMonth - dayOfWeek + self.locale.firstDay + 1;
      if (startDay > daysInLastMonth)
        startDay -= 7;

      if (dayOfWeek == self.locale.firstDay)
        startDay = daysInLastMonth - 6;

      // Possible patch for issue #626 https://github.com/dangrossman/bootstrap-daterangepicker/issues/626
      var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]).utcOffset(self.timeZone); // .utcOffset(self.timeZone);

      var col, row;
      for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
        if (i > 0 && col % 7 === 0) {
          col = 0;
          row++;
        }
        calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
        curDate.hour(12);

        if (self.minDate && calendar[row][col].format('YYYY-MM-DD') == self.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(self.minDate) && side == 'left') {
          calendar[row][col] = self.minDate.clone();
        }

        if (self.maxDate && calendar[row][col].format('YYYY-MM-DD') == self.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(self.maxDate) && side == 'right') {
          calendar[row][col] = self.maxDate.clone();
        }

      }

      //make the calendar object available to hoverDate/clickDate
      if (side == 'left') {
        self.leftCalendar.calendar = calendar;
      } else {
        self.rightCalendar.calendar = calendar;
      }

      //
      // Display the calendar
      //

      var minDate = side == 'left' ? self.minDate : self.startDate;
      var maxDate = self.maxDate;
      var selected = side == 'left' ? self.startDate : self.endDate;

      var html = '<table class="table-condensed">';
      html += '<thead>';
      html += '<tr>';

      // add empty cell for week number
      if (self.showWeekNumbers)
        html += '<th></th>';

      if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!self.linkedCalendars || side == 'left')) {
        html += '<th class="prev available"><i class="icon icon-angle-double-left glyphicon glyphicon-chevron-left"></i></th>';
      } else {
        html += '<th></th>';
      }

      var dateHtml = self.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

      if (self.showDropdowns) {
        var currentMonth = calendar[1][1].month();
        var currentYear = calendar[1][1].year();
        var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
        var minYear = (minDate && minDate.year()) || (currentYear - 50);
        var inMinYear = currentYear == minYear;
        var inMaxYear = currentYear == maxYear;

        var monthHtml = '<select class="monthselect">';
        for (var m = 0; m < 12; m++) {
          if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
            monthHtml += "<option value='" + m + "'" +
              (m === currentMonth ? " selected='selected'" : "") +
              ">" + self.locale.monthNames[m] + "</option>";
          } else {
            monthHtml += "<option value='" + m + "'" +
              (m === currentMonth ? " selected='selected'" : "") +
              " disabled='disabled'>" + self.locale.monthNames[m] + "</option>";
          }
        }
        monthHtml += "</select>";

        var yearHtml = '<select class="yearselect">';
        for (var y = minYear; y <= maxYear; y++) {
          yearHtml += '<option value="' + y + '"' +
            (y === currentYear ? ' selected="selected"' : '') +
            '>' + y + '</option>';
        }
        yearHtml += '</select>';

        dateHtml = monthHtml + yearHtml;
      }

      html += '<th colspan="5" class="month">' + dateHtml + '</th>';
      if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!self.linkedCalendars || side == 'right' || self.singleDatePicker)) {
        html += '<th class="next available"><i class="icon icon-angle-double-right glyphicon glyphicon-chevron-right"></i></th>';
      } else {
        html += '<th></th>';
      }

      html += '</tr>';
      html += '<tr>';

      // add week number label
      if (self.showWeekNumbers)
        html += '<th class="week">' + self.locale.weekLabel + '</th>';

      $.each(self.locale.daysOfWeek, function(index, dayOfWeek) {
        html += '<th>' + dayOfWeek + '</th>';
      });

      html += '</tr>';
      html += '</thead>';
      html += '<tbody>';

      //adjust maxDate to reflect the dateLimit setting in order to
      //grey out end dates beyond the dateLimit
      if (self.endDate == null && self.dateLimit) {
        var maxLimit = self.startDate.clone().add(self.dateLimit).endOf('day');
        if (!maxDate || maxLimit.isBefore(maxDate)) {
          maxDate = maxLimit;
        }
      }

      for (var row = 0; row < 6; row++) {
        html += '<tr>';

        // add week number
        if (self.showWeekNumbers)
          html += '<td class="week">' + calendar[row][0].week() + '</td>';

        for (var col = 0; col < 7; col++) {

          var classes = [];

          //highlight today's date
          if (calendar[row][col].isSame(new Date(), "day"))
            classes.push('today');

          //highlight weekends
          if (calendar[row][col].isoWeekday() > 5)
            classes.push('weekend');

          //grey out the dates in other months displayed at beginning and end of self calendar
          if (calendar[row][col].month() != calendar[1][1].month())
            classes.push('off');

          //don't allow selection of dates before the minimum date
          if (self.minDate && calendar[row][col].isBefore(self.minDate, 'day'))
            classes.push('off', 'disabled');

          //don't allow selection of dates after the maximum date
          if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
            classes.push('off', 'disabled');

          //don't allow selection of date if a custom function decides it's invalid
          if (self.isInvalidDate(calendar[row][col]))
            classes.push('off', 'disabled');

          //highlight the currently selected start date
          if (calendar[row][col].format('YYYY-MM-DD') == self.startDate.format('YYYY-MM-DD'))
            classes.push('active', 'start-date');

          //highlight the currently selected end date
          if (self.endDate != null && calendar[row][col].format('YYYY-MM-DD') == self.endDate.format('YYYY-MM-DD'))
            classes.push('active', 'end-date');

          //highlight dates in-between the selected dates
          if (self.endDate != null && calendar[row][col] > self.startDate && calendar[row][col] < self.endDate)
            classes.push('in-range');

          var cname = '', disabled = false;
          for (var i = 0; i < classes.length; i++) {
            cname += classes[i] + ' ';
            if (classes[i] == 'disabled')
              disabled = true;
          }
          if (!disabled)
            cname += 'available';

          html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

        }
        html += '</tr>';
      }

      html += '</tbody>';
      html += '</table>';

      self.container.find('.calendar.' + side + ' .calendar-table').html(html);
    };

    proto.updateFormInputs = function() {
      self.container.find('input[name=daterangepicker_start]').val(self.startDate.format(self.locale.format));
      if (self.endDate)
        self.container.find('input[name=daterangepicker_end]').val(self.endDate.format(self.locale.format));

      if (self.singleDatePicker || (self.endDate && (self.startDate.isBefore(self.endDate) || self.startDate.isSame(self.endDate)))) {
        self.container.find('button.applyBtn').removeAttr('disabled');
      } else {
        self.container.find('button.applyBtn').attr('disabled', 'disabled');
      }
    };

    proto.move = function() {
      var parentOffset = { top: 0, left: 0 },
        containerTop;
      var parentRightEdge = $(window).width();
      if (!self.parentEl.is('body')) {
        parentOffset = {
          top: self.parentEl.offset().top - self.parentEl.scrollTop(),
          left: self.parentEl.offset().left - self.parentEl.scrollLeft()
        };
        parentRightEdge = self.parentEl[0].clientWidth + self.parentEl.offset().left;
      }

      if (self.drops == 'up')
        containerTop = self.element.offset().top - self.container.outerHeight() - parentOffset.top;
      else
        containerTop = self.element.offset().top + self.element.outerHeight() - parentOffset.top;
      self.container[self.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

      if (self.opens == 'left') {
        self.container.css({
          top: containerTop,
          right: parentRightEdge - self.element.offset().left - self.element.outerWidth(),
          left: 'auto'
        });
        if (self.container.offset().left < 0) {
          self.container.css({
            right: 'auto',
            left: 9
          });
        }
      } else if (self.opens == 'center') {
        self.container.css({
          top: containerTop,
          left: self.element.offset().left - parentOffset.left + self.element.outerWidth() / 2
          - self.container.outerWidth() / 2,
          right: 'auto'
        });
        if (self.container.offset().left < 0) {
          self.container.css({
            right: 'auto',
            left: 9
          });
        }
      } else {
        self.container.css({
          top: containerTop,
          left: self.element.offset().left - parentOffset.left,
          right: 'auto'
        });
        if (self.container.offset().left + self.container.outerWidth() > $(window).width()) {
          self.container.css({
            left: 'auto',
            right: 0
          });
        }
      }
    };

    proto.show = function(e) {
      if (self.isShowing) return;

      // Create a click proxy that is private to self instance of datepicker, for unbinding
      self._outsideClickProxy = $.proxy(function(e) { self.outsideClick(e); }, self);
      // Bind global datepicker mousedown for hiding and
      $(document)
        .on('mousedown.daterangepicker', self._outsideClickProxy)
        // also support mobile devices
        .on('touchend.daterangepicker', self._outsideClickProxy)
        // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
        .on('click.daterangepicker', '[data-toggle=dropdown]', self._outsideClickProxy)
        // and also close when focus changes to outside the picker (eg. tabbing between controls)
        .on('focusin.daterangepicker', self._outsideClickProxy);

      self.oldStartDate = self.startDate.clone();
      self.oldEndDate = self.endDate.clone();

      self.updateView();
      self.container.show();
      self.move();
      self.element.trigger('show.daterangepicker', self);
      self.isShowing = true;
    };

    proto.hide = function(e) {
      if (!self.isShowing) return;

      //incomplete date selection, revert to last values
      if (!self.endDate) {
        self.startDate = self.oldStartDate.clone();
        self.endDate = self.oldEndDate.clone();
      }

      //if a new date range was selected, invoke the user callback function
      if (!self.startDate.isSame(self.oldStartDate) || !self.endDate.isSame(self.oldEndDate))
        self.callback(self.startDate, self.endDate, self.chosenLabel);

      //if picker is attached to a text input, update it
      if (self.element.is('input') && !self.singleDatePicker && self.autoUpdateInput) {
        self.element.val(self.startDate.format(self.locale.format) + self.locale.separator + self.endDate.format(self.locale.format));
        self.element.trigger('change');
      } else if (self.element.is('input') && self.autoUpdateInput) {
        self.element.val(self.startDate.format(self.locale.format));
        self.element.trigger('change');
      }

      $(document).off('.daterangepicker');
      self.container.hide();
      self.element.trigger('hide.daterangepicker', self);
      self.isShowing = false;
    };

    proto.toggle = function(e) {
      if (self.isShowing) {
        self.hide();
      } else {
        self.show();
      }
    };

    proto.outsideClick = function(e) {
      var target = e.target;

      if(
        e.type == "focusin" ||
        target.closest(self.element).length ||
        target.closest(self.container).length ||
        target.closest('calendar-table').length
      ) return;
      self.hide();
    };

    proto.showCalendars = function() {
      self.container.addClass('show-calendar');
      self.move();
      // REFACTOR
      self.element.trigger('showCalendar.daterangepicker');
    };

    proto.hidecalendars = function() {
      self.container.removeClass('show-calendar');
      self.element.trigger('hideCalendar.daterangepicker');
    };

    proto.hoverRange = function(e) {
      var label = e.target.innerHTML;
      if (label == self.locale.customRangeLabel) {
        self.updateView();
      } else {
        var dates = self.ranges[label];
        self.container.find('input[name=daterangepicker_start]').val(dates[0].format(self.locale.format));
        self.container.find('input[name=daterangepicker_end]').val(dates[1].format(self.locale.format));
      }
    };

    proto.clickRange = function(e) {
      var label = e.target.innerHTML;
      self.chosenLabel = label;
      if (label == self.locale.customRangeLabel) {
        self.showCalendars();
      } else {
        var dates = self.ranges[label];
        self.startDate = dates[0];
        self.endDate = dates[1];

        if (!self.timePicker) {
          self.startDate.startOf('day');
          self.endDate.endOf('day');
        }

        self.hideCalendars();
        self.clickApply();
      }
    };

    proto.clickPrev = function(e) {
      var cal = $(e.target).parents('.calendar');
      if (cal.hasClass('left')) {
        self.leftCalendar.month.subtract(1, 'month');
        if (self.linkedCalendars)
          self.rightCalendar.month.subtract(1, 'month');
      } else {
        self.rightCalendar.month.subtract(1, 'month');
      }
      self.updateCalendars();
    };

    proto.clickNext = function(e) {
      var cal = $(e.target).parents('.calendar');
      if (cal.hasClass('left')) {
        self.leftCalendar.month.add(1, 'month');
      } else {
        self.rightCalendar.month.add(1, 'month');
        if (self.linkedCalendars)
          self.leftCalendar.month.add(1, 'month');
      }
      self.updateCalendars();
    };


    // REFACTOR out he Jquery
    proto.hoverDate = function(e) {
      //ignore dates that can't be selected
      if (!$(e.target).hasClass('available')) return;

      //have the text inputs above calendars reflect the date being hovered over
      var title = $(e.target).attr('data-title');
      var row = title.substr(1, 1);
      var col = title.substr(3, 1);
      var cal = $(e.target).parents('.calendar');
      var date = cal.hasClass('left') ? self.leftCalendar.calendar[row][col] : self.rightCalendar.calendar[row][col];

      if (this.endDate) {
        this.container.find('input[name=daterangepicker_start]').val(date.format(self.locale.format));
      } else {
        this.container.find('input[name=daterangepicker_end]').val(date.format(self.locale.format));
      }

      //highlight the dates between the start date and the date being hovered as a potential end date
      var leftCalendar = self.leftCalendar;
      var rightCalendar = self.rightCalendar;
      var startDate = self.startDate;
      if (!self.endDate) {
        self.container.find('.calendar td').each(function(index, el) {

          //skip week numbers, only look at dates
          if ($(el).hasClass('week')) return;

          var title = $(el).attr('data-title');
          var row = title.substr(1, 1);
          var col = title.substr(3, 1);
          var cal = $(el).parents('.calendar');
          var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

          if (dt.isAfter(startDate) && dt.isBefore(date)) {
            $(el).addClass('in-range');
          } else {
            $(el).removeClass('in-range');
          }

        });
      }
    };

    proto.clickDate = function(e) {
      if (!$(e.target).hasClass('available')) return;

      var title = $(e.target).attr('data-title');
      var row = title.substr(1, 1);
      var col = title.substr(3, 1);
      var cal = $(e.target).parents('.calendar');
      var date = cal.hasClass('left') ? self.leftCalendar.calendar[row][col] : self.rightCalendar.calendar[row][col];

      //
      // this function needs to do a few things:
      // * alternate between selecting a start and end date for the range,
      // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
      // * if autoapply is enabled, and an end date was chosen, apply the selection
      // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
      //

      if (self.endDate || date.isBefore(self.startDate)) {
        if (self.timePicker) {
          var hour = parseInt(self.container.find('.left .hourselect').val(), 10);
          if (!self.timePicker24Hour) {
            var ampm = cal.find('.ampmselect').val();
            if (ampm === 'PM' && hour < 12)
              hour += 12;
            if (ampm === 'AM' && hour === 12)
              hour = 0;
          }
          var minute = parseInt(self.container.find('.left .minuteselect').val(), 10);
          var second = self.timePickerSeconds ? parseInt(self.container.find('.left .secondselect').val(), 10) : 0;
          date = date.clone().hour(hour).minute(minute).second(second);
        }
        self.endDate = null;
        self.setStartDate(date.clone());
      } else {
        if (self.timePicker) {
          var hour = parseInt(self.container.find('.right .hourselect').val(), 10);
          if (!self.timePicker24Hour) {
            var ampm = self.container.find('.right .ampmselect').val();
            if (ampm === 'PM' && hour < 12)
              hour += 12;
            if (ampm === 'AM' && hour === 12)
              hour = 0;
          }
          var minute = parseInt(self.container.find('.right .minuteselect').val(), 10);
          var second = self.timePickerSeconds ? parseInt(self.container.find('.right .secondselect').val(), 10) : 0;
          date = date.clone().hour(hour).minute(minute).second(second);
        }
        self.setEndDate(date.clone());
        if (self.autoApply)
          self.clickApply();
      }

      if (self.singleDatePicker) {
        self.setEndDate(self.startDate);
        if (!self.timePicker)
          self.clickApply();
      }

      self.updateView();
    };

    proto.clickApply = function(e) {
      self.hide();
      self.element.trigger('apply.daterangepicker', self);
    };

    proto.clickCancel = function(e) {
      self.startDate = self.oldStartDate;
      self.endDate = self.oldEndDate;
      self.hide();
      self.element.trigger('cancel.daterangepicker', self);
    };

    proto.monthOrYearChanged = function(e) {
      var isLeft = $(e.target).closest('.calendar').hasClass('left'),
        leftOrRight = isLeft ? 'left' : 'right',
        cal = self.container.find('.calendar.'+leftOrRight);

      // Month must be Number for new moment versions
      var month = parseInt(cal.find('.monthselect').val(), 10);
      var year = cal.find('.yearselect').val();

      if (!isLeft) {
        if (year < self.startDate.year() || (year == self.startDate.year() && month < self.startDate.month())) {
          month = self.startDate.month();
          year = self.startDate.year();
        }
      }

      if (this.minDate) {
        if (year < self.minDate.year() || (year == self.minDate.year() && month < self.minDate.month())) {
          month = self.minDate.month();
          year = self.minDate.year();
        }
      }

      if (this.maxDate) {
        if (year > self.maxDate.year() || (year == self.maxDate.year() && month > self.maxDate.month())) {
          month = self.maxDate.month();
          year = self.maxDate.year();
        }
      }

      if (isLeft) {
        self.leftCalendar.month.month(month).year(year);
        if (self.linkedCalendars)
          self.rightCalendar.month = self.leftCalendar.month.clone().add(1, 'month');
      } else {
        self.rightCalendar.month.month(month).year(year);
        if (self.linkedCalendars)
          self.leftCalendar.month = self.rightCalendar.month.clone().subtract(1, 'month');
      }
      self.updateCalendars();
    };

    proto.timeChanged = function(e) {
      var cal = $(e.target).closest('.calendar'),
        isLeft = cal.hasClass('left');

      var hour = parseInt(cal.find('.hourselect').val(), 10);
      var minute = parseInt(cal.find('.minuteselect').val(), 10);
      var second = self.timePickerSeconds ? parseInt(cal.find('.secondselect').val(), 10) : 0;

      if (!self.timePicker24Hour) {
        var ampm = cal.find('.ampmselect').val();
        if (ampm === 'PM' && hour < 12)
          hour += 12;
        if (ampm === 'AM' && hour === 12)
          hour = 0;
      }

      if (isLeft) {
        var start = self.startDate.clone();
        start.hour(hour);
        start.minute(minute);
        start.second(second);
        self.setStartDate(start);
        if (self.singleDatePicker)
          self.endDate = self.startDate.clone();
      } else if (self.endDate) {
        var end = self.endDate.clone();
        end.hour(hour);
        end.minute(minute);
        end.second(second);
        self.setEndDate(end);
      }

      //update the calendars so all clickable dates reflect the new time component
      self.updateCalendars();

      //update the form inputs above the calendars with the new time
      self.updateFormInputs();

      //re-render the time pickers because changing one selection can affect what's enabled in another
      self.renderTimePicker('left');
      self.renderTimePicker('right');
    };

    proto.formInputsChanged = function(e) {
      var isRight = $(e.target).closest('.calendar').hasClass('right');
      var start = moment(self.container.find('input[name="daterangepicker_start"]').val(), self.locale.format).utcOffset(self.timeZone);
      var end = moment(self.container.find('input[name="daterangepicker_end"]').val(), self.locale.format).utcOffset(self.timeZone);

      if (start.isValid() && end.isValid()) {

        if (isRight && end.isBefore(start))
          start = end.clone();

        self.setStartDate(start);
        self.setEndDate(end);

        if (isRight) {
          self.container.find('input[name="daterangepicker_start"]').val(self.startDate.format(self.locale.format));
        } else {
          self.container.find('input[name="daterangepicker_end"]').val(self.endDate.format(self.locale.format));
        }

      }

      self.updateCalendars();
      if (self.timePicker) {
        self.renderTimePicker('left');
        self.renderTimePicker('right');
      }
    };

    proto.controlChanged = function() {
      if (!self.element.is('input')) return;
      if (!self.element.val().length) return;

      var dateString = self.element.val().split(self.locale.separator),
        start = null,
        end = null;

      if (dateString.length === 2) {
        start = moment(dateString[0], self.locale.format).utcOffset(self.timeZone);
        end = moment(dateString[1], self.locale.format).utcOffset(self.timeZone);
      }

      if (self.singleDatePicker || start === null || end === null) {
        start = moment(dateString[0], self.locale.format).utcOffset(self.timeZone);
        end = start;
      }

      self.setStartDate(start);
      self.setEndDate(end);
      self.updateView();
    };

    proto.keydown = function(e) {
      // Hide on tab or enter
      if ((e.keyCode === 9 ) || (e.keyCode === 13)) {
        self.hide();
      }
    };

    proto.remove = function() {
      self.container.remove();
      self.element.off('.daterangepicker');
      self.element.removeData();
    };


    //binding functions to daterange picker

    // END Prototype Methods/Functions



  } // END AvDaterangeController

  availity.ui.controller('avDateRangeController', avDateRangeController);

  avDateRangeDirective.$inject = ['avDateRangeConfig', '$window'];
  function avDateRangeDirective(avDateRangeConfig, $window) {
    return {
      restrict: 'EA',
      //read up on ngModelController docs
      require: ['ngModel', 'avDateRange'],
      controller: 'avDateRangeController',
      templateUrl: avDateRangeConfig.TEMPLATE,
      link: function(scope, element, attributes, controllers) {
        var ngModel = controllers[0];
        var avDateRange = controllers[1];

        console.log(avDateRange.$viewValue);

        if(!ngModel) {
          ngModel = avDateRange.findModel();
          if(!ngModel) {
            $log.error('avDatepicker requires ngModel');
            return;
          }
        }

        avDateRange.init();
        avDateRange.setNgModel(ngModel);

        element.on('changeDate', function(e) {
          $log.info('avDateRange changeDate {0}', [e]);
        });

        // (view to model)
        ngModel.$parsers.push(avDateRange.viewToModel);

        // (model to view) - added to end of formatters array
        // because they are processed in reverse order.
        // if the model is in Date format and send to the validation framework
        // prior to getting converted to the expected $viewValue format,
        // the validation will fail.
        ngModel.$formatters.push(avDateRange.modelToView);
        ngModel.$formatters.push(avDateRange.wrapIsoDate);

        var _$render = ngModel.$render;
        ngModel.$render = function() {
          _$render();
          avDateRange.setValue();
        };

        var win = angular.element($window);

        win.bind('scroll', function() {
          avDateRange.hide();
        });

        var target = element.siblings(avDateRangeConfig.ADD_ON_SELECTOR);
        if(target.length) {
          target.on('click.daterangepicker', function() {
            if(!element.prop('disabled')) { // Hack check for IE 8
              element.focus();
            }
          });
        }

        scope.$on('destroy', function() {
          avDateRange.destroy();
          if(target.length) {
            target.off('click.daterangepicker');
          }
        });


        // Needs fixed
        scope.$evalAsync(function() {
          element.daterange(avDateRange.options);
        });


      }
    };
  }

  availity.ui.directive('avDateRange', avDateRangeDirective);

})(window);
