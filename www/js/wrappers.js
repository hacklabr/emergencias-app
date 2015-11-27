angular.module("viradapp.wrappers", [])

.factory('Lazy', ['$window', function ($window){
    return $window.Lazy;
}])
.factory('moment', function($window){
    return $window.moment;
})
.factory('Filter', function($window){
    return function(starting, ending){
        this.query = '';
        this.sorted = 'L';
        this.places = {
            data: [],
            query: ''
        };
        this.starting = starting.format('x');
        this.ending = ending.format('x');
        this.nearest = false;
    };
})
.factory('User', function(){
    return function(){
        this.uid = false;
        this.accessToken = false;
        // this.connected = false;
        this.name = false;
        this.picture = false;
        this.events = [];
        // this.initialized = false;
        // this.isBrowser = false;

        //this.valid = function valid(){
        //    return this.uid;
        //}
    }
})
.factory('MapState', function(){
    return function(mapTypeId, center){
        this.options = {
            'backgroundColor': 'transparent',
            'mapType': mapTypeId,
            'controls': {
                'myLocationButton': true,
                'indoorPicker': true,
                'zoom': true
            },
            'gestures': {
                'scroll': true,
                'tilt': true,
                'rotate': false,
                'zoom': true
            },
            'camera': {
                'latLng': center,
                'zoom': 14,
            }
        };
        this.markers = Lazy([]);
        // map options that will be kept in memory ;)
    }
})
.factory('ListState', function($window){
    return function(){
        this.loaded = 0;
        this.page = 0;
        this.data = [];
    }
})
.factory('Date', function(moment){
    return {
        LL :  function(date){
            return moment(date).format('LL');
        },
        start: function(){
            return moment("201506190000", "YYYYMMDDhhmm");
        },
        end: function(){
            return moment("201506222359", "YYYYMMDDhhmm");
        },
        oneDay: function(){
            return moment.duration(1, 'days');
        },
        timestamp: function(date, time){
            return moment(date+time, "YYYY-MM-DDhh:mm").format('x');
        }
    }
});
