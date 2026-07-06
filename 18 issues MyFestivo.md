# 18 issues MyFestivo

```jsx
Issues	Description and URL	Guideline	Line
 5	https://myfestivo.live/		
Critical	Offer an HTML site map to your users with links that point to the important parts of your site. Links embedded in menus, list boxes, and similar elements are not accessible to web crawlers unless they appear in your site map. If the site map is larger than 100 or so links, you may want to break the site map into separate pages.	Google Bing DuckDuckGo	
1	
Very Important	Ensure that text and background colors have enough contrast.	WCAG AA 1.4.3 508 AA 1.4.3	
The text color to background color contrast ratio after composition is:		
4.09 with color:  rgb(0,128,0)background:  rgb(0,0,0)
font-size: 9ptfont-weight: 400
<p class='text-xs text-white/...'>The event ... in Chennai, India.</p>
86	
4.09 with color:  rgb(0,128,0)background:  rgb(0,0,0)
font-size: 9ptfont-weight: 400
<a href='mailto:myfestivo@gmail.com' class='mt-3 flex items-...'>...</a>
86	
4.09 with color:  rgb(0,128,0)background:  rgb(0,0,0)
font-size: 8.25ptfont-weight: 400
<p class='text-white/50 mb-4'>Platform</p>
86	
4.09 with color:  rgb(0,128,0)background:  rgb(0,0,0)
font-size: 8.25ptfont-weight: 400
<a class='block text-white/60 ...' href='/events'>Events</a>
86	
4.09 with color:  rgb(0,128,0)background:  rgb(0,0,0)
font-size: 8.25ptfont-weight: 400
<a class='block text-white/60 ...' href='/signup'>Sign Up</a>
86	
Very Important	Do not use the meta viewport tag to disable zoom.	WCAG AA 1.4.4 508 AA 1.4.4	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
Important	Search engines may penalize invisible text where text color is nearly identical to the background color.	Google Bing DuckDuckGo	
The colors used are:		
color:  rgb(0,128,0)background:  rgb(0,128,0)
<a class='hover:text-white ...' href='/events'>Events</a>
86	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<a class='inline-flex items-...' href='/login'>Sign In</a>
86	
color:  rgb(0,0,0)background:  rgb(0,0,0)
opacity: 0.0;
<h2 class='text-4xl md:text-5xl' style='opacity:0;transform:...'>...r<br>next event?</h2>
86	
color:  rgb(0,0,0)background:  rgb(0,0,0)
opacity: 0.0;
<p class='text-base text-...' style='opacity:0;transform:...'>....</p>
86	
Warning	Consider avoiding viewport values that prevent users from resizing documents.	HTML	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
 3	https://myfestivo.live/_next/static/chunks/13~utgzqkvnoi.css		
Critical	CSS Validation Error.	CSS	
1139 1139 1139 1139 1139 ...	
--tw-enter-translate-y: calc(	1139	
)	1139	
)	1139	
Very Important	The CSS backdrop-filter: property is not supported by some browsers.	iOS &#8804; 17	
.backdrop-filter { backdrop-filter: ; }
880	
.backdrop-blur-[20px] { backdrop-filter: ; }
876	
.backdrop-blur-md { backdrop-filter: ; }
877	
.backdrop-blur-sm { backdrop-filter: ; }
878	
.backdrop-blur-xl { backdrop-filter: ; }
879	
Important	Property doesn't exist in CSS.	CSS	
margin-trim	1	
 3	https://myfestivo.live/events		
Very Important	Ensure that text and background colors have enough contrast.	WCAG AA 1.4.3 508 AA 1.4.3	
The text color to background color contrast ratio after composition is:		
1.90 with color:  rgb(179,136,255)background: rgba(179,136,255,12.2%)
font-size: 10.50ptfont-weight: 500
<span class='hidden lg:inline ...'>Browse Events</span>
116	
1.09 with color:  rgb(107,100,128)background:  rgb(0,128,0)
font-size: 10.50ptfont-weight: 400
<span class='hidden lg:inline ...'>Sign In</span>
129	
Very Important	Do not use the meta viewport tag to disable zoom.	WCAG AA 1.4.4 508 AA 1.4.4	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
Warning	Consider avoiding viewport values that prevent users from resizing documents.	HTML	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
 3	https://myfestivo.live/login		
Very Important	Do not use the meta viewport tag to disable zoom.	WCAG AA 1.4.4 508 AA 1.4.4	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
Important	Search engines may penalize invisible text where text color is nearly identical to the background color.	Google Bing DuckDuckGo	
The colors used are:		
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='email' class='text-[11px] font-...'>Email Address</label>
112	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='password' class='text-[11px] font-...'>Password</label>
117	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<span class='text-[10px] font-...'>or</span>
139	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<div class='mt-6 pt-6 border-t ...'>No account?...</div>
162	
Warning	Consider avoiding viewport values that prevent users from resizing documents.	HTML	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
 4	https://myfestivo.live/signup		
Very Important	Do not use the meta viewport tag to disable zoom.	WCAG AA 1.4.4 508 AA 1.4.4	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
Important	Search engines may penalize invisible text where text color is nearly identical to the background color.	Google Bing DuckDuckGo	
The colors used are:		
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='fullname' class='text-[11px] font-...'>Full Name</label>
112	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='signup-email' class='text-[11px] font-...'>Email Address</label>
117	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<p id='email-hint' class='text-xs text-white/...'>You can ... events.</p>
120	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='signup-password' class='text-[11px] font-...'>Password</label>
125	
color:  rgb(0,128,0)background:  rgb(0,128,0)
<label for='signup-confirm-...' class='text-[11px] font-...'>...d</label>
130	
Important	Use at least a 12-point font on all web pages.	Best practice	
font-size: 10.50pt
<p class='text-white/40 text-...'>Sign up with any ...-college events.</p>
106	
font-size: 9pt
<p id='email-hint' class='text-xs text-white/...'>You can ... events.</p>
120	
Warning	Consider avoiding viewport values that prevent users from resizing documents.	HTML	
<meta name='viewport' content='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=no, viewport-fit=cover'>
5	
Expand All	18 issues on 5 pages	

```