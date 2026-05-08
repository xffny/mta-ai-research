import { useState, useEffect, useCallback, useRef } from "react";
import { loadData, saveData } from "./supabase.js";

const SK = "mta-ai-v5";
const CATEGORIES = ["LLM / Foundation Model","AI Assistants / Chatbots","AI Coding Tools","AI Image / Video Gen","AI for Sales & Marketing","AI for HR / Recruiting","AI for Finance / Legal","AI for Healthcare","AI for Creative / Design","AI Data & Analytics","AI Cybersecurity","AI Education","AI Infrastructure / DevTools","AI Hardware / Chips","Enterprise Search","Other"];
const SERIES = ["Pre-Seed","Seed","Series A","Series B","Series C","Series D+","Public","Bootstrapped","Unknown"];
const FOCUS = ["B2C","B2B","Both","Unknown"];
const INTENTS = ["Brand Awareness","User Acquisition","Talent Recruitment","Investor Signaling","Feature Education","Competitive Positioning","Category Creation","Unknown"];
const TONES = ["Productivity","Magic / Wonder","Human-centric","Automation","Simplicity","Trust / Safety","Speed","Intelligence","Other"];

const MTA_LINES = [
  {id:"1",c:"#EE352E",g:"7th Ave"},{id:"2",c:"#EE352E",g:"7th Ave"},{id:"3",c:"#EE352E",g:"7th Ave"},
  {id:"4",c:"#00933C",g:"Lex"},{id:"5",c:"#00933C",g:"Lex"},{id:"6",c:"#00933C",g:"Lex"},
  {id:"7",c:"#B933AD",g:"Flushing"},
  {id:"A",c:"#0039A6",g:"8th Ave"},{id:"C",c:"#0039A6",g:"8th Ave"},{id:"E",c:"#0039A6",g:"8th Ave"},
  {id:"B",c:"#FF6319",g:"6th Ave"},{id:"D",c:"#FF6319",g:"6th Ave"},{id:"F",c:"#FF6319",g:"6th Ave"},{id:"M",c:"#FF6319",g:"6th Ave"},
  {id:"G",c:"#6CBE45",g:"Crosstown"},{id:"J",c:"#996633",g:"Nassau"},{id:"Z",c:"#996633",g:"Nassau"},
  {id:"L",c:"#A7A9AC",g:"Canarsie"},
  {id:"N",c:"#FCCC0A",t:"#333",g:"Broadway"},{id:"Q",c:"#FCCC0A",t:"#333",g:"Broadway"},{id:"R",c:"#FCCC0A",t:"#333",g:"Broadway"},{id:"W",c:"#FCCC0A",t:"#333",g:"Broadway"},
  {id:"S",c:"#808183",g:"Shuttle"},
];

const SUBWAY_ADS = [
  {id:"train_wrap",l:"Train Wrap"},{id:"in_car_11x28",l:'In-Car 11″×28″'},{id:"in_car_11x42",l:'In-Car 11″×42″'},{id:"in_car_21x33",l:'In-Car 21″×33″'},{id:"in_car_full",l:"In-Car Full Wrap"},{id:"in_car_other",l:"In-Car Other"},
  {id:"platform_digital",l:"Platform Digital"},{id:"mezz_digital",l:"Mezzanine Digital"},
  {id:"platform_poster",l:"Platform Poster"},{id:"corridor_poster",l:"Corridor Poster"},
  {id:"station_takeover",l:"Station Takeover"},{id:"turnstile",l:"Turnstile Wrap"},
  {id:"stairway",l:"Stairway Wrap"},{id:"escalator",l:"Escalator Panels"},{id:"bench",l:"Bench Ad"},
  {id:"street",l:"Street Furniture"},{id:"other",l:"Other"},
];
const BUS_ADS = [{id:"bus_king",l:"King"},{id:"bus_queen",l:"Queen"},{id:"bus_tail",l:"Tail"},{id:"bus_interior",l:"Interior"},{id:"bus_wrap",l:"Full Wrap"},{id:"bus_shelter",l:"Shelter"}];

const COSTS={train_wrap:[50000,175000],in_car_11x28:[350,1200],in_car_11x42:[500,1800],in_car_21x33:[800,2500],in_car_full:[25000,80000],in_car_other:[500,2000],platform_digital:[15000,45000],mezz_digital:[10000,30000],platform_poster:[5000,20000],corridor_poster:[3000,12000],station_takeover:[150000,500000],turnstile:[8000,25000],stairway:[10000,35000],escalator:[5000,18000],bench:[2000,6000],bus_king:[2000,6000],bus_queen:[1500,4500],bus_tail:[1000,3500],bus_interior:[300,900],bus_wrap:[30000,80000],bus_shelter:[3000,10000],street:[3000,10000],other:[3000,20000]};

const STATIONS=["Times Sq–42nd St","Grand Central–42nd St","34th St–Penn Station","14th St–Union Square","Fulton St","34th St–Herald Sq","59th St–Columbus Circle","42nd St–Port Authority","Lexington Ave/59th St","Atlantic Ave–Barclays Ctr","Canal St","Chambers St","23rd St (6th Ave)","23rd St (Park Ave)","West 4th St–Washington Sq","Broadway Junction","Jay St–MetroTech","Dekalb Ave","Court Sq","Jackson Hts–Roosevelt Ave","Flushing–Main St","Borough Hall","Wall St","Bowling Green","City Hall","Spring St","Bleecker St","Astor Pl","8th St–NYU","Christopher St","Houston St","Prince St","28th St (Broadway)","51st St","68th St–Hunter College","86th St (Lex)","96th St (Lex)","125th St (Lex)","72nd St (Broadway)","86th St (Broadway)","96th St (Broadway)","116th St–Columbia Univ","125th St (Broadway)","145th St","168th St","181st St","Dyckman St","Inwood–207th St","Woodlawn","Pelham Bay Park","161st St–Yankee Stadium","Fordham Rd","Bedford Park Blvd","Coney Island–Stillwell Ave","Brighton Beach","Prospect Park","Church Ave (B/Q)","7th Ave (Park Slope)","4th Ave–9th St","Smith–9th Sts","Bergen St","Nevins St","Hoyt–Schermerhorn Sts","Franklin Ave","Nostrand Ave","Utica Ave","Broadway (Brooklyn)","Myrtle Ave","Essex St–Delancey St","Bowery","Grand St","Roosevelt Island","Forest Hills–71st Ave","Kew Gardens–Union Tpke","Jamaica Center","Jamaica–179th St","Mets–Willets Point","Junction Blvd","74th St–Broadway","Astoria–Ditmars Blvd","30th Ave","Queensboro Plaza","Long Island City–Court Sq","Greenpoint Ave","Bedford Ave","Lorimer St","Metropolitan Ave","Rockaway Park","Far Rockaway–Mott Ave","Howard Beach–JFK"];

