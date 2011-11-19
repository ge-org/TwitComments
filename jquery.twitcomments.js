(function($){
  
  var defaults = {
    pushURL: null,
    pullURL: null,
    params: null,
    defaultProfileImageURL: null,
    cssClass: 'twitcomments',
    twitterUsername: 'Twitter Username',
    writeAComment: 'Write a comment...',
    submit: 'Comment',
    sending: 'Sending...',
    errorNoName: 'Please enter your Twitter name.',
    errorNoComment: 'Please enter a comment.',
    errorCommentsNotLoaded: 'The comments could no be loaded.',
    errorCommentNotSaved: 'Your comment could not be saved.',
    from: 'from',
    justNow: 'just now',
    aMinuteAgo: 'a minute ago',
    minutesAgo: '{} minutes ago',
    oneHourAgo: 'one hour ago',
    hoursAgo: '{} hours ago',
    yesterday: 'yesterday',
    daysAgo: '{} days ago',
    aWeekAgo: 'a week ago',
    weeksAgo: '{} weeks ago',
    aMonthAgo: 'a month ago',
    monthsAgo: '{} months ago',
    aYearAgo: 'a year ago',
    yearsAgo: '{} years ago'
  };

  var $this = null;
  var classPrefix = null;
  
  var methods = {
    init: function(options) {

      $.extend(defaults, options);
      
      $this = this;
      classPrefix = defaults.cssClass + '-';
      this.addClass(defaults.cssClass);
      
      this.hide();
      methods._setupErrorDisplay.apply(this);
      methods._setupCommentForm.apply(this);
      methods._setupCommentList.apply(this);
      this.fadeIn();
      
      return this;
    },
    
    _setupErrorDisplay: function() {
      errorDisplay = $('<span class="'+classPrefix+'span '+classPrefix+'error-message"></span>');
      errorDisplay.hide();
      this.append(errorDisplay);
    },
    
    _setupCommentForm: function() {
      action = (defaults.pushURL) ? defaults.pushURL : '#';
        
      form = $('<form class="'+classPrefix+'form" action="'+action+'" method="post"></form>');
      form.append($('<span class="'+classPrefix+'span '+classPrefix+'at-prefix">@</span>'));
      form.append($('<input type="text" name="'+classPrefix+'screen_name" class="'+classPrefix+'input '+classPrefix+'input-screen_name" value="'+defaults.twitterUsername+'" />'));
      form.append($('<textarea name="'+classPrefix+'comment" class="'+classPrefix+'textarea '+classPrefix+'input-comment">'+defaults.writeAComment+'</textarea>'));
      form.append($('<input type="submit" name="'+classPrefix+'submit" class="'+classPrefix+'button '+classPrefix+'input-submit" value="'+defaults.submit+'" />'));

      this.append(form);
        
      $('.'+classPrefix+'form').on('submit.twitcomments', function(e) {
        e.preventDefault();
        
        screenName = $('.'+classPrefix+'input-screen_name').val();
        commentContent = $('.'+classPrefix+'input-comment').val();
        if (screenName == '' || screenName == defaults.twitterUsername) {
          methods._displayError(defaults.errorNoName);
          return false;
        } else if (commentContent == '' || commentContent == defaults.writeAComment) {
          methods._displayError(defaults.errorNoComment);
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
          methods._displayError(defaults.errorCommentsNotLoaded);
        }
      });
    },
    
    _pushComment: function() {
      methods._toggleIndicator();
      $.ajax({
        url: defaults.pushURL,
        type: 'POST',
        data: {
          user: $('.'+classPrefix+'input-screen_name').val(),
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
          methods._displayError(defaults.errorCommentNotSaved);
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
        submitButton.val(defaults.sending);
        submitButton.attr('disabled', 'disabled');
      }
    },
    
    _getUserProfileDOM: function(user) {
      
      imageURL = (!user.profile_image_url || user.profile_image_url == '') ? defaults.defaultProfileImageURL : user.profile_image_url;
      fullName = (user.url) ? '<a href="'+user.url+'">'+user.name+'</a>' : user.name;
      
      userProfile = $('<div class="'+classPrefix+'comment"></div>');
      userProfile.append($('<div class="'+classPrefix+'profile-image"><img src="'+imageURL+'" alt="" /></div>'));
      
      nameContainer = $('<div class="'+classPrefix+'name_container"></div>');
      if (user.name) {
        nameContainer.append($('<span class="'+classPrefix+'span '+classPrefix+'name">'+fullName+'</span>'));
      }
      nameContainer.append($('<span class="'+classPrefix+'span '+classPrefix+'screen-name"><a href="http://twitter.com/'+user.screen_name+'">@'+user.screen_name+'</a></span>'));
      
      metaContainer = $('<div class="'+classPrefix+'meta_container"></div>');
      
      userProfile.append(nameContainer);
      if (user.location) {
        metaContainer.append($('<span class="'+classPrefix+'span '+classPrefix+'location">'+defaults.from+' '+user.location+'</span>'));
      }
      userProfile.append(metaContainer);
      
      return userProfile;
    },
    
    _getCommentPostDOM: function(comment) {
      commentBlock = methods._getUserProfileDOM(comment);
      metaContainer = commentBlock.find('.'+classPrefix+'meta_container');
      metaContainer.prepend($('<span class="'+classPrefix+'span '+classPrefix+'time">'+methods._relativeDate(new Date(comment.comment_timestamp), new Date())+'</span>'));
      commentBlock.append($('<div class="'+classPrefix+'content">'+comment.comment_content+'</div>'));
      
      return commentBlock;
    },
    
    _displayError: function(message) {
      error = $('<span class="'+classPrefix+'span .'+classPrefix+'error">'+message+'</span>');
      $('.'+classPrefix+'error-message').html(error).fadeIn();
    },
    
    /**
     * from https://github.com/azer/relative-date
     * customized by me
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
        [ 0.7 * MINUTE, defaults.justNow ],
        [ 1.5 * MINUTE, defaults.aMinuteAgo ],
        [ 60 * MINUTE, defaults.minutesAgo, MINUTE ],
        [ 1.5 * HOUR, defaults.oneHourAgo ],
        [ DAY, defaults.hoursAgo, HOUR ],
        [ 2 * DAY, defaults.yesterday ],
        [ 7 * DAY, defaults.daysAgo, DAY ],
        [ 1.5 * WEEK, defaults.aWeekAgo],
        [ MONTH, defaults.weeksAgo, WEEK ],
        [ 1.5 * MONTH, defaults.aMonthAgo ],
        [ YEAR, defaults.monthsAgo, MONTH ],
        [ 1.5 * YEAR, defaults.aYearAgo ],
        [ Number.MAX_VALUE, defaults.yearsAgo, YEAR ]
      ];

      !reference && ( reference = (new Date).getTime() );
      reference instanceof Date && ( reference = reference.getTime() );
      input instanceof Date && ( input = input.getTime() );
    
      var delta = reference - input,
          format, i, len;

      for(i = -1, len=formats.length; ++i < len; ) {
        format = formats[i];
        if(delta < format[0]){
          return format[2] == undefined ? format[1].replace('{}', '1') : format[1].replace('{}', Math.round(delta/format[2]));
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