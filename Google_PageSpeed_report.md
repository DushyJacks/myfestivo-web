# Google PageSpeed Mobile Issues

Render-blocking requests Est savings of 1,970 ms

Requests are blocking the page's initial render, which may delay LCP. [Deferring or inlining](https://developer.chrome.com/docs/performance/insights/render-blocking?utm_source=lighthouse&utm_medium=lr) can move these network requests out of the critical path.LCPFCPUnscored

| **URL** | **Transfer size** | **Duration** |
| --- | --- | --- |
| myfestivo.live First party | **16.2 KiB** | **300 ms** |
| […chunks/0g0rbg7g3zbll.css](https://myfestivo.live/_next/static/chunks/0g0rbg7g3zbll.css)(myfestivo.live) | 16.2 KiB | 300 ms |
| Google Fonts cdn | **1.6 KiB** | **780 ms** |
| [/css2?family=…](https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap)(fonts.googleapis.com) | 1.6 KiB | 780 ms |

Reducing the download time of images can improve the perceived load time of the page and LCP. [Learn more about optimising image size](https://developer.chrome.com/docs/performance/insights/image-delivery?utm_source=lighthouse&utm_medium=lr)LCPFCPUnscored

|  | **URL** | **Resource size** | **Est savings** |
| --- | --- | --- | --- |
| myfestivo.live First party |  | **39.9 KiB** | **39.7 KiB** |
| MyFestivo<img src="/logo.png" alt="MyFestivo" class="h-10 w-auto" width="120" height="40"> | [/logo.png](https://myfestivo.live/logo.png)(myfestivo.live) | 39.9 KiB | 39.7 KiB |
|  | This image file is larger than it needs to be (1080x1080) for its displayed dimensions (70x70). Use responsive images to reduce the image download size. |  | 39.7 KiB |

Polyfills and transforms enable older browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile [Baseline](https://web.dev/articles/baseline-and-polyfills?utm_source=lighthouse&utm_medium=lr) features, unless you know that you must support older browsers. [Learn why most sites can deploy ES6+ code without transpiling](https://developer.chrome.com/docs/performance/insights/legacy-javascript?utm_source=lighthouse&utm_medium=lr)LCPFCPUnscored

| **URL** |  | **Wasted bytes** |
| --- | --- | --- |
| myfestivo.live First party |  | **12.9 KiB** |
| […chunks/16g.ca89g7fib.js](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) |  | 12.9 KiB |
| […chunks/16g.ca89g7fib.js:1:6431](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `Array.prototype.at` |  |
| […chunks/16g.ca89g7fib.js:1:5819](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `Array.prototype.flat` |  |
| […chunks/16g.ca89g7fib.js:1:5932](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `Array.prototype.flatMap` |  |
| […chunks/16g.ca89g7fib.js:1:6308](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `Object.fromEntries` |  |
| […chunks/16g.ca89g7fib.js:1:6566](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `Object.hasOwn` |  |
| […chunks/16g.ca89g7fib.js:1:5561](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `String.prototype.trimEnd` |  |
| […chunks/16g.ca89g7fib.js:1:5476](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | `String.prototype.trimStart` |  |

Each [sub-part has specific improvement strategies](https://developer.chrome.com/docs/performance/insights/lcp-breakdown?utm_source=lighthouse&utm_medium=lr). Ideally, most of the LCP time should be spent on loading the resources, not within delays.LCPUnscored

| **Sub-part** | **Duration** |
| --- | --- |
| Time to First Byte | 90 ms |
| Element render delay | 3,990 ms |

Your events. One place.

<h1 class="text-[52px] md:text-[80px] lg:text-[96px] font-extralight leading-[0.95] t…" style="opacity: 1; transform: none;">

[Avoid chaining critical requests](https://developer.chrome.com/docs/performance/insights/network-dependency-tree?utm_source=lighthouse&utm_medium=lr) by reducing the length of chains, reducing the download size of resources or deferring the download of unnecessary resources to improve page load.LCPUnscored

Maximum critical path latency: **4,969 ms**

*Initial Navigation*

[https://myfestivo.live](https://myfestivo.live/) **- 1,001 ms,** 6.72 KiB

[…chunks/0g0rbg7g3zbll.css](https://myfestivo.live/_next/static/chunks/0g0rbg7g3zbll.css)(myfestivo.live) **- 1,660 ms,** 16.22 KiB

[…auth/iframe.js](https://myfestivo.firebaseapp.com/__/auth/iframe.js)(myfestivo.firebaseapp.com) **- 4,969 ms,** 92.98 KiB

Preconnected origins

[preconnect](https://developer.chrome.com/docs/lighthouse/performance/uses-rel-preconnect/?utm_source=lighthouse&utm_medium=lr) hints help the browser establish a connection earlier in the page load, saving time when the first request for that origin is made. The following are the origins that the page preconnected to.

| **Origin** | **Source** |
| --- | --- |
| https://fonts.googleapis.com/ | head > link<link rel="preconnect" href="https://fonts.googleapis.com"> |
| https://fonts.gstatic.com/ | head > link<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"> |

Preconnect candidates

Add [preconnect](https://developer.chrome.com/docs/lighthouse/performance/uses-rel-preconnect/?utm_source=lighthouse&utm_medium=lr) hints to your most important origins, but try to use no more than 4.

| **Origin** | **Est LCP savings** |
| --- | --- |
| https://myfestivo.firebaseapp.com | 340 ms |
| https://apis.google.com | 300 ms |

A long cache lifetime can speed up repeat visits to your page. [Learn more about caching](https://developer.chrome.com/docs/performance/insights/cache?utm_source=lighthouse&utm_medium=lr).LCPFCPUnscored

| **Request** | **Cache TTL** | **Transfer size** |
| --- | --- | --- |
| firebaseapp.com |  | **93 KiB** |
| […auth/iframe.js](https://myfestivo.firebaseapp.com/__/auth/iframe.js)(myfestivo.firebaseapp.com) | 30m | 93 KiB |

Layout shifts occur when elements move absent any user interaction. [Investigate the causes of layout shifts](https://developer.chrome.com/docs/performance/insights/cls-culprit?utm_source=lighthouse&utm_medium=lr), such as elements being added, removed or their fonts changing as the page loads.CLSUnscored

| **Element** | **Layout shift score** |
| --- | --- |
| Total | 0.000 |
| Sign In Get Started<div class="flex items-center gap-3"> | 0.000 |
| […v24/pxiEyp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2)(fonts.gstatic.com) | Web font |
| […v24/pxiByp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2)(fonts.gstatic.com) | Web font |
| […v24/tDbv2o-fl….woff2](https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2)(fonts.gstatic.com) | Web font |
| […v24/pxiByp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDz8Z1xlFd2JQEk.woff2)(fonts.gstatic.com) | Web font |

Third-party code can significantly impact load performance. [Reduce and defer loading of third-party code](https://developer.chrome.com/docs/performance/insights/third-parties?utm_source=lighthouse&utm_medium=lr) to prioritise your page's content.Unscored

| **Third party** | **Transfer size** | **Main thread time** |
| --- | --- | --- |
| firebaseapp.com | **94 KiB** | **42 ms** |
| […auth/iframe.js](https://myfestivo.firebaseapp.com/__/auth/iframe.js)(myfestivo.firebaseapp.com) | 93 KiB | 41 ms |
| […auth/iframe?apiKey=…](https://myfestivo.firebaseapp.com/__/auth/iframe?apiKey=AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI&appName=%5BDEFAULT%5D&v=12.11.0&eid=p&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.lb.en.9vdPKhB0RUg.O%2Fd%3D1%2Frs%3DAHpOoo97anj7zZ432JcN58tqJJp_A6WeOw%2Fm%3D__features__)(myfestivo.firebaseapp.com) | 0 KiB | 0 ms |
| […auth/iframe?apiKey=…](https://myfestivo.firebaseapp.com/__/auth/iframe?apiKey=AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI&appName=%5BDEFAULT%5D&v=12.11.0&eid=p&usegapi=1&jsh=m%3B%2F_%2Fscs%2Fabc-static%2F_%2Fjs%2Fk%3Dgapi.lb.en.9vdPKhB0RUg.O%2Fd%3D1%2Frs%3DAHpOoo97anj7zZ432JcN58tqJJp_A6WeOw%2Fm%3D__features__#id=I0_1783403014855&_gfid=I0_1783403014855&parent=https%3A%2F%2Fmyfestivo.live&pfname=&rpctoken=11166404)(myfestivo.firebaseapp.com) | 1 KiB | 0 ms |
| Other Google APIs/SDKs utility | **42 KiB** | **27 ms** |
| […rs=AHpOoo97a…/cb=gapi.loaded_0?le=scs](https://apis.google.com/_/scs/abc-static/_/js/k=gapi.lb.en.9vdPKhB0RUg.O/m=gapi_iframes/rt=j/sv=1/d=1/ed=1/rs=AHpOoo97anj7zZ432JcN58tqJJp_A6WeOw/cb=gapi.loaded_0?le=scs)(apis.google.com) | 35 KiB | 22 ms |
| [/js/api.js?onload=__iframefcb997380](https://apis.google.com/js/api.js?onload=__iframefcb997380)(apis.google.com) | 7 KiB | 5 ms |
| […relyingparty/getProjectConfig?key=AIzaSyCFG…&cb=178…](https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyCFG1SNWfez77o-KoWOkYnn6D1D86d_BPI&cb=1783403016645)(www.googleapis.com) | 1 KiB | 0 ms |
| Google Fonts cdn | **58 KiB** | **0 ms** |
| […v24/tDbv2o-fl….woff2](https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwgknk-4.woff2)(fonts.gstatic.com) | 31 KiB | 0 ms |
| […v24/pxiEyp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2)(fonts.gstatic.com) | 9 KiB | 0 ms |
| […v24/pxiByp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLDz8Z1xlFd2JQEk.woff2)(fonts.gstatic.com) | 8 KiB | 0 ms |
| […v24/pxiByp8kv….woff2](https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2)(fonts.gstatic.com) | 8 KiB | 0 ms |
| [/css2?family=…](https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap)(fonts.googleapis.com) | 2 KiB | 0 ms |
| Firebase utility | **141 KiB** | **0 ms** |
| […Listen/channel?gsessionid=…](https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?gsessionid=LBGKIRNNXQa-U0J73Ibaj17pcgahI1rVnAfQjymtQZRyZnfI4JY9lw&VER=8&database=projects%2Fmyfestivo%2Fdatabases%2F(default)&RID=rpc&SID=-uEX54TO1hAbIMtsXaE6Kw&AID=0&CI=1&TYPE=xmlhttp&zx=bfmi6mfwpxwr&t=1)(firestore.googleapis.com) | 141 KiB | 0 ms |
| […Listen/channel?VER=…](https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel?VER=8&database=projects%2Fmyfestivo%2Fdatabases%2F(default)&RID=29580&CVER=22&X-HTTP-Session-Id=gsessionid&zx=ehwdfjnepcrf&t=1)(firestore.googleapis.com) | 1 KiB | 0 ms |

Reduce unused JavaScript Est savings of 333 KiB

Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. [Learn how to reduce unused JavaScript](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/?utm_source=lighthouse&utm_medium=lr).LCPFCPUnscored

| URL | Transfer size | Est savings |
| --- | --- | --- |
| myfestivo.live First party | **485.7 KiB** | **276.4 KiB** |
| […chunks/0jupgmkr-rm05.js](https://myfestivo.live/_next/static/chunks/0jupgmkr-rm05.js)(myfestivo.live) | 215.0 KiB | 112.4 KiB |
| […chunks/0c5urye5reolk.js](https://myfestivo.live/_next/static/chunks/0c5urye5reolk.js)(myfestivo.live) | 129.1 KiB | 83.5 KiB |
| […chunks/0tnz5pnm_ik_i.js](https://myfestivo.live/_next/static/chunks/0tnz5pnm_ik_i.js)(myfestivo.live) | 37.5 KiB | 37.4 KiB |
| […chunks/16g.ca89g7fib.js](https://myfestivo.live/_next/static/chunks/16g.ca89g7fib.js)(myfestivo.live) | 66.6 KiB | 21.5 KiB |
| […chunks/0f9gttzftyyca.js](https://myfestivo.live/_next/static/chunks/0f9gttzftyyca.js)(myfestivo.live) | 37.6 KiB | 21.5 KiB |
| firebaseapp.com | **92.4 KiB** | **56.7 KiB** |
| […auth/iframe.js](https://myfestivo.firebaseapp.com/__/auth/iframe.js)(myfestivo.firebaseapp.com) | 92.4 KiB | 56.7 KiB |

Minimise main-thread work 4.3 s

Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this. [Learn how to minimise main-thread work](https://developer.chrome.com/docs/lighthouse/performance/mainthread-work-breakdown/?utm_source=lighthouse&utm_medium=lr)TBTUnscored

| Category | Time Spent |
| --- | --- |
| Other | 3,028 ms |
| Script Evaluation | 905 ms |
| Script Parsing & Compilation | 207 ms |
| Style & Layout | 107 ms |
| Rendering | 68 ms |
| Parse HTML & CSS | 6 ms |
| Garbage Collection | 6 ms |

[https://pagespeed.web.dev/analysis/https-myfestivo-live/ohnt4r1edp?form_factor=mobile](https://pagespeed.web.dev/analysis/https-myfestivo-live/ohnt4r1edp?form_factor=mobile)