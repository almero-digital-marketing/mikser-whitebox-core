var L=Object.defineProperty,T=Object.defineProperties;var N=Object.getOwnPropertyDescriptors;var P=Object.getOwnPropertySymbols;var V=Object.prototype.hasOwnProperty,W=Object.prototype.propertyIsEnumerable;var j=(e,o,t)=>o in e?L(e,o,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[o]=t,w=(e,o)=>{for(var t in o||(o={}))V.call(o,t)&&j(e,t,o[t]);if(P)for(var t of P(o))W.call(o,t)&&j(e,t,o[t]);return e},D=(e,o)=>T(e,N(o));import{w as B,r as O,j as q,k as F,l as f,p as y,u as $,q as I,s as _,v as z,x as H,b as K,y as J,z as S,A as C,B as G,C as Q,D as X,E as Y,F as Z}from"./vendor-vue.9f73e638.js";import{d as b,c as ee}from"./vendor.d41e4f67.js";const te=function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}};te();const oe="modulepreload",E={},re="/",U=function(o,t){return!t||t.length===0?o():Promise.all(t.map(n=>{if(n=`${re}${n}`,n in E)return;E[n]=!0;const r=n.endsWith(".css"),i=r?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${i}`))return;const s=document.createElement("link");if(s.rel=r?"stylesheet":oe,r||(s.as="script",s.crossOrigin=""),s.href=n,document.head.appendChild(s),r)return new Promise((a,c)=>{s.addEventListener("load",a),s.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${n}`)))})})).then(()=>o())},p=b("whitebox-routes",{state:()=>({documentRoutes:{},reverseRoutes:{},projection:{},routes:[],currentRefId:decodeURI(window.location.pathname)}),getters:{collections(){const e={};for(let o in this.documentRoutes[this.currentRefId].collections){let t=this.documentRoutes[this.currentRefId].collections[o];t.documents?(e[o]=t.documents.map(n=>({loaded:!0,meta:n.data.meta,link:encodeURI(n.refId),content:n.data.content})),e[o].loaded=!0):(e[o]=[],e[o].loaded=!1),t.error&&(e[o].error=t.error)}return e},documentRoute(){return this.documentRoutes[this.currentRefId]}},actions:{async loadRoute(e){const o=R(),t=[],n=this.documentRoutes[e],r=o.sitemap[n.document.meta.lang][n.href];for(let i in n.collections){let s=await n.collections[i].query({meta:r.data.meta,link:encodeURI(r.refId)});s&&(Array.isArray(s)||(s=[s]),t.push(o.loadDocuments(s).then(a=>{n.collections[i].documents=a}).catch(a=>{throw n.collections[i].error=a,a})))}return Promise.all(t)},loadRoutes({documentRoutes:e,reverseRoutes:o,projection:t,routeDefinitions:n}){return Object.assign(this.documentRoutes,e),Object.assign(this.reverseRoutes,o),this.projection=Object.assign({},t,{"data.meta.layout":1,refId:1,"data.meta.href":1,"data.meta.route":1,"data.meta.lang":1,"data.meta.type":1}),new Promise((r,i)=>{if(!window.whitebox)return r([]);window.whitebox.init("feed",s=>{let a={vault:"feed",query:{context:"mikser"},projection:this.projection,cache:"1h"};s.service.catalogs.mikser?s.service.catalogs.mikser.find(a).then(c=>{var d;let u=[];for(let l of c){const h=n[l.data.meta.layout];this.reverseRoutes[l.data.meta.href]=this.reverseRoutes[l.data.meta.href]||[],this.reverseRoutes[l.data.meta.href].push({refId:l.refId,document:l.data,endpoint:"mikser"});let x={};if((d=h==null?void 0:h.meta)!=null&&d.collections)for(let m in h.meta.collections)x[m]={query:h.meta.collections[m]};if(this.documentRoutes[l.refId]={href:l.data.meta.href,document:l.data,endpoint:"mikser",collections:x},h&&(u.push({path:encodeURI(l.refId),component:h.component,meta:h.meta,alias:["/"+l.data.meta.lang+l.data.meta.href],props:this.documentRoutes[l.refId]}),l.data.meta.route)){let m=w({},h.meta);m.refId=l.refId,m.documents?Array.isArray(m.documents)?m.documents=[l.refId,...m.documents]:m.documents=[l.refId,m.documents]:m.documents=l.refId,u.push({path:encodeURI(l.refId)+l.data.meta.route,component:h.component,meta:m,props:this.documentRoutes[l.refId]})}}console.log("Routes:",u.length,Date.now()-window.startTime+"ms"),this.routes=u,r(u)}).catch(i):(console.warn("Mikser catalog is missing"),r([]))})})}}});let v="mikser",k,g={};const R=b("whitebox-documents",{state:()=>({sitemap:{}}),getters:{document(){const e=p();if(!e.documentRoute)return;let o=this.href(e.documentRoute.href,e.documentRoute.document.meta.lang);return o.documentRoute=e.documentRoute,o},alternates:e=>o=>{let t=[];for(let n of e.sitemap){let r=e.sitemap[n][o];r&&t.push(r)}return t},href:e=>(o,t,n)=>{const r=p();typeof t=="boolean"&&(n=t,t=void 0),t=t||r.documentRoute&&r.documentRoute.document.meta.lang||document.documentElement.lang||"";let i=e.sitemap[t];if(i){let s=i[o];if(s)return{loaded:!0,meta:s.data.meta,link:encodeURI(s.refId),content:s.data.content};{let a=r.reverseRoutes[o];if(a){let c=a.find(u=>u.document.meta.lang==t);if(c&&!n)return{link:encodeURI(c.refId),meta:{}}}}}if(!n)return{meta:{},link:encodeURI("/"+t+o)}},hrefs:e=>(o,t,n)=>{const r=p();typeof t=="boolean"&&(n=t,t=void 0),typeof o=="string"&&(o=new RegExp(o)),t=t||r.documentRoute&&r.documentRoute.document.meta.lang||document.documentElement.lang||"";let i=e.sitemap[t];if(i){const s=Object.keys(r.reverseRoutes).filter(a=>o.test(a)).map(a=>{let c=i[a];if(c)return{loaded:!0,meta:c.data.meta,link:encodeURI(c.refId)};{let d=r.reverseRoutes[a].find(l=>l.document.meta.lang==t);if(d)return{link:encodeURI(d.refId),meta:{}}}}).filter(a=>a);return n&&!s.find(a=>!a.loaded),s}return[]}},actions:{assignDocuments(e){this.$patch(o=>{for(let t of e){let n=t.data.meta.href||t.data.refId,r=t.data.meta.lang||"";o.sitemap[r]||(o.sitemap[r]={});const i=o.sitemap[r][n];(!i||i.stamp!=t.stamp)&&(o.sitemap[r][n]=Object.freeze(t))}}),console.log("Load time:",Date.now()-window.startTime+"ms")},updateDocuments(e){if(e.type=="ready")console.log("Initialization time:",Date.now()-window.startTime+"ms");else if(e.type=="initial"||e.type=="change"){let o=e.new;if(!o)return;let t=o.data.meta.href||o.data.refId,n=o.data.meta.lang||"";if(!this.sitemap[n])this.sitemap[n]={};else{let r=this.sitemap[n][t];if(r&&r.stamp>=o.stamp)return}this.sitemap[n][t]=Object.freeze(o)}},loadDocuments(e){e||(e=[]);const o=[],t=p();return new Promise(n=>{if(!window.whitebox)return n([]);window.whitebox.init("feed",r=>{let i=[],s=[];for(let a of e)if(typeof a=="string"){if(t.documentRoute)if(t.reverseRoutes[a]){let c=t.reverseRoutes[a].filter(u=>u.document.meta.lang==t.documentRoute.document.meta.lang&&(!this.sitemap[t.documentRoute.document.meta.lang]||!this.sitemap[t.documentRoute.document.meta.lang][a])).map(u=>u.refId).filter(u=>g[u]==null);s.push(...c),c.forEach(u=>g[u]=Date.now())}else{let c=decodeURI(a);if(g[c]==null){let u=t.documentRoutes[c];u&&!this.href(u.href,u.document.meta.lang,!0)&&(s.push(c),g[c]=Date.now())}}}else{const c=JSON.stringify(a);if(g[c]==null){g[c]=[];let u={};a.query?u=a:u.query=a,u.context=k,u.query.context=v,u.vault="feed",i.push(r.service.catalogs.mikser.find(u).then(d=>{g[c].push(...d),o.push(...g[c]),this.assignDocuments(d)}))}else o.push(...g[c])}if(s.length){let a={vault:"feed",cache:"1h",context:k,query:{context:v,refId:{$in:s}}};i.push(r.service.catalogs.mikser.find(a).then(c=>{o.push(...c),this.assignDocuments(c)}))}return Promise.all(i).then(()=>n(o))})})},liveReload(e){!window.whitebox||window.whitebox.init("feed",o=>{window.whitebox.emmiter.on("feed.change",r=>{r.type!="ready"&&console.log("Feed change",r),this.updateDocuments(r)});let t,n="mikser";o.service.catalogs.mikser.changes({vault:"feed",context:t,query:{context:n},initial:e})})}}});function ne(e){return e.meta=e.feed[Object.keys(e.feed)[0]].meta,delete e.feed,e}const M=b("whitebox-searches",{state:()=>({searchMap:{}}),getters:{hits:e=>o=>e.searchMap[o]},actions:{match(e,o,t){return this.search(e,[{match:o}],t)},multiMatch(e,o,t){return this.search(e,[{multi_match:o}],t)},combinedFields(e,o,t){return this.search(e,[{combined_fields:o}],t)},queryString(e,o,t){return this.search(e,[{query_string:o}],t)},search(e,o,t={}){return new Promise(n=>{if(this.searchMap[e]=[],this.searchMap[e].loaded=!1,!window.whitebox)return n([]);window.whitebox.init("feed",r=>{let i=w({context:k,vault:"feed",query:{bool:{must:[{term:{"context.keyword":v}},...o]}}},t);r.service.catalogs.mikser.search(i).then(s=>{this.searchMap[e]=s.map(ne),this.searchMap[e].loaded=!0,n(s)}).catch(s=>{this.searchMap[e].error=s})})})}}});function A(e,o){return"feed.mikser-"+e.toLowerCase()+".meta."+o}function se(e){p().$subscribe(({events:t})=>{(t==null?void 0:t.key)=="currentRefId"&&e(t.newValue,t.oldValue)})}function ae(e,o){const t=R(),n=p();B(t.document.documentRoute.collections[e],()=>o(n.collections[e]))}const ie=f("h1",null,"WhiteBox Core",-1),ce=S("Home"),ue=S("Projects"),de={class:"debug"},le=f("h2",null,"Search",-1),me=["onKeyup"],fe=S(),he=f("br",null,null,-1),pe=f("br",null,null,-1),ge={class:"debug"},Re={__name:"App",setup(e){let o=O(0),t=O("");function n(){o++}R().loadDocuments(["/web/translation"]),se((s,a)=>console.log("Document changed:",a,"\u2192",s)),ae("items",console.log);function i(){M().multiMatch("projects",{query:t,fields:[A("Project","title"),A("Project","overview")],type:"phrase_prefix"})}return(s,a)=>{const c=C("router-link"),u=C("router-view");return q(),F("div",null,[ie,f("button",{onClick:n},y($(o)),1),f("nav",null,[I(c,{to:"/"},{default:_(()=>[ce]),_:1})]),f("nav",null,[I(c,{to:s.$href("/web/projects").link},{default:_(()=>[ue]),_:1},8,["to"])]),I(u,null,{default:_(({Component:d})=>[(q(),G(Q(d)))]),_:1}),f("div",de,y(s.$href("/web/translation"))+" "+y(s.$storage("/storage/animations/client-graphs.json")),1),le,z(f("input",{type:"text","onUpdate:modelValue":a[0]||(a[0]=d=>K(t)?t.value=d:t=d),onKeyup:J(i,["enter"])},null,40,me),[[H,$(t)]]),fe,f("button",{onClick:i},"Search"),he,pe,f("div",ge,y(s.$hits("projects")),1)])}}},we=b("whitebox-files",{state:()=>({filemap:{}}),actions:{storage(e){return e&&(e.indexOf("/storage")!=0&&e.indexOf("storage")!=0&&(e[0]=="/"?e="/storage"+e:e="/storage/"+e),this.filemap[e]||this.link(e),this.filemap[e]||"")},link(e){window.whitebox.init("storage",o=>{if(o){let t={file:e};t.cache=!0;let n=o.service.link(t);typeof n=="string"?this.filemap[e]!=n&&(this.filemap[e]=n):n.then(r=>{this.filemap[e]!=r&&(this.filemap[e]=r)})}})}}});var ye={install:e=>{const o=e.config.globalProperties.$router;o.beforeEach((t,n,r)=>{const i=p(),s=R();let a=[];const c=decodeURI(t.path);let u=i.documentRoutes[c];u&&a.push(t.path);for(let d of t.matched)d.meta.documents&&(Array.isArray(d.meta.documents)?a.push(...d.meta.documents):a.push(d.meta.documents)),d.meta.refId&&(u=i.documentRoutes[d.meta.refId],a.unshift(d.meta.refId));s.loadDocuments(a).then(()=>{r()}).catch(d=>r(d))}),o.afterEach(t=>{const n=p();n.currentRefId=o.currentRoute.value.refId||decodeURI(o.currentRoute.value.path),n.loadRoute(o.currentRoute.value.refId||decodeURI(o.currentRoute.value.path)).catch(console.error),window.whitebox&&window.whitebox.init("analytics",r=>{r&&setTimeout(()=>{console.log("Track route:",decodeURI(t.path)),r.service.info()},100)})})}};async function be({router:e,store:o,options:t}){const n=p(o);let r={};for(let s of e.options.routes)r[s.name]=s;let i=await n.loadRoutes(D(w({},t),{routeDefinitions:r}));for(let s of i.filter(a=>a.component))e.addRoute(s);return{install(s){s.use(ye),Object.defineProperty(s.config.globalProperties,"$href",{get(){return R().href}}),Object.defineProperty(s.config.globalProperties,"$document",{get(){return R().document}}),Object.defineProperty(s.config.globalProperties,"$alternates",{get(){return R().alternates}}),Object.defineProperty(s.config.globalProperties,"$storage",{get(){return we().storage}}),Object.defineProperty(s.config.globalProperties,"$collections",{get(){return p().collections}}),Object.defineProperty(s.config.globalProperties,"$hits",{get(){return M().hits}}),R().liveReload(!!t.preloadDocuments)}}}async function Ie(){const e=X(Re),o=ee(),t=Y({history:Z(),routes:[{path:"/",name:"Home",component:()=>U(()=>import("./Home.2d6a75ce.js"),["assets/Home.2d6a75ce.js","assets/plugin-vue_export-helper.21dcd24c.js","assets/vendor-vue.9f73e638.js"]),meta:{collections:{items:r=>({query:{"data.meta.layout":"Home","data.meta.lang":r.meta.lang}})}}},{path:"/projects",name:"Projects",component:()=>U(()=>import("./Projects.907c1dcc.js"),["assets/Projects.907c1dcc.js","assets/plugin-vue_export-helper.21dcd24c.js","assets/vendor-vue.9f73e638.js"]),meta:{collections:{items:r=>({"data.meta.layout":"Project","data.meta.lang":r.meta.lang})}}}]}),n=await be({router:t,store:o,options:{domain:"almero.com"}});e.use(o),e.use(t),e.use(n),e.mount("#app")}Ie();
