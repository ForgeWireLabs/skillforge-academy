import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Activity, BarChart3, Bell, BookOpen, Bookmark, Brain, CalendarDays, Check,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, ClipboardCheck, Clock3, Download, Flame, Gauge, GraduationCap, Home,
  Layers3, Menu, Moon, NotebookPen, Play, Plus, RotateCcw, Search, Settings, ShieldCheck,
  Sparkles, Sun, Target, Trash2, Trophy, Upload, X, Zap
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadContent, bundledContent, type ContentBundle } from "./content";
import { ContentProvider, useContent } from "./ContentContext";
import { decryptBackup, encryptBackup } from "./backup";
import type { Attempt, CertId, Certification, LearnerState, Pbq, Question, View } from "./types";
import {
  initialState, pct, shuffle, formatTime, dateKey, questionsToday, applyStudyActivity,
  recordAnswer, scheduleCard, isCardDue, domainMastery, migrateState,
  activeProgress, patchProgress,
  buildNotifications, buildMockExam, scoreMock, gradePbq, MOCK_PASS, MOCK_DEFAULT_QUESTIONS,
  MOCK_DEFAULT_MINUTES, type MockItem
} from "./logic";

const Analytics = lazy(() => import("./Analytics"));

const nav: { id: View; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Command Center", icon: Home },
  { id: "learn", label: "Learning Paths", icon: BookOpen },
  { id: "practice", label: "Practice Lab", icon: Target },
  { id: "pbq", label: "PBQ Lab", icon: Sparkles },
  { id: "mock", label: "Mock Exam", icon: ClipboardCheck },
  { id: "flashcards", label: "Recall Deck", icon: Layers3 },
  { id: "analytics", label: "Performance", icon: BarChart3 },
  { id: "notes", label: "Notes & Saves", icon: NotebookPen },
  { id: "settings", label: "Preferences", icon: Settings }
];

function isTauri() { return "__TAURI_INTERNALS__" in window; }

async function readState(): Promise<LearnerState> {
  try {
    const saved = isTauri() ? await invoke<unknown>("load_state") : JSON.parse(localStorage.getItem("apex-state") || "{}");
    return migrateState(saved);
  } catch { return initialState; }
}

async function writeState(state: LearnerState) {
  if (isTauri()) await invoke("save_state", { state });
  else localStorage.setItem("apex-state", JSON.stringify(state));
}

