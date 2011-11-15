(function($){
  
  var defaults = {
    auth: false,    // true to activate authentication, false otherwise
    pushURL: null,  // url string or null
    pullURL: null, // true pulls comments from server, false otherwise
    info: null,     // element that will contain the user info or null to generate one
    form: null,     // form element or null to generate form
    comments: null, // element that contains the comments or null
    intents: false, // true to enable web intents, false otherwise
    strings: {
      name: 'Twitter Username',      // default value of name input field
      comment: 'Write a comment...', // default value of comment textarea
      submit: 'Comment',             // default value of submit button
      location: 'from'               // user xyz from abc
    }
  };
  
  var cssClass = 'twitcomments';
  var classPrefix = cssClass + '-';
  
  var methods = {
    init: function(options) {

      $.extend(defaults, options);
      methods._setupHTML.apply(this);
      methods._setupEvents.apply(this);
      methods._pullComments.apply(this);
      
      // display form
      
      // display comments
      
      return this;
    },
    
    _setupHTML: function() {
      
      this.addClass(cssClass);
      
      // create info
      if (null === defaults.info) {
        info = $('<div class="'+classPrefix+'info"></div>');
        info.append($('<img src="" alt="" class="'+classPrefix+'info-image" />'));
        info.append($('<span class="'+classPrefix+'span '+classPrefix+'info-fullname"><a href=""></a></span>'));
        info.append($('<span class="'+classPrefix+'span '+classPrefix+'info-twittername"><a href=""></a></span>'));
        info.append($('<span class="'+classPrefix+'span '+classPrefix+'info-location"></span>'));
        
        this.append(info);
        info.hide();
      } else {
        defaults.info.hide();
      }
      
      
      // create form
      if (null === defaults.form) {
        action = (defaults.pushURL === null) ? '#' : defaults.pushURL;
        
        form = $('<form class="'+classPrefix+'form" action="'+action+'" method="post"></form>');
        form.append($('<span class="'+classPrefix+'span '+classPrefix+'at-prefix">@</span>'));
        form.append($('<input type="text" name="'+classPrefix+'name" class="'+classPrefix+'input '+classPrefix+'input-name" value="'+defaults.strings.name+'" />'));
        form.append($('<textarea name="'+classPrefix+'comment" class="'+classPrefix+'textarea '+classPrefix+'input-comment">'+defaults.strings.comment+'</textarea>'));
        form.append($('<input type="submit" name="'+classPrefix+'submit" class="'+classPrefix+'button '+classPrefix+'input-submit" value="'+defaults.strings.submit+'" />'));
        
        this.append(form);
      }
      
      // create comments
      if (null === defaults.comments) {
        comments = $('<div class="'+classPrefix+'comments"></div>');
        this.append(comments);
      }
      
      return this;
    },
    
    _setupEvents: function() {
      
      $('.'+classPrefix+'input-name, .'+classPrefix+'input-comment').on('focus.twitcomments', function() {
        $(this).data('originalValue', $(this).val());
        $(this).val('');
      });
      
      $('.'+classPrefix+'input-name, .'+classPrefix+'input-comment').on('blur.twitcomments', function() {
        originalValue = $(this).data('originalValue');
        if ($(this).val() == '') {
          $(this).val(originalValue);
        }
      });
      
      $('.'+classPrefix+'input-name').on('blur.twitcomments', function() {
        methods._updateUserInfo($(this).val());
      });
      
      $('.'+classPrefix+'form').on('submit.twitcomments', function() {
        methods._submit();
      });
      
      return this;
    },
    
    _updateUserInfo: function(screenName) {
      $.ajax({
        url: 'http://api.twitter.com/1/users/show.json',
        method: 'GET',
        data: { 'screen_name': screenName },
        dataType: 'jsonp',
        success: function(data) {
          twitterNameURL = (defaults.intents) ? 'https://twitter.com/intent/user?screen_name='+data.screen_name : 'http://twitter.com/'+data.screen_name;
          
          $('.'+classPrefix+'info-image').attr('src', data.profile_image_url);
          $('.'+classPrefix+'info-fullname a').attr('href', data.url).text(data.name);
          $('.'+classPrefix+'info-twittername a').attr('href', twitterNameURL).text('@'+data.screen_name);
          $('.'+classPrefix+'info-location').text(defaults.strings.location+' '+data.location);
          
          $('.'+classPrefix+'info').fadeIn();
        },
        status: {
          400: function(jqXHR, textStatus, errorThrown) {
            // TODO
            $('.'+classPrefix+'info').text('Error');
            $('.'+classPrefix+'info').fadeIn();
          }
        }
      });
      
      return this;
    },
    
    _pullComments: function() {
      if (defaults.pullURL) {
        $.ajax({
          url: defaults.pullURL,
          method: 'GET',
          dataType: 'jsonp',
          success: function(data) {
            $('.'+classPrefix+'comments').text(data);
          },
          status: {
            400: function(jqXHR, textStatus, errorThrown) {
              // TODO
            }
          }
        });
      }
      
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