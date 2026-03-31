import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { supabase } from "./supabase";

const C = {
  bg:"#0a0e1a",card:"#131a2e",cardL:"#1a2340",accent:"#00e5ff",accentDk:"#0091a1",
  gold:"#ffd700",goldDk:"#c5a300",green:"#00e676",red:"#ff5252",orange:"#ffab40",
  purple:"#b388ff",pink:"#ff80ab",text:"#f0f4ff",muted:"#7b8cad",border:"#1f2b4a",
};
const ADMIN_PASS="ingresarios2024";
const UCOL=["#00e5ff","#ffd700","#00e676","#b388ff","#ff80ab","#ffab40","#ff5252","#64ffda","#ea80fc","#ffd740"];
const fmt=(v:any)=>{if(v>=1e6)return`$${(v/1e6).toFixed(1)}M`;if(v>=1e3)return`$${(v/1e3).toFixed(1)}K`;return`$${v.toLocaleString()}`};
const fmtF=(v:any)=>`$${Number(v).toLocaleString("es-CO")}`;
const td=()=>new Date().toISOString().split("T")[0];
const ws=(d:any)=>{const dt=new Date(d+"T12:00:00");const dy=dt.getDay();dt.setDate(dt.getDate()-(dy===0?6:dy-1));return dt.toISOString().split("T")[0]};
const DAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const Btn=({children,onClick,style,disabled,...p}: any)=>(
  <button onClick={onClick} disabled={disabled} style={{border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:10,fontWeight:600,transition:"all 0.2s",opacity:disabled?0.5:1,...style}}
    onMouseOver={e=>{if(!disabled){e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.filter="brightness(1.1)"}}}
    onMouseOut={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.filter="brightness(1)"}} {...p}>{children}</button>
);

