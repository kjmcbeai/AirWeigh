/*!
 * VERSION: 0.9.2
 * DATE: 2014-02-10
 * JavaScript
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
 * ThrowPropsPlugin is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://www.greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
(window._gsQueue||(window._gsQueue=[])).push(function(){"use strict";window._gsDefine("plugins.ThrowPropsPlugin",["plugins.TweenPlugin","TweenLite","easing.Ease","utils.VelocityTracker"],function(t,e,i,r){var s,n,a,o,l=function(){t.call(this,"throwProps"),this._overwriteProps.length=0},h=999999999999999,u=1e-10,p={x:1,y:1,z:2,scale:1,scaleX:1,scaleY:1,rotation:1,rotationZ:1,rotationX:2,rotationY:2,skewX:1,skewY:1},_=function(t,e,i,r){for(var s,n,a=e.length,o=0,l=h;--a>-1;)s=e[a],n=s-t,0>n&&(n=-n),l>n&&s>=r&&i>=s&&(o=a,l=n);return e[o]},f=function(t,e,i,r){if("auto"===t.end)return t;i=isNaN(i)?h:i,r=isNaN(r)?-h:r;var s="function"==typeof t.end?t.end(e):t.end instanceof Array?_(e,t.end,i,r):Number(t.end);return s>i?s=i:r>s&&(s=r),{max:s,min:s}},c=l.calculateChange=function(t,r,s,n){null==n&&(n=.05);var a=r instanceof i?r:r?new i(r):e.defaultEase;return s*n*t/a.getRatio(n)},d=l.calculateDuration=function(t,r,s,n,a){a=a||.05;var o=n instanceof i?n:n?new i(n):e.defaultEase;return Math.abs((r-t)*o.getRatio(a)/s/a)},m=l.calculateTweenDuration=function(t,s,n,a,o){if("string"==typeof t&&(t=e.selector(t)),!t)return 0;null==n&&(n=10),null==a&&(a=.2),null==o&&(o=1),t.length&&(t=t[0]||t);var h,p,_,m,g,v,y,w,x,T,b=0,P=9999999999,k=s.throwProps||s,S=s.ease instanceof i?s.ease:s.ease?new i(s.ease):e.defaultEase,C=isNaN(k.checkpoint)?.05:Number(k.checkpoint),R=isNaN(k.resistance)?l.defaultResistance:Number(k.resistance);for(h in k)"resistance"!==h&&"checkpoint"!==h&&"preventOvershoot"!==h&&(p=k[h],"object"!=typeof p&&(x=x||r.getByTarget(t),x&&x.isTrackingProp(h)?p="number"==typeof p?{velocity:p}:{velocity:x.getVelocity(h)}:(m=Number(p)||0,_=m*R>0?m/R:m/-R)),"object"==typeof p&&(void 0!==p.velocity&&"number"==typeof p.velocity?m=Number(p.velocity)||0:(x=x||r.getByTarget(t),m=x&&x.isTrackingProp(h)?x.getVelocity(h):0),g=isNaN(p.resistance)?R:Number(p.resistance),_=m*g>0?m/g:m/-g,v="function"==typeof t[h]?t[h.indexOf("set")||"function"!=typeof t["get"+h.substr(3)]?h:"get"+h.substr(3)]():t[h]||0,y=v+c(m,S,_,C),void 0!==p.end&&(p=f(p,y,p.max,p.min)),void 0!==p.max&&y>Number(p.max)+u?(T=p.unitFactor||1,w=v>p.max&&p.min!==p.max||m*T>-15&&45>m*T?a+.1*(n-a):d(v,p.max,m,S,C),P>w+o&&(P=w+o)):void 0!==p.min&&Number(p.min)-u>y&&(T=p.unitFactor||1,w=p.min>v&&p.min!==p.max||m*T>-45&&15>m*T?a+.1*(n-a):d(v,p.min,m,S,C),P>w+o&&(P=w+o)),w>b&&(b=w)),_>b&&(b=_));return b>P&&(b=P),b>n?n:a>b?a:b},g=l.prototype=new t("throwProps");return g.constructor=l,l.version="0.9.2",l.source="gannon.codecanyon",l.API=2,l._autoCSS=!0,l.defaultResistance=100,l.track=function(t,e,i){return r.track(t,e,i)},l.untrack=function(t,e){r.untrack(t,e)},l.isTracking=function(t,e){return r.isTracking(t,e)},l.getVelocity=function(t,e){var i=r.getByTarget(t);return i?i.getVelocity(e):0/0},l._cssRegister=function(){var t=(window.GreenSockGlobals||window).com.greensock.plugins.CSSPlugin;if(t){var e=t._internals,i=e._parseToProxy,a=e._setPluginRatio,o=e.CSSPropTween;e._registerComplexSpecialProp("throwProps",{parser:function(t,e,h,u,_,f){f=new l;var c,d,m,g,v,y={},w={},x={},T={},b={},P={};n={};for(m in e)"resistance"!==m&&"preventOvershoot"!==m&&(d=e[m],"object"==typeof d?(void 0!==d.velocity&&"number"==typeof d.velocity?y[m]=Number(d.velocity)||0:(v=v||r.getByTarget(t),y[m]=v&&v.isTrackingProp(m)?v.getVelocity(m):0),void 0!==d.end&&(T[m]=d.end),void 0!==d.min&&(w[m]=d.min),void 0!==d.max&&(x[m]=d.max),d.preventOvershoot&&(P[m]=!0),void 0!==d.resistance&&(c=!0,b[m]=d.resistance)):"number"==typeof d?y[m]=d:(v=v||r.getByTarget(t),y[m]=v&&v.isTrackingProp(m)?v.getVelocity(m):d||0),p[m]&&u._enableTransforms(2===p[m]));g=i(t,y,u,_,f),s=g.proxy,y=g.end;for(m in s)n[m]={velocity:y[m],min:w[m],max:x[m],end:T[m],resistance:b[m],preventOvershoot:P[m]};return null!=e.resistance&&(n.resistance=e.resistance),e.preventOvershoot&&(n.preventOvershoot=!0),_=new o(t,"throwProps",0,0,g.pt,2),_.plugin=f,_.setRatio=a,_.data=g,f._onInitTween(s,n,u._tween),_}})}},l.to=function(t,i,r,l,h){i.throwProps||(i={throwProps:i}),0===h&&(i.throwProps.preventOvershoot=!0);var u=new e(t,1,i);return u.render(0,!0,!0),u.vars.css?(u.duration(m(s,{throwProps:n,ease:i.ease},r,l,h)),u._delay&&!u.vars.immediateRender?u.invalidate():a._onInitTween(s,o,u),u):(u.kill(),new e(t,m(t,i,r,l,h),i))},g._onInitTween=function(t,e,i){this.target=t,this._props=[],a=this,o=e;var s,n,l,h,u,p,_,d,m,g=i._ease,v=isNaN(e.checkpoint)?.05:Number(e.checkpoint),y=i._duration,w=e.preventOvershoot,x=0;for(s in e)if("resistance"!==s&&"checkpoint"!==s&&"preventOvershoot"!==s){if(n=e[s],"number"==typeof n)u=Number(n)||0;else if("object"!=typeof n||isNaN(n.velocity)){if(m=m||r.getByTarget(t),!m||!m.isTrackingProp(s))throw"ERROR: No velocity was defined in the throwProps tween of "+t+" property: "+s;u=m.getVelocity(s)}else u=Number(n.velocity);p=c(u,g,y,v),d=0,h="function"==typeof t[s],l=h?t[s.indexOf("set")||"function"!=typeof t["get"+s.substr(3)]?s:"get"+s.substr(3)]():t[s],"object"==typeof n&&(_=l+p,void 0!==n.end&&(n=f(n,_,n.max,n.min)),void 0!==n.max&&_>Number(n.max)?w||n.preventOvershoot?p=n.max-l:d=n.max-l-p:void 0!==n.min&&Number(n.min)>_&&(w||n.preventOvershoot?p=n.min-l:d=n.min-l-p)),this._props[x++]={p:s,s:l,c1:p,c2:d,f:h,r:!1},this._overwriteProps[x]=s}return!0},g._kill=function(e){for(var i=this._props.length;--i>-1;)null!=e[this._props[i].p]&&this._props.splice(i,1);return t.prototype._kill.call(this,e)},g._roundProps=function(t,e){for(var i=this._props,r=i.length;--r>-1;)(t[i[r]]||t.throwProps)&&(i[r].r=e)},g.setRatio=function(t){for(var e,i,r=this._props.length;--r>-1;)e=this._props[r],i=e.s+e.c1*t+e.c2*t*t,e.r&&(i=0|i+(i>0?.5:-.5)),e.f?this.target[e.p](i):this.target[e.p]=i},t.activate([l]),l},!0),window._gsDefine("utils.VelocityTracker",["TweenLite"],function(t){var e,i,r,s,n=/([A-Z])/g,a={},o={x:1,y:1,z:2,scale:1,scaleX:1,scaleY:1,rotation:1,rotationZ:1,rotationX:2,rotationY:2,skewX:1,skewY:1},l=document.defaultView?document.defaultView.getComputedStyle:function(){},h=function(t,e,i){var r=(t._gsTransform||a)[e];return r||0===r?r:(t.style[e]?r=t.style[e]:(i=i||l(t,null))?(t=i.getPropertyValue(e.replace(n,"-$1").toLowerCase()),r=t||i.length?t:i[e]):t.currentStyle&&(i=t.currentStyle,r=i[e]),parseFloat(r)||0)},u=t.ticker,p=function(t,e,i){this.p=t,this.f=e,this.v1=this.v2=0,this.t1=this.t2=u.time,this.css=!1,this.type="",this._prev=null,i&&(this._next=i,i._prev=this)},_=function(){var t,i,n=e,a=u.time;if(a-r>=.03)for(s=r,r=a;n;){for(i=n._firstVP;i;)t=i.css?h(n.target,i.p):i.f?n.target[i.p]():n.target[i.p],(t!==i.v1||a-i.t1>.15)&&(i.v2=i.v1,i.v1=t,i.t2=i.t1,i.t1=a),i=i._next;n=n._next}},f=function(t){this._lookup={},this.target=t,this.elem=t.style&&t.nodeType?!0:!1,i||(u.addEventListener("tick",_,null,!1,-100),r=s=u.time,i=!0),e&&(this._next=e,e._prev=this),e=this},c=f.getByTarget=function(t){for(var i=e;i;){if(i.target===t)return i;i=i._next}},d=f.prototype;return d.addProp=function(e,i){if(!this._lookup[e]){var r=this.target,s="function"==typeof r[e],n=s?this._altProp(e):e,a=this._firstVP;this._firstVP=this._lookup[e]=this._lookup[n]=a=new p(n!==e&&0===e.indexOf("set")?n:e,s,a),a.css=this.elem&&(void 0!==this.target.style[a.p]||o[a.p]),a.css&&o[a.p]&&!r._gsTransform&&t.set(r,{x:"+=0"}),a.type=i||a.css&&0===e.indexOf("rotation")?"deg":"",a.v1=a.v2=a.css?h(r,a.p):s?r[a.p]():r[a.p]}},d.removeProp=function(t){var e=this._lookup[t];e&&(e._prev?e._prev._next=e._next:e===this._firstVP&&(this._firstVP=e._next),e._next&&(e._next._prev=e._prev),this._lookup[t]=0,e.f&&(this._lookup[this._altProp(t)]=0))},d.isTrackingProp=function(t){return this._lookup[t]instanceof p},d.getVelocity=function(t){var e,i,r,s=this._lookup[t],n=this.target;if(!s)throw"The velocity of "+t+" is not being tracked.";return e=s.css?h(n,s.p):s.f?n[s.p]():n[s.p],i=e-s.v2,("rad"===s.type||"deg"===s.type)&&(r="rad"===s.type?2*Math.PI:360,i%=r,i!==i%(r/2)&&(i=0>i?i+r:i-r)),i/(u.time-s.t2)},d._altProp=function(t){var e=t.substr(0,3),i=("get"===e?"set":"set"===e?"get":e)+t.substr(3);return"function"==typeof this.target[i]?i:t},f.getByTarget=function(i){var r=e;for("string"==typeof i&&(i=t.selector(i)),i.length&&i!==window&&i[0]&&i[0].style&&!i.nodeType&&(i=i[0]);r;){if(r.target===i)return r;r=r._next}},f.track=function(t,e,i){var r=c(t),s=e.split(","),n=s.length;for(i=(i||"").split(","),r||(r=new f(t));--n>-1;)r.addProp(s[n],i[n]||i[0]);return r},f.untrack=function(t,i){var r=c(t),s=(i||"").split(","),n=s.length;if(r){for(;--n>-1;)r.removeProp(s[n]);r._firstVP&&i||(r._prev?r._prev._next=r._next:r===e&&(e=r._next),r._next&&(r._next._prev=r._prev))}},f.isTracking=function(t,e){var i=c(t);return i?!e&&i._firstVP?!0:i.isTrackingProp(e):!1},f},!0)}),window._gsDefine&&window._gsQueue.pop()();