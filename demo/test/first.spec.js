describe('some tests', function () {

  var $controller;
  
  beforeEach(function () {
    angular.mock.module('doit');
  });
  
  beforeEach(function () {
    angular.mock.inject(function (_$controller_) {
      $controller = _$controller_;
    });
  });
  
  it('should work', function () {    
    var ctrl = $controller('heyt');
    expect(ctrl).toBeDefined();
  });
})