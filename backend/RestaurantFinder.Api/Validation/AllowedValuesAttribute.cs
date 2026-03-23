(function() {
    'use strict';

    angular
        .module('app')
        .controller('AllowedValuesAttribute', AllowedValuesAttribute);

    AllowedValuesAttribute.$inject = ['$location'];

    function AllowedValuesAttribute($location)
    {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'AllowedValuesAttribute';

        activate();

        function activate() { }
    }
})();
