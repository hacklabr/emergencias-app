angular.module("emergencias.config", [])
.factory('Conn', function(){
    CONN = "DEFAULT";

    // Connection Change Handler
    // This function just change the global connection type
    var connChangeHandler = function(conn){
        if(window.Connection) {
            if(Connection.NONE == conn.type){
                emergencias.value('CONN', Connection.NONE);
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
        //BASE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/wp-content/themes/viradacultural-2015/app",
	BASE_URL : 'http://localhost:8100/data',
        TEMPLATE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/wp-content/themes/viradacultural-2015", // seens deprecated
        SOCIAL_API_URL : "http://viradacultural.prefeitura.sp.gov.br/2015/api",
        SHARE_URL : "http://viradacultural.prefeitura.sp.gov.br/2015",

        TERMS_URL: "http://www.google.com",
        PRAVACY_URL: "http://www.uol.com.br",

        APP_ID: '1460336737533597'
    }
});
