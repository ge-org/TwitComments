(function($){
  
  var defaults = {
    pushURL: null,   // url string or null
    pullURL: null,   // url string or null
    params: null,    // parameters that will be send to the pushURL and pullURL (e.g. a page identifier)
    defaultProfileImageURL: '#',
    cssClass: 'twitcomments',
    strings: {
      twitterUsername: 'Twitter Username',
      writeAComment: 'Write a comment...',
      submit: 'Comment',
      sending: 'Sending...',
      errorNoName: 'Please enter your Twitter name',
      errorNoComment: 'Please enter a comment',
      errorCommentsNotLoaded: 'The comments could no be loaded',
      errorCommentNotSaved: 'Your comment could not be saved',
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
        
      form = $('<form class="'+classPrefix+'form" action="'+action+'" method="post"></form>');
      form.append($('<span class="'+classPrefix+'span '+classPrefix+'at-prefix">@</span>'));
      form.append($('<input type="text" name="'+classPrefix+'screen_name" class="'+classPrefix+'input '+classPrefix+'input-screen_name" value="'+defaults.strings.twitterUsername+'" />'));
      form.append($('<textarea name="'+classPrefix+'comment" class="'+classPrefix+'textarea '+classPrefix+'input-comment">'+defaults.strings.writeAComment+'</textarea>'));
      form.append($('<input type="submit" name="'+classPrefix+'submit" class="'+classPrefix+'button '+classPrefix+'input-submit" value="'+defaults.strings.submit+'" />'));

      this.append(form);
        
      form.on('submit.twitcomments', function(e){e.preventDefault();});
      $('.'+classPrefix+'input-submit').on('click.twitcomments', function(e) {
        e.preventDefault();
        
        commentContent = $('.'+classPrefix+'input-comment').val();
        if (currentUser == null) {
          $('.'+classPrefix+'userProfile').append($('<span class="'+classPrefix+'span .'+classPrefix+'error">'+defaults.strings.errorNoName+'</span>')).fadeIn();
          return false;
        } else if (commentContent == '' || commentContent == defaults.strings.writeAComment) {
          $('.'+classPrefix+'userProfile').append($('<span class="'+classPrefix+'span .'+classPrefix+'error">'+defaults.strings.errorNoComment+'</span>')).fadeIn();
          return false;
        } else {
          methods._pushComment();
        }
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
      
      var timer = 0;
      $('.'+classPrefix+'input-screen_name').on('keyup.twitcomments', function() {
        screen_name = $('.'+classPrefix+'input-screen_name').val();
        
        if (timer) {
          clearTimeout(timer);
        }
      
        timer = setTimeout(function() {
          methods._loadUserProfile(screen_name, methods._displayUserProfile);
        }, 500);
      });
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
            comments.append(methods._getCommentPostDOM(data));
          });
        },
        error: function(jqXHR, textStatus, errorThrown) {
          comments.html($('<span class="'+classPrefix+'span .'+classPrefix+'error">'+defaults.strings.errorCommentsNotLoaded+'</span>'));
        }
      });
    },
    
    _displayUserProfile: function() {
      userProfile = $('.'+classPrefix+'userProfile');
      
      if (currentUser != null && $this.data('user-changed')) {
        userProfile.html(methods._getUserProfileDOM(currentUser)).fadeIn();
      }
    },
    
    _loadUserProfile: function(screenName, callback) {
      var userProfile = $('.'+classPrefix+'info');
      userProfile.hide();
      
      $.getJSON('http://api.twitter.com/1/users/show.json?screen_name=ge_org', function(data){console.log('ok');});
      
      $.ajax({
        url: 'http://api.twitter.com/1/users/show.xml',
        type: 'GET',
        data: { screen_name: screenName },
        success: function(data) {
          $this.data('user-changed', (currentUser == null || (currentUser != null && currentUser.screen_name != data.screen_name)));
          
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
          console.log('cannnot load user');
          console.log(textStatus);
          console.log(errorThrown);
        },
        complete: function() {
          callback.call();
        }
      });
      
      return this;
    },
    
    _pushComment: function() {
      methods._toggleIndicator();
      $.ajax({
        url: defaults.pushURL,
        type: 'POST',
        data: {
          user: currentUser,
          comment: $('.'+classPrefix+'form .'+classPrefix+'input-comment').val(),
          params: defaults.params
        },
        dataType: 'json',
        success: function(data) {
          commentBlock = methods._getCommentPostDOM(data).hide();
          
          $('.'+classPrefix+'comments').prepend(commentBlock);
          commentBlock.fadeIn();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('.'+classPrefix+'userProfile').append($('<span class="'+classPrefix+'span .'+classPrefix+'error">'+defaults.strings.errorCommentNotSaved+'</span>')).fadeIn();
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
    
    _getUserProfileDOM: function(user) {
      
      imageURL = (user.profile_image_url) ? user.profile_image_url : defaults.defaultProfileImageURL;
      fullName = (user.url) ? '<a href="'+user.url+'">'+user.name+'</a>' : user.name;
      
      userProfile = $('<div></div>');
      userProfile.append($('<img src="'+imageURL+'" alt="" class="'+classPrefix+'user-image" />'));
      if (user.name) {
        userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-name">'+fullName+'</span>'));
      }
      userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-screen_name"><a href="http://twitter.com/'+user.screen_name+'">@'+user.screen_name+'</a></span>'));
      if (user.location) {
        userProfile.append($('<span class="'+classPrefix+'span '+classPrefix+'user-location">'+defaults.strings.from+' '+user.location+'</span>'));
      }
      
      return userProfile;
    },
    
    _getCommentPostDOM: function(comment) {
      commentBlock = methods._getUserProfileDOM(comment);
      commentBlock.append($('<span class="'+classPrefix+'span .'+classPrefix+'comment-time">'+methods._relativeDate(new Date(comment.comment_timestamp), new Date())+'</span>'));
      commentBlock.append($('<span class="'+classPrefix+'span .'+classPrefix+'comment-content">'+comment.comment_content+'</span>'));
      
      return commentBlock;
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