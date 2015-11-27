angular.module("viradapp.config", [])
.factory('Conn', function(){
    CONN = "DEFAULT";

    // Connection Change Handler
    // This function just change the global connection type
    var connChangeHandler = function(conn){
        if(window.Connection) {
            if(Connection.NONE == conn.type){
                viradapp.value('CONN', Connection.NONE);
            } else if(Connection.ETHERNET == conn.type
                || Connection.WIFI == conn.type
                    || Connection.CELL_4G){
                        CONN = "FAST";
                    } else {
                        CONN = "SLOW";
                    }
        } else {
            CONN = "UNKNOWN";
        }
    }

    document.addEventListener("online", connChangeHandler, false);
    document.addEventListener("offline", connChangeHandler, false);

    return {
        type: function(){
            return CONN;
        }
    }
})
.factory('GlobalConfiguration', function(){
    return {
        BASE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/wp-content/themes/viradacultural-2015/app",
        TEMPLATE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/wp-content/themes/viradacultural-2015", // seens deprecated
        SOCIAL_API_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/api",
        SHARE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015",
        APP_ID: '1460336737533597'
    }
});
