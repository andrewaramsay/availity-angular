(function(root) {

  'use strict';

  var availity = root.availity;

  availity.demo.controller('DateRangeController', function($scope) {

    // How to view scope.daterange not just a single value
    $scope.startDate = new Date();
    $scope.endDate = '';

    $scope.startDate2 = new Date();
    $scope.endDate2 = '';


  });

})(window);

