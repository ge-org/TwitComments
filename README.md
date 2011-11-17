What it does
============

* Fetches comments from your server and displays them
* Pushes comments to your server
* Allows visitors to comment using their Twitter screen name


Installation
============

Add jQuery and TwitComments to your HTML

```html
<script src="jquery-1.7.min.js"></script>
<script src="jquery.twitcomments.min.js"></script>
```

Activate TwitComments

```html
<script>
 $(document).ready(function(){				
  $('#comments').twitComments({
   pullURL: 'comments.php',
   pushURL: 'comments.php'
  });
 });
</script>
```

Backend
=======

Your server will receive a request in the JSON format when a new comment is submitted.
The JSON will look like this:

```json
{
  "screen_name": "twitterapi",
  "url": "http://dev.twitter.com",
  "name": "Twitter API",
  "location": "San Francisco, CA",
  "profile_image_url": "https://si0.twimg.com/profile_images/1438634086/avatar_normal.png",
}
```

The browser expects a JSON response with the following content:

```json
{
  "screen_name": "twitterapi",
  "url": "http://dev.twitter.com",
  "name": "Twitter API",
  "location": "San Francisco, CA",
  "profile_image_url": "https://si0.twimg.com/profile_images/1438634086/avatar_normal.png",
  "comment_timestamp": "2011-11-15 17:34:00",
  "comment_content": "Hello, World!"
}
```
The same JSON is expected when you answer the request to fetch all comments.

Configuration
=============

<table>
  <tr>
    <th>Option</th>
    <th>Type</th>
    <th>Default Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>pushURL</td>
    <td>string</td>
    <td>null</td>
    <td>Where to send a new comment</td>
  </tr>
  <tr>
    <td>pullURL</td>
    <td>string</td>
    <td>null</td>
    <td>Where to get the comments from</td>
  </tr>
  <tr>
    <td>params</td>
    <td>mixed</td>
    <td>null</td>
    <td>Additional params your server will receive on every request. Put your page ID here.</td>
  </tr>
  <tr>
    <td>defaultProfileImageURL</td>
    <td>string</td>
    <td>#</td>
    <td>If the user has no profile image use this one</td>
  </tr>
  <tr>
    <td>cssClass</td>
    <td>string</td>
    <td>twitcomments</td>
    <td>CSS class to prefix all of TwitComments' DOM elements</td>
  </tr>
</table>

I18N
====

Use the following options to provide translated strings

* twitterUsername
* writeAComment
* submit
* sending
* errorNoName
* errorNoComment
* errorCommentsNotLoaded
* errorCommentNotSaved
* from
* justNow
* aMinuteAgo
* minutesAgo
* oneHourAgo
* hoursAgo
* yesterday
* daysAgo
* aWeekAgo
* weeksAgo
* aMonthAgo
* monthsAgo
* aYearAgo
* yearsAgo