const EMPTY_CO={name:"",description:"",category:CATEGORIES[0],focus:"Unknown",series:"Unknown",backers:"",valuation:"",totalRaised:"",hq:"",nycOffice:false,employeeCount:"",website:"",adAgency:"",strategicIntent:"Unknown",sightings:[],sources:[],lastUpdated:"",tagline:"",messagingTone:[],keyVocabulary:"",visualDescription:"",messagingNotes:"",adRefs:[],logoUrl:""};
function getLogo(website){if(!website)return"";const d=website.replace(/^https?:\/\//,"").replace(/\/.*$/,"");return`https://logo.clearbit.com/${d}`}
const EMPTY_SIGHT={date:new Date().toISOString().split("T")[0],station:"",lines:[],adFormats:[],busFormats:[],busRoute:"",notes:"",photoDataUrl:null};

function pv(s){if(!s)return 0;const str=String(s).trim().toLowerCase().replace(/[$,]/g,"");const m=str.match(/^([\d.]+)\s*(b|billion|m|million|k|thousand)?$/);if(!m)return parseFloat(str)||0;const n=parseFloat(m[1]),u=m[2]||"";if(u[0]==="b")return n*1e9;if(u[0]==="m")return n*1e6;if(u[0]==="k"||u[0]==="t")return n*1e3;return n}
function fm(n){if(!n&&n!==0)return"—";const v=typeof n==="string"?pv(n):n;if(isNaN(v)||v===0)return"—";if(v>=1e9)return`$${(v/1e9).toFixed(1)}B`;if(v>=1e6)return`$${(v/1e6).toFixed(1)}M`;if(v>=1e3)return`$${(v/1e3).toFixed(0)}K`;return`$${v.toLocaleString()}`}
function sc(sightings){let l=0,h=0;(sightings||[]).forEach(s=>{[...(s.adFormats||[]),...(s.busFormats||[])].forEach(f=>{const e=COSTS[f]||COSTS.other;l+=e[0];h+=e[1]})});return[l,h]}
function fmtF(s){return[...(s.adFormats||[]).map(f=>(SUBWAY_ADS.find(a=>a.id===f)||{}).l||f),...(s.busFormats||[]).map(f=>"Bus: "+((BUS_ADS.find(a=>a.id===f)||{}).l||f))]}
function aei(co){const[,h]=sc(co.sightings);const r=pv(co.totalRaised);if(!r||!h)return null;return(h/r*100)}

/* ════════════════════════════════════════
   DESIGN SYSTEM — Warm Premium Sage
   ════════════════════════════════════════ */
const P = {
  bg:    "#f5f0ea",      // warm ivory
  bg2:   "#ede7df",      // oat
  card:  "#faf7f2",      // cream white
  card2: "#f0ebe3",      // warm stone
  card3: "#e8e2d8",      // pale stone
  brd:   "#ddd6cb",      // soft divider
  brdL:  "#e8e2d9",      // lighter divider
  tx:    "#2c2a25",      // warm near-black
  txB:   "#4a473f",      // body text
  mu:    "#8a857b",      // muted
  muL:   "#a8a49b",      // lighter muted
  sage:  "#7a8c6e",      // primary sage
  sageD: "#5f6e54",      // dark sage
  sageL: "#c0ccb5",      // light sage
  sageBg:"rgba(122,140,110,0.08)",
  olive: "#6b7a4e",      // olive accent
  oliveBg:"rgba(107,122,78,0.08)",
  gold:  "#b8a071",      // brushed gold accent
  goldBg:"rgba(184,160,113,0.08)",
  err:   "#b87d6a",      // warm terracotta for errors
  errBg: "rgba(184,125,106,0.08)",
  white: "#fff",
};
const F = {
  head: "'Inter', sans-serif",
  body: "'Source Sans 3', 'Source Sans Pro', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// ─── Components ───
function Tag({children,color=P.sage,bg}){
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontFamily:F.head,fontWeight:600,color,background:bg||`${color}12`,whiteSpace:"nowrap"}}>{children}</span>
}
function SL({children}){return <div style={{fontFamily:F.head,fontSize:10,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:P.mu,marginBottom:8}}>{children}</div>}
function Btn({children,onClick,primary,danger,small,disabled,sx}){
  const base={padding:small?"5px 14px":"10px 22px",borderRadius:24,border:"none",fontSize:small?11:13,fontFamily:F.head,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,transition:"all .2s",letterSpacing:.2};
  const st=danger?{background:P.errBg,color:P.err,border:`1px solid ${P.err}22`}:primary?{background:P.sage,color:P.white,boxShadow:"0 2px 8px rgba(122,140,110,0.25)"}:{background:P.card,color:P.txB,border:`1px solid ${P.brd}`,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"};
  return <button onClick={disabled?undefined:onClick} style={{...base,...st,...sx}}>{children}</button>
}
function Inp({label,value,onChange,ph,type="text",mono,ta,half}){
  const s={width:"100%",padding:"10px 14px",background:P.white,border:`1px solid ${P.brd}`,borderRadius:12,color:P.tx,fontSize:13,fontFamily:mono?F.mono:F.body,outline:"none",boxSizing:"border-box",resize:ta?"vertical":undefined,transition:"border .2s"};
  return <div style={{flex:half?"1 1 45%":"1 1 100%",minWidth:half?180:undefined}}>
    {label&&<label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:5}}>{label}</label>}
    {ta?<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={3} style={s} onFocus={e=>e.target.style.borderColor=P.sage} onBlur={e=>e.target.style.borderColor=P.brd}/>
    :<input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={s} onFocus={e=>e.target.style.borderColor=P.sage} onBlur={e=>e.target.style.borderColor=P.brd}/>}
  </div>
}
function Sel({label,value,onChange,options,half}){
  return <div style={{flex:half?"1 1 45%":"1 1 100%",minWidth:half?180:undefined}}>
    {label&&<label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:5}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"10px 14px",background:P.white,border:`1px solid ${P.brd}`,borderRadius:12,color:P.tx,fontSize:13,fontFamily:F.body,outline:"none",boxSizing:"border-box"}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>
  </div>
}
function Card({children,style}){
  return <div style={{background:P.card,borderRadius:16,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.02)",border:`1px solid ${P.brdL}`,...style}}>{children}</div>
}
function Bar({data,colorFn}){
  const mx=Math.max(...data.map(d=>d.v),1);
  return <div style={{display:"flex",flexDirection:"column",gap:8}}>{data.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
    <span style={{fontFamily:F.body,fontSize:12,color:P.mu,width:110,textAlign:"right",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.l}</span>
    <div style={{flex:1,height:22,background:P.bg2,borderRadius:11,overflow:"hidden"}}><div style={{height:"100%",width:`${(d.v/mx)*100}%`,background:colorFn?colorFn(d):P.sage,borderRadius:11,minWidth:d.v>0?4:0,transition:"width .4s ease"}}/></div>
    <span style={{fontFamily:F.mono,fontSize:11,color:P.tx,width:28,textAlign:"right",fontWeight:500}}>{d.v}</span>
  </div>)}</div>
}
function LP({line,s:sm}){const info=MTA_LINES.find(l=>l.id===line);if(!info)return <Tag color={P.mu}>{line}</Tag>;const sz=sm?17:21;return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:sz,height:sz,borderRadius:"50%",background:info.c,color:info.t||"#fff",fontSize:sm?9:11,fontFamily:F.head,fontWeight:700,flexShrink:0}}>{info.id}</span>}

function StationInput({value,onChange}){
  const[q,setQ]=useState(value||"");const[show,setShow]=useState(false);const ref=useRef();
  const matches=q.length>1?STATIONS.filter(s=>s.toLowerCase().includes(q.toLowerCase())).slice(0,8):[];
  useEffect(()=>{setQ(value||"")},[value]);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setShow(false)};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h)},[]);
  return <div ref={ref} style={{flex:"1 1 45%",minWidth:180,position:"relative"}}>
    <label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:5}}>Station</label>
    <input value={q} onChange={e=>{setQ(e.target.value);onChange(e.target.value);setShow(true)}} onFocus={()=>setShow(true)} placeholder="Type to search…" style={{width:"100%",padding:"10px 14px",background:P.white,border:`1px solid ${P.brd}`,borderRadius:12,color:P.tx,fontSize:13,fontFamily:F.body,outline:"none",boxSizing:"border-box"}}/>
    {show&&matches.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:20,background:P.white,border:`1px solid ${P.brd}`,borderRadius:12,marginTop:4,maxHeight:220,overflow:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.08)"}}>
      {matches.map(s=><div key={s} onClick={()=>{setQ(s);onChange(s);setShow(false)}} style={{padding:"10px 14px",fontSize:13,fontFamily:F.body,color:P.tx,cursor:"pointer",borderBottom:`1px solid ${P.brdL}`}} onMouseEnter={e=>e.target.style.background=P.sageBg} onMouseLeave={e=>e.target.style.background="transparent"}>{s}</div>)}
    </div>}
  </div>
}

