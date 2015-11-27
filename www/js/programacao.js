angular.module("viradapp.programacao", [])
.factory('Programacao', function() {
    return {
        init: function(){console.log("stub service")},
    }
})
.filter('newlefilter', function(){
    /**
     * This filter receives 3 objects:
     * 1 - Events Lazy sequence
     * 2 - Spaces Lazy sequence
     * 3 - And a Filter object
     *
     * Returns the Filtered Lazy Sequence
     *
     */
    return function(events, spaces, filters){
        var lefilter = function (event){
            var hasSpace = false;
            var space = spaces.findWhere({
                id: event.spaceId.toString()
            });
            if(typeof space !== 'undefined'){
                if(filters.places.data.length > 0){
                    // If the places array is not empty,
                    // test if the event belongs to one of the places
                    if(!Lazy(filters.places.data).contains(space.id)){
                        return false;
                    }
                }

                var lm = new RegExp((filters.query), 'ig');
                hasSpace = lm.test(space.name.substring(filters.query));

                event.spaceData = space;
            }
            var date = moment(event.startsOn + " " + event.startsAt,
                          "YYYY-MM-DD hh:mm").format('x');

            return (date <= filters.ending
                    && date >= filters.starting)
                    && (event.name.indexOf(filters.query) >= 0
                        || hasSpace);
        };

        // MOVE TO INIT
        events.groupBy('spaceId').sortBy();

        return events.filter(lefilter);
    };

})
.filter('lefilter', function(){
    var projects = {
        '865': 'Virada Coral',
        '857': 'Viradinha',
        '794': 'II Mostra de Teatros e Espaços Independentes',
        '855': '19º Cultura Inglesa Festival'
    };


    /**
     * This filter receives 3 objects:
     * 1 - Events Lazy sequence
     * 2 - Spaces Lazy sequence
     * 3 - And a Filter object
     *
     * Returns the Filtered Lazy Sequence
     *
     */
    return function(events, spaces, filters){

        events.source.forEach(function(event){
            if(!event.incProject && event.project && event.project.id && projects[event.project.id]){
                event.name += ' [' + projects[event.project.id] + ']';
                event.incProject = true;
            }
        });

        var lefilter = function (event){
            var hasSpace = false;
            var lm = new RegExp((filters.query), 'ig');
            var belongsTo = true;
            var space = spaces.findWhere({
                id: event.spaceId.toString()
            });

            event.space = space;

            if(typeof space !== 'undefined'){
                if(filters.places.data.length > 0){
                    // If the places array is not empty,
                    // test if the event belongs to one of the places
                    if(!Lazy(filters.places.data).contains(space.id.toString())){
                        belongsTo = false;
                    }
                }

                hasSpace = lm.test(space.name.substring(filters.query));
            } else if(filters.places.data.length > 0){
                belongsTo = false;
            }
            var date = moment(event.startsOn + " " + event.startsAt,
                          "YYYY-MM-DD hh:mm").format('x');

            var hasInTitle = false;
            if(typeof space !== 'undefined'){
                hasInTitle = lm.test(event.name.substring(filters.query));
            }

            return belongsTo && (date <= filters.ending
                    && date >= filters.starting)
                    && (hasInTitle || hasSpace);
        };

        return events.filter(lefilter);
    };
})
.filter('toSpaces', function(){
    /**
     * This filter receives a:
     * 1 - Filtered Lazy sequence as data
     *
     * Returns an array with filtered spaces
     *
     */
    return function(data, spaces){
        var currSpaces = [];
        var toSpaces = function(event){
            var space = spaces.findWhere({
                id: event.spaceId.toString()
            });

            if(typeof space !== 'undefined'){
                var curr = Lazy(currSpaces)
                    .findWhere({id : event.spaceId.toString()});
                if(typeof curr !== 'undefined'){
                    curr.events.push(event);
                } else {
                    curr = space;
                    curr.events = [];
                    curr.events.push(event);
                    currSpaces.push(curr);
                }

            }
            return true;
        };

        var flattened = [];
        var flattenList = function(space){
            var spc = space.data;
            spc.index = space.index;
            flattened.push(spc);

            Lazy(space.events).each(function(event){
                flattened.push(event);
            });
        }

        data.each(toSpaces);
        Lazy(currSpaces).sortBy('index').each(flattenList);
        return flattened;
    };
})
.filter('searchPlaces', function(){
  return function (items, query) {
    if(typeof items === 'undefined') return;
    var filtered = [];
    var letterMatch = new RegExp((query), 'ig');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (query) {
        if (letterMatch.test(item.name.substring(query.length))) {
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    }
    return filtered;
  };
});
