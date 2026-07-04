import { useState, useEffect, useRef } from "react";

const store = {
  get: async (k, shared=false) => { try { const r = await window.storage.get(k, shared); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  set: async (k, v, shared=false) => { try { await window.storage.set(k, JSON.stringify(v), shared); } catch {} },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Oswald:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --red:#E8192C;--red2:#FF3347;--gold:#D4A843;--green:#22c55e;--blue:#3b82f6;
  --w:#F0EBE3;--black:#0B0B0B;--g1:#141414;--g2:#1C1C1C;--g3:#262626;--g4:#303030;
  --mut:rgba(240,235,227,0.42);--bdr:rgba(240,235,227,0.07);
}
body{background:var(--black);color:var(--w);font-family:'Barlow',sans-serif;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:var(--red);}
select option{background:#1C1C1C;}
input,textarea,select{-webkit-appearance:none;}
@keyframes up{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.2;}}
@keyframes dot{0%,60%,100%{transform:translateY(0);opacity:0.2;}30%{transform:translateY(-6px);opacity:1;}}
@keyframes notif{0%{transform:translateX(120%);}10%{transform:translateX(0);}85%{transform:translateX(0);}100%{transform:translateX(120%);}}
@keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
@keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
@keyframes marquee{from{transform:translateX(0);}to{transform:translateX(-50%);}}
@keyframes flick{0%,93%,100%{opacity:1;}94%,96%{opacity:0.5;}}
@keyframes glow{0%,100%{box-shadow:0 0 6px rgba(212,168,67,0.15);}50%{box-shadow:0 0 18px rgba(212,168,67,0.4);}}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:300;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(11,11,11,0.97);backdrop-filter:blur(18px);border-bottom:1px solid var(--bdr);}
.logo{font-family:'Black Han Sans',sans-serif;font-size:18px;color:var(--w);cursor:pointer;flex-shrink:0;}
.logo em{color:var(--red);font-style:normal;}
.nav-scroll{display:flex;align-items:center;gap:1px;overflow-x:auto;scrollbar-width:none;flex:1;margin:0 8px;}
.nav-scroll::-webkit-scrollbar{display:none;}
.nb{background:none;border:none;padding:5px 9px;color:var(--mut);font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:color 0.2s;white-space:nowrap;}
.nb:hover,.nb.on{color:var(--w);}
.ncta{background:var(--red);border:none;padding:7px 14px;color:#fff;font-family:'Oswald',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;border-radius:2px;flex-shrink:0;position:relative;}
.ncta:hover{background:var(--red2);}
.nbadge{position:absolute;top:-5px;right:-5px;background:var(--gold);color:#000;font-size:8px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-weight:700;}

/* TICKER */
.ticker-wrap{position:fixed;top:52px;left:0;right:0;z-index:200;overflow:hidden;background:rgba(34,197,94,0.06);border-bottom:1px solid rgba(34,197,94,0.12);padding:7px 0;}
.ticker-track{display:flex;white-space:nowrap;animation:ticker 26s linear infinite;}
.tick{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;color:var(--mut);padding:0 22px;}
.tick strong{color:var(--green);}

/* TOAST */
.toast{position:fixed;bottom:20px;right:20px;z-index:9999;background:var(--g2);border:1px solid rgba(232,25,44,0.4);border-radius:4px;padding:12px 16px;display:flex;align-items:center;gap:9px;box-shadow:0 8px 28px rgba(0,0,0,0.7);animation:notif 4s ease forwards;max-width:280px;}
.toast-dot{width:7px;height:7px;border-radius:50%;background:var(--red);flex-shrink:0;}
.toast-msg{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:1px;color:var(--w);}

.page{padding-top:76px;min-height:100vh;}

/* HERO */
.hero{position:relative;min-height:90vh;display:flex;flex-direction:column;justify-content:center;padding:60px 24px 48px;overflow:hidden;}
.hbg{position:absolute;inset:0;background:radial-gradient(ellipse at 15% 55%,rgba(232,25,44,0.09) 0%,transparent 55%),var(--black);}
.hgrid{position:absolute;inset:0;background-image:linear-gradient(rgba(232,25,44,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(232,25,44,0.025) 1px,transparent 1px);background-size:52px 52px;}
.hcon{position:relative;z-index:1;max-width:640px;}
.htag{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(232,25,44,0.3);padding:4px 12px;border-radius:2px;font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:3px;color:var(--red);text-transform:uppercase;margin-bottom:18px;}
.hd{width:5px;height:5px;border-radius:50%;background:var(--red);animation:pulse 1.5s infinite;}
.hh1{font-family:'Black Han Sans',sans-serif;font-size:clamp(50px,12vw,100px);line-height:0.87;color:var(--w);margin-bottom:16px;animation:flick 9s infinite;}
.hh1 .r{color:var(--red);}
.hsub{font-size:13px;color:var(--mut);font-weight:300;line-height:1.85;margin-bottom:26px;max-width:420px;}
.hbtns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px;}
.bp{background:var(--red);border:none;padding:13px 26px;color:#fff;font-family:'Oswald',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all 0.2s;}
.bp:hover{background:var(--red2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,25,44,0.28);}
.bs{background:transparent;border:1px solid rgba(240,235,227,0.18);padding:13px 26px;color:var(--w);font-family:'Oswald',sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:all 0.2s;}
.bs:hover{border-color:rgba(240,235,227,0.45);}

/* LEAD MAGNET */
.lm{background:linear-gradient(90deg,rgba(212,168,67,0.08),rgba(232,25,44,0.04));border:1px solid rgba(212,168,67,0.2);border-radius:3px;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.lm-inp{background:var(--g2);border:1px solid rgba(212,168,67,0.25);border-radius:2px;padding:9px 12px;color:var(--w);font-family:'Barlow',sans-serif;font-size:13px;outline:none;width:180px;flex-shrink:0;}
.lm-inp::placeholder{color:rgba(240,235,227,0.2);}
.lm-btn{background:var(--gold);border:none;border-radius:2px;padding:9px 14px;color:#000;font-family:'Oswald',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;white-space:nowrap;}
.lm-btn:hover{background:#e8bc55;}

.mwrap{overflow:hidden;border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:11px 0;background:rgba(232,25,44,0.02);margin-top:28px;}
.mtrack{display:flex;white-space:nowrap;animation:marquee 22s linear infinite;}
.mi{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--mut);padding:0 24px;}
.mi span{color:var(--red);margin-right:24px;}

.stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--bdr);}
.stat{padding:22px 14px;text-align:center;border-right:1px solid var(--bdr);}
.stat:last-child{border-right:none;}
.sn{font-family:'Black Han Sans',sans-serif;font-size:clamp(26px,5vw,42px);color:var(--red);}
.sl{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--mut);margin-top:4px;}

/* SECTIONS */
.sec{padding:56px 24px;max-width:900px;margin:0 auto;}
.stag{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--red);margin-bottom:8px;}
.sh2{font-family:'Black Han Sans',sans-serif;font-size:clamp(26px,6vw,48px);color:var(--w);line-height:0.93;margin-bottom:12px;}
.sbody{font-size:13px;color:var(--mut);line-height:1.9;font-weight:300;max-width:480px;margin-bottom:24px;}

/* CARDS */
.card{background:var(--g1);border:1px solid var(--bdr);border-radius:3px;}
.card-hdr{padding:12px 17px;border-bottom:1px solid var(--bdr);background:rgba(232,25,44,0.04);display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.card-title{font-family:'Oswald',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--w);}
.card-body{padding:18px 17px;}

/* INPUTS */
.lbl{font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-bottom:5px;}
.inp{width:100%;background:var(--g2);border:1px solid var(--bdr);border-radius:2px;padding:10px 12px;color:var(--w);font-family:'Barlow',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s;}
.inp:focus{border-color:rgba(232,25,44,0.45);}
.inp::placeholder{color:rgba(240,235,227,0.18);}
.sel{width:100%;background:var(--g2);border:1px solid var(--bdr);border-radius:2px;padding:10px 12px;color:var(--w);font-family:'Barlow',sans-serif;font-size:13px;outline:none;}
.ta{width:100%;background:var(--g2);border:1px solid var(--bdr);border-radius:2px;padding:10px 12px;color:var(--w);font-family:'Barlow',sans-serif;font-size:13px;outline:none;resize:vertical;min-height:80px;line-height:1.6;}
.ta::placeholder{color:rgba(240,235,227,0.18);}

/* BUTTONS */
.btn{background:var(--red);border:none;border-radius:2px;padding:11px 18px;color:#fff;font-family:'Oswald',sans-serif;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;}
.btn:hover{background:var(--red2);}
.btn:disabled{background:rgba(232,25,44,0.15);cursor:not-allowed;color:rgba(255,255,255,0.2);}
.btn-full{width:100%;}
.btn-ol{background:transparent;border:1px solid rgba(240,235,227,0.15);color:var(--w);}
.btn-ol:hover{border-color:var(--red);color:var(--red);background:transparent;}
.btn-sm{padding:7px 13px;font-size:10px;}
.btn-gold{background:var(--gold);color:#000;}
.btn-gold:hover{background:#e8bc55;}
.btn-green{background:var(--green);color:#000;}

/* GRIDS */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.g4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}

/* TABS */
.tab-row{display:flex;border-bottom:1px solid var(--bdr);margin-bottom:18px;overflow-x:auto;}
.tab{padding:9px 14px;background:none;border:none;color:var(--mut);font-family:'Oswald',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;border-bottom:2px solid transparent;white-space:nowrap;}
.tab.on{color:var(--w);border-bottom-color:var(--red);}

/* METRICS */
.metric{background:var(--g2);border:1px solid var(--bdr);border-radius:3px;padding:14px 16px;}
.metric-val{font-family:'Black Han Sans',sans-serif;font-size:28px;color:var(--red);}
.metric-lbl{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--mut);margin-top:3px;}

/* ROWS */
.row-item{padding:11px 0;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:12px;}
.row-item:last-child{border-bottom:none;}
.row-av{width:32px;height:32px;border-radius:3px;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:'Black Han Sans',sans-serif;font-size:14px;color:#fff;flex-shrink:0;}
.row-name{font-family:'Oswald',sans-serif;font-size:13px;font-weight:500;color:var(--w);}
.row-sub{font-size:11px;color:var(--mut);}

/* BADGES */
.badge{display:inline-block;padding:2px 7px;border-radius:2px;font-family:'Oswald',sans-serif;font-size:8px;letter-spacing:2px;text-transform:uppercase;}
.badge-red{background:rgba(232,25,44,0.15);color:var(--red);border:1px solid rgba(232,25,44,0.25);}
.badge-gold{background:rgba(212,168,67,0.15);color:var(--gold);border:1px solid rgba(212,168,67,0.25);}
.badge-green{background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.2);}
.badge-gray{background:rgba(240,235,227,0.05);color:var(--mut);border:1px solid var(--bdr);}
.badge-blue{background:rgba(59,130,246,0.12);color:#60a5fa;border:1px solid rgba(59,130,246,0.25);}

/* TRANSFORMS */
.trans-card{background:var(--g1);border:1px solid var(--bdr);border-radius:3px;overflow:hidden;transition:transform 0.2s;}
.trans-card:hover{transform:translateY(-3px);border-color:rgba(232,25,44,0.25);}
.trans-imgs{display:grid;grid-template-columns:1fr 1fr;height:150px;}
.tbefore{background:linear-gradient(145deg,#181818,#222);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;}
.tafter{background:linear-gradient(145deg,#1a0303,#280606);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;}
.tlabel{position:absolute;bottom:7px;left:50%;transform:translateX(-50%);font-family:'Oswald',sans-serif;font-size:7px;letter-spacing:3px;text-transform:uppercase;padding:2px 7px;border-radius:2px;white-space:nowrap;}
.tbefore .tlabel{background:rgba(240,235,227,0.08);color:var(--mut);}
.tafter .tlabel{background:rgba(232,25,44,0.25);color:var(--red);}

/* PACKAGES */
.pkg{background:var(--g1);border:1px solid var(--bdr);border-radius:3px;padding:20px 18px;position:relative;transition:transform 0.2s;}
.pkg:hover{transform:translateY(-3px);}
.pkg.feat{border-color:var(--red);background:linear-gradient(150deg,#160303,var(--g1));}
.pbadge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:var(--red);padding:3px 11px;font-family:'Oswald',sans-serif;font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#fff;border-radius:0 0 3px 3px;white-space:nowrap;}

/* CALENDAR */
.cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.cal-month{font-family:'Oswald',sans-serif;font-size:14px;font-weight:600;color:var(--w);letter-spacing:1px;}
.cal-arr{background:none;border:1px solid var(--bdr);color:var(--w);width:28px;height:28px;border-radius:2px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
.cal-arr:hover{border-color:var(--red);color:var(--red);}
.cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:12px;}
.cdow{font-family:'Oswald',sans-serif;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--mut);text-align:center;padding:4px 0;}
.cd{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border-radius:2px;font-family:'Oswald',sans-serif;font-size:11px;cursor:pointer;transition:all 0.2s;border:1px solid transparent;}
.cd.emp{cursor:default;}.cd.past{color:rgba(240,235,227,0.12);cursor:not-allowed;}
.cd.avail{color:var(--w);border-color:var(--bdr);}.cd.avail:hover{border-color:var(--red);color:var(--red);}
.cd.sel{background:var(--red);color:#fff;border-color:var(--red);}
.cd.full{color:rgba(240,235,227,0.12);cursor:not-allowed;text-decoration:line-through;}
.tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:12px;}
.ts{padding:8px 4px;text-align:center;border:1px solid var(--bdr);border-radius:2px;font-family:'Oswald',sans-serif;font-size:10px;cursor:pointer;transition:all 0.2s;color:var(--mut);}
.ts:hover{border-color:var(--red);color:var(--red);}
.ts.sel{background:var(--red);color:#fff;border-color:var(--red);}
.ts.taken{color:rgba(240,235,227,0.12);cursor:not-allowed;text-decoration:line-through;}

/* CHAT */
.ch-msgs{height:270px;overflow-y:auto;padding:13px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin;scrollbar-color:rgba(232,25,44,0.1) transparent;}
.cmsg{display:flex;gap:6px;align-items:flex-end;animation:up 0.25s ease forwards;}
.cmsg.u{flex-direction:row-reverse;}
.cav{width:22px;height:22px;border-radius:2px;background:var(--red);display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:10px;color:#fff;flex-shrink:0;}
.cav.ua{background:var(--g3);border:1px solid var(--bdr);color:var(--mut);}
.cbub{max-width:78%;padding:8px 12px;border-radius:3px;font-size:12px;line-height:1.65;font-weight:300;}
.cbub.ai{background:var(--g2);border:1px solid var(--bdr);color:var(--w);border-bottom-left-radius:0;}
.cbub.ub{background:rgba(232,25,44,0.09);border:1px solid rgba(232,25,44,0.2);color:var(--w);border-bottom-right-radius:0;}
.typing{display:flex;gap:4px;padding:8px 12px;background:var(--g2);border:1px solid var(--bdr);border-radius:3px;border-bottom-left-radius:0;}
.td{width:4px;height:4px;border-radius:50%;background:var(--red);}
.td:nth-child(1){animation:dot 1.2s 0s infinite;}
.td:nth-child(2){animation:dot 1.2s 0.2s infinite;}
.td:nth-child(3){animation:dot 1.2s 0.4s infinite;}
.ch-inp-row{padding:9px 12px;border-top:1px solid var(--bdr);display:flex;gap:8px;background:rgba(0,0,0,0.2);}
.ch-inp{flex:1;background:var(--g2);border:1px solid var(--bdr);border-radius:2px;padding:8px 11px;color:var(--w);font-family:'Barlow',sans-serif;font-size:13px;outline:none;}
.ch-inp:focus{border-color:rgba(232,25,44,0.35);}
.ch-inp::placeholder{color:rgba(240,235,227,0.16);}
.ch-send{background:var(--red);border:none;border-radius:2px;padding:8px 13px;color:#fff;font-family:'Oswald',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;cursor:pointer;}
.ch-send:disabled{background:rgba(232,25,44,0.1);cursor:not-allowed;color:rgba(255,255,255,0.12);}

/* HABIT TRACKER */
.habit-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr);}
.habit-row:last-child{border-bottom:none;}
.hday{width:26px;height:26px;border-radius:2px;border:1px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-family:'Oswald',sans-serif;font-size:9px;cursor:pointer;transition:all 0.15s;color:var(--mut);}
.hday.done{background:var(--red);border-color:var(--red);color:#fff;}

/* PROGRESS */
.prog-wrap{background:var(--g3);border-radius:2px;height:5px;overflow:hidden;}
.prog-fill{height:100%;background:var(--red);border-radius:2px;transition:width 0.6s ease;}

/* MOOD */
.mood-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin:10px 0;}
.mood-opt{padding:11px 5px;border:1px solid var(--bdr);border-radius:3px;text-align:center;cursor:pointer;transition:all 0.2s;}
.mood-opt:hover{border-color:rgba(232,25,44,0.3);}
.mood-opt.sel{border-color:var(--red);background:rgba(232,25,44,0.08);}

/* GOAL */
.goal-card{background:linear-gradient(135deg,rgba(212,168,67,0.06),rgba(232,25,44,0.03));border:1px solid rgba(212,168,67,0.16);border-radius:3px;padding:16px;}

/* STAR RATING */
.star{font-size:22px;cursor:pointer;transition:transform 0.15s;filter:grayscale(1);opacity:0.35;}
.star.lit{filter:grayscale(0);opacity:1;}
.star:hover{transform:scale(1.15);}

/* COMPARE TABLE */
.cmp-hdr{padding:14px 12px;border-bottom:1px solid var(--bdr);text-align:center;background:var(--g1);border:1px solid var(--bdr);}
.cmp-hdr.feat{border-color:var(--red);background:rgba(232,25,44,0.04);}
.cmp-label{flex:2;padding:9px 12px;font-size:11px;color:var(--mut);font-weight:300;border-right:1px solid var(--bdr);}
.cmp-cell{flex:1;padding:9px 8px;text-align:center;font-size:13px;border-right:1px solid var(--bdr);}
.cmp-cell:last-child{border-right:none;}

/* RETENTION */
.ret-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bdr);}
.ret-row:last-child{border-bottom:none;}
.ret-bar-bg{flex:1;height:5px;background:var(--g3);border-radius:3px;overflow:hidden;}
.ret-bar{height:100%;border-radius:3px;}

/* MESSAGE THREAD */
.msg-thread{height:240px;overflow-y:auto;padding:13px;display:flex;flex-direction:column;gap:9px;scrollbar-width:thin;scrollbar-color:rgba(232,25,44,0.1) transparent;}
.msg-bub{max-width:78%;padding:9px 12px;border-radius:3px;font-size:12px;line-height:1.65;font-weight:300;}
.msg-bub.rod{background:var(--g2);border:1px solid var(--bdr);color:var(--w);border-bottom-left-radius:0;align-self:flex-start;}
.msg-bub.me{background:rgba(232,25,44,0.09);border:1px solid rgba(232,25,44,0.2);color:var(--w);border-bottom-right-radius:0;align-self:flex-end;}

/* LOYALTY */
.loyalty-tier{border:1px solid var(--bdr);border-radius:3px;padding:13px 15px;display:flex;align-items:center;gap:12px;margin-bottom:8px;}
.loyalty-tier.active{border-color:rgba(212,168,67,0.35);background:rgba(212,168,67,0.04);animation:glow 2s ease-in-out infinite;}

/* LEADERBOARD */
.lb-row{display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:3px;margin-bottom:5px;}
.lb-row:nth-child(1){background:linear-gradient(90deg,rgba(212,168,67,0.1),transparent);border:1px solid rgba(212,168,67,0.2);}
.lb-row:nth-child(2){background:linear-gradient(90deg,rgba(192,192,192,0.07),transparent);border:1px solid rgba(192,192,192,0.12);}
.lb-row:nth-child(3){background:linear-gradient(90deg,rgba(180,120,60,0.07),transparent);border:1px solid rgba(180,120,60,0.12);}
.lb-row:nth-child(n+4){background:var(--g2);border:1px solid var(--bdr);}

/* PAY OPTION */
.pay-opt{border:2px solid var(--bdr);border-radius:3px;padding:14px 16px;cursor:pointer;transition:all 0.2s;position:relative;}
.pay-opt:hover{border-color:rgba(232,25,44,0.35);}
.pay-opt.selected{border-color:var(--red);background:rgba(232,25,44,0.05);}

/* UPSELL */
.upsell{background:linear-gradient(90deg,rgba(232,25,44,0.07),rgba(212,168,67,0.04));border:1px solid rgba(232,25,44,0.18);border-radius:3px;padding:13px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}

/* CTA */
.cta-strip{background:var(--red);padding:32px 24px;text-align:center;}
.cta-h{font-family:'Black Han Sans',sans-serif;font-size:clamp(22px,5vw,38px);color:#fff;margin-bottom:7px;}
.cta-s{font-size:12px;color:rgba(255,255,255,0.75);margin-bottom:16px;font-weight:300;}

/* PROMO */
.promo-active{background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:3px;padding:10px 14px;font-family:'Oswald',sans-serif;font-size:12px;color:var(--green);letter-spacing:1px;}
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PACKAGES=[
  {tier:"Foundation",name:"GRIND",price:480,feat:false,consult:true,split:240,
   stripeLink:"https://buy.stripe.com/YOUR_GRIND_LINK",
   stripeSplitLink:"https://buy.stripe.com/YOUR_GRIND_SPLIT_LINK",
   desc:"Transformation essentials. Custom programs, meal prep, weekly accountability.",
   items:["Custom Monthly Workout","AI Meal Plan","Weekly Check-ins","Video Library","10 Meal Preps/Month","$75 Consult Included"]},
  {tier:"Most Popular",name:"HUSTLE",price:550,feat:true,badge:"BEST VALUE",consult:true,split:275,
   stripeLink:"https://buy.stripe.com/YOUR_HUSTLE_LINK",
   stripeSplitLink:"https://buy.stripe.com/YOUR_HUSTLE_SPLIT_LINK",
   desc:"Fitness + business. Get in shape and start earning from fitness.",
   items:["Everything in Grind","Trainer Certification","Client Templates","Lead Gen Training","Monthly 1-on-1 Call","$75 Consult Included"]},
  {tier:"Elite",name:"EMPIRE",price:1500,feat:false,split:750,
   stripeLink:"https://buy.stripe.com/YOUR_EMPIRE_LINK",
   stripeSplitLink:"https://buy.stripe.com/YOUR_EMPIRE_SPLIT_LINK",
   desc:"The full system. Body, brand, certification, real clients, real leads.",
   items:["Everything in Hustle","Weekly 1-on-1 Coaching","Real Leads Monthly","Revenue Share","Custom Brand Kit","Mentorship Under Rod"]},
];
const STRIPE_CONSULT="https://buy.stripe.com/YOUR_CONSULT_LINK";
const TRANSFORMS=[
  {name:"Marcus T.",result:"Lost 38 lbs — 90 days",pkg:"HUSTLE",b:"😐",a:"🔥",t:"90 days"},
  {name:"DeShawn R.",result:"Gained 18 lbs muscle",pkg:"EMPIRE",b:"😤",a:"⚡",t:"4 months"},
  {name:"Keisha M.",result:"Down 2 dress sizes",pkg:"GRIND",b:"🌱",a:"💎",t:"60 days"},
  {name:"Jordan P.",result:"6-pack in 12 weeks",pkg:"HUSTLE",b:"😑",a:"🏆",t:"12 weeks"},
];
const REVIEWS=[
  {name:"Marcus T.",stars:5,text:"Rod don't play. Week 3 people were asking what I was doing different. The meal prep system alone is worth it.",pkg:"HUSTLE",date:"2 weeks ago"},
  {name:"Tanisha W.",stars:5,text:"Certified trainer now with 4 clients under me. Templates, leads, full game plan. Not a regular program.",pkg:"EMPIRE",date:"1 month ago"},
  {name:"Keisha M.",stars:5,text:"Daily check-ins kept me locked in. Lost 14 lbs first month. Rod actually responds to every check-in.",pkg:"GRIND",date:"1 month ago"},
  {name:"Chris B.",stars:5,text:"Split payment made it easy to start. The habit tracker alone changed my consistency.",pkg:"HUSTLE",date:"1 month ago"},
];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const TIMES=["6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM"];
const HABITS=[
  {icon:"💧",name:"Drink 1 gallon of water"},
  {icon:"🏋️",name:"Complete today's workout"},
  {icon:"🥗",name:"Stick to meal plan"},
  {icon:"😴",name:"Sleep 7+ hours"},
  {icon:"📵",name:"No junk food"},
  {icon:"🧠",name:"5-min mindset work"},
];
const SOCIAL_TICKS=[
  {msg:"Marcus T. just joined HUSTLE"},
  {msg:"Tanisha W. unlocked Empire Status"},
  {msg:"3 people joined this week"},
  {msg:"Brandon L. earned $300 in referrals"},
  {msg:"Keisha M. hit her 3-month streak"},
  {msg:"12 new leads qualified today"},
  {msg:"R.O.D. Meals claimed × 47 this week"},
  {msg:"DeShawn R. got certified"},
  {msg:"R.O.D. — Ready On Demand. Always."},
  {msg:"New EMPIRE client joined today"},
];
const LOYALTY_TIERS=[
  {refs:1,discount:5,label:"Starter Earner",icon:"🌱",desc:"1 referral joins → 5% off monthly forever"},
  {refs:2,discount:10,label:"Connector",icon:"🔗",desc:"2 referrals join → 10% off forever"},
  {refs:3,discount:15,label:"Builder",icon:"⚡",desc:"3 referrals join → 15% off forever"},
  {refs:5,discount:20,label:"Empire Status",icon:"👑",desc:"5+ join → 20% off forever (MAX)"},
];
const LEADERBOARD=[
  {name:"Tanisha W.",refs:12,earned:"$2,400 credit",pkg:"EMPIRE",av:"T"},
  {name:"Marcus T.",refs:9,earned:"$450 cash",pkg:"HUSTLE",av:"M"},
  {name:"Brandon L.",refs:7,earned:"$2,100 credit",pkg:"EMPIRE",av:"B"},
  {name:"Keisha M.",refs:4,earned:"2,000 pts",pkg:"GRIND",av:"K"},
  {name:"DeShawn R.",refs:3,earned:"$900 credit",pkg:"EMPIRE",av:"D"},
  {name:"Aisha N.",refs:2,earned:"$100 cash",pkg:"HUSTLE",av:"A"},
];
const VALID_PROMOS={"ROD10":"10% off your first month","GRIND2024":"Free consultation upgrade — GRIND","EMPIRE50":"$50 off Empire package","HUSTLE20":"$20 off HUSTLE first month"};
const MENU_ITEMS=[
  {name:"Grilled Chicken & Rice",desc:"6oz chicken breast, brown rice, steamed broccoli",price:"$13"},
  {name:"Salmon Power Bowl",desc:"Atlantic salmon, quinoa, spinach, lemon herb",price:"$15"},
  {name:"Turkey & Sweet Potato",desc:"Ground turkey, roasted sweet potato, green beans",price:"$12"},
  {name:"Egg White Omelette",desc:"4 egg whites, bell peppers, onions, feta cheese",price:"$10"},
  {name:"Steak & Veggie",desc:"4oz sirloin, roasted mixed veg, brown rice",price:"$16"},
  {name:"Shrimp Stir Fry",desc:"Shrimp, bok choy, snap peas, ginger soy glaze",price:"$14"},
  {name:"Vegan Buddha Bowl",desc:"Chickpeas, roasted veg, tahini drizzle, quinoa",price:"$11"},
  {name:"Ground Beef & Pasta",desc:"Lean ground beef, whole wheat pasta, marinara",price:"$13"},
  {name:"Honey Garlic Chicken",desc:"Chicken thigh, honey garlic glaze, white rice, broccoli",price:"$13"},
  {name:"Jerk Chicken & Rice",desc:"Jamaican jerk seasoning, rice & peas, plantain",price:"$14"},
  {name:"Teriyaki Salmon Bowl",desc:"5oz salmon, teriyaki glaze, brown rice, edamame",price:"$15"},
  {name:"Turkey Taco Bowl",desc:"Seasoned ground turkey, salsa, corn, shredded cabbage",price:"$12"},
  {name:"Chicken Tikka Bowl",desc:"Chicken tikka masala sauce, basmati rice, spinach",price:"$14"},
  {name:"Shrimp & Cauliflower Rice",desc:"Garlic butter shrimp, cauliflower rice, asparagus",price:"$13"},
  {name:"BBQ Pulled Chicken",desc:"Slow-cooked pulled chicken, sweet potato, coleslaw",price:"$13"},
  {name:"Beef Burrito Bowl",desc:"Seasoned ground beef, white rice, black beans, pico",price:"$13"},
  {name:"Lemon Pepper Tilapia",desc:"6oz tilapia, lemon pepper seasoning, rice, green beans",price:"$12"},
  {name:"Greek Chicken Bowl",desc:"Grilled chicken, cucumber, tomato, olives, tzatziki",price:"$13"},
  {name:"Lamb Meatball Bowl",desc:"Spiced lamb meatballs, couscous, roasted eggplant",price:"$15"},
  {name:"Korean Beef Bowl",desc:"Bulgogi-style beef, jasmine rice, kimchi, sesame",price:"$14"},
];
const VIDEOS=[
  {title:"Why Full Body Training Wins",desc:"Science behind training every muscle group",dur:"8:24",cat:"Science",bg:"linear-gradient(135deg,#1a0505,#2a1010)"},
  {title:"5 Moves for Explosive Power",desc:"Athletic movements for real strength",dur:"12:10",cat:"Training",bg:"linear-gradient(135deg,#0a0a1a,#101028)"},
  {title:"Meal Prep in 90 Minutes",desc:"Rod's exact weekly prep system",dur:"15:33",cat:"Nutrition",bg:"linear-gradient(135deg,#0a1a0a,#102010)"},
  {title:"Why Most Trainers Stay Broke",desc:"The business side nobody talks about",dur:"10:45",cat:"Business",bg:"linear-gradient(135deg,#1a1a0a,#282810)"},
  {title:"Progressive Overload Explained",desc:"Keep making gains when things plateau",dur:"7:18",cat:"Science",bg:"linear-gradient(135deg,#1a0505,#2a0808)"},
  {title:"Build Your Client Base Fast",desc:"Rod's referral system for free leads",dur:"9:02",cat:"Business",bg:"linear-gradient(135deg,#0a1010,#102020)"},
];
const BLOG_POSTS=[
  {title:"Why Your Body Isn't Changing",cat:"Training",emoji:"💪",date:"May 12, 2026",excerpt:"You're training hard but seeing nothing. Here's the real reason."},
  {title:"The $1,500 Trainer Blueprint",cat:"Business",emoji:"💰",date:"May 8, 2026",excerpt:"Most trainers make $30/hr and burn out. Rod's clients clear $5k months."},
  {title:"Meal Prep Is Power",cat:"Nutrition",emoji:"🥗",date:"May 3, 2026",excerpt:"When you control your food, you control your results."},
  {title:"The Mindset Keeping You Broke",cat:"Mindset",emoji:"🧠",date:"Apr 28, 2026",excerpt:"Your body and bank account have the exact same problem."},
  {title:"From Zero to Certified in 90 Days",cat:"Business",emoji:"🚀",date:"Apr 22, 2026",excerpt:"DeShawn had no cert, no clients. 90 days later: 6 paying clients."},
  {title:"How to Read Your Body's Signals",cat:"Science",emoji:"⚡",date:"Apr 15, 2026",excerpt:"Your body tells you everything. You just haven't learned the language."},
];

// ─── AI PROMPTS ───────────────────────────────────────────────────────────────
const Q_PROMPT=`You are the intake AI for Bodies by Rod. Qualify leads for GRIND $480/mo, HUSTLE $550/mo, EMPIRE $1,500/mo. $75 consult available. Split payments available.
2-4 sentences max. ONE question. Direct, bold, street energy.
Ask: 1) Main goal. 2) Readiness to invest. 3) Timeline. 4) What stopped them. 5) Mover or waiter.
HIGH = clear goals, urgency, growth mindset. LOW = vague, price-fixated, passive.
HIGH end: "You're built for this. Start with the $75 strategy consult — fully credited when you join." → [QUALIFIED]
LOW end: "Come back when you're ready to move." → [NOT_QUALIFIED]`;
const WO_PROMPT=(g,l,d,f)=>`Bodies by Rod trainer. ${d}-day plan. Goal:${g} Level:${l} Focus:${f}. JSON only no markdown:
{"workouts":[{"day":"Day 1 - Chest","exercises":[{"name":"Bench Press","sets":"4x10","howTo":"Keep back flat, grip wider than shoulders, lower slowly, press explosively."}]}]}
4-5 exercises/day with real form cues.`;
const BLOG_PROMPT=(t)=>`Short punchy blog post for Bodies by Rod about: "${t}". 3 short paragraphs. Street energy, direct, no fluff. No headers or markdown.`;
const CHECKIN_PROMPT=(mood,energy,wins,blocks)=>`You're Rod, elite fitness coach. Client check-in: Mood ${mood}/5, Energy ${energy}/5, Wins: "${wins||"none yet"}", Blocking: "${blocks||"nothing"}". Give a direct, real 3-sentence response. Push them forward. No fluff, no corporate speak.`;

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("home");
  const [toast,setToast]=useState(null);
  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(null),4000);};

  const pages=[
    ["home","Home"],["consult","$75 Consult"],["packages","Packages"],["compare","Compare"],
    ["train","Train"],["meals","Meals"],["mealgen","Free Meal Plan"],["sessions","1-on-1 Sessions"],["book","Book"],
    ["checkin","Daily Check-In"],["habits","Habits"],["goals","Goals"],["messages","Messages"],
    ["videos","Videos"],["blog","Blog"],
    ["loyalty","Loyalty"],["leaderboard","Leaderboard"],
    ["progress","Progress"],["referral","Refer & Earn"],
    ["lifewave","LifeWave Patches"],
    ["portal","My Portal"],["admin","Admin"],
  ];

  return(<>
    <style>{CSS}</style>
    {toast&&<div className="toast"><div className="toast-dot"/><div className="toast-msg">{toast}</div></div>}
    <nav className="nav">
      <div className="logo" onClick={()=>setPage("home")}>BODIES<em>.</em>BY ROD<span style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",marginLeft:7,fontWeight:300,verticalAlign:"middle"}}>READY ON DEMAND</span></div>
      <div className="nav-scroll">
        {pages.map(([id,l])=><button key={id} className={`nb ${page===id?"on":""}`} onClick={()=>setPage(id)}>{l}</button>)}
      </div>
      <button className="ncta" onClick={()=>setPage("qualify")}>Get In<span className="nbadge">🔥</span></button>
    </nav>
    <div className="ticker-wrap">
      <div className="ticker-track">
        {[...SOCIAL_TICKS,...SOCIAL_TICKS].map((t,i)=><span key={i} className="tick">✦ <strong>{t.msg}</strong></span>)}
      </div>
    </div>
    <div className="page">
      {page==="home"&&<HomePage setPage={setPage} showToast={showToast}/>}
      {page==="consult"&&<ConsultPage setPage={setPage} showToast={showToast}/>}
      {page==="packages"&&<PackagesPage setPage={setPage} showToast={showToast}/>}
      {page==="compare"&&<ComparePage setPage={setPage}/>}
      {page==="train"&&<TrainPage/>}
      {page==="meals"&&<MealsPage showToast={showToast}/>}
      {page==="mealgen"&&<MealPlanGeneratorPage showToast={showToast}/>}
      {page==="sessions"&&<SessionsPage setPage={setPage} showToast={showToast}/>}
      {page==="book"&&<BookPage showToast={showToast}/>}
      {page==="checkin"&&<CheckInPage showToast={showToast}/>}
      {page==="habits"&&<HabitsPage showToast={showToast}/>}
      {page==="goals"&&<GoalsPage showToast={showToast}/>}
      {page==="messages"&&<MessagesPage/>}
      {page==="videos"&&<VideosPage/>}
      {page==="blog"&&<BlogPage/>}
      {page==="loyalty"&&<LoyaltyPage setPage={setPage}/>}
      {page==="leaderboard"&&<LeaderboardPage/>}
      {page==="progress"&&<ProgressPage showToast={showToast}/>}
      {page==="referral"&&<ReferralPageV2 showToast={showToast}/>}
      {page==="lifewave"&&<LifeWavePage/>}
      {page==="portal"&&<PortalPage setPage={setPage}/>}
      {page==="admin"&&<AdminPage showToast={showToast}/>}
      {page==="qualify"&&<QualifyPage/>}
    </div>
  </>);
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({setPage,showToast}){
  const [email,setEmail]=useState("");
  const [lmDone,setLmDone]=useState(false);
  const [promo,setPromo]=useState("");
  const [promoMsg,setPromoMsg]=useState("");

  const grabMagnet=()=>{
    if(!email.trim())return;
    setLmDone(true);
    showToast("Free 7-Day Meal Plan sent to "+email+"!");
  };
  const checkPromo=()=>{
    const msg=VALID_PROMOS[promo.toUpperCase()];
    setPromoMsg(msg?"✓ "+msg:"✗ Invalid code.");
  };

  return(<>
    <div className="hero">
      <div className="hbg"/><div className="hgrid"/>
      <div className="hcon" style={{animation:"up 0.45s ease forwards"}}>
        <div className="htag"><span className="hd"/>Bodies by Rod · R.O.D. — Ready On Demand</div>
        <h1 className="hh1">BUILD<br/>YOUR<br/><span className="r">BODY.</span><br/>BUILD<br/>YOUR<br/><span className="r">BAG.</span></h1>
        <p className="hsub">Ready On Demand — elite training, real certification, and real leads whenever you need them. Daily accountability. Split payments. Loyalty rewards. The full system built for people who are serious.</p>
        <div className="hbtns">
          <button className="bp" onClick={()=>setPage("qualify")}>See If You Qualify</button>
          <button className="bs" onClick={()=>setPage("consult")}>Book $75 Consult</button>
        </div>
        {!lmDone?(
          <div className="lm">
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>🎁 Free 7-Day Meal Plan</div>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>Rod's exact week-1 nutrition plan. Free. No commitment.</div>
            </div>
            <input className="lm-inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" onKeyDown={e=>e.key==="Enter"&&grabMagnet()}/>
            <button className="lm-btn" onClick={grabMagnet}>Get It Free</button>
          </div>
        ):(
          <div style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:3,padding:"11px 14px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{color:"var(--green)",fontSize:16}}>✓</span>
            <span style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:1,color:"var(--w)"}}>Meal plan sent to {email}!</span>
          </div>
        )}
      </div>
      <div className="mwrap"><div className="mtrack">
        {["Personal Training","Trainer Cert","Meal Prep","Real Leads","Split Pay","Daily Check-In","Habit Tracker","Goal Setter","Loyalty Rewards","Free Meal Plan","R.O.D. — Ready On Demand","Bodies by Rod"].flatMap((t,i)=>[
          <span key={i} className="mi"><span>✦</span>{t}</span>,
          <span key={`b${i}`} className="mi"><span>✦</span>{t}</span>
        ])}
      </div></div>
    </div>

    <div className="stats">
      {[["500+","Transformed"],["R.O.D.","Ready On Demand"],["$75","Consultation"],["20%","Max Discount"]].map(([n,l])=>(
        <div key={l} className="stat"><div className="sn">{n}</div><div className="sl">{l}</div></div>
      ))}
    </div>

    {/* Promo code */}
    <div className="sec" style={{paddingBottom:0}}>
      <div className="card">
        <div className="card-hdr"><span>🏷️</span><span className="card-title">Have a Promo Code?</span></div>
        <div className="card-body">
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <input className="inp" style={{flex:1,minWidth:180}} value={promo} onChange={e=>setPromo(e.target.value)} placeholder="Enter code (try ROD10)" onKeyDown={e=>e.key==="Enter"&&checkPromo()}/>
            <button className="btn btn-gold" style={{flexShrink:0}} onClick={checkPromo}>Apply</button>
          </div>
          {promoMsg&&<div className={promoMsg.startsWith("✓")?"promo-active":""}
            style={{marginTop:10,fontSize:12,color:promoMsg.startsWith("✓")?"var(--green)":"var(--red)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,padding:promoMsg.startsWith("✓")?"8px 12px":"0",border:promoMsg.startsWith("✓")?"1px solid rgba(34,197,94,0.2)":"none",borderRadius:2,background:promoMsg.startsWith("✓")?"rgba(34,197,94,0.06)":"transparent"}}>
            {promoMsg}
          </div>}
          <div style={{fontSize:10,color:"var(--mut)",marginTop:8,fontStyle:"italic"}}>Codes: ROD10 · GRIND2024 · EMPIRE50 · HUSTLE20</div>
        </div>
      </div>
    </div>

    <div className="sec">
      <div className="stag">Results</div><h2 className="sh2">REAL PEOPLE.<br/>REAL CHANGE.</h2>
      <div className="g4">{TRANSFORMS.map((t,i)=>(
        <div key={i} className="trans-card">
          <div className="trans-imgs">
            <div className="tbefore"><div style={{fontSize:38,opacity:0.5}}>{t.b}</div><div className="tlabel">Before</div></div>
            <div className="tafter"><div style={{fontSize:38}}>{t.a}</div><div className="tlabel">After</div></div>
          </div>
          <div style={{padding:"11px 13px"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>{t.name}</div>
            <div style={{fontSize:10,color:"var(--red)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,marginBottom:2}}>{t.result}</div>
            <div style={{fontSize:9,color:"var(--mut)"}}>{t.pkg} · {t.t}</div>
          </div>
        </div>
      ))}</div>
    </div>

    <div className="sec" style={{paddingTop:0}}>
      <div className="stag">Reviews</div><h2 className="sh2">THEY TALK.<br/>WE WORK.</h2>
      <div className="g4">{REVIEWS.map((r,i)=>(
        <div key={i} style={{background:"var(--g1)",border:"1px solid var(--bdr)",borderRadius:3,padding:"16px 14px"}}>
          <div style={{color:"var(--red)",fontSize:11,marginBottom:7,letterSpacing:2}}>{"★".repeat(r.stars)}</div>
          <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.8,fontWeight:300,marginBottom:10,fontStyle:"italic"}}>"{r.text}"</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:600,color:"var(--w)"}}>{r.name}</div>
          <div style={{fontSize:10,color:"var(--red)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,marginTop:1}}>{r.pkg} · {r.date}</div>
        </div>
      ))}</div>
    </div>
    <div className="cta-strip">
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:4,color:"rgba(255,255,255,0.6)",marginBottom:6,textTransform:"uppercase"}}>R.O.D. — Ready On Demand</div>
      <div className="cta-h">READY TO CHANGE YOUR LIFE?</div>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginTop:16}}>
        <button className="btn" onClick={()=>setPage("consult")} style={{fontSize:12}}>Book $75 Consult →</button>
        <button className="btn btn-ol" onClick={()=>setPage("mealgen")} style={{fontSize:12}}>Get Free Meal Plan →</button>
      </div>
      <div className="cta-s">Start with a free meal plan. Book your $75 consult. Never look back.</div>
      <button className="bs" style={{borderColor:"rgba(255,255,255,0.4)",color:"#fff"}} onClick={()=>setPage("consult")}>Book My $75 Consult →</button>
    </div>
  </>);
}

// ─── CONSULT ──────────────────────────────────────────────────────────────────
function ConsultPage({setPage,showToast}){
  const [name,setName]=useState(""); const [email,setEmail]=useState("");
  const [pkg,setPkg]=useState("GRIND — $480/mo"); const [goal,setGoal]=useState("");
  const [step,setStep]=useState(1); // 1=info, 2=payment
  const [done,setDone]=useState(false);

  const proceed=()=>{
    if(!name.trim()||!email.trim())return;
    setStep(2);
  };

  const handleStripe=()=>{
    // Save consult info first
    store.get("bbr_consults",true).then(c=>{
      const list=c||[];
      list.push({id:Date.now(),name,email,pkg,goal,date:new Date().toLocaleDateString(),status:"Pending"});
      store.set("bbr_consults",list,true);
    });
    // Open Stripe checkout
    window.open(STRIPE_CONSULT,"_blank");
    setDone(true);
    showToast("Redirecting to secure checkout...");
  };

  if(done)return(<div className="sec" style={{maxWidth:480,margin:"0 auto"}}>
    <div className="card"><div className="card-body" style={{textAlign:"center",padding:"32px 20px"}}>
      <div style={{fontSize:44,marginBottom:10}}>✅</div>
      <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:24,color:"var(--red)",marginBottom:7}}>PAYMENT COMPLETE</div>
      <div style={{fontSize:13,color:"var(--mut)",lineHeight:1.85,marginBottom:18}}>
        Rod will reach out within 24 hours to schedule your call.<br/>
        <strong style={{color:"var(--w)"}}>Your $75 is fully credited when you join any package.</strong><br/>
        <span style={{color:"var(--gold)"}}>Check your email for your receipt from Stripe.</span>
      </div>
      <button className="btn" onClick={()=>setPage("packages")}>View Packages</button>
    </div></div>
  </div>);

  return(<div className="sec" style={{maxWidth:700}}>
    <div className="stag">Strategy Session</div><h2 className="sh2">ONE CALL.<br/>FULL PLAN.</h2>
    <p className="sbody">$75 gets you on the phone with Rod directly. Full roadmap — body transformation, business setup, what to expect. $75 comes straight off your package when you join.</p>
    <div className="g2" style={{gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))"}}>
      <div style={{background:"linear-gradient(135deg,rgba(232,25,44,0.06),rgba(212,168,67,0.04))",border:"1px solid rgba(232,25,44,0.22)",borderRadius:4,padding:22,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,var(--red),var(--gold),var(--red))",backgroundSize:"200% auto",animation:"shimmer 3s linear infinite"}}/>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:7}}>Strategy Consultation</div>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:46,color:"var(--red)",lineHeight:1,marginBottom:7}}>$75</div>
        <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.8,marginBottom:16,fontWeight:300}}>30 minutes with Rod. Your personal transformation plan. Business opportunity overview. Zero obligation.</div>
        <ul style={{listStyle:"none"}}>
          {["30-min direct call with Rod","Full program walkthrough","Personalized transformation plan","Business overview","$75 credited to your package","No obligation to join"].map((item,j)=>(
            <li key={j} style={{fontSize:11,color:"var(--mut)",padding:"5px 0",borderBottom:"1px solid var(--bdr)",display:"flex",gap:7}}>
              <span style={{color:"var(--gold)"}}>✦</span>{item}
            </li>
          ))}
        </ul>
        {/* Stripe trust badges */}
        <div style={{marginTop:16,padding:"10px 12px",background:"rgba(0,0,0,0.3)",borderRadius:2,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>🔒</span>
          <div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--green)"}}>SECURE CHECKOUT via Stripe</div>
            <div style={{fontSize:9,color:"var(--mut)"}}>256-bit SSL · All major cards accepted</div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">
            {step===1?"Your Information":"Secure Checkout"}
          </span>
          {step===2&&<span style={{marginLeft:"auto",fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--green)"}}>🔒 SECURED BY STRIPE</span>}
        </div>
        <div className="card-body" style={{display:"grid",gap:11}}>
          {step===1?(<>
            <div><div className="lbl">Full Name *</div><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
            <div><div className="lbl">Email *</div><input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
            <div><div className="lbl">Package Interest</div>
              <select className="sel" value={pkg} onChange={e=>setPkg(e.target.value)}>
                {["GRIND — $480/mo","HUSTLE — $550/mo","EMPIRE — $1,500/mo"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div><div className="lbl">Your Main Goal</div><input className="inp" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="What are you trying to achieve?"/></div>
            <div style={{background:"rgba(212,168,67,0.06)",border:"1px solid rgba(212,168,67,0.15)",borderRadius:2,padding:"9px 12px",fontSize:11,color:"var(--gold)",lineHeight:1.6}}>
              💳 $75 fee · fully credited toward any package when you join
            </div>
            <button className="btn btn-full" onClick={proceed} disabled={!name.trim()||!email.trim()}>Continue to Payment →</button>
            <div style={{fontSize:10,color:"var(--mut)",textAlign:"center"}}>Zero pressure · Secure checkout via Stripe</div>
          </>):(<>
            <div style={{background:"var(--g2)",borderRadius:3,padding:"13px 14px",border:"1px solid var(--bdr)"}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,color:"var(--mut)",marginBottom:8}}>ORDER SUMMARY</div>
              {[["Client",name],["Email",email],["Package",pkg],["Item","$75 Strategy Consultation"],["Credit","Applied to package at signup"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid var(--bdr)",fontSize:11}}>
                  <span style={{color:"var(--mut)"}}>{k}</span>
                  <span style={{color:"var(--w)",textAlign:"right",maxWidth:"55%"}}>{v}</span>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0 0",fontSize:13}}>
                <span style={{fontFamily:"'Oswald',sans-serif",fontWeight:700,color:"var(--w)"}}>TOTAL</span>
                <span style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--red)"}}>$75.00</span>
              </div>
            </div>
            {/* Payment method icons */}
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {["💳 Visa","💳 Mastercard","💳 Amex","🍎 Apple Pay","🔵 Google Pay"].map(card=>(
                <span key={card} style={{background:"var(--g3)",border:"1px solid var(--bdr)",borderRadius:2,padding:"3px 8px",fontSize:9,color:"var(--mut)",fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>{card}</span>
              ))}
            </div>
            <button className="btn btn-full" onClick={handleStripe} style={{background:"var(--green)",fontSize:12,padding:"13px"}}>
              🔒 Pay $75 Securely with Stripe →
            </button>
            <button className="btn-ol btn btn-sm" onClick={()=>setStep(1)} style={{textAlign:"center"}}>← Back</button>
            <div style={{fontSize:9,color:"var(--mut)",textAlign:"center",lineHeight:1.6}}>
              You will be redirected to Stripe's secure checkout.<br/>
              Receipt sent to {email} · Rod confirms within 24 hours.
            </div>
          </>)}
        </div>
      </div>
    </div>
  </div>);
}

// ─── PACKAGES ─────────────────────────────────────────────────────────────────
function PackagesPage({setPage,showToast}){
  const [payMode,setPayMode]=useState({});
  return(<div className="sec" style={{maxWidth:960}}>
    <div className="stag">Pricing</div><h2 className="sh2">ALL IN.<br/>YOUR WAY.</h2>
    <p className="sbody">Three tiers. Pay full or split it in two payments every other week. Everything included.</p>
    <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.14)",borderRadius:3,padding:"13px 16px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:11}}>
      <div style={{fontSize:18,flexShrink:0}}>💳</div>
      <div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:2,color:"var(--gold)",textTransform:"uppercase",marginBottom:3}}>Split Payment Available on All Packages</div>
        <div style={{fontSize:12,color:"var(--mut)",fontWeight:300,lineHeight:1.65}}>Pay half now, other half in 2 weeks. Full payment = instant access. Your choice.</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
      {PACKAGES.map((p,i)=>{
        const mode=payMode[p.name]||"full";
        const split=p.split;
        return(<div key={i} className={`pkg ${p.feat?"feat":""}`}>
          {p.badge&&<div className="pbadge">{p.badge}</div>}
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:4,textTransform:"uppercase",color:"var(--red)",marginBottom:5}}>{p.tier}</div>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:22,color:"var(--w)",marginBottom:2}}>{p.name}</div>
          <div style={{display:"flex",gap:6,margin:"10px 0"}}>
            {["full","split"].map(m=>(
              <button key={m} onClick={()=>setPayMode(pm=>({...pm,[p.name]:m}))}
                style={{flex:1,padding:"7px 6px",border:`1px solid ${mode===m?"var(--red)":"var(--bdr)"}`,background:mode===m?"rgba(232,25,44,0.08)":"transparent",color:mode===m?"var(--w)":"var(--mut)",fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",borderRadius:2,transition:"all 0.2s"}}>
                {m==="full"?"Full Pay":"Split Pay"}
              </button>
            ))}
          </div>
          {mode==="full"?(
            <div style={{marginBottom:3}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:30,fontWeight:700,color:"var(--w)"}}><sup style={{fontSize:14,verticalAlign:"top",marginTop:8,display:"inline-block"}}>$</sup>{p.price.toLocaleString()}</span>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>/month · paid in full</div>
            </div>
          ):(
            <div style={{marginBottom:3}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:30,fontWeight:700,color:"var(--w)"}}><sup style={{fontSize:14,verticalAlign:"top",marginTop:8,display:"inline-block"}}>$</sup>{split.toLocaleString()}</span>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>now · then ${split.toLocaleString()} in 2 weeks</div>
              <div style={{fontSize:10,color:"var(--gold)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,marginTop:1}}>= ${p.price.toLocaleString()}/mo total</div>
            </div>
          )}
          {p.consult&&<div style={{background:"rgba(212,168,67,0.07)",border:"1px solid rgba(212,168,67,0.16)",borderRadius:2,padding:"5px 9px",fontSize:10,color:"var(--gold)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,margin:"8px 0",display:"inline-flex",alignItems:"center",gap:5}}>✦ Includes $75 Consultation</div>}
          <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.65,margin:"8px 0 12px",fontWeight:300}}>{p.desc}</div>
          <ul style={{listStyle:"none",marginBottom:16}}>{p.items.map((f,j)=>(
            <li key={j} style={{fontSize:11,color:"var(--mut)",padding:"5px 0",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"flex-start",gap:7}}>
              <span style={{color:"var(--red)",fontSize:11,flexShrink:0}}>✓</span>{f}
            </li>
          ))}</ul>
          <button className={`btn btn-full ${p.feat?"":"btn-ol"}`} onClick={()=>{
            const link=mode==="split"?p.stripeSplitLink:p.stripeLink;
            window.open(link,"_blank");
            showToast("Redirecting to secure Stripe checkout...");
          }}>
            🔒 {p.consult?"Pay & Book Consult":"Pay Securely with Stripe"}
          </button>
          <div style={{display:"flex",justifyContent:"center",gap:5,marginTop:6,flexWrap:"wrap"}}>
            {["Visa","MC","Amex","Apple Pay"].map(c=>(
              <span key={c} style={{fontSize:8,color:"var(--mut)",background:"var(--g3)",padding:"2px 6px",borderRadius:1,fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>{c}</span>
            ))}
          </div>
          <div style={{fontSize:9,color:"var(--green)",textAlign:"center",marginTop:4,fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>🔒 256-BIT SSL · SECURED BY STRIPE</div>
        </div>);
      })}
    </div>
    <div style={{marginTop:20}} className="upsell">
      <div style={{fontSize:22}}>🏆</div>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>Refer friends → Get up to 20% off every month permanently</div>
        <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>The more people you bring in, the lower your monthly price drops. Forever.</div>
      </div>
      <button className="btn btn-sm btn-gold" onClick={()=>setPage("loyalty")}>See Rewards →</button>
    </div>
  </div>);
}

// ─── COMPARE ──────────────────────────────────────────────────────────────────
function ComparePage({setPage}){
  const features=[
    ["Custom Workout Program","✓","✓","✓"],
    ["AI Meal Plan","✓","✓","✓"],
    ["Meal Prep (10/mo min)","✓","✓","✓"],
    ["Weekly Check-ins","✓","✓","✓"],
    ["Daily Check-In + AI Response","✓","✓","✓"],
    ["Habit Tracker","✓","✓","✓"],
    ["Goal Setter","✓","✓","✓"],
    ["$75 Strategy Consult","✓","✓","—"],
    ["Trainer Certification","—","✓","✓"],
    ["Done-For-You Templates","—","✓","✓"],
    ["Lead Gen Training","—","✓","✓"],
    ["Monthly 1-on-1 Call","—","✓","✓"],
    ["Weekly 1-on-1 Calls","—","—","✓"],
    ["Real Leads Provided","—","—","✓"],
    ["Revenue Share","—","—","✓"],
    ["Custom Brand Kit","—","—","✓"],
    ["Mentorship Under Rod","—","—","✓"],
  ];
  return(<div className="sec" style={{maxWidth:860}}>
    <div className="stag">Side by Side</div><h2 className="sh2">COMPARE.<br/>THEN DECIDE.</h2>
    <p className="sbody">See exactly what's in each package before you commit. No surprises.</p>
    <div style={{overflowX:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:0,minWidth:480}}>
        <div style={{padding:"12px 12px 12px 0"}}/>
        {PACKAGES.map((p,i)=>(
          <div key={i} className={p.feat?"cmp-hdr feat":"cmp-hdr"}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:3,color:"var(--red)",textTransform:"uppercase",marginBottom:3}}>{p.tier}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--w)",marginBottom:2}}>{p.name}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:18,fontWeight:700,color:"var(--w)"}}>${p.price.toLocaleString()}<span style={{fontSize:10,color:"var(--mut)",fontWeight:300}}>/mo</span></div>
            {p.feat&&<div><span className="badge badge-red" style={{marginTop:5,display:"inline-block"}}>BEST</span></div>}
          </div>
        ))}
        {features.map(([label,...cells],i)=>[
          <div key={`l${i}`} style={{padding:"9px 12px 9px 0",borderBottom:"1px solid var(--bdr)",fontSize:11,color:"var(--mut)",fontWeight:300,display:"flex",alignItems:"center"}}>{label}</div>,
          ...cells.map((c,j)=>(
            <div key={`c${i}${j}`} style={{padding:"9px 8px",borderBottom:"1px solid var(--bdr)",borderLeft:"1px solid var(--bdr)",textAlign:"center",fontSize:13,color:c==="✓"?"var(--green)":"rgba(240,235,227,0.15)",background:j===1?"rgba(232,25,44,0.02)":"transparent"}}>{c}</div>
          ))
        ])}
        <div/>
        {PACKAGES.map((p,i)=>(
          <div key={i} style={{padding:"12px 8px",borderTop:"1px solid var(--bdr)",textAlign:"center"}}>
            <button className={`btn btn-sm ${p.feat?"":"btn-ol"}`} onClick={()=>setPage("consult")}>{p.consult?"Consult":"Start"}</button>
          </div>
        ))}
      </div>
    </div>
  </div>);
}

// ─── DAILY CHECK-IN ───────────────────────────────────────────────────────────
function CheckInPage({showToast}){
  const [mood,setMood]=useState(null);
  const [energy,setEnergy]=useState(null);
  const [wins,setWins]=useState("");
  const [blocks,setBlocks]=useState("");
  const [loading,setLoading]=useState(false);
  const [response,setResponse]=useState("");
  const [done,setDone]=useState(false);
  const [history,setHistory]=useState([]);
  const moods=[{e:"😞",l:"Rough"},{e:"😕",l:"Meh"},{e:"😐",l:"Okay"},{e:"😊",l:"Good"},{e:"🔥",l:"Fired Up"}];

  useEffect(()=>{store.get("bbr_checkins").then(h=>setHistory(h||[]));},[]);

  const submit=async()=>{
    if(!mood||!energy)return;
    setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:250,messages:[{role:"user",content:CHECKIN_PROMPT(mood,energy,wins,blocks)}]})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"Keep pushing. You're closer than you think.";
      setResponse(reply);
      const h=await store.get("bbr_checkins")||[];
      h.unshift({date:new Date().toLocaleDateString(),mood,energy,wins,blocks,response:reply});
      await store.set("bbr_checkins",h.slice(0,30));
      setHistory(h.slice(0,30));
      setDone(true);showToast("Check-in submitted!");
    }catch{setResponse("Keep pushing. Rod sees you.");}
    setLoading(false);
  };

  return(<div className="sec" style={{maxWidth:620}}>
    <div className="stag">Daily Check-In</div><h2 className="sh2">HOW YOU<br/>DOING TODAY?</h2>
    <p className="sbody">Rod checks these personally. Be real. Your check-in shapes your coaching for the week.</p>
    {!done?(
      <div className="card">
        <div className="card-hdr"><span>📊</span><span className="card-title">Today's Check-In</span></div>
        <div className="card-body">
          <div style={{marginBottom:14}}>
            <div className="lbl">How's your mood today?</div>
            <div className="mood-grid">
              {moods.map((m,i)=>(
                <div key={i} className={`mood-opt ${mood===i+1?"sel":""}`} onClick={()=>setMood(i+1)}>
                  <div style={{fontSize:22,marginBottom:3}}>{m.e}</div>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--mut)",textTransform:"uppercase"}}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div className="lbl">Energy level today (1–5)</div>
            <div style={{display:"flex",gap:7,marginTop:7}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} onClick={()=>setEnergy(n)} style={{flex:1,padding:"9px 4px",border:`1px solid ${energy===n?"var(--red)":"var(--bdr)"}`,background:energy===n?"rgba(232,25,44,0.1)":"var(--g2)",color:energy===n?"var(--w)":"var(--mut)",fontFamily:"'Black Han Sans',sans-serif",fontSize:17,cursor:"pointer",borderRadius:2,transition:"all 0.2s"}}>{n}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:11}}><div className="lbl">What did you win today?</div><input className="inp" value={wins} onChange={e=>setWins(e.target.value)} placeholder="Workout done, stuck to meal plan, closed a client..."/></div>
          <div style={{marginBottom:14}}><div className="lbl">What's blocking you?</div><input className="inp" value={blocks} onChange={e=>setBlocks(e.target.value)} placeholder="Tired, schedule off, not feeling it..."/></div>
          <button className="btn btn-full" onClick={submit} disabled={!mood||!energy||loading}>{loading?"Getting Rod's response...":"Submit Check-In →"}</button>
        </div>
      </div>
    ):(
      <div className="card" style={{marginBottom:16}}>
        <div className="card-hdr"><span>💬</span><span className="card-title">Rod's Response</span></div>
        <div className="card-body">
          <div style={{fontSize:14,color:"var(--w)",lineHeight:1.85,fontWeight:300,marginBottom:12}}>{response}</div>
          <div style={{fontSize:11,color:"var(--mut)",fontStyle:"italic",marginBottom:14}}>— Rod</div>
          <button className="btn btn-ol btn-sm" onClick={()=>{setDone(false);setMood(null);setEnergy(null);setWins("");setBlocks("");}}>New Check-In</button>
        </div>
      </div>
    )}
    {history.length>0&&(
      <div className="card" style={{marginTop:16}}>
        <div className="card-hdr"><span className="card-title">Check-In History</span></div>
        <div className="card-body">
          {history.slice(0,5).map((h,i)=>(
            <div key={i} className="row-item">
              <div className="row-av" style={{background:"var(--g3)",fontSize:16}}>{moods[(h.mood||1)-1]?.e||"😐"}</div>
              <div style={{flex:1}}>
                <div className="row-name" style={{fontSize:12}}>Mood {h.mood}/5 · Energy {h.energy}/5</div>
                <div className="row-sub">{h.date}{h.wins&&` · "${h.wins.slice(0,30)}"`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>);
}

// ─── HABITS ───────────────────────────────────────────────────────────────────
function HabitsPage({showToast}){
  const [habits,setHabits]=useState({});
  const today=new Date();
  const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-6+i);return d.toLocaleDateString("en",{weekday:"short"});});
  useEffect(()=>{store.get("bbr_habits").then(h=>setHabits(h||{}));},[]);
  const toggle=async(habit,day)=>{
    const key=`${habit}|${day}`;
    const updated={...habits,[key]:!habits[key]};
    setHabits(updated);await store.set("bbr_habits",updated);
    if(!habits[key])showToast(`${habit} ✓`);
  };
  const score=Math.round((Object.values(habits).filter(Boolean).length/(HABITS.length*7))*100);
  const done=Object.values(habits).filter(Boolean).length;
  return(<div className="sec">
    <div className="stag">Habit Tracker</div><h2 className="sh2">BUILD THE<br/>DISCIPLINE.</h2>
    <p className="sbody">Check off habits every day. Clients who hit 5+ habits/day see 2x faster results. Rod tracks your consistency score.</p>
    <div className="g3" style={{marginBottom:20,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
      {[["Weekly Score",`${score}%`,score>=70?"var(--green)":score>=40?"var(--gold)":"var(--red)"],
        ["Habits Done",`${done}`,"var(--red)"],
        ["Streak","7 days","var(--gold)"]
      ].map(([l,v,c])=>(<div key={l} className="metric"><div className="metric-val" style={{color:c}}>{v}</div><div className="metric-lbl">{l}</div></div>))}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginBottom:6,paddingRight:0}}>
      {weekDays.map(d=><div key={d} style={{width:26,textAlign:"center",fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:1,color:"var(--mut)",textTransform:"uppercase"}}>{d}</div>)}
    </div>
    <div className="card"><div className="card-body">
      {HABITS.map((h,i)=>(
        <div key={i} className="habit-row">
          <div style={{fontSize:16,flexShrink:0}}>{h.icon}</div>
          <div style={{flex:1,fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--w)"}}>{h.name}</div>
          <div style={{display:"flex",gap:3}}>
            {weekDays.map(d=>{
              const key=`${h.name}|${d}`;
              return <div key={d} className={`hday ${habits[key]?"done":""}`} onClick={()=>toggle(h.name,d)}>{habits[key]?"✓":d[0]}</div>;
            })}
          </div>
        </div>
      ))}
    </div></div>
    <div style={{marginTop:14,padding:"11px 14px",background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.13)",borderRadius:3,fontSize:11,color:"var(--mut)",lineHeight:1.7}}>
      💡 <strong style={{color:"var(--w)"}}>Rod's rule:</strong> 5+ habits/day = 2x faster results. 7-day streak = you're in the zone.
    </div>
  </div>);
}

// ─── GOALS ────────────────────────────────────────────────────────────────────
function GoalsPage({showToast}){
  const [goals,setGoals]=useState([]);
  const [title,setTitle]=useState(""); const [target,setTarget]=useState("");
  const [deadline,setDeadline]=useState(""); const [category,setCategory]=useState("Fitness");
  useEffect(()=>{store.get("bbr_goals").then(g=>setGoals(g||[]));},[]);
  const addGoal=async()=>{
    if(!title.trim()||!deadline)return;
    const ng={id:Date.now(),title,target,deadline,category,progress:0,created:new Date().toLocaleDateString()};
    const updated=[ng,...goals];
    setGoals(updated);await store.set("bbr_goals",updated);
    setTitle("");setTarget("");setDeadline("");
    showToast("Goal set. Now go get it.");
  };
  const updateProg=async(id,val)=>{
    const updated=goals.map(g=>g.id===id?{...g,progress:Math.min(100,Math.max(0,parseInt(val)||0))}:g);
    setGoals(updated);await store.set("bbr_goals",updated);
  };
  const catCol={"Fitness":"var(--red)","Business":"var(--gold)","Weight":"var(--green)","Income":"var(--blue)"};
  return(<div className="sec">
    <div className="stag">Goal Setter</div><h2 className="sh2">SET THE TARGET.<br/>HIT IT.</h2>
    <p className="sbody">Define what you're chasing. Give it a deadline. Track it daily. Rod uses your goals to calibrate your program every week.</p>
    <div className="card" style={{marginBottom:18}}>
      <div className="card-hdr"><span>🎯</span><span className="card-title">New Goal</span></div>
      <div className="card-body">
        <div className="g2" style={{marginBottom:11}}>
          <div><div className="lbl">Goal Title *</div><input className="inp" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Lose 20 lbs"/></div>
          <div><div className="lbl">Category</div>
            <select className="sel" value={category} onChange={e=>setCategory(e.target.value)}>
              {["Fitness","Business","Weight","Income"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div><div className="lbl">Target</div><input className="inp" value={target} onChange={e=>setTarget(e.target.value)} placeholder="e.g. 185 lbs, $5k/mo"/></div>
          <div><div className="lbl">Deadline *</div><input className="inp" type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
        </div>
        <button className="btn btn-full" onClick={addGoal} disabled={!title.trim()||!deadline}>Set My Goal →</button>
      </div>
    </div>
    {goals.map((g,i)=>{
      const daysLeft=Math.max(0,Math.ceil((new Date(g.deadline)-new Date())/(1000*60*60*24)));
      const col=catCol[g.category]||"var(--red)";
      return(<div key={g.id} className="goal-card" style={{marginBottom:11}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
          <div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,color:col,textTransform:"uppercase",marginBottom:3}}>{g.category}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:15,fontWeight:600,color:"var(--w)"}}>{g.title}</div>
            {g.target&&<div style={{fontSize:11,color:"var(--mut)",marginTop:2}}>Target: {g.target}</div>}
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:36,color:col,lineHeight:1}}>{daysLeft}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--mut)",marginTop:3}}>days left</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--mut)",textTransform:"uppercase"}}>Progress</span>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--w)",fontWeight:600}}>{g.progress}%</span>
        </div>
        <div className="prog-wrap" style={{marginBottom:8}}><div className="prog-fill" style={{width:`${g.progress}%`,background:col}}/></div>
        <input type="range" min="0" max="100" value={g.progress} onChange={e=>updateProg(g.id,e.target.value)} style={{width:"100%",accentColor:col,cursor:"pointer"}}/>
      </div>);
    })}
  </div>);
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function MessagesPage(){
  const [auth,setAuth]=useState(false);
  const [name,setName]=useState("");
  const [msgs,setMsgs]=useState([
    {from:"rod",text:"What's good! Saw your check-in — energy was low. Drink more water today and do a light 20-min walk. That'll reset you.",time:"9:14 AM"},
    {from:"rod",text:"Meal plan for this week is locked in. Check your portal. Swap anything you want before Wednesday.",time:"Yesterday"},
  ]);
  const [input,setInput]=useState("");
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send=()=>{
    if(!input.trim())return;
    const time=new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"});
    const newMsgs=[...msgs,{from:"me",text:input,time}];
    setMsgs(newMsgs);setInput("");
    setTimeout(()=>{
      setMsgs(m=>[...m,{from:"rod",text:"Got it. I'll review and get back to you. Keep moving in the meantime.",time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}]);
    },1800);
  };

  if(!auth)return(<div className="sec" style={{maxWidth:440,margin:"0 auto"}}>
    <div className="stag">Direct Messages</div><h2 className="sh2">MESSAGE ROD.</h2>
    <div className="card"><div className="card-body">
      <div style={{marginBottom:11}}><div className="lbl">Your Name</div><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="First name" onKeyDown={e=>e.key==="Enter"&&name.trim()&&setAuth(true)}/></div>
      <button className="btn btn-full" onClick={()=>name.trim()&&setAuth(true)} disabled={!name.trim()}>Open Messages →</button>
    </div></div>
  </div>);

  return(<div className="sec" style={{maxWidth:560}}>
    <div className="stag">Direct Messages</div><h2 className="sh2">YOU & ROD.</h2>
    <div className="card" style={{overflow:"hidden"}}>
      <div className="card-hdr">
        <div className="ch-av">R</div>
        <div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--w)"}}>Rod · Bodies by Rod</div>
          <div style={{fontSize:10,color:"var(--green)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>Active · Replies within 2 hours
          </div>
        </div>
      </div>
      <div className="msg-thread">
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.from==="me"?"flex-end":"flex-start"}}>
            <div className={`msg-bub ${m.from==="rod"?"rod":"me"}`}>{m.text}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:1,color:"var(--mut)",marginTop:3}}>{m.from==="rod"?"Rod · ":""}{m.time}</div>
          </div>
        ))}
        <div ref={ref}/>
      </div>
      <div className="ch-inp-row">
        <input className="ch-inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Message Rod..."/>
        <button className="ch-send" onClick={send} disabled={!input.trim()}>Send</button>
      </div>
    </div>
    <div style={{fontSize:10,color:"var(--mut)",textAlign:"center",marginTop:9}}>Messages reviewed by Rod personally · Active clients get priority</div>
  </div>);
}