function AdFormatMulti({sel,onChange,items,label}){
  const tog=id=>{if(sel.includes(id))onChange(sel.filter(x=>x!==id));else onChange([...sel,id])};
  return <div style={{flex:"1 1 100%"}}>
    <label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:6}}>{label}</label>
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{items.map(a=>{const on=sel.includes(a.id);return <button key={a.id} onClick={()=>tog(a.id)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontFamily:F.body,fontWeight:500,border:`1px solid ${on?P.sage:P.brd}`,background:on?P.sageBg:P.white,color:on?P.sageD:P.mu,cursor:"pointer",transition:"all .15s"}}>{a.l}</button>})}</div>
  </div>
}

function LineSel({sel,onChange}){
  const tog=id=>{if(sel.includes(id))onChange(sel.filter(l=>l!==id));else onChange([...sel,id])};
  const gs={};MTA_LINES.forEach(l=>{if(!gs[l.g])gs[l.g]=[];gs[l.g].push(l)});
  return <div><label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:6}}>Lines</label>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>{Object.entries(gs).map(([g,ls])=><div key={g} style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
      <span style={{fontFamily:F.mono,fontSize:9,color:P.muL,width:60,textAlign:"right",flexShrink:0}}>{g}</span>
      {ls.map(l=>{const on=sel.includes(l.id);return <button key={l.id} onClick={()=>tog(l.id)} style={{width:26,height:26,borderRadius:"50%",border:on?`2.5px solid ${l.c}`:`2px solid ${l.c}`,background:on?l.c:P.white,color:on?(l.t||"#fff"):l.c,fontSize:11,fontFamily:F.head,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,transition:"all .15s"}}>{l.id}</button>})}
    </div>)}</div></div>
}
function ToneSel({sel,onChange}){
  const tog=t=>{if(sel.includes(t))onChange(sel.filter(x=>x!==t));else onChange([...sel,t])};
  return <div style={{flex:"1 1 100%"}}>
    <label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,letterSpacing:.3,marginBottom:6}}>Messaging Tone</label>
    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{TONES.map(t=>{const on=sel.includes(t);return <button key={t} onClick={()=>tog(t)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontFamily:F.body,fontWeight:500,border:`1px solid ${on?P.olive:P.brd}`,background:on?P.oliveBg:P.white,color:on?P.olive:P.mu,cursor:"pointer"}}>{t}</button>})}</div>
  </div>
}
function Sources({sources}){
  const[open,setOpen]=useState(false);if(!sources?.length)return null;
  const shown=open?sources:sources.slice(0,2);
  return <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${P.brdL}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{fontFamily:F.head,fontSize:10,fontWeight:600,color:P.mu,letterSpacing:1,textTransform:"uppercase"}}>Sources ({sources.length})</span>
      {sources.length>2&&<button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",fontFamily:F.body,fontSize:11,color:P.sage,cursor:"pointer",padding:0,fontWeight:500}}>{open?"Collapse":"Show all →"}</button>}
    </div>
    {shown.map((s,i)=>{const d=(()=>{try{return new URL(s.url).hostname.replace("www.","")}catch{return""}})();return <div key={i} style={{display:"flex",alignItems:"baseline",gap:6,fontSize:12,lineHeight:1.4,marginBottom:2}}>
      <span style={{fontFamily:F.mono,fontSize:10,color:P.muL}}>[{i+1}]</span>
      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{color:P.sage,textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:F.body}}>{s.title}</a>
      <span style={{fontFamily:F.mono,fontSize:10,color:P.muL,flexShrink:0}}>{d}</span>
    </div>})}
  </div>
}

// ─── AI ───
const MDL="claude-sonnet-4-20250514";
function aH(){return{"Content-Type":"application/json"}}

async function doResearch(name){
  const p=`The user typed "${name}" — an AI/tech company (may have typos). Correct the name, then research. Return ONLY JSON:
{"correctedName":"","description":"1-2 sentences","category":"BEST from: ${CATEGORIES.join(",")}","focus":"B2C/B2B/Both/Unknown","series":"from: ${SERIES.join(",")}","backers":"comma-sep","valuation":"e.g. 1.5B","totalRaised":"e.g. 350M","hq":"city, state","nycOffice":bool,"employeeCount":"string","website":"domain","adAgency":"if known"}`;
  const res=await fetch("/api/anthropic",{method:"POST",headers:aH(),body:JSON.stringify({model:MDL,max_tokens:1000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:p}]})});
  const data=await res.json();const sources=[];const seen=new Set();
  (data.content||[]).forEach(b=>{if(b.type==="web_search_tool_result"&&b.content)b.content.forEach(it=>{if(it.type==="web_search_result"&&it.url&&!seen.has(it.url)){seen.add(it.url);sources.push({title:it.title||it.url,url:it.url})}})});
  const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());parsed._sources=sources;return parsed;
}
async function searchCreatives(name){
  const p=`Search for current advertising campaigns and ad creatives by "${name}" (AI/tech company). Find subway ads, transit ads, outdoor ads, marketing campaigns. Return ONLY JSON array:
[{"title":"description","url":"URL","type":"article/social/campaign","confidence":"high/medium/low"}]
Up to 8 results. Only advertising-related. If nothing found, return [].`;
  const res=await fetch("/api/anthropic",{method:"POST",headers:aH(),body:JSON.stringify({model:MDL,max_tokens:1000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:p}]})});
  const data=await res.json();const txt=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
  try{return JSON.parse(txt.replace(/```json|```/g,"").trim())}catch{return[]}
}