async function exportData(state: LearnerState, passphrase: string) {
  const encrypted = await encryptBackup(state, passphrase);
  const blob = new Blob([encrypted], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // Filename prefix follows the rebrand; the .apexbackup extension is retained
  // so older backups and the import filter stay compatible.
  a.download = `skillforge-progress-${dateKey()}.apexbackup`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [state, setState] = useState<LearnerState>(initialState);
  const [content, setContent] = useState<ContentBundle>(bundledContent);
  const [ready, setReady] = useState(false);
  const [sidebar, setSidebar] = useState(() => typeof window === "undefined" || window.innerWidth > 760);
  const [palette, setPalette] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    Promise.all([readState(), loadContent()]).then(([s, c]) => { setState(s); setContent(c); setReady(true); });
  }, []);
  useEffect(() => { if (ready) writeState(state); }, [state, ready]);
  useEffect(() => { document.documentElement.dataset.theme = state.theme; }, [state.theme]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(p => !p); }
      if (e.key === "Escape") { setPalette(false); setNotifOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = (next: Partial<LearnerState>) => setState(s => ({ ...s, ...next }));
  // Navigate, and on a phone-width screen dismiss the slide-over drawer after picking.
  const selectView = (v: View) => { setView(v); if (typeof window !== "undefined" && window.innerWidth <= 760) setSidebar(false); };
  const attempts = state.attempts.filter(a => a.certId === state.activeCertId);
  const avg = attempts.length ? Math.round(attempts.reduce((a, x) => a + pct(x.score, x.total), 0) / attempts.length) : 0;
  const notifications = buildNotifications(state, content);
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => { if (ready) contentRef.current?.focus(); }, [view, ready]);

  if (!ready) return <div className="splash"><div className="brand-mark"><Zap /></div><h1>SkillForge Academy</h1><p>Preparing your workspace...</p></div>;

  return <ContentProvider value={content}><div className={`app ${sidebar ? "" : "collapsed"}`}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap /></div><div><b>SKILLFORGE</b><span>ACADEMY</span></div></div>
      <button className="collapse" aria-label={sidebar ? "Collapse sidebar" : "Expand sidebar"} onClick={() => setSidebar(!sidebar)}>{sidebar ? <ChevronLeft /> : <ChevronRight />}</button>
      <TrackSwitcher certs={content.certifications} activeCertId={state.activeCertId} onSelect={id => { setState(s => ({ ...s, activeCertId: id })); setView("dashboard"); }} />
      <nav aria-label="Primary navigation">{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} aria-current={view===item.id?"page":undefined} onClick={() => selectView(item.id)} title={item.label}><item.icon/><span>{item.label}</span></button>)}</nav>
      <div className="sidebar-card">
        <div className="mini-ring" style={{ "--value": `${avg}%` } as React.CSSProperties}><span>{avg}%</span></div>
        <div><b>Readiness</b><small>{attempts.length ? "Keep building" : "Take a baseline"}</small></div>
      </div>
      <div className="sidebar-foot"><ShieldCheck/><span>Private & offline</span></div>
    </aside>

    <main>
      <header>
        <button className="icon-btn mobile-menu" aria-label="Toggle navigation menu" onClick={() => setSidebar(!sidebar)}><Menu/></button>
        <button className="search" onClick={() => setPalette(true)} aria-label="Open search (Ctrl K)"><Search/><span>Search objectives, commands, ports...</span><kbd>Ctrl K</kbd></button>
        <div className="notif-wrap">
          <button className="icon-btn" aria-label={`Notifications (${notifications.length})`} aria-haspopup="true" aria-expanded={notifOpen} onClick={() => setNotifOpen(o => !o)}><Bell/>{notifications.length > 0 && <i className="badge">{notifications.length}</i>}</button>
          {notifOpen && <><div className="notif-scrim" onClick={() => setNotifOpen(false)}/><div className="notif-pop" role="dialog" aria-label="Notifications"><h4>Notifications</h4>{notifications.length ? notifications.map(n => <button key={n.id} onClick={() => { selectView(n.view); setNotifOpen(false); }}><Sparkles/><span>{n.text}</span><ChevronRight/></button>) : <p className="notif-empty">You're all caught up.</p>}</div></>}
        </div>
        <button className="profile" onClick={() => selectView("settings")}><span>{state.name.slice(0,2).toUpperCase()}</span><div><b>{state.name}</b><small>Exam candidate</small></div></button>
      </header>

      <section id="main-content" className="content" ref={contentRef} tabIndex={-1} aria-live="polite" aria-label={`${nav.find(item=>item.id===view)?.label} content`}>
        {view === "dashboard" && <Dashboard state={state} setView={setView} />}
        {view === "learn" && <Learn key={state.activeCertId} state={state} setState={setState} setView={setView} />}
        {view === "practice" && <Practice key={state.activeCertId} state={state} setState={setState} />}
        {view === "pbq" && <PbqLab key={state.activeCertId} activeCertId={state.activeCertId} />}
        {view === "mock" && <MockExam key={state.activeCertId} state={state} setState={setState} />}
        {view === "flashcards" && <Flashcards key={state.activeCertId} state={state} setState={setState} />}
        {view === "analytics" && <Suspense fallback={<div className="panel analytics-loading" role="status">Loading analytics…</div>}><Analytics state={state} /></Suspense>}
        {view === "notes" && <Notes state={state} setState={setState} />}
        {view === "settings" && <Preferences state={state} update={update} setState={setState} />}
      </section>
    </main>
    {palette && <CommandPalette activeCertId={state.activeCertId} onClose={() => setPalette(false)} onPick={v => { selectView(v); setPalette(false); }} />}
  </div></ContentProvider>;
}

function TrackSwitcher({ certs, activeCertId, onSelect }: { certs: Certification[]; activeCertId: CertId; onSelect: (id: CertId) => void }) {
  const [open, setOpen] = useState(false);
  const active = certs.find(c => c.id === activeCertId) ?? certs[0];
  if (!active) return null;
  const multi = certs.length > 1;
  return <div className={`track-switcher${open ? " open" : ""}`}>
    <button className="track-current" aria-haspopup={multi || undefined} aria-expanded={multi ? open : undefined} disabled={!multi} onClick={() => setOpen(o => !o)} title={`${active.name} (${active.vendor})`}>
      <GraduationCap/><div><b>{active.shortName} Track</b><small>{active.vendor}</small></div>{multi && <ChevronDown/>}
    </button>
    {open && multi && <div className="track-menu" role="menu" aria-label="Switch certification track">
      {certs.map(c => <button key={c.id} role="menuitem" className={c.id === activeCertId ? "active" : ""} onClick={() => { onSelect(c.id); setOpen(false); }}><b>{c.shortName} Track</b><small>{c.name}</small></button>)}
    </div>}
  </div>;
}

function CommandPalette({ activeCertId, onClose, onPick }: { activeCertId: CertId; onClose: () => void; onPick: (v: View) => void }) {
  const { domains, questions, flashcards } = useContent();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  type Cmd = { id: string; label: string; hint: string; view: View; icon: typeof Home };
  const items = useMemo<Cmd[]>(() => [
    ...nav.map(n => ({ id: `nav-${n.id}`, label: `Go to ${n.label}`, hint: "Navigation", view: n.id, icon: n.icon })),
    ...domains.filter(d => d.certId === activeCertId).map(d => ({ id: `dom-${d.id}`, label: d.name, hint: `${d.exam} learning path`, view: "learn" as View, icon: BookOpen })),
    ...questions.filter(q => q.certId === activeCertId).map(q => ({ id: `q-${q.id}`, label: q.objective, hint: `${q.exam} · ${q.difficulty} question`, view: "practice" as View, icon: Target })),
    ...flashcards.filter(f => f.certId === activeCertId).map(f => ({ id: `f-${f.id}`, label: f.front, hint: "Flashcard", view: "flashcards" as View, icon: Layers3 }))
  ], [domains, questions, flashcards, activeCertId]);

  const term = query.trim().toLowerCase();
  const results = (term ? items.filter(i => i.label.toLowerCase().includes(term) || i.hint.toLowerCase().includes(term)) : items).slice(0, 8);
  useEffect(() => { setActive(0); }, [query]);

  const choose = (c?: Cmd) => { if (c) onPick(c.view); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  return <div className="palette-backdrop" onClick={onClose}>
    <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={e => e.stopPropagation()}>
      <div className="palette-input"><Search/><input ref={inputRef} value={query} placeholder="Search objectives, domains, commands, cards..." onChange={e => setQuery(e.target.value)} onKeyDown={onKey}/><kbd>Esc</kbd></div>
      <div className="palette-results">{results.length ? results.map((c, i) => <button key={c.id} className={i === active ? "active" : ""} onMouseEnter={() => setActive(i)} onClick={() => choose(c)}><c.icon/><div><b>{c.label}</b><small>{c.hint}</small></div><ChevronRight/></button>) : <div className="palette-empty">No matches for "{query}"</div>}</div>
    </div>
  </div>;
}

function Dashboard({ state, setView }: { state: LearnerState; setView: (v: View) => void }) {
  const { domains, questions, flashcards } = useContent();
  const cert = state.activeCertId;
  const progress = activeProgress(state);
  const certDomains = domains.filter(d => d.certId === cert);
  const certQuestions = questions.filter(q => q.certId === cert);
  const certFlashcards = flashcards.filter(f => f.certId === cert);
  const certAttempts = state.attempts.filter(a => a.certId === cert);
  const attempted = certQuestions.filter(q => state.answered[q.id]?.attempts).length;
  const mastered = certQuestions.filter(q => state.answered[q.id]?.lastCorrect).length;
  const todayCount = questionsToday(progress);
  const avg = certAttempts.length ? Math.round(certAttempts.reduce((a, x) => a + pct(x.score, x.total), 0) / certAttempts.length) : 0;
  const trend = certAttempts.slice(-7).map((a, i) => ({ name: `Test ${i + 1}`, score: pct(a.score, a.total) }));
  const days = progress.targetDate ? Math.max(0, Math.ceil((new Date(progress.targetDate).getTime() - Date.now()) / 86400000)) : null;
  const domainData = certDomains.map(d => ({ ...d, mastery: domainMastery(certQuestions.filter(q => q.domain === d.id), state.answered) }));
  const nextDomain = [...domainData].sort((a,b) => a.mastery - b.mastery)[0];

  return <>
    <div className="page-title"><div><span className="eyebrow">YOUR STUDY COMMAND CENTER</span><h1>Ready to level up, {state.name.split(" ")[0]}?</h1><p>Build real troubleshooting instincts, one focused session at a time.</p></div><div className="date-pill"><CalendarDays/><span>{days === null ? "Set an exam date" : `${days} days to exam`}</span></div></div>
    <div className="hero-grid">
      <div className="hero-card glow-card">
        <div className="hero-copy"><span className="pill teal"><Sparkles/> SMART RECOMMENDATION</span><h2>Strengthen {nextDomain.name}</h2><p>Your current activity suggests this is the best place to earn the next chunk of exam readiness.</p><button className="primary" onClick={() => setView("practice")}><Play/> Start focused drill</button></div>
        <div className="hero-visual"><div className="orb"><Brain/><span>{nextDomain.mastery}%</span><small>mastery</small></div></div>
      </div>
      <div className="goal-card panel"><div className="panel-heading"><span>DAILY MISSION</span><Flame/></div><div className="goal-number"><b>{Math.min(todayCount, progress.dailyGoal)}</b><span>/ {progress.dailyGoal} today</span></div><div className="progress"><i style={{width:`${Math.min(100,pct(todayCount,progress.dailyGoal))}%`}}/></div><div className="streak"><Flame/><b>{progress.streak === 0 ? "Start your streak" : `${progress.streak} day streak`}</b><span>Consistency compounds.</span></div></div>
    </div>
    <div className="stats-grid">
      <Stat icon={Gauge} label="Overall readiness" value={`${avg}%`} sub={certAttempts.length ? `${certAttempts.length} exams completed` : "Baseline not taken"} color="blue"/>
      <Stat icon={CircleHelp} label="Questions explored" value={`${attempted}`} sub={`${mastered} currently mastered`} color="purple"/>
      <Stat icon={Layers3} label="Cards due" value={`${certFlashcards.filter(f => isCardDue(state.cardRatings[f.id])).length}`} sub="Spaced recall queue" color="amber"/>
      <Stat icon={Trophy} label="Best score" value={`${Math.max(0,...certAttempts.map(a => pct(a.score,a.total)))}%`} sub="Personal record" color="teal"/>
    </div>
    <div className="two-col">
      <div className="panel chart-panel"><div className="panel-title"><div><span>PERFORMANCE TREND</span><h3>Practice exam scores</h3></div><button className="text-btn" onClick={() => setView("analytics")}>Full report <ChevronRight/></button></div>{trend.length ? <ResponsiveContainer width="100%" height={230}><AreaChart data={trend}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#55a8ff" stopOpacity={.45}/><stop offset="95%" stopColor="#55a8ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area type="monotone" dataKey="score" stroke="#55a8ff" strokeWidth={3} fill="url(#scoreFill)"/></AreaChart></ResponsiveContainer> : <Empty message="Complete a practice session to reveal your trend." action="Start practice" onClick={() => setView("practice")}/>}</div>
      <div className="panel"><div className="panel-title"><div><span>DOMAIN MASTERY</span><h3>Objective coverage</h3></div></div><div className="domain-list">{domainData.slice(0,5).map(d => <div className="domain-row" key={d.id}><span className="domain-dot" style={{background:d.color}}/><div><b>{d.name}</b><small>{d.exam}</small></div><div className="thin-progress"><i style={{width:`${d.mastery}%`,background:d.color}}/></div><strong>{d.mastery}%</strong></div>)}</div></div>
    </div>
    <div className="disclaimer">SkillForge Academy is an independent study tool. CompTIA and A+ are trademarks of CompTIA, Inc. This product is not affiliated with or endorsed by CompTIA.</div>
  </>;
}

function Stat({ icon: Icon, label, value, sub, color }: { icon: typeof Gauge; label:string; value:string; sub:string; color:string }) {
  return <div className="stat-card panel"><div className={`stat-icon ${color}`}><Icon/></div><div><span>{label}</span><b>{value}</b><small>{sub}</small></div></div>;
}

function Learn({ state, setState, setView }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>>; setView:(v:View)=>void }) {
  const { certifications, domains, questions } = useContent();
  const cert = certifications.find(c => c.id === state.activeCertId) ?? certifications[0];
  const certDomains = domains.filter(d => d.certId === cert.id);
  const [exam, setExam] = useState<string>(cert.exams[0]?.id ?? "");
  const [selected, setSelected] = useState(certDomains.find(d => d.exam === exam)?.id ?? certDomains[0]?.id ?? "");
  const list = certDomains.filter(d => d.exam === exam);
  const active = certDomains.find(d => d.id === selected && d.exam === exam) || list[0];
  if (!active) return <><PageHead eyebrow="STRUCTURED CURRICULUM" title="Learning paths" subtitle="Move objective by objective."/><Empty message="No learning content is available for this track yet."/></>;
  const activeQuestions = questions.filter(q => q.domain === active.id);
  return <>
    <PageHead eyebrow="STRUCTURED CURRICULUM" title="Learning paths" subtitle="Move objective by objective. Every lesson connects concepts to technician decisions."/>
    <div className="segmented">{cert.exams.map(e => <button key={e.id} className={exam===e.id?"active":""} onClick={()=>{setExam(e.id);setSelected(certDomains.find(d=>d.exam===e.id)?.id ?? "")}}>{e.name?`${e.name} · ${e.id}`:e.id}</button>)}</div>
    <div className="learn-layout"><div className="domain-nav panel">{list.map((d,i) => { const qs=questions.filter(q=>q.domain===d.id); const done=qs.filter(q=>state.answered[q.id]?.lastCorrect).length; return <button key={d.id} className={active.id===d.id?"active":""} onClick={()=>setSelected(d.id)}><span className="domain-index" style={{color:d.color}}>{String(i+1).padStart(2,"0")}</span><div><b>{d.name}</b><small>{d.weight}% of exam · {done}/{qs.length} checked</small></div><ChevronRight/></button>})}</div>
      <div className="lesson panel"><div className="lesson-hero" style={{"--accent":active.color} as React.CSSProperties}><span>{active.exam} DOMAIN</span><h2>{active.name}</h2><p>{active.description}</p><div className="lesson-meta"><span><Target/> {active.weight}% exam weight</span><span><Clock3/> 30-45 min path</span></div></div><h3>What you'll master</h3><div className="topic-grid">{active.topics.map((t,i)=><div key={t}><span>{i+1}</span><div><b>{t}</b><small>Concepts, scenarios, and field notes</small></div><Check/></div>)}</div><h3>Knowledge checks</h3><div className="check-list">{activeQuestions.map(q=><div key={q.id}><div className={`status ${state.answered[q.id]?.lastCorrect ? "done":""}`}>{state.answered[q.id]?.lastCorrect?<Check/>:<CircleHelp/>}</div><div><b>{q.objective}</b><small>{q.difficulty} · Original practice scenario</small></div><button className="ghost" aria-label="Bookmark this question and open practice" onClick={()=>{setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks:s.bookmarks.concat(q.id)}));setView("practice")}}><Bookmark/></button></div>)}</div><button className="primary wide" onClick={()=>setView("practice")}><Play/> Practice this domain</button></div>
    </div>
  </>;
}

function Practice({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { certifications, domains, questions } = useContent();
  const cert = certifications.find(c => c.id === state.activeCertId) ?? certifications[0];
  const certQuestions = questions.filter(q => q.certId === cert.id);
  const [mode, setMode] = useState<"setup"|"active"|"results">("setup");
  const [exam, setExam] = useState<string>(cert.exams[0]?.id ?? "Mixed");
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string,number>>({});
  const [order, setOrder] = useState<Record<string,number[]>>({});
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(()=>{ if(mode!=="active") return; const t=setInterval(()=>setElapsed(x=>x+1),1000); return ()=>clearInterval(t); },[mode]);
  const start = () => {
    const pool=exam==="Mixed"?certQuestions:certQuestions.filter(q=>q.exam===exam);
    const picked=shuffle(pool).slice(0,Math.min(count,pool.length));
    const ord:Record<string,number[]>={}; picked.forEach(q=>{ord[q.id]=shuffle(q.options.map((_,i)=>i));});
    setSession(picked);setOrder(ord);setIndex(0);setAnswers({});setElapsed(0);setRevealed(false);setMode("active");
  };
  const finish = () => {
    const score=session.filter(q=>answers[q.id]===q.answer).length;
    const ds:Attempt["domainScores"]={}; session.forEach(q=>{ds[q.domain] ||= {correct:0,total:0};ds[q.domain].total++;if(answers[q.id]===q.answer)ds[q.domain].correct++;});
    const attempt:Attempt={id:crypto.randomUUID(),certId:state.activeCertId,date:new Date().toISOString(),exam,score,total:session.length,durationSec:elapsed,domainScores:ds};
    setState(s=>{
      const answered={...s.answered};
      session.forEach(q=>{answered[q.id]=recordAnswer(answered[q.id],answers[q.id]===q.answer);});
      const next=patchProgress(s,applyStudyActivity(activeProgress(s),session.length));
      return {...next,answered,attempts:[...s.attempts,attempt]};
    });
    setMode("results");
  };
  if(mode==="setup") return <><PageHead eyebrow="ADAPTIVE PRACTICE" title="Practice lab" subtitle="Choose a target, enter focus mode, and learn from every explanation."/><div className="setup-grid"><div className="panel setup-main"><h3>Build your session</h3><label>Exam track</label><div className="option-grid">{[...cert.exams.map(e=>e.id), "Mixed"].map(x=>{const meta=cert.exams.find(e=>e.id===x);return <button key={x} className={exam===x?"selected":""} onClick={()=>setExam(x)}><span>{x==="Mixed"?<Brain/>:<Activity/>}</span><b>{x==="Mixed"?"Mixed":(meta?.name||x)}</b><small>{x==="Mixed"?"All exams":x}</small></button>})}</div><label>Question count</label><div className="count-picker">{[5,10,15,20].map(x=><button key={x} className={count===x?"selected":""} onClick={()=>setCount(x)}>{x}</button>)}</div><button className="primary wide launch" onClick={start}><Play/> Launch session</button></div><div className="panel setup-side"><span className="pill purple"><Sparkles/> SESSION PREVIEW</span><h2>{Math.min(count,exam==="Mixed"?certQuestions.length:certQuestions.filter(q=>q.exam===exam).length)} questions</h2><div className="preview-row"><Clock3/><div><b>Estimated time</b><small>{Math.min(count,20)*1.5} minutes</small></div></div><div className="preview-row"><Target/><div><b>Coverage</b><small>{exam === "Mixed" ? `All ${cert.shortName} domains` : `Weighted ${exam} mix`}</small></div></div><div className="preview-row"><CircleHelp/><div><b>Learning mode</b><small>Explanations available after answering</small></div></div></div></div></>;
  if(mode==="results") { const score=session.filter(q=>answers[q.id]===q.answer).length; return <><PageHead eyebrow="SESSION COMPLETE" title="Your results" subtitle="Review what clicked and turn misses into your next study plan."/><div className="results panel"><div className={`result-ring ${pct(score,session.length)>=75?"pass":""}`}><b>{pct(score,session.length)}%</b><span>{score} of {session.length}</span></div><h2>{pct(score,session.length)>=75?"Strong work.":"Good baseline. Keep sharpening."}</h2><p>{pct(score,session.length)>=75?"Your decisions are trending toward exam readiness.":"Review the explanations below, then run a focused domain drill."}</p><div className="result-actions"><button className="primary" onClick={()=>setMode("setup")}><RotateCcw/> New session</button></div></div><div className="review-list">{session.map((q,i)=>{const ok=answers[q.id]===q.answer;return <div className={`panel review ${ok?"correct":"wrong"}`} key={q.id}><span>{ok?<Check/>:<X/>}</span><div><small>QUESTION {i+1} · {q.objective}</small><b>{q.prompt}</b><p><strong>Your answer:</strong> {q.options[answers[q.id]] || "Unanswered"}</p>{!ok&&<p><strong>Correct:</strong> {q.options[q.answer]}</p>}<em>{q.explanation}</em></div></div>})}</div></>; }
  const q=session[index]; const selected=answers[q.id]; const isLast=index===session.length-1;
  return <div className="exam-shell"><div className="exam-top"><button className="ghost" onClick={()=>setMode("setup")}><X/> Exit</button><div><span>QUESTION {index+1} OF {session.length}</span><div className="exam-progress"><i style={{width:`${pct(index+1,session.length)}%`}}/></div></div><div className="timer"><Clock3/>{formatTime(elapsed)}</div></div><div className="question-card panel"><div className="question-meta"><span>{q.exam}</span><span>{domains.find(d=>d.id===q.domain)?.name}</span><span>{q.difficulty}</span><button className={state.bookmarks.includes(q.id)?"saved":""} aria-label={state.bookmarks.includes(q.id)?"Remove bookmark":"Bookmark this question"} aria-pressed={state.bookmarks.includes(q.id)} onClick={()=>setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks.filter(x=>x!==q.id):[...s.bookmarks,q.id]}))}><Bookmark/></button></div><h2>{q.prompt}</h2><div className="answers">{(order[q.id]||q.options.map((_,i)=>i)).map((oi,k)=>{const opt=q.options[oi];const cls=revealed?(oi===q.answer?"correct":selected===oi?"wrong":""):selected===oi?"selected":"";return <button key={oi} className={cls} disabled={revealed} aria-label={`Option ${String.fromCharCode(65+k)}: ${opt}`} onClick={()=>setAnswers(a=>({...a,[q.id]:oi}))}><span>{String.fromCharCode(65+k)}</span><b>{opt}</b>{revealed&&oi===q.answer&&<Check/>}{revealed&&selected===oi&&oi!==q.answer&&<X/>}</button>})}</div>{revealed&&<div className="explanation"><Sparkles/><div><b>{selected===q.answer?"Exactly right":"Key takeaway"}</b><p>{q.explanation}</p><small>OBJECTIVE · {q.objective}</small></div></div>}<div className="question-actions"><button className="ghost" disabled={index===0} onClick={()=>{setIndex(i=>i-1);setRevealed(false)}}><ChevronLeft/> Previous</button>{!revealed?<button className="primary" disabled={selected===undefined} onClick={()=>setRevealed(true)}>Check answer</button>:<button className="primary" onClick={()=>{if(isLast)finish();else{setIndex(i=>i+1);setRevealed(false)}}}>{isLast?"Finish session":"Next question"}<ChevronRight/></button>}</div></div></div>;
}