// ─── TRAIN ────────────────────────────────────────────────────────────────────
function TrainPage(){
  const [goal,setGoal]=useState("Build Muscle"); const [level,setLevel]=useState("Intermediate");
  const [days,setDays]=useState("4"); const [focus,setFocus]=useState("Full Body");
  const [loading,setLoading]=useState(false); const [plan,setPlan]=useState(null);
  const generate=async()=>{
    setLoading(true);setPlan(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:WO_PROMPT(goal,level,days,focus)}]})});
      const data=await res.json();
      setPlan(JSON.parse((data.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));
    }catch(e){console.error(e);}
    setLoading(false);
  };
  return(<div className="sec">
    <div className="stag">AI Training</div><h2 className="sh2">YOUR PROGRAM.<br/>BUILT RIGHT.</h2>
    <p className="sbody">Set your goal. Get a full program with real form cues — exactly how Rod would break it down.</p>
    <div className="card">
      <div className="card-hdr"><span style={{color:"var(--red)"}}>⚡</span><span className="card-title">Workout Generator</span></div>
      <div className="card-body">
        <div className="g2" style={{marginBottom:13}}>
          {[["Goal",goal,setGoal,["Build Muscle","Lose Weight","Athletic Performance","Tone & Define","Increase Strength"]],
            ["Level",level,setLevel,["Beginner","Intermediate","Advanced"]],
            ["Days/Week",days,setDays,["3","4","5","6"]],
            ["Focus",focus,setFocus,["Full Body","Upper / Lower","Push / Pull / Legs","Cardio + Strength"]]
          ].map(([l,v,s,o])=>(<div key={l}><div className="lbl">{l}</div>
            <select className="sel" value={v} onChange={e=>s(e.target.value)}>{o.map(x=><option key={x}>{x}</option>)}</select>
          </div>))}
        </div>
        <button className="btn btn-full" onClick={generate} disabled={loading}>{loading?"Building...":"Generate My Program →"}</button>
        {plan?.workouts&&<div style={{marginTop:16}}>
          {plan.workouts.map((day,i)=>(<div key={i} style={{marginBottom:18}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"var(--red)",marginBottom:9,paddingBottom:6,borderBottom:"1px solid var(--bdr)"}}>{day.day}</div>
            {day.exercises?.map((ex,j)=>(<div key={j} style={{padding:"10px 0",borderBottom:"1px solid var(--bdr)"}}>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>{ex.name}</div>
              <div style={{fontSize:11,color:"var(--red)",fontFamily:"'Oswald',sans-serif",marginBottom:4}}>{ex.sets}</div>
              <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.7,fontWeight:300}}>{ex.howTo}</div>
            </div>))}
          </div>))}
        </div>}
      </div>
    </div>
  </div>);
}

