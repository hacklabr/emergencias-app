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

// This can be a performance issue
app.filter('groupBy', [
    'filterStabilize',
    function(stabilize) {

        return stabilize(
            function(items, field) {

                if (!items || !items.length) return;

                // var dividers = [];
                var output = {};
                var divider;

                for (var i = 0, ii = items.length; i < ii && (item = items[i]); i++) {

                    divider = item[field];
                    if (!output[divider]) {
                        // dividers[divider] = divider;
                        output[divider] = [];
                    }
                    output[divider].push(item);
                };
                return output;
            }
        );
    }
]);

app.factory('filterStabilize', [
  'memoize',
  function(memoize) {
    function service(fn) {
      function filter() {
        var args = [].slice.call(arguments);
        // always pass a copy of the args so that the original input can't be modified
        args = angular.copy(args);
        // return the `fn` return value or input reference (makes `fn` return optional)
        var filtered = fn.apply(this, args) || args[0];
        return filtered;
      }
      var memoized = memoize(filter);
      return memoized;
    }
    return service;
  }
])
app.factory('memoize', [
  function() {
    function service() {
      return memoizeFactory.apply(this, arguments);
    }
    function memoizeFactory(fn) {
      var cache = {};
      function memoized() {
        var args = [].slice.call(arguments);
        var key = JSON.stringify(args);
        var fromCache = cache[key];
        if (fromCache) {
          return fromCache;
        }
        cache[key] = fn.apply(this, arguments);
        return cache[key];
      }
      return memoized;
    }
    return service;
  }
]);
