(function($){
  
  var methods = {
    init: function(options) {
      /*var settings = $.extend({
        'auth': false,
        'url': null,
        'pull': true,
        'intents': true,
        'theme': null
      }, options);*/
      
      $.get('http://api.twitter.com/1/users/show.json', {
        'screen_name': 'ge_org'
      }, function(data) {
        alert(data);
      });
      
      return this;
    }
  };
  
  $.fn.twitComments = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.twitComments');
    }
  };
})(jQuery);