(function() {
    'use strict';

    angular
        .module('app')
        .controller('GlobalExceptionHandler', GlobalExceptionHandler);

    GlobalExceptionHandler.$inject = ['$location'];

    function GlobalExceptionHandler($location)
    {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'GlobalExceptionHandler';

        activate();

        function activate() { }
    }
})();