// ═══ APP ═══
export default function App(){
  const[data,setData]=useState({companies:[],exec:"",methodology:"",spendMethod:"",conclusions:""});
  const[modal,setModal]=useState(null);const[expRow,setExpRow]=useState(null);const[loaded,setLoaded]=useState(false);
  const[tab,setTab]=useState("overview");const[showSettings,setShowSettings]=useState(false);
  const[syncStatus,setSyncStatus]=useState(null); // null | "saving" | "saved" | "error"

  useEffect(()=>{(async()=>{
    // show local data immediately so the page renders at once
    try{const raw=localStorage.getItem(SK);if(raw)setData(JSON.parse(raw));}catch{}
    setLoaded(true);
    // sync from Supabase in the background
    try{
      let d=await loadData();
      if(!d){
        const raw=localStorage.getItem(SK);
        if(raw){d=JSON.parse(raw);await saveData(d);}
      }
      if(d)setData(d);
    }catch{}
  })()},[]);

  const save=useCallback(async d=>{
    setData(d);
    setSyncStatus("saving");
    try{
      await saveData(d);
      localStorage.setItem(SK,JSON.stringify(d));
      setSyncStatus("saved");
      setTimeout(()=>setSyncStatus(null),2000);
    }catch{
      setSyncStatus("error");
      try{localStorage.setItem(SK,JSON.stringify(d));}catch{}
    }
  },[]);

  if(!loaded)return <div style={{background:P.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.body,color:P.mu}}>Loading…</div>;

  const cos=data.companies||[];const ts=cos.reduce((a,c)=>a+(c.sightings?.length||0),0);
  const[spL,spH]=cos.reduce(([l,h],c)=>{const[cl,ch]=sc(c.sightings);return[l+cl,h+ch]},[0,0]);

  const tabs=[["overview","Overview"],["companies","Companies"],["efficiency","Efficiency"],["creative","Creative"],["gaps","Gaps"],["paper","White Paper"]];

  return <div style={{background:P.bg,minHeight:"100vh",color:P.tx,fontFamily:F.body}}>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::selection{background:${P.sageL};color:${P.tx}}`}</style>

    {/* ═══ HERO ═══ */}
    <div style={{background:`linear-gradient(180deg, ${P.card} 0%, ${P.bg} 100%)`,padding:"52px 32px 44px",textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8,marginBottom:12}}>
        {syncStatus==="saving"&&<span style={{fontFamily:F.mono,fontSize:10,color:P.mu,display:"flex",alignItems:"center",gap:5}}><span style={{width:7,height:7,borderRadius:"50%",border:`1.5px solid ${P.mu}`,borderTopColor:"transparent",display:"inline-block",animation:"spin .8s linear infinite"}}/>Saving…</span>}
        {syncStatus==="saved"&&<span style={{fontFamily:F.mono,fontSize:10,color:P.sage}}>Saved</span>}
        {syncStatus==="error"&&<span style={{fontFamily:F.mono,fontSize:10,color:P.err}}>Sync failed</span>}
        <button onClick={()=>setShowSettings(true)} style={{background:P.white,border:`1px solid ${P.brd}`,borderRadius:20,padding:"5px 14px",fontFamily:F.head,fontSize:10,fontWeight:600,color:P.mu,cursor:"pointer",letterSpacing:.5}}>⚙ Settings</button>
      </div>
      <div style={{fontFamily:F.head,fontSize:10,fontWeight:600,letterSpacing:3,color:P.muL,textTransform:"uppercase",marginBottom:16}}>Independent Research · NYC · {new Date().getFullYear()}</div>
      <h1 style={{fontFamily:F.head,fontSize:"clamp(28px,4.5vw,46px)",fontWeight:700,lineHeight:1.15,margin:"0 auto 14px",maxWidth:640,color:P.tx}}>Who's Buying the MTA</h1>
      <p style={{fontFamily:F.body,fontSize:16,color:P.mu,maxWidth:520,margin:"0 auto 22px",lineHeight:1.65}}>Mapping the venture-backed AI companies colonizing NYC MTA ad space — and what the patterns reveal.</p>
      <div style={{display:"flex",justifyContent:"center",gap:28,flexWrap:"wrap"}}>
        {[{l:"Companies",v:cos.length},{l:"Sightings",v:ts},{l:"Est. Spend",v:`${fm(spL)}–${fm(spH)}`}].map(x=>
          <div key={x.l} style={{textAlign:"center"}}>
            <div style={{fontFamily:F.head,fontSize:24,fontWeight:700,color:P.sage}}>{x.v}</div>
            <div style={{fontFamily:F.head,fontSize:10,fontWeight:600,color:P.muL,letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{x.l}</div>
          </div>
        )}
      </div>
    </div>

    {/* ═══ NAV ═══ */}
    <div style={{background:P.card,borderBottom:`1px solid ${P.brd}`,padding:"0 24px",display:"flex",gap:4,overflowX:"auto",justifyContent:"center",position:"sticky",top:0,zIndex:50}}>
      {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{padding:"14px 20px",background:"none",border:"none",borderBottom:tab===k?`2.5px solid ${P.sage}`:"2.5px solid transparent",color:tab===k?P.sage:P.mu,fontFamily:F.head,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s",letterSpacing:.3}}>{l}</button>)}
    </div>

    <div style={{maxWidth:920,margin:"0 auto",padding:"28px 24px 80px"}}>
      {tab==="overview"&&<TabOverview cos={cos} ts={ts} spL={spL} spH={spH} setModal={setModal}/>}
      {tab==="companies"&&<TabCompanies cos={cos} setModal={setModal} expRow={expRow} setExpRow={setExpRow}/>}
      {tab==="efficiency"&&<TabEfficiency cos={cos}/>}
      {tab==="creative"&&<TabCreative cos={cos}/>}
      {tab==="gaps"&&<TabGaps cos={cos}/>}
      {tab==="paper"&&<TabPaper data={data} save={save} cos={cos} spH={spH}/>}
    </div>

    {modal&&<Modal modal={modal} data={data} save={save} close={()=>setModal(null)}/>}
    {showSettings&&<Settings onClose={()=>setShowSettings(false)}/>}
  </div>
}

// ═══ SETTINGS ═══
function Settings({onClose}){
  return <div style={{position:"fixed",inset:0,background:"rgba(44,42,37,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1100,padding:16}} onClick={onClose}>
    <Card style={{maxWidth:460,width:"100%"}} onClick={e=>e.stopPropagation()}>
      <h3 style={{fontFamily:F.head,fontSize:18,fontWeight:700,margin:"0 0 14px",color:P.tx}}>Settings</h3>
      <p style={{fontFamily:F.body,fontSize:13,color:P.mu,margin:"0 0 14px",lineHeight:1.6}}>API key is stored securely in <code style={{fontFamily:F.mono,background:P.bg2,padding:"1px 5px",borderRadius:4}}>.env</code> on the server. It never leaves your machine or touches the browser.</p>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Btn onClick={onClose}>Close</Btn></div>
    </Card>
  </div>
}

// ═══ OVERVIEW ═══
function TabOverview({cos,ts,spL,spH,setModal}){
  const catC={};cos.forEach(c=>{catC[c.category]=(catC[c.category]||0)+1});
  const catD=Object.entries(catC).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({l:l.split("/")[0].trim(),v}));
  const focC={B2B:0,B2C:0,Both:0,Unknown:0};cos.forEach(c=>{focC[c.focus]++});
  const intC={};cos.forEach(c=>{intC[c.strategicIntent]=(intC[c.strategicIntent]||0)+1});
  const intD=Object.entries(intC).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({l,v}));
  const serD=Object.entries((() => { const o = {}; cos.forEach(c => { o[c.series] = (o[c.series] || 0) + 1 }); return o })()).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({l,v}));

  return <>
    <div style={{marginBottom:28}}>
      <SL>Research Hypotheses</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {[{t:"The Burn Rate Hypothesis",d:"Do subway takeovers correlate with desperation spend or market dominance?",c:P.sage},{t:"Consumerization of B2B",d:"B2B tools on the 6 train — talent acquisition, investor signaling, or growth?",c:P.olive},{t:"The Translation Problem",d:"How are complex enterprise products simplified for commuters?",c:P.gold},{t:"The ROI Illusion",d:"Are these ads actually converting, or is it pure brand theater? What's the real return on a $500K station takeover?",c:P.err}].map(h=>
          <Card key={h.t} style={{borderLeft:`3px solid ${h.c}`,padding:18}}>
            <div style={{fontFamily:F.head,fontSize:13,fontWeight:700,color:h.c,marginBottom:5}}>{h.t}</div>
            <div style={{fontSize:13,color:P.mu,lineHeight:1.55}}>{h.d}</div>
          </Card>
        )}
      </div>
    </div>

    {cos.length===0?<Card style={{textAlign:"center",padding:48}}>
      <p style={{color:P.mu,fontSize:15,margin:"0 0 16px"}}>No data yet.</p>
      <Btn primary onClick={()=>setModal({type:"add"})}>+ Log First Company</Btn>
    </Card>:<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        {[{l:"Companies",v:cos.length},{l:"Sightings",v:ts},{l:"Est. Spend",v:`${fm(spL)}–${fm(spH)}`},{l:"Avg / Co",v:cos.length?`${fm(spL/cos.length)}–${fm(spH/cos.length)}`:"—"}].map(x=>
          <Card key={x.l} style={{textAlign:"center",padding:18}}>
            <div style={{fontFamily:F.head,fontSize:10,fontWeight:600,color:P.muL,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{x.l}</div>
            <div style={{fontFamily:F.head,fontSize:26,fontWeight:700,color:P.sage}}>{x.v}</div>
          </Card>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card><SL>Sub-Sector</SL><Bar data={catD}/></Card>
        <Card><SL>Strategic Intent</SL><Bar data={intD} colorFn={()=>P.olive}/></Card>
        <Card><SL>B2B vs B2C</SL><Bar data={Object.entries(focC).filter(([,v])=>v>0).map(([l,v])=>({l,v}))} colorFn={d=>d.l==="B2B"?P.sage:d.l==="B2C"?P.olive:P.gold}/></Card>
        <Card><SL>Funding Stage</SL><Bar data={serD} colorFn={()=>P.gold}/></Card>
      </div>
    </>}
  </>
}

// ═══ COMPANIES ═══
function TabCompanies({cos,setModal,expRow,setExpRow}){
  return <>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <SL>Company Tracker ({cos.length})</SL>
      <Btn primary small onClick={()=>setModal({type:"add"})}>+ Add Company</Btn>
    </div>
    {cos.length===0?<Card style={{textAlign:"center",padding:40}}><p style={{color:P.mu}}>No companies yet.</p></Card>:
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr .6fr .6fr .7fr .5fr .9fr",padding:"12px 18px",background:P.bg2,fontFamily:F.head,fontSize:10,fontWeight:600,color:P.muL,letterSpacing:.5,textTransform:"uppercase"}}>
        <span>Company</span><span>Category</span><span>Focus</span><span>Stage</span><span>Intent</span><span>Ads</span><span>Spend</span>
      </div>
      {cos.map((c,i)=>{const[sl,sh]=sc(c.sightings);const ex=expRow===i;return <div key={i}>
        <div onClick={()=>setExpRow(ex?null:i)} style={{display:"grid",gridTemplateColumns:"1.8fr 1.2fr .6fr .6fr .7fr .5fr .9fr",padding:"14px 18px",borderTop:`1px solid ${P.brdL}`,cursor:"pointer",background:ex?P.sageBg:"transparent",alignItems:"center",transition:"background .15s"}}>
          <span style={{display:"flex",alignItems:"center",gap:8}}>{c.logoUrl&&<img src={c.logoUrl} alt="" onError={e=>e.target.style.display="none"} style={{width:22,height:22,borderRadius:6,objectFit:"contain",border:`1px solid ${P.brdL}`,background:P.white,padding:2,flexShrink:0}}/>}<span style={{fontFamily:F.head,fontWeight:600,fontSize:14}}>{c.name||"?"}</span></span>
          <span style={{fontSize:12,color:P.mu}}>{c.category.split("/")[0].trim()}</span>
          <Tag color={c.focus==="B2B"?P.sage:c.focus==="B2C"?P.olive:P.gold}>{c.focus}</Tag>
          <Tag color={P.mu}>{c.series}</Tag>
          <Tag color={P.olive}>{(c.strategicIntent||"?").split(" ")[0]}</Tag>
          <span style={{fontFamily:F.mono,fontSize:13,fontWeight:500}}>{c.sightings?.length||0}</span>
          <span style={{fontFamily:F.mono,fontSize:12,color:P.sageD,fontWeight:500}}>{fm(sl)}–{fm(sh)}</span>
        </div>
        {ex&&<ExpandedRow c={c} idx={i} setModal={setModal}/>}
      </div>})}
    </Card>}
  </>
}

function ExpandedRow({c,idx,setModal}){
  const[sl,sh]=sc(c.sightings);const v=pv(c.valuation);const r=pv(c.totalRaised);const ef=aei(c);
  return <div style={{padding:"18px 22px",background:P.bg2,borderTop:`1px solid ${P.brd}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",gap:10,flexWrap:"wrap",marginBottom:14}}>
      <div style={{flex:1,minWidth:240}}>
        {c.logoUrl&&<img src={c.logoUrl} alt={c.name} onError={e=>e.target.style.display="none"} style={{width:36,height:36,borderRadius:8,objectFit:"contain",border:`1px solid ${P.brd}`,background:P.white,padding:4,marginBottom:10,display:"block"}}/>}
        {c.description&&<p style={{fontSize:14,lineHeight:1.65,color:P.txB,margin:"0 0 12px"}}>{c.description}</p>}

        {/* Meta row */}
        <div style={{display:"flex",gap:16,fontSize:12,color:P.mu,flexWrap:"wrap",marginBottom:6,alignItems:"center"}}>
          {c.hq&&<span><strong style={{color:P.txB}}>HQ</strong> {c.hq}</span>}
          {c.nycOffice&&<span style={{color:P.sage,fontWeight:600}}>NYC ✓</span>}
          {c.employeeCount&&<span><strong style={{color:P.txB}}>Emp</strong> {c.employeeCount}</span>}
          {c.website&&<a href={c.website.startsWith("http")?c.website:`https://${c.website}`} target="_blank" rel="noopener noreferrer" style={{color:P.sage,textDecoration:"none",fontWeight:500}}>{c.website}</a>}
          {c.adAgency&&<span><strong style={{color:P.txB}}>Agency</strong> {c.adAgency}</span>}
        </div>

        {/* Backers */}
        {c.backers&&<div style={{fontSize:12,color:P.mu,marginBottom:8}}><strong style={{color:P.txB}}>Backers</strong> {c.backers}</div>}

        {/* Financials */}
        <div style={{display:"flex",gap:16,fontFamily:F.mono,fontSize:12,flexWrap:"wrap"}}>
          {v>0&&<span><strong style={{fontFamily:F.head,fontSize:11,color:P.mu,fontWeight:600}}>VAL</strong> <span style={{color:P.tx}}>{fm(v)}</span></span>}
          {r>0&&<span><strong style={{fontFamily:F.head,fontSize:11,color:P.mu,fontWeight:600}}>RAISED</strong> <span style={{color:P.tx}}>{fm(r)}</span></span>}
          {ef!==null&&<span><strong style={{fontFamily:F.head,fontSize:11,color:P.mu,fontWeight:600}}>AEI</strong> <span style={{color:P.sage,fontWeight:600}}>{ef.toFixed(2)}%</span></span>}
        </div>
      </div>
      <div style={{display:"flex",gap:6}}><Btn small onClick={()=>setModal({type:"sighting",idx})}>+ Sighting</Btn><Btn small onClick={()=>setModal({type:"edit",idx})}>Edit</Btn></div>
    </div>

    {(c.tagline||c.messagingTone?.length>0)&&<Card style={{padding:14,marginBottom:12,background:P.card}}>
      <SL>Creative Audit</SL>
      {c.tagline&&<div style={{fontSize:13,color:P.tx,fontStyle:"italic",marginBottom:4}}>"{c.tagline}"</div>}
      {c.messagingTone?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>{c.messagingTone.map(t=><Tag key={t} color={P.olive}>{t}</Tag>)}</div>}
      {c.keyVocabulary&&<div style={{fontSize:12,color:P.mu}}>Keywords: {c.keyVocabulary}</div>}
    </Card>}

    {c.adRefs?.length>0&&<div style={{marginBottom:12}}>
      <SL>Ad References ({c.adRefs.length})</SL>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{c.adRefs.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{padding:"6px 12px",background:P.goldBg,borderRadius:20,fontSize:11,color:P.gold,textDecoration:"none",fontFamily:F.body,fontWeight:500}}>{r.title}</a>)}</div>
    </div>}

    {(c.sightings||[]).length>0&&<div>
      <SL>Sightings</SL>
      {c.sightings.map((s,i)=><div key={i} style={{display:"flex",gap:12,padding:"8px 0",borderTop:i?`1px solid ${P.brdL}`:"none",alignItems:"start"}}>
        {s.photoDataUrl&&<img src={s.photoDataUrl} alt="" style={{width:68,height:50,objectFit:"cover",borderRadius:10,border:`1px solid ${P.brd}`,flexShrink:0}}/>}
        <div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontFamily:F.mono,fontSize:12,color:P.sage,fontWeight:500}}>{s.date}</span>
          <span style={{fontSize:13}}>{s.station||"—"}</span>
          {(s.lines||[]).map(l=><LP key={l} line={l} s/>)}
          {fmtF(s).map((f,j)=><Tag key={j} color={P.mu}>{f}</Tag>)}
        </div>{s.notes&&<p style={{fontSize:12,color:P.mu,margin:"3px 0 0",lineHeight:1.5}}>{s.notes}</p>}</div>
      </div>)}
    </div>}
    <Sources sources={c.sources}/>
  </div>
}