// ─── MEALS ────────────────────────────────────────────────────────────────────
function MealsPage({showToast}){
  const [tab,setTab]=useState("menu"); const [cart,setCart]=useState({});
  const [custom,setCustom]=useState(""); const [cname,setCname]=useState("");
  const [done,setDone]=useState(false);
  const total=Object.values(cart).reduce((a,b)=>a+b,0);
  const MIN=10;
  const add=(n)=>setCart(c=>({...c,[n]:(c[n]||0)+1}));
  const remove=(n)=>setCart(c=>{const x={...c};if(x[n]>1)x[n]--;else delete x[n];return x;});
  const place=async()=>{
    if((total<MIN&&!custom.trim())||!cname.trim())return;
    const orders=await store.get("bbr_orders",true)||[];
    orders.push({id:Date.now(),client:cname,items:cart,custom,total,date:new Date().toLocaleDateString(),monthly:true});
    await store.set("bbr_orders",orders,true);
    setDone(true);showToast("Meal order placed!");
  };
  if(done)return(<div className="sec"><div className="card"><div className="card-body" style={{textAlign:"center",padding:"28px"}}>
    <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:24,color:"var(--red)",marginBottom:7}}>ORDER LOCKED IN ✓</div>
    <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.8,marginBottom:16}}>Rod confirms within 24 hours. Monthly auto-renewal active.</div>
    <button className="btn" onClick={()=>{setDone(false);setCart({});setCustom("");setCname("");}}>New Order</button>
  </div></div></div>);
  return(<div className="sec">
    <div className="stag">R.O.D. Meals — Ready On Demand</div><h2 className="sh2">EAT WITH PURPOSE.</h2>
    <p className="sbody">R.O.D. Meals — Ready On Demand. Fresh weekly meal prep built around your goals, portioned in tins, and ready when you are. Pick Rod's menu or go fully custom. 10 meal minimum. Monthly subscription.</p>
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(232,25,44,0.07)",border:"1px solid rgba(232,25,44,0.22)",borderRadius:2,padding:"5px 11px",fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--red)",textTransform:"uppercase",marginBottom:16}}>
      ⚡ R.O.D. Meals · 10 Meal Minimum · Monthly Auto-Renewal
    </div>
    <div className="card">
      <div className="tab-row">
        {[["menu","Rod's Menu"],["custom","Custom"],["summary","My Order"]].map(([id,l])=>(
          <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>
        ))}
      </div>
      <div style={{padding:"0 17px 18px"}}>
        {tab==="menu"&&<>{MENU_ITEMS.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--bdr)"}}>
            <div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:500,color:"var(--w)",marginBottom:2}}>{item.name}</div><div style={{fontSize:10,color:"var(--mut)",fontWeight:300}}>{item.desc}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0,marginLeft:9}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--red)",fontWeight:600,whiteSpace:"nowrap"}}>{item.price}</span>
              {cart[item.name]>0&&<div style={{display:"flex",alignItems:"center",gap:3}}>
                <button style={{background:"none",border:"1px solid var(--bdr)",color:"var(--mut)",width:24,height:24,borderRadius:2,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>remove(item.name)}>−</button>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--w)",minWidth:14,textAlign:"center"}}>{cart[item.name]}</span>
              </div>}
              <button style={{background:"none",border:`1px solid ${cart[item.name]?"var(--red)":"var(--bdr)"}`,color:cart[item.name]?"var(--red)":"var(--mut)",width:24,height:24,borderRadius:2,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>add(item.name)}>+</button>
            </div>
          </div>
        ))}
        <div style={{marginTop:12,padding:"9px 12px",background:"var(--g2)",border:"1px solid var(--bdr)",borderRadius:2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:"var(--mut)",letterSpacing:1}}>TOTAL MEALS</span>
          <span style={{fontFamily:"'Oswald',sans-serif",fontSize:17,color:total>=MIN?"var(--red)":"rgba(240,235,227,0.22)",fontWeight:700}}>{total}/{MIN}</span>
        </div></>}
        {tab==="custom"&&<><div style={{fontSize:12,color:"var(--mut)",marginBottom:12,lineHeight:1.7,fontWeight:300}}>Describe your exact meals. Proteins, restrictions, how many of each. 10 meal minimum.</div>
          <textarea className="ta" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="5 chicken dinners, 5 egg white breakfasts, no dairy..."/></>}
        {tab==="summary"&&<>
          <div style={{marginBottom:11}}><div className="lbl">Your Name</div><input className="inp" value={cname} onChange={e=>setCname(e.target.value)} placeholder="First name"/></div>
          <div style={{background:"var(--g2)",border:"1px solid var(--bdr)",borderRadius:2,padding:13,marginBottom:11}}>
            {Object.entries(cart).length>0?Object.entries(cart).map(([n,q])=>(
              <div key={n} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0"}}>
                <span style={{color:"var(--w)"}}>{n}</span><span style={{color:"var(--red)",fontFamily:"'Oswald',sans-serif"}}>×{q}</span>
              </div>
            )):<div style={{fontSize:11,color:"var(--mut)"}}>No items yet.</div>}
            {custom&&<div style={{marginTop:7,fontSize:10,color:"var(--mut)",borderTop:"1px solid var(--bdr)",paddingTop:7}}>Custom: "{custom.slice(0,50)}{custom.length>50?"...":""}"</div>}
            <div style={{borderTop:"1px solid var(--bdr)",marginTop:9,paddingTop:9,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:"var(--mut)",letterSpacing:1}}>TOTAL</span>
              <span style={{fontFamily:"'Oswald',sans-serif",fontSize:15,color:"var(--red)",fontWeight:700}}>{total} meals</span>
            </div>
          </div>
          <button className="btn btn-full" onClick={place} disabled={(total<MIN&&!custom.trim())||!cname.trim()}>
            {total>=MIN||custom.trim()?"Place Monthly Order →":`Add ${Math.max(0,MIN-total)} More Meals`}
          </button>
        </>}
      </div>
    </div>
  </div>);
}

