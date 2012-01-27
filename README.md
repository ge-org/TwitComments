# What it does

* Fetches comments from your server and displays them
* Pushes comments to your server
* Allows visitors to comment using their Twitter screen name

The plugin is based on the idea of [Joey Primiani](http://jprim.com/introducing-a-simpler-blog-commenting-system/)

# How-To

## Installation
For code examples have a look at the "example" directory.

To install TwitComments simply reference the jquery.twitcomments.min.js file from your HTML:
```html
<script src="jquery-1.7.min.js"></script>
<script src="jquery.twitcomments.min.js"></script>
```

Then add the following to the end of the ```<body>``` tag making sure to replace "server" with your actual server URL.
```html
<script>
 $(document).ready(function(){  			
  $('#comments').twitComments({
   pullURL: 'server',
   pushURL: 'server'
  });
 });
</script>
```

## Server Communication
The plugin needs to communicates with your server to obtain existing comments and to send new comments.
Therefore you need the set the ```pullURL``` and ```pushURL```. The first URL will be called to retrieve comments from your server and the second will be called to send a new comment to your server.

## Pulling Comments
Your server must understand the following GET request. "pullURL" will be replaced with the URL you provided.
```
GET /pullURL?params=[...] HTTP/1.1
```

The "params" query string will be populated with whatever you provide client side. For example you could set a pageID to identify the page the request is originating from.
```javascript
$(document).ready(function(){				
 $('#comments').twitComments({
  params: { pageID: xyz }
 });
});
```

The server must respond with HTTP status code 200 and the following JSON format:
```json
{
 "screen_name": SCREEN_NAME,
 "url": URL,
 "name": NAME,
 "location": LOCATION,
 "profile_image_url": PROFILE_IMAGE_URL,
 "comment_timestamp": TIMESTAMP,
 "comment_content": CONTENT
}
```

If any error occurs server side the server must respond with a HTTP status code other than 200 (404, 500, ...).

## Pushing Comments
Your server must understand the following POST request. "pushURL" will be replaced with the URL you provided.
```
POST /pushURL HTTP/1.1

user=SCREEN_NAME
comment=COMMENT
params=[...]
```

The server should call the Twitter API to retrieve the following information:
* screen name
* url
* name
* location
* profile image url

The server must then respond with HTTP status code 200 and the following JSON format:
```json
{
 "screen_name": SCREEN_NAME,
 "url": URL,
 "name": NAME,
 "location": LOCATION,
 "profile_image_url": PROFILE_IMAGE_URL,
 "comment_timestamp": TIMESTAMP,
 "comment_content": CONTENT
}
```

If any error occurs server side the server must respond with a HTTP status code other than 200 (404, 500, ...).

## Configuration
To configure the plugin you can set the following optional configuration options:

<table>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default value</th>
<th>Description</th>
</tr>

<tr>
<td>params</td>
<td>mixed</td>
<td>null</td>
<td>Will be sent to your server on every pull or push request.</td>
</tr>

<tr>
<td>defaultProfileImageURL</td>
<td>string</td>
<td>null</td>
<td>The image to use in case the user has no profile image.</td>
</tr>

<tr>
<td>cssClass</td>
<td>string</td>
<td>twitcomments</td>
<td>The name of the CSS class that prefixes the DOM elements created by the plugin.</td>
</tr>
</table>

## Translation
The following configuration settings can be used to translate the output of the plugin.
The "{}" in the strings concerning the time will be replaced by the according numbers. For example "{} hours ago" will become "3 hours ago".

<table>
<tr>
<th>Name</th>
<th>Default Value</th>
</tr>

<tr>
<td>comments</td>
<td>Comments</td>
</tr>

<tr>
<td>twitterUsername</td>
<td>Twitter Username</td>
</tr>

<tr>
<td><writeAComment</td>
<td>Write a comment...</td>
</tr>

<tr>
<td>submit</td>
<td>Comment...</td>
</tr>

<tr>
<td>sending</td>
<td>Sending...</td>
</tr>

<tr>
<td>errorNoName</td>
<td>Please enter your Twitter name</td>
</tr>

<tr>
<td>errorNoComment</td>
<td>Please enter a comment</td>
</tr>

<tr>
<td>errorCommentsNotLoaded</td>
<td>The comments could not be loaded</td>
</tr>

<tr>
<td>errorCommentNotSaved</td>
<td>Your comment could not be saved</td>
</tr>

<tr>
<td>from</td>
<td>from</td>
</tr>

<tr>
<td>justNow</td>
<td>just now</td>
</tr>

<tr>
<td>aMinuteAgo</td>
<td>a minute ago</td>
</tr>

<tr>
<td>minutesAgo</td>
<td>{} minutes ago</td>
</tr>

<tr>
<td>oneHourAgo</td>
<td>one hour ago</td>
</tr>

<tr>
<td>hoursAgo</td>
<td>{} hours ago</td>
</tr>

<tr>
<td>yesterday</td>
<td>yesterday</td>
</tr>

<tr>
<td>daysAgo</td>
<td>{} days ago</td>
</tr>

<tr>
<td>aWeekAgo</td>
<td>a week ago</td>
</tr>

<tr>
<td>weeksAgo</td>
<td>{} weeks ago</td>
</tr>

<tr>
<td>aMonthAgo</td>
<td>a month ago</td>
</tr>

<tr>
<td>monthsAgo</td>
<td>{} months ago</td>
</tr>

<tr>
<td>aYearAgo</td>
<td>a year ago</td>
</tr>

<tr>
<td>yearsAgo</td>
<td>{} years ago</td>
</tr>
</table>

# License
Copyright (c) 2011 Georg Dresler

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.