// ═══ EFFICIENCY ═══
function TabEfficiency({cos}){
  const ranked=cos.map(c=>{const[,h]=sc(c.sightings);const r=pv(c.totalRaised);const v=pv(c.valuation);return{...c,spH:h,raised:r,val:v,eff:r?(h/r*100):null}}).filter(c=>c.eff!==null).sort((a,b)=>b.eff-a.eff);
  return <>
    <SL>AI Ad-Efficiency Index</SL>
    <h2 style={{fontFamily:F.head,fontSize:24,fontWeight:700,margin:"0 0 6px"}}>Capital Efficiency of Subway Advertising</h2>
    <p style={{fontSize:14,color:P.mu,lineHeight:1.6,margin:"0 0 22px"}}><strong style={{color:P.tx}}>AEI = Est. MTA Spend ÷ Total Raised × 100</strong></p>
    {ranked.length===0?<Card style={{textAlign:"center",padding:36}}><p style={{color:P.mu}}>Add companies with Total Raised data.</p></Card>:
    <Card style={{padding:0,overflow:"hidden"}}>
      <div style={{display:"grid",gridTemplateColumns:".3fr 1.8fr 1fr .8fr .8fr 1fr",padding:"12px 18px",background:P.bg2,fontFamily:F.head,fontSize:10,fontWeight:600,color:P.muL,letterSpacing:.5,textTransform:"uppercase"}}><span>#</span><span>Company</span><span>Spend</span><span>Raised</span><span>Val</span><span>AEI</span></div>
      {ranked.map((c,i)=>{const ic=c.eff>1?"🔴":c.eff>0.1?"🟡":"🟢";return <div key={i} style={{display:"grid",gridTemplateColumns:".3fr 1.8fr 1fr .8fr .8fr 1fr",padding:"12px 18px",borderTop:`1px solid ${P.brdL}`,alignItems:"center"}}>
        <span style={{fontFamily:F.mono,fontSize:13,color:P.muL}}>{i+1}</span>
        <div><span style={{fontFamily:F.head,fontWeight:600,fontSize:14}}>{c.name}</span><br/><span style={{fontSize:11,color:P.mu}}>{c.series} · {c.focus}</span></div>
        <span style={{fontFamily:F.mono,fontSize:12,color:P.sageD}}>{fm(c.spH)}</span>
        <span style={{fontFamily:F.mono,fontSize:12}}>{fm(c.raised)}</span>
        <span style={{fontFamily:F.mono,fontSize:12}}>{fm(c.val)}</span>
        <span style={{fontFamily:F.mono,fontSize:13,fontWeight:600,color:c.eff>1?P.err:c.eff>0.1?P.gold:P.sage}}>{ic} {c.eff.toFixed(3)}%</span>
      </div>})}
    </Card>}
    <Card style={{marginTop:16}}>
      <div style={{fontSize:13,color:P.txB,lineHeight:1.7}}>🔴 <strong style={{color:P.err}}>&gt;1%</strong> Aggressive burn · 🟡 <strong style={{color:P.gold}}>0.1–1%</strong> Notable commitment · 🟢 <strong style={{color:P.sage}}>&lt;0.1%</strong> Immaterial</div>
    </Card>
  </>
}