// ─── BOOK ─────────────────────────────────────────────────────────────────────
function BookPage({showToast}){
  const today=new Date();
  const [yr,setYr]=useState(today.getFullYear()); const [mo,setMo]=useState(today.getMonth());
  const [selDay,setSelDay]=useState(null); const [selTime,setSelTime]=useState(null);
  const [bookings,setBookings]=useState({}); const [waitlist,setWaitlist]=useState([]);
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [goal,setGoal]=useState("");
  const [success,setSuccess]=useState(null); const [wlName,setWlName]=useState(""); const [wlDone,setWlDone]=useState(false);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([store.get("bbr_bookings",true),store.get("bbr_waitlist",true)]).then(([b,w])=>{setBookings(b||{});setWaitlist(w||[]);setLoading(false);});},[]);
  const prevMo=()=>{if(mo===0){setYr(y=>y-1);setMo(11);}else setMo(m=>m-1);setSelDay(null);setSelTime(null);};
  const nextMo=()=>{if(mo===11){setYr(y=>y+1);setMo(0);}else setMo(m=>m+1);setSelDay(null);setSelTime(null);};
  const dk=(d)=>`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const isPast=(d)=>new Date(yr,mo,d)<new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const isTaken=(d,t)=>bookings[dk(d)]?.includes(t);
  const isFull=(d)=>bookings[dk(d)]?.length>=TIMES.length;
  const dim=new Date(yr,mo+1,0).getDate(); const fd=new Date(yr,mo,1).getDay();
  const book=async()=>{
    if(!selDay||!selTime||!name.trim())return;
    const key=dk(selDay);
    const updated={...bookings,[key]:[...(bookings[key]||[]),selTime]};
    await store.set("bbr_bookings",updated,true);
    setBookings(updated);setSuccess({day:selDay,time:selTime});showToast("Session booked!");
  };
  const joinWl=async()=>{
    if(!wlName.trim())return;
    const updated=[...waitlist,{name:wlName,date:new Date().toLocaleDateString()}];
    await store.set("bbr_waitlist",updated,true);
    setWaitlist(updated);setWlDone(true);showToast("Added to waitlist!");
  };
  if(loading)return <div className="sec" style={{textAlign:"center",color:"var(--mut)",paddingTop:80}}>LOADING...</div>;
  if(success)return(<div className="sec"><div className="card"><div className="card-body" style={{textAlign:"center",padding:"28px"}}>
    <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:24,color:"var(--red)",marginBottom:7}}>SESSION BOOKED ✓</div>
    <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.9}}>{MONTHS[mo]} {success.day}, {yr} at {success.time}<br/>Rod confirms via DM. Show up ready.</div>
    <button className="btn" style={{marginTop:14}} onClick={()=>{setSuccess(null);setSelDay(null);setSelTime(null);setName("");setEmail("");setGoal("");}}>Book Another</button>
  </div></div></div>);
  return(<div className="sec">
    <div className="stag">1-on-1 Sessions</div><h2 className="sh2">BOOK YOUR TIME.</h2>
    <p className="sbody">Live calendar. Booked slots are gone instantly. Join the waitlist if full.</p>
    <div className="card" style={{marginBottom:14}}>
      <div className="card-hdr"><span style={{color:"var(--red)"}}>📅</span><span className="card-title">Live Calendar — 7 Days All Hours</span></div>
      <div className="card-body">
        <div className="cal-nav">
          <button className="cal-arr" onClick={prevMo}>‹</button>
          <span className="cal-month">{MONTHS[mo]} {yr}</span>
          <button className="cal-arr" onClick={nextMo}>›</button>
        </div>
        <div className="cgrid">
          {DOW.map(d=><div key={d} className="cdow">{d}</div>)}
          {Array(fd).fill(null).map((_,i)=><div key={`e${i}`} className="cd emp"/>)}
          {Array(dim).fill(null).map((_,i)=>{const d=i+1,past=isPast(d),full=isFull(d),sel=selDay===d;
            return <div key={d} className={`cd ${past?"past":full?"full":sel?"sel":"avail"}`} onClick={()=>{if(!past&&!full){setSelDay(d);setSelTime(null);}}}>{d}</div>;
          })}
        </div>
        {selDay&&<><div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:"var(--mut)",marginBottom:9}}>Times — {MONTHS[mo]} {selDay}</div>
          <div className="tgrid">{TIMES.map(t=>{const taken=isTaken(selDay,t),sel=selTime===t;
            return <div key={t} className={`ts ${taken?"taken":sel?"sel":""}`} onClick={()=>!taken&&setSelTime(t)}>{t}</div>;
          })}</div></>}
        {selDay&&selTime&&<div style={{display:"grid",gap:10}}>
          <div style={{background:"rgba(232,25,44,0.07)",border:"1px solid rgba(232,25,44,0.2)",borderRadius:2,padding:"8px 12px",fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--red)",letterSpacing:1}}>{MONTHS[mo]} {selDay}, {yr} · {selTime}</div>
          <div><div className="lbl">Name *</div><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"/></div>
          <div><div className="lbl">Email</div><input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/></div>
          <div><div className="lbl">Goal</div><input className="inp" value={goal} onChange={e=>setGoal(e.target.value)} placeholder="What to work on?"/></div>
          <button className="btn btn-full" onClick={book} disabled={!name.trim()}>Confirm Booking →</button>
        </div>}
      </div>
    </div>
    <div className="card">
      <div className="card-hdr"><span style={{color:"var(--gold)"}}>⏳</span><span className="card-title">Waitlist {waitlist.length>0&&`(${waitlist.length})`}</span></div>
      <div className="card-body">
        {wlDone?<div style={{textAlign:"center",padding:"10px 0"}}><div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:17,color:"var(--gold)",marginBottom:3}}>ON THE LIST ✓</div><div style={{fontSize:11,color:"var(--mut)"}}>Rod notifies you when a slot opens.</div></div>
        :<><div style={{fontSize:11,color:"var(--mut)",marginBottom:11,lineHeight:1.7,fontWeight:300}}>Fully booked? Join the waitlist. First to know when something opens.</div>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <input className="inp" style={{flex:1}} value={wlName} onChange={e=>setWlName(e.target.value)} placeholder="Your name"/>
            <button className="btn btn-gold" style={{flexShrink:0}} onClick={joinWl} disabled={!wlName.trim()}>Join Waitlist</button>
          </div></>}
      </div>
    </div>
  </div>);
}

// ─── VIDEOS ───────────────────────────────────────────────────────────────────
function VideosPage(){
  const [filter,setFilter]=useState("All");
  const cats=["All","Training","Nutrition","Science","Business"];
  const filtered=filter==="All"?VIDEOS:VIDEOS.filter(v=>v.cat===filter);
  return(<div className="sec">
    <div className="stag">Knowledge</div><h2 className="sh2">WATCH. LEARN.<br/>APPLY.</h2>
    <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} className={`btn btn-sm ${filter===c?"":"btn-ol"}`}>{c}</button>)}
    </div>
    <div className="g4">{filtered.map((v,i)=>(
      <div key={i} style={{background:"var(--g1)",border:"1px solid var(--bdr)",borderRadius:3,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
        <div style={{height:140,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",background:v.bg}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>▶</div>
          <div style={{position:"absolute",bottom:7,right:7,background:"rgba(0,0,0,0.75)",padding:"2px 6px",borderRadius:2,fontFamily:"'Oswald',sans-serif",fontSize:9}}>{v.dur}</div>
          <div style={{position:"absolute",top:7,left:7,background:"var(--red)",padding:"2px 6px",borderRadius:2,fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:2,textTransform:"uppercase"}}>{v.cat}</div>
        </div>
        <div style={{padding:"11px 13px"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:500,color:"var(--w)",marginBottom:3}}>{v.title}</div>
          <div style={{fontSize:10,color:"var(--mut)",lineHeight:1.5}}>{v.desc}</div>
        </div>
      </div>
    ))}</div>
  </div>);
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────
function BlogPage(){
  const [active,setActive]=useState(null); const [loading,setLoading]=useState(false);
  const [content,setContent]=useState(""); const [filter,setFilter]=useState("All");
  const cats=["All","Training","Nutrition","Business","Mindset","Science"];
  const filtered=filter==="All"?BLOG_POSTS:BLOG_POSTS.filter(p=>p.cat===filter);
  const open=async(post)=>{
    setActive(post);setLoading(true);setContent("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,messages:[{role:"user",content:BLOG_PROMPT(post.title)}]})});
      const data=await res.json();
      setContent(data.content?.[0]?.text||"");
    }catch{setContent("Loading error.");}
    setLoading(false);
  };
  if(active)return(<div className="sec" style={{maxWidth:640}}>
    <button className="btn btn-sm btn-ol" style={{marginBottom:18}} onClick={()=>setActive(null)}>← Back</button>
    <div className="stag">{active.cat}</div>
    <h2 className="sh2" style={{fontSize:"clamp(20px,4vw,36px)",marginBottom:7}}>{active.title}</h2>
    <div style={{fontSize:10,color:"var(--mut)",fontFamily:"'Oswald',sans-serif",letterSpacing:1,marginBottom:20}}>BODIES BY ROD · {active.date}</div>
    {loading?<div style={{display:"flex",gap:4}}><div className="td"/><div className="td"/><div className="td"/></div>
    :<div style={{fontSize:13,color:"var(--mut)",lineHeight:1.95,fontWeight:300,whiteSpace:"pre-wrap"}}>{content}</div>}
  </div>);
  return(<div className="sec">
    <div className="stag">Blog</div><h2 className="sh2">THE BLOG.</h2>
    <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} className={`btn btn-sm ${filter===c?"":"btn-ol"}`}>{c}</button>)}
    </div>
    <div className="g4">{filtered.map((p,i)=>(
      <div key={i} style={{background:"var(--g1)",border:"1px solid var(--bdr)",borderRadius:3,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s"}} onClick={()=>open(p)} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
        <div style={{height:110,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#1a0505,#200a0a)",position:"relative"}}>
          <div style={{fontSize:38}}>{p.emoji}</div>
          <div style={{position:"absolute",top:7,left:7,background:"var(--red)",padding:"2px 7px",borderRadius:2,fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:2,textTransform:"uppercase",color:"#fff"}}>{p.cat}</div>
        </div>
        <div style={{padding:"12px 14px"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:4,lineHeight:1.3}}>{p.title}</div>
          <div style={{fontSize:10,color:"var(--mut)",lineHeight:1.7,fontWeight:300,marginBottom:7}}>{p.excerpt}</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--mut)"}}>{p.date} · Read →</div>
        </div>
      </div>
    ))}</div>
  </div>);
}

// ─── LOYALTY ──────────────────────────────────────────────────────────────────
function LoyaltyPage({setPage}){
  const [userRefs,setUserRefs]=useState(0); const [rewardMode,setRewardMode]=useState(null); const [rname,setRname]=useState("");
  const currentTier=LOYALTY_TIERS.filter(t=>userRefs>=t.refs).pop();
  const nextTier=LOYALTY_TIERS.find(t=>userRefs<t.refs);
  const disc=currentTier?.discount||0; const base=550;
  const discounted=Math.round(base*(1-disc/100));
  return(<div className="sec" style={{maxWidth:800}}>
    <div className="stag">Loyalty Program</div><h2 className="sh2">REFER MORE.<br/>PAY LESS.</h2>
    <p className="sbody">Every referral that joins permanently cuts your monthly bill. Stack referrals, stack savings. Max 20% off forever.</p>
    <div className="card" style={{marginBottom:20}}>
      <div className="card-hdr"><span style={{color:"var(--gold)"}}>🧮</span><span className="card-title">Discount Calculator</span></div>
      <div className="card-body">
        <div style={{marginBottom:13}}><div className="lbl">Referrals joined so far</div>
          <div style={{display:"flex",gap:7,marginTop:7}}>
            {[0,1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>setUserRefs(n)} style={{width:38,height:38,border:`1px solid ${userRefs===n?"var(--red)":"var(--bdr)"}`,background:userRefs===n?"rgba(232,25,44,0.1)":"var(--g2)",color:userRefs===n?"var(--w)":"var(--mut)",fontFamily:"'Black Han Sans',sans-serif",fontSize:16,cursor:"pointer",borderRadius:2,transition:"all 0.2s"}}>
                {n}{n===5?"+":""}
              </button>
            ))}
          </div>
        </div>
        <div className="g3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))"}}>
          {[["Discount",`${disc}%`,disc>0?"var(--gold)":"var(--red)"],["Saved/Mo",`$${base-discounted}`,"var(--green)"],["You Pay",`$${discounted}`,"var(--w)"],["Saved/Yr",`$${(base-discounted)*12}`,"var(--gold)"]].map(([l,v,c])=>(
            <div key={l} className="metric"><div className="metric-val" style={{color:c}}>{v}</div><div className="metric-lbl">{l}</div></div>
          ))}
        </div>
        {nextTier&&<div style={{marginTop:11,fontSize:11,color:"var(--mut)",padding:"7px 11px",background:"var(--g2)",borderRadius:2}}>
          🎯 Bring in <strong style={{color:"var(--w)"}}>{nextTier.refs-userRefs} more</strong> to unlock <strong style={{color:"var(--gold)"}}>{nextTier.discount}% off</strong>
        </div>}
      </div>
    </div>
    {LOYALTY_TIERS.map((t,i)=>(
      <div key={i} className={`loyalty-tier ${userRefs>=t.refs?"active":""}`}>
        <div style={{fontSize:24,flexShrink:0}}>{t.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>{t.label}</div>
          <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>{t.desc}</div>
        </div>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:22,color:"var(--gold)",marginLeft:"auto",flexShrink:0}}>{t.discount}%</div>
        {userRefs>=t.refs&&<span className="badge badge-green">UNLOCKED</span>}
      </div>
    ))}
    {disc>0&&<div className="card" style={{marginTop:18}}>
      <div className="card-hdr"><span style={{color:"var(--gold)"}}>💰</span><span className="card-title">Claim Your {disc}% Reward</span></div>
      <div className="card-body">
        <div style={{marginBottom:13}}><div className="lbl">Your Name</div><input className="inp" value={rname} onChange={e=>setRname(e.target.value)} placeholder="Enter your name"/></div>
        <div className="g2" style={{marginBottom:13}}>
          {[["Bill Credit",`-$${base-discounted}/mo`,"Applied to next bill automatically"],["Cash Out",`$${base-discounted}/mo`,"Via Cash App, Zelle, or PayPal"]].map(([t,v,d],i)=>(
            <div key={i} className={`pay-opt ${rewardMode===t?"selected":""}`} onClick={()=>setRewardMode(t)}>
              {rewardMode===t&&<div style={{width:15,height:15,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,marginBottom:5}}>✓</div>}
              <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:15,color:"var(--w)",marginBottom:2}}>{t}</div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:"var(--gold)",marginBottom:3}}>{v}</div>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>{d}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-full btn-gold" disabled={!rewardMode||!rname.trim()} onClick={()=>alert(`✅ ${rewardMode} of $${base-discounted} submitted for ${rname}! Rod confirms within 24 hours.`)}>Submit Claim →</button>
      </div>
    </div>}
  </div>);
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function LeaderboardPage(){
  const medals=["🥇","🥈","🥉"];
  return(<div className="sec" style={{maxWidth:640}}>
    <div className="stag">Affiliate Leaderboard</div><h2 className="sh2">TOP EARNERS.</h2>
    <p className="sbody">These are the people stacking referrals and getting paid. Your name could be here next month.</p>
    <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.13)",borderRadius:3,padding:"11px 15px",marginBottom:18,display:"flex",gap:16,flexWrap:"wrap"}}>
      {[["Top Referrer","Tanisha W. · 12","🥇"],["Most Earned","Brandon L. · $2,100","💰"],["This Month","Marcus T. · 3","⚡"]].map(([l,v,e])=>(
        <div key={l} style={{flex:1,minWidth:130,textAlign:"center"}}>
          <div style={{fontSize:18,marginBottom:3}}>{e}</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--gold)",marginBottom:2}}>{l}</div>
          <div style={{fontSize:11,color:"var(--w)",fontWeight:500}}>{v}</div>
        </div>
      ))}
    </div>
    {LEADERBOARD.map((p,i)=>(
      <div key={i} className="lb-row">
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:18,width:26,textAlign:"center",color:i<3?"var(--gold)":"var(--mut)"}}>{i<3?medals[i]:`#${i+1}`}</div>
        <div style={{width:34,height:34,borderRadius:3,background:i===0?"var(--gold)":i===1?"#888":i===2?"#a06030":"var(--g3)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Black Han Sans',sans-serif",fontSize:15,color:i<3?"#000":"var(--w)",flexShrink:0}}>{p.av}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)"}}>{p.name}</div>
          <div style={{fontSize:10,color:"var(--mut)",fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>{p.pkg} Member</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:17,color:"var(--red)"}}>{p.refs} refs</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:"var(--gold)",letterSpacing:1}}>{p.earned} earned</div>
        </div>
      </div>
    ))}
    <div style={{marginTop:14,fontSize:11,color:"var(--mut)",textAlign:"center",fontStyle:"italic"}}>Updated in real time · Top 3 earn bonus rewards each month</div>
  </div>);
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
function ProgressPage({showToast}){
  const [entries,setEntries]=useState([]);
  const [weight,setWeight]=useState(""); const [chest,setChest]=useState("");
  const [waist,setWaist]=useState(""); const [note,setNote]=useState("");
  useEffect(()=>{store.get("bbr_progress").then(d=>setEntries(d||[]));},[]);
  const save=async()=>{
    if(!weight)return;
    const entry={date:new Date().toLocaleDateString(),weight,chest,waist,note};
    const updated=[entry,...entries].slice(0,20);
    await store.set("bbr_progress",updated);
    setEntries(updated);setWeight("");setChest("");setWaist("");setNote("");
    showToast("Progress logged!");
  };
  const latest=entries[0],prev=entries[1];
  const wChange=latest&&prev?((parseFloat(latest.weight)-parseFloat(prev.weight)).toFixed(1)):null;
  return(<div className="sec">
    <div className="stag">Progress</div><h2 className="sh2">TRACK YOUR WINS.</h2>
    <p className="sbody">Log your stats. Watch yourself change. Rod sees your numbers during every check-in.</p>
    {latest&&<div className="g3" style={{marginBottom:20,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
      {[["Weight",latest.weight?`${latest.weight} lbs`:"—",wChange?`${parseFloat(wChange)>0?"+":""}${wChange} lbs`:""],
        ["Chest",latest.chest?`${latest.chest}"`:"—",""],["Waist",latest.waist?`${latest.waist}"`:"—",""]
      ].map(([l,v,sub])=>(<div key={l} className="metric">
        <div className="metric-val">{v}</div><div className="metric-lbl">{l}</div>
        {sub&&<div style={{fontSize:9,color:parseFloat(sub)<0?"var(--green)":"var(--red)",fontFamily:"'Oswald',sans-serif",marginTop:3,letterSpacing:1}}>{sub}</div>}
      </div>))}
    </div>}
    <div className="card" style={{marginBottom:18}}>
      <div className="card-hdr"><span style={{color:"var(--red)"}}>📊</span><span className="card-title">Log Today</span></div>
      <div className="card-body">
        <div className="g2" style={{marginBottom:11}}>
          <div><div className="lbl">Weight (lbs) *</div><input className="inp" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="185"/></div>
          <div><div className="lbl">Chest (in)</div><input className="inp" value={chest} onChange={e=>setChest(e.target.value)} placeholder='40"'/></div>
          <div><div className="lbl">Waist (in)</div><input className="inp" value={waist} onChange={e=>setWaist(e.target.value)} placeholder='34"'/></div>
          <div><div className="lbl">Note</div><input className="inp" value={note} onChange={e=>setNote(e.target.value)} placeholder="Wins? How are you feeling?"/></div>
        </div>
        <button className="btn btn-full" onClick={save} disabled={!weight}>Log Progress →</button>
      </div>
    </div>
    {entries.length>0&&<div className="card"><div className="card-hdr"><span className="card-title">History</span></div>
      <div className="card-body">{entries.map((e,i)=>(
        <div key={i} className="row-item">
          <div className="row-av" style={{background:"var(--g3)",fontSize:10,color:"var(--mut)"}}>#{entries.length-i}</div>
          <div style={{flex:1}}>
            <div className="row-name" style={{fontSize:12}}>{e.weight} lbs{e.chest&&` · ${e.chest}"`}{e.waist&&` · ${e.waist}"`}</div>
            <div className="row-sub">{e.date}{e.note&&` · "${e.note}"`}</div>
          </div>
        </div>
      ))}</div>
    </div>}
  </div>);
}

// ─── REFERRAL ─────────────────────────────────────────────────────────────────
function ReferralPage({showToast}){
  const [name,setName]=useState(""); const [refLink,setRefLink]=useState(""); const [refs,setRefs]=useState([]);
  const [copied,setCopied]=useState(false);
  useEffect(()=>{store.get("bbr_referral").then(d=>{if(d){setName(d.name);setRefLink(d.link);setRefs(d.refs||[]);}});},[]);
  const generate=async()=>{
    if(!name.trim())return;
    const code=name.toLowerCase().replace(/\s+/,"")+Math.floor(Math.random()*9000+1000);
    const link=`bodiesbyrod.com/ref/${code}`;
    const data={name,link,code,refs:[
      {name:"Marcus J.",pkg:"HUSTLE",status:"Joined",earned:"$50 cash",date:"May 10"},
      {name:"Tasha R.",pkg:"Pending",status:"Qualified",earned:"Pending",date:"May 14"},
    ]};
    await store.set("bbr_referral",data);
    setRefLink(link);setRefs(data.refs);showToast("Referral link created!");
  };
  const copy=()=>{navigator.clipboard?.writeText(refLink);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return(<div className="sec">
    <div className="stag">Refer & Earn</div><h2 className="sh2">SEND PEOPLE.<br/>GET PAID.</h2>
    <p className="sbody">Your link. Their join. Your cash. Stack referrals to unlock loyalty discounts on top of cash payouts.</p>
    <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.15)",borderRadius:3,padding:"14px 16px",marginBottom:20}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:8}}>Referral Reward Structure</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {[
          ["GRIND","Loyalty Points","500 pts per referral\nRedeemable for discounts,\nfree meals & merch","var(--mut)"],
          ["HUSTLE","$50 Cash","Paid via Cash App,\nZelle, or Venmo\nwithin 48 hours","var(--green)"],
          ["EMPIRE","$300 Credit","Applied to your\nnext month payment\nautomatically","var(--gold)"],
        ].map(([pkg,reward,desc,col])=>(
          <div key={pkg} style={{textAlign:"center",padding:"12px 8px",background:"rgba(212,168,67,0.05)",borderRadius:3,border:"1px solid rgba(212,168,67,0.12)"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",textTransform:"uppercase",marginBottom:4}}>{pkg}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:15,color:col,marginBottom:4,lineHeight:1.2}}>{reward}</div>
            <div style={{fontSize:9,color:"var(--mut)",lineHeight:1.6,whiteSpace:"pre-line"}}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:10,fontSize:9,color:"var(--mut)",textAlign:"center",fontStyle:"italic"}}>
        Loyalty points never expire · Cash paid within 48 hrs · Credits auto-applied next billing cycle
      </div>
    </div>
    {!refLink?(<div className="card"><div className="card-body">
      <div className="lbl" style={{marginBottom:5}}>Your Name</div>
      <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" style={{marginBottom:11}}/>
      <button className="btn btn-full btn-gold" onClick={generate} disabled={!name.trim()}>Generate My Link →</button>
    </div></div>):(
    <>
      <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.18)",borderRadius:3,padding:16,textAlign:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:5}}>Your Link</div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--gold)",letterSpacing:1,wordBreak:"break-all",margin:"7px 0"}}>{refLink}</div>
        <button className="btn btn-gold btn-sm" onClick={copy}>{copied?"Copied! ✓":"Copy Link"}</button>
        <div className="g3" style={{marginTop:13,gridTemplateColumns:"repeat(3,1fr)"}}>
          {[["2","Referrals"],["1","Joined"],["$50","Earned"]].map(([v,l])=>(
            <div key={l} style={{background:"rgba(212,168,67,0.05)",borderRadius:2,padding:"9px 5px",textAlign:"center"}}>
              <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:18,color:"var(--gold)"}}>{v}</div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {refs.length>0&&<div className="card"><div className="card-hdr"><span className="card-title">Your Referrals</span></div>
        <div className="card-body">{refs.map((r,i)=>(
          <div key={i} className="row-item">
            <div className="row-av" style={{background:"var(--gold)",color:"#000",fontSize:13}}>{r.name[0]}</div>
            <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{r.name}</div><div className="row-sub">{r.pkg} · {r.date}</div></div>
            <div><span className={`badge ${r.status==="Joined"?"badge-green":"badge-gold"}`}>{r.status}</span>
              <div style={{fontSize:10,color:"var(--gold)",fontFamily:"'Oswald',sans-serif",textAlign:"right",marginTop:2}}>{r.earned}</div>
            </div>
          </div>
        ))}</div>
      </div>}
    </>)}
  </div>);
}

// ─── TESTIMONIAL COLLECTOR ────────────────────────────────────────────────────
function TestimonialCollector({showToast}){
  const [rating,setRating]=useState(0); const [hover,setHover]=useState(0);
  const [text,setText]=useState(""); const [name,setName]=useState(""); const [pkg,setPkg]=useState("HUSTLE");
  const [done,setDone]=useState(false);
  const submit=async()=>{
    if(!rating||!text.trim()||!name.trim())return;
    const reviews=await store.get("bbr_reviews",true)||[];
    reviews.push({id:Date.now(),rating,text,name,pkg,date:new Date().toLocaleDateString(),status:"Pending"});
    await store.set("bbr_reviews",reviews,true);
    setDone(true);showToast("Review submitted! Thank you.");
  };
  if(done)return(<div style={{textAlign:"center",padding:"24px 0"}}>
    <div style={{fontSize:36,marginBottom:8}}>⭐</div>
    <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--red)",marginBottom:5}}>REVIEW SUBMITTED</div>
    <div style={{fontSize:12,color:"var(--mut)"}}>Rod reviews all testimonials personally. Thanks for sharing.</div>
  </div>);
  return(<div style={{display:"grid",gap:11}}>
    <div>
      <div className="lbl">Your Rating</div>
      <div style={{display:"flex",gap:6,marginTop:7}}>
        {[1,2,3,4,5].map(s=>(
          <span key={s} className={`star ${s<=(hover||rating)?"lit":""}`} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(s)}>⭐</span>
        ))}
      </div>
    </div>
    <div><div className="lbl">Your Name</div><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="First name"/></div>
    <div><div className="lbl">Package</div>
      <select className="sel" value={pkg} onChange={e=>setPkg(e.target.value)}>
        {["GRIND","HUSTLE","EMPIRE"].map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
    <div><div className="lbl">Your Experience *</div>
      <textarea className="ta" value={text} onChange={e=>setText(e.target.value)} placeholder="Tell us what Bodies by Rod did for you. Be real — other people need to hear it."/>
    </div>
    <button className="btn btn-full" onClick={submit} disabled={!rating||!text.trim()||!name.trim()}>Submit My Review →</button>
  </div>);
}

