import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, Clock3, Compass, Info, MapPin, Menu, MessageCircle, Navigation, Plus, Search, ShieldCheck, Users, X } from 'lucide-react';
import './style.css';

const banks = [
  { name: 'CBZ Bank', code: 'CBZ', color: '#214a9c' },
  { name: 'FBC Bank', code: 'FBC', color: '#a32838' },
  { name: 'ZB Bank', code: 'ZB', color: '#b56535' },
  { name: 'CABS', code: 'CABS', color: '#3b7b55' },
  { name: 'Stanbic Bank', code: 'STB', color: '#235681' },
  { name: 'First Capital Bank', code: 'FCB', color: '#9a3741' },
];
const services = ['Cash withdrawal', 'Cash deposit', 'Account opening', 'Card services', 'General enquiries'];
// Illustrative branches only. No live occupancy or availability claims are made.
const branches = [
  { id: 'cbz-kwame', bank: 'CBZ Bank', name: 'Kwame Nkrumah', area: 'Harare CBD', address: 'Kwame Nkrumah Avenue, Harare' },
  { id: 'cbz-samora', bank: 'CBZ Bank', name: 'Samora Machel', area: 'Harare CBD', address: 'Samora Machel Avenue, Harare' },
  { id: 'cbz-westgate', bank: 'CBZ Bank', name: 'Westgate', area: 'Westgate', address: 'Westgate, Harare' },
  { id: 'fbc-cbd', bank: 'FBC Bank', name: 'Harare CBD', area: 'Harare CBD', address: 'Harare CBD' },
  { id: 'fbc-belgravia', bank: 'FBC Bank', name: 'Belgravia', area: 'Belgravia', address: 'Belgravia, Harare' },
  { id: 'zb-cbd', bank: 'ZB Bank', name: 'Harare CBD', area: 'Harare CBD', address: 'Harare CBD' },
  { id: 'zb-avondale', bank: 'ZB Bank', name: 'Avondale', area: 'Avondale', address: 'Avondale, Harare' },
  { id: 'cabs-first', bank: 'CABS', name: 'First Street', area: 'Harare CBD', address: 'First Street, Harare' },
  { id: 'cabs-avondale', bank: 'CABS', name: 'Avondale', area: 'Avondale', address: 'Avondale, Harare' },
  { id: 'stb-cbd', bank: 'Stanbic Bank', name: 'Harare CBD', area: 'Harare CBD', address: 'Harare CBD' },
  { id: 'fcb-first', bank: 'First Capital Bank', name: 'First Street', area: 'Harare CBD', address: 'First Street, Harare' },
];
const STORE_KEY = 'mutsara-pilot-reports-v1';
function loadReports() { try { const value = JSON.parse(localStorage.getItem(STORE_KEY)); return Array.isArray(value) ? value : []; } catch { return []; } }
function getEstimate(reports, branchId, service) {
  const recent = reports.filter(r => r.branchId === branchId && r.service === service && Date.now() - r.timestamp < 60 * 60 * 1000);
  if (recent.length < 2) return null;
  const minutes = Math.round(recent.reduce((sum, r) => sum + r.minutes, 0) / recent.length / 5) * 5;
  return { minutes, count: recent.length, latest: Math.max(...recent.map(r => r.timestamp)) };
}
function App() {
  const [bank, setBank] = useState('CBZ Bank');
  const [service, setService] = useState('Cash withdrawal');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(loadReports);
  const [reportBranch, setReportBranch] = useState(null);
  const [minutes, setMinutes] = useState('');
  const [sent, setSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const selectedBank = banks.find(b => b.name === bank);
  const visible = useMemo(() => branches.filter(b => b.bank === bank && `${b.name} ${b.area}`.toLowerCase().includes(search.toLowerCase())).map(b => ({ ...b, estimate: getEstimate(reports, b.id, service) })).sort((a,b) => (a.estimate?.minutes ?? Infinity) - (b.estimate?.minutes ?? Infinity)), [bank, service, search, reports]);
  function submitReport(e) {
    e.preventDefault();
    const value = Number(minutes);
    if (!reportBranch || !Number.isFinite(value) || value < 0 || value > 240) return;
    const next = [...reports, { id: crypto.randomUUID(), branchId: reportBranch.id, service, minutes: value, timestamp: Date.now() }].filter(r => Date.now() - r.timestamp < 24 * 60 * 60 * 1000);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setReports(next); setReportBranch(null); setMinutes(''); setSent(true);
    window.setTimeout(() => setSent(false), 5000);
  }
  return <>
    <header className="site-header"><div className="container nav"><a className="brand" href="#top" aria-label="Mutsara home"><span className="brand-mark"><span></span><span></span><span></span></span><span>mutsara<span className="brand-dot">.</span></span></a><nav className={menuOpen ? 'nav-links open' : 'nav-links'}><a href="#how" onClick={() => setMenuOpen(false)}>How it works</a><a href="#explore" onClick={() => setMenuOpen(false)}>Explore branches</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a></nav><a className="nav-cta" href="#explore">Check queues <ArrowUpRight size={16}/></a><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X/> : <Menu/>}</button></div></header>
    <main id="top"><section className="hero"><div className="hero-glow"></div><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="live-dot"></span> A smarter way to plan your bank visit</div><h1>Less time in line.<br/><em>More time for life.</em></h1><p>Choose your bank, find your branch, and see recent queue reports before you leave home.</p><div className="hero-actions"><a className="button button-primary" href="#explore">Explore branches <ArrowRight size={18}/></a><a className="text-link" href="#how">See how it works <ArrowUpRight size={17}/></a></div><div className="hero-note"><ShieldCheck size={18}/><span>Honest updates. No guesswork when data is missing.</span></div></div><div className="hero-visual" aria-label="Illustration of branch queue updates"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="visual-card"><div className="visual-card-top"><span className="mini-logo"><span></span><span></span><span></span></span><span>BRANCH CHECK</span><span className="visual-pulse"></span></div><div className="visual-title">Your bank visit,<br/>on your terms.</div><div className="visual-row"><span className="visual-icon"><Building2 size={18}/></span><span><small>YOUR BANK</small><strong>Choose your bank</strong></span><Check size={17} className="row-check"/></div><div className="visual-row"><span className="visual-icon"><MapPin size={18}/></span><span><small>YOUR BRANCH</small><strong>Compare locations</strong></span><Check size={17} className="row-check"/></div><div className="visual-row"><span className="visual-icon"><Clock3 size={18}/></span><span><small>YOUR TIME</small><strong>Check recent reports</strong></span><Check size={17} className="row-check"/></div><div className="visual-card-foot"><span>Plan smarter. Go confidently.</span><ArrowUpRight size={17}/></div></div><div className="float-tag"><span className="float-icon"><Clock3 size={18}/></span><span>Know before you go</span></div></div></div></section>
    <section className="trust-strip"><div className="container trust-inner"><span>BUILT FOR EVERYDAY ZIMBABWE</span><div><span><Check size={15}/> Multiple banks</span><span><Check size={15}/> Branch by branch</span><span><Check size={15}/> Community powered</span></div></div></section>
    <section className="explore section" id="explore"><div className="container"><div className="section-heading"><div><span className="kicker">FIND YOUR BRANCH</span><h2>A better bank day<br/>starts here.</h2></div><p>Select your bank and the service you need. Recent reports appear only when enough people have shared them.</p></div><div className="finder"><div className="finder-top"><div><span className="finder-icon"><Compass size={20}/></span><span><strong>Find a branch</strong><small>Start with your bank and service</small></span></div><span className="pilot-pill"><span></span> PILOT PREVIEW</span></div><div className="filters"><label><span>YOUR BANK</span><div className="select-wrap"><span className="bank-square" style={{background: selectedBank.color}}>{selectedBank.code.slice(0,1)}</span><select value={bank} onChange={e => setBank(e.target.value)}>{banks.map(b => <option key={b.name}>{b.name}</option>)}</select><ChevronDown size={17}/></div></label><label><span>WHAT DO YOU NEED?</span><div className="select-wrap"><span className="select-leading"><Users size={18}/></span><select value={service} onChange={e => setService(e.target.value)}>{services.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={17}/></div></label><label><span>SEARCH AREA OR BRANCH</span><div className="search-wrap"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Avondale"/></div></label></div><div className="results-heading"><div><h3>{bank} branches</h3><p>{visible.length} {visible.length === 1 ? 'branch' : 'branches'} in this preview</p></div><span><Info size={15}/> Reports on this device only</span></div><div className="branch-grid">{visible.map(branch => <article className="branch-card" key={branch.id}><div className="branch-head"><span className="branch-bank" style={{background: selectedBank.color}}>{selectedBank.code.slice(0,1)}</span><span className={branch.estimate ? 'status reported' : 'status'}><span></span>{branch.estimate ? 'Recent reports' : 'No recent data'}</span></div><h4>{branch.name}</h4><div className="branch-location"><MapPin size={15}/>{branch.area}</div><div className="wait-panel"><small>ESTIMATED WAIT · {service.toUpperCase()}</small>{branch.estimate ? <><strong>About {branch.estimate.minutes} min</strong><span>{branch.estimate.count} reports · latest {new Date(branch.estimate.latest).toLocaleTimeString('en-ZW',{hour:'numeric',minute:'2-digit'})}</span></> : <><strong>Not available yet</strong><span>We need 2 recent reports to show an estimate.</span></>}</div><div className="branch-actions"><button onClick={() => setReportBranch(branch)}>Share a wait time <Plus size={16}/></button><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.bank + ' ' + branch.address)}`} target="_blank" rel="noopener noreferrer" aria-label={`Find ${branch.name} on Google Maps`}><Navigation size={17}/></a></div></article>)}</div>{visible.length === 0 && <div className="empty"><Search size={25}/><strong>No matching branches</strong><span>Try another area or clear your search.</span><button onClick={() => setSearch('')}>Clear search</button></div>}<div className="data-notice"><Info size={19}/><p><strong>About these results:</strong> Branch names are illustrative pilot entries and have not been verified with the banks. Reports you add are saved on this device only. This preview does not provide live, shared, or bank verified queue information. Confirm branch details before travelling.</p></div></div></div></section>
    <section className="how section" id="how"><div className="container"><div className="how-heading"><span className="kicker">SIMPLE BY DESIGN</span><h2>Three steps to a<br/><em>smoother day.</em></h2></div><div className="steps"><div className="step"><span className="step-num">01</span><span className="step-icon"><Building2/></span><h3>Pick your bank</h3><p>Select the bank you already use. See branches for that bank in one place.</p></div><div className="step"><span className="step-num">02</span><span className="step-icon"><Search/></span><h3>Find your service</h3><p>Choose what you need to do and compare the available branch information.</p></div><div className="step"><span className="step-num">03</span><span className="step-icon"><MessageCircle/></span><h3>Help the next person</h3><p>After your visit, share how long you waited to help improve the picture.</p></div></div></div></section>
    <section className="about section" id="about"><div className="container about-grid"><div><span className="kicker light">WHY MUTSARA</span><h2>Your time matters.<br/><em>Every minute of it.</em></h2></div><div><p>“Mutsara” means “queue” in Shona. We’re exploring a simple idea: people should be able to plan a bank visit with better information, while being clear about what has and hasn’t been verified.</p><a href="#explore">Explore the preview <ArrowUpRight size={18}/></a></div></div></section></main>
    <footer><div className="container footer-inner"><a className="brand" href="#top"><span className="brand-mark"><span></span><span></span><span></span></span><span>mutsara<span className="brand-dot">.</span></span></a><span>Check the queue before you go.</span><small>© {new Date().getFullYear()} Mutsara · Pilot concept</small></div></footer>
    {sent && <div className="toast" role="status"><Check size={18}/> Saved on this device. Thanks for sharing.</div>}
    {reportBranch && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setReportBranch(null)}}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setReportBranch(null)} aria-label="Close"><X size={20}/></button><span className="kicker">HELP YOUR COMMUNITY</span><h2 id="modal-title">Share your wait time</h2><p>{reportBranch.bank} · {reportBranch.name} · {service}</p><form onSubmit={submitReport}><label htmlFor="wait-minutes">How many minutes did you wait to be served?</label><div className="minutes-input"><input id="wait-minutes" type="number" min="0" max="240" required value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="e.g. 25" autoFocus/><span>minutes</span></div><small>Enter your actual wait. Reports expire from estimates after one hour. This pilot saves reports only in your browser, so other people cannot see them.</small><button className="button button-primary" type="submit">Save report <ArrowRight size={18}/></button></form></div></div>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
