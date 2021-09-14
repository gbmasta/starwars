(()=>{"use strict";(new class{constructor(){this.pilots=Array(),this.currentPilots=Array(),this.mainTable=document.querySelector("#mainTable"),this.filterField=document.querySelector("form input"),this.sortField=document.querySelector("form select")}handleError(t){return t.ok?t:(this.mainTable.replaceChildren(t),Promise.reject(t))}uniqueFilterFunction(t,e,i){return i.indexOf(t)===e}getSiblings(t){return Array.prototype.filter.call(t.parentNode.children,(function(e){return e!==t}))}attachEvents(){this.filterField.addEventListener("input",(t=>{this.filterPilots()})),this.sortField.addEventListener("change",(t=>{this.filterPilots()})),window.addEventListener("hashchange",(t=>{this.loadPage()}))}loadPage(){const t=location.hash.split("/"),e=document.querySelector(t[0]);e.classList.replace("d-none","d-block"),e.dataset.callback&&this[e.dataset.callback](),this.getSiblings(e).forEach((t=>{t.classList.add("d-none"),t.classList.remove("d-block")}))}filterPilots(){const t=this.filterField.value;console.log(t),t.length>0?this.currentPilots=this.pilots.filter((e=>-1!==e.name.toLowerCase().indexOf(t.toLowerCase()))):this.currentPilots=this.pilots;const e=this.sortField.value;console.log(e),0!=e&&this.currentPilots.sort(((t,i)=>{if(e.includes(".")){let s=e.split(".");t=(t=t[s[0]])[s[1]],i=(i=i[s[0]])[s[1]]}else t=t[e],i=i[e];return t.toLowerCase()<i.toLowerCase()?-1:t.toLowerCase()>i.toLowerCase()?1:0})),this.updateTable()}getId(t){const e=t.split("/");return parseInt(e[e.length-2],10)}async fetchIds(t,e,i=(t=>!0)){const s=[];return e.forEach((e=>s.push(fetch(`${t}${e}/`).then(this.handleError).then((t=>t.json()))))),(await Promise.all(s)).filter(i).reduce(((t,e)=>(t[this.getId(e.url)]=e,t)),{})}fetchAll(t){return new Promise(((e,i)=>{let s=[];const l=t=>{fetch(t).then(this.handleError).then((t=>t.json().then((t=>{s=t.results?[...s,...t.results]:s,t.next?l(t.next):e(s)})))).catch((t=>{this.handleError(t)}))};l(t)}))}async initApp(){location.hash||(location.hash="#home"),this.loadPage(),this.attachEvents(),this.pilots=await this.fetchAll("https://swapi.dev/api/people/");const t=Object.values(this.pilots).map((t=>this.getId(t.homeworld))).filter(this.uniqueFilterFunction);let e=await this.fetchIds("https://swapi.dev/api/planets/",t);this.pilots.forEach((t=>{t.id=this.getId(t.url),t.planet=e[this.getId(t.homeworld)]})),this.currentPilots=this.pilots,this.updateTable(),this.updatePeople(),this.filterField.disabled=!1,this.sortField.disabled=!1}updateTable(){const t=Object.values(this.currentPilots).map((t=>{var e=document.createElement("tr");return e.innerHTML='<td><a href="#people/'+t.id+'/">'+t.name+"</a></td><td>"+t.birth_year+"</td><td>"+t.planet.name+"</td>",e}));this.mainTable.getElementsByTagName("tbody")[0].replaceChildren(...t)}updatePeople(){if(this.pilots.length>0&&this.getId(location.hash)){const t=this.pilots.find((t=>t.id===this.getId(location.hash)));Array("name","gender","height","planet.name","planet.residents").forEach((e=>{let i;if(e.includes(".")){let s=e.split(".");i=t[s[0]],i=i[s[1]]}else i=t[e];if(Array.isArray(i)){const s=Object.values(i).map((e=>{var i=document.createElement("span");if(t.id!=this.getId(e)){const t=this.pilots.find((t=>t.id===this.getId(e)));i.innerHTML='<a href="#people/'+t.id+'/">'+t.name+"</a> , "}return i}));i=s,document.querySelector('[data-bind="'+e+'"]').replaceChildren(...s)}else document.querySelector('[data-bind="'+e+'"]').textContent=i}))}}}).initApp()})();