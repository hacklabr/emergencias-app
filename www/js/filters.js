app = angular.module('emergencias.filters', []);

app.filter('arrayFilter', function () {
    return function (items, array_field, tags) {
        var filtered = [];
        (items || []).forEach(function (item) {
            // This is AND condicion betwen tag
            // var matches = tags.every(function (tag) {
            //     return (item[array_field].indexOf(tag) > -1);
            // });

            // This is OR condicions
            var matches = false;
            var matches = tags.every(function (tag) {
                return (item[array_field].indexOf(tag) > -1);
            });
            if (matches) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});

app.filter('groupBy', [
    'pmkr.filterStabilize', function(stabilize) {
        return stabilize(
            function(items, field) {

                if (!items || !items.length) return;

                // var dividers = [];
                var output = {};
                // var divider;
                //
                // for (var i = 0, ii = items.length; i < ii && (item = items[i]); i++) {
                //     divider = item[field];
                //     if (!output[divider]) {
                //         output[divider] = [];
                //     }
                //     output[divider].push(item);
                // };
                return output;
            }
    );
}]);