// ═══ CREATIVE ═══
function TabCreative({cos}){
  const tC={};cos.forEach(c=>(c.messagingTone||[]).forEach(t=>{tC[t]=(tC[t]||0)+1}));
  const tD=Object.entries(tC).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({l,v}));
  const aW=cos.flatMap(c=>(c.keyVocabulary||"").split(",").map(w=>w.trim().toLowerCase()).filter(Boolean));
  const wC={};aW.forEach(w=>{wC[w]=(wC[w]||0)+1});const wD=Object.entries(wC).sort((a,b)=>b[1]-a[1]).slice(0,15);
  return <>
    <SL>Creative & Messaging Audit</SL>
    <h2 style={{fontFamily:F.head,fontSize:24,fontWeight:700,margin:"0 0 22px"}}>The Vocabulary of AI Advertising</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
      <Card><SL>Tone Distribution</SL>{tD.length?<Bar data={tD} colorFn={()=>P.olive}/>:<p style={{color:P.mu,fontSize:13,fontStyle:"italic"}}>Add tone data.</p>}</Card>
      <Card><SL>Top Keywords</SL>{wD.length?<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{wD.map(([w,c])=><span key={w} style={{padding:"5px 12px",borderRadius:20,background:P.sageBg,fontFamily:F.mono,fontSize:11,color:P.sage}}>{w} <span style={{color:P.muL}}>×{c}</span></span>)}</div>:<p style={{color:P.mu,fontSize:13,fontStyle:"italic"}}>Add vocabulary data.</p>}</Card>
    </div>
    {cos.filter(c=>c.tagline).length>0&&<Card><SL>Taglines</SL>
      {cos.filter(c=>c.tagline).map((c,i)=><div key={i} style={{display:"flex",gap:12,alignItems:"baseline",padding:"8px 0",borderTop:i?`1px solid ${P.brdL}`:"none"}}>
        <span style={{fontFamily:F.head,fontWeight:600,fontSize:13,width:120,flexShrink:0}}>{c.name}</span>
        <span style={{fontSize:15,fontStyle:"italic",color:P.txB}}>"{c.tagline}"</span>
      </div>)}
    </Card>}
  </>
}

// ═══ GAPS ═══
function TabGaps({cos}){
  const catC={};cos.forEach(c=>{catC[c.category]=(catC[c.category]||0)+1});
  const catSp={};cos.forEach(c=>{const[,ch]=sc(c.sightings);catSp[c.category]=(catSp[c.category]||0)+ch});
  const catSD=Object.entries(catSp).sort((a,b)=>b[1]-a[1]).map(([l,v])=>({l:l.split("/")[0].trim(),v:Math.round(v/1000)}));
  return <>
    <SL>Gap Analysis</SL>
    <h2 style={{fontFamily:F.head,fontSize:24,fontWeight:700,margin:"0 0 22px"}}>Who's Winning Physical Space?</h2>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card><SL>Spend by Sector ($K)</SL>{catSD.length?<Bar data={catSD} colorFn={()=>P.gold}/>:<p style={{color:P.mu}}>No data.</p>}</Card>
      <Card><SL>Missing Sectors</SL>
        {CATEGORIES.map(cat=>{const count=catC[cat]||0;return count>0?null:<div key={cat} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}><span style={{width:7,height:7,borderRadius:"50%",background:P.muL,flexShrink:0}}/><span style={{color:P.mu,fontSize:12}}>{cat}</span></div>}).filter(Boolean)}
        {Object.keys(catC).length>=CATEGORIES.length&&<p style={{color:P.sage,fontSize:13}}>All represented.</p>}
      </Card>
    </div>
  </>
}

