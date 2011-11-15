(function($){
  
  var defaults = {
    auth: false,    // true to activate authentication, false otherwise
    pushURL: null,  // url string or null
    pullURL: null, // true pulls comments from server, false otherwise
    info: null,     // element that will contain the user info or null to generate one
    form: null,     // form element or null to generate form
    comments: null, // element that contains the comments or null
    intents: false, // true to enable web intents, false otherwise
    defaultProfileImage: null,
    strings: {
      name: 'Twitter Username',      // default value of name input field
      comment: 'Write a comment...', // default value of comment textarea
      submit: 'Comment',             // default value of submit button
      location: 'from'               // user xyz from abc
    }
  };
  
  var cssClass = 'twitcomments';
  var classPrefix = cssClass + '-';
  var $this;
  
  var methods = {
    init: function(options) {

      $this = this;
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
        comments.hide();
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
      if (defaults.info == null && $('.'+classPrefix+'info').length == 0) {
        $this.prepend($('<div class="'+classPrefix+'info"></div>'));
      }    
      infoBlock = (defaults.info) ? defaults.info : $('.'+classPrefix+'info');
      infoBlock.hide();
      
      $.ajax({
        url: 'http://api.twitter.com/1/users/show.json',
        method: 'GET',
        data: { 'screen_name': screenName },
        dataType: 'jsonp',
        success: function(data) {
          infoBlock.html(methods._getNewUserBlock(data)).fadeIn();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          infoBlock.html('').fadeIn();
        }
      });
      
      return this;
    },
    
    _pullComments: function() {
      if (defaults.pullURL) {
        $.ajax({
          url: defaults.pullURL,
          method: 'GET',
          dataType: 'json',
          success: function(data) {
            comments = $('.'+classPrefix+'comments');
            $.each(data, function(key, data) {
              comments.append(methods._getNewUserBlock(data));
            });
            $('.'+classPrefix+'comments').fadeIn();
          },
          status: {
            400: function(jqXHR, textStatus, errorThrown) {
              // TODO
            }
          }
        });
      }
      
      return this;
    },
    
    _getNewUserBlock: function(data) {
      
      imageURL = (data.profile_image_url) ? data.profile_image_url : defaults.defaultProfileImage;
      fullName = (data.url) ? '<a href="'+data.url+'">'+data.name+'</a>' : data.name;
      twitterURL = (defaults.intents) ? 'https://twitter.com/intent/user?screen_name='+data.screen_name : 'http://twitter.com/'+data.screen_name;
      
      block = $('<div></div>');
      block.append($('<img src="'+imageURL+'" alt="" class="'+classPrefix+'user-image" />'));
      block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-fullname">'+fullName+'</span>'));
      block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-twittername"><a href="'+twitterURL+'">@'+data.screen_name+'</a></span>'));
      
      if (data.comment_timestamp) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'comment-time">'+data.comment_timestamp+'</span>'));
      }
      
      block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-location">'+defaults.strings.location+' '+data.location+'</span>'));
      
      if (data.comment_content) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'comment-content">'+data.comment_content+'</span>'));
      }
      
      return block;
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