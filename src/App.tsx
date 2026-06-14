import { useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Activity, BarChart3, Bell, BookOpen, Bookmark, Brain, CalendarDays, Check,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, Flame, Gauge, GraduationCap, Home,
  Layers3, Menu, Moon, NotebookPen, Play, Plus, RotateCcw, Search, Settings, ShieldCheck,
  Sparkles, Sun, Target, Trash2, Trophy, Upload, X, Zap
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadContent, bundledContent, type ContentBundle } from "./content";
import { ContentProvider, useContent } from "./ContentContext";
import type { Attempt, ExamCode, LearnerState, Question, View } from "./types";
import {
  initialState, pct, shuffle, formatTime, dateKey, questionsToday, applyStudyActivity,
  recordAnswer, scheduleCard, isCardDue, domainMastery, masteredCount, objectiveStats, migrateState,
  buildNotifications
} from "./logic";

const nav: { id: View; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Command Center", icon: Home },
  { id: "learn", label: "Learning Paths", icon: BookOpen },
  { id: "practice", label: "Practice Lab", icon: Target },
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

function exportData(state: LearnerState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `apex-progress-${dateKey()}.json`;
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
  const [sidebar, setSidebar] = useState(true);
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = (next: Partial<LearnerState>) => setState(s => ({ ...s, ...next }));
  const attempts = state.attempts;
  const avg = attempts.length ? Math.round(attempts.reduce((a, x) => a + pct(x.score, x.total), 0) / attempts.length) : 0;
  const notifications = buildNotifications(state, content);
  const contentRef = useRef<HTMLElement>(null);
  useEffect(() => { if (ready) contentRef.current?.focus(); }, [view, ready]);

  if (!ready) return <div className="splash"><div className="brand-mark"><Zap /></div><h1>Apex A+ Academy</h1><p>Preparing your workspace...</p></div>;

  return <ContentProvider value={content}><div className={`app ${sidebar ? "" : "collapsed"}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Zap /></div><div><b>APEX</b><span>A+ ACADEMY</span></div></div>
      <button className="collapse" aria-label={sidebar ? "Collapse sidebar" : "Expand sidebar"} onClick={() => setSidebar(!sidebar)}>{sidebar ? <ChevronLeft /> : <ChevronRight />}</button>
      <nav>{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)} title={item.label}><item.icon/><span>{item.label}</span></button>)}</nav>
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
          {notifOpen && <><div className="notif-scrim" onClick={() => setNotifOpen(false)}/><div className="notif-pop" role="dialog" aria-label="Notifications"><h4>Notifications</h4>{notifications.length ? notifications.map(n => <button key={n.id} onClick={() => { setView(n.view); setNotifOpen(false); }}><Sparkles/><span>{n.text}</span><ChevronRight/></button>) : <p className="notif-empty">You're all caught up.</p>}</div></>}
        </div>
        <button className="profile" onClick={() => setView("settings")}><span>{state.name.slice(0,2).toUpperCase()}</span><div><b>{state.name}</b><small>Exam candidate</small></div></button>
      </header>

      <section className="content" ref={contentRef} tabIndex={-1} aria-live="polite">
        {view === "dashboard" && <Dashboard state={state} setView={setView} />}
        {view === "learn" && <Learn state={state} setState={setState} setView={setView} />}
        {view === "practice" && <Practice state={state} setState={setState} />}
        {view === "flashcards" && <Flashcards state={state} setState={setState} />}
        {view === "analytics" && <Analytics state={state} />}
        {view === "notes" && <Notes state={state} setState={setState} />}
        {view === "settings" && <Preferences state={state} update={update} setState={setState} />}
      </section>
    </main>
    {palette && <CommandPalette onClose={() => setPalette(false)} onPick={v => { setView(v); setPalette(false); }} />}
  </div></ContentProvider>;
}

function CommandPalette({ onClose, onPick }: { onClose: () => void; onPick: (v: View) => void }) {
  const { domains, questions, flashcards } = useContent();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  type Cmd = { id: string; label: string; hint: string; view: View; icon: typeof Home };
  const items = useMemo<Cmd[]>(() => [
    ...nav.map(n => ({ id: `nav-${n.id}`, label: `Go to ${n.label}`, hint: "Navigation", view: n.id, icon: n.icon })),
    ...domains.map(d => ({ id: `dom-${d.id}`, label: d.name, hint: `${d.exam} learning path`, view: "learn" as View, icon: BookOpen })),
    ...questions.map(q => ({ id: `q-${q.id}`, label: q.objective, hint: `${q.exam} · ${q.difficulty} question`, view: "practice" as View, icon: Target })),
    ...flashcards.map(f => ({ id: `f-${f.id}`, label: f.front, hint: "Flashcard", view: "flashcards" as View, icon: Layers3 }))
  ], [domains, questions, flashcards]);

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
  const attempted = Object.keys(state.answered).length;
  const mastered = masteredCount(state.answered);
  const todayCount = questionsToday(state);
  const avg = state.attempts.length ? Math.round(state.attempts.reduce((a, x) => a + pct(x.score, x.total), 0) / state.attempts.length) : 0;
  const trend = state.attempts.slice(-7).map((a, i) => ({ name: `Test ${i + 1}`, score: pct(a.score, a.total) }));
  const days = state.targetDate ? Math.max(0, Math.ceil((new Date(state.targetDate).getTime() - Date.now()) / 86400000)) : null;
  const domainData = domains.map(d => ({ ...d, mastery: domainMastery(questions.filter(q => q.domain === d.id), state.answered) }));
  const nextDomain = [...domainData].sort((a,b) => a.mastery - b.mastery)[0];

  return <>
    <div className="page-title"><div><span className="eyebrow">YOUR STUDY COMMAND CENTER</span><h1>Ready to level up, {state.name.split(" ")[0]}?</h1><p>Build real troubleshooting instincts, one focused session at a time.</p></div><div className="date-pill"><CalendarDays/><span>{days === null ? "Set an exam date" : `${days} days to exam`}</span></div></div>
    <div className="hero-grid">
      <div className="hero-card glow-card">
        <div className="hero-copy"><span className="pill teal"><Sparkles/> SMART RECOMMENDATION</span><h2>Strengthen {nextDomain.name}</h2><p>Your current activity suggests this is the best place to earn the next chunk of exam readiness.</p><button className="primary" onClick={() => setView("practice")}><Play/> Start focused drill</button></div>
        <div className="hero-visual"><div className="orb"><Brain/><span>{nextDomain.mastery}%</span><small>mastery</small></div></div>
      </div>
      <div className="goal-card panel"><div className="panel-heading"><span>DAILY MISSION</span><Flame/></div><div className="goal-number"><b>{Math.min(todayCount, state.dailyGoal)}</b><span>/ {state.dailyGoal} today</span></div><div className="progress"><i style={{width:`${Math.min(100,pct(todayCount,state.dailyGoal))}%`}}/></div><div className="streak"><Flame/><b>{state.streak === 0 ? "Start your streak" : `${state.streak} day streak`}</b><span>Consistency compounds.</span></div></div>
    </div>
    <div className="stats-grid">
      <Stat icon={Gauge} label="Overall readiness" value={`${avg}%`} sub={state.attempts.length ? `${state.attempts.length} exams completed` : "Baseline not taken"} color="blue"/>
      <Stat icon={CircleHelp} label="Questions explored" value={`${attempted}`} sub={`${mastered} currently mastered`} color="purple"/>
      <Stat icon={Layers3} label="Cards due" value={`${flashcards.filter(f => isCardDue(state.cardRatings[f.id])).length}`} sub="Spaced recall queue" color="amber"/>
      <Stat icon={Trophy} label="Best score" value={`${Math.max(0,...state.attempts.map(a => pct(a.score,a.total)))}%`} sub="Personal record" color="teal"/>
    </div>
    <div className="two-col">
      <div className="panel chart-panel"><div className="panel-title"><div><span>PERFORMANCE TREND</span><h3>Practice exam scores</h3></div><button className="text-btn" onClick={() => setView("analytics")}>Full report <ChevronRight/></button></div>{trend.length ? <ResponsiveContainer width="100%" height={230}><AreaChart data={trend}><defs><linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#55a8ff" stopOpacity={.45}/><stop offset="95%" stopColor="#55a8ff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area type="monotone" dataKey="score" stroke="#55a8ff" strokeWidth={3} fill="url(#scoreFill)"/></AreaChart></ResponsiveContainer> : <Empty message="Complete a practice session to reveal your trend." action="Start practice" onClick={() => setView("practice")}/>}</div>
      <div className="panel"><div className="panel-title"><div><span>DOMAIN MASTERY</span><h3>Objective coverage</h3></div></div><div className="domain-list">{domainData.slice(0,5).map(d => <div className="domain-row" key={d.id}><span className="domain-dot" style={{background:d.color}}/><div><b>{d.name}</b><small>{d.exam}</small></div><div className="thin-progress"><i style={{width:`${d.mastery}%`,background:d.color}}/></div><strong>{d.mastery}%</strong></div>)}</div></div>
    </div>
    <div className="disclaimer">Apex A+ Academy is an independent study tool. CompTIA and A+ are trademarks of CompTIA, Inc. This product is not affiliated with or endorsed by CompTIA.</div>
  </>;
}

function Stat({ icon: Icon, label, value, sub, color }: { icon: typeof Gauge; label:string; value:string; sub:string; color:string }) {
  return <div className="stat-card panel"><div className={`stat-icon ${color}`}><Icon/></div><div><span>{label}</span><b>{value}</b><small>{sub}</small></div></div>;
}

function Learn({ state, setState, setView }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>>; setView:(v:View)=>void }) {
  const { domains, questions } = useContent();
  const [exam, setExam] = useState<ExamCode>("220-1201");
  const [selected, setSelected] = useState(domains[0].id);
  const list = domains.filter(d => d.exam === exam);
  const active = domains.find(d => d.id === selected && d.exam === exam) || list[0];
  const activeQuestions = questions.filter(q => q.domain === active.id);
  return <>
    <PageHead eyebrow="STRUCTURED CURRICULUM" title="Learning paths" subtitle="Move objective by objective. Every lesson connects concepts to technician decisions."/>
    <div className="segmented"><button className={exam==="220-1201"?"active":""} onClick={()=>{setExam("220-1201");setSelected("mobile")}}>Core 1 · 220-1201</button><button className={exam==="220-1202"?"active":""} onClick={()=>{setExam("220-1202");setSelected("os")}}>Core 2 · 220-1202</button></div>
    <div className="learn-layout"><div className="domain-nav panel">{list.map((d,i) => { const qs=questions.filter(q=>q.domain===d.id); const done=qs.filter(q=>state.answered[q.id]?.lastCorrect).length; return <button key={d.id} className={active.id===d.id?"active":""} onClick={()=>setSelected(d.id)}><span className="domain-index" style={{color:d.color}}>{String(i+1).padStart(2,"0")}</span><div><b>{d.name}</b><small>{d.weight}% of exam · {done}/{qs.length} checked</small></div><ChevronRight/></button>})}</div>
      <div className="lesson panel"><div className="lesson-hero" style={{"--accent":active.color} as React.CSSProperties}><span>{active.exam} DOMAIN</span><h2>{active.name}</h2><p>{active.description}</p><div className="lesson-meta"><span><Target/> {active.weight}% exam weight</span><span><Clock3/> 30-45 min path</span></div></div><h3>What you'll master</h3><div className="topic-grid">{active.topics.map((t,i)=><div key={t}><span>{i+1}</span><div><b>{t}</b><small>Concepts, scenarios, and field notes</small></div><Check/></div>)}</div><h3>Knowledge checks</h3><div className="check-list">{activeQuestions.map(q=><div key={q.id}><div className={`status ${state.answered[q.id]?.lastCorrect ? "done":""}`}>{state.answered[q.id]?.lastCorrect?<Check/>:<CircleHelp/>}</div><div><b>{q.objective}</b><small>{q.difficulty} · Original practice scenario</small></div><button className="ghost" aria-label="Bookmark this question and open practice" onClick={()=>{setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks:s.bookmarks.concat(q.id)}));setView("practice")}}><Bookmark/></button></div>)}</div><button className="primary wide" onClick={()=>setView("practice")}><Play/> Practice this domain</button></div>
    </div>
  </>;
}

function Practice({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { domains, questions } = useContent();
  const [mode, setMode] = useState<"setup"|"active"|"results">("setup");
  const [exam, setExam] = useState<ExamCode|"Mixed">("220-1201");
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string,number>>({});
  const [order, setOrder] = useState<Record<string,number[]>>({});
  const [revealed, setRevealed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(()=>{ if(mode!=="active") return; const t=setInterval(()=>setElapsed(x=>x+1),1000); return ()=>clearInterval(t); },[mode]);
  const start = () => {
    const pool=exam==="Mixed"?questions:questions.filter(q=>q.exam===exam);
    const picked=shuffle(pool).slice(0,Math.min(count,pool.length));
    const ord:Record<string,number[]>={}; picked.forEach(q=>{ord[q.id]=shuffle(q.options.map((_,i)=>i));});
    setSession(picked);setOrder(ord);setIndex(0);setAnswers({});setElapsed(0);setRevealed(false);setMode("active");
  };
  const finish = () => {
    const score=session.filter(q=>answers[q.id]===q.answer).length;
    const ds:Attempt["domainScores"]={}; session.forEach(q=>{ds[q.domain] ||= {correct:0,total:0};ds[q.domain].total++;if(answers[q.id]===q.answer)ds[q.domain].correct++;});
    const attempt:Attempt={id:crypto.randomUUID(),date:new Date().toISOString(),exam,score,total:session.length,durationSec:elapsed,domainScores:ds};
    setState(s=>{
      const answered={...s.answered};
      session.forEach(q=>{answered[q.id]=recordAnswer(answered[q.id],answers[q.id]===q.answer);});
      return {...s,answered,attempts:[...s.attempts,attempt],...applyStudyActivity(s,session.length)};
    });
    setMode("results");
  };
  if(mode==="setup") return <><PageHead eyebrow="ADAPTIVE PRACTICE" title="Practice lab" subtitle="Choose a target, enter focus mode, and learn from every explanation."/><div className="setup-grid"><div className="panel setup-main"><h3>Build your session</h3><label>Exam track</label><div className="option-grid">{(["220-1201","220-1202","Mixed"] as const).map(x=><button key={x} className={exam===x?"selected":""} onClick={()=>setExam(x)}><span>{x==="Mixed"?<Brain/>:x==="220-1201"?<Activity/>:<ShieldCheck/>}</span><b>{x}</b><small>{x==="Mixed"?"Both cores":"Focused objective mix"}</small></button>)}</div><label>Question count</label><div className="count-picker">{[5,10,15,20].map(x=><button key={x} className={count===x?"selected":""} onClick={()=>setCount(x)}>{x}</button>)}</div><button className="primary wide launch" onClick={start}><Play/> Launch session</button></div><div className="panel setup-side"><span className="pill purple"><Sparkles/> SESSION PREVIEW</span><h2>{Math.min(count,exam==="Mixed"?questions.length:questions.filter(q=>q.exam===exam).length)} questions</h2><div className="preview-row"><Clock3/><div><b>Estimated time</b><small>{Math.min(count,20)*1.5} minutes</small></div></div><div className="preview-row"><Target/><div><b>Coverage</b><small>{exam === "Mixed" ? "All Core 1 & Core 2 domains" : `Weighted ${exam} mix`}</small></div></div><div className="preview-row"><CircleHelp/><div><b>Learning mode</b><small>Explanations available after answering</small></div></div></div></div></>;
  if(mode==="results") { const score=session.filter(q=>answers[q.id]===q.answer).length; return <><PageHead eyebrow="SESSION COMPLETE" title="Your results" subtitle="Review what clicked and turn misses into your next study plan."/><div className="results panel"><div className={`result-ring ${pct(score,session.length)>=75?"pass":""}`}><b>{pct(score,session.length)}%</b><span>{score} of {session.length}</span></div><h2>{pct(score,session.length)>=75?"Strong work.":"Good baseline. Keep sharpening."}</h2><p>{pct(score,session.length)>=75?"Your decisions are trending toward exam readiness.":"Review the explanations below, then run a focused domain drill."}</p><div className="result-actions"><button className="primary" onClick={()=>setMode("setup")}><RotateCcw/> New session</button></div></div><div className="review-list">{session.map((q,i)=>{const ok=answers[q.id]===q.answer;return <div className={`panel review ${ok?"correct":"wrong"}`} key={q.id}><span>{ok?<Check/>:<X/>}</span><div><small>QUESTION {i+1} · {q.objective}</small><b>{q.prompt}</b><p><strong>Your answer:</strong> {q.options[answers[q.id]] || "Unanswered"}</p>{!ok&&<p><strong>Correct:</strong> {q.options[q.answer]}</p>}<em>{q.explanation}</em></div></div>})}</div></>; }
  const q=session[index]; const selected=answers[q.id]; const isLast=index===session.length-1;
  return <div className="exam-shell"><div className="exam-top"><button className="ghost" onClick={()=>setMode("setup")}><X/> Exit</button><div><span>QUESTION {index+1} OF {session.length}</span><div className="exam-progress"><i style={{width:`${pct(index+1,session.length)}%`}}/></div></div><div className="timer"><Clock3/>{formatTime(elapsed)}</div></div><div className="question-card panel"><div className="question-meta"><span>{q.exam}</span><span>{domains.find(d=>d.id===q.domain)?.name}</span><span>{q.difficulty}</span><button className={state.bookmarks.includes(q.id)?"saved":""} aria-label={state.bookmarks.includes(q.id)?"Remove bookmark":"Bookmark this question"} aria-pressed={state.bookmarks.includes(q.id)} onClick={()=>setState(s=>({...s,bookmarks:s.bookmarks.includes(q.id)?s.bookmarks.filter(x=>x!==q.id):[...s.bookmarks,q.id]}))}><Bookmark/></button></div><h2>{q.prompt}</h2><div className="answers">{(order[q.id]||q.options.map((_,i)=>i)).map((oi,k)=>{const opt=q.options[oi];const cls=revealed?(oi===q.answer?"correct":selected===oi?"wrong":""):selected===oi?"selected":"";return <button key={oi} className={cls} disabled={revealed} aria-label={`Option ${String.fromCharCode(65+k)}: ${opt}`} onClick={()=>setAnswers(a=>({...a,[q.id]:oi}))}><span>{String.fromCharCode(65+k)}</span><b>{opt}</b>{revealed&&oi===q.answer&&<Check/>}{revealed&&selected===oi&&oi!==q.answer&&<X/>}</button>})}</div>{revealed&&<div className="explanation"><Sparkles/><div><b>{selected===q.answer?"Exactly right":"Key takeaway"}</b><p>{q.explanation}</p><small>OBJECTIVE · {q.objective}</small></div></div>}<div className="question-actions"><button className="ghost" disabled={index===0} onClick={()=>{setIndex(i=>i-1);setRevealed(false)}}><ChevronLeft/> Previous</button>{!revealed?<button className="primary" disabled={selected===undefined} onClick={()=>setRevealed(true)}>Check answer</button>:<button className="primary" onClick={()=>{if(isLast)finish();else{setIndex(i=>i+1);setRevealed(false)}}}>{isLast?"Finish session":"Next question"}<ChevronRight/></button>}</div></div></div>;
}

function Flashcards({ state, setState }: { state:LearnerState; setState:React.Dispatch<React.SetStateAction<LearnerState>> }) {
  const { domains, flashcards } = useContent();
  const due=flashcards.filter(f=>isCardDue(state.cardRatings[f.id]));
  const deck=due.length?due:flashcards; const [index,setIndex]=useState(0); const [flipped,setFlipped]=useState(false); const card=deck[index%deck.length];
  const rate=(rating:1|2|3|4)=>{setState(s=>({...s,cardRatings:{...s.cardRatings,[card.id]:scheduleCard(s.cardRatings[card.id],rating)}}));setIndex(i=>i+1);setFlipped(false);};
  return <><PageHead eyebrow="SPACED REPETITION" title="Recall deck" subtitle="Actively retrieve the answer, then rate your recall honestly."/><div className="deck-status"><div><b>{due.length}</b><span>due now</span></div><div><b>{Object.keys(state.cardRatings).length}</b><span>in rotation</span></div><div><b>{flashcards.length}</b><span>total cards</span></div></div><div className="flash-wrap"><div className={`flashcard ${flipped?"flipped":""}`} role="button" tabIndex={0} aria-pressed={flipped} aria-label={flipped?"Card answer shown. Activate to hide.":"Card prompt shown. Activate to reveal the answer."} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setFlipped(f=>!f);}}} onClick={()=>setFlipped(!flipped)}><div className="flash-face front"><span>{domains.find(d=>d.id===card.domain)?.name}</span><Brain/><h2>{card.front}</h2><small>Click card to reveal</small></div><div className="flash-face back"><span>ANSWER</span><Sparkles/><p>{card.back}</p><small>How well did you recall it?</small></div></div>{flipped?<div className="rating"><button onClick={()=>rate(1)}><span>Again</span><small>1 day</small></button><button onClick={()=>rate(2)}><span>Hard</span><small>Short interval</small></button><button onClick={()=>rate(3)}><span>Good</span><small>Growing interval</small></button><button onClick={()=>rate(4)}><span>Easy</span><small>Long interval</small></button></div>:<button className="primary" onClick={()=>setFlipped(true)}>Reveal answer</button>}<div className="deck-nav"><button aria-label="Previous card" onClick={()=>{setIndex(i=>Math.max(0,i-1));setFlipped(false)}}><ChevronLeft/></button><span>{index%deck.length+1} / {deck.length}</span><button aria-label="Next card" onClick={()=>{setIndex(i=>i+1);setFlipped(false)}}><ChevronRight/></button></div></div></>;
}

function Analytics({ state }: { state:LearnerState }) {
  const { domains, questions } = useContent();
  const rows=domains.map(d=>({name:d.name.split(" ")[0],full:d.name,score:domainMastery(questions.filter(q=>q.domain===d.id),state.answered),color:d.color}));
  const objectives=objectiveStats(questions,state.answered).slice(0,6);
  const history=state.attempts.slice(-10).map((a,i)=>({name:`#${i+1}`,score:pct(a.score,a.total)}));
  return <><PageHead eyebrow="INSIGHT ENGINE" title="Performance analytics" subtitle="See the pattern behind your scores and put study time where it matters."/><div className="analytics-grid"><div className="panel"><div className="panel-title"><div><span>DOMAIN MASTERY</span><h3>Coverage by domain</h3></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={rows} layout="vertical" margin={{left:15}}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis type="number" domain={[0,100]} stroke="var(--muted)"/><YAxis dataKey="name" type="category" width={80} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Bar dataKey="score" radius={[0,6,6,0]}>{rows.map(r=><Cell key={r.full} fill={r.color}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="panel readiness-card"><span>READINESS SIGNAL</span><div className="big-score">{state.attempts.length?Math.round(state.attempts.reduce((x,a)=>x+pct(a.score,a.total),0)/state.attempts.length):0}<sup>%</sup></div><p>Based on completed practice sessions. Aim for consistent 85%+ results across every domain.</p><div className="readiness-bands"><i/><i/><i/><i/></div><small>Building foundation · Developing · Ready · Strong</small></div></div><div className="panel chart-panel"><div className="panel-title"><div><span>RECENT SESSIONS</span><h3>Score trajectory</h3></div></div>{history.length?<ResponsiveContainer width="100%" height={260}><AreaChart data={history}><CartesianGrid strokeDasharray="3 3" stroke="var(--line)"/><XAxis dataKey="name" stroke="var(--muted)"/><YAxis domain={[0,100]} stroke="var(--muted)"/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)"}}/><Area dataKey="score" stroke="#36d6b5" fill="#36d6b533" strokeWidth={3}/></AreaChart></ResponsiveContainer>:<Empty message="Your score history will appear after your first session."/>}</div><div className="history-list panel"><div className="panel-title"><div><span>WEAKEST OBJECTIVES</span><h3>Where to focus next</h3></div></div>{objectives.length?objectives.map(o=><div key={o.objective}><span className={o.mastery>=75?"pass":""}>{o.mastery}%</span><div><b>{o.objective}</b><small>{o.mastered}/{o.total} questions mastered</small></div><strong>{domains.find(d=>d.id===o.domain)?.name.split(" ")[0]}</strong></div>):<Empty message="Answer practice questions to surface your weakest objectives."/>}</div><div className="history-list panel"><div className="panel-title"><div><span>ATTEMPT LOG</span><h3>Recent activity</h3></div></div>{state.attempts.length?state.attempts.slice().reverse().map(a=><div key={a.id}><span className={pct(a.score,a.total)>=75?"pass":""}>{pct(a.score,a.total)}%</span><div><b>{a.exam} practice</b><small>{new Date(a.date).toLocaleDateString()} · {a.score}/{a.total} correct</small></div><strong>{formatTime(a.durationSec)}</strong></div>):<Empty message="No attempts recorded yet."/>}</div></>;
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
  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (isTauri()) await invoke("import_state", { raw: text });
      setState(migrateState(parsed));
      alert("Backup imported. Your progress has been restored.");
    } catch {
      alert("That file could not be imported. Choose a valid Apex backup (.json) file.");
    }
  };
  const onReset = async () => {
    if (!window.confirm("Reset all progress? This permanently clears your study history, notes, bookmarks, and card scheduling on this computer.")) return;
    if (isTauri()) { try { await invoke("reset_state"); } catch { /* file may not exist yet */ } }
    setState(migrateState({}));
  };
  return <><PageHead eyebrow="MAKE IT YOURS" title="Preferences" subtitle="Tune your study target, daily rhythm, and workspace."/><div className="settings-grid"><div className="panel settings-card"><div className="setting-icon"><GraduationCap/></div><div><h3>Learner profile</h3><p>This name appears throughout your workspace.</p><label>Display name<input value={state.name} onChange={e=>update({name:e.target.value})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><CalendarDays/></div><div><h3>Exam target</h3><p>Set a date to add a countdown to your dashboard.</p><label>Target date<input type="date" value={state.targetDate} onChange={e=>update({targetDate:e.target.value})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Target/></div><div><h3>Daily mission</h3><p>Choose a realistic question goal you can sustain.</p><label>Questions per day<input type="number" min="5" max="100" value={state.dailyGoal} onChange={e=>update({dailyGoal:Number(e.target.value)})}/></label></div></div><div className="panel settings-card"><div className="setting-icon"><Moon/></div><div><h3>Appearance</h3><p>Switch the complete interface theme.</p><div className="theme-toggle"><button className={state.theme==="dark"?"active":""} onClick={()=>update({theme:"dark"})}><Moon/> Dark</button><button className={state.theme==="light"?"active":""} onClick={()=>update({theme:"light"})}><Sun/> Light</button></div></div></div><div className="panel settings-card"><div className="setting-icon"><ShieldCheck/></div><div><h3>Data & backup</h3><p>Export your progress to a file, restore it on another machine, or start fresh. Everything stays on your computer.</p><div className="theme-toggle"><button onClick={()=>exportData(state)}><Download/> Export backup</button><button onClick={()=>fileRef.current?.click()}><Upload/> Import backup</button><button className="danger" onClick={onReset}><Trash2/> Reset progress</button></div><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport}/></div></div><div className="panel about-card"><div className="brand-mark"><Zap/></div><div><h3>Apex A+ Academy</h3><p>Version 1.0.0 · Offline-first desktop edition</p><small>Your progress is stored locally on this computer. This independent educational app is not affiliated with or endorsed by CompTIA.</small></div></div></div></>;
}

function PageHead({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}) { return <div className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div></div>; }
function Empty({message,action,onClick}:{message:string;action?:string;onClick?:()=>void}) { return <div className="empty"><Brain/><p>{message}</p>{action&&<button className="ghost" onClick={onClick}>{action}</button>}</div>; }
