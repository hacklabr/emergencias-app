// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function () {

    var Resig = {
        templateCache: {},
        htmlCache: {},
        elementCache: {}
    };

    this.Resig = Resig;


    Resig.tmpl = function (str, data) {
        var fn;
        if (/^[A-Za-z0-9\-_]+$/.test(str)) {
            // se é um id
            fn = Resig.templateCache[str] = Resig.templateCache[str] || Resig.tmpl(document.getElementById(str).innerHTML);

        } else {
            fn = Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +
                // Convert the template into pure JavaScript
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")
                + "');}return p.join('');");
        }

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };

    Resig.render = function (template, data, useCache) {
        if (useCache && data.cacheId && Resig.htmlCache[template] && Resig.htmlCache[template][data.cacheId]) {
            return Resig.htmlCache[template][data.cacheId];
        }

        if (useCache) {
            Resig.htmlCache[template] = Resig.htmlCache[template] || {};
        }

        var html = this.tmpl(template, data);

        if (useCache && data.cacheId) {
            Resig.htmlCache[template][data.cacheId] = html;
        }

        return html;
    };

    Resig.renderElement = function (template, data, useCache) {
        if (useCache && data.cacheId && Resig.elementCache[template] && Resig.elementCache[template][data.cacheId]) {
            return Resig.elementCache[template][data.cacheId];
        }

        if (useCache) {
            Resig.elementCache[template] = Resig.elementCache[template] || {};
        }

        var tmp = document.createElement('div');

        tmp.innerHTML = Resig.render(template, data);

        if (useCache && data.cacheId) {
            Resig.elementCache[template][data.cacheId] = tmp.firstElementChild;
        }

        tmp.firstElementChild.resigData = data;

        return tmp.firstElementChild;
    };

    Resig.reRenderElement = function(template, data){
        if (data.cacheId && Resig.elementCache[template] && Resig.elementCache[template][data.cacheId]) {
            var element = Resig.elementCache[template][data.cacheId];

            var tmp = document.createElement('div');

            tmp.innerHTML = Resig.render(template, data);


            element.innerHTML = tmp.firstElementChild.innerHTML;
        }
    };

    Resig.deleteElementCache = function (template, data) {
        Resig.deleteElementCache = function (template, data) {
        if (data.cacheId && Resig.elementCache[template] && Resig.elementCache[template][data.cacheId]) {
            delete Resig.elementCache[template][data.cacheId];
        }
    };
    };

    Resig.deleteHtmlCache = function (template, data) {
        if (data.cacheId && Resig.htmlCache[template] && Resig.htmlCache[template][data.cacheId]) {
            delete Resig.htmlCache[template][data.cacheId];
        }
    };

    Resig.clearCache = function(){
        Resig.clearElementCache();
        Resig.clearHtmlCache();
    };

    Resig.clearElementCache = function(){
        Resig.elementCache = [];
    };

    Resig.clearHtmlCache = function(){
        Resig.htmlCache = [];
    };

})();
