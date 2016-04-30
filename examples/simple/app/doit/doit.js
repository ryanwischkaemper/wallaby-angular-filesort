(function(){
  angular.module('doit', ['feature3'])
    .controller('heyt', hey);
  
  hey.$inject = ['$http'];
  
  function hey($http) {

  };
})();
