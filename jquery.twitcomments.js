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
      twitterUsername: 'Twitter Username',
      writeAComment: 'Write a comment...',
      submit: 'Comment',
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
      
      return this;
    },
    
    _setupHTML: function() {
      
      this.addClass(cssClass);
      
      // create form
      if (null === defaults.form) {
        action = (defaults.pushURL === null) ? '#' : defaults.pushURL;
        
        form = $('<form class="'+classPrefix+'form" action="'+action+'" method="post"></form>');
        form.append($('<span class="'+classPrefix+'span '+classPrefix+'at-prefix">@</span>'));
        form.append($('<input type="text" name="'+classPrefix+'screen_name" class="'+classPrefix+'input '+classPrefix+'input-name" value="'+defaults.strings.twitterUsername+'" />'));
        form.append($('<textarea name="'+classPrefix+'comment" class="'+classPrefix+'textarea '+classPrefix+'input-comment">'+defaults.strings.writeAComment+'</textarea>'));
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
      
      $('.'+classPrefix+'input-name, .'+classPrefix+'input-comment').on('focus.twitcomments', function () {
        $(this).data('originalValue', $(this).val());
        $(this).val('');
      });
      
      $('.'+classPrefix+'input-name, .'+classPrefix+'input-comment').on('blur.twitcomments', function () {
        originalValue = $(this).data('originalValue');
        if ($(this).val() == '') {
          $(this).val(originalValue);
        }
      });
      
      $('.'+classPrefix+'input-name').on('blur.twitcomments', function () {
        methods._updateUserInfo($(this).val());
      });
      
      if (defaults.pushURL) {
        $('.'+classPrefix+'form').on('submit.twitcomments', function (e) {
          methods._submit();
          e.preventDefault();
        });
      }
      
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
          $this.data('userExists', true);
          infoBlock.html(methods._getNewUserBlock(data)).fadeIn();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // TODO
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
    
    _submit: function() {
      if ($('.'+classPrefix+'form .'+classPrefix+'input-name').val() == '') {
        // TODO
        alert('User empty');
      } else if (!$this.data('userExists')) {
        // TODO
        alert('User no exist');
      } else {
        $.ajax({
          url: defaults.pushURL,
          method: 'POST',
          data: { foo: 'bar' },
          dataType: 'json',
          success: function(data) {
            infoBlock = methods._getNewUserBlock(data).hide();
            $('.'+classPrefix+'comments').prepend(infoBlock);
            infoBlock.fadeIn();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            // TODO
          }
        });
      }
    },
    
    _getNewUserBlock: function(data) {
      
      imageURL = (data.profile_image_url) ? data.profile_image_url : defaults.defaultProfileImage;
      fullName = (data.url) ? '<a href="'+data.url+'">'+data.name+'</a>' : data.name;
      twitterURL = (defaults.intents) ? 'https://twitter.com/intent/user?screen_name='+data.screen_name : 'http://twitter.com/'+data.screen_name;
      
      block = $('<div></div>');
      block.append($('<img src="'+imageURL+'" alt="" class="'+classPrefix+'user-image" />'));
      if (data.name) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-fullname">'+fullName+'</span>'));
      }
      block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-twittername"><a href="'+twitterURL+'">@'+data.screen_name+'</a></span>'));
      if (data.comment_timestamp) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'comment-time">'+methods._relativeDate(new Date(data.comment_timestamp), new Date())+'</span>'));
      }
      if (data.location) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'user-location">'+defaults.strings.from+' '+data.location+'</span>'));
      }
      if (data.comment_content) {
        block.append($('<span class="'+classPrefix+'span '+classPrefix+'comment-content">'+data.comment_content+'</span>'));
      }
      
      return block;
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