type PbqResponse = Record<string, string> | string[];

function PbqView({ pbq, response, onChange, revealed }: { pbq: Pbq; response: PbqResponse | undefined; onChange: (r: PbqResponse) => void; revealed?: boolean }) {
  if (pbq.kind === "matching") {
    const r = (response && !Array.isArray(response) ? response : {}) as Record<string, string>;
    return <div className="pbq-matching">{pbq.items.map(item => {
      const sel = r[item.id]; const correct = pbq.answer[item.id];
      const cls = revealed ? (sel === correct ? "correct" : "wrong") : "";
      return <div className={`pbq-row ${cls}`} key={item.id}>
        <b>{item.text}</b>
        <select value={sel || ""} disabled={revealed} aria-label={`Match ${item.text}`} onChange={e => onChange({ ...r, [item.id]: e.target.value })}>
          <option value="" disabled>Choose…</option>
          {pbq.targets.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        {revealed && sel !== correct && <small>Correct: {pbq.targets.find(t => t.id === correct)?.label}</small>}
      </div>;
    })}</div>;
  }
  const list = (Array.isArray(response) ? response : pbq.steps.map(s => s.id));
  const move = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= list.length) return; const next = [...list]; [next[i], next[j]] = [next[j], next[i]]; onChange(next); };
  return <div className="pbq-ordering">{list.map((sid, i) => {
    const step = pbq.steps.find(s => s.id === sid);
    const cls = revealed ? (pbq.answer[i] === sid ? "correct" : "wrong") : "";
    return <div className={`pbq-step ${cls}`} key={sid}>
      <span className="pbq-num">{i + 1}</span><b>{step?.text}</b>
      {!revealed && <span className="pbq-move"><button aria-label={`Move "${step?.text}" up`} disabled={i === 0} onClick={() => move(i, -1)}><ChevronUp/></button><button aria-label={`Move "${step?.text}" down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}><ChevronDown/></button></span>}
    </div>;
  })}{revealed && <small className="pbq-correct-order">Correct order: {pbq.answer.map(id => pbq.steps.find(s => s.id === id)?.text).join(" → ")}</small>}</div>;
}

function PbqLab({ activeCertId }: { activeCertId: CertId }) {
  const { certifications, domains, pbqs } = useContent();
  const cert = certifications.find(c => c.id === activeCertId) ?? certifications[0];
  const [exam, setExam] = useState<string>("All");
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string,PbqResponse>>({});
  const [revealed, setRevealed] = useState<Record<string,boolean>>({});
  const pool = pbqs.filter(p=>p.certId===cert.id && (exam==="All" || p.exam===exam));
  const active = pool[index];
  const score = active && revealed[active.id] ? Math.round(gradePbq(active, responses[active.id])*100) : null;
  const selectExam = (next:string) => { setExam(next); setIndex(0); };
  const next = (delta:number) => setIndex(i=>Math.max(0, Math.min(pool.length-1, i+delta)));

  return <><PageHead eyebrow="PERFORMANCE LAB" title="PBQ simulations" subtitle="Practice interactive technician tasks with immediate scoring and explanations."/>
    <div className="pbq-lab-controls panel" aria-label="PBQ filters">
      <div><b>Exam core</b><div className="count-picker">{["All", ...cert.exams.map(e=>e.id)].map(x=><button key={x} className={exam===x?"selected":""} aria-pressed={exam===x} onClick={()=>selectExam(x)}>{x}</button>)}</div></div>
      <div className="pbq-lab-progress"><b>{pool.length ? index+1 : 0} / {pool.length}</b><span>simulation</span></div>
    </div>
    {active ? <div className="question-card panel pbq-lab-card">
      <div className="question-meta"><span>{active.exam}</span><span>{domains.find(d=>d.id===active.domain)?.name}</span><span>{active.difficulty}</span></div>
      <h2>{active.prompt}</h2><PbqView pbq={active} response={responses[active.id]} onChange={r=>setResponses(all=>({...all,[active.id]:r}))} revealed={!!revealed[active.id]}/>
      {score!==null && <div className="explanation" role="status"><Sparkles/><div><b>{score}% earned</b><p>{active.explanation}</p><small>OBJECTIVE · {active.objective}</small></div></div>}
      <div className="question-actions"><button className="ghost" disabled={index===0} onClick={()=>next(-1)}><ChevronLeft/> Previous</button>
        {!revealed[active.id] ? <button className="primary" onClick={()=>setRevealed(r=>({...r,[active.id]:true}))}>Check simulation</button> : <button className="primary" disabled={index===pool.length-1} onClick={()=>next(1)}>Next simulation <ChevronRight/></button>}
      </div>
    </div> : <Empty message="No PBQ simulations are available for this exam."/>}
  </>;
}

function MockExam({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { certifications, domains, questions, pbqs } = useContent();
  const cert = certifications.find(c => c.id === state.activeCertId) ?? certifications[0];
  const certQuestions = questions.filter(q => q.certId === cert.id);
  const certPbqs = pbqs.filter(p => p.certId === cert.id);
  const certDomains = domains.filter(d => d.certId === cert.id);
  const firstExam = cert.exams[0];
  const [phase, setPhase] = useState<"setup"|"active"|"results">("setup");
  const [exam, setExam] = useState<string>(firstExam?.id ?? "");
  const [qCount, setQCount] = useState(firstExam?.defaultQuestions ?? MOCK_DEFAULT_QUESTIONS);
  const [minutes, setMinutes] = useState(firstExam?.defaultMinutes ?? MOCK_DEFAULT_MINUTES);
  const [requestedPbqs, setRequestedPbqs] = useState(3);
  const [items, setItems] = useState<MockItem[]>([]);
  const [index, setIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string,number>>({});
  const [responses, setResponses] = useState<Record<string,PbqResponse>>({});
  const [order, setOrder] = useState<Record<string,number[]>>({});
  const [remaining, setRemaining] = useState(0);
  const [grade, setGrade] = useState<ReturnType<typeof scoreMock>|null>(null);

  const availableMcq = certQuestions.filter(q=>q.exam===exam).length;
  const availablePbqs = certPbqs.filter(p=>p.exam===exam).length;
  const pbqCount = Math.min(availablePbqs, requestedPbqs);
  const plannedQ = Math.min(qCount, availableMcq);

  const finish = () => {
    const g = scoreMock(items, mcqAnswers, responses);
    const mcqItems = items.filter(it=>it.type==="mcq");
    const attempt: Attempt = { id: crypto.randomUUID(), certId: state.activeCertId, date: new Date().toISOString(), exam, score: Math.round(g.earned), total: g.total, durationSec: minutes*60 - remaining, domainScores: g.domainScores, kind: "mock", passed: g.passed };
    setState(s=>{
      const answered={...s.answered};
      mcqItems.forEach(it=>{ if(it.type==="mcq") answered[it.question.id]=recordAnswer(answered[it.question.id], mcqAnswers[it.question.id]===it.question.answer); });
      const next=patchProgress(s,applyStudyActivity(activeProgress(s), mcqItems.length));
      return {...next, answered, attempts:[...s.attempts, attempt]};
    });
    setGrade(g); setPhase("results");
  };
  const finishRef = useRef(finish); finishRef.current = finish;

  useEffect(()=>{ if(phase!=="active") return; const t=setInterval(()=>setRemaining(r=>Math.max(0,r-1)),1000); return ()=>clearInterval(t); },[phase]);
  useEffect(()=>{ if(phase==="active" && remaining<=0) finishRef.current(); },[phase,remaining]);

  const start = () => {
    const built = buildMockExam(certQuestions, certPbqs, certDomains, exam, plannedQ, pbqCount);
    const ord:Record<string,number[]>={}; const resp:Record<string,PbqResponse>={};
    built.forEach(it=>{
      if(it.type==="mcq") ord[it.question.id]=shuffle(it.question.options.map((_,i)=>i));
      else if(it.pbq.kind==="ordering") resp[it.pbq.id]=shuffle(it.pbq.steps.map(s=>s.id));
      else resp[it.pbq.id]={};
    });
    setItems(built); setOrder(ord); setResponses(resp); setMcqAnswers({}); setIndex(0); setRemaining(minutes*60); setGrade(null); setPhase("active");
  };

  const answeredCount = items.filter(it=> it.type==="mcq" ? mcqAnswers[it.question.id]!==undefined : true).length;

  if(phase==="setup") return <>
    <PageHead eyebrow="EXAM SIMULATION" title="Mock exam" subtitle="A full-length, timed, domain-weighted exam. No feedback until you submit — just like the real thing."/>
    <div className="setup-grid"><div className="panel setup-main"><h3>Configure your exam</h3>
      <label>Exam</label><div className="option-grid">{cert.exams.map(e=><button key={e.id} className={exam===e.id?"selected":""} onClick={()=>{setExam(e.id);setQCount(e.defaultQuestions);setMinutes(e.defaultMinutes);}}><span><Activity/></span><b>{e.id}</b><small>{e.name||cert.shortName}</small></button>)}</div>
      <label>Multiple-choice questions</label><div className="count-picker">{[30,60,90].map(x=><button key={x} className={qCount===x?"selected":""} aria-pressed={qCount===x} onClick={()=>setQCount(x)}>{x}</button>)}<input aria-label="Custom question count" type="number" min="10" max={availableMcq} value={qCount} onChange={e=>setQCount(Math.max(10, Number(e.target.value)||10))}/></div>
      <label>Performance-based questions</label><div className="count-picker">{[0,1,2,3].map(x=><button key={x} disabled={x>availablePbqs} className={requestedPbqs===x?"selected":""} aria-pressed={requestedPbqs===x} onClick={()=>setRequestedPbqs(x)}>{x}</button>)}</div>
      <label>Time limit (minutes)</label><div className="count-picker">{[30,60,90].map(x=><button key={x} className={minutes===x?"selected":""} aria-pressed={minutes===x} onClick={()=>setMinutes(x)}>{x}</button>)}<input aria-label="Custom time limit in minutes" type="number" min="15" max="240" value={minutes} onChange={e=>setMinutes(Math.max(15, Number(e.target.value)||15))}/></div>
      <button className="primary wide launch" onClick={start}><ClipboardCheck/> Begin mock exam</button></div>
      <div className="panel setup-side"><span className="pill purple"><Sparkles/> EXAM PREVIEW</span><h2>{plannedQ} questions</h2>
        <div className="preview-row"><Clock3/><div><b>Time limit</b><small>{minutes} minutes, counts down</small></div></div>
        <div className="preview-row"><ClipboardCheck/><div><b>Performance-based</b><small>{pbqCount ? `${pbqCount} PBQ${pbqCount>1?"s":""} first, then multiple choice` : "Multiple choice"}</small></div></div>
        <div className="preview-row"><Target/><div><b>Domain-weighted</b><small>Questions mirror exam objective weights</small></div></div>
        <div className="preview-row"><Gauge/><div><b>Passing score</b><small>{Math.round(MOCK_PASS*100)}% to pass</small></div></div>
      </div></div>
  </>;

  if(phase==="results" && grade) {
    const rows = Object.entries(grade.domainScores).map(([id,v])=>({ name: domains.find(d=>d.id===id)?.name.split(" ")[0]||id, score: pct(Math.round(v.correct), v.total), color: domains.find(d=>d.id===id)?.color||"#55a8ff" }));
    return <>
      <PageHead eyebrow="EXAM COMPLETE" title={grade.passed?"Passed":"Not yet"} subtitle="A full breakdown of your performance, domain by domain."/>
      <div className="results panel"><div className={`result-ring ${grade.passed?"pass":""}`}><b>{grade.pct}%</b><span>{Math.round(grade.earned)} / {grade.total}</span></div>
        <h2>{grade.passed?"You cleared the passing bar.":`${Math.round(MOCK_PASS*100)}% needed to pass.`}</h2>
        <p>{grade.passed?"Keep this consistency and you're exam ready.":"Review the misses below and drill your weakest domains."}</p>
        <div className="result-actions"><button className="primary" onClick={()=>setPhase("setup")}><RotateCcw/> New exam</button></div>
      </div>
      <div className="panel chart-panel"><div className="panel-title"><div><span>DOMAIN BREAKDOWN</span><h3>Score by domain</h3></div></div><ResponsiveContainer width="100%" height={Math.max(160, rows.length*42)}><BarChart data={rows} layout="vertical" margin={{left:15}}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis type="number" domain={[0,100]} stroke="var(--muted)"/><YAxis dataKey="name" type="category" width={80} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Bar dataKey="score" radius={[0,6,6,0]}>{rows.map(r=><Cell key={r.name} fill={r.color}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="review-list">{items.map((it,i)=>{
        if(it.type==="mcq"){ const q=it.question; const ok=mcqAnswers[q.id]===q.answer; return <div className={`panel review ${ok?"correct":"wrong"}`} key={q.id}><span>{ok?<Check/>:<X/>}</span><div><small>QUESTION {i+1} · {q.objective}</small><b>{q.prompt}</b><p><strong>Your answer:</strong> {q.options[mcqAnswers[q.id]]||"Unanswered"}</p>{!ok&&<p><strong>Correct:</strong> {q.options[q.answer]}</p>}<em>{q.explanation}</em></div></div>; }
        const p=it.pbq; const frac=gradePbq(p, responses[p.id]); const ok=frac===1; return <div className={`panel review ${ok?"correct":"wrong"}`} key={p.id}><span>{ok?<Check/>:<X/>}</span><div><small>PBQ {i+1} · {p.objective} · {Math.round(frac*100)}% credit</small><b>{p.prompt}</b><PbqView pbq={p} response={responses[p.id]} onChange={()=>{}} revealed/><em>{p.explanation}</em></div></div>;
      })}</div>
    </>;
  }

  const item = items[index]; const isLast = index===items.length-1;
  return <div className="exam-shell"><div className="exam-top">
    <button className="ghost" onClick={()=>{ if(window.confirm("End the exam now? It will be scored as-is.")) finish(); }}><X/> End</button>
    <div><span>{item.type==="pbq"?"PERFORMANCE-BASED":"QUESTION"} {index+1} OF {items.length} · {answeredCount} answered</span><div className="exam-progress"><i style={{width:`${pct(index+1,items.length)}%`}}/></div></div>
    <div className={`timer ${remaining<=60?"low":""}`}><Clock3/>{formatTime(remaining)}</div>
  </div>
  <div className="question-card panel">
    {item.type==="mcq" ? (()=>{ const q=item.question; const selected=mcqAnswers[q.id]; return <>
      <div className="question-meta"><span>{q.exam}</span><span>{domains.find(d=>d.id===q.domain)?.name}</span><span>{q.difficulty}</span></div>
      <h2>{q.prompt}</h2>
      <div className="answers">{(order[q.id]||q.options.map((_,i)=>i)).map((oi,k)=>{const cls=selected===oi?"selected":"";return <button key={oi} className={cls} aria-label={`Option ${String.fromCharCode(65+k)}: ${q.options[oi]}`} onClick={()=>setMcqAnswers(a=>({...a,[q.id]:oi}))}><span>{String.fromCharCode(65+k)}</span><b>{q.options[oi]}</b></button>})}</div>
    </>; })() : <>
      <div className="question-meta"><span>{item.pbq.exam}</span><span>{domains.find(d=>d.id===item.pbq.domain)?.name}</span><span className="pbq-tag">PBQ</span></div>
      <h2>{item.pbq.prompt}</h2>
      <PbqView pbq={item.pbq} response={responses[item.pbq.id]} onChange={r=>setResponses(prev=>({...prev,[item.pbq.id]:r}))}/>
    </>}
    <div className="question-actions"><button className="ghost" disabled={index===0} onClick={()=>setIndex(i=>i-1)}><ChevronLeft/> Previous</button>{isLast?<button className="primary" onClick={()=>{ if(window.confirm("Submit the exam for scoring?")) finish(); }}>Submit exam</button>:<button className="primary" onClick={()=>setIndex(i=>i+1)}>Next<ChevronRight/></button>}</div>
  </div></div>;
}

function Flashcards({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { domains, flashcards } = useContent();
  const certCards=flashcards.filter(f=>f.certId===state.activeCertId);
  const due=certCards.filter(f=>isCardDue(state.cardRatings[f.id]));
  const deck=due.length?due:certCards; const [index,setIndex]=useState(0); const [flipped,setFlipped]=useState(false);
  const rate=(id:string,rating:1|2|3|4)=>{setState(s=>({...s,cardRatings:{...s.cardRatings,[id]:scheduleCard(s.cardRatings[id],rating)}}));setIndex(i=>i+1);setFlipped(false);};
  if(!deck.length) return <><PageHead eyebrow="SPACED REPETITION" title="Recall deck" subtitle="Actively retrieve the answer, then rate your recall honestly."/><Empty message="No flashcards are available for this track yet."/></>;
  const card=deck[index%deck.length];
  return <><PageHead eyebrow="SPACED REPETITION" title="Recall deck" subtitle="Actively retrieve the answer, then rate your recall honestly."/><div className="deck-status"><div><b>{due.length}</b><span>due now</span></div><div><b>{certCards.filter(f=>state.cardRatings[f.id]).length}</b><span>in rotation</span></div><div><b>{certCards.length}</b><span>total cards</span></div></div><div className="flash-wrap"><div className={`flashcard ${flipped?"flipped":""}`} role="button" tabIndex={0} aria-pressed={flipped} aria-label={flipped?"Card answer shown. Activate to hide.":"Card prompt shown. Activate to reveal the answer."} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setFlipped(f=>!f);}}} onClick={()=>setFlipped(!flipped)}><div className="flash-face front"><span>{domains.find(d=>d.id===card.domain)?.name}</span><Brain/><h2>{card.front}</h2><small>Click card to reveal</small></div><div className="flash-face back"><span>ANSWER</span><Sparkles/><p>{card.back}</p><small>How well did you recall it?</small></div></div>{flipped?<div className="rating"><button onClick={()=>rate(card.id,1)}><span>Again</span><small>1 day</small></button><button onClick={()=>rate(card.id,2)}><span>Hard</span><small>Short interval</small></button><button onClick={()=>rate(card.id,3)}><span>Good</span><small>Growing interval</small></button><button onClick={()=>rate(card.id,4)}><span>Easy</span><small>Long interval</small></button></div>:<button className="primary" onClick={()=>setFlipped(true)}>Reveal answer</button>}<div className="deck-nav"><button aria-label="Previous card" onClick={()=>{setIndex(i=>Math.max(0,i-1));setFlipped(false)}}><ChevronLeft/></button><span>{index%deck.length+1} / {deck.length}</span><button aria-label="Next card" onClick={()=>{setIndex(i=>i+1);setFlipped(false)}}><ChevronRight/></button></div></div></>;
}

function Notes({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { questions } = useContent();
  const [active,setActive]=useState(state.notes[0]?.id||""); const [title,setTitle]=useState(""); const [body,setBody]=useState("");
  const open=(id:string)=>{const n=state.notes.find(x=>x.id===id);if(n){setActive(id);setTitle(n.title);setBody(n.body)}};
  const create=()=>{const id=crypto.randomUUID();const note={id,title:"New study note",body:"",updatedAt:new Date().toISOString()};setState(s=>({...s,notes:[note,...s.notes]}));setActive(id);setTitle(note.title);setBody("");};
  const save=()=>{if(!active)return;setState(s=>({...s,notes:s.notes.map(n=>n.id===active?{...n,title,body,updatedAt:new Date().toISOString()}:n)}));};
  const savedQs=questions.filter(q=>state.bookmarks.includes(q.id));
  return <><PageHead eyebrow="PERSONAL KNOWLEDGE BASE" title="Notes & saves" subtitle="Capture the details you tend to forget and keep difficult questions close."/><div className="notes-layout"><div className="panel notes-list"><div className="notes-head"><h3>Study notes</h3><button aria-label="Create a new note" onClick={create}><Plus/></button></div>{state.notes.map(n=><button className={active===n.id?"active":""} key={n.id} onClick={()=>open(n.id)}><NotebookPen/><div><b>{n.title}</b><small>{new Date(n.updatedAt).toLocaleDateString()}</small></div></button>)}{!state.notes.length&&<Empty message="Create your first note."/>}<h3 className="saved-heading">Saved questions</h3>{savedQs.map(q=><div className="saved-question" key={q.id}><Bookmark/><div><b>{q.objective}</b><small>{q.exam}</small></div></div>)}</div><div className="panel editor">{active?<><input value={title} onChange={e=>setTitle(e.target.value)} onBlur={save}/><textarea value={body} onChange={e=>setBody(e.target.value)} onBlur={save} placeholder="Write commands, mnemonics, troubleshooting steps, or explanations in your own words..."/><div className="editor-foot"><span>Saved automatically when you leave a field</span><button className="primary" onClick={save}><Check/> Save now</button></div></>:<Empty message="Select a note or create a new one to begin." action="New note" onClick={create}/>}</div></div></>;
}

function Preferences({ state, update, setState }: { state:LearnerState; update:(n:Partial<LearnerState>)=>void; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [passphrase, setPassphrase] = useState("");
  const [backupNotice, setBackupNotice] = useState("");
  const progress = activeProgress(state);
  const onExport = async () => {
    try {
      await exportData(state, passphrase);
      setPassphrase("");
      setBackupNotice("Encrypted backup created. Keep the passphrase somewhere safe; it cannot be recovered.");
    } catch (error) {
      setBackupNotice(error instanceof Error ? error.message : "The encrypted backup could not be created.");
    }
  };
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = await decryptBackup(text, passphrase);
      if (isTauri()) await invoke("import_state", { raw: JSON.stringify(parsed) });
      setState(migrateState(parsed));
      setPassphrase("");
      setBackupNotice("Backup imported. Your progress has been restored on this device.");
    } catch (error) {
      setBackupNotice(error instanceof Error ? error.message : "That backup could not be imported.");
    }
  };
  const onReset = async () => {
    if (!window.confirm("Reset all progress? This permanently clears your study history, notes, bookmarks, and card scheduling on this computer.")) return;
    if (isTauri()) { try { await invoke("reset_state"); } catch { /* file may not exist yet */ } }
    setState(migrateState({}));
  };
  return <><PageHead eyebrow="MAKE IT YOURS" title="Preferences" subtitle="Tune your study target, daily rhythm, and workspace."/><div className="settings-grid"><div className="panel settings-card"><div className="setting-icon"><GraduationCap/></div><div><h3>Learner profile</h3><p>This name appears throughout your workspace.</p><label>Display name<input value={state.name} onChange={e=>update({name:e.target.value})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><CalendarDays/></div><div><h3>Exam target</h3><p>Set a date to add a countdown to your dashboard.</p><label>Target date<input type="date" value={progress.targetDate} onChange={e=>setState(s=>patchProgress(s,{targetDate:e.target.value}))}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Target/></div><div><h3>Daily mission</h3><p>Choose a realistic question goal you can sustain.</p><label>Questions per day<input type="number" min="5" max="100" value={progress.dailyGoal} onChange={e=>setState(s=>patchProgress(s,{dailyGoal:Number(e.target.value)}))}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Moon/></div><div><h3>Appearance</h3><p>Switch the complete interface theme.</p><div className="theme-toggle"><button className={state.theme==="dark"?"active":""} aria-pressed={state.theme==="dark"} onClick={()=>update({theme:"dark"})}><Moon/> Dark</button><button className={state.theme==="light"?"active":""} aria-pressed={state.theme==="light"} onClick={()=>update({theme:"light"})}><Sun/> Light</button></div></div></div><div className="panel settings-card"><div className="setting-icon"><ShieldCheck/></div><div><h3>Encrypted backup</h3><p>Use the same passphrase to restore this portable backup on another device. Legacy plain JSON backups can still be imported.</p><label>Backup passphrase<input type="password" minLength={8} autoComplete="new-password" value={passphrase} onChange={e=>setPassphrase(e.target.value)} placeholder="At least 8 characters"/></label><div className="theme-toggle data-actions"><button onClick={onExport}><Download/> Export encrypted</button><button onClick={()=>fileRef.current?.click()}><Upload/> Import backup</button><button className="danger" onClick={onReset}><Trash2/> Reset progress</button></div>{backupNotice&&<span className="setting-notice" role="status">{backupNotice}</span>}<input ref={fileRef} type="file" accept="application/json,.json,.apexbackup" hidden onChange={onImport}/></div></div><div className="panel about-card"><div className="brand-mark"><Zap/></div><div><h3>SkillForge Academy</h3><p>Version 1.3.1 · Offline-first desktop edition</p><small>Your progress is stored locally on this computer. This independent educational app is not affiliated with or endorsed by CompTIA.</small></div></div></div></>;
}

function PageHead({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></div>; }
function Empty({message,action,onClick}:{message:string;action?:string;onClick?:()=>void}) { return <div className="empty"><Brain/><p>{message}</p>{action&&<button className="ghost" onClick={onClick}>{action}</button>}</div>; }