// ─── PORTAL ───────────────────────────────────────────────────────────────────
function PortalPage({setPage}){
  const [tab,setTab]=useState("overview");
  const [auth,setAuth]=useState(false); const [loginName,setLoginName]=useState("");
  const [showTestimonial,setShowTestimonial]=useState(false);
  const [monthsActive]=useState(3);
  const [toastMsg,setToastMsg]=useState(null);
  const showToast=(msg)=>{setToastMsg(msg);setTimeout(()=>setToastMsg(null),4000);};

  if(!auth)return(<div className="sec" style={{maxWidth:440,margin:"0 auto"}}>
    <div className="stag">Client Portal</div><h2 className="sh2">WELCOME BACK.</h2>
    <div className="card"><div className="card-body">
      <div style={{marginBottom:11}}><div className="lbl">Your Name</div><input className="inp" value={loginName} onChange={e=>setLoginName(e.target.value)} placeholder="First name"/></div>
      <div style={{marginBottom:14}}><div className="lbl">Access Code</div><input className="inp" placeholder="Provided by Rod" type="password"/></div>
      <button className="btn btn-full" onClick={()=>loginName.trim()&&setAuth(true)} disabled={!loginName.trim()}>Access Portal →</button>
      <div style={{fontSize:10,color:"var(--mut)",textAlign:"center",marginTop:9}}>No code? <span style={{color:"var(--red)",cursor:"pointer"}} onClick={()=>setPage("consult")}>Book a $75 consult first →</span></div>
    </div></div>
  </div>);

  return(<div className="sec">
    {toastMsg&&<div className="toast"><div className="toast-dot"/><div className="toast-msg">{toastMsg}</div></div>}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div><div className="stag">Client Portal</div><h2 className="sh2" style={{fontSize:"clamp(20px,4vw,34px)",marginBottom:0}}>Welcome, {loginName}.</h2></div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        <span className="badge badge-green">HUSTLE · Active</span>
        {monthsActive>=3&&<span className="badge badge-gold">🔥 {monthsActive}-Month Streak</span>}
      </div>
    </div>
    <div className="upsell" style={{marginBottom:18}}>
      <div style={{fontSize:22}}>👑</div>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:13,fontWeight:600,color:"var(--w)",marginBottom:2}}>You've been grinding {monthsActive} months. Ready for EMPIRE?</div>
        <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>Weekly calls, real leads, revenue share. Your discounts carry over.</div>
      </div>
      <button className="btn btn-sm btn-gold" onClick={()=>setPage("packages")}>Upgrade →</button>
    </div>
    <div className="tab-row">
      {[["overview","Overview"],["program","My Program"],["meals","Meal Plan"],["sessions","Sessions"],["docs","Templates"],["rewards","My Rewards"],["review","Leave Review"]].map(([id,l])=>(
        <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>
      ))}
    </div>
    {tab==="overview"&&(<div>
      <LevelBadge points={320}/>
      <StreakCounter streak={7} habits={5} checkins={12}/>
      <div className="g3" style={{marginBottom:18,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
        {[[`${monthsActive}`,"Months In"],["8 lbs","Lost"],["3","Sessions Left"],["10%","Your Discount"]].map(([v,l])=>(
          <div key={l} className="metric"><div className="metric-val">{v}</div><div className="metric-lbl">{l}</div></div>
        ))}
      </div>
      {monthsActive>=3&&<div style={{background:"linear-gradient(90deg,rgba(212,168,67,0.08),rgba(232,25,44,0.04))",border:"1px solid rgba(212,168,67,0.22)",borderRadius:3,padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:11}}>
        <div style={{fontSize:26}}>🔥</div>
        <div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--gold)",marginBottom:3}}>{monthsActive}-Month Streak Milestone Unlocked</div>
          <div style={{fontSize:11,color:"var(--mut)",fontWeight:300}}>5% streak discount applied on top of your referral savings.</div>
        </div>
      </div>}
      <div className="card"><div className="card-hdr"><span className="card-title">This Week's Goals</span></div>
        <div className="card-body">
          {[["Complete 4 workout sessions","In Progress"],["Meal prep Sunday","Pending"],["Daily check-in every day","3/7"],["Watch business module 3","Pending"]].map(([t,s])=>(
            <div key={t} className="row-item">
              <div style={{width:7,height:7,borderRadius:"50%",background:s==="In Progress"?"var(--red)":s.includes("/")?"var(--gold)":"var(--bdr)",flexShrink:0}}/>
              <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{t}</div></div>
              <span className={`badge ${s==="In Progress"?"badge-red":s.includes("/")?"badge-gold":"badge-gray"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>)}
    {tab==="program"&&(<div className="card"><div className="card-hdr"><span className="card-title">Week {monthsActive*4} Program</span></div>
      <div className="card-body">
        {[{day:"Monday",focus:"Upper Body Push",ex:["Bench Press 4×10","Shoulder Press 3×12","Tricep Dips 3×15"]},
          {day:"Wednesday",focus:"Lower Body",ex:["Squats 4×10","Romanian Deadlift 3×12","Leg Press 3×15"]},
          {day:"Friday",focus:"Upper Body Pull",ex:["Pull-Ups 4×8","Barbell Row 3×10","Bicep Curls 3×12"]},
          {day:"Saturday",focus:"Full Body",ex:["Deadlift 4×6","Kettlebell Swings 3×15","Plank 3×60s"]}
        ].map((d,i)=>(<div key={i} style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--bdr)"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:2,color:"var(--red)",textTransform:"uppercase",marginBottom:6}}>{d.day} — {d.focus}</div>
          {d.ex.map((e,j)=><div key={j} style={{fontSize:11,color:"var(--mut)",padding:"3px 0",display:"flex",alignItems:"center",gap:6}}><span style={{color:"var(--red)",fontSize:9}}>›</span>{e}</div>)}
        </div>))}
      </div>
    </div>)}
    {tab==="meals"&&(<div className="card"><div className="card-hdr"><span className="card-title">This Week's Meal Plan</span></div>
      <div className="card-body">
        {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day=>(
          <div key={day} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid var(--bdr)"}}>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,color:"var(--red)",textTransform:"uppercase",marginBottom:7}}>{day}</div>
            {[["Breakfast","Egg White Omelette","380 cal"],["Lunch","Grilled Chicken & Rice","520 cal"],["Dinner","Salmon Power Bowl","490 cal"],["Snack","Greek Yogurt + Almonds","220 cal"]].map(([meal,food,cal])=>(
              <div key={meal} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"4px 0",borderBottom:"1px solid var(--bdr)"}}>
                <div><div style={{fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:2,color:"var(--mut)",textTransform:"uppercase",marginBottom:1}}>{meal}</div><div style={{color:"var(--w)"}}>{food}</div></div>
                <div style={{color:"var(--mut)",fontSize:10}}>{cal}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>)}
    {tab==="sessions"&&(<div className="card"><div className="card-hdr"><span className="card-title">Sessions</span></div>
      <div className="card-body">
        {[{date:"May 14",time:"10:00 AM",focus:"Form Check + Progress",status:"Completed"},
          {date:"May 7",time:"9:00 AM",focus:"Business Strategy",status:"Completed"},
          {date:"May 28",time:"10:00 AM",focus:"Month 4 Game Plan",status:"Upcoming"},
        ].map((s,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{background:s.status==="Upcoming"?"var(--red)":"var(--g3)",fontSize:10,color:s.status==="Upcoming"?"#fff":"var(--mut)"}}>{s.status==="Upcoming"?"→":"✓"}</div>
          <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{s.focus}</div><div className="row-sub">{s.date} · {s.time}</div></div>
          <span className={`badge ${s.status==="Upcoming"?"badge-red":"badge-gray"}`}>{s.status}</span>
        </div>))}
      </div>
    </div>)}
    {tab==="docs"&&(<div className="card"><div className="card-hdr"><span className="card-title">Done-For-You Templates</span></div>
      <div className="card-body">
        {[["Client Intake Form","Use to onboard your own clients"],["30-Day Challenge Program","Ready to sell immediately"],["Social Media Content Calendar","30 days of posts"],["Pricing & Package Script","Word-for-word how to close"],["Meal Prep Business Template","Launch meal prep as a service"],["Referral Request Script","How to ask for referrals"]].map(([t,d],i)=>(
          <div key={i} className="row-item">
            <div className="row-av" style={{background:"var(--g3)",color:"var(--red)",fontSize:13}}>📄</div>
            <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{t}</div><div className="row-sub">{d}</div></div>
            <button className="btn btn-sm btn-ol">Download</button>
          </div>
        ))}
      </div>
    </div>)}
    {tab==="rewards"&&(<div>
      <div className="g3" style={{marginBottom:18,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
        {[["2","Referrals Made"],["10%","Current Discount"],["$110","Cash Earned"],["3 mo","Active Streak"]].map(([v,l])=>(
          <div key={l} className="metric"><div className="metric-val" style={{color:"var(--gold)"}}>{v}</div><div className="metric-lbl">{l}</div></div>
        ))}
      </div>
      <div className="card"><div className="card-hdr"><span className="card-title">Claim 10% Discount</span></div>
        <div className="card-body">
          <div className="g2" style={{marginBottom:13}}>
            {[["Bill Credit","-$55/month","Applied to next bill automatically"],["Cash Out","$55/month","Sent via Cash App, Zelle, or PayPal"]].map(([t,v,d],i)=>(
              <div key={i} style={{border:"1px solid var(--bdr)",borderRadius:3,padding:"13px 14px",cursor:"pointer",transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--red)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bdr)"}>
                <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:14,color:"var(--w)",marginBottom:2}}>{t}</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,color:"var(--gold)",marginBottom:3}}>{v}</div>
                <div style={{fontSize:10,color:"var(--mut)",fontWeight:300}}>{d}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-full btn-gold" onClick={()=>showToast("Claim submitted! Rod will confirm within 24 hours.")}>Claim My Reward →</button>
        </div>
      </div>
    </div>)}
    {tab==="review"&&(<div className="card"><div className="card-hdr"><span>⭐</span><span className="card-title">Leave Your Review</span></div>
      <div className="card-body"><TestimonialCollector showToast={showToast}/></div>
    </div>)}
  </div>);
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPage({showToast}){
  const [tab,setTab]=useState("dashboard");
  const [pin,setPin]=useState(""); const [auth,setAuth]=useState(false);
  const [bookings,setBookings]=useState({});
  const [orders,setOrders]=useState([]);
  const [consults,setConsults]=useState([]);
  const [waitlist,setWaitlist]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [promoActive,setPromoActive]=useState(false);
  const [promoCode,setPromoCode]=useState(""); const [promoDesc,setPromoDesc]=useState("");

  useEffect(()=>{if(auth){
    store.get("bbr_bookings",true).then(b=>setBookings(b||{}));
    store.get("bbr_orders",true).then(o=>setOrders(o||[]));
    store.get("bbr_consults",true).then(c=>setConsults(c||[]));
    store.get("bbr_waitlist",true).then(w=>setWaitlist(w||[]));
    store.get("bbr_reviews",true).then(r=>setReviews(r||[]));
  }},[auth]);

  if(!auth)return(<div className="sec" style={{maxWidth:360,margin:"0 auto"}}>
    <div className="stag">Admin</div><h2 className="sh2">ROD'S DASHBOARD.</h2>
    <div className="card"><div className="card-body">
      <div className="lbl" style={{marginBottom:5}}>Admin PIN</div>
      <input className="inp" type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&pin==="1234"&&setAuth(true)} placeholder="Enter PIN" style={{marginBottom:11}}/>
      <button className="btn btn-full" onClick={()=>pin==="1234"&&setAuth(true)}>Access Dashboard</button>
      <div style={{fontSize:10,color:"var(--mut)",textAlign:"center",marginTop:7}}>Demo PIN: 1234</div>
    </div></div>
  </div>);

  const allBookings=Object.entries(bookings).flatMap(([date,times])=>times.map(t=>({date,time:t})));
  const retentionData=[
    {name:"Marcus T.",score:94,color:"var(--green)"},
    {name:"Tanisha W.",score:98,color:"var(--green)"},
    {name:"Keisha M.",score:72,color:"var(--gold)"},
    {name:"Brandon L.",score:61,color:"var(--gold)"},
    {name:"Jordan P.",score:38,color:"var(--red)"},
  ];

  return(<div className="sec">
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10}}>
      <div><div className="stag">Admin</div><h2 className="sh2" style={{fontSize:"clamp(20px,4vw,34px)",marginBottom:0}}>Rod's Dashboard</h2></div>
      <button className="btn btn-sm btn-ol" onClick={()=>setAuth(false)}>Log Out</button>
    </div>
    <div className="tab-row">
      {[["dashboard","Overview"],["consults",`Consults${consults.length>0?` (${consults.length})`:""}`],
        ["bookings","Bookings"],["orders","Meal Orders"],
        ["waitlist",`Waitlist${waitlist.length>0?` (${waitlist.length})`:""}`],
        ["leads","Leads"],["retention","Retention"],["revenue","Revenue"],
        ["promos","Promo Codes"],["reviews","Reviews"]
      ].map(([id,l])=>(
        <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>
      ))}
    </div>

    {tab==="dashboard"&&(<>
      <div className="g3" style={{marginBottom:18,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
        {[["$9,210","Monthly Revenue"],["14","Active Clients"],["$75","Consult Fee"],["20%","Max Loyalty"]].map(([v,l])=>(
          <div key={l} className="metric"><div className="metric-val">{v}</div><div className="metric-lbl">{l}</div></div>
        ))}
      </div>
      {/* Revenue Forecast */}
      <div className="card" style={{marginBottom:14}}>
        <div className="card-hdr"><span style={{color:"var(--gold)"}}>📈</span><span className="card-title">Revenue Forecast</span></div>
        <div className="card-body">
          {[["30 Days","$9,210","Based on 14 active clients"],["60 Days","$11,450","If 3 Grind → Hustle upgrades"],["90 Days","$14,800","If 2 new Empire clients join"]].map(([period,amount,note])=>(
            <div key={period} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:11,letterSpacing:2,color:"var(--mut)",textTransform:"uppercase"}}>{period}</span>
                <span style={{fontFamily:"'Oswald',sans-serif",fontSize:13,color:"var(--w)",fontWeight:600}}>{amount}</span>
              </div>
              <div className="prog-wrap"><div className="prog-fill" style={{width:period==="30 Days"?"62%":period==="60 Days"?"78%":"100%",background:"var(--gold)"}}/></div>
              <div style={{fontSize:10,color:"var(--mut)",marginTop:3}}>{note}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card"><div className="card-hdr"><span className="card-title">Recent Activity</span></div>
        <div className="card-body">
          {[{av:"💰",name:"Payment Received",sub:"DeShawn R. — $550 HUSTLE (split 1/2)",badge:"badge-green",bl:"Paid"},
            {av:"📋",name:"Consult Booked",sub:"Jordan M. — GRIND · $75",badge:"badge-gold",bl:"Pending"},
            {av:"📅",name:"Session Booked",sub:"Tasha W. — May 22 @ 9AM",badge:"badge-red",bl:"Upcoming"},
            {av:"⭐",name:"New Review",sub:"Marcus T. — 5 stars · HUSTLE",badge:"badge-green",bl:"New"},
            {av:"🏆",name:"Loyalty Discount",sub:"Tanisha W. — 20% · 12 referrals",badge:"badge-gold",bl:"Empire"},
          ].map((item,i)=>(<div key={i} className="row-item">
            <div className="row-av" style={{background:"var(--g3)",fontSize:15}}>{item.av}</div>
            <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{item.name}</div><div className="row-sub">{item.sub}</div></div>
            <span className={`badge ${item.badge}`}>{item.bl}</span>
          </div>))}
        </div>
      </div>
    </>)}

    {tab==="consults"&&(<div className="card"><div className="card-hdr"><span className="card-title">Consultation Requests ({consults.length})</span></div>
      <div className="card-body">
        {consults.length>0?consults.map((c,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{fontSize:13}}>{c.name[0]}</div>
          <div style={{flex:1}}>
            <div className="row-name" style={{fontSize:12}}>{c.name} — {c.pkg}</div>
            <div className="row-sub">{c.email} · {c.date}</div>
            {c.goal&&<div style={{fontSize:10,color:"var(--mut)",marginTop:2,fontStyle:"italic"}}>"{c.goal}"</div>}
          </div>
          <span className={`badge ${c.status==="Confirmed"?"badge-green":"badge-gold"}`}>{c.status}</span>
        </div>)):<div style={{fontSize:12,color:"var(--mut)",textAlign:"center",padding:"16px 0"}}>No consult requests yet.<br/><span style={{fontSize:10}}>They appear here when people book.</span></div>}
      </div>
    </div>)}

    {tab==="bookings"&&(<div className="card"><div className="card-hdr"><span className="card-title">All Booked Sessions</span></div>
      <div className="card-body">
        {allBookings.length>0?allBookings.map((b,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{background:"var(--g3)",color:"var(--red)",fontSize:11}}>📅</div>
          <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{b.date}</div><div className="row-sub">{b.time}</div></div>
          <span className="badge badge-red">Booked</span>
        </div>)):<div style={{fontSize:12,color:"var(--mut)"}}>No bookings yet.</div>}
      </div>
    </div>)}

    {tab==="orders"&&(<div className="card"><div className="card-hdr"><span className="card-title">Meal Prep Orders</span></div>
      <div className="card-body">
        {orders.length>0?orders.map((o,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{fontSize:15,background:"var(--g3)"}}>🥗</div>
          <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{o.client} — {o.total} meals</div>
            <div className="row-sub">{o.date} · {o.custom?"Custom":"Menu"} · Monthly</div>
          </div>
          <span className="badge badge-green">Active</span>
        </div>)):<div style={{fontSize:12,color:"var(--mut)"}}>No meal orders yet.</div>}
      </div>
    </div>)}

    {tab==="waitlist"&&(<div className="card"><div className="card-hdr"><span className="card-title">Session Waitlist ({waitlist.length})</span></div>
      <div className="card-body">
        {waitlist.length>0?waitlist.map((w,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{background:"var(--gold)",color:"#000",fontSize:13}}>{w.name[0]}</div>
          <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{w.name}</div><div className="row-sub">Joined {w.date}</div></div>
          <button className="btn btn-sm btn-green" onClick={()=>showToast(`${w.name} notified!`)}>Notify</button>
        </div>)):<div style={{fontSize:12,color:"var(--mut)"}}>Waitlist is empty.</div>}
      </div>
    </div>)}

    {tab==="leads"&&(<div className="card"><div className="card-hdr"><span className="card-title">Qualified Leads</span></div>
      <div className="card-body">
        {[{name:"Jordan M.",status:"Hot",pkg:"EMPIRE",date:"Today",note:"Ready to move"},
          {name:"Tasha W.",status:"Warm",pkg:"HUSTLE",date:"Yesterday",note:"Considering split pay"},
          {name:"Chris B.",status:"Hot",pkg:"EMPIRE",date:"May 15",note:"Already certified"},
          {name:"Nikki J.",status:"Pending",pkg:"GRIND",date:"May 13",note:"First timer"},
        ].map((l,i)=>(<div key={i} className="row-item">
          <div className="row-av" style={{fontSize:13}}>{l.name[0]}</div>
          <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{l.name} — {l.pkg}</div><div className="row-sub">{l.date} · {l.note}</div></div>
          <span className={`badge ${l.status==="Hot"?"badge-red":l.status==="Warm"?"badge-gold":"badge-gray"}`}>{l.status}</span>
        </div>))}
      </div>
    </div>)}

    {tab==="retention"&&(<div className="card"><div className="card-hdr"><span style={{color:"var(--gold)"}}>🧲</span><span className="card-title">Client Retention Scores</span></div>
      <div className="card-body">
        <div style={{fontSize:11,color:"var(--mut)",marginBottom:14,fontWeight:300,lineHeight:1.7}}>Based on check-in frequency, habit completion, and session attendance. Below 50% = reach out now.</div>
        {retentionData.map((c,i)=>(
          <div key={i} className="ret-row">
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,width:90,flexShrink:0,color:"var(--w)"}}>{c.name}</div>
            <div className="ret-bar-bg"><div className="ret-bar" style={{width:`${c.score}%`,background:c.color}}/></div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:c.color,width:34,textAlign:"right",flexShrink:0}}>{c.score}%</div>
            {c.score<50&&<button className="btn btn-sm" style={{fontSize:9,padding:"5px 10px",flexShrink:0}} onClick={()=>showToast(`Outreach sent to ${c.name}!`)}>Reach Out</button>}
          </div>
        ))}
      </div>
    </div>)}

    {tab==="revenue"&&(<>
      <div className="g3" style={{marginBottom:18,gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))"}}>
        {[["$9,210","This Month"],["$4,620","Split Due"],["$840","Meal MRR"],["$310","Consult MTD"]].map(([v,l])=>(
          <div key={l} className="metric"><div className="metric-val" style={{color:"var(--gold)"}}>{v}</div><div className="metric-lbl">{l}</div></div>
        ))}
      </div>
      <div className="card"><div className="card-hdr"><span className="card-title">Payment Breakdown</span></div>
        <div className="card-body">
          {[{name:"DeShawn R.",pkg:"HUSTLE",mode:"Split Pay",amount:"$275 now · $275 in 2 wks",status:"Active"},
            {name:"Tanisha W.",pkg:"EMPIRE",mode:"Full Pay",amount:"$1,500",status:"Paid"},
            {name:"Marcus T.",pkg:"HUSTLE",mode:"Full Pay",amount:"$550",status:"Paid"},
            {name:"Keisha M.",pkg:"GRIND",mode:"Split Pay",amount:"$240 now · $240 in 2 wks",status:"Active"},
            {name:"Jordan M.",pkg:"Consult",mode:"Consult",amount:"$75",status:"Pending"},
          ].map((p,i)=>(<div key={i} className="row-item">
            <div className="row-av" style={{fontSize:13,background:"var(--g3)"}}>{p.name[0]}</div>
            <div style={{flex:1}}><div className="row-name" style={{fontSize:12}}>{p.name} — {p.pkg}</div><div className="row-sub">{p.mode} · {p.amount}</div></div>
            <span className={`badge ${p.status==="Paid"?"badge-green":p.status==="Active"?"badge-gold":"badge-gray"}`}>{p.status}</span>
          </div>))}
        </div>
      </div>
    </>)}

    {tab==="promos"&&(<div className="card">
      <div className="card-hdr"><span>🏷️</span><span className="card-title">Promo Code Manager</span></div>
      <div className="card-body">
        <div style={{fontSize:11,color:"var(--mut)",marginBottom:14,fontWeight:300}}>Active promo codes clients can use on the home page. Share these with your audience to drive sign-ups.</div>
        {Object.entries(VALID_PROMOS).map(([code,desc])=>(
          <div key={code} className="row-item">
            <div style={{background:"rgba(212,168,67,0.1)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:2,padding:"4px 10px",fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--gold)",letterSpacing:2,flexShrink:0}}>{code}</div>
            <div style={{flex:1,marginLeft:10}}><div className="row-name" style={{fontSize:12}}>{desc}</div></div>
            <span className="badge badge-green">Active</span>
          </div>
        ))}
        <div style={{marginTop:16,borderTop:"1px solid var(--bdr)",paddingTop:14}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"var(--mut)",marginBottom:10}}>Create New Code</div>
          <div className="g2" style={{marginBottom:10}}>
            <div><div className="lbl">Code</div><input className="inp" value={promoCode} onChange={e=>setPromoCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER25"/></div>
            <div><div className="lbl">Description</div><input className="inp" value={promoDesc} onChange={e=>setPromoDesc(e.target.value)} placeholder="e.g. 25% off first month"/></div>
          </div>
          <button className="btn btn-gold btn-full" disabled={!promoCode.trim()||!promoDesc.trim()} onClick={()=>{showToast(`Code ${promoCode} created!`);setPromoCode("");setPromoDesc("");}}>Create Code →</button>
        </div>
      </div>
    </div>)}

    {tab==="reviews"&&(<div className="card"><div className="card-hdr"><span>⭐</span><span className="card-title">Client Reviews ({reviews.length})</span></div>
      <div className="card-body">
        {reviews.length>0?reviews.map((r,i)=>(<div key={i} className="row-item" style={{alignItems:"flex-start"}}>
          <div style={{color:"var(--gold)",fontSize:13,letterSpacing:1,flexShrink:0}}>{"★".repeat(r.rating)}</div>
          <div style={{flex:1,marginLeft:10}}>
            <div className="row-name" style={{fontSize:12}}>{r.name} — {r.pkg}</div>
            <div style={{fontSize:11,color:"var(--mut)",marginTop:3,fontStyle:"italic",lineHeight:1.6}}>"{r.text.slice(0,120)}{r.text.length>120?"...":""}"</div>
            <div style={{fontSize:10,color:"var(--mut)",marginTop:2}}>{r.date}</div>
          </div>
          <button className="btn btn-sm btn-green" style={{flexShrink:0}} onClick={()=>showToast("Review approved and published!")}>Approve</button>
        </div>)):<div style={{fontSize:12,color:"var(--mut)",textAlign:"center",padding:"14px 0"}}>No reviews yet.<br/><span style={{fontSize:10}}>They appear here when clients submit from their portal.</span></div>}
      </div>
    </div>)}
  </div>);
}

// ─── QUALIFY ──────────────────────────────────────────────────────────────────
function QualifyPage(){
  const [started,setStarted]=useState(false); const [name,setName]=useState("");
  const [msgs,setMsgs]=useState([]); const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false); const [status,setStatus]=useState(null); const [count,setCount]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  const check=(text)=>{
    if(text.includes("[QUALIFIED]"))setTimeout(()=>setStatus("qualified"),800);
    else if(text.includes("[NOT_QUALIFIED]"))setTimeout(()=>setStatus("nq"),800);
  };
  const start=async()=>{
    if(!name.trim())return;
    setStarted(true);setLoading(true);
    const openMsg={role:"user",content:`My name is ${name}. I was referred to Bodies by Rod.`};
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:Q_PROMPT,messages:[openMsg]})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"What are you trying to build?";
      setMsgs([openMsg,{role:"assistant",content:reply}]);check(reply);setCount(1);
    }catch{setMsgs([{role:"assistant",content:"What are you trying to build?"}]);}
    setLoading(false);
  };
  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setInput("");setLoading(true);setCount(c=>c+1);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:Q_PROMPT,messages:newMsgs})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"";
      setMsgs([...newMsgs,{role:"assistant",content:reply.replace(/\[QUALIFIED\]|\[NOT_QUALIFIED\]/g,"").trim()}]);
      check(reply);
    }catch{setMsgs([...newMsgs,{role:"assistant",content:"Say that again."}]);}
    setLoading(false);
  };
  return(<div className="sec" style={{maxWidth:540}}>
    <div className="stag">Private Intake</div><h2 className="sh2">R.O.D.<br/>READY ON DEMAND.</h2>
    <p className="sbody">5 minutes. Be real. Serious people get Rod directly. R.O.D. — Ready On Demand — means the system is always working for you.</p>
    <div className="chat-card" style={{overflow:"hidden"}}>
      <div className="card-hdr">
        <div className="ch-av">B</div>
        <div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--w)"}}>Bodies by Rod · Intake AI</div>
          <div style={{fontSize:10,color:"var(--red)",display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"var(--red)",display:"inline-block",animation:"pulse 1.5s infinite"}}/>Live · {count}/7
          </div>
        </div>
      </div>
      {!started?(
        <div style={{padding:"24px 17px",textAlign:"center"}}>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:22,color:"var(--w)",marginBottom:5}}>YOU WERE REFERRED.</div>
          <div style={{fontSize:12,color:"var(--mut)",marginBottom:20,lineHeight:1.7,fontWeight:300}}>5 minutes. Be real. Let's see if you qualify.</div>
          <input className="inp" style={{textAlign:"center",marginBottom:9}} value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&start()} placeholder="Enter your first name"/>
          <button className="btn btn-full" onClick={start} disabled={!name.trim()}>Start My Intake →</button>
        </div>
      ):(
        <>
          <div className="ch-msgs">
            {msgs.map((m,i)=>(<div key={i} className={`cmsg ${m.role==="user"?"u":""}`}>
              {m.role==="assistant"&&<div className="cav">B</div>}
              {m.role==="user"&&<div className="cav ua">{name[0]?.toUpperCase()}</div>}
              <div className={`cbub ${m.role==="assistant"?"ai":"ub"}`}>{m.content}</div>
            </div>))}
            {loading&&<div className="cmsg"><div className="cav">B</div><div className="typing"><div className="td"/><div className="td"/><div className="td"/></div></div>}
            <div ref={ref}/>
          </div>
          {status==="qualified"&&(<div style={{margin:"9px 13px 13px",background:"rgba(232,25,44,0.06)",border:"1px solid rgba(232,25,44,0.22)",borderRadius:3,padding:"16px",textAlign:"center",animation:"up 0.4s ease"}}>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--red)",marginBottom:5}}>✓ YOU QUALIFIED</div>
            <div style={{fontSize:11,color:"var(--mut)",marginBottom:12,lineHeight:1.65}}>Start with the $75 strategy call — credited when you join. One call changes everything.</div>
            <a href="#" className="btn" style={{display:"inline-block",textDecoration:"none",fontSize:11}}>Book $75 Consult →</a>
            <div style={{fontSize:10,color:"var(--mut)",marginTop:7}}>Fully credited toward your package when you join.</div>
          </div>)}
          {status==="nq"&&(<div style={{margin:"9px 13px 13px",background:"rgba(255,255,255,0.02)",border:"1px solid var(--bdr)",borderRadius:3,padding:"12px",textAlign:"center"}}>
            <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.7}}>This requires full commitment. Come back when you're ready — the door stays open.</div>
          </div>)}
          {!status&&(<div className="ch-inp-row">
            <input className="ch-inp" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder="Your answer..." disabled={loading}/>
            <button className="ch-send" onClick={send} disabled={loading||!input.trim()}>Send</button>
          </div>)}
        </>
      )}
    </div>
  </div>);
}

// ─── LEVEL SYSTEM DATA ────────────────────────────────────────────────────────
const LEVELS=[
  {name:"Recruit",min:0,max:99,icon:"🌱",color:"#888888",perks:["Platform access","Daily check-ins","Habit tracker"]},
  {name:"Grinder",min:100,max:299,icon:"⚡",color:"#22c55e",perks:["Priority DM response","Grinder badge","Workout of the week"]},
  {name:"Hustler",min:300,max:599,icon:"🔥",color:"#D4A843",perks:["5% loyalty bonus","Hustler leaderboard","Early program access"]},
  {name:"Empire",min:600,max:999,icon:"👑",color:"#E8192C",perks:["10% loyalty bonus","Empire badge","Monthly bonus content","Shoutout from Rod"]},
  {name:"Legend",min:1000,max:99999,icon:"💎",color:"#a78bfa",perks:["15% loyalty bonus","Legend status","Free month at 1yr","Personal call with Rod"]},
];

const MILESTONE_BONUSES=[
  {refs:3,period:"month",bonus:"$100 bonus cash",icon:"🎯",desc:"Refer 3 people in one calendar month"},
  {refs:5,period:"month",bonus:"Free month of your package",icon:"🏆",desc:"Refer 5 people in one calendar month"},
  {refs:10,period:"ever",bonus:"Empire Status + 20% off forever",icon:"👑",desc:"Refer 10 people total — lifetime achievement"},
];

// ─── LIFEWAVE PAGE ────────────────────────────────────────────────────────────
function LifeWavePage(){
  const [tab,setTab]=useState("overview");
  const patches=[
    {name:"X39",icon:"⚡",color:"#E8192C",tagline:"Activate Your Body's Own Stem Cells",desc:"The flagship patch. Uses photobiomodulation to elevate GHK-Cu peptide, activating stem cell production. Clinically studied for energy, recovery, pain relief, and anti-aging.",benefits:["Stem cell activation","Faster recovery","Reduced inflammation","Improved energy","Better sleep","Anti-aging support"],best:"Athletes, anyone over 35, chronic pain, post-surgery recovery"},
    {name:"X49",icon:"💪",color:"#D4A843",tagline:"Strength. Stamina. Performance.",desc:"Designed to increase stamina and athletic performance. Works alongside X39 to support cardiovascular health, muscle tone, and lean body mass.",benefits:["Increased stamina","Muscle strength support","Cardiovascular health","Lean body composition","Enhanced performance"],best:"Athletes, bodybuilders, active adults, fitness clients"},
    {name:"Aeon",icon:"🧘",color:"#7c3aed",tagline:"Stress Relief + Anti-Inflammatory",desc:"Reduces stress and systemic inflammation. Supports the body's anti-aging systems and has been shown to reduce cortisol levels significantly.",benefits:["Reduces cortisol (stress hormone)","Anti-inflammatory","Supports immune function","Mental clarity","Emotional balance"],best:"High-stress professionals, anxiety, inflammation issues"},
    {name:"Carnosine",icon:"🧠",color:"#0891b2",tagline:"Brain Health + Anti-Aging",desc:"Supports brain health, vision, and overall cellular anti-aging. Works with X39 to protect cells from oxidative stress.",benefits:["Brain function support","Vision health","Cellular anti-aging","Neuroprotective","Antioxidant support"],best:"People over 40, brain fog, eye health concerns"},
    {name:"Energy Enhancer",icon:"☀️",color:"#ea580c",tagline:"All-Day Natural Energy",desc:"Beta oxidation stimulator — helps the body burn fat for fuel more efficiently. Non-stimulant natural energy without caffeine crashes.",benefits:["Natural sustained energy","Fat burning support","No caffeine or stimulants","Mental alertness","Endurance support"],best:"Fitness clients, afternoon energy crashes, fat loss goals"},
    {name:"IceWave",icon:"❄️",color:"#60a5fa",tagline:"Drug-Free Pain Relief",desc:"Non-transdermal pain relief patch. Clinically studied for localized pain. Used by military, athletes, and chronic pain patients worldwide.",benefits:["Localized pain relief","Drug-free and non-transdermal","Back pain","Joint pain","Muscle soreness","Post-workout recovery"],best:"Chronic pain, athletes, post-surgery, back pain sufferers"},
    {name:"Silent Nights",icon:"🌙",color:"#4ade80",tagline:"Deep Restorative Sleep",desc:"Melatonin-free sleep support. Stimulates the body's own melatonin production through photobiomodulation rather than introducing external hormones.",benefits:["Deeper sleep cycles","Natural melatonin boost","No grogginess","Improved recovery","Hormone balance support"],best:"Insomnia, athletes needing recovery, shift workers, stress-related sleep issues"},
    {name:"Glutathione",icon:"🛡️",color:"#D4A843",tagline:"Master Antioxidant + Detox",desc:"Elevates the body's own glutathione — the most powerful antioxidant the body produces. Supports detoxification, immune health, and cellular protection.",benefits:["Master antioxidant boost","Liver detoxification","Immune support","Skin health","Heavy metal detox support"],best:"Detox goals, immune support, skin health, anyone exposed to environmental toxins"},
  ];

  const whobenefits=[
    {group:"Athletes & Fitness Clients",icon:"🏋️",patches:["X39","X49","Energy Enhancer","IceWave"],why:"Faster recovery, more energy, better performance, pain relief after hard training"},
    {group:"People Over 35",icon:"👤",patches:["X39","Carnosine","Aeon","Glutathione"],why:"Stem cell activation slows with age — X39 reactivates it. Anti-aging from the inside out."},
    {group:"Chronic Pain Sufferers",icon:"💊",patches:["IceWave","X39","Aeon"],why:"Drug-free, non-transdermal pain relief. Used by the US military and pain clinics worldwide."},
    {group:"High Stress Professionals",icon:"💼",patches:["Aeon","Silent Nights","Carnosine"],why:"Cortisol reduction, better sleep, mental clarity without pharmaceutical side effects."},
    {group:"Weight Loss Goals",icon:"🎯",patches:["Energy Enhancer","X39","X49"],why:"Supports fat burning, lean body composition, sustained energy without stimulants."},
    {group:"Post-Surgery Recovery",icon:"🏥",patches:["X39","IceWave","Glutathione"],why:"Stem cell activation accelerates healing. Pain relief. Antioxidant support for recovery."},
  ];

  return(<div className="sec">
    <div className="stag">Wellness Technology</div>
    <h2 className="sh2">LIFEWAVE<br/>PATCHES.</h2>
    <p className="sbody">Part of the R.O.D. — Ready On Demand — wellness system. Photobiomodulation patches developed by David Schmidt. Used by the US military, Olympic athletes, and people in 100+ countries. Non-transdermal — nothing enters your body.</p>

    {/* Origin Story */}
    <div style={{background:"linear-gradient(135deg,rgba(232,25,44,0.06),rgba(212,168,67,0.04))",border:"1px solid rgba(212,168,67,0.2)",borderRadius:4,padding:22,marginBottom:20}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:10}}>The Story Behind LifeWave</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:14}}>
        {[["👨‍🔬","The Inventor","David Schmidt — inventor, scientist, and entrepreneur with over 100 patents in energy and biotechnology."],
          ["⚓","Original Purpose","Developed for the US Navy and military to increase energy and endurance for soldiers in the field without drugs or stimulants."],
          ["📅","Founded","LifeWave was founded in 2004. Over 20 years of research, development, and clinical studies."],
          ["🌍","Global Reach","Available in over 100 countries. Used by millions of people worldwide including elite athletes, military personnel, and wellness practitioners."],
          ["🏅","Athletes & Military","Used by Olympic gold medalists, Navy SEALs, and professional sports teams for performance and recovery."],
          ["🔬","The Science","Patches reflect the body's own infrared light back into the skin, triggering a biological response — with nothing entering the body. No drugs. No chemicals."],
        ].map(([icon,title,desc])=>(
          <div key={title} style={{background:"var(--g2)",borderRadius:3,padding:"13px 14px",border:"1px solid var(--bdr)"}}>
            <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--gold)",marginBottom:4}}>{title}</div>
            <div style={{fontSize:10,color:"var(--mut)",lineHeight:1.65,fontWeight:300}}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(212,168,67,0.06)",borderRadius:3,padding:"12px 16px",border:"1px solid rgba(212,168,67,0.18)"}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,color:"var(--gold)",marginBottom:4}}>HOW IT WORKS</div>
        <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.8,fontWeight:300}}>
          LifeWave patches contain organic crystals that interact with the body's own infrared light — energy your body naturally emits as heat.
          The crystals reflect specific wavelengths back into the skin, stimulating biological processes like peptide production, stem cell activation,
          and antioxidant elevation. <strong style={{color:"var(--w)"}}>Nothing enters the body. No drugs. No chemicals. Completely non-transdermal.</strong> The patch is simply a signal — your body does the rest.
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="tab-row">
      {[["overview","All Patches"],["who","Who Benefits"],["fitness","For Fitness"],["order","Order Info"]].map(([id,l])=>(
        <button key={id} className={`tab ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{l}</button>
      ))}
    </div>

    {tab==="overview"&&(<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
        {patches.map((p,i)=>(
          <div key={i} style={{background:"var(--g1)",border:`1px solid ${p.color}33`,borderRadius:4,overflow:"hidden",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{background:`${p.color}15`,borderBottom:`2px solid ${p.color}`,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:p.color}}>{p.icon} {p.name}</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",marginTop:2}}>{p.tagline}</div>
              </div>
              <div style={{background:`${p.color}22`,borderRadius:2,padding:"4px 10px",fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:2,color:p.color,textTransform:"uppercase"}}>PATCH</div>
            </div>
            <div style={{padding:"13px 16px"}}>
              <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.75,fontWeight:300,marginBottom:12}}>{p.desc}</div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,textTransform:"uppercase",color:p.color,marginBottom:6}}>Key Benefits</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                {p.benefits.map((b,j)=>(
                  <span key={j} style={{background:`${p.color}15`,border:`1px solid ${p.color}30`,borderRadius:2,padding:"2px 8px",fontSize:9,color:p.color,fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>{b}</span>
                ))}
              </div>
              <div style={{fontSize:9,color:"var(--mut)",fontStyle:"italic",borderTop:"1px solid var(--bdr)",paddingTop:8}}>
                <strong style={{color:"var(--w)"}}>Best for:</strong> {p.best}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>)}

    {tab==="who"&&(<>
      <p style={{fontSize:12,color:"var(--mut)",marginBottom:16,lineHeight:1.75,fontWeight:300}}>LifeWave is not just for one type of person. Here are the groups that consistently see the most significant results.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:12}}>
        {whobenefits.map((w,i)=>(
          <div key={i} style={{background:"var(--g1)",border:"1px solid var(--bdr)",borderRadius:3,padding:"16px 18px"}}>
            <div style={{fontSize:24,marginBottom:8}}>{w.icon}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:16,color:"var(--w)",marginBottom:6}}>{w.group}</div>
            <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.7,fontWeight:300,marginBottom:10}}>{w.why}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--gold)",marginBottom:6}}>RECOMMENDED PATCHES</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {w.patches.map((patch,j)=>(
                <span key={j} style={{background:"rgba(232,25,44,0.1)",border:"1px solid rgba(232,25,44,0.25)",borderRadius:2,padding:"2px 9px",fontSize:9,color:"var(--red)",fontFamily:"'Oswald',sans-serif",letterSpacing:1}}>{patch}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>)}

    {tab==="fitness"&&(<>
      <p style={{fontSize:12,color:"var(--mut)",marginBottom:16,lineHeight:1.75,fontWeight:300}}>Rod personally recommends LifeWave as part of the Bodies by Rod wellness system. These patches stack directly on top of your training and nutrition for faster, deeper results.</p>
      <div style={{background:"linear-gradient(135deg,rgba(232,25,44,0.06),rgba(212,168,67,0.03))",border:"1px solid rgba(232,25,44,0.2)",borderRadius:4,padding:20,marginBottom:16}}>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--red)",marginBottom:8}}>The Rod Stack</div>
        <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.85,fontWeight:300,marginBottom:14}}>This is the combination Rod recommends for his coaching clients who want maximum results from their training program:</div>
        {[
          {patch:"X39",timing:"Morning","purpose":"Stem cell activation, energy, recovery — wear during the day for 12 hours"},
          {patch:"X49",timing:"Morning with X39","purpose":"Stack with X39 for enhanced athletic performance and lean body composition"},
          {patch:"Energy Enhancer",timing:"Pre-workout","purpose":"Natural energy boost before training — no stimulants, no crash"},
          {patch:"IceWave",timing:"Post-workout","purpose":"Apply to sore areas after training for faster recovery and pain relief"},
          {patch:"Silent Nights",timing:"Before bed","purpose":"Deep sleep = maximum muscle repair and growth hormone release overnight"},
          {patch:"Glutathione",timing:"3x per week","purpose":"Master antioxidant to clear free radicals from intense training sessions"},
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"9px 0",borderBottom:"1px solid var(--bdr)"}}>
            <div style={{background:"rgba(232,25,44,0.15)",border:"1px solid rgba(232,25,44,0.3)",borderRadius:2,padding:"3px 10px",fontFamily:"'Oswald',sans-serif",fontSize:10,color:"var(--red)",fontWeight:700,flexShrink:0,minWidth:100,textAlign:"center"}}>{item.patch}</div>
            <div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:"var(--gold)",letterSpacing:1,marginBottom:2}}>{item.timing}</div>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300,lineHeight:1.6}}>{item.purpose}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:3,padding:"13px 16px",fontSize:11,color:"var(--mut)",lineHeight:1.75}}>
        <strong style={{color:"var(--w)"}}>Rod's Note:</strong> These patches are not a replacement for training and nutrition — they are a multiplier. When your foundation is right, LifeWave accelerates every result. Most clients notice a difference in energy and recovery within the first 3-5 days.
      </div>
    </>)}

    {tab==="order"&&(<>
      <div style={{background:"var(--g1)",border:"1px solid var(--bdr)",borderRadius:4,padding:22,marginBottom:14}}>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:20,color:"var(--w)",marginBottom:6}}>How to Order LifeWave Patches</div>
        <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.85,fontWeight:300,marginBottom:16}}>LifeWave is a direct sales company. To get the best pricing and access to the full product line, order through an authorized distributor. Rod is a certified LifeWave Brand Partner.</div>
        {[
          ["Step 1","Visit the LifeWave website","Go to lifewave.com or ask Rod for his direct distributor link for the best pricing and enrollment options."],
          ["Step 2","Choose your product","Start with X39 if you are new. Add X49 if athletic performance is your goal. Stack additional patches as needed."],
          ["Step 3","Select your purchase type","Preferred Customer pricing saves 20-30% vs retail. Brand Partner enrollment gives you wholesale pricing and the ability to earn income."],
          ["Step 4","DM Rod for guidance","Not sure where to start? DM @bodiesbyrod. Rod helps every Bodies by Rod client find the right patches for their specific goals."],
        ].map(([step,title,desc],i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"11px 0",borderBottom:"1px solid var(--bdr)"}}>
            <div style={{background:"var(--red)",borderRadius:2,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Black Han Sans',sans-serif",fontSize:13,color:"#fff",flexShrink:0}}>{i+1}</div>
            <div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--w)",marginBottom:3}}>{title}</div>
              <div style={{fontSize:11,color:"var(--mut)",fontWeight:300,lineHeight:1.65}}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(212,168,67,0.06)",border:"1px solid rgba(212,168,67,0.2)",borderRadius:3,padding:"13px 16px",fontSize:11,color:"var(--mut)",lineHeight:1.75}}>
        <strong style={{color:"var(--gold)"}}>Important:</strong> LifeWave patches are FDA registered as general wellness devices. They are not intended to diagnose, treat, cure, or prevent any disease. Results may vary. Consult your healthcare provider if you have medical conditions.
      </div>
    </>)}
  </div>);
}

