function YQLCACHE() {

/* based on https://github.com/codepo8/yql-localcache */

var cacheid,cb;
var current,data;

this.get=function(transaction) {

	cb = transaction.callback;
	cacheid = transaction.id;

	current = JSON.parse(localStorage.getItem(cacheid));
	if(current !== null){

	/* if the cache time is less than the cacheage return it*/
        if((new Date().getTime() - current.time) < transaction.cacheage){
          cb({type:"cached",data:current.data});

        /* if the cache is older than the max age, prime the cache */
        } else {
          this.loadYQL(transaction.yql);
        }

      /* if the cache has no data, load from YQL again */
      } else {
        this.loadYQL(transaction.yql);
      }
}

this.loadYQL=function(yql){

	var url = "http://query.yahooapis.com/v1/public/yql?q="+encodeURIComponent(yql)+"&format=json";

	Mojo.Log.info(url);

        var request = new Ajax.Request(url, {
	       method: 'get',
               asynchronous: true,
               evalJSON: true,
	       onSuccess: this.cache,

		on0: function (ajaxResponse) {
	            // connection failed, typically because the server is overloaded or has gone down since the page loaded
	            Mojo.Log.error("Connection failed");
	        },
	        onFailure: function(response) {
	            // Request failed (404, that sort of thing)
	            Mojo.Log.error("Request failed");
	        },
	        onException: function(request, ex) {
	            // An exception was thrown
	            Mojo.Log.error("Exception");
	        }

	});

}

this.cache=function(transport) {

	var data = transport.responseJSON;

	var timestamp = new Date().getTime();
        localStorage.setItem(cacheid,JSON.stringify({time:timestamp,data:data}));
        cb({type:"freshcache",data:data});

}

}

var yqlcache = new YQLCACHE();
