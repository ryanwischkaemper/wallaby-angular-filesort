describe('some tests', function () {

  var $controller;
  
  beforeEach(function () {
    angular.mock.module('feature3');
  });
  
  beforeEach(function () {
    angular.mock.inject(function (_$controller_) {
      $controller = _$controller_;
    });
  });
  
  it('should work', function () {    
    var ctrl = $controller('main');
    expect(ctrl).toBeDefined();
  });

});