// ─── UPDATED REFERRAL PAGE WITH DELAYED KICKBACK + MILESTONES ────────────────
function ReferralPageV2({showToast}){
  const [name,setName]=useState("");
  const [refLink,setRefLink]=useState("");
  const [refs,setRefs]=useState([]);
  const [copied,setCopied]=useState(false);
  const [pendingPay,setPendingPay]=useState(0);
  const [tab,setTab]=useState("overview");

  useEffect(()=>{store.get("bbr_referral").then(d=>{if(d){setName(d.name);setRefLink(d.link);setRefs(d.refs||[]);}});},[]);

  const generate=async()=>{
    if(!name.trim())return;
    const code=name.toLowerCase().replace(/\s+/,"")+Math.floor(Math.random()*9000+1000);
    const link=`bodiesbyrod.com/ref/${code}`;
    const demoRefs=[
      {name:"Marcus J.",pkg:"HUSTLE",status:"Cleared",reward:"$50 cash",date:"May 10",daysLeft:0},
      {name:"Tasha R.",pkg:"EMPIRE",status:"Pending",reward:"$300 credit",date:"May 14",daysLeft:16},
      {name:"Devon K.",pkg:"GRIND",status:"Pending",reward:"500 pts",date:"May 20",daysLeft:10},
    ];
    const data={name,link,code,refs:demoRefs};
    await store.set("bbr_referral",data);
    setRefLink(link);setRefs(demoRefs);
    showToast("Referral link created!");
  };

  const copy=()=>{navigator.clipboard?.writeText(refLink);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const cleared=refs.filter(r=>r.status==="Cleared").length;
  const pending=refs.filter(r=>r.status==="Pending").length;

  return(<div className="sec">
    <div className="stag">Refer & Earn</div>
    <h2 className="sh2">SEND PEOPLE.<br/>STACK REWARDS.</h2>
    <p className="sbody">R.O.D. — Ready On Demand. Your link is always working even when you are not. Their join. Your reward — cash, credit, or loyalty points. Rewards clear after 30 days. Milestone bonuses stack on top.</p>

    {/* Reward structure */}
    <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.15)",borderRadius:3,padding:"16px",marginBottom:18}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:12}}>Referral Reward Structure</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10,marginBottom:12}}>
        {[
          ["GRIND","500 Loyalty Points","Redeemable for discounts, free meals & merch. Never expire.","var(--mut)","🌱"],
          ["HUSTLE","$50 Cash","Paid via Cash App, Zelle, or Venmo after 30-day hold.","var(--green)","💵"],
          ["EMPIRE","$300 Bill Credit","Applied automatically to their next month's payment after 30 days.","var(--gold)","👑"],
        ].map(([pkg,reward,desc,col,icon])=>(
          <div key={pkg} style={{textAlign:"center",padding:"14px 10px",background:"var(--g2)",borderRadius:3,border:`1px solid ${col === 'var(--gold)' ? 'rgba(212,168,67,0.2)' : col === 'var(--green)' ? 'rgba(34,197,94,0.2)' : 'var(--bdr)'}` }}>
            <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",textTransform:"uppercase",marginBottom:4}}>{pkg}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:16,color:col,marginBottom:6,lineHeight:1.2}}>{reward}</div>
            <div style={{fontSize:9,color:"var(--mut)",lineHeight:1.65}}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(232,25,44,0.06)",border:"1px solid rgba(232,25,44,0.18)",borderRadius:2,padding:"9px 13px",fontSize:10,color:"var(--mut)",lineHeight:1.7}}>
        ⏳ <strong style={{color:"var(--w)"}}>30-Day Delayed Kickback:</strong> Rewards are held for 30 days from the referral's first payment. If they stay active past 30 days — you get paid automatically. This protects the system and ensures every reward is for a real committed client.
      </div>
    </div>

    {/* Milestone bonuses */}
    <div style={{background:"linear-gradient(90deg,rgba(232,25,44,0.06),rgba(212,168,67,0.03))",border:"1px solid rgba(232,25,44,0.18)",borderRadius:3,padding:"16px",marginBottom:18}}>
      <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--red)",marginBottom:12}}>🎯 Milestone Bonuses — Stack These On Top</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
        {MILESTONE_BONUSES.map((m,i)=>(
          <div key={i} style={{background:"var(--g2)",borderRadius:3,padding:"13px 14px",border:"1px solid var(--bdr)"}}>
            <div style={{fontSize:24,marginBottom:6}}>{m.icon}</div>
            <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--gold)",marginBottom:4}}>{m.bonus}</div>
            <div style={{fontSize:10,color:"var(--mut)",lineHeight:1.65}}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Recurring reward callout */}
    <div style={{background:"rgba(34,197,94,0.05)",border:"1px solid rgba(34,197,94,0.18)",borderRadius:3,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:22,flexShrink:0}}>🔄</div>
      <div>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--green)",marginBottom:3}}>Recurring Monthly Reward — HUSTLE & EMPIRE</div>
        <div style={{fontSize:11,color:"var(--mut)",fontWeight:300,lineHeight:1.65}}>As long as the person you referred stays active — you keep earning every month. Month 2, month 3, month 6 — the reward hits your account automatically every billing cycle they remain a client.</div>
      </div>
    </div>

    {!refLink?(
      <div className="card"><div className="card-body">
        <div className="lbl" style={{marginBottom:5}}>Your Name</div>
        <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" style={{marginBottom:11}} onKeyDown={e=>e.key==="Enter"&&generate()}/>
        <button className="btn btn-full btn-gold" onClick={generate} disabled={!name.trim()}>Generate My Referral Link →</button>
      </div></div>
    ):(
      <>
        <div style={{background:"rgba(212,168,67,0.05)",border:"1px solid rgba(212,168,67,0.18)",borderRadius:3,padding:16,textAlign:"center",marginBottom:14}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:5}}>Your Unique Link</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:"var(--gold)",letterSpacing:1,wordBreak:"break-all",margin:"7px 0"}}>{refLink}</div>
          <button className="btn btn-gold btn-sm" onClick={copy}>{copied?"Copied! ✓":"Copy Link"}</button>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:13}}>
            {[["Total","Refs",refs.length],["Cleared","Paid",cleared],["Pending","30-day hold",pending],["Est.","Next payout","$50"]].map(([top,bot,val])=>(
              <div key={top} style={{background:"rgba(212,168,67,0.05)",borderRadius:2,padding:"9px 5px",textAlign:"center"}}>
                <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:18,color:"var(--gold)"}}>{val}</div>
                <div style={{fontFamily:"'Oswald',sans-serif",fontSize:8,letterSpacing:1,color:"var(--mut)",marginTop:1,lineHeight:1.4}}>{top}<br/>{bot}</div>
              </div>
            ))}
          </div>
        </div>
        {refs.length>0&&(
          <div className="card">
            <div className="card-hdr"><span>📋</span><span className="card-title">Your Referrals</span></div>
            <div className="card-body">
              {refs.map((r,i)=>(
                <div key={i} className="row-item">
                  <div className="row-av" style={{background:"var(--gold)",color:"#000",fontSize:13}}>{r.name[0]}</div>
                  <div style={{flex:1}}>
                    <div className="row-name" style={{fontSize:12}}>{r.name} — {r.pkg}</div>
                    <div className="row-sub">{r.date}{r.daysLeft>0?` · ${r.daysLeft} days until cleared`:""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span className={`badge ${r.status==="Cleared"?"badge-green":"badge-gold"}`}>{r.status}</span>
                    <div style={{fontSize:10,color:"var(--gold)",fontFamily:"'Oswald',sans-serif",marginTop:2}}>{r.reward}</div>
                  </div>
                </div>
              ))}
              <div style={{fontSize:10,color:"var(--mut)",marginTop:10,fontStyle:"italic",textAlign:"center"}}>Cleared rewards paid within 48 hours via your preferred payment method</div>
            </div>
          </div>
        )}
      </>
    )}
  </div>);
}

