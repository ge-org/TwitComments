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
      
      /*$.ajax({
        url: 'http://api.twitter.com/1/users/show.json',
        method: 'GET',
        data: {'screen_name': 'ge_org'},
        dataType: 'jsonp',
        success: function(data) {
          
        },
        error: function(jqXHR, textStatus, errorThrown){alert('xhr: '+jqXHR.responseText+' text: '+textStatus+' err: '+errorThrown);}
      });*/
      
      var $this = $(this),
        data = $this.data('twitComments')
        ;
      
      if (!data) {
        
        // setup
          
        $(this).data('twitComments', {
          target: $this
        });
      }
      
      methods.createHTML();
      
      return this;
    },
    
    createHTML: function() {
      //
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