const Logo=({size="lg"}: any)=>{
  const s=size==="lg"?{i:64,t:38,sub:14,g:12}:size==="md"?{i:40,t:24,sub:11,g:8}:{i:28,t:16,sub:9,g:6};
  return(
    <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:s.g}}>
      <div style={{width:s.i,height:s.i,borderRadius:s.i*0.25,display:"flex",alignItems:"center",justifyContent:"center",
        background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,boxShadow:`0 4px 24px ${C.gold}44`,
        fontSize:s.i*0.45,fontWeight:900,color:C.bg,fontFamily:"'Segoe UI',system-ui,sans-serif"}}>G</div>
      <div>
        <div style={{fontSize:s.t,fontWeight:900,letterSpacing:2,lineHeight:1,background:`linear-gradient(135deg,${C.text},${C.gold})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GENY B</div>
        <div style={{fontSize:s.sub,fontWeight:600,letterSpacing:4,color:C.gold,marginTop:2,textTransform:"uppercase"}}>by INGRESARIOS</div>
      </div>
    </div>
  );
};

const Input=({label,value,onChange,placeholder,type="text",mono,hint,...p}: any)=>(
  <div>
    {label&&<label style={{color:C.muted,fontSize:12,marginBottom:4,display:"block"}}>{label}</label>}
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      style={{width:"100%",padding:"12px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:mono?13:15,outline:"none",boxSizing:"border-box",fontFamily:mono?"monospace":"inherit"}} {...p}/>
    {hint&&<div style={{color:C.muted,fontSize:11,marginTop:4}}>{hint}</div>}
  </div>
);

const StatusBadge=({status,msg,onClose}: any)=>{
  if(!msg||status==="idle")return null;
  const colors:any={syncing:C.accent,ok:C.green,error:C.red,info:C.accent};
  const icons:any={syncing:"⏳",ok:"✅",error:"❌",info:"ℹ️"};
  return(
    <div style={{padding:"8px 16px",background:colors[status]+"12",color:colors[status],fontSize:12,fontWeight:600,textAlign:"center",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={onClose}>
      {icons[status]} {msg} {status!=="syncing"&&<span style={{opacity:0.6}}>(cerrar)</span>}
    </div>
  );
};

export default function App(){
  console.log("[App] Rendering...");
  const [screen,setScreen]=useState("splash");
  const [user,setUser]=useState<any>(null); // {name,email,ghlContactId}
  const [entries,setEntries]=useState<any[]>([]);
  const [allEntries,setAllEntries]=useState<any[]>([]);
  const [allUsers,setAllUsers]=useState<any[]>([]);
  const [loginEmail,setLoginEmail]=useState("");
  const [regName,setRegName]=useState("");const [regEmail,setRegEmail]=useState("");const [regProf,setRegProf]=useState("");
  const [amount,setAmount]=useState("");
  const [view,setView]=useState("dia");
  const [goal,setGoal]=useState(20000);
  const [showCheckin,setShowCheckin]=useState(false);
  const [animPct,setAnimPct]=useState(0);
  const [syncSt,setSyncSt]=useState("idle");const [syncMsg,setSyncMsg]=useState("");
  const [splashOp,setSplashOp]=useState(0);
  const [adminPass,setAdminPass]=useState("");
  const [adminView,setAdminView]=useState("consolidated");
  const [selectedUser,setSelectedUser]=useState<any>(null);
  const [adminPeriod,setAdminPeriod]=useState("dia");
  const [loginLoading,setLoginLoading]=useState(false);
  const [loginError,setLoginError]=useState("");
  const [loginMode,setLoginMode]=useState("login"); // login | register

  // === LOAD ===
  useEffect(()=>{
    console.log("[App] useEffect Load starting...");
    (async()=>{
      let hasUser=false;
      try{
        console.log("[App] Checking for stored user...");
        const u = localStorage.getItem("cobro-user");
        if(u){
          const parsed = JSON.parse(u);
          // fetch from supabase to verify
          const {data: prof} = await supabase.from('profiles').select('*').eq('email', parsed.email).maybeSingle();
          if (prof) {
              const fullU = {id: prof.id, name: prof.full_name, email: prof.email, profession: prof.profession};
              setUser(fullU);
              localStorage.setItem("cobro-user", JSON.stringify(fullU));
              hasUser=true;
              
              const {data: myE} = await supabase.from('entries').select('*').eq('user_id', prof.id);
              if (myE) setEntries(myE);
          }
        }
      }catch(e){
        console.error("[App] Error loading user:", e);
      }
      try{const g=localStorage.getItem("cobro-goal");if(g)setGoal(Number(g))}catch{}
      await loadShared();
      setTimeout(()=>setSplashOp(1),100);
      setTimeout(()=>{setSplashOp(0);setTimeout(()=>setScreen(hasUser?"main":"login"),600)},2800);
    })();
  },[]);

  const loadShared=async()=>{
    try{
        const {data: profs} = await supabase.from('profiles').select('*');
        if(profs) setAllUsers(profs.map(p=>({id:p.id, name:p.full_name, email:p.email, profession:p.profession})));
        
        const {data: allE} = await supabase.from('entries').select('*, profiles(email, full_name)');
        if(allE) setAllEntries(allE.map(e=>({...e, userEmail: e.profiles?.email, userName: e.profiles?.full_name})));
    }catch{}
  };

  const handleLogin=async()=>{
    if(!loginEmail.trim())return;
    setLoginLoading(true);setLoginError("");
    try{
      const {data: contact} = await supabase.from('profiles').select('*').eq('email', loginEmail.trim()).maybeSingle();
      if(!contact){setLoginError("Email no registrado. ¿Eres nuevo? Regístrate primero.");setLoginLoading(false);return}
      const u={id: contact.id, name:`${contact.full_name||""}`.trim()||contact.email,email:contact.email,profession:contact.profession||""};
      setUser(u);localStorage.setItem("cobro-user",JSON.stringify(u));
      setLoginEmail("");setScreen("main");
      const {data: myE} = await supabase.from('entries').select('*').eq('user_id', u.id);
      if(myE) setEntries(myE);
      await loadShared();
    }catch(err: any){setLoginError(`Error intern: ${err.message}`)}
    setLoginLoading(false);
  };

  const handleRegister=async()=>{
    if(!regName.trim()||!regEmail.trim()||!regProf.trim())return;
    setLoginLoading(true);setLoginError("");
    try{
      const {data: existing} = await supabase.from('profiles').select('id').eq('email', regEmail.trim()).maybeSingle();
      if(existing){setLoginError("Este email ya está registrado. Inicia sesión.");setLoginLoading(false);return}
      
      const {data: newP, error} = await supabase.from('profiles').insert([{full_name: regName.trim(), email: regEmail.trim(), profession: regProf.trim()}]).select().single();
      if (error) throw error;
      
      const u={id: newP.id, name:newP.full_name,email:newP.email,profession:newP.profession};
      setUser(u);localStorage.setItem("cobro-user",JSON.stringify(u));
      setEntries([]);
      setRegName("");setRegEmail("");setRegProf("");setScreen("main");await loadShared();
    }catch(err: any){setLoginError(`Error: ${err.message}`)}
    setLoginLoading(false);
  };

  const myTotal=entries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0);
  const globalTotal=allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0);
  const targetPct=Math.min((myTotal/goal)*100,100);
  useEffect(()=>{const t=setTimeout(()=>setAnimPct(targetPct),100);return()=>clearTimeout(t)},[targetPct]);

  const handleCheckin=async()=>{
    const val=parseFloat(amount.replace(/[^0-9.]/g,""));if(!val||val<=0)return;
    const now=new Date();
    const ts = now.getTime();
    const entry={user_id: user.id, amount:val,date:td(),time:now.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),ts};
    const {data, error} = await supabase.from('entries').insert([entry]).select().single();
    if (!error && data) {
         setEntries([...entries,data]);
         setAllEntries([...allEntries, {...data, userEmail: user.email, userName: user.name}]);
         
         // Enviar al Webhook de FOMO
         try {
           await fetch("https://kbgvfrwgycayhuneuyfo.supabase.co/functions/v1/fomo-webhook", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               name: user.name,
               occupation: user.profession || "Miembro",
               amount: `${val} usd`
             })
           });
         } catch(e) {
           console.error("Error enviando webhook FOMO", e);
         }
    }
    setAmount("");setShowCheckin(false);
  };



  const handleGoal=async (v: number)=>{setGoal(v);localStorage.setItem("cobro-goal",String(v));};
  const handleLogout=async()=>{setUser(null);setScreen("login");setLoginMode("login");localStorage.removeItem("cobro-user");};
  const handleAdminLogin=async()=>{if(adminPass===ADMIN_PASS){await loadShared();setScreen("admin")}else{alert("Clave incorrecta")}};
  const handleDelete=async (id: string)=>{
      const {error} = await supabase.from('entries').delete().eq('id', id);
      if(!error) {
          setEntries(entries.filter(e=>e.id!==id));
          setAllEntries(allEntries.filter(e=>e.id!==id));
      }
  };

  const buildDay=(src: any[])=>src.filter(e=>e.date===td()).map(e=>({name:e.time||"",valor:e.amount}));
  const buildWeek=(src: any[])=>{const w=ws(td());return DAYS.map((d,i)=>{const dt=new Date(w+"T12:00:00");dt.setDate(dt.getDate()+i);const k=dt.toISOString().split("T")[0];return{name:d,valor:src.filter(e=>e.date===k).reduce((s,e)=>s+e.amount,0)}})};
  const buildMonth=(src: any[])=>{const mk=td().slice(0,7);const[y,m]=mk.split("-").map(Number);const dim=new Date(y,m,0).getDate();return Array.from({length:dim},(_,i)=>{const k=`${mk}-${String(i+1).padStart(2,"0")}`;return{name:String(i+1),valor:src.filter(e=>e.date===k).reduce((s,e)=>s+e.amount,0)}})};
  const getChart=(v: string,src: any[])=>v==="dia"?buildDay(src):v==="semana"?buildWeek(src):buildMonth(src);

  const getUserPie=()=>{
    const p=adminPeriod;
    const src=p==="dia"?allEntries.filter(e=>e.date===td()):p==="semana"?(()=>{const w=ws(td());const end=new Date(w+"T12:00:00");end.setDate(end.getDate()+6);return allEntries.filter(e=>e.date>=w&&e.date<=end.toISOString().split("T")[0])})():allEntries.filter(e=>e.date?.startsWith(td().slice(0,7)));
    const map: any={};src.forEach(e=>{const k=e.userName||e.userEmail||"?";map[k]=(map[k]||0)+e.amount});
    return Object.entries(map).map(([name,value]: any,i)=>({name,value,fill:UCOL[i%UCOL.length]}));
  };

  const tColor=animPct<33?C.red:animPct<66?C.orange:C.green;

  const ps: any={background:C.bg,minHeight:"100vh",fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.text};

  const ChartBlock=({data,period,height=200}: any)=>(
    data.every((d:any)=>d.valor===0)?<div style={{textAlign:"center",padding:"30px 0",color:C.muted}}>Sin datos aún 💪</div>:
    period==="mes"?(
      <ResponsiveContainer width="100%" height={height}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="name" tick={{fill:C.muted,fontSize:10}} interval={4}/><YAxis tick={{fill:C.muted,fontSize:10}} tickFormatter={fmt} width={48}/><Tooltip formatter={v=>fmtF(v)} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}}/><Line type="monotone" dataKey="valor" stroke={C.accent} strokeWidth={2} dot={{fill:C.accent,r:3}}/></LineChart></ResponsiveContainer>
    ):(
      <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke={C.border}/><XAxis dataKey="name" tick={{fill:C.muted,fontSize:10}}/><YAxis tick={{fill:C.muted,fontSize:10}} tickFormatter={fmt} width={48}/><Tooltip formatter={v=>fmtF(v)} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}}/><Bar dataKey="valor" radius={[6,6,0,0]}>{data.map((e:any,i:number)=><Cell key={i} fill={e.valor>0?C.accent:C.border}/>)}</Bar></BarChart></ResponsiveContainer>
    )
  );

  const Tabs=({items,active,onSelect,color=C.gold}: any)=>(
    <div style={{display:"flex",gap:3,background:C.card,borderRadius:10,padding:3,border:`1px solid ${C.border}`}}>
      {items.map(([k,l]: any)=><Btn key={k} onClick={()=>onSelect(k)} style={{flex:1,padding:"9px 0",background:active===k?color+"18":"transparent",color:active===k?color:C.muted,fontSize:13,fontWeight:active===k?700:400,borderRadius:8}}>{l}</Btn>)}
    </div>
  );

  // ===== SPLASH =====
  if(screen==="splash")return(
    <div style={{...ps,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at center,${C.cardL} 0%,${C.bg} 70%)`,opacity:splashOp,transition:"opacity 0.8s"}}>
      <Logo size="lg"/>
      <div style={{marginTop:40,display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:4,background:C.gold,animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
      <div style={{marginTop:16,fontSize:13,color:C.muted,letterSpacing:2}}>CARGANDO</div>
      <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
    </div>
  );

  // ===== LOGIN / REGISTER =====
  if(screen==="login")return(
    <div style={{...ps,display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at top,${C.cardL} 0%,${C.bg} 60%)`}}>
      <div style={{width:"100%",maxWidth:420,padding:"0 20px"}}>
        <div style={{marginBottom:32}}><Logo size="lg"/></div>
        <div style={{background:C.card,borderRadius:20,padding:"28px 24px",border:`1px solid ${C.border}`,boxShadow:`0 20px 60px rgba(0,0,0,0.4)`}}>
          {/* Toggle login/register */}
          <div style={{display:"flex",gap:3,marginBottom:20,background:C.bg,borderRadius:10,padding:3}}>
            <Btn onClick={()=>{setLoginMode("login");setLoginError("")}} style={{flex:1,padding:"10px 0",background:loginMode==="login"?C.gold+"20":"transparent",color:loginMode==="login"?C.gold:C.muted,fontSize:14,borderRadius:8}}>Iniciar Sesión</Btn>
            <Btn onClick={()=>{setLoginMode("register");setLoginError("")}} style={{flex:1,padding:"10px 0",background:loginMode==="register"?C.green+"20":"transparent",color:loginMode==="register"?C.green:C.muted,fontSize:14,borderRadius:8}}>Registrarse</Btn>
          </div>

          {loginMode==="login"?(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{textAlign:"center",marginBottom:4}}>
                <div style={{fontSize:28,marginBottom:6}}>👋</div>
                <p style={{color:C.muted,fontSize:13,margin:0}}>Ingresa tu email registrado</p>
              </div>
              <Input label="Email" value={loginEmail} onChange={(e:any)=>setLoginEmail(e.target.value)} placeholder="tu@email.com" type="email" onKeyDown={(e:any)=>e.key==="Enter"&&handleLogin()}/>
              {loginError&&<div style={{padding:"8px 12px",borderRadius:8,background:C.red+"12",color:C.red,fontSize:12,fontWeight:600}}>{loginError}</div>}
              <Btn onClick={handleLogin} disabled={loginLoading} style={{padding:14,marginTop:4,background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,color:C.bg,fontSize:16,borderRadius:12}}>
                {loginLoading?"Verificando...":"Entrar 🚀"}
              </Btn>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:28,marginBottom:8}}>✨</div>
                <p style={{color:C.muted,fontSize:13,lineHeight:"1.5",maxWidth:"280px",margin:"0 auto"}}>
                  Usa el mismo correo con el que te inscribiste al entrenamiento para vincular tu cuenta.
                </p>
              </div>
              <Input label="Nombre completo" value={regName} onChange={(e:any)=>setRegName(e.target.value)} placeholder="Tu nombre completo"/>
              <Input label="Email" value={regEmail} onChange={(e:any)=>setRegEmail(e.target.value)} placeholder="tu@email.com" type="email"/>
              <Input label="Profesión" value={regProf} onChange={(e:any)=>setRegProf(e.target.value)} placeholder="Ej: Trader, Empresario, Ingeniero..." onKeyDown={(e:any)=>e.key==="Enter"&&handleRegister()}/>
              {loginError&&<div style={{padding:"8px 12px",borderRadius:8,background:C.red+"12",color:C.red,fontSize:12,fontWeight:600}}>{loginError}</div>}
              <Btn onClick={handleRegister} disabled={loginLoading} style={{padding:14,marginTop:4,background:`linear-gradient(135deg,${C.green},#00a854)`,color:C.bg,fontSize:16,borderRadius:12}}>
                {loginLoading?"Creando cuenta...":"Registrarme ✨"}
              </Btn>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:20}}>
          <Btn onClick={()=>setScreen("adminlogin")} style={{background:"transparent",color:C.muted,fontSize:12,padding:"8px 14px",border:`1px solid ${C.border}`}}>🔐 Admin</Btn>
        </div>
      </div>
    </div>
  );

  // ===== ADMIN LOGIN =====
  if(screen==="adminlogin")return(
    <div style={{...ps,display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at top,${C.cardL} 0%,${C.bg} 60%)`}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 20px"}}>
        <div style={{marginBottom:32}}><Logo size="md"/></div>
        <div style={{background:C.card,borderRadius:20,padding:"28px 24px",border:`1px solid ${C.border}`}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:32,marginBottom:8}}>🛡️</div>
            <h2 style={{fontSize:20,fontWeight:700,margin:0}}>Panel Admin</h2>
            <p style={{color:C.muted,fontSize:13,margin:"6px 0 0"}}>Clave de administrador</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Input value={adminPass} onChange={(e:any)=>setAdminPass(e.target.value)} placeholder="Clave" type="password" onKeyDown={(e:any)=>e.key==="Enter"&&handleAdminLogin()}/>
            <Btn onClick={handleAdminLogin} style={{padding:14,background:`linear-gradient(135deg,${C.purple},#7c4dff)`,color:"white",fontSize:16,borderRadius:12}}>Acceder 🛡️</Btn>
            <Btn onClick={()=>setScreen("login")} style={{padding:10,background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontSize:13}}>← Volver</Btn>
          </div>
        </div>
      </div>
    </div>
  );



  // ===== ADMIN PANEL =====
  if(screen==="admin"){
    const pie=getUserPie();const totalAll=pie.reduce((s:number,p:any)=>s+p.value,0);
    const selSrc=selectedUser?allEntries.filter(e=>e.userEmail===selectedUser):allEntries;
    const selChart=getChart(adminPeriod,selSrc);const selTotal=selChart.reduce((s,d)=>s+d.valor,0);
    const selName=selectedUser?allUsers.find(u=>u.email===selectedUser)?.name||selectedUser:"Todos";
    const activeToday=[...new Set(allEntries.filter(e=>e.date===td()).map(e=>e.userEmail))].length;
    return(
      <div style={{...ps,paddingBottom:32}}>
        <div style={{background:C.card,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.purple},#7c4dff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🛡️</div>
            <div><div style={{fontWeight:700,fontSize:14}}>Panel Admin</div><div style={{color:C.muted,fontSize:11}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</div></div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <Btn onClick={()=>setScreen("ghlsetup")} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 8px",fontSize:14}}>⚙️</Btn>
            <Btn onClick={()=>{setScreen("login");setAdminPass("")}} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 10px",fontSize:11}}>Salir</Btn>
          </div>
        </div>
        <div style={{maxWidth:700,margin:"0 auto",padding:"16px"}}>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            {[["Total Hoy",fmtF(allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0)),C.gold],["Usuarios",allUsers.length,C.accent],["Activos Hoy",activeToday,C.green]].map(([l,v,c]: any,i: number)=>(
              <div key={i} style={{background:C.card,borderRadius:12,padding:14,textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{color:C.muted,fontSize:11}}>{l}</div><div style={{fontSize:20,fontWeight:800,color:c,marginTop:4}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:14}}><Tabs items={[["consolidated","📊 Consolidado"],["byuser","👥 Por Usuario"]]} active={adminView} onSelect={(v:any)=>{setAdminView(v);setSelectedUser(null)}} color={C.purple}/></div>
          <div style={{marginBottom:14}}><Tabs items={[["dia","Día"],["semana","Semana"],["mes","Mes"]]} active={adminPeriod} onSelect={setAdminPeriod}/></div>

          {adminView==="consolidated"?(
            <>
              <div style={{background:C.card,borderRadius:14,padding:20,marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14,color:C.gold}}>Distribución por Usuario</div>
                {pie.length===0?<div style={{textAlign:"center",padding:"30px 0",color:C.muted}}>Sin datos</div>:(
                  <><ResponsiveContainer width="100%" height={200}>
                    <PieChart><Pie data={pie} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2} label={({name,percent}:any)=>`${name} ${(percent*100).toFixed(0)}%`} style={{fontSize:11}}>{pie.map((p:any,i:number)=><Cell key={i} fill={p.fill}/>)}</Pie><Tooltip formatter={v=>fmtF(v)} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text}}/></PieChart>
                  </ResponsiveContainer>
                  <div style={{fontSize:18,fontWeight:800,color:C.gold,textAlign:"center",marginTop:8}}>Total: {fmtF(totalAll)}</div></>
                )}
              </div>
              <div style={{background:C.card,borderRadius:14,padding:"18px 10px 10px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:14,paddingLeft:8,color:C.muted}}>Tendencia Consolidada</div>
                <ChartBlock data={selChart} period={adminPeriod}/>
              </div>
            </>
          ):(
            <>
              <div style={{background:C.card,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:C.accent}}>👥 Usuarios ({allUsers.length})</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <div onClick={()=>setSelectedUser(null)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:!selectedUser?C.purple+"18":C.bg,borderRadius:8,cursor:"pointer",border:`1px solid ${!selectedUser?C.purple+"44":"transparent"}`}}>
                    <span style={{fontWeight:600,fontSize:13}}>📊 Todos</span>
                    <span style={{color:C.gold,fontWeight:700,fontSize:13}}>{fmtF(allEntries.filter(e=>e.date===td()).reduce((s,e)=>s+e.amount,0))}</span>
                  </div>
                  {allUsers.map((u,i)=>{
                    const ut=allEntries.filter(e=>e.userEmail===u.email&&e.date===td()).reduce((s,e)=>s+e.amount,0);
                    const sel=selectedUser===u.email;
                    return(<div key={u.email} onClick={()=>setSelectedUser(sel?null:u.email)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:sel?UCOL[i%UCOL.length]+"18":C.bg,borderRadius:8,cursor:"pointer",border:`1px solid ${sel?UCOL[i%UCOL.length]+"44":"transparent"}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:4,background:UCOL[i%UCOL.length]}}/><div><div style={{fontWeight:600,fontSize:13}}>{u.name}</div><div style={{color:C.muted,fontSize:11}}>{u.profession?`${u.profession} · `:""}{u.email}</div></div></div>
                      <span style={{color:UCOL[i%UCOL.length],fontWeight:700,fontSize:13}}>{fmtF(ut)}</span>
                    </div>);
                  })}
                </div>
              </div>
              <div style={{background:C.card,borderRadius:14,padding:"18px 10px 10px",border:`1px solid ${C.border}`,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingLeft:8,marginBottom:14}}><div style={{fontSize:13,fontWeight:600,color:C.muted}}>{selName}</div><div style={{fontSize:16,fontWeight:800,color:C.accent}}>{fmtF(selTotal)}</div></div>
                <ChartBlock data={selChart} period={adminPeriod}/>
              </div>
              {selectedUser&&(()=>{const ue=allEntries.filter(e=>e.userEmail===selectedUser&&e.date===td());if(!ue.length)return null;return(
                <div style={{background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:C.muted}}>Cobros hoy ({ue.length})</div>
                  {ue.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.bg,borderRadius:8,marginBottom:4}}><span style={{fontWeight:600,color:C.green,fontSize:13}}>{fmtF(e.amount)}</span><span style={{color:C.muted,fontSize:11}}>{e.time}</span></div>)}
                </div>)})()}
            </>
          )}
          <div style={{textAlign:"center",marginTop:24,opacity:0.5}}><Logo size="sm"/></div>
        </div>
      </div>
    );
  }

  // ===== MAIN =====
  const todayEntries=entries.filter(e=>e.date===td());
  const chartData=getChart(view,entries);const viewTotal=chartData.reduce((s,d)=>s+d.valor,0);

  return(
    <div style={{...ps,paddingBottom:32}}>
      <div style={{background:C.card,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.gold},${C.goldDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:C.bg}}>G</div>
          <div><div style={{fontWeight:700,fontSize:14}}>Hola, {user.name}</div><div style={{color:C.muted,fontSize:11}}>{new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Btn onClick={handleLogout} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,padding:"5px 10px",fontSize:11}}>Salir</Btn>
        </div>
      </div>

      <StatusBadge status={syncSt} msg={syncMsg} onClose={()=>{setSyncMsg("");setSyncSt("idle")}}/>

      <div style={{maxWidth:600,margin:"0 auto",padding:"16px"}}>
        {/* Global banner */}
        <div style={{background:`linear-gradient(135deg,${C.purple}15,${C.accent}10)`,borderRadius:12,padding:"12px 16px",marginBottom:14,border:`1px solid ${C.purple}33`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:11,color:C.purple,fontWeight:600}}>🌍 TOTAL GLOBAL HOY</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{[...new Set(allEntries.filter(e=>e.date===td()).map(e=>e.userEmail))].length} usuarios activos</div></div>
          <div style={{fontSize:22,fontWeight:800,color:C.purple}}>{fmtF(globalTotal)}</div>
        </div>

        {/* Thermometer */}
        <div style={{background:`linear-gradient(145deg,${C.card},${C.cardL})`,borderRadius:16,padding:22,marginBottom:14,textAlign:"center",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:4}}>Mi cobro hoy</div>
          <div style={{fontSize:36,fontWeight:900,color:tColor,marginBottom:2,transition:"color 0.5s",textShadow:`0 0 20px ${tColor}44`}}>{fmtF(myTotal)}</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:18}}>Meta: {fmtF(goal)}</div>
          <div style={{position:"relative",height:28,borderRadius:14,background:C.bg,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{height:"100%",borderRadius:14,width:`${animPct}%`,background:`linear-gradient(90deg,${C.red},${animPct>50?C.orange:C.red},${animPct>80?C.green:animPct>50?C.orange:C.red})`,transition:"width 1s cubic-bezier(0.4,0,0.2,1)",boxShadow:`0 0 16px ${tColor}55`}}/>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontWeight:800,fontSize:13,color:C.text,textShadow:"0 1px 4px rgba(0,0,0,0.9)"}}>{Math.round(animPct)}%</div>
          </div>
          <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:14,flexWrap:"wrap"}}>
            {[20000,50000,100000,500000].map(g=><Btn key={g} onClick={()=>handleGoal(g)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${goal===g?C.gold:C.border}`,background:goal===g?C.gold+"18":"transparent",color:goal===g?C.gold:C.muted,fontSize:11}}>{fmt(g)}</Btn>)}
          </div>
        </div>

        {!showCheckin?<Btn onClick={()=>setShowCheckin(true)} style={{width:"100%",padding:18,borderRadius:14,background:`linear-gradient(135deg,${C.green},#00a854)`,color:C.bg,fontSize:20,fontWeight:800,marginBottom:14,boxShadow:`0 6px 24px ${C.green}33`}}>💵 ¡Ya Cobré!</Btn>:(
          <div style={{background:C.card,borderRadius:14,padding:18,marginBottom:14,border:`1px solid ${C.green}33`}}>
            <div style={{fontSize:15,fontWeight:700,marginBottom:10}}>💵 Registrar cobro</div>
            <div style={{display:"flex",gap:8}}>
              <input value={amount} onChange={(e:any)=>setAmount(e.target.value)} placeholder="Valor" type="number" autoFocus style={{flex:1,padding:"12px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bg,color:C.text,fontSize:18,outline:"none"}} onKeyDown={(e:any)=>e.key==="Enter"&&handleCheckin()}/>
              <Btn onClick={handleCheckin} style={{padding:"12px 18px",background:C.green,color:C.bg,fontSize:14,fontWeight:800}}>✓</Btn>
              <Btn onClick={()=>{setShowCheckin(false);setAmount("")}} style={{padding:"12px 14px",background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontSize:14}}>✕</Btn>
            </div>
          </div>
        )}

        {todayEntries.length>0&&<div style={{background:C.card,borderRadius:14,padding:14,marginBottom:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:C.muted}}>Mis cobros hoy ({todayEntries.length})</div>
          {todayEntries.map((e:any)=><div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",background:C.bg,borderRadius:8,marginBottom:4}}>
            <div><span style={{fontWeight:700,color:C.green}}>{fmtF(e.amount)}</span><span style={{color:C.muted,fontSize:11,marginLeft:8}}>{e.time}</span></div>
            <Btn onClick={()=>handleDelete(e.id)} style={{background:"transparent",border:"none",color:C.muted,fontSize:15,padding:"2px 6px"}}>×</Btn>
          </div>)}
        </div>}

        <div style={{marginBottom:14}}><Tabs items={[["dia","📅 Día"],["semana","📊 Semana"],["mes","📈 Mes"]]} active={view} onSelect={setView}/></div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:C.card,borderRadius:12,padding:14,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:11,marginBottom:3}}>Total {view==="dia"?"hoy":view==="semana"?"semana":"mes"}</div><div style={{fontSize:20,fontWeight:800,color:C.accent}}>{fmtF(viewTotal)}</div></div>
          <div style={{background:C.card,borderRadius:12,padding:14,textAlign:"center",border:`1px solid ${C.border}`}}><div style={{color:C.muted,fontSize:11,marginBottom:3}}>Promedio</div><div style={{fontSize:20,fontWeight:800,color:C.orange}}>{fmtF(view==="dia"?(todayEntries.length?myTotal/todayEntries.length:0):(chartData.filter((d:any)=>d.valor>0).length?viewTotal/chartData.filter((d:any)=>d.valor>0).length:0))}</div></div>
        </div>

        <div style={{background:C.card,borderRadius:14,padding:"18px 10px 10px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:14,paddingLeft:8,color:C.muted}}>{view==="dia"?"Cobros del día":view==="semana"?"Resumen semanal":MONTHS[new Date().getMonth()]}</div>
          <ChartBlock data={chartData} period={view}/>
        </div>
        <div style={{textAlign:"center",marginTop:24,opacity:0.5}}><Logo size="sm"/></div>
      </div>
    </div>
  );
}