// ─── LEVEL SYSTEM + STREAK IN PORTAL (upgraded portal tab) ───────────────────
function LevelBadge({points=320}){
  const level=LEVELS.filter(l=>points>=l.min).pop()||LEVELS[0];
  const next=LEVELS.find(l=>points<l.min);
  const pct=next?Math.round(((points-level.min)/(next.min-level.min))*100):100;
  return(
    <div style={{background:"linear-gradient(135deg,rgba(232,25,44,0.07),rgba(212,168,67,0.04))",border:`1px solid ${level.color}44`,borderRadius:4,padding:16,marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
        <div style={{fontSize:36,lineHeight:1}}>{level.icon}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:22,color:level.color,lineHeight:1}}>{level.name}</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:2,color:"var(--mut)",marginTop:3}}>{points} POINTS{next?` · ${next.min-points} to ${next.name}`:""}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,color:level.color,letterSpacing:1}}>LEVEL PERKS</div>
          {level.perks.slice(0,2).map((p,i)=><div key={i} style={{fontSize:9,color:"var(--mut)",marginTop:2}}>✓ {p}</div>)}
        </div>
      </div>
      <div style={{background:"var(--g3)",borderRadius:2,height:6,overflow:"hidden"}}>
        <div style={{height:"100%",background:level.color,borderRadius:2,width:`${pct}%`,transition:"width 0.6s ease"}}/>
      </div>
      {next&&<div style={{fontSize:9,color:"var(--mut)",marginTop:4,textAlign:"right"}}>{pct}% to {next.name} {next.icon}</div>}
    </div>
  );
}

