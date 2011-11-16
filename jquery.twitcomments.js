(function($){
  
  var defaults = {
    pushURL: null,   // url string or null
    pullURL: null,   // url string or null
    params: null,    // parameters that will be send to the pushURL and pullURL (e.g. a page identifier)
    defaultProfileImageURL: '#',
    cssClass: 'twitcomments',
    twitterAnywhere: {
      auth: false,
      linkify: true,
      hovercards: true
    },
    strings: {
      twitterUsername: 'Twitter Username',
      writeAComment: 'Write a comment&hellip;',
      submit: 'Comment',
      submitWithAuth: 'Sign in with Twitter and comment',
      sending: 'Sending...',
      from: 'from',
      justNow: 'just now',
      aMinuteAgo: 'a minute ago',
      minutesAgo: 'minutes ago',
      oneHourAgo: 'one hour ago',
      hoursAgo: 'hours ago',
      yesterday: 'yesterday',
      daysAgo: 'days ago',
      aWeekAgo: 'a week ago',
      weeksAgo: 'weeks ago',
      aMonthAgo: 'a month ago',
      monthsAgo: 'months ago',
      aYearAgo: 'a year ago',
      yearsAgo: 'years ago'
    }
  };

  var $this = null;
  var classPrefix = null;
  var currentUser = null;
  
  var methods = {
    init: function(options) {

      $.extend(defaults, options);
      
      $this = this;
      classPrefix = defaults.cssClass + '-';
      this.addClass(defaults.cssClass);
      
      this.hide();
      methods._setupCommentForm.apply(this);
      methods._setupUserProfile.apply(this);
      methods._setupCommentList.apply(this);
      this.fadeIn();
      
      return this;
    },
    
    _setupCommentForm: function() {
      action = (defaults.pushURL) ? defaults.pushURL : '#';
      buttonText = (defaults.twitterAnywhere.auth) ? defaults.strings.submitWithAuth : defaults.strings.submit;
        
      form = $('<form class="'+classPrefix+'form" action="'+action+'" method="post"></form>');
      if (!defaults.twitterAnywhere.auth) {
        form.append($('<span class="'+classPrefix+'span '+classPrefix+'at-prefix">@</span>'));
        form.append($('<input type="text" name="'+classPrefix+'screen_name" class="'+classPrefix+'input '+classPrefix+'input-screen_name" value="'+defaults.strings.twitterUsername+'" />'));
      }
      form.append($('<textarea name="'+classPrefix+'comment" class="'+classPrefix+'textarea '+classPrefix+'input-comment">'+defaults.strings.writeAComment+'</textarea>'));
      form.append($('<input type="submit" name="'+classPrefix+'submit" class="'+classPrefix+'button '+classPrefix+'input-submit" value="'+buttonText+'" />'));

      this.append(form);
        
      form.on('submit.twitcomments', function(e) {
        if (defaults.twitterAnywhere.auth) {
          twttr.anywhere(function (T) {
            if (!T.isConnected()) {
              T.signIn({
                authComplete: function(user) {
                  methods._submitWithAuth();
                }
              });
            } else {
              methods._submitWithAuth();
            }
          });
        } else {
          methods._submitWithoutAuth();
        }
        e.preventDefault();
      });
      
      $('.'+classPrefix+'input-screen_name, .'+classPrefix+'input-comment').on('focus.twitcomments', function () {
        $(this).data('originalValue', $(this).val());
        $(this).val('');
      });
      
      $('.'+classPrefix+'input-screen_name, .'+classPrefix+'input-comment').on('blur.twitcomments', function () {
        originalValue = $(this).data('originalValue');
        if ($(this).val() == '') {
          $(this).val(originalValue);
        }
      });
    },
    
    _setupUserProfile: function() {
      userProfile = $('<div class="'+classPrefix+'userProfile"></div>');
      userProfile.hide();
      this.prepend(userProfile);
      
      if (defaults.twitterAnywhere.auth) {
        twttr.anywhere(function (T) {
          if (T.isConnected()) {
            methods._loadUserProfile(T.currentUser.data('screen_name'), methods._displayUserProfile);
          }
        });
      } else {
        $('.'+classPrefix+'input-screen_name').on('blur.twitcomments', function() {
          methods._loadUserProfile($(this).val(), methods._displayUserProfile);
        });
      }
    },
    
    _setupCommentList: function() {
      var comments = $('<div class="'+classPrefix+'comments"></div>');
      this.append(comments);
      
      $.ajax({
        url: defaults.pullURL,
        type: 'GET',
        data: { params: defaults.params },
        dataType: 'json',
        success: function(data) {
          $.each(data, function(key, data) {
            comments.append(methods._getUserProfileDOM(data));
            // TODO add comment text
          });
          
          methods._twitterAnywhere(comments);
        },
        status: {
          400: function(jqXHR, textStatus, errorThrown) {
            // TODO
            alert('Can\'t load comments');
          }
        }
      });
    },
    
    _displayUserProfile: function() {
      userProfile = $('.'+classPrefix+'userProfile');
      userProfile.hide();
      
      if (currentUser != null) {
        userProfile.html(methods._getUserProfileDOM(currentUser)).fadeIn();
        
        methods._twitterAnywhere(userProfile);
      }
    },
    
    _loadUserProfile: function(screenName, callback) {
      var userProfile = $('.'+classPrefix+'info');
      userProfile.hide();
      
      $.ajax({
        url: 'http://api.twitter.com/1/users/show.json',
        type: 'GET',
        data: { screen_name: screenName },
        dataType: 'jsonp',
        success: function(data) {
          currentUser = {};
          currentUser.screen_name = data.screen_name;
          currentUser.name = data.name;
          currentUser.url = data.url;
          currentUser.location = data.location;
          currentUser.profile_image_url = data.profile_image_url;
          userProfile.html(methods._getUserProfileDOM(currentUser)).fadeIn();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // TODO
          currentUser = null;
          alert('Can\'t load user');
        },
        complete: function() {
          callback.call();
        }
      });
      
      return this;
    },
    
    _submitWithAuth: function() {
      if ($('.'+classPrefix+'input-comment').val() == '' || $('.'+classPrefix+'input-comment').val() == defaults.strings.writeAComment) {
        // TODO
        alert('Comment no');
      } else {
        methods._pushComment();    
      }
    },
    
    _submitWithoutAuth: function() {
      if (currentUser == null) {
        // TODO
        alert('no user');
      } else if ($('.'+classPrefix+'input-comment').val() == '' || $('.'+classPrefix+'input-comment').val() == defaults.strings.writeAComment) {
        // TODO
        alert('Comment no');
      } else {
        methods._pushComment();
      }
    },
    
    _pushComment: function() {
      methods._toggleIndicator();
      $.ajax({
        url: defaults.pushURL,
        type: 'POST',
        data: {
          screen_name: $this.data('screen_name'),
          name: $this.data('name'),
          url: $this.data('url'),
          location: $this.data('location'),
          profile_image_url: $this.data('profile_image_url'),
          comment_content: $('.'+classPrefix+'form .'+classPrefix+'input-comment').val(),
          params: defaults.params
        },
        dataType: 'json',
        success: function(data) {
          infoBlock = methods._getNewUserBlock(data[0]).hide();
          $('.'+classPrefix+'comments').prepend(infoBlock);
          infoBlock.fadeIn();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // TODO
          alert('Can\'t save');
        },
        complete: function(){
          methods._toggleIndicator();
        }
      });
    },
    
    _toggleIndicator: function() {
      submitButton = $('.'+classPrefix+'input-submit');
      
      if (submitButton.attr('disabled') == 'disabled') {
        submitButton.val(submitButton.data('original-text'));
        submitButton.removeAttr('disabled');
      } else {
        submitButton.data('original-text', submitButton.val());
        submitButton.val(defaults.strings.sending);
        submitButton.attr('disabled', 'disabled');
      }
    },
    
    _twitterAnywhere: function(element) {
      if (defaults.twitterAnywhere.hovercards) {
        twttr.anywhere(function(T) {
          T(userProfile).hovercards();
        });
      }
    
      if (!defaults.twitterAnywhere.hovercards && defaults.twitterAnywhere.linkify) {
        twttr.anywhere(function(T) {
          T(userProfile).linkify();
        });
      }
    },
    
    _getUserProfileDOM: function(user) {
      
      imageURL = (user.profile_image_url) ? user.profile_image_url : defaults.defaultProfileImageURL;
      fullName = (user.url) ? '<a href="'+user.url+'">'+user.name+'</a>' : user.name;
      
      userProfile = $('<div></div>');
      userProfile.append($('<img src="'+imageURL+'" alt="" class="'+classPrefix+'user-image" />'));
      if (user.name) {
        userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-name">'+fullName+'</span>'));
      }
      userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-screen_name">@'+user.screen_name+'</span>'));
      if (user.location) {
        userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-location">'+defaults.strings.from+' '+user.location+'</span>'));
      }
      
      return userProfile;
    },
    
    /**
     * from https://github.com/azer/relative-date
     */
    _relativeDate: function(input, reference) {
      var SECOND = 1000,
        MINUTE = 60 * SECOND,
        HOUR = 60 * MINUTE,
        DAY = 24 * HOUR,
        WEEK = 7 * DAY,
        YEAR = DAY * 365,
        MONTH = YEAR / 12;

      var formats = [
        [ 0.7 * MINUTE, defaults.strings.justNow ],
        [ 1.5 * MINUTE, defaults.strings.aMinuteAgo ],
        [ 60 * MINUTE, defaults.strings.minutesAgo, MINUTE ],
        [ 1.5 * HOUR, defaults.strings.oneHourAgo ],
        [ DAY, defaults.strings.hoursAgo, HOUR ],
        [ 2 * DAY, defaults.strings.yesterday ],
        [ 7 * DAY, defaults.strings.daysAgo, DAY ],
        [ 1.5 * WEEK, defaults.strings.aWeekAgo],
        [ MONTH, defaults.strings.weeksAgo, WEEK ],
        [ 1.5 * MONTH, defaults.strings.aMonthAgo ],
        [ YEAR, defaults.strings.monthsAgo, MONTH ],
        [ 1.5 * YEAR, defaults.strings.aYearAgo ],
        [ Number.MAX_VALUE, defaults.strings.yearsAgo, YEAR ]
      ];

      !reference && ( reference = (new Date).getTime() );
      reference instanceof Date && ( reference = reference.getTime() );
      input instanceof Date && ( input = input.getTime() );
    
      var delta = reference - input,
          format, i, len;

      for(i = -1, len=formats.length; ++i < len; ) {
        format = formats[i];
        if(delta < format[0]){
          return format[2] == undefined ? format[1] : Math.round(delta/format[2]) + ' ' + format[1];
        }
      }
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