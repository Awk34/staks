'use strict';

describe('Service: historicalData', function () {

  // load the service's module
  beforeEach(module('staksApp'));

  // instantiate service
  var historicalData;
  beforeEach(inject(function (_historicalData_) {
    historicalData = _historicalData_;
  }));

  it('should do something', function () {
    expect(!!historicalData).toBe(true);
  });

});