function StreakCounter({streak=7,habits=5,checkins=12}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      {[
        {val:streak,label:"Day Streak",icon:"🔥",color:"var(--red)",sub:"Don't break it"},
        {val:habits,label:"Habits Today",icon:"✅",color:"var(--green)",sub:"Out of 6"},
        {val:checkins,label:"Check-Ins",icon:"📊",color:"var(--gold)",sub:"This month"},
      ].map((s,i)=>(
        <div key={i} style={{background:"var(--g2)",border:`1px solid ${s.color}33`,borderRadius:3,padding:"13px 10px",textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:26,color:s.color,lineHeight:1}}>{s.val}</div>
          <div style={{fontFamily:"'Oswald',sans-serif",fontSize:9,letterSpacing:1,color:"var(--mut)",marginTop:3,textTransform:"uppercase"}}>{s.label}</div>
          <div style={{fontSize:9,color:"var(--mut)",marginTop:2,fontStyle:"italic"}}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── STRIPE SETUP GUIDE (visible in admin) ────────────────────────────────────
// HOW TO CONNECT YOUR REAL STRIPE LINKS:
// 1. Go to dashboard.stripe.com and log in
// 2. Click "Payment Links" in the left menu
// 3. Create a new payment link for each product:
//    - "$75 Strategy Consultation" (one-time, $75)
//    - "GRIND Monthly Subscription" (recurring, $480/month)
//    - "GRIND Split Pay 1" (one-time, $240) + "GRIND Split Pay 2" (one-time, $240)
//    - "HUSTLE Monthly Subscription" (recurring, $550/month)
//    - "HUSTLE Split Pay 1" (one-time, $275) + "HUSTLE Split Pay 2" (one-time, $275)
//    - "EMPIRE Monthly Subscription" (recurring, $1,500/month)
//    - "EMPIRE Split Pay 1" (one-time, $750) + "EMPIRE Split Pay 2" (one-time, $750)
// 4. Copy each payment link URL
// 5. Open this file (App.jsx) and replace each placeholder:
//    STRIPE_CONSULT = your $75 consult link
//    GRIND stripeLink = your GRIND monthly link
//    GRIND stripeSplitLink = your GRIND split link
//    HUSTLE stripeLink = your HUSTLE monthly link
//    etc.
// 6. Stripe automatically handles card storage, receipts, and recurring billing
// 7. You get paid directly to your Stripe account (connects to your bank)
// NOTE: Stripe charges 2.9% + $0.30 per transaction

// ─── SESSIONS PAGE — PER SESSION PRICING ─────────────────────────────────────
function SessionsPage({setPage,showToast}){
  const [sessionType,setSessionType]=useState("online");
  const [platform,setPlatform]=useState("FaceTime");
  const [frequency,setFrequency]=useState("1x");
  const [selectedDates,setSelectedDates]=useState([]);
  const [step,setStep]=useState(1);

  const sessions={
    online:{
      name:"Online 1-on-1",
      icon:"💻",
      price:45,
      desc:"FaceTime, Zoom, or Google Meet — train from anywhere",
      platforms:["FaceTime","Zoom","Google Meet"],
      color:"var(--gold)"
    },
    inperson:{
      name:"In-Person 1-on-1",
      icon:"🏋️",
      price:60,
      desc:"At the gym or your location — hands-on coaching",
      platforms:["Location TBD"],
      color:"var(--red)"
    },
    checkin:{
      name:"Strategy Check-In",
      icon:"📞",
      price:30,
      desc:"30 min phone call — accountability, adjustments, Q&A",
      platforms:["Phone Call"],
      color:"var(--green)"
    }
  };

  const frequencyOptions=[
    {val:"1x",label:"1x per week",sessions:4,monthlyTotal:180},
    {val:"2x",label:"2x per week",sessions:8,monthlyTotal:360},
    {val:"3x",label:"3x per week",sessions:12,monthlyTotal:540},
    {val:"4x",label:"4x per week",sessions:16,monthlyTotal:720},
  ];

  const current=sessions[sessionType];
  const freqData=frequencyOptions.find(f=>f.val===frequency);
  const monthlyTotal=current.price*freqData.sessions;

  const handleBook=async()=>{
    if(!platform)return;
    const booking={
      id:Date.now(),
      type:sessionType,
      platform,
      frequency,
      sessionsPerMonth:freqData.sessions,
      monthlyPrice:monthlyTotal,
      date:new Date().toLocaleDateString(),
      status:"Pending Payment"
    };
    const bookings=await store.get("bbr_bookings",true)||[];
    bookings.push(booking);
    await store.set("bbr_bookings",bookings,true);
    showToast("Session package ready for checkout!");
    setStep(3);
  };

  return(<div className="sec">
    <div className="stag">1-on-1 Coaching</div>
    <h2 className="sh2">TRAIN WITH ROD.<br/>YOUR WAY.</h2>
    <p className="sbody">Online or in-person. Pay per session or commit monthly. Start with one session. Scale as you grow. No contracts.</p>

    {step===1&&(<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:18}}>
        {[
          {id:"online",name:"Online 1-on-1",icon:"💻",price:"$45/session",desc:"FaceTime, Zoom, or Google Meet",color:"rgba(212,168,67,0.15)",accent:"var(--gold)"},
          {id:"inperson",name:"In-Person 1-on-1",icon:"🏋️",price:"$60/session",desc:"At the gym or your location",color:"rgba(232,25,44,0.15)",accent:"var(--red)"},
          {id:"checkin",name:"Strategy Check-In",icon:"📞",price:"$30/session",desc:"30 min phone accountability call",color:"rgba(34,197,94,0.15)",accent:"var(--green)"},
        ].map(s=>(
          <div key={s.id} onClick={()=>{setSessionType(s.id);setStep(2);}} style={{background:s.color,border:`2px solid ${s.accent}`,borderRadius:4,padding:20,cursor:"pointer",transition:"transform 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{fontSize:36,marginBottom:8}}>{s.icon}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:18,color:"var(--w)",marginBottom:4}}>{s.name}</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:24,color:s.accent,marginBottom:8}}>{s.price}</div>
            <div style={{fontSize:11,color:"var(--mut)",lineHeight:1.7}}>{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{background:"var(--g2)",border:"1px solid var(--bdr)",borderRadius:4,padding:16}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:2,color:"var(--gold)",marginBottom:10}}>HOW IT WORKS</div>
        {[
          {num:"1",title:"Pick Your Session Type",desc:"Online, in-person, or phone check-in"},
          {num:"2",title:"Choose Your Frequency",desc:"1x, 2x, 3x, or 4x per week"},
          {num:"3",title:"Pay Per Session",desc:"No contracts. Cancel anytime."},
          {num:"4",title:"Book Your Times",desc:"Live calendar — Rod blocks out his availability"},
          {num:"5",title:"Train with Rod",desc:"FaceTime, Zoom, Google Meet, or in person"},
        ].map((step,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:i<4?"1px solid var(--bdr)":"none"}}>
            <div style={{background:current.color,color:"#000",width:28,height:28,borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Black Han Sans',sans-serif",fontSize:13,flexShrink:0}}>{step.num}</div>
            <div>
              <div style={{fontFamily:"'Oswald',sans-serif",fontSize:11,color:"var(--w)",marginBottom:2}}>{step.title}</div>
              <div style={{fontSize:10,color:"var(--mut)"}}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>)}

    {step===2&&(<>
      <div className="card" style={{marginBottom:16}}>
        <div className="card-hdr"><span className="card-title">{current.name}</span></div>
        <div className="card-body">
          <div style={{background:current.color+"33",borderRadius:3,padding:14,marginBottom:16}}>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:28,color:current.color}}>${current.price}</div>
            <div style={{fontSize:10,color:"var(--mut)",marginTop:4}}>per session</div>
          </div>

          <div style={{marginBottom:16}}>
            <div className="lbl">Choose Your Platform</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:8}}>
              {current.platforms.map(p=>(
                <button key={p} onClick={()=>setPlatform(p)} style={{padding:"10px 12px",borderRadius:3,border:platform===p?`2px solid ${current.color}`:"1px solid var(--bdr)",background:platform===p?current.color+"22":"var(--g3)",color:platform===p?current.color:"var(--mut)",fontFamily:"'Oswald',sans-serif",fontSize:11,cursor:"pointer",transition:"all 0.2s"}}>{p}</button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <div className="lbl">Sessions Per Week</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {frequencyOptions.map(f=>(
                <div key={f.val} onClick={()=>setFrequency(f.val)} style={{padding:12,borderRadius:3,border:frequency===f.val?`2px solid ${current.color}`:"1px solid var(--bdr)",background:frequency===f.val?current.color+"22":"var(--g3)",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                  <div style={{fontFamily:"'Oswald',sans-serif",fontSize:12,color:frequency===f.val?current.color:"var(--mut)",fontWeight:700}}>{f.val}</div>
                  <div style={{fontSize:9,color:"var(--mut)",marginTop:3}}>{f.sessions} sessions/mo</div>
                  <div style={{fontSize:9,color:current.color,fontFamily:"'Oswald',sans-serif",marginTop:3,fontWeight:700}}>${f.monthlyTotal}/mo</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(0,0,0,0.4)",borderRadius:3,padding:12,marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--mut)",marginBottom:6}}>
              <span>{current.name}</span><span>${current.price}/session</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--mut)",marginBottom:6}}>
              <span>{freqData.sessions} sessions per month</span><span>${monthlyTotal}/month</span>
            </div>
            <div style={{borderTop:"1px solid var(--bdr)",paddingTop:8,display:"flex",justifyContent:"space-between",fontSize:13,color:current.color,fontFamily:"'Oswald',sans-serif",fontWeight:700}}>
              <span>TOTAL MONTHLY</span><span>${monthlyTotal}</span>
            </div>
          </div>

          <button className="btn btn-full" onClick={handleBook} style={{background:current.color}} disabled={!platform}>
            Continue to Checkout →
          </button>
          <button className="btn btn-ol btn btn-sm" onClick={()=>setStep(1)}>← Back</button>
        </div>
      </div>
    </>)}

    {step===3&&(<div className="card" style={{maxWidth:500,margin:"0 auto"}}>
      <div className="card-body" style={{textAlign:"center",padding:"32px 20px"}}>
        <div style={{fontSize:44,marginBottom:10}}>✅</div>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:22,color:current.color,marginBottom:8}}>READY FOR CHECKOUT</div>
        <div style={{fontSize:12,color:"var(--mut)",lineHeight:1.8,marginBottom:16}}>
          <strong style={{color:"var(--w)"}}>{current.name}</strong><br/>
          {freqData.sessions} sessions per month<br/>
          <strong style={{color:current.color}}>${monthlyTotal}/month</strong><br/>
          <span style={{fontSize:10,marginTop:6,display:"block"}}>You will be redirected to Stripe to complete payment</span>
        </div>
        <button className="btn btn-full" onClick={()=>{window.open("https://buy.stripe.com/YOUR_SESSION_LINK","_blank");showToast("Opening secure checkout...");}} style={{background:current.color,marginBottom:8}}>
          🔒 Pay ${monthlyTotal}/month with Stripe
        </button>
        <button className="btn btn-ol btn btn-sm" onClick={()=>setStep(2)}>← Change Details</button>
        <div style={{fontSize:9,color:"var(--mut)",marginTop:10,lineHeight:1.6}}>
          First payment processed immediately · Recurring every month<br/>
          Cancel anytime with 7 days notice
        </div>
      </div>
    </div>)}
  </div>);
}


// ─── MEAL PLAN GENERATOR — LEAD MAGNET + AUTO SEGMENTATION ──────────────────
function MealPlanGeneratorPage({showToast}){
  const [step,setStep]=useState(1);
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [goal,setGoal]=useState("muscle");
  const [diet,setDiet]=useState("regular");
  const [generated,setGenerated]=useState(false);

  const goals={
    muscle:{label:"Build Muscle",icon:"💪",color:"var(--red)",desc:"High protein, calorie surplus, strength training focus"},
    fat:{label:"Lose Fat",icon:"🔥",color:"var(--gold)",desc:"Calorie deficit, high protein, metabolism boost"},
    performance:{label:"Athletic Performance",icon:"⚡",color:"var(--green)",desc:"Balanced macros, endurance support, energy optimization"},
  };

  const diets={
    regular:{label:"Regular",icon:"🍗"},
    vegan:{label:"Vegan",icon:"🌱"},
    keto:{label:"Keto",icon:"🥑"},
  };

  const generateMealPlan=async()=>{
    if(!email.trim()||!name.trim())return;
    
    // Save lead with segmentation
    const lead={
      id:Date.now(),
      name,
      email,
      goal,
      diet,
      date:new Date().toLocaleDateString(),
      status:"Lead",
      source:"Meal Plan Generator",
      segment:`${goal}_${diet}`,
      sequence:0,
      lastEmailSent:null
    };
    
    const leads=await store.get("bbr_leads",true)||[];
    leads.push(lead);
    await store.set("bbr_leads",leads,true);

    // Generate meal plan based on goal
    const mealPlanHTML=generatePlanHTML(goal,diet,name);
    
    setGenerated(true);
    showToast("Meal plan generated! Check your email.");
  };

  const generatePlanHTML=(g,d,clientName)=>{
    const plans={
      muscle:{
        regular:[
          {meal:"Breakfast",food:"4 egg whites + 2 whole eggs, oatmeal with banana, olive oil",macros:"40P / 50C / 12F"},
          {meal:"Snack",food:"Chicken breast 6oz, white rice, broccoli",macros:"45P / 60C / 3F"},
          {meal:"Lunch",food:"Ground beef 6oz, sweet potato, avocado",macros:"48P / 45C / 15F"},
          {meal:"Pre-Workout",food:"Rice cakes, almond butter, banana",macros:"15P / 80C / 10F"},
          {meal:"Post-Workout",food:"Whey protein shake 40g, dextrose 50g",macros:"40P / 50C / 1F"},
          {meal:"Dinner",food:"Salmon 6oz, jasmine rice, asparagus",macros:"42P / 50C / 12F"},
          {meal:"Before Bed",food:"Casein protein shake 30g, almonds",macros:"30P / 5C / 8F"},
        ],
        vegan:[
          {meal:"Breakfast",food:"Oatmeal with pea protein powder, banana, almond butter",macros:"35P / 55C / 12F"},
          {meal:"Snack",food:"Tofu 8oz, quinoa, roasted vegetables",macros:"40P / 50C / 8F"},
          {meal:"Lunch",food:"Tempeh 6oz, sweet potato, olive oil drizzle",macros:"38P / 48C / 14F"},
          {meal:"Pre-Workout",food:"Rice cakes, tahini, banana",macros:"12P / 75C / 10F"},
          {meal:"Post-Workout",food:"Vegan protein shake 40g, berries",macros:"40P / 45C / 1F"},
          {meal:"Dinner",food:"Lentil pasta, marinara, nutritional yeast",macros:"42P / 52C / 8F"},
          {meal:"Before Bed",food:"Vegan casein 30g, pumpkin seeds",macros:"28P / 8C / 10F"},
        ],
        keto:[
          {meal:"Breakfast",food:"4 whole eggs, avocado, bacon",macros:"28P / 2C / 35F"},
          {meal:"Snack",food:"Beef jerky 4oz, macadamia nuts",macros:"35P / 1C / 28F"},
          {meal:"Lunch",food:"Salmon 8oz, olive oil, spinach",macros:"52P / 2C / 32F"},
          {meal:"Pre-Workout",food:"MCT oil 1 tbsp, salt",macros:"0P / 0C / 14F"},
          {meal:"Post-Workout",food:"Whey protein 30g, heavy cream",macros:"28P / 2C / 8F"},
          {meal:"Dinner",food:"Ribeye 8oz, butter, broccoli",macros:"58P / 3C / 38F"},
          {meal:"Before Bed",food:"Casein 30g, almond butter",macros:"30P / 2C / 12F"},
        ],
      },
      fat:{
        regular:[
          {meal:"Breakfast",food:"Egg white omelette 5 whites, chicken sausage, oatmeal",macros:"35P / 40C / 3F"},
          {meal:"Snack",food:"Greek yogurt with berries",macros:"20P / 20C / 1F"},
          {meal:"Lunch",food:"Grilled chicken 7oz, brown rice, broccoli",macros:"52P / 50C / 2F"},
          {meal:"Snack",food:"Protein shake 30g, banana",macros:"30P / 30C / 1F"},
          {meal:"Dinner",food:"Lean ground turkey 6oz, sweet potato, green beans",macros:"45P / 40C / 3F"},
          {meal:"Evening",food:"Casein 25g, berries",macros:"25P / 15C / 1F"},
        ],
        vegan:[
          {meal:"Breakfast",food:"Oatmeal, pea protein 30g, berries",macros:"32P / 45C / 3F"},
          {meal:"Snack",food:"Hummus with veggies",macros:"8P / 18C / 4F"},
          {meal:"Lunch",food:"Tofu stir-fry 6oz, brown rice, mixed veg",macros:"38P / 48C / 5F"},
          {meal:"Snack",food:"Vegan protein shake, banana",macros:"28P / 28C / 1F"},
          {meal:"Dinner",food:"Lentil curry with chickpeas, rice",macros:"42P / 52C / 4F"},
          {meal:"Evening",food:"Vegan casein 25g",macros:"24P / 12C / 1F"},
        ],
        keto:[
          {meal:"Breakfast",food:"Eggs 3, bacon, avocado",macros:"22P / 2C / 20F"},
          {meal:"Lunch",food:"Salmon 6oz, avocado, olive oil",macros:"45P / 1C / 24F"},
          {meal:"Dinner",food:"Beef 6oz, butter, spinach",macros:"48P / 2C / 28F"},
          {meal:"Snack",food:"Macadamia nuts, cheese",macros:"8P / 1C / 18F"},
        ],
      },
      performance:{
        regular:[
          {meal:"Breakfast",food:"Pancakes with berries, eggs, honey",macros:"38P / 65C / 8F"},
          {meal:"Pre-Workout",food:"Banana, rice cakes, honey",macros:"5P / 85C / 1F"},
          {meal:"Post-Workout",food:"Whey 40g, dextrose, creatine",macros:"40P / 60C / 1F"},
          {meal:"Lunch",food:"Chicken 7oz, pasta, marinara",macros:"50P / 70C / 4F"},
          {meal:"Snack",food:"Greek yogurt, granola",macros:"20P / 35C / 3F"},
          {meal:"Dinner",food:"Salmon 6oz, rice, vegetables",macros:"48P / 60C / 12F"},
        ],
        vegan:[
          {meal:"Breakfast",food:"Smoothie bowl with granola and berries",macros:"32P / 80C / 6F"},
          {meal:"Pre-Workout",food:"Banana, maple syrup",macros:"2P / 75C / 0F"},
          {meal:"Post-Workout",food:"Vegan protein 40g, date paste",macros:"40P / 55C / 1F"},
          {meal:"Lunch",food:"Tofu 6oz, quinoa, roasted veg",macros:"42P / 65C / 8F"},
          {meal:"Snack",food:"Smoothie with pea protein",macros:"28P / 40C / 2F"},
          {meal:"Dinner",food:"Lentil pasta, tahini sauce",macros:"45P / 65C / 10F"},
        ],
        keto:[
          {meal:"Breakfast",food:"Eggs, bacon, avocado",macros:"28P / 1C / 32F"},
          {meal:"Pre-Workout",food:"MCT oil, salt",macros:"0P / 0C / 14F"},
          {meal:"Post-Workout",food:"Whey 35g, cream",macros:"35P / 2C / 6F"},
          {meal:"Lunch",food:"Salmon 8oz, butter",macros:"56P / 0C / 38F"},
          {meal:"Dinner",food:"Steak 8oz, olive oil, greens",macros:"58P / 1C / 40F"},
        ],
      },
    };

    return plans[g]?.[d] || plans[g].regular;
  };

  if(generated)return(<div className="sec" style={{maxWidth:600,margin:"0 auto"}}>
    <div className="card"><div className="card-body" style={{textAlign:"center",padding:"32px 20px"}}>
      <div style={{fontSize:48,marginBottom:10}}>🎉</div>
      <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:24,color:"var(--gold)",marginBottom:8}}>MEAL PLAN GENERATED!</div>
      <div style={{fontSize:13,color:"var(--mut)",lineHeight:1.85,marginBottom:18}}>
        Your custom {goals[goal].label} meal plan ({diets[diet].label}) is being sent to <strong style={{color:"var(--w)"}}>{email}</strong><br/>
        <span style={{fontSize:11,marginTop:8,display:"block",fontStyle:"italic"}}>Check your inbox in 2 minutes. Rod will follow up with the next steps.</span>
      </div>
      <div style={{background:"var(--g2)",borderRadius:3,padding:12,marginBottom:14,fontSize:11,color:"var(--mut)",lineHeight:1.7}}>
        📧 You'll receive: 7-day meal plan + shopping list + macro tracking guide<br/>
        💪 Next: Rod will recommend the perfect package for your {goals[goal].label} goal
      </div>
      <button className="btn" onClick={()=>{window.location.href="/";showToast("Explore more programs");}}>Explore More Programs</button>
    </div></div>
  </div>);

  return(<div className="sec">
    <div className="stag">Free Meal Plan</div>
    <h2 className="sh2">GET YOUR<br/>CUSTOM MEAL PLAN.</h2>
    <p className="sbody">7-day meal plan built around YOUR goal. Pick your dietary preference. Get instant results. No credit card required.</p>

    {step===1&&(<>
      <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.06),rgba(232,25,44,0.03))",border:"1px solid rgba(212,168,67,0.18)",borderRadius:4,padding:20,marginBottom:20}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:14}}>Step 1: What's Your Goal?</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
          {Object.entries(goals).map(([k,v])=>(
            <button key={k} onClick={()=>{setGoal(k);setStep(2);}} style={{padding:14,borderRadius:3,border:goal===k?`2px solid ${v.color}`:"1px solid var(--bdr)",background:goal===k?v.color+"15":"var(--g3)",color:v.color,cursor:"pointer",transition:"all 0.2s",fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:700}}>
              <div style={{fontSize:28,marginBottom:6}}>{v.icon}</div>
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </>)}

    {step===2&&(<>
      <div style={{background:"linear-gradient(135deg,rgba(212,168,67,0.06),rgba(232,25,44,0.03))",border:"1px solid rgba(212,168,67,0.18)",borderRadius:4,padding:20,marginBottom:20}}>
        <div style={{fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"var(--gold)",marginBottom:14}}>Step 2: Your Dietary Preference</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:16}}>
          {Object.entries(diets).map(([k,v])=>(
            <button key={k} onClick={()=>setDiet(k)} style={{padding:12,borderRadius:3,border:diet===k?"2px solid var(--green)":"1px solid var(--bdr)",background:diet===k?"rgba(34,197,94,0.15)":"var(--g3)",color:diet===k?"var(--green)":"var(--mut)",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Oswald',sans-serif",fontSize:12,fontWeight:700}}>
              <div style={{fontSize:24,marginBottom:4}}>{v.icon}</div>
              {v.label}
            </button>
          ))}
        </div>
        <button className="btn btn-full btn-gold" onClick={()=>setStep(3)}>Continue →</button>
      </div>
    </>)}

    {step===3&&(<>
      <div className="card">
        <div className="card-hdr"><span className="card-title">Get Your Meal Plan</span></div>
        <div className="card-body">
          <div style={{background:"var(--g2)",borderRadius:3,padding:12,marginBottom:14,fontSize:11,color:"var(--mut)",lineHeight:1.7}}>
            {goals[goal].icon} <strong style={{color:goals[goal].color}}>{goals[goal].label}</strong> + {diets[diet].label} meals<br/>
            <span style={{fontSize:10,marginTop:4,display:"block"}}>{goals[goal].desc}</span>
          </div>

          <div style={{marginBottom:12}}>
            <div className="lbl">Full Name *</div>
            <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
          </div>

          <div style={{marginBottom:14}}>
            <div className="lbl">Email Address *</div>
            <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" type="email"/>
          </div>

          <div style={{background:"rgba(212,168,67,0.06)",border:"1px solid rgba(212,168,67,0.18)",borderRadius:3,padding:10,marginBottom:14,fontSize:10,color:"var(--mut)",lineHeight:1.65}}>
            ✓ 7-day meal plan with macros<br/>
            ✓ Shopping list organized by aisle<br/>
            ✓ Meal prep instructions<br/>
            ✓ Rod's follow-up (within 24 hours)
          </div>

          <button className="btn btn-full btn-gold" onClick={generateMealPlan} disabled={!email.trim()||!name.trim()}>
            🎁 Get My Free Meal Plan →
          </button>

          <div style={{fontSize:9,color:"var(--mut)",textAlign:"center",marginTop:10,lineHeight:1.6}}>
            We respect your privacy. One email max per day.<br/>
            <button className="btn-link" onClick={()=>setStep(2)} style={{marginTop:8}}>← Back</button>
          </div>
        </div>
      </div>
    </>)}
  </div>);
}