// ═══ WHITE PAPER ═══
function TabPaper({data,save,cos,spH}){
  return <>
    <SL>White Paper</SL>
    <h2 style={{fontFamily:F.head,fontSize:24,fontWeight:700,margin:"0 0 22px"}}>Publication Draft</h2>
    <ES t="Executive Summary" f="exec" data={data} save={save} ph={`A study tracking ${fm(spH)}+ in estimated ad spend across ${cos.length} AI companies in the NYC MTA system.`}/>
    <ES t="Context & Significance" f="methodology" data={data} save={save} ph="The NYC subway is the highest-signal physical ad environment in US tech."/>
    <ES t="Spend Methodology" f="spendMethod" data={data} save={save} ph="Estimates from Outfront Media rate cards. AEI = Est. Spend ÷ Total Raised × 100."/>
    <ES t="Conclusions" f="conclusions" data={data} save={save} ph="Series B/C AI startups use NYC transit as a proxy for institutional legitimacy."/>
  </>
}
function ES({t,f,data,save,ph}){
  const[ed,setEd]=useState(false);const[txt,setTxt]=useState(data[f]||"");
  useEffect(()=>{setTxt(data[f]||"")},[data,f]);
  return <Card style={{marginBottom:18}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
      <h3 style={{fontFamily:F.head,fontSize:17,fontWeight:700,margin:0}}>{t}</h3>
      <Btn small onClick={()=>{if(ed)save({...data,[f]:txt});setEd(!ed)}}>{ed?"Save":"Edit"}</Btn>
    </div>
    {ed?<textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder={ph} rows={5} style={{width:"100%",padding:14,background:P.bg,border:`1px solid ${P.brd}`,borderRadius:12,color:P.tx,fontSize:15,fontFamily:F.body,lineHeight:1.7,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
    :<div style={{fontSize:15,lineHeight:1.75,color:data[f]?P.txB:P.muL,whiteSpace:"pre-wrap",fontStyle:data[f]?undefined:"italic"}}>{data[f]||ph}</div>}
  </Card>
}

// ═══ SIGHTING FIELDS ═══
function SightFields({s,onChange,onPhoto}){
  return <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
    <Inp label="Date" type="date" value={s.date} onChange={v=>onChange("date",v)} half/>
    <StationInput value={s.station} onChange={v=>onChange("station",v)}/>
    <LineSel sel={s.lines||[]} onChange={v=>onChange("lines",v)}/>
    <AdFormatMulti sel={s.adFormats||[]} onChange={v=>onChange("adFormats",v)} items={SUBWAY_ADS} label="Subway Ad Formats"/>
    <Card style={{flex:"1 1 100%",padding:14,background:P.card2}}>
      <AdFormatMulti sel={s.busFormats||[]} onChange={v=>onChange("busFormats",v)} items={BUS_ADS} label="Bus Formats"/>
      {(s.busFormats||[]).length>0&&<div style={{marginTop:8}}><Inp label="Bus Route(s)" value={s.busRoute||""} onChange={v=>onChange("busRoute",v)} ph="M14, B63, Q32"/></div>}
    </Card>
    <Inp label="Notes" value={s.notes} onChange={v=>onChange("notes",v)} ta ph="Tagline, creative notes…"/>
    <div style={{flex:"1 1 100%"}}><label style={{display:"block",fontSize:11,fontFamily:F.head,fontWeight:600,color:P.mu,marginBottom:5}}>Photo</label>
      <input type="file" accept="image/*" onChange={onPhoto} style={{fontSize:12,color:P.mu}}/>{s.photoDataUrl&&<img src={s.photoDataUrl} alt="" style={{marginTop:8,maxWidth:"100%",maxHeight:150,borderRadius:12,border:`1px solid ${P.brd}`}}/>}
    </div>
  </div>
}

// ═══ MODAL ═══
function Modal({modal,data,save,close}){
  const isEdit=modal.type==="edit",isSight=modal.type==="sighting";
  const existing=(isEdit||isSight)?data.companies[modal.idx]:null;
  const[co,setCo]=useState(existing?{...EMPTY_CO,...existing}:{...EMPTY_CO});
  const[sights,setSights]=useState(existing?.sightings||[{...EMPTY_SIGHT}]);
  const[ns,setNs]=useState({...EMPTY_SIGHT});
  const[rng,setRng]=useState(false);const[err,setErr]=useState(null);const[done,setDone]=useState(false);const[corr,setCorr]=useState(null);
  const[step,setStep]=useState("form");const[creRefs,setCreRefs]=useState([]);const[selRefs,setSelRefs]=useState({});
  const[minimized,setMinimized]=useState(false);const[searchStatus,setSearchStatus]=useState(null); // null | "searching" | "done" | "failed"

  const upd=(k,v)=>setCo(p=>({...p,[k]:v}));
  const updS=(i,k,v)=>{const n=[...sights];n[i]={...n[i],[k]:v};setSights(n)};
  const togR=i=>setSelRefs(p=>({...p,[i]:!p[i]}));

  const doR=async()=>{
    if(!co.name.trim())return;setRng(true);setErr(null);setDone(false);setCorr(null);
    try{
      const r=await doResearch(co.name.trim());
      if(r.correctedName&&r.correctedName.toLowerCase()!==co.name.trim().toLowerCase())setCorr(co.name.trim());
      const ws=r.website||co.website;
      setCo(p=>({...p,name:r.correctedName||p.name,description:r.description||p.description,category:CATEGORIES.includes(r.category)?r.category:p.category,focus:FOCUS.includes(r.focus)?r.focus:p.focus,series:SERIES.includes(r.series)?r.series:p.series,backers:r.backers||p.backers,valuation:r.valuation||p.valuation,totalRaised:r.totalRaised||p.totalRaised,hq:r.hq||p.hq,nycOffice:typeof r.nycOffice==="boolean"?r.nycOffice:p.nycOffice,employeeCount:r.employeeCount||p.employeeCount,website:ws,adAgency:r.adAgency||p.adAgency,sources:r._sources||[],logoUrl:getLogo(ws)}));
      setDone(true);
    }catch(e){setErr("Research failed — fill manually.");console.error(e)}setRng(false);
  };

  const handleAdd=()=>{
    if(!isEdit&&!isSight&&co.name.trim()){
      // Save company immediately, search for creatives in background
      doSave([]);
      setSearchStatus("searching");
      searchCreatives(co.name.trim()).then(r=>{
        if(r&&r.length>0){setCreRefs(r);setSearchStatus("done")}
        else setSearchStatus("failed");
      }).catch(()=>setSearchStatus("failed"));
    } else doSave([]);
  };
  const doSave=(approved)=>{
    const companies=[...(data.companies||[])];
    if(isSight){const c={...companies[modal.idx]};c.sightings=[...(c.sightings||[]),ns];c.lastUpdated=new Date().toISOString();companies[modal.idx]=c}
    else{const entry={...co,adRefs:[...(co.adRefs||[]),...(approved||[])],sightings:isEdit?(existing?.sightings||[]):sights,lastUpdated:new Date().toISOString()};if(isEdit)companies[modal.idx]=entry;else companies.push(entry)}
    save({...data,companies});close();
  };
  const handleDel=()=>{if(!confirm("Delete?"))return;const c=[...data.companies];c.splice(modal.idx,1);save({...data,companies:c});close()};
  const photoH=t=>e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{if(t==="new")setNs(p=>({...p,photoDataUrl:ev.target.result}));else updS(t,"photoDataUrl",ev.target.result)};r.readAsDataURL(f)};

  // Floating minimized card shown after saving while search runs
  if(minimized&&searchStatus){
    return <div style={{position:"fixed",bottom:24,right:24,zIndex:1200,background:P.card,border:`1px solid ${P.brd}`,borderRadius:16,padding:"14px 18px",boxShadow:"0 4px 20px rgba(0,0,0,0.12)",display:"flex",alignItems:"center",gap:12,minWidth:260}}>
      {searchStatus==="searching"&&<><div style={{width:14,height:14,border:`2.5px solid ${P.sage}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/><span style={{fontSize:13,fontFamily:F.body,color:P.sage,flex:1}}>Searching {co.name} creatives…</span></>}
      {searchStatus==="done"&&<><span style={{fontSize:16}}>✓</span><span style={{fontSize:13,fontFamily:F.body,color:P.sageD,flex:1}}>{creRefs.length} ad refs found for {co.name}</span><Btn small primary onClick={()=>setMinimized(false)}>Review</Btn></>}
      {searchStatus==="failed"&&<><span style={{fontSize:16}}>—</span><span style={{fontSize:13,fontFamily:F.body,color:P.mu,flex:1}}>No creatives found for {co.name}</span></>}
      <button onClick={()=>setSearchStatus(null)} style={{background:"none",border:"none",cursor:"pointer",color:P.mu,fontSize:16,padding:"0 2px",lineHeight:1}}>×</button>
    </div>
  }

  // If search is done and user restores, show review step
  if(!minimized&&searchStatus==="done"&&creRefs.length>0&&step==="form"){
    return <div style={{position:"fixed",inset:0,background:"rgba(44,42,37,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={()=>setMinimized(true)}>
      <div onClick={e=>e.stopPropagation()} style={{background:P.card,borderRadius:20,border:`1px solid ${P.brdL}`,width:"100%",maxWidth:640,maxHeight:"88vh",overflow:"auto",padding:28,boxShadow:"0 8px 40px rgba(0,0,0,0.08)"}}>
        <SL>Ad References — {co.name}</SL>
        <p style={{fontSize:13,color:P.mu,margin:"0 0 14px",lineHeight:1.5}}>Found {creRefs.length} potential reference{creRefs.length>1?"s":""}. Select any to attach to this company.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:18,maxHeight:300,overflow:"auto"}}>
          {creRefs.map((r,i)=>{const on=selRefs[i];return <div key={i} onClick={()=>togR(i)} style={{display:"flex",gap:10,padding:"10px 14px",background:on?P.sageBg:P.white,border:`1px solid ${on?P.sage:P.brd}`,borderRadius:12,cursor:"pointer",alignItems:"center",transition:"all .15s"}}>
            <div style={{width:18,height:18,borderRadius:6,border:`2px solid ${on?P.sage:P.brd}`,background:on?P.sage:P.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{color:"#fff",fontSize:11}}>✓</span>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,color:P.tx,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.title}</div>
              <div style={{display:"flex",gap:5,marginTop:3}}><Tag color={r.confidence==="high"?P.sage:r.confidence==="medium"?P.gold:P.mu}>{r.confidence}</Tag><Tag color={P.mu}>{r.type}</Tag></div>
            </div>
          </div>})}
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>{setSearchStatus(null);close()}}>Skip</Btn>
          <Btn primary onClick={()=>{
            const approved=creRefs.filter((_,i)=>selRefs[i]);
            if(approved.length>0){
              const companies=[...(data.companies||[])];
              const idx=companies.length-1; // just added company is last
              companies[idx]={...companies[idx],adRefs:[...(companies[idx].adRefs||[]),...approved]};
              save({...data,companies});
            }
            setSearchStatus(null);close();
          }}>Attach {Object.values(selRefs).filter(Boolean).length>0?Object.values(selRefs).filter(Boolean).length+" refs":""}</Btn>
        </div>
      </div>
    </div>
  }

  return <div style={{position:"fixed",inset:0,background:"rgba(44,42,37,0.3)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={close}>
    <div onClick={e=>e.stopPropagation()} style={{background:P.card,borderRadius:20,border:`1px solid ${P.brdL}`,width:"100%",maxWidth:640,maxHeight:"88vh",overflow:"auto",padding:28,boxShadow:"0 8px 40px rgba(0,0,0,0.08)"}}>


      {step==="form"&&<>
      {isSight?<>
        <h3 style={{fontFamily:F.head,fontSize:19,fontWeight:700,margin:"0 0 18px"}}>Add Sighting — {existing?.name}</h3>
        <SightFields s={ns} onChange={(k,v)=>setNs(p=>({...p,[k]:v}))} onPhoto={photoH("new")}/>
      </>:<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h3 style={{fontFamily:F.head,fontSize:19,fontWeight:700,margin:0}}>{isEdit?"Edit":"Add"} Company</h3>
          <button onClick={()=>setMinimized(true)} title="Minimize" style={{background:"none",border:`1px solid ${P.brd}`,borderRadius:8,width:28,height:28,cursor:"pointer",color:P.mu,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>–</button>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"end",marginBottom:done||err||rng?8:14}}>
          {co.logoUrl&&done&&<img src={co.logoUrl} alt="" onError={e=>e.target.style.display="none"} style={{width:42,height:42,borderRadius:10,objectFit:"contain",border:`1px solid ${P.brd}`,background:P.white,padding:4,flexShrink:0}}/>}
          <div style={{flex:1}}><Inp label="Company Name" value={co.name} onChange={v=>{upd("name",v);setDone(false);setErr(null)}} ph="Perplexity, Jasper, Harvey AI…"/></div>
          <button onClick={doR} disabled={rng||!co.name.trim()} style={{padding:"10px 18px",borderRadius:12,border:"none",fontFamily:F.head,fontSize:12,fontWeight:600,cursor:rng||!co.name.trim()?"not-allowed":"pointer",background:rng?P.bg2:P.sage,color:rng?P.mu:P.white,whiteSpace:"nowrap",flexShrink:0,height:42,letterSpacing:.3,transition:"all .2s"}}>{rng?"Researching…":"Auto-Research"}</button>
        </div>
        {rng&&<div style={{background:P.sageBg,border:`1px solid ${P.sage}22`,borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:14,height:14,border:`2.5px solid ${P.sage}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/><span style={{fontSize:13,color:P.sage}}>Searching <strong>{co.name}</strong>…</span>
        </div>}
        {done&&!rng&&<div style={{background:P.sageBg,border:`1px solid ${P.sage}22`,borderRadius:12,padding:"10px 14px",marginBottom:14}}><span style={{fontSize:13,color:P.sage}}>✓ Auto-filled.{corr&&<span> Fixed "<em>{corr}</em>" → <strong>{co.name}</strong>.</span>}</span></div>}
        {err&&<div style={{background:P.errBg,border:`1px solid ${P.err}22`,borderRadius:12,padding:"10px 14px",marginBottom:14}}><span style={{fontSize:13,color:P.err}}>{err}</span></div>}

        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          <Inp label="Description" value={co.description} onChange={v=>upd("description",v)} ta ph="What they do…"/>
          <Sel label="Category" value={co.category} onChange={v=>upd("category",v)} options={CATEGORIES} half/>
          <Sel label="Target" value={co.focus} onChange={v=>upd("focus",v)} options={FOCUS} half/>
          <Sel label="Stage" value={co.series} onChange={v=>upd("series",v)} options={SERIES} half/>
          <Sel label="Strategic Intent" value={co.strategicIntent} onChange={v=>upd("strategicIntent",v)} options={INTENTS} half/>
          <Inp label="Valuation" value={co.valuation} onChange={v=>upd("valuation",v)} ph="1.5B, 200M" mono half/>
          <Inp label="Total Raised" value={co.totalRaised} onChange={v=>upd("totalRaised",v)} ph="350M" mono half/>
          <Inp label="Key Backers" value={co.backers} onChange={v=>upd("backers",v)} ph="a16z, Sequoia"/>
          <Inp label="HQ" value={co.hq} onChange={v=>upd("hq",v)} ph="San Francisco, CA" half/>
          <Inp label="Employees" value={co.employeeCount} onChange={v=>upd("employeeCount",v)} ph="~200" half/>
          <Inp label="Website" value={co.website} onChange={v=>upd("website",v)} ph="perplexity.ai" half/>
          <Inp label="Ad Agency" value={co.adAgency} onChange={v=>upd("adAgency",v)} ph="Outfront Media" half/>
          <div style={{display:"flex",alignItems:"center",gap:8,width:"100%"}}><input type="checkbox" checked={co.nycOffice} onChange={e=>upd("nycOffice",e.target.checked)} style={{accentColor:P.sage,width:16,height:16}}/><span style={{fontSize:13,color:P.mu}}>NYC office</span></div>
        </div>

        <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${P.brd}`}}>
          <SL>Creative & Messaging</SL>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            <Inp label="Tagline" value={co.tagline} onChange={v=>upd("tagline",v)} ph='"Search reinvented"'/>
            <ToneSel sel={co.messagingTone||[]} onChange={v=>upd("messagingTone",v)}/>
            <Inp label="Key Vocabulary" value={co.keyVocabulary} onChange={v=>upd("keyVocabulary",v)} ph="productivity, easy, fast"/>
            <Inp label="Visual Notes" value={co.visualDescription} onChange={v=>upd("visualDescription",v)} ta ph="Colors, fonts, imagery…"/>
          </div>
        </div>

        {!isEdit&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,marginBottom:10}}>
            <SL>Initial Sighting(s)</SL><Btn small onClick={()=>setSights([...sights,{...EMPTY_SIGHT}])}>+ More</Btn>
          </div>
          {sights.map((s,i)=><div key={i} style={{paddingTop:i?12:0,marginTop:i?12:0,borderTop:i?`1px solid ${P.brd}`:"none"}}>
            {sights.length>1&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontFamily:F.head,fontSize:10,fontWeight:600,color:P.muL}}>Sighting #{i+1}</span><button onClick={()=>setSights(sights.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:P.err,fontSize:11,fontFamily:F.body,cursor:"pointer"}}>Remove</button></div>}
            <SightFields s={s} onChange={(k,v)=>updS(i,k,v)} onPhoto={photoH(i)}/>
          </div>)}
        </>}
      </>}

      <div style={{display:"flex",justifyContent:"space-between",marginTop:22}}>
        <div>{isEdit&&<Btn danger small onClick={handleDel}>Delete</Btn>}</div>
        <div style={{display:"flex",gap:8}}><Btn onClick={close}>Cancel</Btn><Btn primary onClick={handleAdd}>{isSight?"Add Sighting":isEdit?"Save":"Add Company"}</Btn></div>
      </div>
      </>}
    </div>
  </div>
}
