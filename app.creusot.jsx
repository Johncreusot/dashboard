const { useState, useEffect, useCallback, useRef } = React;

/* ─── THEMES ─────────────────────────────────────────────── */
const THEMES = {
  dark: {
    bg:"#07080D",bg1:"#0E1118",bg2:"#141820",bg3:"#1C2130",
    border:"#252D3D",border2:"#2E3A50",
    btc:"#F7931A",blue:"#1E40AF",teal:"#0EA5E9",gold:"#EAB308",
    purple:"#8B5CF6",green:"#10B981",red:"#EF4444",orange:"#F97316",gray:"#6B7280",
    text:"#F1F5F9",text2:"#9CA3AF",text3:"#4B5563",
    name:"Dark", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  arctic: {
    bg:"#EEF3F8",bg1:"#FFFFFF",bg2:"#E2EAF2",bg3:"#D0DCE8",
    border:"#BFD0E0",border2:"#A8C0D6",
    btc:"#C96A0E",blue:"#1A5FA8",teal:"#0284C7",gold:"#92620A",
    purple:"#6D3FB5",green:"#047857",red:"#DC2626",orange:"#C2410C",gray:"#4A6880",
    text:"#0D1F30",text2:"#2E4D65",text3:"#6B8FA8",
    name:"Arctic Light", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  bloomberg: {
    bg:"#0A0C0A",bg1:"#0E110E",bg2:"#141A14",bg3:"#1A221A",
    border:"#1E2E1E",border2:"#243624",
    btc:"#00FF41",blue:"#00CC33",teal:"#00E676",gold:"#FFD600",
    purple:"#00FF41",green:"#00FF41",red:"#FF3131",orange:"#FFB300",gray:"#4A7A45",
    text:"#C8F0C0",text2:"#7AB870",text3:"#3D6B38",
    name:"Bloomberg Terminal", font:"'Courier New','Lucida Console',monospace",
    radius:3, radiusSm:2,
  },
  midnight: {
    bg:"#080612",bg1:"#0F0A1E",bg2:"#160F2A",bg3:"#1E1538",
    border:"#2D2050",border2:"#3D2D6A",
    btc:"#D4A843",blue:"#7B5EA7",teal:"#9B6DD4",gold:"#D4A843",
    purple:"#B87FE8",green:"#4CC9A0",red:"#E05585",orange:"#D4A843",gray:"#5A4880",
    text:"#EDE8FF",text2:"#A090C8",text3:"#5A4880",
    name:"Midnight Luxury", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:16, radiusSm:10,
  },
  bitcoin: {
    bg:"#0D0800",bg1:"#150C00",bg2:"#1E1200",bg3:"#2A1A00",
    border:"#3D2800",border2:"#5A3C00",
    btc:"#F7931A",blue:"#C4720E",teal:"#FFB347",gold:"#FFD700",
    purple:"#F7931A",green:"#F7931A",red:"#FF4500",orange:"#F7931A",gray:"#6B4E1A",
    text:"#FFF8F0",text2:"#D4956A",text3:"#6B4E1A",
    name:"Bitcoin Maximalist", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  frozen: {
    // ❄ Frozen Throne — nuit arctique, cristaux de glace, runes bleues
    bg:"#020814",bg1:"#060F1E",bg2:"#0B1828",bg3:"#101F35",
    border:"#1A3A5C",border2:"#2A5A8A",
    btc:"#7DD8FF",blue:"#4FACDE",teal:"#00D4FF",gold:"#A8DFFF",
    purple:"#8BB4E8",green:"#4DE8C4",red:"#FF4D6A",orange:"#7DD8FF",gray:"#3A6080",
    text:"#D0EEFF",text2:"#7AADCC",text3:"#3A6080",
    name:"❄ Frozen Throne", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:6, radiusSm:3,
  },
  tropical: {
    // 🌴 Tropical — sable blanc, eau turquoise, soleil
    bg:"#FFF9EE",bg1:"#FFFDF7",bg2:"#FFF3D4",bg3:"#FFE8A8",
    border:"#FFD580",border2:"#FFB830",
    btc:"#FF8C00",blue:"#0099CC",teal:"#00C2C7",gold:"#FFB830",
    purple:"#E040A0",green:"#00A878",red:"#E53935",orange:"#FF8C00",gray:"#8AA0A8",
    text:"#1A3040",text2:"#2D6070",text3:"#8AA0A8",
    name:"🌴 Tropical", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:20, radiusSm:12,
  },
};

/* C est une variable module réassignable au changement de thème */
let C = THEMES.dark;
const getCC = () => ({Indices:C.blue,Picking:C.teal,Or:C.gold,Cash:C.gray});
let cc = getCC();


/* ─── TF_CUTS dynamiques ─────────────────────────────── */
function makeTFCuts(){
  const t=new Date(Date.now() + NC_OFFSET_MS); // heure locale NC (UTC+11)
  const pad=n=>String(n).padStart(2,"0");
  const fmt=d=>`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  const d7=new Date(+t -  7*864e5);
  const d30=new Date(+t - 30*864e5);
  const d1y=new Date(+t - 365*864e5);
  const y=t.getUTCFullYear(), m=pad(t.getUTCMonth()+1);
  return {"1W":fmt(d7),"1M":fmt(d30),"MTD":`${y}-${m}-01`,"YTD":`${y}-01-01`,"1Y":fmt(d1y),"2Y":fmt(new Date(+d1y - 365*864e5)),"ALL":"2020-01-01"};
}

/* ─── DATA ──────────────────────────────────────────────── */
/* ─── FONDS GDB ──────────────────────────────────────────── */
const GDB_S_NB_PARTS = 228;  // col AK onglet Chart
const GDB_C_NB_PARTS = 1048;   // col P onglet Chart
function calcGdbPrices(src){
  // GDB.S = Indices + Picking + Or + Cash plateforme (EURO/USD/STRC)
  // → tout sauf KuCoin (absent du portfolio, val=0)
  const gdbSfondsUSD = src.stocks.items
    .reduce((s,x)=>s+x.val, 0);  // tous les stocks incl. Cash (EURO+USD+STRC)
  const gdbS = parseFloat((gdbSfondsUSD / GDB_S_NB_PARTS).toFixed(4));
  // GDB.C = crypto (BTC) + KuCoin (0$)
  const gdbC = parseFloat((src.crypto.total / GDB_C_NB_PARTS).toFixed(4));
  return {gdbS, gdbC, gdbSfondsUSD};
}
const CHART_MONTHLY = [{"d": "2022-01", "w": 18065, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -2800, "inv": null}, {"d": "2022-02", "w": 17777, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -288, "inv": null}, {"d": "2022-03", "w": 22202, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 4425, "inv": null}, {"d": "2022-04", "w": 22046, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -156, "inv": null}, {"d": "2022-05", "w": 21163, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -883, "inv": null}, {"d": "2022-06", "w": 15745, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -5418, "inv": null}, {"d": "2022-07", "w": 21027, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 5282, "inv": null}, {"d": "2022-08", "w": 23117, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 2090, "inv": null}, {"d": "2022-09", "w": 17863, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -5254, "inv": null}, {"d": "2022-10", "w": 21523, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 3660, "inv": null}, {"d": "2022-11", "w": 14561, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -6962, "inv": null}, {"d": "2022-12", "w": 15385, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 824, "inv": null}, {"d": "2023-01", "w": 27063, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 11678, "inv": null}, {"d": "2023-02", "w": 23137, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -3926, "inv": null}, {"d": "2023-03", "w": 32662, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 9525, "inv": null}, {"d": "2023-04", "w": 37411, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 4749, "inv": null}, {"d": "2023-05", "w": 31862, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -5549, "inv": null}, {"d": "2023-06", "w": 34775, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 2913, "inv": null}, {"d": "2023-07", "w": 31216, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -3559, "inv": null}, {"d": "2023-08", "w": 33523, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 2307, "inv": null}, {"d": "2023-09", "w": 31038, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -2485, "inv": null}, {"d": "2023-10", "w": 42797, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 11759, "inv": null}, {"d": "2023-11", "w": 46292, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 3495, "inv": null}, {"d": "2023-12", "w": 55064, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 8772, "inv": null}, {"d": "2024-01", "w": 57785, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 2721, "inv": null}, {"d": "2024-02", "w": 91068, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 33283, "inv": null}, {"d": "2024-03", "w": 101759, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 10691, "inv": null}, {"d": "2024-04", "w": 88978, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -12781, "inv": null}, {"d": "2024-05", "w": 114664, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 25686, "inv": null}, {"d": "2024-06", "w": 100912, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -13752, "inv": null}, {"d": "2024-07", "w": 114304, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 13392, "inv": null}, {"d": "2024-08", "w": 89950, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -24354, "inv": null}, {"d": "2024-09", "w": 104737, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 14787, "inv": null}, {"d": "2024-10", "w": 120644, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 15907, "inv": null}, {"d": "2024-11", "w": 180732, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 60088, "inv": null}, {"d": "2024-12", "w": 167485, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -13247, "inv": null}, {"d": "2025-01", "w": 186421, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 18936, "inv": null}, {"d": "2025-02", "w": 131265, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -55156, "inv": null}, {"d": "2025-03", "w": 124112, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -7153, "inv": null}, {"d": "2025-04", "w": 138950, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 14838, "inv": null}, {"d": "2025-05", "w": 170526, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 31576, "inv": null}, {"d": "2025-06", "w": 153432, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -17094, "inv": null}, {"d": "2025-07", "w": 187171, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 33739, "inv": null}, {"d": "2025-08", "w": 175821, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -11350, "inv": null}, {"d": "2025-09", "w": 180092, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 4271, "inv": null}, {"d": "2025-10", "w": 188385, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 8293, "inv": null}, {"d": "2025-11", "w": 147276, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -41109, "inv": null}, {"d": "2025-12", "w": 137692, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -9584, "inv": null}, {"d": "2026-01", "w": 150475, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 12783, "inv": null}, {"d": "2026-02", "w": 104425, "t": null, "btc": null, "gc": null, "gs": null, "pnl": -46050, "inv": null}, {"d": "2026-03", "w": 125387, "t": null, "btc": null, "gc": null, "gs": null, "pnl": 20962, "inv": null}];

const GDB_HIST=[
  {d:"2023-01",gdb:100,btc:100,sp:100,nq:100,eth:100},
  {d:"2023-02",gdb:121.4,btc:145.5,sp:105.5,nq:104.6,eth:139.3},
  {d:"2023-03",gdb:168.8,btc:186.5,sp:107.2,nq:107.8,eth:159.5},
  {d:"2023-04",gdb:186.3,btc:208.2,sp:110.6,nq:115.3,eth:175.2},
  {d:"2023-05",gdb:168.0,btc:181.6,sp:108.8,nq:119.4,eth:159.8},
  {d:"2023-06",gdb:188.1,btc:197.3,sp:114.1,nq:130.4,eth:170.6},
  {d:"2023-07",gdb:175.3,btc:179.4,sp:117.5,nq:135.3,eth:157.2},
  {d:"2023-08",gdb:157.8,btc:169.5,sp:114.6,nq:130.0,eth:141.5},
  {d:"2023-09",gdb:163.2,btc:165.0,sp:110.8,nq:124.8,eth:134.7},
  {d:"2023-10",gdb:217.6,btc:212.1,sp:113.1,nq:126.6,eth:149.8},
  {d:"2023-11",gdb:236.5,btc:231.6,sp:120.4,nq:136.9,eth:175.3},
  {d:"2023-12",gdb:281.9,btc:258.8,sp:123.5,nq:144.4,eth:186.4},
  {d:"2024-01",gdb:252.3,btc:263.3,sp:126.6,nq:148.5,eth:167.9},
  {d:"2024-02",gdb:346.2,btc:348.8,sp:134.6,nq:162.7,eth:197.2},
  {d:"2024-03",gdb:330.8,btc:427.3,sp:140.4,nq:174.5,eth:225.7},
  {d:"2024-04",gdb:270.4,btc:386.3,sp:133.0,nq:163.6,eth:208.3},
  {d:"2024-05",gdb:293.6,btc:419.3,sp:138.7,nq:175.3,eth:212.4},
  {d:"2024-06",gdb:252.7,btc:373.0,sp:139.0,nq:178.8,eth:199.2},
  {d:"2024-07",gdb:278.5,btc:405.8,sp:144.9,nq:177.5,eth:203.1},
  {d:"2024-08",gdb:238.7,btc:363.6,sp:148.5,nq:179.7,eth:188.7},
  {d:"2024-09",gdb:310.2,btc:402.5,sp:155.6,nq:186.4,eth:201.3},
  {d:"2024-10",gdb:366.7,btc:443.6,sp:157.3,nq:186.7,eth:207.2},
  {d:"2024-11",gdb:566.7,btc:586.2,sp:162.3,nq:196.1,eth:265.3},
  {d:"2024-12",gdb:537.4,btc:574.4,sp:159.6,nq:193.4,eth:245.8},
  {d:"2025-01",gdb:554.2,btc:638.0,sp:162.9,nq:198.1,eth:247.2},
  {d:"2025-02",gdb:340.2,btc:518.8,sp:155.9,nq:186.0,eth:183.7},
  {d:"2025-03",gdb:335.5,btc:506.8,sp:145.7,nq:173.5,eth:163.0},
  {d:"2025-04",gdb:413.7,btc:578.1,sp:150.9,nq:183.5,eth:190.8},
  {d:"2025-05",gdb:521.3,btc:641.8,sp:163.7,nq:197.3,eth:220.3},
  {d:"2025-06",gdb:494.2,btc:659.8,sp:167.8,nq:205.5,eth:213.7},
  {d:"2025-07",gdb:641.2,btc:727.3,sp:176.0,nq:218.8,eth:249.3},
  {d:"2025-08",gdb:618.0,btc:667.0,sp:171.0,nq:208.7,eth:227.4},
  {d:"2025-09",gdb:633.8,btc:696.6,sp:175.3,nq:212.4,eth:238.2},
  {d:"2025-10",gdb:580.4,btc:671.7,sp:170.8,nq:207.9,eth:228.1},
  {d:"2025-11",gdb:476.8,btc:527.0,sp:165.5,nq:200.8,eth:207.3},
  {d:"2025-12",gdb:443.4,btc:537.7,sp:163.7,nq:198.5,eth:197.2},
  {d:"2026-01",gdb:444.6,btc:563.3,sp:171.2,nq:222.1,eth:268.9},
  {d:"2026-02",gdb:385.3,btc:481.8,sp:163.2,nq:204.9,eth:191.2},
  {d:"2026-03",gdb:390.5,btc:488.2,sp:170.4,nq:218.3,eth:193.5},
  {d:"2026-04",gdb:385.3,btc:481.8,sp:179.4,nq:238.0,eth:196.4},
  {d:"2026-05",gdb:396.8,btc:496.2,sp:181.7,nq:242.5,eth:200.4},
];

const GDBS_2026 = [{"d": "Mai-31", "s": 100.0614, "sp": 100, "nq": 100}];

const CURRENT = {"date": "2026-05-31", "totalUSD": 142170, "totalEUR": 130796, "usdEur": 0.92, "eurUsd": 1.086957, "btcPrice": 43588.99, "gdbC": 99.9847, "gdbS": 100.0614, "crypto": {"date": "2026-05-31", "total": 104784, "items": [{"t": "BTC", "qty": 2.14325481, "pa": 43588.99, "live": 43588.99, "val": 93422, "pnl": 0, "pct": 0}, {"t": "ETH", "qty": 5.5, "pa": 2065.81, "live": 2065.81, "val": 11362, "pnl": 0, "pct": 0}]}, "stocks": {"date": "2026-05-31", "total": 28694, "items": [{"t": "NVDA", "cat": "Picking", "qty": 12.0, "pa": 179.92, "live": 179.92, "val": 2159, "pnl": 0, "pct": 0}, {"t": "IWDA", "cat": "Indices", "qty": 20.0, "pa": 133.0571, "live": 133.0571, "val": 2661, "pnl": 0, "pct": 0}, {"t": "APH", "cat": "Picking", "qty": 26.0, "pa": 131.41, "live": 131.41, "val": 3417, "pnl": 0, "pct": 0}, {"t": "ANET", "cat": "Picking", "qty": 20.0, "pa": 146.25, "live": 146.25, "val": 2925, "pnl": 0, "pct": 0}, {"t": "AXON", "cat": "Picking", "qty": 12.5, "pa": 386.94, "live": 386.94, "val": 4837, "pnl": 0, "pct": 0}, {"t": "PLTR", "cat": "Picking", "qty": 50.0, "pa": 136.3, "live": 136.3, "val": 6815, "pnl": 0, "pct": 0}, {"t": "USD", "cat": "Cash", "qty": 5880, "pa": 1.0, "live": 1.0, "val": 5880, "pnl": 0, "pct": 0}, {"t": "KUCOIN", "cat": "Cash", "qty": 0, "pa": 1.0, "live": 1.0, "val": 0, "pnl": 0, "pct": 0}]}, "bank": {"date": "2026-05-31", "totalEUR": 7997, "breakdown": {"LCL": 7159, "BCI": 838, "DeBlock": 0}}, "portfolio": {"date": "2026-05-31", "items": [{"t": "BTC", "qty": 2.14325481, "pa": 43588.99, "live": 43588.99, "val": 93422, "pnl": 0, "pct": 0, "cat": "Crypto", "valEUR": 85948}, {"t": "ETH", "qty": 5.5, "pa": 2065.81, "live": 2065.81, "val": 11362, "pnl": 0, "pct": 0, "cat": "Crypto", "valEUR": 10453}, {"t": "NVDA", "cat": "Picking", "qty": 12.0, "pa": 179.92, "live": 179.92, "val": 2159, "pnl": 0, "pct": 0, "valEUR": 1986}, {"t": "IWDA", "cat": "Indices", "qty": 20.0, "pa": 133.0571, "live": 133.0571, "val": 2661, "pnl": 0, "pct": 0, "valEUR": 2448}, {"t": "APH", "cat": "Picking", "qty": 26.0, "pa": 131.41, "live": 131.41, "val": 3417, "pnl": 0, "pct": 0, "valEUR": 3144}, {"t": "ANET", "cat": "Picking", "qty": 20.0, "pa": 146.25, "live": 146.25, "val": 2925, "pnl": 0, "pct": 0, "valEUR": 2691}, {"t": "AXON", "cat": "Picking", "qty": 12.5, "pa": 386.94, "live": 386.94, "val": 4837, "pnl": 0, "pct": 0, "valEUR": 4450}, {"t": "PLTR", "cat": "Picking", "qty": 50.0, "pa": 136.3, "live": 136.3, "val": 6815, "pnl": 0, "pct": 0, "valEUR": 6270}, {"t": "LCL", "cat": "Cash Matelas", "qty": 7159, "pa": 1.0, "live": 1.086957, "val": 7782, "pnl": 0, "pct": 0.0, "valEUR": 7159}, {"t": "BCI", "cat": "Cash Matelas", "qty": 838, "pa": 1.0, "live": 1.086957, "val": 911, "pnl": 0, "pct": 0.0, "valEUR": 838}, {"t": "DeBlock", "cat": "Cash Matelas", "qty": 0, "pa": 1.0, "live": 1.086957, "val": 0, "pnl": 0, "pct": 0.0, "valEUR": 0}, {"t": "USD", "cat": "Cash", "qty": 5880, "pa": 1.0, "live": 1.0, "val": 5880, "pnl": 0, "pct": 0, "valEUR": 5410}, {"t": "KUCOIN", "cat": "Cash", "qty": 0, "pa": 1.0, "live": 1.0, "val": 0, "pnl": 0, "pct": 0, "valEUR": 0}]}, "alloc": [{"n": "Crypto", "pct": 73.7, "tgt": 74, "c": "#F7931A"}, {"n": "Picking", "pct": 14.2, "tgt": 14, "c": "#7B68EE"}, {"n": "Cash Matelas", "pct": 6.1, "tgt": 6, "c": "#6B7280"}, {"n": "Cash Dip", "pct": 4.1, "tgt": 4, "c": "#22C55E"}, {"n": "Indices", "pct": 1.9, "tgt": 2, "c": "#4A90D9"}]};

const MONTHS = {"2022": {"m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "pct": [-0.0376, -0.004, 0.062, -0.0021, -0.0117, -0.0725, 0.0762, 0.028, -0.0685, 0.0512, -0.0927, 0.0121], "pnl": [-2800, -288, 4425, -156, -883, -5418, 5282, 2090, -5254, 3660, -6962, 824], "ttl": -5480}, "2023": {"m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "pct": [0.1693, -0.0487, 0.1241, 0.0551, -0.061, 0.0341, -0.0403, 0.0272, -0.0285, 0.1389, 0.0363, 0.0878], "pnl": [11678, -3926, 9525, 4749, -5549, 2913, -3559, 2307, -2485, 11759, 3495, 8772], "ttl": 39679}, "2024": {"m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "pct": [0.025, 0.2988, 0.0739, -0.0823, 0.1802, -0.0817, 0.0867, -0.145, 0.103, 0.1005, 0.3449, -0.0565], "pnl": [2721, 33283, 10691, -12781, 25686, -13752, 13392, -24354, 14787, 15907, 60088, -13247], "ttl": 112421}, "2025": {"m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "pct": [0.0856, -0.2298, -0.0387, 0.0835, 0.164, -0.0763, 0.163, -0.0471, 0.0186, 0.0355, -0.1699, -0.0477], "pnl": [18936, -55156, -7153, 14838, 31576, -17094, 33739, -11350, 4271, 8293, -41109, -9584], "ttl": -29793}, "2026": {"m": ["JAN", "FEV", "MAR"], "pct": [0.0668, -0.2257, 0.1327], "pnl": [12783, -46050, 20962], "ttl": -12305}};
const SEAS = {"m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "pct": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
const SEED_TXNS = [];

/* ─── UTILS ─────────────────────────────────────────────── */
const fmt=n=>!n||isNaN(n)?"-":Math.round(Math.abs(n)).toLocaleString("fr-FR");
const fmtK=n=>!n||isNaN(n)?"-":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":Math.round(n).toString();
const fmtP=(n,d=1)=>isNaN(n)?"-":(n>=0?"+":"")+((n*100).toFixed(d))+"%";
const clr=n=>(n||0)>=0?"#10B981":"#EF4444";
// Masque les montants si hidden=true, les % restent toujours visibles
const msk=(val,hidden)=>hidden?"••••":val;

/* ═══════════════════════════════════════════════════════════
   LIVE PRICE ENGINE  v6
   - BTC/EUR   : CoinGecko public API (no key needed)
   - Stocks    : Yahoo Finance via allorigins proxy
   Updates CURRENT quantities and recalculates all totals.
═══════════════════════════════════════════════════════════ */

/* Ticker → Yahoo Finance symbol mapping */
let YF_MAP = {"BTC": "BTC-USD", "ETH": "ETH-USD", "NVDA": "NVDA", "IWDA": "IWDA.L", "APH": "APH", "ANET": "ANET", "AXON": "AXON", "PLTR": "PLTR"};

/* Ticker → CoinGecko ID mapping (catégorie Crypto) */
const CG_MAP = {"BTC": "bitcoin", "ETH": "ethereum"};
// Base d'icônes persistante : { ticker: { user: string|null, fmp: url|null } }
// - user : icône choisie par l'utilisateur (emoji ou texte)
// - fmp  : URL logo officiel récupéré via FMP (stocké pour éviter les re-fetches)
// Sauvegardé dans gdb_icons sur Cloudflare KV
let ICON_DB = {};
// Compatibilité : CUSTOM_ICONS = alias en lecture seule sur ICON_DB.user
// (pour le Proxy TICKER_ICONS existant)
let CUSTOM_ICONS = {}; // maintenu en sync avec ICON_DB via syncCustomIcons()
// Tickers EU dont le prix est en € → à convertir en $ après fetch
const EUR_YAHOO_TICKERS_SET = new Set(["AVIO","AI","GOLD"]);

/* Fetch single Yahoo Finance quote via allorigins proxy */
// Tickers EU passent par le Worker Cloudflare (pas de CORS)
// Tickers US passent par les proxies publics
const EU_YAHOO_TICKERS = new Set(["AVIO.MI","AI.PA","GOLD.PA","JEDI.L","AIA"]);

async function fetchYahooCF(symbol){
  // Via Cloudflare Worker — pas de CORS, supporte les bourses EU
  try{
    const res = await fetch(`${CF_WORKER_URL}/yahoo?symbol=${encodeURIComponent(symbol)}`,{
      headers:{"X-Auth-Key":CF_AUTH_KEY},
      signal: AbortSignal.timeout(10000),
    });
    if(!res.ok) return null;
    const data = await res.json();
    return data?.price ?? null;
  }catch(e){ return null; }
}

async function fetchYahoo(symbol){
  // Essai via Cloudflare d'abord (plus fiable pour EU)
  const cfPrice = await fetchYahooCF(symbol);
  if(cfPrice) return cfPrice;
  // Fallback proxies publics pour tickers US
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];
  for(const proxy of proxies){
    try{
      const res = await fetch(proxy, {signal: AbortSignal.timeout(10000)});
      if(!res.ok) continue;
      const json = await res.json();
      const raw = typeof json.contents === "string" ? json.contents : JSON.stringify(json);
      const data = JSON.parse(raw);
      const result = data?.chart?.result?.[0];
      if(!result) continue;
      const meta = result.meta;
      const live = meta?.regularMarketPrice;
      const closes = result?.indicators?.quote?.[0]?.close?.filter(v=>v!=null) || [];
      const lastClose = closes.length ? closes[closes.length-1] : null;
      const price = (live && live > 0) ? live : lastClose;
      if(price && price > 0) return price;
    }catch(e){ continue; }
  }
  return null;
}

/* Fetch BTC + ETH price and EUR/USD rate from CoinGecko */
async function fetchCoinGecko(){
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur";
  const res = await fetch(url, {signal: AbortSignal.timeout(8000)});
  const data = await res.json();
  return {
    btcUSD: data?.bitcoin?.usd ?? null,
    btcEUR: data?.bitcoin?.eur ?? null,
    ethUSD: data?.ethereum?.usd ?? null,
    eurUSD: data?.bitcoin?.usd && data?.bitcoin?.eur
      ? data.bitcoin.usd / data.bitcoin.eur : null,
  };
}

/* v1.03 — Perf 24h pondérée par portefeuille, calculée depuis les prix live.
   Pour chaque actif : variation 24h = (price - prevClose)/prevClose, fournie par
   le Worker (/yahoo renvoie prevClose+pct1d ; CoinGecko renvoie pct1d).
   Perf portefeuille = Σ(val_i × pct24h_i) / Σ(val_i). */
async function fetchPerf24h(src){
  const out = { crypto:{d:null,w:null,m:null}, stocks:{d:null,w:null,m:null}, errors:[] };
  // --- Crypto via CoinGecko markets (24h / 7d / 30d) ---
  try{
    const ids = (src.crypto.items||[]).map(x=>CG_MAP[x.t]).filter(Boolean);
    if(ids.length){
      const u = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids="+ids.join(",")
        +"&price_change_percentage=24h,7d,30d";
      const r = await fetch(u,{signal:AbortSignal.timeout(9000)});
      const arr = await r.json();
      const by = {}; (Array.isArray(arr)?arr:[]).forEach(c=>{ by[c.id]=c; });
      let nd=0,nw=0,nm=0,den=0;
      for(const it of src.crypto.items){
        const c = by[CG_MAP[it.t]]; if(!c) continue;
        const v=it.val||0; den+=v;
        if(c.price_change_percentage_24h_in_currency!=null) nd+=v*(c.price_change_percentage_24h_in_currency/100);
        if(c.price_change_percentage_7d_in_currency!=null)  nw+=v*(c.price_change_percentage_7d_in_currency/100);
        if(c.price_change_percentage_30d_in_currency!=null) nm+=v*(c.price_change_percentage_30d_in_currency/100);
      }
      if(den>0){ out.crypto={d:nd/den, w:nw/den, m:nm/den}; }
    }
  }catch(e){ out.errors.push("crypto"); }
  // --- Stocks via Worker /yahoo-chart (candles 1mo) ---
  try{
    const items = (src.stocks.items||[]).filter(x=>x.cat!=="Cash");
    let nd=0,nw=0,nm=0, dd=0,dw=0,dm=0;
    await Promise.all(items.map(async it=>{
      const sym = YF_MAP[it.t]||it.t;
      try{
        const r = await fetch(`${CF_WORKER_URL}/yahoo-chart?symbol=${encodeURIComponent(sym)}&interval=1d&range=1mo&no_logo=1`,{
          headers:{"X-Auth-Key":CF_AUTH_KEY}, signal:AbortSignal.timeout(10000)});
        const d = await r.json();
        const closes = (d.candles||[]).map(c=>c.c).filter(v=>v!=null);
        const last = d.price || (closes.length?closes[closes.length-1]:null);
        if(last==null||!closes.length) return;
        const v=it.val||0;
        const at = back => closes.length>back ? closes[closes.length-1-back] : closes[0];
        const prev1 = d.prevClose || at(1);
        const prev7 = at(5);   // ~1 semaine de bourse
        const prev30= closes[0]; // début du mois glissant
        if(prev1){ nd+=v*((last-prev1)/prev1); dd+=v; }
        if(prev7){ nw+=v*((last-prev7)/prev7); dw+=v; }
        if(prev30){ nm+=v*((last-prev30)/prev30); dm+=v; }
      }catch(e){}
    }));
    out.stocks = { d: dd>0?nd/dd:null, w: dw>0?nw/dw:null, m: dm>0?nm/dm:null };
  }catch(e){ out.errors.push("stocks"); }
  return out;
}

/* Fetch all prices and return a prices object */
/* ═══════════════════════════════════════════════════════════
   APPLY TRADE  v9
   Met à jour EFF en temps réel quand on enregistre un achat/vente.
   - Recalcule qty, val, pnl, pa du ticker concerné
   - Ajuste bank.totalEUR en contrepartie si banque sélectionnée
   - Retourne le nouvel objet live fusionné avec EFF courant
═══════════════════════════════════════════════════════════ */
function applyTrade(trade, currentEFF){
  const src = currentEFF || CURRENT;
  const {ticker, side, qty, price, bankAccount, cat: tradeCatRaw} = trade;
  const isBuy = side.toUpperCase() === "BUY";
  const tradeUSD = qty * price;
  const usdEur = src.usdEur;

  /* ── Mise à jour des stocks items ── */
  let stocksItems = src.stocks.items.map(item => ({...item}));
  const idx = stocksItems.findIndex(x => x.t.toUpperCase() === ticker.toUpperCase());

  // Catégorie du ticker (depuis le trade si fournie, sinon heuristique)
  const tradeCAT = tradeCatRaw || (
    ticker === "BTC" ? null :
    ["QQQ","AIA","JEDI","ROBO","XLE","OIH"].includes(ticker) ? "Indices" :
    ticker === "GOLD" ? "Or" :
    ticker === "EURO" ? "Cash" : "Picking"
  );

  if(idx >= 0){
    // Ticker existant — mettre à jour
    const item = {...stocksItems[idx]};
    if(isBuy){
      // Recalcul PA pondéré
      const newQty   = item.qty + qty;
      const newCost  = (item.pa * item.qty) + (price * qty);
      item.pa  = newCost / newQty;
      item.qty = newQty;
    } else {
      item.qty = Math.max(0, item.qty - qty);
    }
    item.val = Math.round(item.qty * item.live);
    item.pnl = Math.round(item.val - item.pa * item.qty);
    item.pct = item.pa * item.qty > 0 ? item.pnl / (item.pa * item.qty) : 0;
    stocksItems[idx] = item;
  } else if(isBuy){
    // Nouveau ticker — ajouter
    if(tradeCAT && tradeCAT !== "Crypto") {
      stocksItems.push({
        t: ticker, cat: tradeCAT, qty, pa: price, live: price,
        val: Math.round(qty * price), pnl: 0, pct: 0,
      });
    }
  }

  /* ── Mise à jour BTC si ticker = BTC ── */
  let cryptoItems = src.crypto.items.map(i => ({...i}));
  if(ticker.toUpperCase() === "BTC"){
    const bi = {...cryptoItems[0]};
    if(isBuy){
      const newQty  = bi.qty + qty;
      const newCost = (bi.pa * bi.qty) + (price * qty);
      bi.pa  = newCost / newQty;
      bi.qty = newQty;
    } else {
      bi.qty = Math.max(0, bi.qty - qty);
    }
    bi.val = Math.round(bi.qty * bi.live);
    bi.pnl = Math.round(bi.val - bi.pa * bi.qty);
    bi.pct = bi.pa * bi.qty > 0 ? bi.pnl / (bi.pa * bi.qty) : 0;
    cryptoItems[0] = bi;
  }
  // Supprimer crypto à qty=0
  cryptoItems = cryptoItems.filter(x => x.qty > 0);
  /* ── Mise à jour contrepartie bancaire ── */
  let bank = {...src.bank, breakdown: {...src.bank.breakdown}};
  if(bankAccount && bankAccount !== "Aucune"){
    const tradeEUR = Math.round(tradeUSD * usdEur);
    const current  = bank.breakdown[bankAccount] || 0;
    bank.breakdown[bankAccount] = isBuy
      ? current - tradeEUR   // peut devenir négatif (découvert autorisé)
      : current + tradeEUR;
    bank.totalEUR = Object.values(bank.breakdown).reduce((s,v)=>s+v, 0);

    // Si contrepartie = IBKR → mouvementer IBKR Euro OU IBKR Dollar selon la devise
    if(bankAccount === "IBKR"){
      const tradeInEUR = trade.currency === "EUR";
      if(tradeInEUR){
        // IBKR Euro : mouvementer l'item EURO (qty en €)
        const euroIdx = stocksItems.findIndex(x=>x.t==="EURO");
        if(euroIdx >= 0){
          const euroItem = {...stocksItems[euroIdx]};
          const newQtyEUR = isBuy ? euroItem.qty - tradeEUR : euroItem.qty + tradeEUR;
          euroItem.qty = newQtyEUR;
          euroItem.val = Math.round(newQtyEUR * (euroItem.live||1/usdEur));
          euroItem.pnl = Math.round(euroItem.val - (euroItem.pa||1.17) * newQtyEUR);
          euroItem.valEUR = newQtyEUR;
          stocksItems[euroIdx] = euroItem;
        }
      } else {
        // IBKR Dollar : mouvementer l'item USD (qty en $)
        const usdIdx = stocksItems.findIndex(x=>x.t==="USD");
        if(usdIdx >= 0){
          const usdItem = {...stocksItems[usdIdx]};
          const tradeUSD_amt = Math.round(tradeUSD);
          const newQtyUSD = isBuy ? usdItem.qty - tradeUSD_amt : usdItem.qty + tradeUSD_amt;
          usdItem.qty = newQtyUSD;
          usdItem.val = newQtyUSD;  // 1 USD = 1 USD
          usdItem.pnl = 0;
          usdItem.valEUR = Math.round(newQtyUSD * usdEur);
          stocksItems[usdIdx] = usdItem;
        }
      }
    }
  }

  /* ── Recalcul des totaux ── */
  const stocksTotal  = stocksItems.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val, 0);
  const cryptoTotal  = cryptoItems.reduce((s,x)=>s+x.val, 0);
  const bankUSD      = Math.round(bank.totalEUR / usdEur);
  const cashStocks   = stocksItems.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val, 0);
  const totalUSD     = cryptoTotal + stocksTotal + bankUSD + cashStocks;
  const totalEUR     = Math.round(totalUSD * usdEur);

  /* ── Suppression des items à quantité zéro ── */
  // On mémorise les tickers à zéro AVANT de les supprimer
  const zeroTickers = new Set([
    ...stocksItems.filter(x=>x.qty<=0 && x.cat!=="Cash").map(x=>x.t),
    ...cryptoItems.filter(x=>x.qty<=0).map(x=>x.t),
  ]);
  stocksItems = stocksItems.filter(x => x.cat==="Cash" || x.qty > 0);

  /* ── Ajout du nouveau ticker dans YF_MAP si achat nouveau ticker ── */
  if(isBuy && idx < 0 && ticker.toUpperCase() !== "BTC"){
    // Nouveau ticker — on l'ajoute à YF_MAP avec le symbole Yahoo correspondant
    // Convention : ticker US → tel quel, .MI = Milan, .PA = Paris, .L = London
    if(!YF_MAP[ticker]){
      // Heuristique simple — l'utilisateur peut ajuster manuellement
      YF_MAP[ticker] = ticker;
      console.info(`Nouveau ticker ${ticker} ajouté à YF_MAP`);
    }
  }

  /* ── Mise à jour portfolio.items (structure unifiée) ── */
  let portfolioItems = null;
  if(src.portfolio?.items){
    portfolioItems = src.portfolio.items
      .filter(item => {
        if(item.cat==="Cash Matelas") return true;
        // Supprimer si le ticker est à qty=0 après le trade
        return !zeroTickers.has(item.t);
      })
      .map(item=>{
      // Cash Matelas : quantité = montant€, inchangé par les trades
      if(item.cat==="Cash Matelas"){
        if(bankAccount && bankAccount===item.t){
          const tradeEUR = Math.round(tradeUSD * usdEur);
          const newValEUR = isBuy ? (item.valEUR||item.qty)-tradeEUR : (item.valEUR||item.qty)+tradeEUR;  // négatif autorisé
          const newValUSD = Math.round(newValEUR * (src.eurUsd||1/usdEur));
          return {...item, qty:newValEUR, valEUR:newValEUR, val:newValUSD};
        }
        return item;
      }
      // Crypto/Stocks : mettre à jour depuis cryptoItems/stocksItems
      const updated = [...cryptoItems, ...stocksItems].find(x=>x.t===item.t);
      if(!updated) return item;
      return {...item, qty:updated.qty, pa:updated.pa, val:updated.val, pnl:updated.pnl, pct:updated.pct,
              valEUR:Math.round(updated.val*usdEur)};
    });
  }

  // Ajouter les nouveaux tickers achetés non encore dans portfolio
  if(portfolioItems && isBuy){
    const existing = new Set(portfolioItems.map(x=>x.t));
    [...cryptoItems, ...stocksItems].forEach(item=>{
      if(!existing.has(item.t) && item.qty > 0){
        portfolioItems.push({
          t:item.t, cat:item.cat||"Picking",
          qty:item.qty, pa:item.pa, live:item.live,
          val:item.val, pnl:item.pnl, pct:item.pct,
          valEUR:Math.round(item.val*(src.usdEur||0.852)),
        });
      }
    });
  }

  return {
    ...src,
    totalUSD, totalEUR,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal + cashStocks, items: stocksItems},
    bank,
    ...(portfolioItems ? {portfolio:{...src.portfolio, items:portfolioItems}} : {}),
  };
}

async function fetchAllPrices(){
  const results = {errors: []};

  /* BTC + EUR/USD */
  try {
    const cg = await fetchCoinGecko();
    if(cg.btcUSD) results.BTC = cg.btcUSD;
    if(cg.ethUSD) results.ETH = cg.ethUSD;
    if(cg.eurUSD) results.EURUSD = cg.eurUSD;
  } catch(e) { results.errors.push("BTC/EUR"); }

  /* Stocks in parallel (max 3 at a time to avoid rate limits) */
  const tickers = Object.entries(YF_MAP);
  for(let i=0; i<tickers.length; i+=3){
    const batch = tickers.slice(i, i+3);
    await Promise.all(batch.map(async([key, sym])=>{
      try {
        const price = await fetchYahoo(sym);
        if(price != null) results[key] = price;
        else results.errors.push(`${key}`); // null = échec silencieux
      } catch(e){ results.errors.push(`${key}`); }
    }));
    if(i+3 < tickers.length) await new Promise(r=>setTimeout(r,300));
  }

  return results;
}

/* Apply fetched prices to CURRENT and return updated totals */
function applyPrices(prices, usdEur, effSrc){
  const src  = effSrc || CURRENT;  // ← utilise EFF live, pas CURRENT statique
  const rate = usdEur || src.usdEur;
  const eurUsd = 1 / rate;
  // Suffixes Yahoo Finance des bourses EU (prix en €)
  const EU_SUFFIXES = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".BE",".MU",".SG",".DU",".HM",".VI"];
  // Un ticker est coté en EUR si son Yahoo symbol a un suffixe EU
  const isEurTicker = t => {
    const sym = YF_MAP[t] || t;
    return EU_SUFFIXES.some(s => sym.endsWith(s));
  };

  /* Updated stocks items — depuis src (EFF live) pour conserver les quantités */
  const stocksItems = src.stocks.items.map(item => {
    let newLive = prices[item.t];
    if(!newLive) return item;
    if(isEurTicker(item.t)){
      let priceEUR = newLive;
      if(priceEUR < 1) priceEUR = priceEUR * 100;
      newLive = parseFloat((priceEUR * eurUsd).toFixed(4));
    }
    const currentLive = item.live || 1;
    const variation = Math.abs(newLive - currentLive) / currentLive;
    // Garde-fou anti-aberration : ignoré au 1er chargement (live === pa, pas encore de prix réel)
    const isSeed = (item.live === item.pa);
    if(!isSeed && variation > 0.5){
      console.warn(`Prix aberrant pour ${item.t}: ${newLive} vs ${currentLive} — ignoré`);
      return item;
    }
    const newVal = Math.round(item.qty * newLive);
    const investi = (item.pa || newLive) * item.qty;  // si pa=0, on utilise le prix live comme base
    const newPnl = Math.round(newVal - investi);
    const newPct = investi > 0 ? newPnl / investi : 0;
    return {...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct};
  });
  const stocksTotal = stocksItems.reduce((s,x)=>s+x.val, 0);
  /* Crypto — TOUS les items (BTC, ETH, …), quantités depuis src live */
  const cryptoItems = src.crypto.items.map(c=>{
    const cl = prices[c.t] || c.live;
    const cVal = Math.round(c.qty * cl);
    const cInv = (c.pa || cl) * c.qty;
    const cPnl = Math.round(cVal - cInv);
    return {...c, live:cl, val:cVal, pnl:cPnl, pct: cInv>0 ? cPnl/cInv : 0};
  });
  const cryptoTotal = cryptoItems.reduce((s,x)=>s+x.val, 0);
  const btcSrc  = src.crypto.items[0] || {pa:0,qty:0,live:0};
  const btcLive = prices.BTC || btcSrc.live;

  /* GDB.C et GDB.S */
  const tmpEFF = {
    usdEur: rate, eurUsd, btcPrice: btcLive,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal, items: stocksItems},
    bank: {...src.bank},
  };
  const {gdbS, gdbC} = calcGdbPrices(tmpEFF);

  /* Bank stays in EUR — converti en $ au taux live */
  const bankUSD = Math.round(src.bank.totalEUR * eurUsd);

  /* Totaux */
  const totalUSD = cryptoTotal + stocksTotal + bankUSD;
  const totalEUR = Math.round(totalUSD * rate);

  /* Portfolio.items mis à jour */
  const newEurUsd = eurUsd;
  let portfolioItems = null;
  if(src.portfolio?.items){
    portfolioItems = src.portfolio.items.map(item=>{
      const newLive = cryptoItems.find(c=>c.t===item.t)?.live
                   || stocksItems.find(s=>s.t===item.t)?.live
                   || (item.cat==="Cash Matelas" ? newEurUsd : item.live);
      const newVal = item.cat==="Cash Matelas"
        ? Math.round(item.qty * newEurUsd)
        : Math.round((item.qty||1) * newLive);
      const investi2 = item.cat==="Cash Matelas" ? newVal : (item.pa||newLive)*(item.qty||1);
      const newPnl = item.cat==="Cash Matelas" ? 0 : Math.round(newVal - investi2);
      const newPct2 = investi2 > 0 ? newPnl / investi2 : 0;
      return {
        ...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct2,
        valEUR: item.cat==="Cash Matelas" ? item.valEUR : Math.round(newVal * rate),
      };
    });
  }

  return {
    usdEur: rate, eurUsd,
    totalUSD, totalEUR,
    btcPrice: btcLive,
    _ethLive: prices.ETH || src._ethLive || null,  // conservé pour le snapshot
    gdbC, gdbS,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal, items: stocksItems},
    bank:   {...src.bank},
    ...(portfolioItems ? {portfolio: {...src.portfolio, items: portfolioItems}} : {}),
  };
}

// Date locale UTC+11 (Nouvelle-Calédonie)
const APP_VERSION = "v1.04";
const CRYPTO_FULLNAMES = {BTC:"Bitcoin",ETH:"Ethereum",SOL:"Solana",BNB:"BNB",XRP:"XRP",ADA:"Cardano",DOGE:"Dogecoin",DOT:"Polkadot",AVAX:"Avalanche",LINK:"Chainlink",UNI:"Uniswap",LTC:"Litecoin",ATOM:"Cosmos",HYPE:"Hyperliquid",MATIC:"Polygon"};
const NC_OFFSET_MS = 11 * 60 * 60 * 1000;
const todayNC = () => {
  const nc = new Date(Date.now() + NC_OFFSET_MS);
  return nc.toISOString().slice(0, 10);
};
const today = todayNC; // alias utilisé partout dans le code
// mnt: masque la valeur si hidden=true, sinon la formate
const mnt=(val,hidden,prefix="")=>hidden?"***":(prefix+String(val));
const uid=()=>"t"+Date.now();
/* ═══════════════════════════════════════════════════════════
   STORAGE ENGINE v8 — GitHub Gist (multi-appareils) + localStorage (fallback offline)
   Gist layout: un seul fichier gdb_data.json = { chart: [...], txns: [...] }
═══════════════════════════════════════════════════════════ */
/* ── Cloudflare Worker Storage ─────────────────────────────────── */
const CF_WORKER_URL = "https://blue-firefly-2075watchlist-api.john-creusot.workers.dev";
const CF_AUTH_KEY = "watchlist";
const LS_KEY     = "gdb_sons_v8";

/* Lit le Gist complet — retourne l'objet JSON ou null */
async function cfRead(){
  try{
    const res = await fetch(`${CF_WORKER_URL}/read`,{
      headers:{"X-Auth-Key":CF_AUTH_KEY},
      signal: AbortSignal.timeout(8000),
    });
    if(!res.ok){
      const txt = await res.text().catch(()=>"");
      return {_error:true, status:res.status, statusText:res.statusText, body:txt.slice(0,200)};
    }
    return await res.json();
  }catch(e){
    return {_error:true, status:null, statusText:e.message, body:e.name};
  }
}
const gistRead = cfRead;

/* Écrit l'objet complet dans Cloudflare KV */
async function cfWrite(obj){
  try{
    const res = await fetch(`${CF_WORKER_URL}/write`,{
      method:"POST",
      headers:{"X-Auth-Key":CF_AUTH_KEY,"Content-Type":"application/json"},
      body: JSON.stringify(obj),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  }catch{ return false; }
}
const gistWrite = cfWrite;

async function cfPing(){
  try{
    const res = await fetch(`${CF_WORKER_URL}/ping`,{
      headers:{"X-Auth-Key":CF_AUTH_KEY},
      signal: AbortSignal.timeout(5000),
    });
    if(!res.ok) return {_error:true, status:res.status, statusText:res.statusText, body:""};
    const data = await res.json();
    return data?.ok ? null : {_error:true, status:200, statusText:"Réponse inattendue", body:JSON.stringify(data)};
  }catch(e){
    return {_error:true, status:null, statusText:e.message, body:e.name};
  }
}

/* Cache local (localStorage) */
function lsRead(){ try{ const v=localStorage.getItem(LS_KEY); return v?JSON.parse(v):{}; }catch{ return {}; } }
function lsWrite(obj){ try{ localStorage.setItem(LS_KEY,JSON.stringify(obj)); }catch{} }

/* Cache local pour ICON_DB — clé séparée pour éviter les conflits de taille */
const LS_ICONS_KEY = "gdb_sons_icons_v1";
function lsReadIcons(){ try{ const v=localStorage.getItem(LS_ICONS_KEY); return v?JSON.parse(v):null; }catch{ return null; } }
function lsWriteIcons(db){ try{ localStorage.setItem(LS_ICONS_KEY,JSON.stringify(db)); }catch{} }

/* ═══════════════════════════════════════════════════════════
   STORAGE ENGINE v9 — miroir localStorage des 16 clés KV (Phase 1)
   But : installer la couche de persistance locale unifiée.
   ⚠ Phase 1 = conteneur seul. AUCUNE lecture/écriture applicative
   ne dépend encore de v9 (ce sera la Phase 2). On se contente
   d'écrire/seeder le miroir. Rien ne change pour l'utilisateur.
   Chaque entrée est encapsulée : { v: <valeur>, t: <timestamp ms> }.
═══════════════════════════════════════════════════════════ */
const LS_V9_KEY = "gdb_sons_v9";
// Mêmes noms que les clés KV (cf. Worker /read & /write-bases ALLOWED)
const LSV9_KEYS = [
  "gdb_snapshots","gdb_txns","gdb_dd","gdb_gdbs","gdb_gc","gdb_gsb",
  "gdb_cm","gdb_sm","gdb_tm","gdb_bench",
  "gdb_portfolio","gdb_crypto","gdb_stocks","gdb_bank",
  "gdb_yfmap","gdb_icons",
];
function lsv9ReadAll(){ try{ const v=localStorage.getItem(LS_V9_KEY); return v?JSON.parse(v):{}; }catch{ return {}; } }
function lsv9WriteAll(obj){ try{ localStorage.setItem(LS_V9_KEY, JSON.stringify(obj)); return true; }catch{ return false; } }
// Lit la valeur d'une base (déballe l'enveloppe {v,t}) — null si absente
function lsv9Get(key){ const all=lsv9ReadAll(); const e=all[key]; return e && typeof e==="object" && "v" in e ? e.v : (e!==undefined?e:null); }
// Lit l'horodatage d'écriture d'une base — null si absente
function lsv9GetMeta(key){ const all=lsv9ReadAll(); const e=all[key]; return e && typeof e==="object" && "t" in e ? e.t : null; }
// Écrit une base (ignore les clés inconnues et les valeurs vides)
function lsv9Set(key, value, t){
  if(LSV9_KEYS.indexOf(key)<0) return false;
  if(value===undefined || value===null) return false;
  const all=lsv9ReadAll();
  all[key]={ v:value, t: t || Date.now() };
  return lsv9WriteAll(all);
}
// Écrit plusieurs bases d'un coup — retourne le nombre de bases écrites
function lsv9SetMany(obj, t){
  if(!obj || typeof obj!=="object") return 0;
  const all=lsv9ReadAll(); const ts=t||Date.now(); let n=0;
  LSV9_KEYS.forEach(function(k){
    if(obj[k]!==undefined && obj[k]!==null){ all[k]={ v:obj[k], t:ts }; n++; }
  });
  lsv9WriteAll(all);
  return n;
}
// Seed depuis une réponse KV /read — REMPLISSAGE des clés manquantes uniquement.
// Ne remplace jamais une base déjà présente en local, ni une base "dirty"
// (changement local non encore synchronisé). La mise à jour local↔cloud par
// récence sera gérée par la réconciliation/loadBase, pas par ce seed.
function lsv9SeedFromKv(kv){
  if(!kv || typeof kv!=="object") return 0;
  const dirty = (typeof lsv9DirtyList==="function") ? lsv9DirtyList() : [];
  const existing = lsv9ReadAll();
  const picked={};
  LSV9_KEYS.forEach(function(k){
    if(dirty.indexOf(k)>=0) return;       // ne pas écraser un changement local non synchronisé
    if(existing[k]!==undefined) return;   // ne pas écraser une base déjà présente
    if(kv[k]!==undefined && kv[k]!==null) picked[k]=kv[k];
  });
  const n=lsv9SetMany(picked);
  console.info("[lsv9] seed KV→v9 : "+n+" base(s) remplie(s) (dirty/existant préservés)");
  return n;
}
// Migration unique v8 → v9 : chart→gdb_snapshots, txns→gdb_txns, icons→gdb_icons
const LSV9_MIGRATED_FLAG = "gdb_sons_v9_migrated";
function migrateV8toV9(){
  try{
    if(localStorage.getItem(LSV9_MIGRATED_FLAG)==="1") return false;
    const v8 = lsRead();           // { chart, txns }
    const icons = lsReadIcons();   // ICON_DB sérialisé
    const seed={};
    if(v8 && v8.chart) seed.gdb_snapshots = v8.chart;
    if(v8 && v8.txns)  seed.gdb_txns      = v8.txns;
    if(icons)          seed.gdb_icons     = icons;
    const n = lsv9SetMany(seed);
    localStorage.setItem(LSV9_MIGRATED_FLAG, "1");
    console.info("[lsv9] migration v8→v9 : "+n+" base(s) migrée(s) ("+Object.keys(seed).join(", ")+")");
    return true;
  }catch(e){ console.warn("[lsv9] migration échouée:", e && e.message); return false; }
}

/* API publique : load / save — transparent Gist + localStorage */
const SK={chart:"chart",txns:"txns"};

async function load(k, fallback){
  // 1. Essai localStorage (instantané)
  const ls = lsRead();
  const cached = ls[k];
  // 2. Essai Gist (vérité de référence multi-appareils)
  const gist = await gistRead();
  if(gist && gist[k]){
    // Mettre à jour le cache local si le Gist est plus récent
    ls[k] = gist[k];
    lsWrite(ls);
    return gist[k];
  }
  return cached || fallback;
}

/* ═══════════════════════════════════════════════════════════
   PHASE 2 (v23.03) — saveBase : écriture unifiée d'une base
   1) miroir local immédiat (lsv9) — jamais bloquant, marche offline
   2) push vers KV /write-bases avec petit retry
   Si le cloud échoue (offline), la donnée reste en local et la clé
   est marquée "dirty" (gdb_sons_v9_dirty) pour un re-push ultérieur.
   ⚠ Aucune lecture ne dépend encore de v9 : on ne fait qu'ÉCRIRE.
═══════════════════════════════════════════════════════════ */
const LSV9_DIRTY_FLAG = "gdb_sons_v9_dirty";
function lsv9DirtyList(){ try{ const r=localStorage.getItem(LSV9_DIRTY_FLAG); return r?JSON.parse(r):[]; }catch{ return []; } }
function lsv9MarkDirty(key){ try{ const s=lsv9DirtyList(); if(s.indexOf(key)<0){ s.push(key); localStorage.setItem(LSV9_DIRTY_FLAG, JSON.stringify(s)); } }catch{} }
function lsv9ClearDirty(key){ try{ const s=lsv9DirtyList().filter(function(k){return k!==key;}); localStorage.setItem(LSV9_DIRTY_FLAG, JSON.stringify(s)); }catch{} }
// Pousse UNE base vers le Worker (même contrat que doSnapUpload)
async function cfWriteBase(key, value){
  const res = await fetch(`${CF_WORKER_URL}/write-bases`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "X-Auth-Key": CF_AUTH_KEY },
    body: JSON.stringify({ [key]: value }),
    signal: AbortSignal.timeout(15000),
  });
  if(!res.ok) throw new Error("HTTP "+res.status);
  return true;
}
async function saveBase(key, value){
  if(LSV9_KEYS.indexOf(key)<0){ console.warn("[saveBase] clé inconnue ignorée:", key); return false; }
  // 1) local immédiat (jamais bloquant)
  lsv9Set(key, value);
  // 2) push cloud avec retry ; échec → garde local + dirty
  for(let attempt=1; attempt<=3; attempt++){
    try{
      await cfWriteBase(key, value);
      lsv9ClearDirty(key);
      console.info("[saveBase] "+key+" → KV OK (tentative "+attempt+")");
      return true;
    }catch(e){
      if(attempt===3){
        lsv9MarkDirty(key);
        console.warn("[saveBase] "+key+" → KV échec, conservé en local (dirty):", e && e.message);
        return false;
      }
      await new Promise(function(r){ setTimeout(r, 400*attempt); });
    }
  }
}

// Phase 3 (v23.04) — re-push des bases "dirty" (laissées en local hors ligne) vers KV.
// Appelé quand on a la preuve d'être en ligne (après un /read KV réussi au boot).
async function flushDirtyBases(){
  const dirty = lsv9DirtyList();
  if(!dirty.length) return 0;
  console.info("[flush] "+dirty.length+" base(s) dirty à re-pousser : "+dirty.join(", "));
  let ok=0;
  for(const key of dirty){
    const val = lsv9Get(key);
    if(val===null || val===undefined){ lsv9ClearDirty(key); continue; }
    const r = await saveBase(key, val);   // saveBase efface le flag dirty si succès
    if(r) ok++;
  }
  console.info("[flush] "+ok+"/"+dirty.length+" base(s) re-poussée(s) vers KV");
  return ok;
}

// Phase 3 (v23.05) — fusion de deux listes de transactions par id.
// `a` est prioritaire en cas de doublon (local gagne) ; les entrées de `b`
// absentes de `a` sont ajoutées. Multi-appareils safe : ne perd aucune txn.
function unionTxnsById(a, b){
  const out=[]; const seen=new Set();
  (a||[]).forEach(function(t){ if(t && t.id!=null && !seen.has(t.id)){ seen.add(t.id); out.push(t); } });
  (b||[]).forEach(function(t){ if(t && t.id!=null && !seen.has(t.id)){ seen.add(t.id); out.push(t); } });
  return out;
}

// Phase 3 (v23.06) — fusion de deux listes de snapshots par date `d` (upsert).
// `a` (local) prioritaire sur `b` (cloud) en cas de même date ; triée par date.
// Multi-appareils safe : conserve les dates présentes d'un seul côté.
function unionSnapsByDate(a, b){
  const map=new Map();
  (b||[]).forEach(function(s){ if(s && s.d!=null) map.set(s.d, s); });   // cloud d'abord
  (a||[]).forEach(function(s){ if(s && s.d!=null) map.set(s.d, s); });   // local écrase (prioritaire)
  return Array.from(map.values()).sort(function(x,y){ return (x.d||"").localeCompare(y.d||""); });
}

// Phase 3 (v23.08) — fusion de deux séries temporelles [date, …valeurs] par date (row[0]).
// `a` (local/build) d'abord, `b` (KV) écrase en cas de même date → KV prioritaire.
// Multi-appareils safe : conserve les dates présentes d'un seul côté. Triée par date.
function unionSeriesByDate(a, b){
  const map=new Map();
  (a||[]).forEach(function(r){ if(Array.isArray(r) && r[0]!=null) map.set(r[0], r); });
  (b||[]).forEach(function(r){ if(Array.isArray(r) && r[0]!=null) map.set(r[0], r); });
  return Array.from(map.values()).sort(function(x,y){ return (x[0]||"").localeCompare(y[0]||""); });
}

async function save(k, v){
  // 1. Écriture immédiate dans localStorage
  const ls = lsRead();
  ls[k] = v;
  lsWrite(ls);
  // 2. Sync vers Gist (async, non bloquant)
  gistWrite(ls);  // ls contient maintenant chart + txns
}

/* ─── DAILY DATA from Excel Chart sheet ────────────────
   DD:        [date, wallet_crypto€, total_hors_immo€, BTC$, GDB.S$]
              col AO "TOTAL € hors immo" utilisée pour le total
   DB:        [date, CREUSOT GLOBAL INVESTMENTS, BTC, SP500, Nasdaq, ETH] base100=Jan2023
   GDBS:      [date, GDB.S actual$, GDB.C actual$]  daily from jan 2026
   PORT_B100: [date, portfolio_hors_immo_base100]  base=Jan2026=€313 653
─────────────────────────────────────────────────────── */
const DD = [["2022-01-15", 18065, 18065, null, null, 0.92], ["2022-02-15", 17777, 17777, null, null, 0.92], ["2022-03-15", 22202, 22202, null, null, 0.92], ["2022-04-15", 22046, 22046, null, null, 0.92], ["2022-05-15", 21163, 21163, null, null, 0.92], ["2022-06-15", 15745, 15745, null, null, 0.92], ["2022-07-15", 21027, 21027, null, null, 0.92], ["2022-08-15", 23117, 23117, null, null, 0.92], ["2022-09-15", 17863, 17863, null, null, 0.92], ["2022-10-15", 21523, 21523, null, null, 0.92], ["2022-11-15", 14561, 14561, null, null, 0.92], ["2022-12-15", 15385, 15385, null, null, 0.92], ["2023-01-15", 27063, 27063, null, null, 0.92], ["2023-02-15", 23137, 23137, null, null, 0.92], ["2023-03-15", 32662, 32662, null, null, 0.92], ["2023-04-15", 37411, 37411, null, null, 0.92], ["2023-05-15", 31862, 31862, null, null, 0.92], ["2023-06-15", 34775, 34775, null, null, 0.92], ["2023-07-15", 31216, 31216, null, null, 0.92], ["2023-08-15", 33523, 33523, null, null, 0.92], ["2023-09-15", 31038, 31038, null, null, 0.92], ["2023-10-15", 42797, 42797, null, null, 0.92], ["2023-11-15", 46292, 46292, null, null, 0.92], ["2023-12-15", 55064, 55064, null, null, 0.92], ["2024-01-15", 57785, 57785, null, null, 0.92], ["2024-02-15", 91068, 91068, null, null, 0.92], ["2024-03-15", 101759, 101759, null, null, 0.92], ["2024-04-15", 88978, 88978, null, null, 0.92], ["2024-05-15", 114664, 114664, null, null, 0.92], ["2024-06-15", 100912, 100912, null, null, 0.92], ["2024-07-15", 114304, 114304, null, null, 0.92], ["2024-08-15", 89950, 89950, null, null, 0.92], ["2024-09-15", 104737, 104737, null, null, 0.92], ["2024-10-15", 120644, 120644, null, null, 0.92], ["2024-11-15", 180732, 180732, null, null, 0.92], ["2024-12-15", 167485, 167485, null, null, 0.92], ["2025-01-15", 186421, 186421, null, null, 0.92], ["2025-02-15", 131265, 131265, null, null, 0.92], ["2025-03-15", 124112, 124112, null, null, 0.92], ["2025-04-15", 138950, 138950, null, null, 0.92], ["2025-05-15", 170526, 170526, null, null, 0.92], ["2025-06-15", 153432, 153432, null, null, 0.92], ["2025-07-15", 187171, 187171, null, null, 0.92], ["2025-08-15", 175821, 175821, null, null, 0.92], ["2025-09-15", 180092, 180092, null, null, 0.92], ["2025-10-15", 188385, 188385, null, null, 0.92], ["2025-11-15", 147276, 147276, null, null, 0.92], ["2025-12-15", 137692, 137692, null, null, 0.92], ["2026-01-15", 150475, 150475, null, null, 0.92], ["2026-02-15", 104425, 104425, null, null, 0.92], ["2026-03-15", 125387, 125387, null, null, 0.92], ["2026-05-31", 125387, 125387, null, null, 0.92]];
const DB=[["2023-01-01",100.0,100.0,100.0,100.0,100.0,100.0,null],["2023-01-02",99.9655,100.4551,100.0,100.0,101.117,100.0,null],["2023-01-03",98.9212,100.808,99.579,99.3237,101.1703,99.8627,null],["2023-01-04",100.4461,100.828,100.3478,99.7971,104.698,100.8421,null],["2023-01-05",99.5661,101.9013,99.2025,98.234,104.2007,99.6613,null],["2023-01-06",101.4572,101.7617,101.4774,100.9469,105.7159,102.0137,null],["2023-01-07",101.4166,102.5364,101.4774,100.9469,105.2794,102.0137,null],["2023-01-08",102.4714,102.4798,101.4774,100.9469,107.3185,102.0137,null],["2023-01-09",103.6568,103.2279,101.4199,101.6007,109.9948,102.1327,null],["2023-01-10",105.2785,103.9552,102.1311,102.4611,111.2126,102.6911,null],["2023-01-11",108.5308,105.4182,103.4228,104.2309,115.7698,103.8078,null],["2023-01-12",115.023,108.8034,103.7994,104.7945,117.9556,104.6133,null],["2023-01-13",121.367,114.063,104.2021,105.5159,120.8526,105.0801,null],["2023-01-14",127.6417,120.5619,104.2021,105.5159,129.1124,105.0801,null],["2023-01-15",127.1694,127.0757,104.2021,105.5159,129.3348,105.0801,null],["2023-01-16",128.8865,126.0723,104.2021,105.5159,131.3547,105.0801,null],["2023-01-17",128.2423,128.0196,104.0112,105.7301,130.3327,105.0709,null],["2023-01-18",125.4758,127.9075,102.3691,104.3549,125.8879,103.8627,null],["2023-01-19",128.3885,125.3082,101.6238,103.3328,129.2457,103.2037,null],["2023-01-20",138.4523,127.4534,103.517,106.1584,138.2717,104.8604,null],["2023-01-21",139.0476,137.2726,103.517,106.1584,135.4022,104.8604,null],["2023-01-22",138.6473,137.6667,103.517,106.1584,135.5271,104.8604,null],["2023-01-23",140.0915,137.4589,104.759,108.5181,135.4855,105.9039,null],["2023-01-24",138.5039,138.9596,104.6466,108.2964,129.623,105.8032,null],["2023-01-25",141.5714,136.6932,104.6858,108.0559,134.2085,106.0137,null],["2023-01-26",140.9921,140.1418,105.8364,110.1638,133.488,106.8924,null],["2023-01-27",141.0527,139.2006,106.0795,111.2572,133.0757,107.0481,null],["2023-01-28",140.7706,139.5519,106.0795,111.2572,131.0324,107.0481,null],["2023-01-29",145.2049,139.1854,106.0795,111.2572,137.1048,107.0481,null],["2023-01-30",139.2833,143.8722,104.7486,109.0103,130.4851,105.8398,null],["2023-01-31",141.2807,138.086,106.2887,110.6448,132.0486,107.103,null],["2023-02-01",146.6586,139.8812,107.4184,113.0082,136.7824,108.2288,null],["2023-02-02",143.7678,143.4351,108.982,117.0662,136.7499,109.3181,null],["2023-02-03",142.2599,142.3137,107.8237,114.9846,138.5891,108.1648,null],["2023-02-04",141.6055,141.7811,107.8237,114.9846,138.8482,108.1648,null],["2023-02-05",139.2549,141.1087,107.8237,114.9846,135.7279,108.1648,null],["2023-02-06",137.3956,138.7263,107.1647,114.0114,134.4184,107.3684,null],["2023-02-07",140.2894,137.7601,108.5663,116.3748,139.223,108.6041,null],["2023-02-08",138.3561,140.834,107.3791,114.3045,137.5229,107.5789,null],["2023-02-09",131.6242,138.7336,106.4482,113.2938,128.7234,106.9291,null],["2023-02-10",129.9648,131.9224,106.6967,112.5498,126.097,106.9382,null],["2023-02-11",131.3164,130.7692,106.6967,112.5498,128.1395,106.9382,null],["2023-02-12",130.8831,132.3368,106.6967,112.5498,126.232,106.9382,null],["2023-02-13",131.3103,131.6745,107.9492,114.3533,125.4323,108.1281,null],["2023-02-14",134.0708,131.8435,107.8995,115.1988,129.5655,108.2654,null],["2023-02-15",146.2843,134.3358,108.2499,116.0818,139.5587,108.4211,null],["2023-02-16",141.2879,146.958,106.7594,113.9025,136.6624,107.2403,null],["2023-02-17",147.8217,143.627,106.4927,113.0984,141.1022,106.984,null],["2023-02-18",148.1765,148.8984,106.4927,113.0984,140.9073,106.984,null],["2023-02-19",146.2057,148.9828,106.4927,113.0984,140.066,106.984,null],["2023-02-20",149.2932,146.8166,106.4927,113.0984,141.8777,106.984,null],["2023-02-21",146.4486,149.8526,104.3564,110.4231,138.2243,105.1533,null],["2023-02-22",144.2526,147.6201,104.2125,110.5057,136.8898,104.9153,null],["2023-02-23",142.6912,145.98,104.7669,111.4676,137.4838,105.4188,null],["2023-02-24",137.6118,144.8011,103.6477,109.604,133.9619,104.0275,null],["2023-02-25",137.4605,140.0926,103.6477,109.604,132.8308,104.0275,null],["2023-02-26",139.7836,140.0004,103.6477,109.604,136.7407,104.0275,null],["2023-02-27",140.2196,142.3224,104.0007,110.3893,136.0794,104.6773,null],["2023-02-28",137.6373,142.1834,103.6163,110.2465,133.6662,104.3295,null],["2023-03-01",141.8948,139.9914,103.2189,109.3597,138.7807,104.1922,null],["2023-03-02",139.8903,142.886,104.0217,110.2653,137.2222,104.7872,null],["2023-03-03",133.727,141.8582,105.6899,112.5423,130.6842,106.4256,null],["2023-03-04",133.6869,135.2267,105.6899,112.5423,130.5043,106.4256,null],["2023-03-05",134.1682,135.1112,105.6899,112.5423,130.3077,106.4256,null],["2023-03-06",134.6335,135.5559,105.7631,112.67,130.4301,106.3799,null],["2023-03-07",131.7227,135.515,104.1419,111.2873,130.092,104.6957,null],["2023-03-08",128.8108,134.3185,104.3119,111.8434,127.698,104.9428,null],["2023-03-09",121.2208,131.2681,102.3874,109.9083,119.8231,103.2952,null],["2023-03-10",120.6989,123.189,100.91,108.364,118.8443,101.8307,null],["2023-03-11",122.5577,122.0942,100.91,108.364,122.5427,101.8307,null],["2023-03-12",131.7005,124.0671,100.91,108.364,131.6296,101.8307,null],["2023-03-13",145.574,133.584,100.7662,109.1681,139.4337,101.5378,null],["2023-03-14",149.1275,146.1786,102.4318,111.6743,141.6178,103.0847,null],["2023-03-15",144.4829,149.684,101.7912,112.2605,137.4113,101.6384,null],["2023-03-16",149.2001,147.9435,103.5771,115.2213,139.4271,103.3318,null],["2023-03-17",164.3903,152.1174,101.9768,114.6765,149.0504,102.1144,null],["2023-03-18",161.5299,166.0552,101.9768,114.6765,146.4949,102.1144,null],["2023-03-19",167.7973,163.8855,101.9768,114.6765,148.2249,102.1144,null],["2023-03-20",167.2094,170.4091,102.9574,114.9057,144.2966,103.2311,null],["2023-03-21",170.3508,168.8512,104.3093,116.5477,150.2299,104.7048,null],["2023-03-22",166.5163,170.877,102.5312,114.9621,144.4774,103.3501,null],["2023-03-23",172.5338,165.9498,102.8084,116.326,151.1079,103.5149,null],["2023-03-24",166.2593,172.0589,103.483,116.7543,145.7085,103.8169,null],["2023-03-25",166.3424,166.834,103.483,116.7543,145.1321,103.8169,null],["2023-03-26",169.3532,167.2856,103.483,116.7543,147.7743,103.8169,null],["2023-03-27",164.7884,169.5725,103.6765,115.954,142.8256,104.3112,null],["2023-03-28",166.3142,164.3359,103.4438,115.3378,147.6552,104.2288,null],["2023-03-29",172.9689,164.9952,104.9473,117.4419,149.3744,105.6384,null],["2023-03-30",171.9279,171.6675,105.5618,118.5504,149.4011,106.4073,null],["2023-03-31",173.641,169.5281,107.0497,120.523,151.7359,107.7071,null],["2023-04-01",173.5368,172.4038,107.0497,120.523,151.6659,107.7071,null],["2023-04-02",171.9577,172.2959,107.0497,120.523,149.5194,107.7071,null],["2023-04-03",170.4012,170.7093,107.4576,120.23,150.8321,108.2105,null],["2023-04-04",173.5239,168.1636,106.8614,119.8242,155.8091,107.7986,null],["2023-04-05",172.8566,170.3395,106.5816,118.6406,159.0111,107.3318,null],["2023-04-06",172.2538,170.4717,106.9974,119.4409,155.9616,107.7162,null],["2023-04-07",171.1049,169.5393,106.9974,119.4409,155.2211,107.7162,null],["2023-04-08",171.2931,168.8831,106.9974,119.4409,154.0108,107.7162,null],["2023-04-09",173.6569,169.0868,106.9974,119.4409,154.8412,107.7162,null],["2023-04-10",181.0634,171.403,107.1072,119.3733,159.1277,107.8169,null],["2023-04-11",185.4258,179.3031,107.1359,118.6067,157.4201,107.9542,null],["2023-04-12",184.7522,182.9484,106.6993,117.5622,159.6458,107.8627,null],["2023-04-13",188.7481,180.7913,108.1165,119.8617,167.6032,109.3089,null],["2023-04-14",188.5686,183.8195,107.8524,119.6363,174.9225,109.0526,null],["2023-04-15",187.4937,184.2027,107.8524,119.6363,174.1404,109.0526,null],["2023-04-16",187.5687,183.2581,107.8524,119.6363,176.531,109.0526,null],["2023-04-17",180.914,183.2136,108.2394,119.7377,172.8201,109.2082,null],["2023-04-18",187.5181,178.1513,108.31,119.7452,175.2024,109.492,null],["2023-04-19",177.5694,183.583,108.2917,119.6889,161.261,109.3272,null],["2023-04-20",174.2457,174.3169,107.7008,118.7758,161.8232,108.897,null],["2023-04-21",168.5311,170.8246,107.7844,118.8998,154.0841,109.1259,null],["2023-04-22",171.9185,165.0484,107.7844,118.8998,156.0949,109.1259,null],["2023-04-23",170.5432,168.443,107.7844,118.8998,155.1036,109.1259,null],["2023-04-24",170.8577,166.901,107.8969,118.6518,153.4235,109.254,null],["2023-04-25",174.6428,166.327,106.1841,116.4162,155.4285,107.5423,null],["2023-04-26",176.5152,171.4028,105.7344,117.1226,155.4368,107.1945,null],["2023-04-27",182.8444,171.4087,107.8393,120.3051,158.9986,109.0892,null],["2023-04-28",181.7733,178.2484,108.7598,121.1355,157.5267,109.6476,null],["2023-04-29",181.228,177.3807,108.7598,121.1355,158.9145,109.6476,null],["2023-04-30",181.3367,176.6428,108.7598,121.1355,155.6725,109.6476,null],["2023-05-01",173.3401,177.5141,108.6499,120.9965,152.4964,109.5378,null],["2023-05-02",177.387,170.0382,107.4288,119.9406,155.7442,108.3478,null],["2023-05-03",180.5599,173.2357,106.6914,119.1553,158.6596,107.881,null],["2023-05-04",178.632,175.2546,105.9357,118.7345,156.3539,107.3593,null],["2023-05-05",182.915,174.3969,107.8969,121.2595,166.0389,109.2449,null],["2023-05-06",178.8543,178.4709,107.8969,121.2595,157.9715,109.2449,null],["2023-05-07",176.1715,174.6465,107.8969,121.2595,155.8483,109.2449,null],["2023-05-08",171.2953,172.9761,107.9256,121.5601,153.89,109.2906,null],["2023-05-09",170.3788,167.4462,107.4523,120.7898,153.8133,108.8421,null],["2023-05-10",170.5091,166.9059,107.9544,122.1049,153.3436,109.1076,null],["2023-05-11",165.6901,167.1014,107.7661,122.5032,149.4944,108.8513,null],["2023-05-12",163.5457,163.3835,107.6249,122.0636,150.5439,108.6957,null],["2023-05-13",163.4149,161.9502,107.6249,122.0636,149.5144,108.6957,null],["2023-05-14",164.281,162.0133,107.6249,122.0636,149.8817,108.6957,null],["2023-05-15",166.2517,162.7006,107.9962,122.7249,151.3602,109.3455,null],["2023-05-16",165.1757,164.611,107.2745,122.8639,151.9325,108.4027,null],["2023-05-17",167.0772,163.3711,108.5767,124.3518,151.7451,109.4371,null],["2023-05-18",162.5291,165.5914,109.6227,126.6589,150.0175,110.1419,null],["2023-05-19",163.3468,162.2843,109.4632,126.3733,150.9613,110.1968,null],["2023-05-20",164.7679,162.5347,109.4632,126.3733,151.5743,110.1968,null],["2023-05-21",162.5436,163.8008,109.4632,126.3733,150.3424,110.1968,null],["2023-05-22",163.2699,161.8664,109.5076,126.7979,151.3669,110.27,null],["2023-05-23",164.8796,162.4459,108.2786,125.1897,154.4397,108.9519,null],["2023-05-24",159.163,164.5816,107.4942,124.551,149.9275,107.9268,null],["2023-05-25",159.6254,159.2373,108.4251,127.5795,150.409,108.3844,null],["2023-05-26",161.1151,160.0635,109.8292,130.8409,152.2507,109.7574,null],["2023-05-27",162.0013,161.5288,109.8292,130.8409,152.4264,109.7574,null],["2023-05-28",169.3237,162.3163,109.8292,130.8409,158.9603,109.7574,null],["2023-05-29",167.0391,169.9464,109.8292,130.8409,157.6492,109.7574,null],["2023-05-30",167.2182,167.827,109.8711,131.4346,158.3139,109.4005,null],["2023-05-31",163.6236,167.5499,109.2618,130.6869,156.0682,108.5584,null],["2023-06-01",162.3279,164.7178,110.2999,132.1973,155.0803,109.8673,null],["2023-06-02",164.079,162.1704,111.895,133.1855,158.8562,111.5149,null],["2023-06-03",163.0453,164.7315,111.895,133.1855,157.6025,111.5149,null],["2023-06-04",163.3551,163.635,111.895,133.1855,157.4351,111.5149,null],["2023-06-05",155.156,165.1409,111.6806,133.2795,150.868,111.1762,null],["2023-06-06",163.7772,155.9343,111.9238,133.2569,156.9462,111.6522,null],["2023-06-07",158.5228,164.5434,111.5368,130.9987,152.6089,109.9863,null],["2023-06-08",160.7292,159.2814,112.2114,132.6219,153.74,110.7094,null],["2023-06-09",160.1,160.2588,112.4127,133.1292,153.3011,110.8375,null],["2023-06-10",156.2576,160.027,112.4127,133.1292,145.9001,110.8375,null],["2023-06-11",156.7733,156.3303,112.4127,133.1292,146.0034,110.8375,null],["2023-06-12",156.7658,156.6838,113.4325,135.3799,145.1538,111.6979,null],["2023-06-13",157.4149,156.6462,114.1804,136.4207,144.9039,112.54,null],["2023-06-14",153.145,156.4155,114.3163,137.4126,137.5204,112.7506,null],["2023-06-15",157.5674,151.7938,115.7336,139.0509,138.8532,114.1419,null],["2023-06-16",162.0954,154.5558,114.9125,138.1754,143.098,113.7666,null],["2023-06-17",163.1652,159.167,114.9125,138.1754,143.9201,113.7666,null],["2023-06-18",162.0883,160.2172,114.9125,138.1754,143.3529,113.7666,null],["2023-06-19",164.9478,159.2019,114.9125,138.1754,144.6923,113.7666,null],["2023-06-20",173.845,161.9,114.3163,137.7884,149.2362,112.8055,null],["2023-06-21",185.3771,171.2799,113.7306,135.9097,157.421,112.5034,null],["2023-06-22",184.2627,181.9861,114.1412,137.5141,155.9591,112.4851,null],["2023-06-23",187.9738,180.9817,113.2782,136.1501,157.5959,111.4783,null],["2023-06-24",187.0715,185.1751,113.2782,136.1501,156.1823,111.4783,null],["2023-06-25",186.66,184.6223,113.2782,136.1501,158.1648,111.4783,null],["2023-06-26",185.6894,184.1202,112.8154,134.324,154.8496,111.2494,null],["2023-06-27",189.2197,183.0969,114.0522,136.6349,157.391,112.4027,null],["2023-06-28",184.6447,185.5638,114.1098,136.9016,152.2632,112.4211,null],["2023-06-29",186.1053,181.8755,114.5595,136.6273,154.2598,112.7506,null],["2023-06-30",187.0452,184.1919,115.9114,138.7353,161.0802,113.9771,null],["2023-07-01",187.7372,184.2775,115.9114,138.7353,160.308,113.9771,null],["2023-07-02",187.925,184.8993,115.9114,138.7353,161.3942,113.9771,null],["2023-07-03",191.1949,184.8283,116.0448,139.0621,162.8927,114.2334,null],["2023-07-04",188.2885,188.231,116.0448,139.0621,161.2793,114.2334,null],["2023-07-05",186.3,186.0601,115.8722,139.0584,159.1335,113.6476,null],["2023-07-06",183.2066,184.3018,114.9648,137.9988,153.9633,112.3753,null],["2023-07-07",187.229,181.3107,114.6746,137.5404,155.8425,112.4668,null],["2023-07-08",186.8733,183.2769,114.6746,137.5404,155.3727,112.4668,null],["2023-07-09",186.1258,182.9681,114.6746,137.5404,155.1753,112.4668,null],["2023-07-10",188.2094,182.3979,114.9648,137.5855,156.6338,112.8146,null],["2023-07-11",189.5935,183.7546,115.697,138.2656,156.4597,113.6659,null],["2023-07-12",190.2275,185.1241,116.6279,140.009,155.9208,114.9016,null],["2023-07-13",198.6833,183.834,117.5535,142.3875,166.9918,116.2288,null],["2023-07-14",191.4743,190.113,117.4803,142.3574,161.4342,115.9176,null],["2023-07-15",191.302,183.2561,117.4803,142.3574,160.882,115.9176,null],["2023-07-16",190.9576,183.1723,117.4803,142.3574,160.1348,115.9176,null],["2023-07-17",190.4963,182.8057,117.8882,143.6875,159.201,116.1739,null],["2023-07-18",188.5932,182.2648,118.7642,144.8636,158.0632,117.0984,null],["2023-07-19",188.3919,180.4521,119.0283,144.8298,157.3193,117.254,null],["2023-07-20",186.5438,180.8865,118.2386,141.4894,157.5342,116.5492,null],["2023-07-21",187.0531,180.0834,118.2386,141.0649,157.5775,116.6133,null],["2023-07-22",186.3423,180.8551,118.2386,141.0649,155.4535,116.6133,null],["2023-07-23",188.2058,179.6186,118.2386,141.0649,157.336,116.6133,null],["2023-07-24",181.5527,181.7213,118.7668,141.2903,154.1032,116.7872,null],["2023-07-25",181.7206,176.443,119.0911,142.2484,154.7388,117.0892,null],["2023-07-26",182.9693,176.6732,119.1094,141.775,155.9324,117.1716,null],["2023-07-27",180.3649,177.5238,118.3197,141.4368,155.0428,116.4485,null],["2023-07-28",181.6198,176.5358,119.4781,144.0144,156.1182,117.5652,null],["2023-07-29",181.8559,177.2241,119.4781,144.0144,156.6446,117.5652,null],["2023-07-30",181.4195,177.482,119.4781,144.0144,155.0836,117.5652,null],["2023-07-31",180.7924,177.0044,119.7056,144.0896,154.6138,117.6568,null],["2023-08-01",183.5555,176.7346,119.363,143.7552,156.1165,117.0801,null],["2023-08-02",179.4644,178.5724,117.7026,140.5989,153.2844,115.2403,null],["2023-08-03",179.6917,176.2117,117.3653,140.3735,152.9321,114.8924,null],["2023-08-04",180.2359,176.3901,116.8345,139.7159,152.4539,114.6178,null],["2023-08-05",180.0016,175.8568,116.8345,139.7159,152.9737,114.6178,null],["2023-08-06",180.0916,175.6081,116.8345,139.7159,152.4573,114.6178,null],["2023-08-07",180.7684,175.5924,117.8542,140.8995,152.3598,115.5973,null],["2023-08-08",183.4634,176.4022,117.3417,139.7009,154.6197,115.0114,null],["2023-08-09",182.5542,180.0382,116.5573,138.1679,154.5464,114.4256,null],["2023-08-10",181.8507,178.8649,116.5991,138.4234,154.3048,114.5721,null],["2023-08-11",181.0922,177.8875,116.5311,137.5404,154.0066,114.2975,null],["2023-08-12",181.1284,177.7244,116.5311,137.5404,154.0949,114.2975,null],["2023-08-13",180.3314,177.8169,116.5311,137.5404,153.3277,114.2975,null],["2023-08-14",180.4354,177.048,117.1744,139.0847,153.7259,114.5721,null],["2023-08-15",179.0099,177.747,115.8094,137.608,152.349,113.2082,null],["2023-08-16",175.7063,176.3559,114.9596,136.1501,150.5856,112.3112,null],["2023-08-17",162.8263,173.8391,114.0836,134.6622,140.2634,111.5332,null],["2023-08-18",159.1912,160.2205,114.1385,134.4931,138.3784,111.5057,null],["2023-08-19",159.4778,157.4471,114.1385,134.4931,139.0789,111.5057,null],["2023-08-20",160.0359,157.8215,114.1385,134.4931,140.3758,111.5057,null],["2023-08-21",159.9836,158.1596,114.8812,136.6612,138.9065,112.1922,null],["2023-08-22",158.7812,157.9076,114.57,136.4658,136.1318,111.8627,null],["2023-08-23",161.4047,157.3917,115.846,138.6188,139.9335,113.0526,null],["2023-08-24",159.0973,159.9087,114.2405,135.6542,138.3475,111.5515,null],["2023-08-25",158.2286,158.0039,115.0459,136.7062,137.752,112.3112,null],["2023-08-26",157.9912,157.4543,115.0459,136.7062,137.1947,112.3112,null],["2023-08-27",158.4968,157.2003,115.0459,136.7062,138.1343,112.3112,null],["2023-08-28",158.8651,157.6882,115.7754,137.7358,137.7087,113.1716,null],["2023-08-29",169.5735,157.8487,117.4489,140.7417,144.0784,114.7826,null],["2023-08-30",167.6722,167.6502,117.9327,141.527,142.0401,115.2311,null],["2023-08-31",158.0963,165.0309,117.7601,141.9516,137.0923,115.0572,null],["2023-09-01",156.2913,156.7493,117.9798,141.8013,135.6912,115.2494,null],["2023-09-02",156.6977,156.0535,117.9798,141.8013,136.3617,115.2494,null],["2023-09-03",157.3088,156.3033,117.9798,141.8013,136.2618,115.2494,null],["2023-09-04",156.6654,156.9438,117.9798,141.8013,135.817,115.2494,null],["2023-09-05",155.5385,156.1565,117.4699,141.9817,136.146,114.6087,null],["2023-09-06",155.3196,155.8847,116.6802,140.7304,136.0394,113.913,null],["2023-09-07",157.8966,155.6945,116.3219,139.7235,137.2813,113.5835,null],["2023-09-08",155.8273,158.3509,116.4971,139.9188,136.3118,113.611,null],["2023-09-09",155.7805,156.6272,116.4971,139.9188,136.2376,113.611,null],["2023-09-10",155.4067,156.519,116.4971,139.9188,134.7283,113.611,null],["2023-09-11",152.0501,156.188,117.2633,141.5683,129.2682,114.4989,null],["2023-09-12",156.1634,151.9483,116.62,139.9977,132.6509,113.9405,null],["2023-09-13",158.1147,156.3828,116.756,140.5313,133.9111,113.9771,null],["2023-09-14",158.6564,158.5389,117.7627,141.6811,135.4821,115.0755,null],["2023-09-15",159.32,160.4007,115.9349,139.2575,136.7166,114.0686,null],["2023-09-16",159.081,161.0249,115.9349,139.2575,136.1418,114.0686,null],["2023-09-17",158.8901,160.5602,115.9349,139.2575,135.1623,114.0686,null],["2023-09-18",160.8196,160.3378,116.0029,139.2012,136.3509,113.9771,null],["2023-09-19",163.3132,161.6707,115.7624,138.9043,136.864,113.8124,null],["2023-09-20",162.5293,164.5596,114.6981,136.9016,135.1314,112.9794,null],["2023-09-21",159.1804,163.9342,112.8023,134.3917,131.9453,111.0847,null],["2023-09-22",159.1593,160.5805,112.5487,134.4105,132.7008,110.9108,null],["2023-09-23",159.1434,160.6465,112.5487,134.4105,132.7666,110.9108,null],["2023-09-24",157.1859,160.6579,112.5487,134.4105,131.6554,110.9108,null],["2023-09-25",156.5827,158.6969,113.022,135.0492,132.3277,111.1121,null],["2023-09-26",155.7847,158.9935,111.3616,133.0202,132.7791,109.5378,null],["2023-09-27",155.6206,158.426,111.406,133.3321,133.1498,109.4554,null],["2023-09-28",160.3883,159.305,112.0519,134.448,137.6812,110.3158,null],["2023-09-29",159.8835,163.2883,111.7799,134.5457,138.9165,109.9954,null],["2023-09-30",160.2032,162.7332,111.7799,134.5457,139.183,109.9954,null],["2023-10-01",166.2109,163.0517,111.7799,134.5457,144.345,109.9954,null],["2023-10-02",161.9631,169.0831,111.7355,135.6692,138.5058,109.3913,null],["2023-10-03",161.3405,166.9523,110.2398,133.287,138.0135,107.9542,null],["2023-10-04",164.0713,165.8886,111.0425,135.1018,137.1947,108.5858,null],["2023-10-05",162.5064,168.0226,111.0007,134.7035,134.2402,108.8146,null],["2023-10-06",166.2227,165.8689,112.3186,136.9617,137.0756,110.0686,null],["2023-10-07",166.3723,169.0267,112.3186,136.9617,136.0727,110.0686,null],["2023-10-08",166.1394,169.1437,112.3186,136.9617,136.0119,110.0686,null],["2023-10-09",163.783,168.9657,113.0377,137.6606,131.588,110.5629,null],["2023-10-10",163.2394,166.8236,113.626,138.4234,130.5768,111.4691,null],["2023-10-11",160.3916,165.6052,114.0915,139.4116,130.5168,111.9634,null],["2023-10-12",158.3233,162.2797,113.3959,138.9269,128.2528,111.103,null],["2023-10-13",158.6744,161.5962,112.8311,137.1797,129.2915,110.4622,null],["2023-10-14",158.6109,162.2733,112.8311,137.1797,129.5239,110.4622,null],["2023-10-15",160.4349,162.4066,112.8311,137.1797,129.7488,110.4622,null],["2023-10-16",169.1749,164.1424,114.0183,138.7315,133.2323,111.5332,null],["2023-10-17",168.8163,172.3828,114.013,138.2768,130.3593,111.524,null],["2023-10-18",167.6883,171.8049,112.4938,136.462,130.2294,109.8947,null],["2023-10-19",170.8254,171.2639,111.5054,135.1845,130.5093,108.9062,null],["2023-10-20",176.6667,173.6067,110.1352,133.1668,133.5996,107.6888,null],["2023-10-21",178.08,179.4205,110.1352,133.1668,135.6862,107.6888,null],["2023-10-22",178.5074,180.8877,110.1352,133.1668,138.5525,107.6888,null],["2023-10-23",198.1215,181.488,109.9443,133.5688,146.9155,107.5515,null],["2023-10-24",201.8426,199.2254,110.7732,134.8689,148.6756,108.2838,null],["2023-10-25",204.8169,204.627,109.1834,131.5699,148.8522,106.8833,null],["2023-10-26",202.725,208.4071,107.876,129.0599,150.1957,105.7941,null],["2023-10-27",201.2886,206.6083,107.387,129.6799,148.2308,105.2723,null],["2023-10-28",202.3554,204.9436,107.387,129.6799,147.9534,105.2723,null],["2023-10-29",204.986,206.1137,107.387,129.6799,149.5152,105.2723,null],["2023-10-30",205.6551,208.9165,108.6709,131.1415,150.6889,106.5721,null],["2023-10-31",205.9619,208.5687,109.3533,131.769,151.1953,107.1945,null],["2023-11-01",210.3991,209.6181,110.5196,134.0535,153.8167,108.3021,null],["2023-11-02",208.4882,214.365,112.6376,136.4883,149.9575,110.4989,null],["2023-11-03",209.3511,211.1402,113.6652,138.0927,152.6247,111.6064,null],["2023-11-04",211.4446,209.9754,113.6652,138.0927,154.5764,111.6064,null],["2023-11-05",211.1697,211.892,113.6652,138.0927,157.6284,111.6064,null],["2023-11-06",211.0247,211.9738,113.9267,138.6563,158.3464,111.5698,null],["2023-11-07",213.0035,211.7884,114.251,139.9639,157.0961,111.6613,null],["2023-11-08",214.4192,214.2385,114.3346,140.0541,157.3726,111.6888,null],["2023-11-09",220.008,216.4062,113.443,138.9795,176.6035,111.0389,null],["2023-11-10",223.9267,222.2907,115.2132,142.1019,173.0733,112.4394,null],["2023-11-11",223.0086,225.772,115.2132,142.1019,171.0442,112.4394,null],["2023-11-12",222.4957,224.4327,115.2132,142.1019,170.3104,112.4394,null],["2023-11-13",219.2848,224.1,115.1034,141.6585,171.1075,112.476,null],["2023-11-14",217.3197,220.9651,117.3365,144.7096,164.8536,114.8375,null],["2023-11-15",230.8543,214.8955,117.5849,144.8185,171.5032,115.0206,null],["2023-11-16",220.5153,229.154,117.7287,144.9425,163.4092,115.0206,null],["2023-11-17",224.33,218.8633,117.8752,144.9763,163.3292,115.6064,null],["2023-11-18",224.173,220.8357,117.8752,144.9763,163.4059,115.6064,null],["2023-11-19",228.9927,221.1659,117.8752,144.9763,167.5116,115.6064,null],["2023-11-20",230.2641,226.1936,118.7825,146.7386,168.3845,116.3112,null],["2023-11-21",219.602,226.6489,118.5237,145.8894,161.1485,116.0641,null],["2023-11-22",228.9216,217.4356,118.9813,146.4868,171.8464,116.4577,null],["2023-11-23",228.5604,226.501,118.9813,146.4868,171.7522,116.4577,null],["2023-11-24",231.9247,225.464,119.0545,146.2802,173.3099,116.7231,null],["2023-11-25",232.3422,228.1581,119.0545,146.2802,173.5156,116.7231,null],["2023-11-26",230.2743,228.5869,119.0545,146.2802,171.8122,116.7231,null],["2023-11-27",229.3068,226.6642,118.84,146.1524,168.886,116.5309,null],["2023-11-28",233.6315,225.2032,118.9577,146.5357,170.6319,116.6224,null],["2023-11-29",233.3801,228.5408,118.874,146.3929,169.0093,116.6407,null],["2023-11-30",230.7215,228.5898,119.3421,146.0246,170.8893,116.9611,null],["2023-12-01",236.62,227.9942,120.0481,146.4417,173.8588,117.8581,null],["2023-12-02",241.3287,233.8974,120.0481,146.4417,180.321,117.8581,null],["2023-12-03",244.466,238.6941,120.0481,146.4417,182.6534,117.8581,null],["2023-12-04",255.0689,241.5877,119.4179,145.0815,186.8807,117.1991,null],["2023-12-05",259.9188,253.764,119.3944,145.446,191.0289,117.016,null],["2023-12-06",266.0736,266.6511,118.9133,144.6043,186.0402,116.7414,null],["2023-12-07",256.816,264.7307,119.8206,146.6258,196.2316,117.5835,null],["2023-12-08",252.2252,261.598,120.3357,147.2759,196.4499,118.0046,null],["2023-12-09",262.2811,267.2329,120.3357,147.2759,194.9614,118.0046,null],["2023-12-10",268.7147,264.4719,120.3357,147.2759,195.9368,118.0046,null],["2023-12-11",269.3785,264.5473,120.8038,148.5346,185.3647,118.4531,null],["2023-12-12",290.6954,249.0885,121.3555,149.7182,183.5446,118.7643,null],["2023-12-13",281.915,250.599,123.0291,151.6232,188.2668,120.5217,null],["2023-12-14",320.1541,259.5524,123.4239,151.4917,192.8864,121.1533,null],["2023-12-15",300.6396,260.0229,122.7231,152.2244,184.954,120.778,null],["2023-12-16",296.9455,253.8709,122.7231,152.2244,185.6754,120.778,null],["2023-12-17",289.5684,255.4129,122.7231,152.2244,183.0074,120.778,null],["2023-12-18",275.9518,250.3572,123.4134,152.8782,184.8199,121.3364,null],["2023-12-19",284.0808,258.0556,124.1639,153.6597,181.3747,122.1785,null],["2023-12-20",285.3674,255.4319,122.4433,151.3752,183.4363,119.5698,null],["2023-12-21",287.5338,263.7986,123.6043,153.1374,186.5542,120.9703,null],["2023-12-22",286.5135,265.1019,123.8527,153.3666,193.6019,121.2174,null],["2023-12-23",286.5135,265.1019,123.8527,153.3666,193.6019,121.2174,null],["2023-12-24",286.5135,265.1019,123.8527,153.3666,193.6019,121.2174,null],["2023-12-25",289.8076,260.1763,123.8527,153.3666,189.1997,121.2174,null],["2023-12-26",290.2882,263.8235,124.3757,154.3022,185.8145,121.7208,null],["2023-12-27",284.8642,257.0414,124.6006,154.6179,198.1333,122.0686,null],["2023-12-28",288.5398,262.4948,124.6476,154.5427,195.2879,121.9954,null],["2023-12-29",281.751,257.5506,124.2868,153.8739,191.5203,121.7574,null],["2023-12-30",281.751,254.3709,124.2868,153.8739,190.8923,121.7574,null],["2023-12-31",281.751,255.253,124.2868,153.8739,190.076,121.7574,null],["2024-01-01",276.8794,255.1779,124.2868,153.8739,195.9176,121.7574,null],["2024-01-02",291.1581,267.0304,123.5912,151.27,196.1875,120.7414,null],["2024-01-03",294.6452,272.0241,122.5819,149.6693,184.0444,119.7712,null],["2024-01-04",287.0776,258.8861,122.1871,148.8991,188.8573,119.6339,null],["2024-01-05",298.6933,267.193,122.3544,149.0757,188.9281,119.7803,null],["2024-01-06",300.0383,266.698,122.3544,149.0757,186.6266,119.7803,null],["2024-01-07",302.0989,265.7453,122.3544,149.0757,185.0365,119.7803,null],["2024-01-08",288.9375,265.3078,124.1011,152.1568,194.1642,121.3638,null],["2024-01-09",294.5421,283.7619,123.9129,152.4574,195.3045,120.8787,null],["2024-01-10",292.6484,278.7425,124.6137,153.4906,215.056,121.5835,null],["2024-01-11",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-12",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-13",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-14",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-15",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-16",275.8344,257.4701,124.1874,153.8739,215.6266,120.833,null],["2024-01-17",278.0366,260.8597,123.4971,153.0059,210.847,120.0458,null],["2024-01-18",276.9912,258.235,124.5954,155.1777,205.725,121.0526,null],["2024-01-19",274.8658,249.4538,126.1486,158.2551,207.5609,122.3158,null],["2024-01-20",268.9457,251.5066,126.1486,158.2551,205.9133,122.3158,null],["2024-01-21",265.5627,251.6588,126.1486,158.2551,204.6663,122.3158,null],["2024-01-22",258.9937,251.1497,126.4153,158.4617,192.7198,122.5995,null],["2024-01-23",251.6595,238.8336,126.784,159.1193,186.8973,122.7551,null],["2024-01-24",251.3299,240.8209,126.9226,160.0023,186.1393,123.0389,null],["2024-01-25",248.0882,242.5755,127.6129,160.1976,184.7291,123.524,null],["2024-01-26",248.4354,241.4547,127.4508,159.2433,188.8807,123.6339,null],["2024-01-27",248.4354,241.4547,127.4508,159.2433,188.8807,123.6339,null],["2024-01-28",255.2724,254.6423,127.4508,159.2433,187.9952,123.6339,null],["2024-01-29",253.3681,254.0799,128.4601,160.874,193.0655,124.5858,null],["2024-01-30",261.7111,261.5828,128.3607,159.8031,195.1746,124.476,null],["2024-01-31",250.7058,259.3122,126.2662,156.6732,190.1793,122.8375,null],["2024-02-01",247.7895,257.4455,127.9188,158.5181,191.9402,124.2563,null],["2024-02-02",249.1773,260.3823,129.2655,161.1971,192.3566,124.897,null],["2024-02-03",254.3892,260.9967,129.2655,161.1971,191.2921,124.897,null],["2024-02-04",251.7326,259.8249,129.2655,161.1971,190.7323,124.897,null],["2024-02-05",251.1406,257.5428,128.7948,160.9867,191.7361,124.3387,null],["2024-02-06",255.7891,257.8396,129.1687,160.6636,197.6352,124.8238,null],["2024-02-07",257.8958,260.4957,130.2461,162.3168,201.9658,125.5378,null],["2024-02-08",269.118,267.5064,130.3036,162.6174,201.5427,125.611,null],["2024-02-09",276.5054,274.1014,131.0567,164.2181,207.0969,126.2243,null],["2024-02-10",283.8094,285.0137,131.0567,164.2181,208.2664,126.2243,null],["2024-02-11",289.0049,288.7968,131.0567,164.2181,208.8004,126.2243,null],["2024-02-12",286.8637,291.3414,130.9991,163.5756,221.3932,126.3158,null],["2024-02-13",292.2979,302.5879,129.1949,161.0243,219.913,124.4211,null],["2024-02-14",295.4932,300.6654,130.369,162.779,231.1598,125.7483,null],["2024-02-15",303.2478,313.1076,131.2685,163.2637,235.114,126.8192,null],["2024-02-16",308.1672,314.1236,130.6148,161.7833,233.3822,126.3524,null],["2024-02-17",310.4945,315.3824,130.6148,161.7833,232.0578,126.3524,null],["2024-02-18",304.8719,312.4689,130.6148,161.7833,239.9044,126.3524,null],["2024-02-19",309.7451,315.2134,130.6148,161.7833,245.2937,126.3524,null],["2024-02-20",321.6685,312.9513,129.8957,160.5621,251.1728,125.9588,null],["2024-02-21",321.6685,312.9513,129.8957,160.5621,251.1728,125.9588,null],["2024-02-22",317.3176,313.4255,132.704,164.6013,247.5977,128.3112,null],["2024-02-23",315.7299,310.2621,132.7955,164.1166,243.4145,128.4485,null],["2024-02-24",315.7299,310.2621,132.7955,164.1166,243.4145,128.4485,null],["2024-02-25",316.3671,311.6743,132.7955,164.1166,259.2701,128.4485,null],["2024-02-26",316.4716,312.8761,132.3092,164.0302,264.547,127.9542,null],["2024-02-27",336.7874,329.3586,132.555,164.4247,270.0613,128.2838,null],["2024-02-28",347.3758,344.626,132.3798,163.5493,281.7971,127.881,null],["2024-02-29",347.3758,344.626,132.3798,163.5493,281.7971,127.881,null],["2024-03-01",367.3178,370.5904,134.103,167.4344,286.0019,129.5561,null],["2024-03-02",362.6525,377.4125,134.103,167.4344,284.9299,129.5561,null],["2024-03-03",361.3917,375.2434,134.103,167.4344,290.5966,129.5561,null],["2024-03-04",368.2443,381.1999,133.9592,166.837,302.0641,129.4005,null],["2024-03-05",374.226,412.2357,132.6203,163.8423,296.2075,128.3936,null],["2024-03-06",380.8457,388.6871,133.2924,164.8719,317.7423,129.3547,null],["2024-03-07",385.2049,399.8981,134.6155,167.3743,322.3345,130.746,null],["2024-03-08",392.7259,404.7284,133.8075,164.9583,323.4598,130.0503,null],["2024-03-09",407.9517,413.0132,133.8075,164.9583,325.2899,130.0503,null],["2024-03-10",404.9309,414.1785,133.8075,164.9583,323.0658,130.0503,null],["2024-03-11",407.9149,417.6105,133.6924,164.3458,338.6049,129.6751,null],["2024-03-12",393.2237,436.0794,135.1306,166.7017,331.4647,131.0389,null],["2024-03-13",393.9064,432.0688,134.9188,165.4205,333.5463,130.9199,null],["2024-03-14",396.9282,441.9269,134.6521,165.0034,323.5215,130.3432,null],["2024-03-15",365.2411,431.7838,133.3133,163.042,311.625,129.7391,null],["2024-03-16",370.2854,420.1623,133.3133,163.042,293.5128,129.7391,null],["2024-03-17",353.691,394.7375,133.3133,163.042,303.6001,129.7391,null],["2024-03-18",365.6665,413.6792,134.1056,164.3796,293.2313,130.1327,null],["2024-03-19",365.6665,413.6792,134.1056,164.3796,293.2313,130.1327,null],["2024-03-20",337.7413,375.6343,136.0981,166.7431,292.7673,132.0,null],["2024-03-21",355.6627,410.0134,136.5479,167.5321,290.9764,132.4211,null],["2024-03-22",347.3986,396.2106,136.289,167.7238,277.723,132.1739,null],["2024-03-23",347.3986,396.2106,136.289,167.7238,277.723,132.1739,null],["2024-03-24",331.0367,388.6524,136.289,167.7238,287.8194,132.1739,null],["2024-03-25",346.4392,406.9417,135.9125,167.1151,299.0887,131.8078,null],["2024-03-26",362.565,422.8296,135.6614,166.574,298.8288,131.6339,null],["2024-03-27",349.5171,423.6948,136.8015,167.1414,291.5762,132.6407,null],["2024-03-28",345.0999,419.7874,136.7754,166.8332,296.4907,132.6407,null],["2024-03-29",339.3369,427.4923,136.7754,166.8332,292.3533,132.6407,null],["2024-03-30",339.3369,422.7093,136.7754,166.8332,292.1093,132.6407,null],["2024-03-31",334.8104,421.3989,136.7754,166.8332,303.7925,132.6407,null],["2024-04-01",334.8104,421.3989,136.7754,166.8332,303.7925,132.6407,null],["2024-04-02",324.6903,421.9045,135.6693,165.7436,273.0475,131.3501,null],["2024-04-03",323.8913,395.6329,135.8183,166.1156,275.7655,131.7437,null],["2024-04-04",319.2421,399.7652,134.1605,163.5756,277.1674,130.2517,null],["2024-04-05",319.2421,399.7652,134.1605,163.5756,277.1674,130.2517,null],["2024-04-06",317.7409,410.978,134.1605,163.5756,279.2148,130.2517,null],["2024-04-07",327.7326,417.1569,134.1605,163.5756,287.7228,130.2517,null],["2024-04-08",339.9308,419.5832,135.6379,165.552,307.7775,131.5515,null],["2024-04-09",334.0247,433.018,135.7948,166.1644,292.1201,131.6522,null],["2024-04-10",325.0826,418.1121,134.4351,164.7141,295.302,130.1968,null],["2024-04-11",334.9651,426.3902,135.4496,167.3443,291.7527,131.0938,null],["2024-04-12",328.334,423.8436,133.58,164.6765,269.8714,129.0526,null],["2024-04-13",308.835,406.5858,133.58,164.6765,250.2616,129.0526,null],["2024-04-14",308.835,406.5858,133.58,164.6765,250.2616,129.0526,null],["2024-04-15",306.2648,397.5206,131.9065,161.9674,258.2997,127.7346,null],["2024-04-16",290.0618,383.4819,131.6659,161.9824,256.8412,127.2128,null],["2024-04-17",287.9786,385.2348,130.8867,160.006,248.7106,126.7918,null],["2024-04-18",287.9786,385.2348,130.8867,160.006,248.7106,126.7918,null],["2024-04-19",289.9561,383.6695,129.4773,155.8015,254.5755,125.6842,null],["2024-04-20",289.9561,383.6695,129.4773,155.8015,254.5755,125.6842,null],["2024-04-21",303.9281,392.3319,129.4773,155.8015,262.2055,125.6842,null],["2024-04-22",310.2708,392.5858,130.6697,157.3683,266.6028,126.7826,null],["2024-04-23",309.4663,404.1044,132.2203,159.7167,268.2279,128.2014,null],["2024-04-24",307.3208,401.4762,132.1575,160.2578,261.6391,128.1007,null],["2024-04-25",293.3757,388.6144,131.6555,159.4837,262.8719,127.643,null],["2024-04-26",291.8712,389.8638,132.9028,161.9448,260.7953,128.8787,null],["2024-04-27",285.2348,385.7295,132.9028,161.9448,271.18,128.8787,null],["2024-04-28",289.6679,384.006,132.9028,161.9448,271.6898,128.8787,null],["2024-04-29",278.4143,381.0628,133.3734,162.6024,267.9081,129.2723,null],["2024-04-30",278.4143,381.0628,133.3734,162.6024,267.9081,129.2723,null],["2024-05-01",256.2153,367.2728,130.8344,158.3828,247.6652,126.865,null],["2024-05-02",256.2153,367.2728,130.8344,158.3828,247.6652,126.865,null],["2024-05-03",256.2153,367.2728,130.8344,158.3828,247.6652,126.865,null],["2024-05-04",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-05",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-06",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-07",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-08",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-09",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-10",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-11",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-12",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-13",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-14",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-15",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-16",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-17",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-18",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-19",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-20",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-21",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-22",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-23",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-24",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-25",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-26",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-27",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-28",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-29",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-30",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-31",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-01",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-02",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-03",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-04",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-05",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-06",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-07",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-08",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-09",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-10",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-11",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-12",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-13",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-14",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-15",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-16",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-17",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-18",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-19",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-20",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-21",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-22",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-23",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-24",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-25",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-26",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-27",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-28",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-29",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-30",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-01",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-02",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-03",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-04",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-05",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-06",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-07",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-08",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-09",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-10",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-11",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-12",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-13",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-14",256.1009,357.6193,143.0589,182.2575,270.1746,134.984,null],["2024-07-15",259.9234,368.4388,146.8321,186.4244,290.2725,139.5057,null],["2024-07-16",264.8131,391.9756,147.7028,186.4958,286.7916,140.3204,null],["2024-07-17",273.7218,393.9511,145.6319,181.0213,282.1952,138.7643,null],["2024-07-18",271.6304,387.7486,144.5127,180.1646,285.3713,137.5195,null],["2024-07-19",267.8612,386.6801,143.5531,178.5677,291.9085,136.5492,null],["2024-07-20",280.4525,403.1847,143.5531,178.5677,292.9597,136.5492,null],["2024-07-21",279.4076,406.3074,143.5531,178.5677,294.5015,136.5492,null],["2024-07-22",281.9289,411.6402,145.0331,181.2279,286.5433,138.0046,null],["2024-07-23",277.4365,408.7357,144.8056,180.5892,290.086,137.5652,null],["2024-07-24",277.4365,408.7357,144.8056,180.5892,290.086,137.5652,null],["2024-07-25",264.9571,395.4099,140.7865,172.1913,264.512,134.0961,null],["2024-07-26",277.4339,397.5043,142.3633,173.9573,272.8084,135.5881,null],["2024-07-27",278.088,410.6254,142.3633,173.9573,270.4711,135.5881,null],["2024-07-28",275.9254,411.4423,142.3633,173.9573,272.4086,135.5881,null],["2024-07-29",282.9449,412.5719,142.447,174.3068,276.4002,135.5423,null],["2024-07-30",273.7235,403.673,141.7253,171.9133,273.1266,135.1579,null],["2024-07-31",272.3657,400.3402,144.029,177.0008,269.2033,137.2723,null],["2024-08-01",272.3657,400.3402,144.029,177.0008,269.2033,137.2723,null],["2024-08-02",250.6925,395.1317,139.3458,168.6143,249.0854,132.3753,null],["2024-08-03",250.6925,395.1317,139.3458,168.6143,249.0854,132.3753,null],["2024-08-04",232.0905,367.208,139.3458,168.6143,223.9488,132.3753,null],["2024-08-05",197.8175,350.6879,135.2875,163.5868,201.2453,128.7689,null],["2024-08-06",212.1748,326.2031,136.5348,165.1499,205.0711,129.7574,null],["2024-08-07",220.047,338.3162,135.6222,163.3614,194.7348,129.2265,null],["2024-08-08",219.5717,333.1175,138.7574,168.3588,223.5565,131.9725,null],["2024-08-09",237.8552,373.9809,139.3693,169.238,216.4812,132.7506,null],["2024-08-10",235.1921,368.259,139.3693,169.238,217.4258,132.7506,null],["2024-08-11",237.3423,368.1086,139.3693,169.238,212.7053,132.7506,null],["2024-08-12",226.6414,355.5125,139.4425,169.6025,226.7884,132.6316,null],["2024-08-13",229.4011,358.8125,141.7357,173.8108,225.1483,134.9382,null],["2024-08-14",231.8948,366.3766,142.1829,173.8671,221.8164,135.3501,null],["2024-08-15",231.8948,366.3766,142.1829,173.8671,221.8164,135.3501,null],["2024-08-16",225.1215,348.3779,144.9442,178.4888,215.9381,137.9497,null],["2024-08-17",228.0679,355.9822,144.9442,178.4888,217.7681,137.9497,null],["2024-08-18",230.0891,359.3005,144.9442,178.4888,217.5807,137.9497,null],["2024-08-19",227.3623,353.3001,146.33,180.8334,219.6631,139.3318,null],["2024-08-20",236.1534,360.172,146.0921,180.4539,214.3155,139.1304,null],["2024-08-21",236.1534,360.172,146.0921,180.4539,214.3155,139.1304,null],["2024-08-22",235.7098,369.6622,145.4436,178.4211,218.4937,138.6636,null],["2024-08-23",235.7098,369.6622,145.4436,178.4211,218.4937,138.6636,null],["2024-08-24",248.5994,387.2249,145.4436,178.4211,230.6076,138.6636,null],["2024-08-25",245.2438,387.8747,145.4436,178.4211,228.9,138.6636,null],["2024-08-26",249.303,388.5316,146.6386,178.6052,223.2616,140.3753,null],["2024-08-27",242.323,380.4108,146.8399,179.1388,204.7438,140.5858,null],["2024-08-28",231.305,359.8795,145.9875,177.106,210.5529,139.9176,null],["2024-08-29",227.5253,356.7885,146.0006,176.8468,210.6354,140.0092,null],["2024-08-30",225.6487,358.8216,147.3943,178.9547,210.363,141.1259,null],["2024-08-31",225.6487,358.8216,147.3943,178.9547,210.363,141.1259,null],["2024-09-01",225.6487,358.8216,147.3943,178.9547,210.363,141.1259,null],["2024-09-02",219.5415,346.7673,147.3943,178.9547,211.4375,141.1259,null],["2024-09-03",223.9973,357.3534,144.3611,173.5215,201.8625,138.2243,null],["2024-09-04",202.0267,347.6549,144.0656,173.0706,204.0932,137.9588,null],["2024-09-05",213.5323,350.5769,143.7152,173.2321,197.3462,137.4737,null],["2024-09-06",213.5323,350.5769,143.7152,173.2321,197.3462,137.4737,null],["2024-09-07",213.5323,350.5769,143.7152,173.2321,197.3462,137.4737,null],["2024-09-08",198.0692,327.3801,143.7152,173.2321,191.2663,137.4737,null],["2024-09-09",201.4237,331.2582,142.8784,170.7598,196.5482,136.6865,null],["2024-09-10",213.7612,344.9016,143.5008,172.3379,198.8896,137.0618,null],["2024-09-11",212.3743,348.3781,144.9729,176.0803,194.9314,138.4073,null],["2024-09-12",212.3743,348.3781,144.9729,176.0803,194.9314,138.4073,null],["2024-09-13",221.0074,351.2969,146.9576,178.6052,203.2553,140.1739,null],["2024-09-14",231.87,366.4939,146.9576,178.6052,201.3761,140.1739,null],["2024-09-15",231.87,366.4939,146.9576,178.6052,201.3761,140.1739,null],["2024-09-16",225.2512,357.9947,147.1746,177.8162,191.2271,140.659,null],["2024-09-17",225.0988,351.9267,147.2348,177.9101,195.0671,140.4302,null],["2024-09-18",231.9831,364.6584,146.7981,177.1399,197.596,140.0549,null],["2024-09-19",246.5518,371.45,149.3031,181.6187,205.2852,142.4805,null],["2024-09-20",259.3479,380.6765,148.5893,181.273,213.39,141.9771,null],["2024-09-21",257.4798,381.654,148.5893,181.273,217.6848,141.9771,null],["2024-09-22",263.3581,383.3177,148.5893,181.273,215.1026,141.9771,null],["2024-09-23",273.3374,384.401,148.9606,181.4985,220.5419,142.4073,null],["2024-09-24",273.6047,382.8559,149.3868,182.3739,220.9459,142.8558,null],["2024-09-25",274.3601,388.9446,149.0573,182.543,214.9352,142.4989,null],["2024-09-26",277.9684,381.7972,149.6483,183.9145,219.2425,143.7986,null],["2024-09-27",283.0371,393.7608,149.4313,182.8925,224.4469,143.3593,null],["2024-09-28",284.4556,397.7524,149.4313,182.8925,222.8793,143.3593,null],["2024-09-29",283.5393,398.6175,149.4313,182.8925,221.3766,143.3593,null],["2024-09-30",283.2814,396.9827,150.0301,183.3884,216.8627,143.6247,null],["2024-10-01",278.5289,382.3496,148.686,180.8334,204.0507,142.4348,null],["2024-10-02",269.2497,368.0176,148.7488,181.0889,197.0454,142.4531,null],["2024-10-03",264.4671,366.7051,148.4768,180.9536,195.721,141.913,null],["2024-10-04",264.1689,367.1422,149.8261,183.1066,201.1154,143.103,null],["2024-10-05",264.1689,367.1422,149.8261,183.1066,201.1154,143.103,null],["2024-10-06",268.8595,375.3889,149.8261,183.1066,203.2727,143.103,null],["2024-10-07",283.8004,379.741,148.4716,181.1453,201.8084,141.8764,null],["2024-10-08",276.4007,376.5706,149.8758,183.8506,203.3227,142.8558,null],["2024-10-09",276.4007,376.5706,149.8758,183.8506,203.3227,142.8558,null],["2024-10-10",276.4007,376.5706,149.8758,183.8506,203.3227,142.8558,null],["2024-10-11",268.0151,363.9217,151.5519,185.3761,202.9729,144.2014,null],["2024-10-12",281.4841,377.2051,151.5519,185.3761,206.2839,144.2014,null],["2024-10-13",283.7034,382.1349,151.5519,185.3761,205.6542,144.2014,null],["2024-10-14",293.7094,379.8482,152.7914,186.9317,219.1167,145.1167,null],["2024-10-15",295.1897,399.3182,151.6042,184.433,217.2259,143.6796,null],["2024-10-16",295.1897,399.3182,151.6042,184.433,217.2259,143.6796,null],["2024-10-17",302.2219,408.9765,152.2762,184.5833,217.0335,144.3478,null],["2024-10-18",302.2219,408.9765,152.2762,184.5833,217.0335,144.3478,null],["2024-10-19",302.2219,408.9765,152.2762,184.5833,217.0335,144.3478,null],["2024-10-20",302.6175,413.4583,152.2762,184.5833,228.8408,144.3478,null],["2024-10-21",308.3565,416.9283,152.6109,186.1501,222.1254,144.357,null],["2024-10-22",296.7318,407.4488,152.5299,186.353,218.3879,144.1281,null],["2024-10-23",293.5598,407.1839,151.1362,183.4974,210.4172,142.6911,null],["2024-10-24",294.7072,403.151,151.463,184.9853,211.231,143.1579,null],["2024-10-25",293.3944,412.4014,151.4107,186.1126,203.3436,142.9291,null],["2024-10-26",290.7336,402.5567,151.4107,186.1126,206.7871,142.9291,null],["2024-10-27",290.7897,405.1714,151.4107,186.1126,208.8587,142.9291,null],["2024-10-28",299.2876,410.7358,151.8788,186.1426,213.8582,143.5606,null],["2024-10-29",318.4883,422.2635,152.1246,187.9312,219.7914,143.5606,null],["2024-10-30",325.6798,440.0125,151.6644,186.5109,221.4557,143.0389,null],["2024-10-31",322.5711,437.3615,148.6913,181.8028,209.8374,140.714,null],["2024-11-01",296.9963,424.8008,149.3188,183.148,209.2393,141.2815,null],["2024-11-02",298.2403,420.2237,149.3188,183.148,207.6142,141.2815,null],["2024-11-03",288.9761,418.9616,149.3188,183.148,204.718,141.2815,null],["2024-11-04",287.7954,415.9651,148.9972,182.6144,199.8259,141.0892,null],["2024-11-05",290.1299,409.8576,150.7988,184.944,201.7876,142.7551,null],["2024-11-06",344.3575,419.1809,154.5485,189.9677,226.7226,144.9519,null],["2024-11-07",354.0363,457.1809,155.7435,192.9586,241.073,146.3707,null],["2024-11-08",356.4547,459.3957,156.4182,193.184,246.6714,146.3432,null],["2024-11-09",359.4667,462.7981,156.4182,193.184,260.5279,146.3432,null],["2024-11-10",376.7143,463.283,156.4182,193.184,265.3892,146.3432,null],["2024-11-11",411.5366,486.4773,156.5672,193.0713,280.8891,146.6819,null],["2024-11-12",468.7698,535.8749,156.0809,192.7219,270.0863,145.7025,null],["2024-11-13",438.4164,533.6209,156.1567,192.4739,265.47,145.5103,null],["2024-11-14",474.9444,547.0635,155.1526,191.1362,254.7413,144.9062,null],["2024-11-15",474.9444,547.0635,155.1526,191.1362,254.7413,144.9062,null],["2024-11-16",472.0211,549.8438,155.1526,191.1362,260.8869,144.9062,null],["2024-11-17",465.4105,547.7791,155.1526,191.1362,256.174,144.9062,null],["2024-11-18",474.5712,543.1542,153.7929,187.8786,267.1726,144.0641,null],["2024-11-19",470.4326,547.3448,154.355,189.1711,258.7187,144.4851,null],["2024-11-20",481.2966,557.7254,154.4073,189.0621,255.6992,144.4027,null],["2024-11-21",505.2977,569.6074,155.2363,189.7422,279.5813,145.1442,null],["2024-11-22",505.2977,569.6074,155.2363,189.7422,279.5813,145.1442,null],["2024-11-23",534.8216,598.0855,155.2363,189.7422,282.7033,145.1442,null],["2024-11-24",534.0647,590.5403,155.2363,189.7422,279.9962,145.1442,null],["2024-11-25",532.5627,592.5745,156.2456,190.3472,284.2252,146.2334,null],["2024-11-26",532.5627,592.5745,156.2456,190.3472,284.2252,146.2334,null],["2024-11-27",501.4523,555.7919,156.5855,189.8625,304.3506,146.3158,null],["2024-11-28",525.3076,580.273,156.5855,189.8625,298.0717,146.3158,null],["2024-11-29",529.8158,578.3409,157.5582,191.5308,299.2145,147.4966,null],["2024-11-30",529.8158,578.3409,157.5582,191.5308,299.2145,147.4966,null],["2024-12-01",541.4126,583.4891,157.5582,191.5308,308.8936,147.4966,null],["2024-12-02",522.3391,588.317,157.8407,193.6161,303.4918,147.8719,null],["2024-12-03",519.5394,579.378,157.9139,194.2098,301.1253,148.0275,null],["2024-12-04",548.1089,580.578,158.8944,196.6108,319.549,148.8879,null],["2024-12-05",587.2132,597.8073,158.633,196.066,315.2884,148.897,null],["2024-12-06",562.8478,587.6507,158.9337,197.8207,333.1481,149.1533,null],["2024-12-07",580.7327,604.4115,158.9337,197.8207,332.8758,149.1533,null],["2024-12-08",575.1683,603.2506,158.9337,197.8207,333.4313,149.1533,null],["2024-12-09",562.2969,612.0382,158.1152,196.2802,309.7808,148.3021,null],["2024-12-10",532.341,588.5723,157.6236,195.6113,302.2807,147.6705,null],["2024-12-11",538.8178,611.3782,158.8421,199.1132,319.1459,148.8238,null],["2024-12-12",568.402,604.6294,158.0237,197.8282,323.3291,147.8627,null],["2024-12-13",569.261,613.1919,157.9923,199.3425,325.6489,147.6888,null],["2024-12-14",576.1436,613.1406,157.9923,199.3425,322.4544,147.6888,null],["2024-12-15",570.2207,631.4306,157.9923,199.3425,329.8412,147.6888,null],["2024-12-16",594.2701,641.192,158.6669,202.2131,332.0986,148.0092,null],["2024-12-17",606.3723,641.6835,158.0132,201.3226,324.2587,146.4531,null],["2024-12-18",563.17,605.7654,153.3039,194.0595,302.1924,142.2243,null],["2024-12-19",538.7409,589.2504,153.2568,193.1953,284.7799,142.0229,null],["2024-12-20",445.7581,569.8431,154.5773,194.8824,270.0455,143.1213,null],["2024-12-21",488.6573,591.2932,154.5773,194.8824,285.0581,143.1213,null],["2024-12-22",477.5466,586.372,154.5773,194.8824,281.7796,143.1213,null],["2024-12-23",472.7462,579.8971,155.503,196.4643,277.4848,144.0732,null],["2024-12-24",484.2481,568.7065,157.2314,199.1283,283.2972,145.3272,null],["2024-12-25",513.2943,592.2605,157.2314,199.1283,290.2134,145.3272,null],["2024-12-26",483.2245,579.7218,157.2418,198.993,280.2985,145.5927,null],["2024-12-27",491.1078,585.4047,155.5866,196.3478,284.4984,144.2563,null],["2024-12-28",484.1888,570.6048,155.5866,196.3478,277.982,144.2563,null],["2024-12-29",484.1888,570.6048,155.5866,196.3478,277.982,144.2563,null],["2024-12-30",488.3537,566.5301,153.8112,193.7364,284.331,142.9016,null],["2024-12-31",488.3537,566.5301,153.8112,193.7364,284.331,142.9016,null],["2025-01-01",488.3999,564.1843,153.8112,193.7364,277.5964,142.9016,null],["2025-01-02",523.4935,580.4412,152.875,191.7149,285.8103,142.0595,null],["2025-01-03",513.0202,581.2392,154.7865,194.8523,285.6396,143.6888,null],["2025-01-04",529.6671,591.4323,154.7865,194.8523,298.8788,143.6888,null],["2025-01-05",539.5893,591.4323,154.7865,194.8523,298.8788,143.6888,null],["2025-01-06",540.9197,596.7646,155.6782,197.0918,302.8005,144.4027,null],["2025-01-07",540.6864,609.7326,153.9184,193.5748,303.3136,143.167,null],["2025-01-08",500.7385,580.151,154.1432,193.6086,280.2244,143.1854,null],["2025-01-09",478.3381,565.3874,154.1432,193.6086,276.0754,143.1854,null],["2025-01-10",494.6042,572.5576,151.7899,190.5726,274.7493,141.1899,null],["2025-01-11",481.794,569.5529,151.7899,190.5726,269.7873,141.1899,null],["2025-01-12",473.9669,567.4188,151.7899,190.5726,269.1409,141.1899,null],["2025-01-13",453.8508,561.3126,152.0252,189.9602,263.6782,141.1716,null],["2025-01-14",489.2636,578.4643,152.2344,189.7798,265.5183,141.3547,null],["2025-01-15",507.3215,587.5268,155.0035,194.1459,269.12,143.8078,null],["2025-01-16",537.8847,596.2326,154.7054,192.7858,275.8346,143.8352,null],["2025-01-17",540.8958,617.7976,156.2587,196.0397,283.7112,144.9886,null],["2025-01-18",524.4903,626.0137,156.2587,196.0397,274.6801,144.9886,null],["2025-01-19",545.3028,633.1778,156.2587,196.0397,279.3473,144.9886,null],["2025-01-20",555.5791,651.7381,156.2587,196.0397,282.8774,144.9886,null],["2025-01-21",505.0413,616.8484,157.689,197.1894,269.7998,146.7002,null],["2025-01-22",542.0293,634.7013,158.5754,199.7107,274.7834,147.2677,null],["2025-01-23",511.2181,618.8858,159.4409,200.1353,268.4953,148.1648,null],["2025-01-24",523.793,636.6178,158.9755,199.0043,282.9141,148.0458,null],["2025-01-25",504.2768,630.687,158.9755,199.0043,273.9271,148.0458,null],["2025-01-26",515.145,633.2685,158.9755,199.0043,277.3115,148.0458,null],["2025-01-27",515.145,633.2685,158.9755,199.0043,277.3115,148.0458,null],["2025-01-28",515.145,633.2685,158.9755,199.0043,277.3115,148.0458,null],["2025-01-29",495.6866,619.8349,157.3647,195.6978,261.3817,146.8284,null],["2025-01-30",504.8824,636.0314,158.2093,196.5319,267.4799,147.8719,null],["2025-01-31",493.4486,628.9398,157.3674,196.2463,269.6906,147.0572,null],["2025-02-01",477.3825,615.6453,157.3674,196.2463,271.4865,147.0572,null],["2025-02-02",451.2916,598.9713,157.3674,196.2463,257.9107,147.0572,null],["2025-02-03",410.3407,576.3966,156.3083,194.6757,214.6578,145.8764,null],["2025-02-04",439.0984,597.2785,157.3569,197.0655,226.1737,147.0389,null],["2025-02-05",433.9409,590.3622,157.9949,197.9597,230.8741,147.8719,null],["2025-02-06",433.9409,590.3622,157.9949,197.9597,230.8741,147.8719,null],["2025-02-07",433.9409,590.3622,157.9949,197.9597,230.8741,147.8719,null],["2025-02-08",414.7315,581.741,157.9949,197.9597,218.2879,147.8719,null],["2025-02-09",414.7315,581.741,157.9949,197.9597,218.2879,147.8719,null],["2025-02-10",427.6302,590.6101,158.1597,198.8615,220.2787,147.9908,null],["2025-02-11",458.6122,593.5301,158.2799,198.3881,225.788,148.2563,null],["2025-02-12",435.3095,582.5209,157.77,198.5045,219.0268,148.1281,null],["2025-02-13",440.0056,581.9103,159.4357,201.3602,223.4315,149.7025,null],["2025-02-14",440.0706,586.0576,159.4279,202.2056,225.7355,149.7117,null],["2025-02-15",444.4167,592.3573,159.4279,202.2056,227.982,149.7117,null],["2025-02-16",429.1239,587.031,159.4279,202.2056,224.2861,149.7117,null],["2025-02-17",422.8914,581.342,159.4279,202.2056,227.0549,149.7117,null],["2025-02-18",422.8914,581.342,159.4279,202.2056,227.0549,149.7117,null],["2025-02-19",422.8914,581.342,159.4279,202.2056,227.0549,149.7117,null],["2025-02-20",432.6639,588.0648,159.6057,201.8599,227.4564,149.849,null],["2025-02-21",451.2011,596.0754,156.8758,197.6704,234.1835,147.6247,null],["2025-02-22",451.2011,596.0754,156.8758,197.6704,234.1835,147.6247,null],["2025-02-23",430.096,581.8136,156.8758,197.6704,234.0686,147.6247,null],["2025-02-24",379.6062,555.6055,156.1619,195.337,209.1544,147.0297,null],["2025-02-25",364.5075,537.6014,155.3853,192.8759,207.9149,146.8284,null],["2025-02-26",335.2617,510.6799,155.4637,193.3419,194.7473,146.9199,null],["2025-02-27",328.0627,514.0111,152.9822,187.9725,192.2275,144.6773,null],["2025-02-28",312.5272,511.9011,155.3696,190.9409,186.2868,146.4531,null],["2025-03-01",313.6958,522.2393,155.3696,190.9409,184.7141,146.4531,null],["2025-03-02",373.002,571.2396,155.3696,190.9409,209.7566,146.4531,null],["2025-03-03",379.1295,522.8015,152.6475,186.7626,179.0149,144.8879,null],["2025-03-04",350.5457,528.8291,150.8407,186.199,180.7792,143.6705,null],["2025-03-05",368.2892,549.2394,152.4619,188.6263,186.7233,145.7574,null],["2025-03-06",385.4197,544.8381,149.7555,183.4373,183.453,143.2403,null],["2025-03-07",375.2488,526.0602,150.5949,184.7862,178.3535,144.2929,null],["2025-03-08",362.8048,522.9104,150.5949,184.7862,183.553,144.2929,null],["2025-03-09",344.4023,489.0545,150.5949,184.7862,168.2513,144.2929,null],["2025-03-10",300.2809,476.0018,146.5837,177.6246,155.2994,140.357,null],["2025-03-11",296.6936,502.6512,145.3652,177.2,160.1206,139.524,null],["2025-03-12",326.8548,506.9679,146.1365,179.1989,158.9495,140.2288,null],["2025-03-13",324.1824,491.4486,144.1885,175.9751,155.3235,138.4348,null],["2025-03-14",318.6955,509.0899,147.1668,180.2285,159.2327,141.3822,null],["2025-03-15",334.5018,511.0789,147.1668,180.2285,161.3609,141.3822,null],["2025-03-16",331.5789,500.3357,147.1668,180.2285,157.236,141.3822,null],["2025-03-17",327.0614,509.2894,148.3016,181.397,160.4596,142.6728,null],["2025-03-18",330.8115,501.4421,146.6987,178.3047,160.9811,141.4462,null],["2025-03-19",335.6149,526.1508,148.2964,180.6906,171.3108,142.7277,null],["2025-03-20",348.1707,509.628,147.8676,180.0782,165.2259,142.1785,null],["2025-03-21",335.4519,508.709,147.4727,180.6718,163.7274,142.087,null],["2025-03-22",334.4126,507.3487,147.4727,180.6718,164.9952,142.087,null],["2025-03-23",339.2405,521.4473,147.4727,180.6718,167.0959,142.087,null],["2025-03-24",353.6318,529.6876,150.1137,184.3616,173.1525,144.0915,null],["2025-03-25",360.5306,529.8508,150.4746,185.4137,172.1079,144.4211,null],["2025-03-26",358.6238,526.5136,148.6782,182.002,167.3933,142.7735,null],["2025-03-27",357.018,527.892,148.2833,180.9649,166.9002,142.4073,null],["2025-03-28",351.3955,511.3026,145.2972,176.2005,157.989,139.9359,null],["2025-03-29",332.5093,500.9524,145.2972,176.2005,152.254,139.9359,null],["2025-03-30",321.8003,499.0903,145.2972,176.2005,150.5198,139.9359,null],["2025-03-31",320.8018,499.8158,146.2725,176.193,151.7634,140.2105,null],["2025-04-01",328.6516,515.0751,146.6857,177.6133,158.6804,140.595,null],["2025-04-02",336.7838,498.7276,147.6139,178.9096,149.5677,141.5378,null],["2025-04-03",328.6605,502.9475,140.3394,169.3319,151.3119,135.7254,null],["2025-04-04",334.3292,506.8772,132.1235,158.8149,151.2978,127.46,null],["2025-04-05",337.6565,505.4081,132.1235,158.8149,150.474,127.46,null],["2025-04-06",321.4344,474.2304,132.1235,158.8149,131.6638,127.46,null],["2025-04-07",296.2442,478.7042,131.8882,159.1982,129.3614,126.3249,null],["2025-04-08",294.5661,461.48,129.8225,156.3313,122.7302,124.7597,null],["2025-04-09",291.5653,499.0238,143.4563,175.0958,139.0847,135.9085,null],["2025-04-10",326.7325,480.9532,137.1702,167.6486,126.7892,131.8993,null],["2025-04-11",317.512,504.0417,139.6177,170.7372,130.5076,134.4805,null],["2025-04-12",347.8807,515.45,139.6177,170.7372,136.9507,134.4805,null],["2025-04-13",355.1217,505.922,139.6177,170.7372,133.0898,134.4805,null],["2025-04-14",349.7933,511.1273,140.9722,171.8945,135.2522,135.7162,null],["2025-04-15",350.8532,505.8252,140.5774,172.0861,132.3427,135.881,null],["2025-04-16",346.67,507.9654,137.4526,166.8971,131.3714,133.6751,null],["2025-04-17",350.8847,512.8382,137.6487,166.8671,131.837,134.2517,null],["2025-04-18",354.6686,510.033,137.6487,166.8671,132.3535,134.2517,null],["2025-04-19",353.6947,513.4851,137.6487,166.8671,134.3235,134.2517,null],["2025-04-20",356.858,513.999,137.6487,166.8671,132.216,134.2517,null],["2025-04-21",363.5767,528.8351,134.3723,162.7377,131.5755,131.7895,null],["2025-04-22",392.2158,564.0815,137.8684,167.0098,146.2791,134.9016,null],["2025-04-23",411.3837,566.1129,140.0047,170.7973,149.5244,136.5858,null],["2025-04-24",410.8196,567.9327,142.9517,175.6031,147.397,139.222,null],["2025-04-25",415.225,572.5395,143.9845,177.5607,148.7655,140.0915,null],["2025-04-26",416.4636,572.4851,143.9845,177.5607,151.6551,140.0915,null],["2025-04-27",411.1387,566.9895,143.9845,177.5607,149.2203,140.0915,null],["2025-04-28",415.6328,574.6192,144.0394,177.5043,149.8717,140.4577,null],["2025-04-29",415.8186,571.022,144.9468,178.6766,149.8076,141.1259,null],["2025-04-30",414.2041,570.1635,145.0043,178.6541,149.4003,141.2174,null],["2025-05-01",420.7701,583.2101,146.032,180.9875,153.127,141.6751,null],["2025-05-02",423.0968,585.7493,148.1997,183.674,153.4385,143.8993,null],["2025-05-03",421.6317,580.7798,148.1997,183.674,152.7613,143.8993,null],["2025-05-04",416.8459,572.5516,148.1997,183.674,150.6889,143.8993,null],["2025-05-05",414.2172,574.2806,147.3498,182.5844,151.6293,143.3684,null],["2025-05-06",421.563,586.0274,146.1182,180.886,151.3178,142.5263,null],["2025-05-07",428.2124,587.1519,146.7327,181.5962,150.868,142.8192,null],["2025-05-08",447.6244,624.2181,147.7551,183.4711,183.7645,143.3593,null],["2025-05-09",468.3588,622.3439,147.5669,183.3509,195.3545,143.5057,null],["2025-05-10",474.1943,632.8634,147.5669,183.3509,215.2217,143.5057,null],["2025-05-11",482.7186,629.2965,147.5669,183.3509,209.5109,143.5057,null],["2025-05-12",476.6082,621.8603,152.4436,190.8206,207.8874,147.0297,null],["2025-05-13",481.4272,629.7197,153.4503,193.7289,223.2408,147.9359,null],["2025-05-14",493.3292,626.0318,153.6464,194.8899,217.3791,147.9359,null],["2025-05-15",493.1641,626.9386,154.3969,195.1041,212.2547,148.7506,null],["2025-05-16",494.8918,625.4272,155.3748,195.9533,211.3284,149.6659,null],["2025-05-17",497.8203,623.5531,155.3748,195.9533,206.164,149.6659,null],["2025-05-18",506.2936,643.927,155.3748,195.9533,208.1573,149.6659,null],["2025-05-19",510.3889,637.8209,155.5448,196.1411,210.5929,150.0503,null],["2025-05-20",513.5294,645.1362,155.0218,195.4873,210.2272,149.8947,null],["2025-05-21",525.7267,662.7896,152.4096,192.7707,212.5262,147.9268,null],["2025-05-22",538.4117,674.9415,152.4697,193.1314,221.8847,147.8169,null],["2025-05-23",535.3933,648.159,151.429,191.3429,210.4471,147.3318,null],["2025-05-24",537.5876,650.1541,151.429,191.3429,210.6854,147.3318,null],["2025-05-25",539.671,658.3158,151.429,191.3429,212.5079,147.3318,null],["2025-05-26",546.5161,661.3387,151.429,191.3429,213.5608,147.3318,null],["2025-05-27",547.7141,658.074,154.5773,195.8443,221.644,149.9588,null],["2025-05-28",553.2662,651.4842,153.683,194.9763,223.3366,148.9886,null],["2025-05-29",547.4212,638.3045,154.2897,195.3596,219.28,149.5195,null],["2025-05-30",537.7385,628.9337,154.1171,195.0515,210.8495,149.4828,null],["2025-05-31",526.2278,632.7425,154.1171,195.0515,210.5829,149.4828,null],["2025-06-01",529.7238,638.5464,154.1171,195.0515,211.3676,149.4828,null],["2025-06-02",533.6936,640.1183,154.9852,196.592,217.1401,150.5263,null],["2025-06-03",533.6936,640.1183,154.9852,196.592,217.1401,150.5263,null],["2025-06-04",549.0455,637.8934,155.8272,198.6811,220.0796,151.1396,null],["2025-06-05",549.0455,637.8934,155.8272,198.6811,220.0796,151.1396,null],["2025-06-06",531.266,626.8117,156.6666,199.1132,205.8741,151.8078,null],["2025-06-07",531.266,626.8117,156.6666,199.1132,205.8741,151.8078,null],["2025-06-08",543.6199,637.6818,156.6666,199.1132,209.3285,151.8078,null],["2025-06-09",543.6199,637.6818,156.6666,199.1132,209.3285,151.8078,null],["2025-06-10",569.4848,660.0388,157.6968,200.7252,223.1441,152.4485,null],["2025-06-11",578.28,662.445,157.2471,200.0488,231.548,152.1007,null],["2025-06-12",570.6165,651.2967,157.872,200.5185,229.7288,152.833,null],["2025-06-13",547.6716,632.9722,156.107,198.0011,209.8232,151.0297,null],["2025-06-14",547.6716,632.9722,156.107,198.0011,209.8232,151.0297,null],["2025-06-15",551.1465,638.1715,156.107,198.0011,211.0119,151.0297,null],["2025-06-16",562.3487,647.4336,157.5922,200.7552,218.8677,151.1762,null],["2025-06-17",562.3487,647.4336,157.5922,200.7552,218.8677,151.1762,null],["2025-06-18",540.0165,631.5757,156.2221,198.7638,208.9495,149.8215,null],["2025-06-19",540.0165,631.5757,156.2221,198.7638,208.9495,149.8215,null],["2025-06-20",550.5017,641.2125,155.3958,197.9522,212.4871,149.2174,null],["2025-06-21",550.5017,641.2125,155.3958,197.9522,212.4871,149.2174,null],["2025-06-22",520.7863,618.1784,155.3958,197.9522,187.198,149.2174,null],["2025-06-23",492.4575,613.5837,156.9307,199.7633,187.3422,150.5629,null],["2025-06-24",492.4575,613.5837,156.9307,199.7633,187.3422,150.5629,null],["2025-06-25",512.8575,644.1084,158.7532,203.3366,203.0837,152.0549,null],["2025-06-26",512.8575,644.1084,158.7532,203.3366,203.0837,152.0549,null],["2025-06-27",514.2137,646.9318,160.7902,205.9405,203.6592,154.3158,null],["2025-06-28",514.2137,646.9318,160.7902,205.9405,203.6592,154.3158,null],["2025-06-29",514.9605,649.0961,160.7902,205.9405,203.0595,154.3158,null],["2025-06-30",524.0766,650.8856,161.559,207.2744,206.0307,155.0389,null],["2025-07-01",516.6975,645.0878,161.5067,205.5272,204.6363,154.8284,null],["2025-07-02",522.1378,649.5435,162.2388,206.9587,204.174,155.4874,null],["2025-07-03",541.4329,662.1548,163.5175,208.9953,216.213,156.4027,null],["2025-07-04",541.3404,657.8926,163.5175,208.9953,212.3263,156.4027,null],["2025-07-05",541.3404,657.8926,163.5175,208.9953,212.3263,156.4027,null],["2025-07-06",538.694,653.177,163.5175,208.9953,209.4792,156.4027,null],["2025-07-07",545.7069,658.5818,162.299,207.4209,214.537,155.1213,null],["2025-07-08",542.6153,655.7041,162.2101,207.5374,212.592,155.2037,null],["2025-07-09",551.3005,657.1308,163.1828,209.0065,217.769,156.2471,null],["2025-07-10",551.3005,657.1308,163.1828,209.0065,217.769,156.2471,null],["2025-07-11",595.1569,711.5482,163.0678,208.2363,248.1266,155.7071,null],["2025-07-12",594.5549,711.9351,163.0678,208.2363,247.1046,155.7071,null],["2025-07-13",596.1562,714.1418,163.0678,208.2363,247.2145,155.7071,null],["2025-07-14",613.2999,740.2713,163.3789,208.9915,252.7305,156.0275,null],["2025-07-15",613.2999,740.2713,163.3789,208.9915,252.7305,156.0275,null],["2025-07-16",618.0233,718.5249,163.2246,209.3973,262.2988,155.6064,null],["2025-07-17",633.0594,717.9989,164.2235,211.0919,287.9077,156.476,null],["2025-07-18",644.5921,728.9053,164.1032,210.889,302.9521,156.3478,null],["2025-07-19",636.6093,714.2808,164.1032,210.889,296.3199,156.3478,null],["2025-07-20",651.4515,714.7282,164.1032,210.889,306.9736,156.3478,null],["2025-07-21",659.7473,721.6747,164.4144,211.9824,315.5558,156.7231,null],["2025-07-22",642.3366,713.6641,164.4379,210.8852,307.1944,156.9977,null],["2025-07-23",636.3306,718.4765,164.4379,211.8471,310.9261,158.8009,null],["2025-07-24",632.3868,718.3254,164.4379,212.298,302.9695,158.6728,null],["2025-07-25",623.8658,695.6722,164.4379,212.809,301.2436,159.0389,null],["2025-07-26",649.3756,710.6292,164.4379,212.809,312.8977,159.0389,null],["2025-07-27",653.7252,714.311,164.4379,212.809,314.1664,159.0389,null],["2025-07-28",663.6954,718.9783,164.4379,213.4741,324.0912,158.3524,null],["2025-07-29",668.1641,718.7788,164.4379,213.1435,322.756,158.0137,null],["2025-07-30",651.4805,715.5988,164.4379,213.429,318.3404,157.5652,null],["2025-07-31",665.3887,717.1888,164.4379,212.298,321.6606,156.6133,null],["2025-08-01",623.135,693.532,164.4379,208.116,301.4327,154.6545,null],["2025-08-02",623.135,693.532,164.4379,208.116,301.4327,154.6545,null],["2025-08-03",610.9136,687.1659,164.4379,208.116,288.3675,154.6545,null],["2025-08-04",613.5018,691.2407,164.4379,211.9561,296.0234,156.9062,null],["2025-08-05",613.5018,691.2407,164.4379,211.9561,296.0234,156.9062,null],["2025-08-06",611.8533,689.3786,164.2052,210.517,301.88,156.9062,null],["2025-08-07",619.9714,695.6661,165.463,213.166,309.9907,156.5217,null],["2025-08-08",639.6744,704.7649,165.3244,213.8874,325.1908,157.7574,null],["2025-08-09",647.061,705.1458,166.6135,215.8826,340.2109,158.9291,null],["2025-08-10",659.7386,715.2965,166.6135,215.8826,351.1737,158.9291,null],["2025-08-11",668.4049,731.9282,166.6135,215.8826,353.3152,158.9291,null],["2025-08-12",657.9561,718.8514,166.284,215.2439,358.5821,158.4439,null],["2025-08-13",676.1009,719.6373,168.0543,217.9492,385.8778,160.2929,null],["2025-08-14",688.7005,736.6317,168.6296,218.0582,394.1784,160.8879,null],["2025-08-15",675.4035,719.6373,168.6452,217.8891,387.0506,160.7323,null],["2025-08-16",658.1777,711.1733,168.2504,216.9309,370.9184,160.8421,null],["2025-08-17",660.7752,714.565,168.2504,216.9309,373.6439,160.8421,null],["2025-08-18",637.5632,697.5705,168.2504,216.9309,356.4922,160.8421,null],["2025-08-19",632.0661,694.9648,168.2138,216.8445,352.5481,160.659,null],["2025-08-20",626.3953,686.8273,167.3012,213.9025,348.3574,159.9908,null],["2025-08-21",639.7757,687.8793,166.8567,212.6324,357.6492,159.881,null],["2025-08-22",637.3942,680.7574,166.1873,211.648,358.8628,159.2311,null],["2025-08-23",687.5466,699.2391,168.7394,214.9132,392.3383,161.611,null],["2025-08-24",683.1077,692.8005,168.7394,214.9132,394.903,161.611,null],["2025-08-25",663.1623,674.9354,168.7394,214.9132,383.2123,161.611,null],["2025-08-26",643.3501,665.3711,167.9968,214.2932,367.3958,160.6316,null],["2025-08-27",673.097,671.3926,168.7002,215.1537,384.3376,161.0435,null],["2025-08-28",682.317,684.8322,169.0845,215.4843,385.1164,161.2906,null],["2025-08-29",641.3086,662.2334,169.6833,216.8332,360.3105,161.9405,null],["2025-08-30",641.3086,662.2334,169.6833,216.8332,360.3105,161.9405,null],["2025-08-31",655.3705,657.8503,168.6714,214.3233,371.4282,160.9886,null],["2025-09-01",653.3803,660.456,168.6714,214.3233,370.0363,160.9886,null],["2025-09-02",653.2124,665.5223,168.6714,214.3233,364.3813,160.9886,null],["2025-09-03",653.6398,671.0843,167.4215,212.5272,359.9349,159.7712,null],["2025-09-04",663.6656,669.5185,168.3288,214.1993,364.9818,160.3661,null],["2025-09-05",673.5795,681.6945,169.7356,216.1381,365.8556,161.7025,null],["2025-09-06",664.5506,670.2621,169.244,216.45,359.1544,161.492,null],["2025-09-07",661.6239,672.3841,169.244,216.45,358.6879,161.492,null],["2025-09-08",670.3468,675.8181,169.244,216.45,357.9032,161.492,null],["2025-09-09",681.2707,680.8058,169.6598,217.5058,361.974,162.2517,null],["2025-09-10",673.8382,674.4397,170.052,218.122,359.3826,162.5263,null],["2025-09-11",700.0622,689.959,170.5436,218.1934,368.9318,162.8009,null],["2025-09-12",710.3193,695.4424,171.9609,219.4634,376.7159,164.2746,null],["2025-09-13",724.4688,701.4337,171.9034,220.4329,394.0951,164.0732,null],["2025-09-14",718.1908,701.3551,171.9034,220.4329,388.6416,164.0732,null],["2025-09-15",713.48,699.9646,171.9034,220.4329,380.5643,164.0732,null],["2025-09-16",707.8657,700.013,172.8186,222.3191,375.8879,164.9245,null],["2025-09-17",712.8714,705.7503,172.5806,222.1312,375.2949,164.7689,null],["2025-09-18",722.3443,707.8542,172.3662,221.6878,381.2065,164.357,null],["2025-09-19",718.2421,707.4492,173.1716,223.6868,378.5876,165.2174,null],["2025-09-20",709.0498,700.4966,173.5481,225.201,373.03,165.7117,null],["2025-09-21",709.0498,700.4966,173.5481,225.201,373.03,165.7117,null],["2025-09-22",675.7157,681.8154,173.5481,225.201,350.0591,165.7117,null],["2025-09-23",676.0463,682.7525,174.3692,226.2719,349.4519,166.3249,null],["2025-09-24",670.4273,680.6365,173.42,224.7689,347.9551,165.6476,null],["2025-09-25",670.4273,680.6365,173.42,224.7689,347.9551,165.6476,null],["2025-09-26",628.8608,663.3821,172.0707,223.0142,327.9346,164.1556,null],["2025-09-27",628.4075,660.2746,173.0565,223.931,331.3248,165.0343,null],["2025-09-28",628.4075,660.2746,173.0565,223.931,331.3248,165.0343,null],["2025-09-29",661.2345,677.2328,172.0263,222.0861,342.4558,164.2105,null],["2025-09-30",670.0186,686.8696,173.067,224.4721,347.8942,165.2265,null],["2025-10-01",671.7868,692.4982,173.0016,223.9799,345.4986,165.1899,null],["2025-10-02",709.0731,717.9808,173.3807,224.07,365.4391,165.8032,null],["2025-10-03",719.4531,725.4351,174.3535,226.5462,371.5565,166.4989,null],["2025-10-04",726.2156,740.9846,174.7143,225.9657,375.0525,167.2128,null],["2025-10-05",726.2156,740.9846,174.7143,225.9657,375.0525,167.2128,null],["2025-10-06",733.6714,748.711,174.7143,225.9657,380.1145,167.2128,null],["2025-10-07",734.9331,749.4244,175.053,227.6884,389.7303,167.6522,null],["2025-10-08",721.6728,738.9412,174.5862,226.5838,373.0458,166.9565,null],["2025-10-09",711.8225,740.3498,175.0438,227.4217,363.5483,167.3684,null],["2025-10-10",704.5353,732.4179,174.9889,228.2558,360.9394,166.8192,null],["2025-10-11",575.555,667.4932,170.7084,221.3309,313.1102,163.0389,null],["2025-10-12",576.97,674.9173,170.7084,221.3309,318.4037,163.0389,null],["2025-10-13",602.9974,697.6189,170.7084,221.3309,348.5156,163.0389,null],["2025-10-14",584.1504,675.8906,172.5199,224.4044,332.8583,164.54,null],["2025-10-15",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-16",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-17",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-18",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-19",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-20",584.4389,672.0819,172.0942,224.0813,337.2772,164.8146,null],["2025-10-21",562.8885,651.1758,174.4816,228.0999,321.8006,167.0206,null],["2025-10-22",564.581,654.3498,175.1905,228.9472,321.7422,167.1167,null],["2025-10-23",579.1938,663.4063,173.4435,225.3476,324.3569,165.6201,null],["2025-10-24",588.1249,671.834,174.6202,227.1436,329.3456,166.8375,null],["2025-10-25",588.8691,674.4578,176.6729,231.1302,327.3615,168.4485,null],["2025-10-26",600.5552,675.7758,176.6729,231.1302,329.8679,168.4485,null],["2025-10-27",619.3795,697.7277,176.6729,231.1302,348.5065,168.4485,null],["2025-10-28",616.5335,691.6457,178.3634,234.4743,344.1634,169.8582,null],["2025-10-29",612.8145,685.2736,179.0733,236.4357,334.7908,170.3525,null],["2025-10-30",601.0857,664.8996,178.5608,236.8115,323.4615,169.611,null],["2025-10-31",588.9674,662.0218,177.7659,235.192,319.1292,168.9886,null],["2025-11-01",591.1144,665.6009,177.6116,235.4738,321.7522,168.6842,null],["2025-11-02",590.5098,667.7592,177.6116,235.4738,324.1654,168.6842,null],["2025-11-03",590.5098,667.7592,177.6116,235.4738,324.1654,168.6842,null],["2025-11-04",590.5098,667.7592,177.6116,235.4738,324.1654,168.6842,null],["2025-11-05",540.4654,614.8593,176.3931,232.3796,274.8476,167.3867,null],["2025-11-06",546.4447,623.946,176.2859,231.9118,281.8462,167.4233,null],["2025-11-07",542.4401,615.1677,174.8608,229.3154,278.8533,166.4897,null],["2025-11-08",542.4401,615.1677,174.8608,229.3154,278.8533,166.4897,null],["2025-11-09",542.4401,615.1677,174.8608,229.3154,278.8533,166.4897,null],["2025-11-10",542.4401,615.1677,174.8608,229.3154,278.8533,166.4897,null],["2025-11-11",554.3233,633.6615,176.5107,231.7915,295.437,168.0915,null],["2025-11-12",555.7976,634.0,177.4782,232.0283,294.2025,169.2082,null],["2025-11-13",555.7976,634.0,177.4782,232.0283,294.2025,169.2082,null],["2025-11-14",555.7976,634.0,177.4782,232.0283,294.2025,169.2082,null],["2025-11-15",516.5054,580.5863,173.4344,224.3819,264.6795,165.8581,null],["2025-11-16",515.9667,579.752,173.4344,224.3819,267.3042,165.8581,null],["2025-11-17",513.3268,577.37,173.4344,224.3819,265.3783,165.8581,null],["2025-11-18",501.978,551.6637,173.148,225.3964,254.573,165.167,null],["2025-11-19",501.978,551.6637,173.148,225.3964,254.573,165.167,null],["2025-11-20",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-21",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-22",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-23",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-24",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-25",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-26",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-27",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-28",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-29",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-30",484.6606,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-12-01",484.6606,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-12-02",456.2001,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-12-03",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-04",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-05",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-06",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-07",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-08",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-09",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-10",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-11",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-12",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-13",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-14",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-15",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-16",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-17",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-18",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-19",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-20",447.2747,572.09,171.8069,222.3607,267.3947,163.7147,null],["2025-12-21",443.5302,570.1638,171.2323,222.1247,265.4488,163.7147,null],["2025-12-22",443.5302,570.1638,171.2323,222.1247,265.4488,163.7147,null],["2025-12-23",443.3827,567.2,171.2323,222.1247,265.3423,163.7147,null],["2025-12-24",443.3827,567.2,171.2323,222.1247,265.3423,163.7147,null],["2025-12-25",443.3827,567.2,171.2323,222.1247,265.3423,163.7147,null],["2025-12-26",449.679,574.7944,171.2323,222.1247,264.9447,163.7147,null],["2025-12-27",449.679,574.7944,171.2323,222.1247,264.9447,163.7147,null],["2025-12-28",447.8046,568.9576,171.2323,222.1247,262.7911,163.7147,null],["2025-12-29",447.8046,568.9576,171.2323,222.1247,262.7911,163.7147,null],["2025-12-30",447.8046,568.9576,171.2323,222.1247,262.7911,163.7147,null],["2025-12-31",444.6436,563.225,171.2323,222.1247,264.7309,164.6904,null],["2026-01-01",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-02",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-03",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-04",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-05",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-06",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-07",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-08",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-09",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-10",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-11",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-12",457.8218,586.5231,175.6874,227.4902,282.9827,169.1162,null],["2026-01-13",460.47,591.3445,175.9633,227.679,282.6805,169.5802,null],["2026-01-14",476.2649,612.6011,175.6114,227.3414,299.903,169.1162,null],["2026-01-15",480.8897,619.6245,174.7483,224.9127,300.1601,168.5808,null],["2026-01-16",477.2803,614.2189,175.2241,225.7223,298.7826,168.8664,null],["2026-01-17",475.2804,611.0603,175.0773,225.5335,297.1273,168.8307,null],["2026-01-18",478.8663,609.879,175.0773,225.5335,298.0195,168.8307,null],["2026-01-19",468.8134,597.3729,175.0773,225.5335,290.7613,168.8307,null],["2026-01-20",467.5279,583.8845,175.0773,225.5335,279.7884,168.8307,null],["2026-01-21",457.4924,571.1216,171.5133,220.7416,267.0014,165.6452,null],["2026-01-22",463.3278,577.2526,173.4928,223.7256,271.1068,167.4476,null],["2026-01-23",460.4052,572.0268,174.3989,225.352,264.9366,168.2507,null],["2026-01-24",462.6748,574.5498,174.4622,226.0635,266.5549,168.5184,null],["2026-01-25",446.3002,566.8651,174.4622,226.0635,264.5884,168.5184,null],["2026-01-26",445.2168,565.2023,174.4622,226.0635,262.6913,168.5184,null],["2026-01-27",444.5846,564.2843,175.3482,227.0582,262.399,169.4553,null],["2026-01-28",443.9783,563.4352,175.3482,227.0582,260.7563,169.4553,null],["2026-01-29",438.7827,556.4524,175.3305,227.8101,255.3365,169.0124,null],["2026-01-30",414.3518,523.4899,174.9826,226.4466,238.1862,169.0212,null],["2026-01-31",415.5192,525.0487,174.4607,223.7268,229.4436,167.9848,null],["2026-02-01",394.782,497.7003,174.4607,223.7268,209.7971,167.9848,null],["2026-02-02",386.1815,486.5861,174.4607,223.7268,195.1674,167.9848,null],["2026-02-03",395.9487,498.9993,175.328,225.263,201.7609,168.8972,null],["2026-02-04",382.8804,482.1569,173.8455,221.8021,197.5323,167.8165,null],["2026-02-05",357.7842,448.7129,173.0034,217.9274,182.2797,167.409,null],["2026-02-06",336.0853,419.7931,170.8428,214.7902,166.8774,165.1766,null],["2026-02-07",350.1903,437.7824,174.1203,219.3305,178.0519,168.5251,null],["2026-02-08",351.0751,438.961,174.1203,219.3305,181.6672,168.5251,null],["2026-02-09",353.357,441.9075,174.1203,219.3305,178.4313,168.5251,null],["2026-02-10",349.9003,437.6303,174.9599,221.0106,175.1137,169.9425,null],["2026-02-11",339.5729,424.2476,174.4985,219.9852,169.6278,169.7299,null],["2026-02-12",340.4705,425.4009,174.4582,220.5753,171.2261,169.9337,null],["2026-02-13",340.4705,425.4009,174.4582,220.5753,171.2261,169.9337,null],["2026-02-14",348.9622,436.211,171.884,216.5495,178.1537,167.781,null],["2026-02-15",356.1132,445.3989,171.884,216.5495,179.284,167.781,null],["2026-02-16",347.6028,434.4621,171.884,216.5495,171.4767,167.781,null],["2026-02-17",345.2308,431.4079,171.884,216.5495,171.5219,167.781,null],["2026-02-18",343.1909,428.7973,172.1614,216.3264,173.6719,167.8342,null],["2026-02-19",343.1909,428.7973,172.1614,216.3264,173.6719,167.8342,null],["2026-02-20",344.4255,430.3497,172.5723,217.1071,170.0872,168.2151,null],["2026-02-21",344.7707,430.7932,173.8203,219.0283,171.1948,169.3667,null],["2026-02-22",344.6613,430.6602,173.8203,219.0283,171.6855,169.3667,null],["2026-02-23",333.4892,416.251,173.8203,219.0283,163.8591,169.3667,null],["2026-02-24",320.9411,400.2767,172.0454,216.366,158.7134,167.8696,null],["2026-02-25",330.4509,412.3921,173.2959,218.6901,164.6691,168.9946,null],["2026-02-26",345.4061,431.3002,174.7582,221.8596,178.4496,170.412,null],["2026-02-27",342.8,428.0052,173.7875,219.183,176.1726,169.8008,null],["2026-02-28",323.269,403.3119,172.953,218.4814,161.6525,169.0567,null],["2026-03-01",323.269,403.3119,172.953,218.4814,161.6525,169.0567,null],["2026-03-02",335.1207,418.1836,172.953,218.4814,168.3061,169.0567,null],["2026-03-03",343.8743,429.2281,173.0513,218.7692,172.5739,168.472,null],["2026-03-04",352.5053,440.374,171.526,216.4272,175.1206,165.841,null],["2026-03-05",364.639,455.9998,172.7362,219.7262,182.7304,167.2672,null],["2026-03-06",364.639,455.9998,172.7362,219.7262,182.7304,167.2672,null],["2026-03-07",344.4865,430.0519,169.5216,215.7688,172.5939,163.8655,null],["2026-03-08",342.0672,429.5323,169.5216,215.7688,171.1295,163.8655,null],["2026-03-09",342.0672,429.5323,169.5216,215.7688,171.1295,163.8655,null],["2026-03-10",342.0672,429.5323,169.5216,215.7688,171.1295,163.8655,null],["2026-03-11",352.8374,440.6845,170.7318,218.6541,175.058,165.088,null],["2026-03-12",353.7799,441.8885,170.191,218.235,177.6604,164.5477,null],["2026-03-13",363.4537,454.2446,167.9282,214.873,182.9966,162.2444,null],["2026-03-14",363.4537,454.2446,167.9282,214.873,182.9966,162.2444,null],["2026-03-15",362.4913,453.0154,166.9777,213.5994,183.3621,161.0042,null],["2026-03-16",372.2246,465.4476,166.9777,213.5994,195.8739,161.0042,null],["2026-03-17",375.3996,469.5029,168.677,215.9955,202.6858,163.0328,null],["2026-03-18",375.9453,470.1999,169.1208,217.0496,202.7163,163.4315,null],["2026-03-19",354.8479,443.3078,166.7609,214.0239,187.9248,161.0219,null],["2026-03-20",354.8479,443.3078,166.7609,214.0239,187.9248,161.0219,null],["2026-03-21",354.8479,443.3078,166.7609,214.0239,187.9248,161.0219,null],["2026-03-22",354.8479,443.3078,166.7609,214.0239,187.9248,161.0219,null],["2026-03-23",347.413,433.9868,163.5186,209.4046,178.5279,157.6823,null],["2026-03-24",361.232,451.4946,165.2356,211.5416,188.7349,159.9323,null],["2026-03-25",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-26",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-27",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-28",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-29",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-30",343.2619,428.7276,159.8679,202.3964,180.208,155.3968,null],["2026-03-31",341.5718,426.7442,159.3334,200.8494,178.8429,154.9716,null],["2026-04-01",345.5641,431.7817,163.9649,207.6489,182.874,159.4717,null],["2026-04-02",337.9311,422.1503,165.2003,210.214,178.2277,161.0574,null],["2026-04-03",338.9806,423.4746,165.349,210.4551,179.09,160.9777,null],["2026-04-04",339.9247,424.6659,165.349,210.4551,178.6854,160.9777,null],["2026-04-05",339.9247,424.6659,165.349,210.4551,178.6854,160.9777,null],["2026-04-06",339.9247,424.6659,165.349,210.4551,178.6854,160.9777,null],["2026-04-07",348.3762,435.3302,166.1306,211.7215,183.2716,161.6863,null],["2026-04-08",362.6026,453.2815,166.2037,211.7538,195.4015,161.642,null],["2026-04-09",361.8111,452.255,170.4368,218.0497,190.4985,166.2396,null],["2026-04-10",361.8111,452.255,170.4368,218.0497,190.4985,166.2396,null],["2026-04-11",361.8111,452.255,170.4368,218.0497,190.4985,166.2396,null],["2026-04-12",363.8518,454.8022,171.3067,219.8413,193.0531,166.8775,null],["2026-04-13",358.5124,448.0919,171.3067,219.8413,189.9443,166.8775,null],["2026-04-14",378.4835,473.1908,172.9807,222.115,207.9794,168.3037,null],["2026-04-15",374.1877,467.7921,175.0885,226.148,201.7244,170.0842,null],["2026-04-16",374.1877,467.7921,175.0885,226.148,201.7244,170.0842,null],["2026-04-17",374.1877,467.7921,175.0885,226.148,201.7244,170.0842,null],["2026-04-18",391.7135,489.8177,179.0418,233.4332,210.4374,173.4416,null],["2026-04-19",381.3624,476.8089,179.0418,233.4332,201.7522,173.4416,null],["2026-04-20",378.4061,473.1274,179.0418,233.4332,199.4326,173.4416,null],["2026-04-21",386.7131,483.5256,178.6837,232.6921,201.9671,173.1936,null],["2026-04-22",396.2148,495.4192,177.5139,231.8071,208.0116,171.2181,null],["2026-04-23",395.911,495.039,179.3115,235.6854,204.0179,172.6709,null],["2026-04-24",395.911,495.039,179.3115,235.6854,204.0179,172.6709,null],["2026-04-25",392.0334,490.1853,179.9998,238.8405,201.1841,172.981,null],["2026-04-26",393.4204,491.9215,179.9998,238.8405,201.8332,172.981,null],["2026-04-27",393.4204,491.9215,179.9998,238.8405,201.8332,172.981,null],["2026-04-28",393.4204,491.9215,179.9998,238.8405,201.8332,172.981,null],["2026-04-29",390.4692,488.2273,179.4325,236.5632,202.2673,172.2369,null],["2026-04-30",385.326,481.7894,179.4048,238.0094,196.362,171.7408,null],["2026-05-01",387.8217,484.9133,181.1898,240.2292,197.072,174.1149,null],["2026-05-02",396.8425,496.2049,181.6916,242.5353,200.401,174.3009,null],["2026-05-03",397.4398,496.9526,181.6916,242.5353,201.0492,174.3009,null],["2026-05-04",397.4398,496.9526,181.6916,242.5353,201.0492,174.3009,null],["2026-05-05",408.693,511.0387,181.026,242.0784,206.2445,173.2379,null],["2026-05-06",413.4312,516.9696,182.4782,245.2191,206.9118,174.5401,null],["2026-05-07",412.5504,515.8671,185.0145,250.3134,203.4028,177.7292,null],["2026-05-08",403.0548,504.5184,184.4472,250.0148,198.4163,176.3915,null],["2026-05-09",406.8463,509.2645,185.9701,255.8754,201.653,177.738,null],["2026-05-10",408.451,511.2731,185.9701,255.8754,202.4466,177.738,null],["2026-05-11",408.6535,511.5266,185.9701,255.8754,202.7929,177.738,null]];
// GDB.S and GDB.C daily actual prices [date, gs$, gc$] — from Jan 2026
const GDBS = [["2026-05-31", 100.0614, 99.9847]];
// GDB.C actual price depuis Jan 2023 [date, gc$]
const GC_FULL = [["2026-05-31", 99.9847]];
// GDB.S base100 extended [date, b100|null] — null avant jan 2026
const GS_B100_EXT = [["2026-05-31", 100.0]];
// Portfolio total € base100 = Jan 1 2026 [date, b100_val]
const BENCH_IDX = [["2026-05-31", null, null, null, null, null]];
const PORT_B100=[["2026-01-01",100.0],["2026-01-12",103.138],["2026-01-13",103.622],["2026-01-14",105.541],["2026-01-15",106.086],["2026-01-16",106.098],["2026-01-17",106.005],["2026-01-18",106.528],["2026-01-19",105.101],["2026-01-20",107.426],["2026-01-21",105.789],["2026-01-22",106.913],["2026-01-23",106.429],["2026-01-24",106.353],["2026-01-25",104.481],["2026-01-26",104.247],["2026-01-27",104.061],["2026-01-27",103.957],["2026-01-28",102.791],["2026-01-29",102.452],["2026-01-30",99.859],["2026-01-31",99.928],["2026-02-01",97.642],["2026-02-02",96.506],["2026-02-03",97.827],["2026-02-04",96.942],["2026-02-05",93.032],["2026-02-06",90.135],["2026-02-07",92.501],["2026-02-08",92.549],["2026-02-09",92.516],["2026-02-10",92.273],["2026-02-11",90.922],["2026-02-12",91.218],["2026-02-14",92.276],["2026-02-15",93.307],["2026-02-16",92.124],["2026-02-17",91.946],["2026-02-18",91.612],["2026-02-20",93.04],["2026-02-21",93.081],["2026-02-22",93.06],["2026-02-23",91.455],["2026-02-24",89.794],["2026-02-25",91.481],["2026-02-26",93.528],["2026-02-27",93.123],["2026-02-28",90.467],["2026-03-02",92.604],["2026-03-03",94.27],["2026-03-04",95.68],["2026-03-05",97.662],["2026-03-07",93.929],["2026-03-08",93.679],["2026-03-11",95.381],["2026-03-12",96.045],["2026-03-13",97.426],["2026-03-15",96.387],["2026-03-16",97.572],["2026-03-17",97.925],["2026-03-18",98.23],["2026-03-19",95.231],["2026-03-23",92.723],["2026-03-24",94.817],["2026-03-25",94.823],["2026-03-30",92.779],["2026-03-31",92.225],["2026-04-01",92.823],["2026-04-02",92.34],["2026-04-03",92.833],["2026-04-04",93.029],["2026-04-07",94.308],["2026-04-08",95.858],["2026-04-09",96.534],["2026-04-12",96.495],["2026-04-13",95.937],["2026-04-14",98.639],["2026-04-15",98.299],["2026-04-18",101.774],["2026-04-19",100.461],["2026-04-20",100.028],["2026-04-21",101.055],["2026-04-22",102.254],["2026-04-23",102.712],["2026-04-25",102.172],["2026-04-26",102.391],["2026-04-29",101.416],["2026-04-30",100.94],["2026-05-01",101.683],["2026-05-02",103.125],["2026-05-03",103.207],["2026-05-05",105.115],["2026-05-06",105.85],["2026-05-07",106.227],["2026-05-08",104.627]];


/* Helper: date string operations */
const TODAY=todayNC(); // date locale NC (UTC+11)
const parseD=d=>new Date(d+"T00:00:00Z");
const diffDays=(d1,d2)=>Math.round((parseD(d1)-parseD(d2))/(864e5));
const fmtDate=d=>{
  if(!d)return"";
  const[y,m,day]=d.split("-");
  const months=["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
};

/* Filter DD by timeframe key → returns filtered DD rows */
function filterByTF(tf){
  const all=DD.filter(r=>r[0]<=TODAY);
  if(tf==="ALL")return all;
  const last=TODAY;
  if(tf==="1W") return all.filter(r=>diffDays(last,r[0])<=7);
  if(tf==="1M") return all.filter(r=>diffDays(last,r[0])<=31);
  if(tf==="MTD")return all.filter(r=>r[0].slice(0,7)===TODAY.slice(0,7));
  if(tf==="YTD")return all.filter(r=>r[0].startsWith(TODAY.slice(0,4)));
  if(tf==="1Y") return all.filter(r=>diffDays(last,r[0])<=365);
  if(tf==="2Y") return all.filter(r=>diffDays(last,r[0])<=730);
  return all;
}
function filterDB(tf){
  const all=DB.filter(r=>r[0]<=TODAY);
  if(tf==="ALL")return all;
  const last=TODAY;
  if(tf==="1W") return all.filter(r=>diffDays(last,r[0])<=7);
  if(tf==="1M") return all.filter(r=>diffDays(last,r[0])<=31);
  if(tf==="MTD")return all.filter(r=>r[0].slice(0,7)===TODAY.slice(0,7));
  if(tf==="YTD")return all.filter(r=>r[0].startsWith(TODAY.slice(0,4)));
  if(tf==="1Y") return all.filter(r=>diffDays(last,r[0])<=365);
  if(tf==="2Y") return all.filter(r=>diffDays(last,r[0])<=730);
  return all;
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE LINE CHART — timeframe selector + date tooltip
   series: [{vals:[v,...], color, label, fmt?}]
   dates: string[] parallel to vals — shown in tooltip on hover
═══════════════════════════════════════════════════════════ */
const TFS=["1W","1M","MTD","YTD","1Y","2Y","ALL"];

function LineChart({series,dates,h=80,legend,defaultTF="ALL",hideTF=false,unit="€"}){
  const svgRef=useRef(null);
  const[hover,setHover]=useState(null);
  const[tf,setTF]=useState(defaultTF);

  /* Slice by timeframe — dates array drives the window */
  const sliceByTF=(vals,allDates,tf)=>{
    if(!allDates||tf==="ALL")return{vals,dates:allDates||[]};
    const last=allDates[allDates.length-1]||TODAY;
    let cutoff=last;
    if(tf==="1W")  cutoff=new Date(parseD(last)-7*864e5).toISOString().slice(0,10);
    if(tf==="1M")  cutoff=new Date(parseD(last)-31*864e5).toISOString().slice(0,10);
    if(tf==="MTD") cutoff=last.slice(0,7)+"-01";
    if(tf==="YTD") cutoff=last.slice(0,4)+"-01-01";
    if(tf==="1Y")  cutoff=new Date(parseD(last)-365*864e5).toISOString().slice(0,10);
    if(tf==="2Y")  cutoff=new Date(parseD(last)-730*864e5).toISOString().slice(0,10);
    const startIdx=allDates.findIndex(d=>d>=cutoff);
    const si=startIdx<0?0:startIdx;
    return{vals:vals.slice(si),dates:allDates.slice(si)};
  };

  /* Build sliced series */
  const sliced=series.map(s=>{
    const{vals:sv,dates:sd}=sliceByTF(s.vals,dates,tf);
    return{...s,vals:sv,_dates:sd};
  });

  const allY=sliced.flatMap(s=>s.vals.filter(v=>v!=null));
  if(!allY.length)return null;
  const mn=Math.min(...allY),mx=Math.max(...allY),rng=mx-mn||1;
  const W=300,n=Math.max(...sliced.map(s=>s.vals.length));
  if(n<2)return null;
  const px=i=>i/(n-1)*W;
  const py=v=>h-((v-mn)/rng)*(h-6)+3;

  const getIdx=(clientX,rect)=>{
    const svgX=(clientX-rect.left)*(W/rect.width);
    return Math.min(n-1,Math.max(0,Math.round(svgX/(W/(n-1)))));
  };
  const onMove=ev=>{
    if(!svgRef.current)return;
    const r=svgRef.current.getBoundingClientRect();
    setHover({i:getIdx(ev.clientX,r)});
  };
  const _tm1=useRef(false),_ts1=useRef(0);
  const onTouch=ev=>{
    ev.preventDefault();
    if(!svgRef.current)return;
    const r=svgRef.current.getBoundingClientRect();
    const t=ev.touches[0]||ev.changedTouches[0];
    if(ev.type==="touchstart"){_tm1.current=false;_ts1.current=t.clientX;}
    else{_tm1.current=Math.abs(t.clientX-_ts1.current)>4;}
    setHover({i:getIdx(t.clientX,r)});
  };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm1.current)setHover(null);};

  const hx=hover!=null?px(hover.i):null;
  const hovDate=hover!=null?(sliced[0]?._dates?.[hover.i]||""):null;
  const legH=legend?18:0;
  const grids=[mn,mn+rng*.5,mx];

  /* Format value for tooltip */
  const fv=(v,s)=>{
    if(v==null)return null;
    if(s.pct)return(v>=0?"+":"")+v.toFixed(1)+"%";
    if(v>=1e6)return unit+(v/1e6).toFixed(2)+"M";
    if(v>=1e3)return unit+Math.round(v).toLocaleString("fr-FR");
    return v.toFixed(2);
  };

  return(
    <div style={{position:"relative"}}>
      {/* Timeframe bar */}
      {!hideTF&&(
        <div style={{display:"flex",gap:3,marginBottom:10}}>
          {TFS.map(t=>(
            <button key={t} onClick={()=>{setTF(t);setHover(null);}} style={{
              flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
              border:"none",cursor:"pointer",
              background:tf===t?C.btc:"transparent",
              color:tf===t?"#000":C.gray,
            }}>{t}</button>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hover!=null&&(
        <div style={{
          position:"absolute",top:hideTF?-2:30,left:"50%",transform:"translateX(-50%)",
          background:"rgba(10,12,18,0.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"8px 14px",zIndex:50,minWidth:170,
          boxShadow:"0 8px 32px rgba(0,0,0,.7)",pointerEvents:"none",
        }}>
          <div style={{fontSize:11,color:"#fff",fontWeight:800,textAlign:"center",marginBottom:6}}>
            {fmtDate(hovDate)}
          </div>
          {sliced.map((s,si)=>{
            const v=s.vals[hover.i];
            if(v==null)return null;
            const disp=fv(v,s);
            return(
              <div key={si} style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:10,color:C.text2}}> {s.label||""}</span>
                </div>
                <span style={{fontSize:12,fontWeight:800,color:s.color}}>{disp}</span>
              </div>
            );
          })}
        </div>
      )}

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${h+22+legH}`}
        style={{overflow:"visible",touchAction:"none",userSelect:"none"}}
        onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>

        {/* Grid */}
        {grids.map((v,i)=>(
          <g key={i}>
            <line x1={0} y1={py(v)} x2={W} y2={py(v)} stroke={C.border} strokeWidth={.4}/>
            <text x={-3} y={py(v)+3} textAnchor="end" fill={C.text3} fontSize={6}>
              {v>=1e6?(v/1e6).toFixed(1)+"M":v>=1000?(v/1000).toFixed(0)+"k":v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Lines */}
        {sliced.map((s,si)=>{
          const pts=s.vals.map((v,i)=>v!=null?`${px(i)},${py(v)}`:null).filter(Boolean).join(" ");
          return(
            <polyline key={si} points={pts} fill="none" stroke={s.color}
              strokeWidth={hover!=null&&si===0?2.8:s.bold?2.2:1.5}
              opacity={hover!=null&&si>0?.45:.92}/>
          );
        })}

        {/* Crosshair + dots */}
        {hover!=null&&hx!=null&&(
          <g>
            <line x1={hx} y1={2} x2={hx} y2={h} stroke="rgba(255,255,255,.15)" strokeWidth={1} strokeDasharray="3,3"/>
            {sliced.map((s,si)=>{
              const v=s.vals[hover.i];
              if(v==null)return null;
              return(
                <g key={si}>
                  <circle cx={hx} cy={py(v)} r={5} fill={C.bg1} stroke={s.color} strokeWidth={2.2}/>
                  <circle cx={hx} cy={py(v)} r={2} fill={s.color}/>
                </g>
              );
            })}
          </g>
        )}

        {/* X axis — show date label only on first, hover, last */}
        {sliced[0]?._dates?.map((d,i)=>{
          const n2=sliced[0]._dates.length;
          const isFirst=i===0,isLast=i===n2-1,isHov=hover?.i===i;
          const step=Math.max(1,Math.floor(n2/6));
          const show=isFirst||isLast||isHov||(i%step===0);
          if(!show)return null;
          const label=tf==="1W"||tf==="1M"||tf==="MTD"
            ?d.slice(5).replace("-","/")   // MM/DD
            :d.slice(2,7).replace("-","/"); // YY/MM
          return(
            <text key={i} x={px(i)} y={h+14} textAnchor="middle"
              fill={isHov?"#fff":C.text3} fontSize={isHov?7:5.5} fontWeight={isHov?700:400}>
              {label}
            </text>
          );
        })}

        {/* Legend */}
        {legend&&legend.map((l,i)=>(
          <g key={i} transform={`translate(${i*90},${h+22})`}>
            <rect x={0} y={1} width={12} height={2} fill={l.color} rx={1}/>
            <text x={16} y={5} fill={C.gray} fontSize={7}>{l.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE BAR CHART — tap bar → highlight + tooltip
═══════════════════════════════════════════════════════════ */
function BarChart({pcts,months,pnls,h=44}){
  const[sel,setSel]=useState(null);
  if(!pcts?.length)return null;
  const n=pcts.length,W=300,bw=Math.floor(W/n)-3;
  const maxA=Math.max(...pcts.map(Math.abs),.001);

  return(
    <div style={{position:"relative"}}>
      {sel!=null&&(
        <div style={{
          position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
          background:"rgba(14,17,24,0.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"8px 14px",zIndex:50,textAlign:"center",
          boxShadow:"0 4px 20px rgba(0,0,0,.6)",pointerEvents:"none",minWidth:100,
        }}>
          <div style={{fontSize:11,fontWeight:800,color:C.text}}>{months?.[sel]}</div>
          <div style={{fontSize:14,fontWeight:900,color:clr(pcts[sel])}}>{fmtP(pcts[sel])}</div>
          {pnls&&<div style={{fontSize:11,color:clr(pnls[sel]),marginTop:2}}>
            {pnls[sel]>=0?"+":""}€{fmt(Math.abs(pnls[sel]))}
          </div>}
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${h+18}`} style={{overflow:"visible",cursor:"pointer"}}>
        {pcts.map((v,i)=>{
          const bh=Math.max(Math.abs(v)/maxA*h*.88,1),x=i*(W/n)+1,pos=v>=0;
          const isActive=sel===i;
          return(
            <g key={i} onClick={()=>setSel(sel===i?null:i)} style={{cursor:"pointer"}}>
              <rect x={x-1} y={0} width={bw+2} height={h+2} fill="transparent"/>
              <rect x={x} y={pos?h-bh:h} width={bw} height={bh}
                fill={clr(v)} rx={2}
                opacity={sel==null?0.85:isActive?1:0.35}
                transform={isActive?`translate(0,-2)`:""}
                style={{transition:"opacity .15s,transform .15s"}}/>
              {months&&<text x={x+bw/2} y={h+14} textAnchor="middle"
                fill={isActive?"#fff":C.gray} fontSize={isActive?7:6} fontWeight={isActive?700:400}>
                {months[i]}
              </text>}
            </g>
          );
        })}
        <line x1={0} y1={h} x2={W} y2={h} stroke={C.border2} strokeWidth={.5}/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE DONUT — touch segment → highlight + center info
═══════════════════════════════════════════════════════════ */
function Donut({data,size=160,ri=30,label,sub}){
  const[sel,setSel]=useState(null);
  const cx=size/2,cy=size/2,R=size/2-7;
  // Normalize so values always sum to exactly 1.0 — no gap
  const total=data.reduce((s,d)=>s+d.v,0)||1;
  let cum=0;
  const sl=data.map((d,i)=>{const s=cum;cum+=d.v/total;return{...d,v:d.v/total,s,e:cum,i};});

  const arc=(s,e,r,expand=false)=>{
    const mid=(s+e)/2;
    const ox=expand?Math.cos(mid*2*Math.PI-Math.PI/2)*4:0;
    const oy=expand?Math.sin(mid*2*Math.PI-Math.PI/2)*4:0;
    const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2;
    const x1=cx+ox+r*Math.cos(a1),y1=cy+oy+r*Math.sin(a1);
    const x2=cx+ox+r*Math.cos(a2),y2=cy+oy+r*Math.sin(a2);
    return `M${cx+ox},${cy+oy}L${x1},${y1}A${r},${r},0,${(e-s)>.5?1:0},1,${x2},${y2}Z`;
  };

  const active=sel!=null?data[sel]:null;

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{cursor:"pointer"}}>
        {sl.map((s,i)=>{
          const isActive=sel===i;
          return(
            <path key={i} d={arc(s.s,s.e,R,isActive)}
              fill={s.c}
              opacity={sel==null?0.9:isActive?1:0.3}
              stroke={isActive?C.bg:"none"} strokeWidth={isActive?2:0}
              style={{transition:"opacity .2s"}}
              onClick={()=>setSel(sel===i?null:i)}/>
          );
        })}
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={ri+2} fill={C.bg}/>
        {/* Center text: default or active segment */}
        {active==null?(
          <>
            {label&&<text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="700">{label}</text>}
            {sub&&<text x={cx} y={cy+8} textAnchor="middle" fill={C.btc} fontSize={9} fontWeight="700">{sub}</text>}
          </>
        ):(
          <>
            <text x={cx} y={cy-8} textAnchor="middle" fill={active.c} fontSize={8} fontWeight="800">{active.n||label}</text>
            <text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="800">
              {active.pct!=null?(active.pct.toFixed(1)+"%"):(active.v*100).toFixed(1)+"%"}
            </text>
            {active.usd&&<text x={cx} y={cy+15} textAnchor="middle" fill={C.gray} fontSize={7}>${fmtK(active.usd)}</text>}
          </>
        )}
      </svg>
      {/* Tap-to-dismiss hint */}
      {sel!=null&&(
        <div style={{fontSize:9,color:C.gray,marginTop:4}}>
          Appuyer à nouveau pour fermer
        </div>
      )}
    </div>
  );
}

/* ─── UI ATOMS ──────────────────────────────────────────── */
const SC=({label,val,color,sub,small})=>(
  <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
    <div style={{fontSize:9,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
    <div style={{fontSize:small?13:16,fontWeight:800,color:color||C.text,lineHeight:1.1}}>{val}</div>
    {sub&&<div style={{fontSize:10,color:C.text3,marginTop:2}}>{sub}</div>}
  </div>
);
const SH=({label,right,color})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,marginTop:16}}>
    <span style={{fontSize:10,fontWeight:800,color:color||C.gray,textTransform:"uppercase",letterSpacing:.8}}>{label}</span>
    {right&&<span style={{fontSize:13,fontWeight:800,color:color||C.text}}>{right}</span>}
  </div>
);
const crd=(x={})=>({
  background: C.radius===16
    ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
    : C.name==="Bitcoin Maximalist"
      ? `linear-gradient(135deg,${C.bg2},${C.bg3})`
      : C.name==="❄ Frozen Throne"
      ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
      : C.name==="🌴 Tropical"
      ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
      : C.bg1,
  borderRadius:C.radius||12,
  padding:"12px 14px",
  border:`1px solid ${C.border}`,
  boxShadow: C.radius===16
    ? `0 4px 24px rgba(180,100,240,.06),inset 0 1px 0 rgba(212,168,67,.08)`
    : C.name==="❄ Frozen Throne"
      ? `0 2px 16px rgba(0,212,255,.06),inset 0 1px 0 rgba(125,216,255,.08)`
      : C.name==="🌴 Tropical"
      ? `0 2px 12px rgba(0,194,199,.08)`
      : C.name==="Bitcoin Maximalist"
        ? `0 2px 16px rgba(247,147,26,.06)`
        : "none",
  marginBottom:7,
  ...x,
});
const Modal=({title,onClose,children})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
    <div style={{background:C.bg1,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,maxHeight:"92vh",overflowY:"auto",padding:"20px 20px 48px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontSize:16,fontWeight:800}}>{title}</span>
        <button onClick={onClose} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,color:C.text2,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      {children}
    </div>
  </div>
);
const FI=({label,value,onChange,type="text",placeholder=""})=>(
  <div style={{marginBottom:13}}>
    <div style={{fontSize:11,color:C.text2,marginBottom:5,fontWeight:600}}>{label}</div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:16,outline:"none"}}/>
  </div>
);
const FS=({label,value,onChange,options})=>(
  <div style={{marginBottom:13}}>
    <div style={{fontSize:11,color:C.text2,marginBottom:5,fontWeight:600}}>{label}</div>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:16,outline:"none"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Btn=({label,onClick,color,full,outline})=>(
  <button onClick={onClick} style={{background:outline?"transparent":(color||C.btc),border:`1px solid ${color||C.btc}`,borderRadius:10,padding:"12px 20px",color:outline?(color||C.btc):"#000",fontWeight:800,fontSize:13,cursor:"pointer",width:full?"100%":"auto",marginBottom:full?8:0}}>{label}</button>
);

/* ═══════════════════════════════════════════════════════════
   TICKER MODAL — chart courbe + infos live via Cloudflare proxy
═══════════════════════════════════════════════════════════ */
const TF_CONFIG = [
  { label:"1h",  interval:"5m",   range:"1d"   },
  { label:"4h",  interval:"15m",  range:"5d"   },
  { label:"1J",  interval:"1h",   range:"5d"   },
  { label:"1S",  interval:"1d",   range:"1mo"  },
  { label:"1M",  interval:"1d",   range:"3mo"  },
  { label:"1A",  interval:"1wk",  range:"1y"   },
  { label:"5A",  interval:"1mo",  range:"5y"   },
  { label:"ALL", interval:"3mo",  range:"max"  },
];

// Timeframes CoinGecko : days valides = 1,7,14,30,90,180,365,max
// Mapping TF_CONFIG index → days CoinGecko
const TF_CG_DAYS = ["1","7","7","14","30","365","1825","max"];

function TickerModal({ ticker, cat="", eur=false, usdEur=0.86, onClose }) {
  const isCrypto = cat === "Crypto" || !!(CG_MAP[ticker]);
  const cgId     = CG_MAP[ticker] || ticker.toLowerCase();
  const yfSym    = YF_MAP[ticker] || ticker;

  const [tf, setTf]         = useState(3);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState(null);
  const [showCity, setShowCity] = useState(false);
  const [dragY, setDragY]   = useState(0);
  const touchStartY = useRef(null);
  const sheetRef    = useRef(null);
  const [crosshair, setCrosshair] = useState(null); // {i, x, y, price, ts}
  const svgRef = useRef(null);
  const [holdingsOpen, setHoldingsOpen] = useState(false);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Pour crypto : métriques chargées une seule fois (cachées KV côté worker)
  // OHLC rechargé à chaque changement de TF (endpoint léger séparé)
  const [cgMeta, setCgMeta] = useState(null); // métriques CoinGecko persistées

  const fetchChart = async (tfIdx) => {
    setLoading(true); setErr(null);
    try {
      if(isCrypto){
        // ── Métriques : uniquement si pas encore chargées ──────────────────
        let meta = cgMeta;
        if(!meta){
          const mUrl = CF_WORKER_URL + "/coingecko-coin?id=" + encodeURIComponent(cgId)
            + "&symbol=" + encodeURIComponent(ticker);
          const mr = await fetch(mUrl, { headers:{"X-Auth-Key":CF_AUTH_KEY}, signal:AbortSignal.timeout(15000) });
          const md = await mr.json();
          if(md.error) throw new Error("CoinGecko meta ["+cgId+"] : "+md.error);
          meta = md;
          setCgMeta(md);
          // Logo CoinGecko → ICON_DB.fmp
          if(md.logoUrl && !ICON_DB[ticker]?.fmp){
            setIconDb(ticker, { fmp: md.logoUrl });
            fetch(CF_WORKER_URL+"/write-bases", {
              method:"POST", headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
              body:JSON.stringify({gdb_icons:serializeIconDb()}), signal:AbortSignal.timeout(10000),
            }).catch(()=>{});
          }
        }
        // ── OHLC : Yahoo Finance (pas de rate-limit) ───────────────────────
        const { interval, range } = TF_CONFIG[tfIdx];
        const oUrl = CF_WORKER_URL + "/yahoo-chart?symbol=" + encodeURIComponent(yfSym)
          + "&interval=" + interval + "&range=" + range;
        const or = await fetch(oUrl, { headers:{"X-Auth-Key":CF_AUTH_KEY}, signal:AbortSignal.timeout(10000) });
        const od = await or.json();
        if(od.error) throw new Error("Yahoo chart ["+yfSym+"] : "+od.error);
        // Fusionner métriques CoinGecko + candles Yahoo
        setData({ ...meta, candles: od.candles || [], ohlcDays: range });
      } else {
        // ── Yahoo Finance path ──────────────────────────────────────────────
        const { interval, range } = TF_CONFIG[tfIdx];
        const url = CF_WORKER_URL + "/yahoo-chart?symbol=" + encodeURIComponent(yfSym)
          + "&interval=" + interval + "&range=" + range;
        const r = await fetch(url, { headers: { "X-Auth-Key": CF_AUTH_KEY } });
        const d = await r.json();
        if(d.error) throw new Error(d.error);
        if(d.logoUrl && !ICON_DB[ticker]?.fmp){
          setIconDb(ticker, { fmp: d.logoUrl });
          fetch(CF_WORKER_URL+"/write-bases", {
            method:"POST",
            headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
            body: JSON.stringify({ gdb_icons: serializeIconDb() }),
            signal: AbortSignal.timeout(10000),
          }).catch(()=>{});
        }
        setData(d);
      }
    } catch(e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChart(tf); }, [ticker, tf]);

  // Tri news par pertinence avec le ticker
  const scoreNews = (newsArr) => {
    if(!newsArr || !newsArr.length) return [];
    const tkLow    = ticker.toLowerCase();
    const nameLow  = (data?.name || "").toLowerCase().split(" ").filter(w=>w.length>3);
    // Secteur / industrie → mots-clés de 4+ chars
    const secWords = (data?.sector   || "").toLowerCase().split(/[\s/&,]+/).filter(w=>w.length>3);
    const indWords = (data?.industry || "").toLowerCase().split(/[\s/&,]+/).filter(w=>w.length>3);
    // Top holdings ETF : liste ordonnée, pondération décroissante (rang 0 = poids max)
    const holdings = (data?.topHoldings || []);
    const holdN    = holdings.length;
    return [...newsArr].sort((a,b)=>{
      const score = (n, idx) => {
        const t = (n.title||"").toLowerCase();
        let s = 0;
        // Ticker exact : +10
        if(t.includes(tkLow)) s += 10;
        // Mots du nom de la société : +3 chacun
        nameLow.forEach(w => { if(t.includes(w)) s += 3; });
        // Secteur : +2 par mot-clé trouvé
        secWords.forEach(w => { if(t.includes(w)) s += 2; });
        // Industrie : +1.5 par mot-clé trouvé
        indWords.forEach(w => { if(t.includes(w)) s += 1.5; });
        // ETF top holdings : pondération décroissante par rang
        // holding[0] → +4, holding[1] → +3.6, …, holding[N-1] → poids minimal ~1
        if(holdN > 0){
          holdings.forEach((h, ri) => {
            const hLow = (h.name||h.symbol||"").toLowerCase();
            if(hLow.length > 2 && t.includes(hLow)){
              const weight = holdN === 1 ? 4 : 4 * (1 - ri / holdN * 0.75);
              s += weight;
            }
          });
        }
        return s;
      };
      return score(b) - score(a);
    });
  };

  // Drapeaux pays (emoji)
  const FLAG = {
    US:"🇺🇸", GB:"🇬🇧", FR:"🇫🇷", IT:"🇮🇹", DE:"🇩🇪",
    NL:"🇳🇱", BE:"🇧🇪", CA:"🇨🇦", AU:"🇦🇺", HK:"🇭🇰",
    CN:"🇨🇳", JP:"🇯🇵", FX:"💱", CRYPTO:"₿",
  };

  const fmtMktCap = v => {
    if(!v) return null;
    if(v >= 1e12) return (v/1e12).toFixed(2)+"T";
    if(v >= 1e9)  return (v/1e9).toFixed(1)+"B";
    if(v >= 1e6)  return (v/1e6).toFixed(0)+"M";
    return v.toLocaleString("fr-FR");
  };

  const price     = data?.price;
  const prevClose = data?.prevClose;
  const currency  = data?.currency || "USD";
  const isUSD     = currency === "USD";
  const isEUR     = currency === "EUR";
  const isGBp     = currency === "GBp"; // pence → diviser par 100
  // Normalise le prix en USD-équivalent pour l'affichage cohérent
  // GBp → GBP : diviser par 100
  // EUR ticker (GOLD.PA, AI.PA…) : déjà en EUR, ne pas multiplier par usdEur
  const normalizePrice = v => {
    if(v == null) return null;
    if(isGBp) return v / 100; // GBp → GBP
    return v; // USD ou EUR : déjà dans la bonne devise de base
  };
  // Conversion pour l'affichage (toggle EUR)
  const cvPrice = v => {
    const n = normalizePrice(v);
    if(n == null) return null;
    if(eur){
      if(isEUR || isGBp) return n; // déjà en EUR (GBp→GBP est une approximation acceptable)
      return n * usdEur;           // USD → EUR
    }
    return n; // affichage devise native
  };
  const priceDisp = cvPrice(price);
  const pnl1d     = (price != null && prevClose != null) ? cvPrice(price - prevClose) : null;
  const pct1d     = (price != null && prevClose != null && prevClose !== 0) ? (normalizePrice(price) - normalizePrice(prevClose))/normalizePrice(prevClose) : null;
  const CURRENCY_SYM = { USD:"$", EUR:"€", GBP:"£", GBp:"£", JPY:"¥", CAD:"CA$", AUD:"A$" };
  const cur       = eur ? "€" : (isGBp ? "£" : (CURRENCY_SYM[currency] || currency));
  const fmtAmt    = v => v == null ? "—" : (v>=0?"+":"")+cur+(Math.abs(v)>=100 ? Math.round(Math.abs(v)).toLocaleString("fr-FR") : Math.abs(v).toFixed(2));
  const fmtPct    = v => v == null ? "—" : (v>=0?"+":"")+(Math.abs(v)*100).toFixed(2)+"%";
  const fmtPriceV = v => v == null ? "—" : cur+(v>=100 ? Math.round(v).toLocaleString("fr-FR") : v.toFixed(2));

  // Chart
  const candles = data?.candles || [];
  const closes  = candles.map(c=>c.c).filter(v=>v!=null);
  const W=320, H=110, PAD=6;
  const minV = Math.min(...closes), maxV = Math.max(...closes);
  const rng  = maxV - minV || 1;
  const toY  = v => PAD + (1-(v-minV)/rng)*(H-PAD*2);
  const toX  = (i,n) => PAD + (i/(n-1||1))*(W-PAD*2);
  const pts  = closes.map((v,i)=>toX(i,closes.length)+","+toY(v)).join(" ");
  const isUp = closes.length >= 2 ? closes[closes.length-1] >= closes[0] : true;
  const lineColor = isUp ? C.green : C.red;

  const fmtTs = ts => {
    const d = new Date(ts);
    const lbl = TF_CONFIG[tf].label;
    if(lbl==="1h")  return d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0");
    if(lbl==="4h")  return d.getDate()+"/"+(d.getMonth()+1)+" "+d.getHours()+"h";
    if(["1J","1S"].includes(lbl)) return d.getDate()+"/"+(d.getMonth()+1);
    return (d.getMonth()+1)+"/"+d.getFullYear().toString().slice(2);
  };
  const xIdxs = closes.length > 1
    ? [0, Math.floor(closes.length/4), Math.floor(closes.length/2), Math.floor(3*closes.length/4), closes.length-1]
        .filter((v,i,a)=>a.indexOf(v)===i)
    : [];

  const cc   = data?.exchangeCC || "US";
  const flag = FLAG[cc] || "🏳️";
  const city = data?.exchangeCity || data?.exchange || "";
  const mktCap = fmtMktCap(data?.marketCap);
  // quoteType : si Yahoo retourne EQUITY mais le nom contient ETC/ETF/UCITS → forcer ETF
  const rawQuoteType = data?.quoteType || "";
  const nameL = (data?.name || "").toLowerCase();
  const quoteType = (rawQuoteType === "EQUITY" && (
    nameL.includes("etc") || nameL.includes("etf") || nameL.includes("ucits") ||
    nameL.includes("physical") || nameL.includes("tracker") || nameL.includes("index fund") ||
    nameL.includes("amundi") || nameL.includes("ishares") || nameL.includes("lyxor") || nameL.includes("xtrackers")
  )) ? "ETF" : rawQuoteType;
  const sector    = data?.sector || "";

  // Timeframes en 2 rangées (5 + 3)
  const TF_ROW1 = TF_CONFIG.slice(0,5);
  const TF_ROW2 = TF_CONFIG.slice(5);

  const sortedNews = scoreNews(data?.news);

  // ── Swipe-to-close : en haut du scroll OU geste suffisant n'importe où ──────
  const onSheetTouchStart = e => {
    touchStartY.current = e.touches[0].clientY;
    setDragY(0);
  };
  const onSheetTouchMove = e => {
    const sheet = sheetRef.current;
    const dy = e.touches[0].clientY - (touchStartY.current || 0);
    const atTop = sheet && sheet.scrollTop <= 2;
    // Swipe-to-close si on est tout en haut, ou si geste > 60px n'importe où
    if(dy > 0 && (atTop || dy > 60)) {
      e.preventDefault();
      // Résistance légère : quasi 1:1 pour un geste naturel
      const resistance = dy * 0.75;
      setDragY(resistance);
    }
  };
  const onSheetTouchEnd = () => {
    // Seuil abaissé à 50px résistants (~67px de geste réel)
    if(dragY > 50) { onClose(); }
    else { setDragY(0); }
    touchStartY.current = null;
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:`rgba(0,0,0,${Math.max(0, 0.75 - dragY/300)})`,
      display:"flex", alignItems:"flex-end",
    }} onClick={onClose}>
      <div
        ref={sheetRef}
        onClick={e=>e.stopPropagation()}
        onTouchStart={onSheetTouchStart}
        onTouchMove={onSheetTouchMove}
        onTouchEnd={onSheetTouchEnd}
        style={{
          width:"100%", background:C.bg0, borderRadius:"20px 20px 0 0",
          paddingBottom:36, maxHeight:"88vh", overflowY:"auto",
          transform:`translateY(${dragY}px)`,
          transition: dragY===0 ? "transform 0.25s cubic-bezier(0.32,0.72,0,1)" : "none",
          WebkitOverflowScrolling: "touch",
        }}>
        {/* Handle visuel — indication de swipe */}
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 8px"}}>
          <div style={{width:36,height:4,borderRadius:2,
            background:dragY>50?C.red:C.border,
            transform:`scaleX(${1 + dragY/200})`,
            transition:"background 0.15s, transform 0.1s"}}/>
        </div>

        {/* Header — ticker + nom + flag */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"4px 18px 10px"}}>
          <div style={{flex:1,minWidth:0}}>
            {/* Ticker grand + logo + nom YF petit */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {(()=>{
                // Priorité : icône user → logo fmp ICON_DB → logoUrl API
                const db = ICON_DB[ticker];
                const logoSrc = db?.user ? null : (db?.fmp || data?.logoUrl);
                const userIcon = db?.user;
                if(userIcon) return(
                  <span style={{fontSize:24,lineHeight:1}}>{userIcon}</span>
                );
                if(logoSrc) return(
                  <img src={logoSrc} alt={ticker}
                    style={{width:28,height:28,borderRadius:6,objectFit:"contain",
                      background:C.bg2,border:`1px solid ${C.border}`,flexShrink:0}}
                    onError={e=>{e.target.style.display="none";}}/>
                );
                return null;
              })()}
              <span style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5}}>{ticker}</span>
              {isCrypto && data?.rank && (
                <span style={{fontSize:12,fontWeight:700,color:C.btc,background:C.btc+"22",
                  borderRadius:6,padding:"2px 7px",flexShrink:0}}>#{data.rank}</span>
              )}
              {data?.name
                ? <span style={{fontSize:11,color:C.gray,fontWeight:400,flexShrink:1,minWidth:0}}>{data.name}</span>
                : loading && <span style={{fontSize:11,color:C.border}}>…</span>
              }
            </div>

            {/* Badges : type d'actif + secteur/catégorie + industrie/sous-secteur */}
            {(quoteType || sector || data?.industry) && (
              <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                {quoteType && (()=>{
                  const QT_COLOR = {
                    EQUITY:"#10B981", ETF:"#1E40AF", MUTUALFUND:"#8B5CF6",
                    CRYPTOCURRENCY:"#F7931A", CRYPTO:"#F7931A", INDEX:"#6B7280", CURRENCY:"#EAB308",
                  };
                  const qc = QT_COLOR[quoteType] || C.teal;
                  return (
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:5,
                      background:qc+"22",color:qc,border:`1px solid ${qc}55`}}>
                      {quoteType === "CRYPTO" ? "CRYPTO" : quoteType}
                    </span>
                  );
                })()}
                {sector && (
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,
                    background:C.teal+"18",color:C.teal,border:`1px solid ${C.teal}44`}}>
                    {sector}
                  </span>
                )}
                {data?.industry && (
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,
                    background:C.gold+"18",color:C.gold,border:`1px solid ${C.gold}44`}}>
                    {data.industry}
                  </span>
                )}
              </div>
            )}

            {/* Données spécifiques crypto : supply + dominance BTC */}
            {isCrypto && data && (
              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
                {/* Circulating / Max supply */}
                {data.circulatingSupply != null && (
                  <span style={{fontSize:9,color:C.text3}}>
                    Supply:{" "}
                    <span style={{color:C.text,fontWeight:700}}>
                      {(data.circulatingSupply/1e6).toFixed(2)}M
                    </span>
                    {data.maxSupply
                      ? <span style={{color:C.btc}}>{" / "}{(data.maxSupply/1e6).toFixed(2)}M ({((data.circulatingSupply/data.maxSupply)*100).toFixed(1)}%)</span>
                      : data.totalSupply
                        ? <span style={{color:C.gray}}>{" / "}{(data.totalSupply/1e6).toFixed(2)}M ({((data.circulatingSupply/data.totalSupply)*100).toFixed(1)}%)</span>
                        : null
                    }
                  </span>
                )}
                {/* Dominance BTC */}
                {data.btcDominance != null && (
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:5,
                    background:C.btc+"22",color:C.btc,border:`1px solid ${C.btc}44`}}>
                    Dom. {data.btcDominance.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Drapeau + bouton fermer */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                <button onClick={e=>{e.stopPropagation();setShowCity(!showCity);}} style={{
                  background:"transparent",border:"none",fontSize:22,cursor:"pointer",padding:"2px 4px",lineHeight:1,
                }}>{flag}</button>
                {/* Soleil si REGULAR, lune sinon */}
                {data?.marketState && (
                  <span style={{fontSize:12,lineHeight:1}} title={data.marketState}>
                    {data.marketState === "REGULAR" ? "☀️" : "🌙"}
                  </span>
                )}
              </div>
              {showCity && (
                <div style={{
                  position:"absolute",right:0,top:"110%",background:C.bg2,border:`1px solid ${C.border}`,
                  borderRadius:10,padding:"10px 14px",whiteSpace:"nowrap",zIndex:10,
                  minWidth:170,boxShadow:"0 4px 20px #0006",
                }}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:6}}>{city || "—"}</div>
                  {data?.marketState && (() => {
                    const isOpen = data.marketState === "REGULAR";
                    const stateLabel = {
                      REGULAR:"Marché ouvert", PRE:"Pré-marché", POST:"Après clôture",
                      PREPRE:"Pré-ouverture", POSTPOST:"Après clôture", CLOSED:"Fermé"
                    }[data.marketState] || data.marketState;
                    return (
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:14}}>{isOpen ? "☀️" : "🌙"}</span>
                        <span style={{fontSize:10,fontWeight:600,color:isOpen?C.green:C.text3}}>
                          {stateLabel}
                        </span>
                      </div>
                    );
                  })()}
                  {data?.exchangeTz && (
                    <div style={{fontSize:9,color:C.text3,marginTop:2}}>{data.exchangeTz}</div>
                  )}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",color:C.gray,fontSize:20,cursor:"pointer",padding:"2px 6px"}}>✕</button>
          </div>
        </div>

        <div style={{padding:"0 16px"}}>
          {/* Prix live + P&L 1d */}
          {!loading && !err && price != null && (
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-1}}>
                {fmtPriceV(priceDisp)}
              </span>
              {pnl1d != null && (
                <span style={{fontSize:13,fontWeight:700,color:pnl1d>=0?C.green:C.red}}>
                  {fmtAmt(pnl1d)}
                </span>
              )}
              {pct1d != null && (
                <span style={{fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:6,
                  background:pct1d>=0?C.green+"22":C.red+"22",color:pct1d>=0?C.green:C.red}}>
                  {fmtPct(pct1d)}
                </span>
              )}
            </div>
          )}

          {/* Debug info — visible si marketCap manquant */}
          {data && !isCrypto && quoteType !== "ETF" && (data._yahooDebug || data._fmpDebug) && (() => {
            const d = data._yahooDebug || data._fmpDebug;
            // N'afficher le debug que si on a une vraie erreur de fetch (pas juste des données nulles)
            // v23.02 — ne montrer le debug que si le chargement a VRAIMENT échoué.
            // Un fcStatus 404 sur l'étape crumb est bénin si quoteSummary a renvoyé
            // un résultat (hasResult:true) : les données sont chargées via le fallback.
            const hasRealError = !d.hasResult && (d.fcStatus === 404 || (d.qsStatus && d.qsStatus !== 200) || d.qsErr || d.error);
            if(!hasRealError) return null;
            return (
            <div style={{background:C.orange+"22",border:`1px solid ${C.orange}44`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:9,color:C.orange}}>
              <b>Debug Yahoo:</b>
              <div>step:{d.step} fcStatus:{d.fcStatus} crumb:{d.crumb}</div>
              <div>qsStatus:{d.qsStatus} qsLen:{d.qsLen} hasResult:{String(d.hasResult)}</div>
              {d.qsErr && <div>qsErr:{d.qsErr}</div>}
              {d.error && <div>error:{d.error}</div>}
              <div style={{marginTop:3}}>
                {["marketCap","volAvg","sector","industry","divRate","divDate","etfCategory","holdingsCount","change","logo"]
                  .map(k=><span key={k} style={{marginRight:5,color:d[k]&&d[k]!=="null"&&d[k]!=="not_in_yahoo"?C.green:C.text3}}>{k}:{d[k]||"?"}</span>)}
              </div>
            </div>
            );
          })()}

          {/* ── Cases de données fondamentales sous le prix ── */}
          {data && (() => {
            const fmtMC = v => {
              if(!v) return null;
              const vv = eur ? (isEUR || isGBp ? v : v * usdEur) : v;
              const sym = eur ? "€" : "$";
              if(vv >= 1e12) return sym + (vv/1e12).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}) + " Bil.";
              if(vv >= 1e9)  return sym + (vv/1e9).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}) + " Mrd.";
              if(vv >= 1e6)  return sym + (vv/1e6).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) + " M";
              return sym + vv.toLocaleString("fr-FR");
            };
            const fmtVol = v => {
              if(!v) return null;
              if(v >= 1e6) return (v/1e6).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1}) + "M";
              if(v >= 1e3) return (v/1e3).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) + "k";
              return v.toLocaleString("fr-FR");
            };
            const dbg = data._yahooDebug || data._fmpDebug || {};
            const isETF = quoteType === "ETF" || quoteType === "ETC";
            // 3 cases sur 1 ligne — contenu différent selon crypto ou action/ETF
            const cases = isCrypto ? [
              { label:"Cap. marché",
                value: fmtMC(data.marketCap), color:C.text, err:null, dash:!data.marketCap },
              { label:"Vol. 24h",
                value: fmtVol(data.volume24h), color:C.text2, err:null, dash:!data.volume24h },
              { label:"ATH",
                value: data.ath
                  ? cur+(data.ath>=1000?Math.round(data.ath).toLocaleString("fr-FR"):data.ath.toFixed(2))
                    +(data.athChangesPct!=null?" ("+data.athChangesPct.toFixed(1)+"%)":" ")
                  : null,
                color: data.athChangesPct!=null&&data.athChangesPct>=-10 ? C.green : C.text3,
                err:null, dash:!data.ath },
            ] : [
              { label: isETF && !data.marketCap ? "AUM" : "Cap. boursière",
                value: fmtMC(data.marketCap),
                color: C.text,
                err: null,                          // plus jamais d'orange ici
                dash: !data.marketCap,              // — pour tout ticker sans marketCap
              },
              { label:"Vol. moyen",     value: fmtVol(data.volAvg),   color:C.text2,
                err: !data.volAvg    ? (dbg.volAvg    || "null") : null },
              { label:"Dernier div.",
                value: (eur?"€":"$") + (data.lastDiv != null ? Number(data.lastDiv).toFixed(2) : "0.00"),
                color: data.lastDiv > 0 ? C.green : C.text3,
                sub: data.lastDivDate || null, err: null },
            ];
            return (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
                {cases.map((item, i) => (
                  <div key={i} style={{
                    background: item.err ? C.orange+"11" : C.bg1,
                    border:`1px solid ${item.err ? C.orange+"44" : C.border}`,
                    borderRadius:10, padding:"8px 10px",
                    display:"flex",flexDirection:"column",gap:2,
                  }}>
                    <span style={{fontSize:8,color:C.text3,fontWeight:500,textTransform:"uppercase",letterSpacing:0.4}}>
                      {item.label}
                    </span>
                    {item.value
                      ? <>
                          <span style={{fontSize:12,fontWeight:700,color:item.color}}>{item.value}</span>
                          {item.sub && <span style={{fontSize:8,color:C.text3}}>{item.sub}</span>}
                        </>
                      : item.dash
                        ? <span style={{fontSize:12,fontWeight:700,color:C.text3}}>—</span>
                        : <span style={{fontSize:7,color:C.orange,fontFamily:"monospace",marginTop:2}}>
                            {dbg.qsStatus ? "qs:" + dbg.qsStatus + " · " + (item.err||"") : "En attente…"}
                          </span>
                    }
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Blocs ETF : catégorie + top holdings ── */}
          {quoteType === "ETF" && (() => {
            const etfDbg = data?._yahooDebug || data?._etfDebug || {};
            const hasHoldings = data?.topHoldings && data.topHoldings.length > 0;
            return (
              <>
                {/* Cadre top holdings — accordéon */}
                <div style={{marginBottom:14}}>
                  <button
                    onClick={() => setHoldingsOpen(o => !o)}
                    style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      width:"100%",background:holdingsOpen ? C.teal+"15" : C.bg3,
                      border:`1px solid ${holdingsOpen ? C.teal+"88" : C.border}`,
                      borderRadius:8, cursor:"pointer",
                      padding:"8px 12px", textAlign:"left",
                      marginBottom: holdingsOpen ? 6 : 0,
                    }}
                  >
                    <span style={{fontSize:11, color: holdingsOpen ? C.teal : C.text, fontWeight:700, letterSpacing:0.3}}>
                      📊 Top Holdings
                      {hasHoldings && (
                        <span style={{marginLeft:6, fontSize:10, color: holdingsOpen ? C.teal : C.text2, fontWeight:500}}>
                          ({data.topHoldings.length})
                        </span>
                      )}
                    </span>
                    <span style={{
                      fontSize:11, color: holdingsOpen ? C.teal : C.text2,
                      display:"inline-block",
                      transform: holdingsOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition:"transform .2s", fontWeight:700,
                    }}>▶</span>
                  </button>

                  {holdingsOpen && (
                    hasHoldings
                      ? <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                          {data.topHoldings.map((h, i) => {
                            const isLast = i === data.topHoldings.length - 1;
                            const maxPct = data.topHoldings[0]?.pct || 1;
                            const barW = h.pct ? Math.min((h.pct / maxPct) * 100, 100) : 0;
                            return (
                              <div key={i} style={{
                                display:"flex",alignItems:"center",gap:6,padding:"5px 10px",
                                borderBottom:isLast?"none":`1px solid ${C.border}`,
                                background:i%2===0?"transparent":C.bg1+"44",
                              }}>
                                <span style={{fontSize:9,color:C.text3,width:14,flexShrink:0,textAlign:"right"}}>{i+1}</span>
                                <div style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{h.name}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                                  <div style={{width:50,height:3,background:C.border,borderRadius:2}}>
                                    <div style={{width:`${barW}%`,height:"100%",background:C.teal,borderRadius:2}}/>
                                  </div>
                                  <span style={{fontSize:10,fontWeight:700,color:C.teal,minWidth:36,textAlign:"right"}}>
                                    {h.pct != null ? h.pct.toFixed(1)+"%" : "—"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      : <div style={{
                          borderRadius:10,padding:"10px 14px",
                          background:C.orange+"11",border:`1px solid ${C.orange+"44"}`,
                          fontSize:8,color:C.orange,fontFamily:"monospace",
                        }}>
                          step:{etfDbg.step} qsStatus:{etfDbg.qsStatus} crumb:{etfDbg.crumb}
                          {" "}holdings:{etfDbg.holdingsCount} qsLen:{etfDbg.qsLen}
                          {etfDbg.yfErr && <span> yfErr:{etfDbg.yfErr.slice(0,80)}</span>}
                          {etfDbg.error && <span> err:{etfDbg.error.slice(0,80)}</span>}
                        </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* Timeframes — 2 rangées */}
          <div style={{marginBottom:12}}>
            {[TF_ROW1, TF_ROW2].map((row, ri)=>(
              <div key={ri} style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:3,marginBottom:ri===0?4:0}}>
                {row.map((t,i)=>{
                  const idx = ri*5+i;
                  return (
                    <button key={idx} onClick={()=>setTf(idx)} style={{
                      flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:700,
                      border:"none",cursor:"pointer",
                      background:tf===idx?C.blue:"transparent",
                      color:tf===idx?"#fff":C.gray,
                    }}>{t.label}</button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{background:C.bg1,borderRadius:12,padding:"10px 4px 4px",marginBottom:4}}>
            {loading && (
              <div style={{height:H+20,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray,fontSize:12}}>
                Chargement…
              </div>
            )}
            {err && (
              <div style={{padding:"12px 16px",background:C.red+"11",borderRadius:8,border:`1px solid ${C.red}44`,marginBottom:4}}>
                <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:4}}>⚠ Erreur de chargement</div>
                <div style={{fontSize:10,color:C.red+"cc",wordBreak:"break-all"}}>{err}</div>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={()=>fetchChart(tf)} style={{fontSize:10,padding:"4px 12px",borderRadius:6,border:`1px solid ${C.red}`,background:"transparent",color:C.red,cursor:"pointer"}}>
                    Réessayer
                  </button>
                  <button onClick={()=>navigator.clipboard.writeText(err).catch(()=>{})} style={{fontSize:10,padding:"4px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.gray,cursor:"pointer"}}>
                    📋 Copier
                  </button>
                </div>
              </div>
            )}
            {!loading && !err && closes.length > 1 && (()=>{
              // Crosshair handlers
              const SVG_W = 320, SVG_H = H + 18;
              const hitTest = (clientX, svgEl) => {
                if(!svgEl) return null;
                const rect = svgEl.getBoundingClientRect();
                const relX = (clientX - rect.left) / rect.width * SVG_W;
                const n = closes.length;
                // Trouver l'index le plus proche
                let best = 0, bestDist = Infinity;
                for(let i=0;i<n;i++){
                  const d = Math.abs(toX(i,n) - relX);
                  if(d < bestDist){ bestDist=d; best=i; }
                }
                return { i:best, x:toX(best,n), y:toY(closes[best]), price:closes[best], ts:candles[best]?.t };
              };
              const onSvgTouchMove = e => {
                e.preventDefault();
                const ch = hitTest(e.touches[0].clientX, svgRef.current);
                if(ch) setCrosshair(ch);
              };
              const onSvgTouchEnd = () => setCrosshair(null);
              const onMouseMove = e => {
                const ch = hitTest(e.clientX, svgRef.current);
                if(ch) setCrosshair(ch);
              };
              const onMouseLeave = () => setCrosshair(null);
              const ch = crosshair;
              const gradId = "tcg_"+ticker.replace(/[^a-z0-9]/gi,"_");
              return (
                <svg ref={svgRef} width="100%" viewBox={"0 0 "+SVG_W+" "+SVG_H}
                  style={{display:"block",overflow:"visible",touchAction:"none"}}
                  onTouchMove={onSvgTouchMove} onTouchEnd={onSvgTouchEnd}
                  onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={lineColor} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polygon
                    points={pts+" "+toX(closes.length-1,closes.length)+","+(H-PAD)+" "+PAD+","+(H-PAD)}
                    fill={"url(#"+gradId+")"}
                  />
                  <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
                  {/* Labels X */}
                  {xIdxs.map((ci,i)=>(
                    <text key={i} x={toX(ci,closes.length)} y={H+15} textAnchor="middle" fill={C.text3} fontSize={7}>
                      {fmtTs(candles[ci]?.t)}
                    </text>
                  ))}
                  {/* Point dernier prix */}
                  {!ch && (()=>{
                    const lx=toX(closes.length-1,closes.length), ly=toY(closes[closes.length-1]);
                    return <circle cx={lx} cy={ly} r={3} fill={lineColor}/>;
                  })()}
                  {/* Crosshair */}
                  {ch && (<>
                    {/* Ligne verticale */}
                    <line x1={ch.x} y1={PAD} x2={ch.x} y2={H-PAD}
                      stroke={lineColor} strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
                    {/* Ligne horizontale */}
                    <line x1={PAD} y1={ch.y} x2={SVG_W-PAD} y2={ch.y}
                      stroke={lineColor} strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
                    {/* Point */}
                    <circle cx={ch.x} cy={ch.y} r={4} fill={lineColor} stroke={C.bg0} strokeWidth={1.5}/>
                    {/* Label prix — axe Y gauche */}
                    {(()=>{
                      const priceDisp2 = eur ? ch.price * usdEur : ch.price;
                      const pLabel = cur + (priceDisp2 >= 100 ? Math.round(priceDisp2).toLocaleString("fr-FR") : priceDisp2.toFixed(2));
                      const labelY = Math.max(10, Math.min(ch.y + 4, H-4));
                      return (<>
                        <rect x={PAD} y={labelY-8} width={pLabel.length*5.5+4} height={11} rx={3}
                          fill={lineColor} opacity={0.9}/>
                        <text x={PAD+3} y={labelY+1} fill="#000" fontSize={7.5} fontWeight="700">{pLabel}</text>
                      </>);
                    })()}
                    {/* Label date — axe X bas */}
                    {ch.ts && (()=>{
                      const dLabel = fmtTs(ch.ts);
                      const lx2 = Math.max(20, Math.min(ch.x, SVG_W-24));
                      return (<>
                        <rect x={lx2-dLabel.length*3-2} y={H+5} width={dLabel.length*6+4} height={10} rx={3}
                          fill={lineColor} opacity={0.9}/>
                        <text x={lx2} y={H+12} textAnchor="middle" fill="#000" fontSize={7} fontWeight="700">{dLabel}</text>
                      </>);
                    })()}
                  </>)}
                </svg>
              );
            })()}
            {!loading && !err && closes.length <= 1 && (
              <div style={{height:H+20,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray,fontSize:11}}>
                Données insuffisantes
              </div>
            )}
          </div>

          {/* ── Actualités ── */}
          {sortedNews.length > 0 && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.gray,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
                Actualités
              </div>
              {sortedNews.map((n,i)=>{
                const ago = n.time ? (()=>{
                  const diff = (Date.now() - n.time) / 60000;
                  if(diff < 60)   return Math.round(diff)+"min";
                  if(diff < 1440) return Math.round(diff/60)+"h";
                  return Math.round(diff/1440)+"j";
                })() : null;
                return (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer" style={{
                    display:"flex", gap:10, padding:"10px 0",
                    borderBottom: i < sortedNews.length-1 ? `1px solid ${C.border}` : "none",
                    textDecoration:"none",
                  }}>
                    {n.thumbnail && (
                      <img src={n.thumbnail} alt="" style={{width:56,height:42,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.35,marginBottom:4,
                        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                        {n.title}
                      </div>
                      <div style={{fontSize:10,color:C.gray}}>
                        {n.publisher}{ago && <span style={{marginLeft:6,color:C.text3}}>{ago}</span>}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   PORTFOLIO SECTION ROW — cliquable, expand avec ligne détail
═══════════════════════════════════════════════════════════ */
function SectionRow({section, open, onToggle, hidden=false, eur=false, usdEur=0.852, eurUsd=1.173, onTickerClick, iconDbVersion=0, onIconSaved}){
  const {n, icon, color, totalUSD, totalEUR, pct, items} = section;
  const totalPnl = items.reduce((s,x)=>s+(x.pnl||0), 0);

  // Conversion selon mode €/$
  const cv    = v => { const n=parseFloat(v); return isNaN(n)?0: eur ? Math.round(n * usdEur) : Math.round(n); };
  const cvPnl = v => { const n=parseFloat(v); return isNaN(n)?0: eur ? Math.round(n * usdEur) : Math.round(n); };
  const cur   = eur ? "€" : "$";
  const fmtV  = v => { const n=cv(v); return (n<0?"-":"")+cur+fmtK(Math.abs(n)); };
  const fmtP2 = v => { const n=parseFloat(v); return isNaN(n)?"—":(n>=0?"+":"")+cur+fmtK(Math.abs(cvPnl(n))); };
  const fmtPrice = (n, rate=1) => { const v=n*rate; return v>=100 ? Math.round(v).toLocaleString("fr-FR") : v.toFixed(2); };
  const fmtLive = v => { const n=parseFloat(v); return isNaN(n)?"—":(eur ? "€"+fmtPrice(n,usdEur) : "$"+fmtPrice(n)); };
  const fmtPA   = v => { const n=parseFloat(v); return isNaN(n)?"—":(eur ? "€"+fmtPrice(n,usdEur) : "$"+fmtPrice(n)); };
  const barPct  = Math.min(Math.max(pct, 0), 100);  // 0% si négatif, 100% max

  return(
    <div style={{marginBottom:6}}>
      {/* Header row — clickable */}
      <button
        onClick={onToggle}
        style={{
          width:"100%", background: open ? color+"18" : C.bg1,
          border:`1px solid ${open ? color+"55" : C.border}`,
          borderRadius: open ? "12px 12px 0 0" : 12,
          padding:"12px 14px", cursor:"pointer", display:"flex",
          alignItems:"center", gap:12, transition:"all .18s",
        }}
      >
        {/* Icon */}
        <div style={{
          width:38, height:38, borderRadius:10, flexShrink:0,
          background: color+"22", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:18,
        }}>{icon}</div>

        {/* Name + bar */}
        <div style={{flex:1, textAlign:"left"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:14, fontWeight:800, color: open ? color : C.text}}>{n}</span>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{fontSize:11,fontWeight:700,color:totalPnl>=0?C.green:C.red}}>
                {msk(fmtP2(totalPnl),hidden)}
              </span>
              <span style={{fontSize:14,fontWeight:800,color:C.text}}>
                {msk(fmtV(totalUSD),hidden)}
              </span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginTop:5}}>
            <div style={{flex:1, background:C.bg3, borderRadius:3, height:4}}>
              <div style={{height:4, borderRadius:3, background:color, width:barPct+"%", transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:10, color:pct<0?C.red:color, fontWeight:700, flexShrink:0}}>{pct.toFixed(1)}%</span>
            <span style={{fontSize:11, color: open?"#fff":C.text3, transition:"transform .2s",
              display:"inline-block", transform: open?"rotate(180deg)":"rotate(0deg)"}}>
              ▾
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div style={{
          background: C.bg2, border:`1px solid ${color+"44"}`,
          borderTop:"none", borderRadius:"0 0 12px 12px",
          overflow:"hidden",
        }}>
          {/* Line items */}
          {items.map((item,i)=>{
            const isLast=i===items.length-1;
            const pnlPct=item.pct??(item.pnl&&item.investi?item.pnl/item.investi:null);
            return(
              <div key={i} onClick={()=>item.ticker&&onTickerClick&&onTickerClick(item.ticker, item.cat)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderBottom:isLast?"none":`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg1+"66",cursor:item.ticker?"pointer":"default"}}>
                {/* Icon — TickerIcon si ticker connu, sinon fallback BankLogo/emoji */}
                {(()=>{
                  // Logos SVG custom uniquement pour KUCOIN (pas de ticker boursier, logo SVG maison)
                  // BCI, Bourso, DeBlock → TickerIcon avec leur logo .fmp depuis BANK_LOGOS
                  const SVG_ONLY = ["KUCOIN"];
                  const Logo = item.iconComponent && SVG_ONLY.includes(item.ticker)
                    ? BankLogo[item.iconComponent] : null;
                  if(Logo) return(
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      <Logo/>
                    </div>
                  );
                  // Tous les autres tickers (y compris IBKR, USD, EURO, STRC, BCI, Bourso, DeBlock…) → TickerIcon
                  if(item.ticker && !SVG_ONLY.includes(item.ticker)){
                    return(
                      <TickerIcon
                        ticker={item.ticker}
                        size={32}
                        color={color+"22"}
                        iconDbVersion={iconDbVersion}
                        onIconSaved={onIconSaved}
                      />
                    );
                  }
                  return(
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      {item.icon||item.ticker?.slice(0,4)}
                    </div>
                  );
                })()}

                {/* Main info — nouvelle disposition compacte */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    {/* Gauche : ticker/label + live */}
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{item.label||item.ticker}</span>
                        {item.live!=null&&item.live!==false&&(
                          <span style={{fontSize:11,fontWeight:700,color:color}}>
                            {fmtLive(item.live)}
                          </span>
                        )}
                      </div>
                      {/* Qty + PA sur la même ligne */}
                      {(item.qty!=null||item.pa!=null)&&(
                        <div style={{display:"flex",gap:8,marginTop:2}}>
                          {item.qty!=null&&(
                            <span style={{fontSize:10,color:C.gray}}>
                              <b style={{color:C.text3}}>{item.qty}</b> parts
                            </span>
                          )}
                          {item.pa!=null&&item.pa!==false&&(
                            <span style={{fontSize:10,color:C.gray}}>
                              PA <b style={{color:C.text3}}>{fmtPA(item.pa)}</b>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Droite : valeur + P&L */}
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:C.text}}>
                        {hidden?"***":(item.valUSD===0?"$0":fmtV(item.valUSD))}
                      </div>

                      {item.pnl!==undefined&&item.pnl!==null&&(
                        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:2}}>
                          <span style={{fontSize:11,fontWeight:800,color:item.pnl>=0?C.green:C.red}}>
                            {hidden?"***":fmtP2(item.pnl)}
                          </span>
                          {pnlPct!==null&&(
                            <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:5,
                              background:item.pnl>=0?C.green+"22":C.red+"22",color:item.pnl>=0?C.green:C.red}}>
                              {fmtP(pnlPct)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GDB COMPARE CHART
   Left axis  (base 100 = début de la timeframe) : GDB.S • GDB.C
   Right axis (montant en €/$ selon eur)         : Patrimoine total
   La valeur finale = exactement celle affichée en haut
═══════════════════════════════════════════════════════════ */
function GdbCompareChart({eur, setEur, EFF, tf, setTF, onSparkData, chartData, liveDD, liveGDBS, liveGC}){
  const _DD=liveDD||DD;
  const _GDBS=liveGDBS||GDBS;
  const _GC=liveGC||GC_FULL;
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [full, setFull] = useState(false);
  // tf et setTF viennent du parent (PageOverview) pour synchroniser avec le card

  const src = EFF||CURRENT;

  // Valeurs live depuis EFF (ou CURRENT si pas encore refreshé)
  const {gdbC: gcLive, gdbS: gsLive} = calcGdbPrices(src);
  const portTodayEUR = src.totalEUR;
  const portTodayUSD = src.totalUSD;
  const portToday = eur ? portTodayEUR : portTodayUSD;
  const cur = eur ? "€" : "$";

  /* ── Cutoff dynamique ── */
  const cutoff = days => {
    const d = new Date(Date.now() + NC_OFFSET_MS);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0,10);
  };
  const today = todayNC();
  const tfCut = { "1W":cutoff(7), "1M":cutoff(31), "MTD":today.slice(0,7)+"-01", "YTD":today.slice(0,4)+"-01-01", "1Y":cutoff(365), "2Y":cutoff(730), "ALL":"2020-01-01" };
  const cut = tfCut[tf] || "2020-01-01";

  // ── Séries enrichies avec le point live ──────────────────────────────────
  // _GDBS étendu avec le point live si sa date > dernier point _GDBS
  const gdbs_last = _GDBS[_GDBS.length-1]?.[0] || "2026-01-01";
  const gdbs_ext = today > gdbs_last
    ? [..._GDBS, [today, gsLive, gcLive]]
    : _GDBS.map(r=>r[0]===today ? [today, gsLive, gcLive] : r);

  // PORT_B100 étendu avec le point live
  // ── Portfolio : utilise _DD directement (col 2 = total hors immo €)
  const dd_last = _DD[_DD.length-1]?.[0] || "2026-01-01";
  const dd_ext = today > dd_last
    ? [..._DD, [today, null, portTodayEUR, null, null]]
    : _DD.map(r=>r[0]===today ? [today, r[1], portTodayEUR, r[3], r[4]] : r);

  const gSlice = gdbs_ext.filter(r => r[0] >= cut && r[0] <= today);
  const ddSlice = dd_ext.filter(r => r[0] >= cut && r[0] <= today && r[2] != null);

  if (!gSlice.length) return null;
  const dates = gSlice.map(r => r[0]);
  const n = dates.length;
  if (n < 2) return null;

  /* ── GDB.S and GDB.C → base 100 from slice start ── */
  const gs0 = gSlice[0][1], gc0 = gSlice[0][2];
  const gsB = gSlice.map(r => round2(r[1] / gs0 * 100));
  const gcB = gSlice.map(r => round2(r[2] / gc0 * 100));

  /* ── Portfolio → valeurs absolues depuis _DD (€), converties si $ ── */
  const ddByDate = {};
  ddSlice.forEach(r => { ddByDate[r[0]] = r[2]; });
  // Pour les dates sans point _DD exact, cherche le plus proche précédent
  const portAbs = dates.map(d => {
    const eur_val = ddByDate[d] ?? _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=d&&r[2]!=null?r[2]:null),null);
    if(eur_val==null) return null;
    // Use historical usdEur from _DD[5] if available, otherwise from chartData snapshot, else src rate
    const ddRow_full = _DD.find(r=>r[0]===d);
    const snap_eur = chartData?.find(s=>s.d===d)?.eur;
    const hist_usdEur = ddRow_full?.[5] || snap_eur || src.usdEur;
    const hist_eurUsd = 1 / hist_usdEur;
    return eur ? Math.round(eur_val) : Math.round(eur_val * hist_eurUsd);
  });

  // Dernier point = valeur live exacte
  if (portAbs.length > 0) portAbs[portAbs.length - 1] = portToday;

  const p0abs = portAbs.find(v => v != null);
  const portB = portAbs.map(v => v != null && p0abs ? round2(v / p0abs * 100) : null);

  // Exposer portAbs au parent pour la sparkline
  useEffect(()=>{ onSparkData&&onSparkData(portAbs); }, [tf, portAbs.join(",")]); // eslint-disable-line

  /* ── SVG geometry ── */
  const W = 300, H = 96, PAD_L = 30, PAD_R = 38;
  const IW = W - PAD_L - PAD_R;

  const leftVals = [...gsB, ...gcB].filter(v => v != null);
  const portBVals = portB.filter(v => v != null);
  const allVals = [...leftVals, ...portBVals];
  const gMin = Math.min(...allVals), gMax = Math.max(...allVals);
  const gRng = gMax - gMin || 1;

  const px = i => PAD_L + (i / (n - 1)) * IW;
  const py = v => v == null ? null : H - ((v - gMin) / gRng) * (H - 4) + 2;

  const makeLine = (vals, color, bold) => {
    const pts = vals.map((v, i) => v != null ? `${px(i)},${py(v)}` : null).filter(Boolean).join(" ");
    return pts ? <polyline points={pts} fill="none" stroke={color}
      strokeWidth={full?(bold?1.2:0.7):(bold?2.2:1.6)} opacity={hover!=null?0.5:(full?0.8:0.92)}/> : null;
  };

  /* ── Interaction ── */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PAD_L;
    return Math.min(n - 1, Math.max(0, Math.round(svgX / (IW / (n - 1)))));
  };
  const onMove = e => { if (!svgRef.current) return; setHover({ i: getIdx(e.clientX, svgRef.current.getBoundingClientRect()) }); };
  const _tm2=useRef(false),_ts2=useRef(0);
  const onTouch = e => { e.preventDefault(); if (!svgRef.current) return; const t=e.touches[0]||e.changedTouches[0]; if(e.type==="touchstart"){_tm2.current=false;_ts2.current=t.clientX;}else{_tm2.current=Math.abs(t.clientX-_ts2.current)>4;} setHover({ i: getIdx(t.clientX, svgRef.current.getBoundingClientRect()) }); };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm2.current)setHover(null);};

  /* ── Hover values ── */
  const hi = hover?.i;
  const hDate  = hi != null ? dates[hi] : null;
  const hGs    = hi != null ? gSlice[hi]?.[1] : null;   // GDB.S $ actual
  const hGc    = hi != null ? gSlice[hi]?.[2] : null;   // GDB.C $ actual
  const hGsB   = hi != null ? gsB[hi] : null;
  const hGcB   = hi != null ? gcB[hi] : null;
  const hPortAbs = hi != null ? portAbs[hi] : null;      // already in €/$ per eur flag
  const hPortB   = hi != null ? portB[hi] : null;

  // Format GDB price: always $, or convert to € if eur mode
  const fmtGdb = v => v == null ? null : eur ? `€${(v * CURRENT.usdEur).toFixed(2)}` : `$${v.toFixed(2)}`;

  /* ── Axis labels ── */
  const xLabel = d => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return (tf==="1W"||tf==="1M"||tf==="MTD") ? `${parseInt(day)}/${m}` : `${m}/${y.slice(2)}`;
  };
  const gridVals = [gMin, (gMin + gMax) / 2, gMax];

  // Right axis: convert base-100 grid value back to absolute portfolio value
  const b100ToPort = b => Math.round(b / 100 * p0abs);

  const vw = typeof window!=="undefined"?window.innerWidth:390;
  const vh = typeof window!=="undefined"?window.innerHeight:844;

  /* ── Contenu du graphique (partagé entre normal et fullscreen) ── */
  const chartContent = (hFull) => (
    <>
      {/* Timeframe selector + bouton € */}
      <div style={{display:"flex",gap:3,marginBottom:10,alignItems:"center"}}>
        {["1W","1M","MTD","YTD","1Y","2Y","ALL"].map(t=>(
          <button key={t} onClick={()=>{setTF(t);setHover(null);}} style={{
            flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
            border:"none",cursor:"pointer",
            background:tf===t?C.btc:"transparent",
            color:tf===t?"#000":C.gray,
          }}>{t}</button>
        ))}
        {/* Séparateur */}
        <div style={{width:1,height:16,background:C.border,margin:"0 2px"}}/>
        {/* Bouton € / $ */}
        {setEur&&(
          <button onClick={()=>setEur(!eur)} style={{
            padding:"4px 7px",borderRadius:6,fontSize:10,fontWeight:800,
            border:`1px solid ${eur?C.btc:C.border}`,cursor:"pointer",
            background:eur?C.btc+"22":"transparent",
            color:eur?C.btc:C.gray,
            flexShrink:0,
          }}>{eur?"€":"$"}</button>
        )}
      </div>

      {/* Tooltip flottant — position fixed au dessus du titre */}
      {hover != null && (
        <div style={{
          position:"fixed", top:240, left:"50%", transform:"translateX(-50%)",
          zIndex:200, width:"92%", maxWidth:410,
          background:"rgba(10,12,18,0.97)", border:`1px solid ${C.border2}`,
          borderRadius:10, padding:"7px 12px",
          display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center",
          boxShadow:"0 6px 24px rgba(0,0,0,.85)",
          pointerEvents:"none",
        }}>
          <div style={{fontSize:11,color:"#fff",fontWeight:800,width:"100%",textAlign:"center",marginBottom:1}}>
            {fmtDate(hDate)}
          </div>
          {[
            {color:C.orange, label:"CGIC", val:fmtGdb(hGc), sub:hGcB!=null?`base ${hGcB.toFixed(1)}`:null},
            {color:C.blue,   label:"CGIS", val:fmtGdb(hGs), sub:hGsB!=null?`base ${hGsB.toFixed(1)}`:null},
            {color:C.green,  label:"Portefeuille", val:hPortAbs!=null?`${cur}${fmtK(hPortAbs)}`:null, sub:hPortB!=null?`base ${hPortB.toFixed(1)}`:null},
          ].filter(x=>x.val).map((x,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:x.color}}/>
                <span style={{fontSize:10,color:C.text2}}>{x.label}</span>
              </div>
              <span style={{fontSize:13,fontWeight:800,color:x.color}}>{x.val}</span>
              {x.sub&&<span style={{fontSize:9,color:C.gray}}>{x.sub}</span>}
            </div>
          ))}
        </div>
      )}
      <div style={{position:"relative"}}>

      {/* SVG */}
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H + 22}`}
        style={{ overflow: "visible", touchAction: "none", userSelect: "none" }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke={C.border} strokeWidth={0.4}/>
            <text x={PAD_L - 3} y={py(v) + 3} textAnchor="end" fill={C.text3} fontSize={6}>{v.toFixed(0)}</text>
          </g>
        ))}
        {p0abs != null && gridVals.map((v, i) => (
          <text key={i} x={W - PAD_R + 3} y={py(v) + 3} textAnchor="start" fill={C.green} fontSize={5.5} opacity={0.75}>
            {cur}{fmtK(b100ToPort(v))}
          </text>
        ))}
        <line x1={PAD_L} y1={py(100)} x2={W - PAD_R} y2={py(100)} stroke="rgba(255,255,255,.1)" strokeWidth={0.8} strokeDasharray="4,4"/>
        {makeLine(gcB, C.orange, true)}
        {makeLine(gsB, C.blue, true)}
        {makeLine(portB, C.green, false)}
        {hover != null && hi != null && (
          <g>
            <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
            {[[gcB,C.orange],[gsB,C.blue],[portB,C.green]].map(([vals, color], si) => {
              const v = vals[hi]; if (v == null) return null;
              return <g key={si}>
                <circle cx={px(hi)} cy={py(v)} r={4.5} fill={C.bg1} stroke={color} strokeWidth={2}/>
                <circle cx={px(hi)} cy={py(v)} r={1.8} fill={color}/>
              </g>;
            })}
          </g>
        )}
        {dates.map((d, i) => {
          const isFirst=i===0, isLast=i===n-1, isHov=hover?.i===i;
          const step = Math.max(1, Math.floor(n / 5));
          if (!isFirst && !isLast && !isHov && i % step !== 0) return null;
          return <text key={i} x={px(i)} y={H + 13} textAnchor="middle"
            fill={isHov ? "#fff" : C.text3} fontSize={isHov ? 6.5 : 5.5} fontWeight={isHov ? 700 : 400}>
            {xLabel(d)}
          </text>;
        })}
      </svg>

      </div>{/* end tooltip wrapper */}
      {/* Legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 2, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
        {[
          { color: C.orange, label: `CGIC ${eur?"€"+(gcLive*src.usdEur).toFixed(2):"$"+gcLive.toFixed(2)}` },
          { color: C.blue,   label: `CGIS ${eur?"€"+(gsLive*src.usdEur).toFixed(2):"$"+gsLive.toFixed(2)}` },
          { color: C.green,  label: `Patrimoine ${cur}${fmtK(portToday)}` },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 2, background: l.color, borderRadius: 1 }}/>
            <span style={{ fontSize: 9, color: C.gray }}>{l.label}</span>
          </div>
        ))}
      </div>
    </>
  );

  return full ? (
    /* ── OVERLAY PLEIN ÉCRAN — orientation naturelle du téléphone ── */
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:C.bg,
      display:"flex", flexDirection:"column",
    }}>
      {/* Barre titre */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"12px 16px", flexShrink:0,
        background:C.bg1, borderBottom:`1px solid ${C.border}`,
      }}>
        <span style={{fontSize:14, fontWeight:800, color:C.btc}}>CGIC · CGIS · Patrimoine</span>
        <button onClick={()=>setFull(false)} style={{
          background:C.bg2, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"6px 14px",
          color:C.text, fontSize:12, fontWeight:700, cursor:"pointer",
        }}>✕ Fermer</button>
      </div>
      {/* Graphique plein écran */}
      <div style={{flex:1, overflowY:"auto", padding:"12px 16px"}}>
        {chartContent(true)}
      </div>
    </div>
  ) : (
    /* ── VUE NORMALE ── */
    <div style={{background:C.bg1,borderRadius:12,padding:"10px 10px 6px",border:`1px solid ${C.border}`,marginBottom:7,position:"relative"}}>
      {chartContent(false)}
      {/* Bouton plein écran — coin bas droite */}
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute",bottom:8,right:8,zIndex:10,
        background:C.bg2,border:`1px solid ${C.border}`,
        borderRadius:6,width:22,height:22,
        display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",fontSize:11,color:C.gray,lineHeight:1,
      }}>⛶</button>
    </div>
  );
}

function round2(v){ return Math.round(v * 100) / 100; }

/* ── PerfStrip: condensed P&L 1J/1S/1M + GDB.C + GDB.S ───
   Single compact row under the portfolio total header
─────────────────────────────────────────────────────── */
function PerfStrip({eur, EFF}){
  const usd=!eur;
  const _src = EFF||CURRENT;
  const rate = _src.eurUsd;
  const cur  = eur ? "€" : "$";
  // Utiliser les séries live (mises à jour par snapshots/refresh)
  const _DD   = liveDD   || DD;
  const _GDBS = liveGDBS || GDBS;
  // P&L calculés depuis _DD — col 2 = totalEUR
  const _ddAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    return _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[2]!=null?r:null),null);
  };
  const _ddLast = _DD.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r[2]:null),null);
  const _aoNow  = _src.totalEUR || _ddLast;
  // Variation : € = différence en €, $ = convertir les deux extrémités au taux de leur date
  const _pnlCell = days => {
    const ref = _ddAt(days);
    if(!ref) return {pnl:0, pct:0};
    const refEUR = ref[2];
    if(eur){
      const diff = _aoNow - refEUR;
      return {pnl:Math.round(diff), pct:refEUR?diff/refEUR:0};
    } else {
      // Convertir chaque valeur au taux de sa date
      const usdEurRef = ref[5] || _src.usdEur;
      const refUSD = Math.round(refEUR / usdEurRef);
      const nowUSD = Math.round(_aoNow / _src.usdEur);
      const diff = nowUSD - refUSD;
      return {pnl:diff, pct:refUSD?diff/refUSD:0};
    }
  };
  const _ao1j  = _ddAt(1);
  const _ao1s  = _ddAt(7);
  const _ao1m  = _ddAt(30);
  const _ao6m  = _ddAt(182);
  const _ao1y  = _ddAt(365);
  const cells = [
    { label:"1J",  ..._pnlCell(1)   },
    { label:"1S",  ..._pnlCell(7)   },
    { label:"1M",  ..._pnlCell(30)  },
    { label:"6M",  ..._pnlCell(182) },
    { label:"1A",  ..._pnlCell(365) },
  ];
  // Perfs GDB.C / GDB.S depuis _GDBS — tenant compte du taux de change si mode €
  const _gdbsAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    return _GDBS.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null);
  };
  // Taux de change à une date donnée (depuis _DD col 5)
  const _usdEurAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[5]?r:null),null);
    return row ? row[5] : _src.usdEur; // fallback taux actuel
  };
  const usdEurNow = _src.usdEur;
  const _gcNow = calcGdbPrices(_src).gdbC;
  const _gsNow = calcGdbPrices(_src).gdbS;
  // Variation : en $ = ratio pur, en € = corrigé du taux de change
  const _gcPerf = d => {
    const r=_gdbsAt(d); if(!r||!r[2]) return null;
    if(eur){
      const usdEurRef = _usdEurAt(d);
      return parseFloat((((_gcNow*usdEurNow)/(r[2]*usdEurRef))-1).toFixed(4));
    }
    return parseFloat((_gcNow/r[2]-1).toFixed(4));
  };
  const _gsPerf = d => {
    const r=_gdbsAt(d); if(!r||!r[1]) return null;
    if(eur){
      const usdEurRef = _usdEurAt(d);
      return parseFloat((((_gsNow*usdEurNow)/(r[1]*usdEurRef))-1).toFixed(4));
    }
    return parseFloat((_gsNow/r[1]-1).toFixed(4));
  };
  // GDB prices depuis _GDBS
  const _gdbs26 = _GDBS.filter(r=>r[0]>='2026-01-01');
  const {gdbS: _gsT, gdbC: _gcT} = calcGdbPrices(EFF||CURRENT);
  const gcPrice = eur ? (_gcT * (EFF||CURRENT).usdEur).toFixed(2) : _gcT.toFixed(2);
  const gsPrice = eur ? (_gsT * (EFF||CURRENT).usdEur).toFixed(2) : _gsT.toFixed(2);
  const gcCur = eur ? "€" : "$";
  const gdb = [
    { label:"CGIC", price:gcPrice, d:_gcPerf(1), w:_gcPerf(7), m:_gcPerf(30), color:C.orange },
    { label:"CGIS", price:gsPrice, d:_gsPerf(1), w:_gsPerf(7), m:_gsPerf(30), color:C.blue },
  ];
  return(
    <div style={{marginTop:10,marginBottom:10}}>
      {/* Row 1 — P&L 1J / 1S / 1M / 6M / 1A */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:6}}>
        {cells.map((c,i)=>(
          <div key={i} style={{
            background:C.bg2, borderRadius:8, padding:"6px 5px",
            border:`1px solid ${C.border}`, textAlign:"center",
          }}>
            <div style={{fontSize:8,color:C.gray,marginBottom:2}}>{c.label}</div>
            <div style={{fontSize:11,fontWeight:800,color:clr(c.pnl),letterSpacing:-.3}}>
              {c.pnl>=0?"+":""}{cur}{fmtK(Math.abs(c.pnl))}
            </div>
            <div style={{
              display:"inline-block",fontSize:8,fontWeight:700,
              color:clr(c.pct),background:clr(c.pct)+"18",
              borderRadius:3,padding:"1px 3px",marginTop:1,
            }}>{fmtP(c.pct,1)}</div>
          </div>
        ))}
      </div>
      {/* Row 2 — GDB.C and GDB.S */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {gdb.map((g,i)=>(
          <div key={i} style={{
            background:C.bg2, borderRadius:9, padding:"7px 9px",
            border:`1px solid ${C.border}`, display:"flex", gap:8, alignItems:"center",
          }}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:1}}>{g.label}</div>
              <div style={{fontSize:14,fontWeight:800,color:g.color}}>{gcCur}{g.price}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:1,alignItems:"flex-end"}}>
              {[["1J",g.d],["1S",g.w],["1M",g.m]].map(([tf,v])=>(
                <div key={tf} style={{display:"flex",alignItems:"center",gap:3}}>
                  <span style={{fontSize:8,color:C.text3,width:12}}>{tf}</span>
                  <span style={{
                    fontSize:9,fontWeight:700,color:clr(v),
                    background:clr(v)+"18",borderRadius:3,padding:"0px 4px",
                  }}>{fmtP(v,1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KpiBlock — P&L sur une timeframe ──────────────────
   pnl: valeur absolue €, pct: ratio, unit, color
─────────────────────────────────────────────────────── */
function KpiBlock({label, pnl, pct, unit="€", val, sub, color}){
  const isPos = (pnl??pct??0) >= 0;
  const c = pnl===null ? color : clr(pnl);
  return(
    <div style={{
      background:C.bg2, borderRadius:10, padding:"9px 10px",
      border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:2,
    }}>
      <div style={{fontSize:9, color:C.gray, textTransform:"uppercase", letterSpacing:.5}}>{label}</div>
      {val!=null
        ? <div style={{fontSize:14, fontWeight:800, color}}>{val}</div>
        : <div style={{fontSize:14, fontWeight:800, color:c}}>
            {(pnl??0)>=0?"+":""}{unit}{fmtK(Math.abs(pnl??0))}
          </div>
      }
      <div style={{display:"flex", alignItems:"center", gap:4}}>
        <span style={{
          fontSize:10, fontWeight:700, color: clr(pct??0),
          background: clr(pct??0)+"18", borderRadius:4, padding:"1px 5px",
        }}>
          {fmtP(pct??0)}
        </span>
        {sub && <span style={{fontSize:9, color:C.gray}}>{sub}</span>}
      </div>
    </div>
  );
}

/* ── GdbBlock — cours + 3 timeframes sur 2 lignes ──────
─────────────────────────────────────────────────────── */
function GdbBlock({label, price, d, w, m, color}){
  const rows=[["1J",d],["1S",w],["1M",m]];
  return(
    <div style={{
      background:C.bg2, borderRadius:10, padding:"9px 10px",
      border:`1px solid ${C.border}`,
    }}>
      <div style={{fontSize:9, color:C.gray, textTransform:"uppercase", letterSpacing:.5, marginBottom:3}}>{label}</div>
      <div style={{fontSize:15, fontWeight:800, color, marginBottom:5}}>${price.toFixed(2)}</div>
      <div style={{display:"flex", flexDirection:"column", gap:2}}>
        {rows.map(([tf,v])=>(
          <div key={tf} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:9, color:C.text3, width:16}}>{tf}</span>
            <span style={{
              fontSize:10, fontWeight:700, color:clr(v),
              background:clr(v)+"18", borderRadius:4, padding:"1px 6px",
            }}>{fmtP(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── buildSections: shared between Portfolio + Allocation ─ */

/* Mini SVG logos pour les banques sans emoji natif */
const BankLogo = {
  KUCOIN: () => (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect width="22" height="22" rx="5" fill="#000"/>
      <text x="11" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0EAF7C" fontFamily="Arial,sans-serif">K</text>
    </svg>
  ),

  DeBlock: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="2" y="2" width="18" height="18" rx="5" fill="#1A1A2E"/>
      <rect x="2" y="2" width="18" height="18" rx="5" fill="url(#db)" opacity="0.9"/>
      <defs>
        <linearGradient id="db" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
      <text x="11" y="15.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">D</text>
    </svg>
  ),
  Bourso: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#E8001C"/>
      <text x="11" y="15.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">Bso</text>
    </svg>
  ),
  /* KuCoin — logo vert teal */
  EURO: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#1A1A1A"/>
      <circle cx="11" cy="11" r="8" fill="none" stroke="#00D4AA" strokeWidth="2"/>
      <text x="11" y="15" textAnchor="middle" fontSize="10" fontWeight="900" fill="#00D4AA">K</text>
    </svg>
  ),
  /* IBKR — courbe blanche sur fond bleu marine */
  IBKR: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#003087"/>
      <polyline points="3,17 7,13 11,15 15,8 19,5" fill="none" stroke="#FF6B00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  /* BCI — logo stylisé rouge/blanc comme la Banque de la Réunion */
  BCI: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#C8102E"/>
      <rect x="4" y="7" width="14" height="2" rx="1" fill="white"/>
      <rect x="4" y="10" width="14" height="2" rx="1" fill="white"/>
      <rect x="4" y="13" width="14" height="2" rx="1" fill="white"/>
    </svg>
  ),
};

const TICKER_ICONS_BASE = {"BTC": "₿"};
// Proxy qui fusionne les icônes custom (CUSTOM_ICONS écrase TICKER_ICONS_BASE)
const TICKER_ICONS = new Proxy({}, {
  get(_, key){ return CUSTOM_ICONS[key] || TICKER_ICONS_BASE[key]; },
  has(_, key){ return key in CUSTOM_ICONS || key in TICKER_ICONS_BASE; },
});

// ── Helpers ICON_DB ───────────────────────────────────────────────────────────
// Synchronise CUSTOM_ICONS depuis ICON_DB (pour compatibilité Proxy ci-dessus)
function syncCustomIcons(){
  Object.keys(ICON_DB).forEach(t => {
    if(ICON_DB[t]?.user) CUSTOM_ICONS[t] = ICON_DB[t].user;
    else delete CUSTOM_ICONS[t];
  });
}
// Retourne la meilleure icône disponible pour un ticker :
//   1. icône user choisie (emoji/texte)
//   2. URL logo FMP (à afficher comme <img>)
//   3. icône base hardcodée
//   4. null (fallback catégorie)
function getBestIcon(ticker){
  const db = ICON_DB[ticker];
  if(db?.user)  return { type:"emoji", value: db.user };
  if(db?.fmp)   return { type:"img",   value: db.fmp  };
  const base = TICKER_ICONS_BASE[ticker];
  if(base)      return { type:"emoji", value: base };
  return null;
}
// Écrit dans ICON_DB, resync CUSTOM_ICONS, persiste en localStorage
function setIconDb(ticker, patch){
  ICON_DB[ticker] = { ...(ICON_DB[ticker]||{}), ...patch };
  syncCustomIcons();
  lsWriteIcons(serializeIconDb()); // persistance locale immédiate
}
// Sérialise ICON_DB pour KV (clé gdb_icons)
function serializeIconDb(){ return JSON.parse(JSON.stringify(ICON_DB)); }
// Désérialise depuis KV et resync
// Désérialise depuis KV et resync + persiste en localStorage
function loadIconDb(raw){
  if(!raw || typeof raw !== "object") return;
  // Support ancien format { ticker: "emoji" } → migration vers nouveau format
  Object.entries(raw).forEach(([t, v]) => {
    if(typeof v === "string") ICON_DB[t] = { user: v, fmp: null };
    else if(typeof v === "object" && v !== null) ICON_DB[t] = { user: v.user||null, fmp: v.fmp||null };
  });
  syncCustomIcons();
  lsWriteIcons(serializeIconDb()); // persister immédiatement en localStorage
}
// URLs logos officiels des comptes bancaires (stockés en .fmp dans ICON_DB)
const BANK_LOGOS = {};

// Injecte les logos banque dans ICON_DB (.fmp) sans écraser le choix utilisateur (.user)
function seedBankLogos(){
  Object.entries(BANK_LOGOS).forEach(([t, url]) => {
    if(!ICON_DB[t]) ICON_DB[t] = { user: null, fmp: null };
    ICON_DB[t].fmp = url; // toujours mettre à jour le fmp (URL officielle fixe)
    // .user non touché : respecte le choix de l'utilisateur
  });
  syncCustomIcons();
}

// Charge ICON_DB depuis localStorage au démarrage (avant KV, instantané)
function initIconDbFromLS(){
  const raw = lsReadIcons();
  if(raw && typeof raw === "object" && Object.keys(raw).length > 0){
    loadIconDb(raw);
  }
  // Toujours injecter les logos banque (URL fixe, même si localStorage vide)
  seedBankLogos();
  lsWriteIcons(serializeIconDb());
}
// Appel immédiat au chargement du module (avant React)
initIconDbFromLS();

/* ─── TICKER ICON COMPONENT ─────────────────────────────────────────────────
   Affiche la meilleure icône disponible pour un ticker.
   En cliquant dessus : mini-modal inline pour choisir entre user/fmp/base.
   Le clic sur le reste de la ligne déclenche le TickerModal habituel.
─────────────────────────────────────────────────────────────────────────── */
function TickerIcon({ ticker, size=32, color="#ffffff22", onIconSaved, iconDbVersion=0 }){
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [saving, setSaving] = useState(false);
  const db = ICON_DB[ticker] || {};
  const best = getBestIcon(ticker);

  const saveIcon = async (patch) => {
    setSaving(true);
    setIconDb(ticker, patch);
    try {
      await fetch(CF_WORKER_URL+"/write-bases", {
        method:"POST",
        headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
        body: JSON.stringify({ gdb_icons: serializeIconDb() }),
        signal: AbortSignal.timeout(10000),
      });
    } catch(e){}
    setSaving(false);
    setOpen(false);
    if(onIconSaved) onIconSaved(ticker);
  };

  return(
    <>
      {/* Zone icône — clic ouvre le mini-modal, ne propage pas vers le TickerModal */}
      <div
        onClick={e => { e.stopPropagation(); setUserInput(db.user||""); setOpen(true); }}
        style={{
          width:size, height:size, borderRadius:size*0.25, flexShrink:0,
          background: color, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:size*0.5, cursor:"pointer",
          position:"relative",
        }}
        title="Changer l'icône"
      >
        {best?.type==="img"
          ? <img src={best.value} alt={ticker} style={{width:"80%",height:"80%",objectFit:"contain",borderRadius:4}} onError={e=>e.target.style.display="none"}/>
          : (best?.value || ticker.slice(0,3))
        }
      </div>

      {/* Mini-modal de sélection d'icône */}
      {open && (
        <div onClick={e=>e.stopPropagation()} style={{
          position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",
          background:"#00000088",
        }}>
          <div style={{background:C.bg2,borderRadius:16,padding:"20px 18px",width:280,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px #0008"}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>
              Icône — <span style={{color:C.btc,fontFamily:"monospace"}}>{ticker}</span>
            </div>

            {/* Option FMP officielle */}
            {db.fmp && (
              <button onClick={()=>saveIcon({user:null})} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",background:!db.user?C.btc+"22":"transparent",
                border:`1px solid ${!db.user?C.btc:C.border}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",marginBottom:8,
              }}>
                <img src={db.fmp} alt="" style={{width:28,height:28,objectFit:"contain",borderRadius:4,background:"#fff"}} onError={e=>e.target.style.display="none"}/>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>Logo officiel</div>
                  <div style={{fontSize:9,color:C.gray}}>Source FMP</div>
                </div>
                {!db.user && <span style={{marginLeft:"auto",fontSize:11,color:C.btc}}>✓ actif</span>}
              </button>
            )}

            {/* Icône base hardcodée */}
            {TICKER_ICONS_BASE[ticker] && (
              <button onClick={()=>saveIcon({user:TICKER_ICONS_BASE[ticker]})} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",
                background:db.user===TICKER_ICONS_BASE[ticker]?C.teal+"22":"transparent",
                border:`1px solid ${db.user===TICKER_ICONS_BASE[ticker]?C.teal:C.border}`,
                borderRadius:10,padding:"8px 10px",cursor:"pointer",marginBottom:8,
              }}>
                <span style={{fontSize:22}}>{TICKER_ICONS_BASE[ticker]}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>Icône par défaut</div>
                </div>
                {db.user===TICKER_ICONS_BASE[ticker] && <span style={{marginLeft:"auto",fontSize:11,color:C.teal}}>✓ actif</span>}
              </button>
            )}

            {/* Icône personnalisée */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:C.gray,marginBottom:5,fontWeight:700}}>Icône personnalisée (emoji)</div>
              <div style={{display:"flex",gap:6}}>
                <input
                  value={userInput}
                  onChange={e=>setUserInput(e.target.value)}
                  placeholder="🟩"
                  style={{flex:1,background:C.bg1,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 8px",color:C.text,fontSize:18,outline:"none",minWidth:0}}
                />
                <button
                  onClick={()=>{ if(userInput.trim()) saveIcon({user:userInput.trim()}); }}
                  disabled={!userInput.trim()||saving}
                  style={{padding:"6px 8px",borderRadius:8,background:C.btc,border:"none",cursor:"pointer",fontSize:10,fontWeight:800,color:"#000",opacity:userInput.trim()?1:0.4,flexShrink:0,whiteSpace:"nowrap"}}
                >
                  {saving?"…":"✓"}
                </button>
              </div>
            </div>

            {/* Réinitialiser */}
            {(db.user||db.fmp) && (
              <button onClick={()=>saveIcon({user:null,fmp:null})} style={{
                display:"block",width:"100%",background:"transparent",border:`1px solid ${C.red}44`,
                borderRadius:8,padding:"6px",cursor:"pointer",fontSize:10,color:C.red,marginBottom:10,
              }}>
                ↺ Réinitialiser (catégorie par défaut)
              </button>
            )}

            <button onClick={()=>setOpen(false)} style={{
              display:"block",width:"100%",background:C.bg3,border:"none",borderRadius:8,
              padding:"8px",cursor:"pointer",fontSize:11,color:C.text,fontWeight:700,
            }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── PORTFOLIO — nouvelle structure unifiée ─────────────────────────
   Remplace la distinction crypto/stocks/bank par une seule collection
   d'items avec catégorie. Utilisée dans la v19+ pour buildSections.
   Structure : { date, items: [{t, cat, qty, pa, live, val, pnl, pct}] }
   Catégories : "Crypto", "Indices", "Picking", "Or", "Cash Dip", "Cash Matelas"
─────────────────────────────────────────────────────────────────────── */
function buildPortfolio(src){
  const items = [
    // Crypto
    ...src.crypto.items.map(x=>({...x, cat:"Crypto"})),
    // Stocks (Indices, Picking, Or, Cash Dip)
    ...src.stocks.items.map(x=>({...x})),
    // Banque (Cash Matelas)
    ...Object.entries(src.bank.breakdown).map(([k,v])=>({
      t:k, cat:"Cash Matelas", qty:1, pa:v, live:v,
      val:Math.round(v * (src.eurUsd||1.173)),
      valEUR:v, pnl:0, pct:0,
    })),
  ];
  return { date: src.crypto?.date || _DD[_DD.length-1]?.[0], items };
}

function buildSections(L){
  const src = L || CURRENT;
  const usdEur = src.usdEur;
  const eurUsd = src.eurUsd || 1/usdEur;

  // Si portfolio.items disponible → source unique de vérité
  if(src.portfolio?.items?.length > 0){
    const pi = src.portfolio.items;
    const bycat = cat => pi.filter(x=>x.cat===cat);
    const sum   = items => items.reduce((s,x)=>s+(x.val||0),0);
    const total = sum(pi.filter(x=>x.cat!=="Cash Matelas"));

    // Synchroniser crypto/stocks/bank depuis portfolio pour compatibilité
    src.crypto = src.crypto || {};
    src.crypto.items = bycat("Crypto");
    src.crypto.total = sum(bycat("Crypto"));
    src.stocks = src.stocks || {};
    src.stocks.items = pi.filter(x=>x.cat!=="Crypto"&&x.cat!=="Cash Matelas");
    src.stocks.total = sum(src.stocks.items);
    src.bank   = src.bank   || {};
    src.bank.totalEUR   = bycat("Cash Matelas").reduce((s,x)=>s+(x.valEUR||0),0);
    src.bank.breakdown  = Object.fromEntries(bycat("Cash Matelas").map(x=>[x.t, x.valEUR||0]));
  }

  // Totaux réels depuis les items live
  const cryptoUSD  = src.crypto.total;
  const indicesUSD = src.stocks.items.filter(x=>x.cat==="Indices").reduce((s,x)=>s+x.val,0);
  const pickingUSD = src.stocks.items.filter(x=>x.cat==="Picking").reduce((s,x)=>s+x.val,0);
  const orUSD      = src.stocks.items.filter(x=>x.cat==="Or").reduce((s,x)=>s+x.val,0);
  const cashStocksUSD = src.stocks.items.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val,0);
  // Cash Dip = tous les items cat="Cash" (EURO, STRC, USD négatif...)
  const cashDipUSD = cashStocksUSD;  // peut être négatif si USD < 0
  // Cash Matelas = comptes bancaires (BCI + Bourso + DeBlock)
  const cashMatelasUSD = Math.round(src.bank.totalEUR * eurUsd);
  const bankUSD    = cashDipUSD + cashMatelasUSD;
  const grandUSD   = cryptoUSD + indicesUSD + pickingUSD + orUSD + bankUSD;  // somme des catégories = référence unique
  const pct = v => grandUSD > 0 ? parseFloat((v / grandUSD * 100).toFixed(2)) : 0;

  const _sections_raw = [
    {
      key:"bitcoin", n:"Crypto", icon:"₿", color:C.btc,
      totalUSD: cryptoUSD,
      totalEUR: Math.round(cryptoUSD * usdEur),
      pct: pct(cryptoUSD),
      items: src.crypto.items.map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"₿", label:(CRYPTO_FULLNAMES[x.t]||x.t),
        detail: `${x.qty} ${x.t} · $${x.live.toLocaleString("fr-FR")}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"indices", n:"Indices ETF", icon:"📈", color:"#4A90D9",
      totalUSD: indicesUSD,
      totalEUR: Math.round(indicesUSD*usdEur),
      pct: pct(indicesUSD),
      items: src.stocks.items.filter(x=>x.cat==="Indices").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"📈", label: x.t,
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"picking", n:"Stock Picking", icon:"🎯", color:"#7B68EE",
      totalUSD: pickingUSD,
      totalEUR: Math.round(pickingUSD*usdEur),
      pct: pct(pickingUSD),
      items: src.stocks.items.filter(x=>x.cat==="Picking").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🎯",
        label: x.t,
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"or", n:"Or / Gold", icon:"🥇", color:"#EAB308",
      totalUSD: orUSD,
      totalEUR: Math.round(orUSD*usdEur),
      pct: pct(orUSD),
      items: src.stocks.items.filter(x=>x.cat==="Or").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🥇", label:"Gold ETF",
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"cashdip", n:"Cash Dip", icon:"💰", color:C.green,
      totalUSD: cashDipUSD,
      totalEUR: Math.round(cashDipUSD*usdEur),
      pct: pct(cashDipUSD),
      items: (()=>{
        const allItems = src.portfolio?.items?.length>0 ? src.portfolio.items : src.stocks.items;
        const findItem = t => allItems.find(x=>x.t===t) || src.stocks.items?.find(x=>x.t===t);
        const usdItem  = findItem("USD");
        const out = [];
        // IBKR Dollar (cash USD chez IBKR)
        {
          const qty = usdItem?.qty ?? 0;
          const val = usdItem?.val != null ? usdItem.val : qty;
          out.push({
            ticker:"USD", icon:"💵", label:"IBKR Dollar",
            detail:`${qty<0?"-":""}$${Math.abs(qty).toLocaleString("fr-FR")} cash USD IBKR`,
            valUSD: val, valEUR: Math.round(val*usdEur),
            pnl:0, pct:0, pa:"1.0000", live:"1.0000", qty, investi:qty,
          });
        }
        // KuCoin (cash USD chez KuCoin)
        const kucoinItem = findItem("KUCOIN");
        const kQty  = kucoinItem?.qty  ?? 0;
        const kVal  = kucoinItem?.val  ?? 0;
        out.push({
          ticker:"KUCOIN", icon:"💵", iconComponent:"KUCOIN", label:"KuCoin",
          detail: kQty === 0 ? "Compte vide"
                : kQty > 0  ? `$${kQty.toLocaleString("fr-FR")} cash USD KuCoin`
                :              `$${kQty.toLocaleString("fr-FR")} (découvert)`,
          valUSD: kVal, valEUR: Math.round(kVal*usdEur),
          pnl:0, pct:0, pa:"1.0000", live:"1.0000", qty:kQty, investi:kQty,
        });
        return out;
      })(),
    },
    {
      key:"matelas", n:"Cash Matelas", icon:"🏦", color:C.gray,
      totalUSD: cashMatelasUSD,
      totalEUR: src.bank.totalEUR,
      pct: pct(cashMatelasUSD),
      items: Object.entries(src.bank.breakdown).map(([k,v])=>({
        ticker: k, icon: TICKER_ICONS[k]||"🏦",
        iconComponent: k==="Bourso"?"Bourso":k==="DeBlock"?"DeBlock":k==="BCI"?"BCI":null,
        label: k, detail:"Compte courant / Épargne",
        valUSD: Math.round(v*eurUsd), valEUR: v,
        pnl: 0, pct: 0,
      })),
    },
  ];
  // v1.04 — tri par taille d'allocation : groupes décroissants + items décroissants
  const _sections_sorted = _sections_raw
    .filter(g => (g.items && g.items.length>0) || (g.totalUSD||0) !== 0)
    .map(g => ({ ...g, items: [...(g.items||[])].sort((a,b)=>(b.valUSD||0)-(a.valUSD||0)) }))
    .sort((a,b)=>(b.totalUSD||0)-(a.totalUSD||0));
  return _sections_sorted;
}

/* ═══════════════════════════════════════════════════════════
   PAGE OVERVIEW
═══════════════════════════════════════════════════════════ */
function PageOverview({chartData,onSnapshot,eur,setEur,hidden,setHidden,EFF,refreshing,handleRefresh,refreshedAt,refreshErr,fromSnapshot,gistSync,liveDD,liveCM,liveGDBS,liveGC,chosenSource,iconDbVersion=0,bumpIconDb}){
  const _DD_PO=liveDD||DD;
  const _CM_PO=liveCM||CRYPTO_MONTHLY;
  const [chartTF, setChartTF] = useState("YTD");
  const [sparkData, setSparkData] = useState([]);
  const cur = eur ? "€" : "$";
  const inv = 94064 * (EFF||CURRENT).usdEur;
  const gcCur = eur ? "€" : "$";
  // GDB prices depuis GDBS (dernier point non-null) — cohérent avec onglet GDB
  const {gdbS: _gsTov, gdbC: _gcTov} = calcGdbPrices(EFF||CURRENT);
  const gcPrice = eur ? (_gcTov * (EFF||CURRENT).usdEur).toFixed(2) : _gcTov.toFixed(2);
  const gsPrice = eur ? (_gsTov * (EFF||CURRENT).usdEur).toFixed(2) : _gsTov.toFixed(2);

  // totalUSD de référence = somme des catégories (cohérent avec onglet Portfolio)
  const _effSrc = EFF||CURRENT;
  const _sections = buildSections(_effSrc);
  const _sumUSD = _sections.reduce((s,sec)=>s+sec.totalUSD,0);
  const _sumEUR = Math.round(_sumUSD * _effSrc.usdEur);

  return(
    <div>
      {/* ── Portfolio card ── */}
      <div style={{
        background:C.bg1, borderRadius:14, marginBottom:12,
        border:`1px solid ${C.border2}`, overflow:"hidden",
      }}>
        {/* Total header */}
        <div style={{
          background:C.btc+"18", borderBottom:`1px solid ${C.border}`,
          padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>
              {(()=>{
                const src = chosenSource==="cloudflare" ? "BASE CF" : "BASE LOCALE";
                const snapDate = (EFF||CURRENT).date || CURRENT.date;
                const fmtDate = d => {
                  if(!d) return "—";
                  const dt = new Date(d);
                  if(isNaN(dt)) return d;
                  const m=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][dt.getMonth()];
                  return String(dt.getDate()).padStart(2,"0")+" "+m+" "+String(dt.getFullYear()).slice(2);
                };
                if(refreshedAt){
                  // Un refresh a été effectué
                  const refreshDate = refreshedAt.replace(/^(cloudflare|snapshot|locale)\s*/i,"");
                  return `${src} · REFRESH ${fmtDate(refreshDate)} ⟳`;
                }
                return `${src} · ${fmtDate(snapDate)} 📂`;
              })()}
            </div>
            <div style={{fontSize:32,fontWeight:900,letterSpacing:-1.5,color:C.green}}>
              {msk(cur+fmt(Math.round(eur?_sumEUR:_sumUSD)), hidden)}
            </div>
            <div style={{fontSize:12,color:C.gray,marginTop:2}}>
              {msk(eur?"$"+fmt(_sumUSD):"€"+fmt(_sumEUR), hidden)}
            </div>
          </div>
          {/* Sparkline portfeuille — timeframe du graphique */}
          {sparkData.length>1&&(()=>{
            const W=110, H=56;
            const vals = sparkData.filter(v=>v!=null);
            if(!vals.length) return null;
            const mn=Math.min(...vals), mx=Math.max(...vals), rng=mx-mn||1;
            const n=sparkData.length;
            const px=i=>i/(n-1)*W;
            const py=v=>v==null?null:H-((v-mn)/rng)*(H-4)+2;
            const pts=sparkData.map((v,i)=>v!=null?`${px(i).toFixed(1)},${py(v).toFixed(1)}`:null).filter(Boolean).join(" ");
            const lastV=vals[vals.length-1];
            const firstV=vals[0];
            const trend=lastV>=firstV?C.green:C.red;
            return(
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <div style={{fontSize:8,color:C.text3,letterSpacing:.3}}>{chartTF}</div>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
                  <defs>
                    <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trend} stopOpacity="0.25"/>
                      <stop offset="100%" stopColor={trend} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Zone remplie */}
                  {pts&&<polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#spkGrad)"/>}
                  {/* Courbe */}
                  {pts&&<polyline points={pts} fill="none" stroke={trend} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>}
                  {/* Point final */}
                  {sparkData[n-1]!=null&&<circle cx={px(n-1)} cy={py(sparkData[n-1])} r={3} fill={trend}/>}
                </svg>
                <div style={{fontSize:10,fontWeight:800,color:trend}}>
                  {rng>0?((lastV-firstV)/firstV*100>=0?"+":"")+(((lastV-firstV)/firstV)*100).toFixed(1)+"%":"—"}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── 3 cases Crypto / Actions / Banque ── */}
        {(()=>{
          const _p = _effSrc;
          const _uE = _p.usdEur || 0.86;
          const _eU = _p.eurUsd || 1.162;
          const _kuCoin = (_p.stocks?.items||[]).find(x=>x.t==="KUCOIN");
          const _cryptoUSD = (_p.crypto?.total||0) + (_kuCoin?.val||0);
          const _stocksUSD = (_p.stocks?.total||0) - (_kuCoin?.val||0);
          const _bankEUR   = _p.bank?.totalEUR || CURRENT.bank?.totalEUR || 0;
          const boxes = eur ? [
            {label:"Crypto",  val:"€"+fmtK(Math.round(_cryptoUSD*_uE)), c:C.btc},
            {label:"Actions", val:"€"+fmtK(Math.round(_stocksUSD*_uE)), c:C.blue},
            {label:"Banque",  val:"€"+fmtK(_bankEUR),                   c:C.green},
          ] : [
            {label:"Crypto",  val:"$"+fmtK(_cryptoUSD),                 c:C.btc},
            {label:"Actions", val:"$"+fmtK(_stocksUSD),                 c:C.blue},
            {label:"Banque",  val:"$"+fmtK(Math.round(_bankEUR*_eU)),   c:C.green},
          ];
          return(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:C.border,borderTop:`1px solid ${C.border}`}}>
              {boxes.map((b,i)=>(
                <div key={i} style={{background:C.bg1,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.gray,marginBottom:2}}>{b.label}</div>
                  <div style={{fontSize:13,fontWeight:800,color:b.c}}>{msk(b.val,hidden)}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* P&L 1J / 1S / 1M / 6M / 1A */}
        {(()=>{
          const _src2 = EFF||CURRENT;
          const _cur2 = eur ? "€" : "$";
          const usdEurNow = _src2.usdEur;

          // Valeur portefeuille courante en €
          const _ddLast2 = _DD_PO.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r[2]:null),null);
          const _nowEUR = _src2.totalEUR || _ddLast2;
          const _nowUSD = _nowEUR / usdEurNow;

          // Ligne DD la plus proche (en valeur absolue) d'une date cible
          // Prend la ligne avec |r[0] - targetDate| minimal parmi les lignes ayant totalEUR non null
          const _ddClosest = days => {
            const t = new Date(Date.now() + NC_OFFSET_MS);
            t.setUTCDate(t.getUTCDate() - days);
            const ds = t.toISOString().slice(0, 10);
            let best = null, bestDiff = Infinity;
            for (const r of _DD_PO) {
              if (!r[0] || r[2] == null) continue;
              const diff = Math.abs(new Date(r[0]) - new Date(ds));
              if (diff < bestDiff) { bestDiff = diff; best = r; }
            }
            return best;
          };

          // Formule : var€ = totalEUR(today) − totalEUR(today − X jours)
          //           var$ = (totalEUR(today) / usdEurNow) − (totalEUR(ref) / usdEurRef)
          // Aucune soustraction d'investissements — variation brute du patrimoine
          const _cell = days => {
            const row = _ddClosest(days);
            if (!row || !row[2]) return { pnl:0, pct:0 };
            const startEUR  = row[2];
            const usdEurRef = row[5] || usdEurNow;
            if (eur) {
              const pnl = Math.round(_nowEUR - startEUR);
              return { pnl, pct: _nowEUR ? pnl / _nowEUR : 0 };
            } else {
              const nowUSD   = _nowEUR  / usdEurNow;
              const startUSD = startEUR / usdEurRef;
              const pnl = Math.round(nowUSD - startUSD);
              return { pnl, pct: startUSD ? pnl / startUSD : 0 };
            }
          };

          const cells = [
            { label:"1J",  ..._cell(1)   },
            { label:"1S",  ..._cell(7)   },
            { label:"1M",  ..._cell(30)  },
            { label:"6M",  ..._cell(182) },
            { label:"1A",  ..._cell(365) },
          ];
          return(
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,background:C.border}}>
              {cells.map((c,i)=>(
                <div key={i} style={{background:C.bg2,padding:"8px 6px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.gray,marginBottom:3}}>{c.label}</div>
                  <div style={{fontSize:12,fontWeight:800,color:clr(c.pnl),letterSpacing:-.3}}>
                    {hidden?"***":(c.pnl>=0?"+":"")+_cur2+fmtK(Math.abs(c.pnl))}
                  </div>
                  <div style={{
                    fontSize:10,fontWeight:700,color:clr(c.pct),
                    background:clr(c.pct)+"18",borderRadius:4,
                    padding:"1px 4px",display:"inline-block",marginTop:2,
                  }}>{fmtP(c.pct)}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── GDB.C + GDB.S encarts ── */}
      {(()=>{
        const _ov_src = EFF||CURRENT;
        const _ov_gdbs = liveGDBS || GDBS;
        const usdEurNow2 = _ov_src.usdEur;
        const _ov_gdbsAt = days => {
          const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-days);
          const ds=t.toISOString().slice(0,10);
          return _ov_gdbs.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null);
        };
        const _ov_ddAt = days => {
          const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-days);
          const ds=t.toISOString().slice(0,10);
          return _DD_PO.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[5]?r:null),null);
        };
        const _gcNow2 = calcGdbPrices(_ov_src).gdbC;
        const _gsNow2 = calcGdbPrices(_ov_src).gdbS;
        const _gcPerf = d => {
          const r=_ov_gdbsAt(d); if(!r||!r[2]) return null;
          if(eur){ const dd=_ov_ddAt(d); const ref=dd?dd[5]:usdEurNow2; return parseFloat(((_gcNow2*usdEurNow2)/(r[2]*ref)-1).toFixed(4)); }
          return parseFloat((_gcNow2/r[2]-1).toFixed(4));
        };
        const _gsPerf = d => {
          const r=_ov_gdbsAt(d); if(!r||!r[1]) return null;
          if(eur){ const dd=_ov_ddAt(d); const ref=dd?dd[5]:usdEurNow2; return parseFloat(((_gsNow2*usdEurNow2)/(r[1]*ref)-1).toFixed(4)); }
          return parseFloat((_gsNow2/r[1]-1).toFixed(4));
        };
        const gdb = [
          { label:"CGIC", price:gcPrice, d:_gcPerf(1), w:_gcPerf(7), m:_gcPerf(30), color:C.orange },
          { label:"CGIS", price:gsPrice, d:_gsPerf(1), w:_gsPerf(7), m:_gsPerf(30), color:C.blue },
        ];
        return(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
            {gdb.map((g,i)=>(
              <div key={i} style={{
                background:C.bg1, borderRadius:10, padding:"8px 10px",
                border:`1px solid ${C.border}`,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                  <span style={{fontSize:12,fontWeight:800,color:g.color,letterSpacing:.3}}>{g.label}</span>
                  <span style={{fontSize:16,fontWeight:900,color:g.color,letterSpacing:-0.5}}>{hidden?"***":gcCur+g.price}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[["1J",g.d],["1S",g.w],["1M",g.m]].map(([tf,v])=>(
                    <div key={tf} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:8,color:C.text3}}>{tf}</div>
                      <div style={{fontSize:10,fontWeight:800,color:clr(v)}}>{fmtP(v,1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── GDB Comparison Chart ── */}
      <SH label="CGIC · CGIS · Patrimoine total" color={C.gray}/>
      <GdbCompareChart eur={eur} setEur={setEur} EFF={EFF} tf={chartTF} setTF={setChartTF} onSparkData={setSparkData} chartData={chartData} liveDD={liveDD} liveGDBS={liveGDBS} liveGC={liveGC}/>

      {/* ── Taux EUR/USD ── */}
      {(()=>{
        const _src3 = EFF||CURRENT;
        const eurUsdRate = _src3.eurUsd || (1/_src3.usdEur);
        const usdEurRate = _src3.usdEur;
        return(
          <div style={{...crd(),display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13}}>🇪🇺</span>
              <span style={{fontSize:11,color:C.text2,fontWeight:600}}>EUR / USD</span>
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,fontWeight:800,color:C.text}}>${eurUsdRate.toFixed(4)}</div>
                <div style={{fontSize:9,color:C.gray}}>1€ = ${eurUsdRate.toFixed(4)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,fontWeight:800,color:C.text}}>€{usdEurRate.toFixed(4)}</div>
                <div style={{fontSize:9,color:C.gray}}>1$ = €{usdEurRate.toFixed(4)}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Version discrète */}
      <div style={{
        textAlign:"center",fontSize:9,color:C.text3,opacity:.35,
        marginTop:6,letterSpacing:.5,pointerEvents:"none",
      }}>
        v18.5
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE ALLOCATION — camemberts + ajustements + détail par catégorie
═══════════════════════════════════════════════════════════ */
function DonutControlled({data,size=160,ri=30,label,sub,sel,onSel}){
  const cx=size/2,cy=size/2,R=size/2-7;
  const total=data.reduce((s,d)=>s+d.v,0)||1;
  let cum=0;
  const sl=data.map((d,i)=>{const s=cum;cum+=d.v/total;return{...d,v:d.v/total,s,e:cum,i};});
  const arc=(s,e,r,expand=false)=>{
    const mid=(s+e)/2;
    const ox=expand?Math.cos(mid*2*Math.PI-Math.PI/2)*4:0;
    const oy=expand?Math.sin(mid*2*Math.PI-Math.PI/2)*4:0;
    const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2;
    const x1=cx+ox+r*Math.cos(a1),y1=cy+oy+r*Math.sin(a1);
    const x2=cx+ox+r*Math.cos(a2),y2=cy+oy+r*Math.sin(a2);
    return `M${cx+ox},${cy+oy}L${x1},${y1}A${r},${r},0,${(e-s)>.5?1:0},1,${x2},${y2}Z`;
  };
  const active = sel!=null ? data[sel] : null;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{cursor:"pointer"}}>
      {sl.map((s,i)=>(
        <path key={i} d={arc(s.s,s.e,R,sel===i)}
          fill={s.c} opacity={sel==null?0.9:sel===i?1:0.3}
          stroke={sel===i?C.bg:"none"} strokeWidth={sel===i?2:0}
          style={{transition:"opacity .2s"}}
          onClick={()=>onSel(i)}/>
      ))}
      <circle cx={cx} cy={cy} r={ri+2} fill={C.bg}/>
      {active==null?(
        <>
          {label&&<text x={cx} y={cy-6} textAnchor="middle" fill={C.text} fontSize={9} fontWeight="700">{label}</text>}
          {sub&&<text x={cx} y={cy+8} textAnchor="middle" fill={C.btc} fontSize={9} fontWeight="700">{sub}</text>}
        </>
      ):(
        <>
          <text x={cx} y={cy-8} textAnchor="middle" fill={active.c} fontSize={8} fontWeight="800">{active.n}</text>
          <text x={cx} y={cy+4} textAnchor="middle" fill={C.text} fontSize={10} fontWeight="800">{active.pct!=null?active.pct.toFixed(1)+"%":(active.v*100).toFixed(1)+"%"}</text>
          {active.usd&&<text x={cx} y={cy+15} textAnchor="middle" fill={C.gray} fontSize={7}>${fmtK(active.usd)}</text>}
        </>
      )}
    </svg>
  );
}

function PageAllocation({hidden, EFF, eur=false, setEur, iconDbVersion=0, bumpIconDb}){
  const[mode,setMode]=useState("detail");
  const[selSlice,setSelSlice]=useState(null);
  const[openSec,setOpenSec]=useState(null);
  const[tickerModal,setTickerModal]=useState(null); // {ticker, cat}
  const SECTIONS = buildSections(EFF||CURRENT);
  // realD = même source que le donut portfolio — SECTIONS live
  const sectionsTotal = SECTIONS.reduce((s,sec)=>s+sec.totalUSD, 0);
  const realD = SECTIONS.map(s=>({v:s.totalUSD/sectionsTotal, c:s.color, n:s.n, pct:s.pct, usd:s.totalUSD}));
  // Mapping SECTIONS.n → alloc cible par nom
  const allocByName = {};
  (EFF||CURRENT).alloc.forEach(function(a){ allocByName[a.n]=a; });
  // Map section key → alloc name
  const SECT_TO_ALLOC = {
    "Bitcoin":     "Crypto",
    "Indices ETF": "Indices",
    "Stock Picking":"Picking",
    "Or / Gold":   "Or",
    "Cash Dip":    "Cash Dip",
    "Cash Matelas":"Cash Matelas",
  };
  const tgtD = SECTIONS.map(function(s){
    var allocName = SECT_TO_ALLOC[s.n] || s.n;
    var a = allocByName[allocName] || {tgt:0, n:s.n};
    return {v:a.tgt/100, c:s.color, n:s.n, pct:a.tgt};
  });

  /* totals for footer */
  const _src = EFF||CURRENT;
  const _SECTIONS = buildSections(_src);
  const totalUSD = _SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
  const totalEUR = Math.round(totalUSD * _src.usdEur);
  const cur2 = eur ? "€" : "$";
  const totalDisplay = eur ? totalEUR : totalUSD;

  return(
    <>
    <div>
      {/* ── View selector — 2 onglets ── */}
      <div style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:4,marginBottom:14}}>
        {[["detail","Détail"],["ajust","Allocation"]].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:mode===v?C.blue:"transparent",color:mode===v?"#fff":C.gray}}>{l}</button>
        ))}
      </div>

      {/* ── ALLOCATION : donuts + ajustements fusionnés ── */}
      {(mode==="compare"||mode==="ajust")&&(
        <>
          {/* Donuts côte à côte */}
          <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",marginBottom:10}}>
            <div style={{textAlign:"center"}}>
              <Donut data={realD} size={148} label="RÉEL" sub={(eur?"€":"$")+fmtK(eur?Math.round(sectionsTotal*_src.usdEur):sectionsTotal)} ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>Réel</div>
            </div>
            <div style={{textAlign:"center"}}>
              <Donut data={tgtD} size={148} label="CIBLE" sub={eur?"€320k":"$380k"} ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>Cible 2026</div>
            </div>
          </div>
          {/* Légende compacte */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:14}}>
            {SECTIONS.map((s,i)=>{
              var allocName = SECT_TO_ALLOC[s.n]||s.n;
              var a = allocByName[allocName]||{c:s.color,n:s.n};
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:2,background:a.c||s.color}}/>
                  <span style={{fontSize:10,color:C.text2}}>{s.n} <b style={{color:a.c||s.color}}>{(s.pct||0).toFixed(1)}%</b></span>
                </div>
              );
            })}
          </div>
          {/* Liste ajustements */}
          {SECTIONS.map((s,i)=>{
            var allocName = SECT_TO_ALLOC[s.n]||s.n;
            var a = allocByName[allocName]||{tgt:0,c:s.color,n:allocName};
            var _ap = s.pct||0;
            var diff = _ap - a.tgt;
            var adjUSD = Math.round((diff/100)*totalUSD);
            var adjEUR = Math.round(adjUSD*_src.usdEur);
            var adjDisp = eur?adjEUR:adjUSD;
            return(
              <div key={i} style={crd()}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <div style={{width:9,height:9,borderRadius:2,background:a.c||s.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,flex:1}}>{s.n}</span>
                  <span style={{fontSize:12,fontWeight:800}}>{(eur?"€":"$")+fmt(eur?Math.round(s.totalUSD*_src.usdEur):s.totalUSD)}</span>
                </div>
                <div style={{position:"relative",height:14,background:C.bg3,borderRadius:4,marginBottom:5,overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:Math.min(a.tgt/65*100,100)+"%",background:a.c||s.color,opacity:.2,borderRadius:4}}/>
                  <div style={{position:"absolute",left:0,top:2,height:10,width:Math.min(_ap/65*100,100)+"%",background:a.c||s.color,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:C.gray}}>Réel <b style={{color:a.c||s.color}}>{_ap.toFixed(1)}%</b></span>
                  <span style={{fontSize:10,color:C.gray}}>Cible <b style={{color:C.text2}}>{a.tgt}%</b></span>
                  <span style={{fontSize:10,fontWeight:800,color:Math.abs(diff)<1?C.green:diff>0?C.orange:C.blue}}>
                    {diff>=0?"+":""}{diff.toFixed(1)}% → {diff>0?"Vendre":"Achat"} {(eur?"€":"$")+fmt(Math.abs(adjDisp))}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Plan d'action résumé */}
          <div style={{background:C.bg2,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginTop:4}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:10,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>Plan d'action</div>
            {SECTIONS.filter(function(s){
              var allocName=SECT_TO_ALLOC[s.n]||s.n;
              var a=allocByName[allocName]||{tgt:0};
              return Math.abs((s.pct||0)-a.tgt)>1;
            }).map(function(s,i,arr){
              var allocName=SECT_TO_ALLOC[s.n]||s.n;
              var a=allocByName[allocName]||{tgt:0,c:s.color,n:allocName};
              var _ap2=s.pct||0;
              var diff=_ap2-a.tgt;
              var adjUSD=Math.round((diff/100)*totalUSD);
              var adjEUR=Math.round(adjUSD*_src.usdEur);
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:2,background:a.c||s.color}}/>
                    <span style={{fontSize:12,fontWeight:600}}>{s.n}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:800,color:diff>0?C.orange:C.blue}}>
                      {diff>0?"Vendre":"Acheter"} {(eur?"€":"$")+fmt(Math.abs(eur?adjEUR:adjUSD))}
                    </div>
                    <div style={{fontSize:10,color:C.gray}}>
                      {eur?"≈ $"+fmt(Math.abs(adjUSD)):"≈ €"+fmt(Math.abs(adjEUR))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── DÉTAIL PAR CATÉGORIE ── */}
      {mode==="detail"&&(
        <>
          {/* Donut + légende côte à côte */}
          {(()=>{
            const sectionsTotal2 = SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
            const donutData = SECTIONS.map(s=>({v:s.pct/100,c:s.color,n:s.n,pct:s.pct,usd:s.totalUSD}));
            const selSec = selSlice!=null ? SECTIONS[selSlice] : null;
            const cur2 = eur?"€":"$";
            const cvD = v => eur ? Math.round(v*_src.usdEur) : v;
            return(
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{flexShrink:0}}>
                  <DonutControlled size={150} ri={30} label="TOTAL" sub={cur2+fmtK(cvD(sectionsTotal2))}
                    data={donutData} sel={selSlice} onSel={i=>setSelSlice(selSlice===i?null:i)}/>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {selSec ? (
                    <>
                      <div style={{fontSize:10,fontWeight:800,color:selSec.color,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>
                        {selSec.n}
                      </div>
                      {selSec.items.slice(0,7).map((item,i)=>{
                        const name  = item.t||item.ticker||item.label||"—";
                        const icon  = TICKER_ICONS[item.t||item.ticker]||item.icon||"•";
                        const valUSD= item.val||item.valUSD||0;
                        const pnl   = item.pnl||0;
                        const pct   = selSec.totalUSD>0?(valUSD/selSec.totalUSD)*100:0;
                        return(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{fontSize:12}}>{icon}</span>
                              <span style={{fontSize:10,color:C.text,fontWeight:600}}>{name}</span>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:10,fontWeight:800,color:selSec.color}}>{pct.toFixed(1)}%</div>
                              <div style={{fontSize:9,color:clr(pnl)}}>{pnl>=0?"+":""}{cur2+fmtK(Math.abs(cvD(pnl)))}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{fontSize:9,color:C.gray,marginTop:2,textAlign:"center",fontStyle:"italic"}}>Appuie à nouveau pour revenir</div>
                    </>
                  ) : (
                    SECTIONS.map((s,i)=>{
                      const secPnl = s.items.reduce((acc,x)=>acc+(x.pnl||0),0);
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}
                          onClick={()=>setSelSlice(i)}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                            <span style={{fontSize:11,color:C.text,fontWeight:600}}>{s.n}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:11,fontWeight:800,color:s.color}}>{s.pct.toFixed(1)}%</div>
                            <div style={{fontSize:9,color:clr(secPnl)}}>{secPnl>=0?"+":""}{cur2+fmtK(Math.abs(cvD(secPnl)))}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* Hint */}
          <div style={{fontSize:10,color:C.gray,marginBottom:8,textAlign:"center",fontStyle:"italic"}}>
            Appuyer sur une catégorie pour voir le détail
          </div>

          {/* Sections accordéon */}
          {SECTIONS.map(sec=>(
            <SectionRow
              key={sec.key}
              section={sec}
              open={openSec===sec.key}
              onToggle={()=>setOpenSec(openSec===sec.key?null:sec.key)}
              onTickerClick={(t, cat)=>{
                const NO_MODAL=["BCI","Bourso","DeBlock","KUCOIN","EURO","USD"];
                if(!NO_MODAL.includes(t)) setTickerModal({ticker:t, cat:cat||""});
              }}
              hidden={hidden}
              eur={eur}
              usdEur={_src.usdEur||0.852}
              eurUsd={_src.eurUsd||1.173}
              iconDbVersion={iconDbVersion}
              onIconSaved={bumpIconDb}
            />
          ))}

          {/* Footer total */}
          {(()=>{
            const sectionsPnl = SECTIONS.reduce((acc,s)=>acc+s.items.reduce((a,x)=>a+(x.pnl||0),0),0);
            const investi = SECTIONS.reduce((acc,s)=>acc+s.items.reduce((a,x)=>a+(x.investi||0),0),0);
            const pnlPct = investi > 0 ? sectionsPnl / investi : 0;
            return (
              <div style={{
                background:C.bg1, borderRadius:14, marginTop:10,
                border:`1px solid ${C.border2}`, overflow:"hidden",
              }}>
                <div style={{
                  background:C.btc+"18", borderBottom:`1px solid ${C.border}`,
                  padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <div>
                    <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Total portefeuille</div>
                    <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,color:C.green}}>{msk(cur2+fmt(totalDisplay),hidden)}</div>
                    <div style={{fontSize:13,color:C.gray,marginTop:2}}>{msk(eur?"$"+fmt(totalUSD):"€"+fmt(totalEUR),hidden)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>P&L positions</div>
                    <div style={{fontSize:22,fontWeight:800,color:clr(sectionsPnl)}}>{hidden?"***":(sectionsPnl>=0?"+":"")+cur2+fmtK(Math.abs(eur?Math.round(sectionsPnl*(_src.usdEur||0.852)):sectionsPnl))}</div>
                    <div style={{
                      fontSize:12,fontWeight:700,color:clr(sectionsPnl),
                      background:clr(sectionsPnl)+"22",borderRadius:6,padding:"2px 8px",
                      display:"inline-block",marginTop:3,
                    }}>{fmtP(pnlPct)}</div>
                  </div>
                </div>
                {(()=>{
                  // Totaux corrects selon définition :
                  // Crypto  = crypto (BTC) + KuCoin
                  // Actions = stocks (tout sauf KuCoin) : indices + picking + or + cash plateforme
                  // Banque  = cash matelas (BCI+Bourso+DeBlock)
                  const _p = EFF || CURRENT;
                  const _uE = _p.usdEur || 0.86;
                  const _eU = _p.eurUsd || 1.162;
                  // Crypto : total crypto (BTC) + valeur KuCoin (dans stocks mais appartient à GDB.C)
                  const _kuCoin = (_p.stocks?.items||[]).find(x=>x.t==="KUCOIN");
                  const _cryptoUSD = (_p.crypto?.total||0) + (_kuCoin?.val||0);
                  // Actions : total stocks - KuCoin
                  const _stocksUSD = (_p.stocks?.total||0) - (_kuCoin?.val||0);
                  // Banque : totalEUR du bank (toujours en €)
                  const _bankEUR = _p.bank?.totalEUR || CURRENT.bank?.totalEUR || 0;

                  const boxes = eur ? [
                    {label:"Crypto",  val:"€"+fmtK(Math.round(_cryptoUSD*_uE)), c:C.btc},
                    {label:"Actions", val:"€"+fmtK(Math.round(_stocksUSD*_uE)), c:C.blue},
                    {label:"Banque",  val:"€"+fmtK(_bankEUR),                   c:C.green},
                  ] : [
                    {label:"Crypto",  val:"$"+fmtK(_cryptoUSD),                 c:C.btc},
                    {label:"Actions", val:"$"+fmtK(_stocksUSD),                 c:C.blue},
                    {label:"Banque",  val:"$"+fmtK(Math.round(_bankEUR*_eU)),   c:C.green},
                  ];
                  return (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:C.border}}>
                      {boxes.map((b,i)=>(
                        <div key={i} style={{background:C.bg2,padding:"10px 12px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:C.gray,marginBottom:3}}>{b.label}</div>
                          <div style={{fontSize:13,fontWeight:800,color:b.c}}>{hidden?"***":b.val}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </>
      )}
    </div>
    {tickerModal && (
      <TickerModal
        ticker={tickerModal.ticker}
        cat={tickerModal.cat}
        eur={eur}
        usdEur={(_src||EFF||CURRENT).usdEur||0.86}
        onClose={()=>setTickerModal(null)}
      />
    )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE STATS
═══════════════════════════════════════════════════════════ */
/* ═══ STATS DATA — Monthly breakdown by category ═══════ */
const CRYPTO_MONTHLY={"2022": {"bom": [12551, 13200, 12912, 17337, 17181, 16298, 15346, 22140, 24228, 24013, 29454, 23118], "eom": [13200, 12912, 17337, 17181, 16298, 15346, 22140, 24228, 24013, 29454, 23118, 23943], "pct": [null, -0.0711, 0.2958, -0.159, -0.3162, -0.2743, 0.2156, 0.0491, -0.1513, 0.068, -0.2966, -0.0417], "pnl": [null, -938, 3820, -2756, -5433, -4471, 3309, 1088, -3665, 1634, -8736, -963], "inv": [649, 650, 605, 2600, 4550, 3519, 3485, 1000, 3450, 3807, 2400, 1788], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -17111, "ttl_pct": -0.609}, "2023": {"bom": [23943, 35617, 37184, 45241, 50022, 46588, 50366, 46799, 47375, 43271, 55875, 59363], "eom": [35617, 37184, 45241, 50022, 46588, 50366, 46799, 47375, 43271, 55875, 59363, 66460], "pct": [0.4088, 0.0079, 0.1933, 0.0826, -0.0706, 0.0789, -0.0708, 0.0123, -0.0866, 0.2739, 0.0517, 0.1078], "pnl": [9788, 280, 7186, 3736, -3534, 3678, -3567, 576, -4104, 11854, 2888, 6397], "inv": [1886, 1287, 871, 1045, 100, 100, 0, 0, 0, 750, 600, 700], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 35178, "ttl_pct": 1.346}, "2024": {"bom": [66460, 73388, 107984, 123675, 110894, 121580, 112109, 125500, 102116, 120903, 135809, 201625], "eom": [73388, 107984, 123675, 110894, 121580, 112109, 125500, 102116, 120903, 135809, 201625, 190944], "pct": [0.0345, 0.4413, 0.1259, -0.1033, 0.0891, -0.1097, 0.1053, -0.201, 0.1372, 0.1063, 0.4407, -0.0857], "pnl": [2292, 32383, 13595, -12781, 9886, -13340, 11803, -25227, 14008, 12858, 59852, -17280], "inv": [4636, 2213, 2096, 0, 800, 3869, 1588, 1843, 4779, 2048, 5964, 6599], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 88049, "ttl_pct": 1.136}, "2025": {"bom": [190944, 210411, 155207, 148901, 164093, 193776, 182541, 216305, 202668, 206179, 212366, 169637], "eom": [210411, 155207, 148901, 164093, 193776, 182541, 216305, 202668, 206179, 212366, 169637, 163680], "pct": [0.0989, -0.2651, -0.0521, 0.095, 0.1738, -0.0644, 0.1784, -0.077, 0.0136, 0.0387, -0.2149, -0.1032], "pnl": [18887, -55774, -8091, 14142, 28513, -12485, 32569, -16657, 2761, 7987, -45629, -17507], "inv": [580, 570, 1785, 1050, 1170, 1250, 1195, 3020, 750, -1800, 2900, 11550], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -51284, "ttl_pct": -0.258}, "2026": {"bom": [163680, 171210, 130804, 134744, 153056, null, null, null, null, null, null, null], "eom": [171210, 130804, 134744, 153056, 144137, null, null, null, null, null, null, null], "pct": [0.0356, -0.2605, 0.0217, 0.1296, -0.0583, null, null, null, null, null, null, null], "pnl": [5830, -44606, 2840, 17462, -8919, null, null, null, null, null, null, null], "inv": [1700, 4200, 1100, 850, 0, null, null, null, null, null, null, null], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -27393, "ttl_pct": -0.168}};
const STOCKS_MONTHLY={"2025": {"bom": [17, 2067, 2113, 9812, 9623, 13356, 13122, 13509, 14253, 15017, 19528, 18739], "eom": [2067, 2113, 9812, 9623, 13356, 13122, 13509, 14253, 15017, 19528, 18739, 19283], "pct": [null, 0.0223, -0.1188, -0.0193, 0.0762, -0.0175, 0.0295, 0.0551, 0.0536, 0.0274, -0.0404, 0.029], "pnl": [null, 46, -251, -189, 733, -234, 387, 744, 764, 411, -789, 544], "inv": [2050, 0, 7950, 0, 3000, 0, 0, 0, 0, 4100, 0, 0], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 2166, "ttl_pct": 0.085}, "2026": {"bom": [19283, 20187, 19801, 19572, 20939, null, null, null, null, null, null, null], "eom": [20187, 19801, 19572, 20939, 27430, null, null, null, null, null, null, null], "pct": [-0.005, -0.0191, -0.0116, 0.0698, 0.31, null, null, null, null, null, null, null], "pnl": [-96, -386, -229, 1367, 6491, null, null, null, null, null, null, null], "inv": [1000, 0, 0, 0, 0, null, null, null, null, null, null, null], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 7147, "ttl_pct": 0.352}};
const TOTAL_MONTHLY={"2022": {"bom": [12551, 13200, 12912, 17337, 17181, 16298, 15346, 22140, 24228, 24013, 29454, 23118], "eom": [13200, 12912, 17337, 17181, 16298, 15346, 22140, 24228, 24013, 29454, 23118, 23943], "pct": [null, -0.0711, 0.2958, -0.159, -0.3162, -0.2743, 0.2156, 0.0491, -0.1513, 0.068, -0.2966, -0.0417], "pnl": [null, -938, 3820, -2756, -5433, -4471, 3309, 1088, -3665, 1634, -8736, -963], "inv": [649, 650, 605, 2600, 4550, 3519, 3485, 1000, 3450, 3807, 2400, 1788], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -17111}, "2023": {"bom": [23943, 35617, 37184, 45241, 50022, 46588, 50366, 46799, 47375, 43271, 55875, 59363], "eom": [35617, 37184, 45241, 50022, 46588, 50366, 46799, 47375, 43271, 55875, 59363, 66460], "pct": [0.4088, 0.0079, 0.1933, 0.0826, -0.0706, 0.0789, -0.0708, 0.0123, -0.0866, 0.2739, 0.0517, 0.1078], "pnl": [9788, 280, 7186, 3736, -3534, 3678, -3567, 576, -4104, 11854, 2888, 6397], "inv": [1886, 1287, 871, 1045, 100, 100, 0, 0, 0, 750, 600, 700], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 35178}, "2024": {"bom": [66460, 73388, 107984, 123675, 110894, 121580, 112109, 125500, 102116, 120903, 135809, 201625], "eom": [73388, 107984, 123675, 110894, 121580, 112109, 125500, 102116, 120903, 135809, 201625, 190944], "pct": [0.0345, 0.4413, 0.1259, -0.1033, 0.0891, -0.1097, 0.1053, -0.201, 0.1372, 0.1063, 0.4407, -0.0857], "pnl": [2292, 32383, 13595, -12781, 9886, -13340, 11803, -25227, 14008, 12858, 59852, -17280], "inv": [4636, 2213, 2096, 0, 800, 3869, 1588, 1843, 4779, 2048, 5964, 6599], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": 88049}, "2025": {"bom": [190944, 212478, 157320, 158713, 173716, 207132, 195663, 229814, 216921, 221196, 231894, 188376], "eom": [212478, 157320, 158713, 173716, 207132, 195663, 229814, 216921, 221196, 231894, 188376, 182963], "pct": [0.099, -0.2623, -0.053, 0.0879, 0.1684, -0.0614, 0.1684, -0.0692, 0.0163, 0.038, -0.2002, -0.09], "pnl": [18904, -55728, -8342, 13953, 29246, -12719, 32956, -15913, 3525, 8398, -46418, -16963], "inv": [2630, 570, 9735, 1050, 4170, 1250, 1195, 3020, 750, 2300, 2900, 11550], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -49101}, "2026": {"bom": [182963, 191397, 150605, 154316, 173995, null, null, null, null, null, null, null], "eom": [191397, 150605, 154316, 173995, 171567, null, null, null, null, null, null, null], "pct": [0.0313, -0.2351, 0.0173, 0.122, -0.014, null, null, null, null, null, null, null], "pnl": [5734, -44992, 2611, 18829, -2428, null, null, null, null, null, null, null], "inv": [2700, 4200, 1100, 850, 0, null, null, null, null, null, null, null], "m": ["JAN", "FEV", "MAR", "AVR", "MAI", "JUI", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"], "ttl_pnl": -20246}};
const SEAS_CRYPTO={"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"pct":[0.076,0.039,0.114,0.024,-0.101,-0.118,0.159,0.0,0.037,0.151,0.125,-0.036]};

function PageStats({chartData, hidden=false, EFF, eur=false, liveDD, src}){
  const[yr,setYr]=useState("2026");
  const[cat,setCat]=useState("total"); // crypto | stocks | total
  const[view,setView]=useState("bars"); // bars | table

  // ── Taux USD/EUR historique par date (lit liveDD ou DD global) ────────────
  const _DD_ST = liveDD || DD;
  // Retourne le taux usdEur <= dateStr, ou taux actuel par défaut
  const usdEurAtDate = dateStr => {
    const row = _DD_ST.reduceRight((a,r)=>a!=null?a:(r[0]<=dateStr&&r[5]?r:null),null);
    return row ? row[5] : (src?.usdEur || 0.86);
  };
  // Taux BOM = 1er du mois (YYYY-MM-01)
  const bomRate = (year, mi) => {
    const pad = m => String(m+1).padStart(2,"0");
    return usdEurAtDate(`${year}-${pad(mi)}-01`);
  };
  // Taux EOM = dernier jour du mois (approx fin du mois)
  const eomRate = (year, mi) => {
    const pad = m => String(m+1).padStart(2,"0");
    const lastDay = new Date(parseInt(year), mi+1, 0).getDate();
    return usdEurAtDate(`${year}-${pad(mi)}-${lastDay}`);
  };
  const cur = eur ? "€" : "$";

  // ── Unités des données statiques par catégorie ────────────────────────────
  // crypto  → BOM/EOM/PNL en €, INV en €
  // stocks  → BOM/EOM/PNL en $, INV en €
  // total   → BOM/EOM/PNL en €, INV en €
  // dataInEUR = true : BOM/EOM/PNL sont en € pour toutes les catégories
  const dataInEUR = true;

  // ── Fusionne les données historiques avec les snapshots récents ────────────
  const getMonthlyData = (category, year) => {
    const base = category==="crypto" ? CRYPTO_MONTHLY[year]
                : category==="stocks" ? STOCKS_MONTHLY[year]
                : TOTAL_MONTHLY[year];
    if(!base) return null;
    const result = {...base};
    // ── Fonction commune : applique la valeur live EOM pour le mois courant ──
    const _applyLiveEOM = (eomVal) => {
      const MONTHS_FR_LOCAL = ["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];
      const nowNC2  = new Date(Date.now() + 11*60*60*1000);
      const curMI2  = nowNC2.getMonth();
      const curMonLabel = MONTHS_FR_LOCAL[curMI2];
      const existingM   = result.m || [];
      const monthExists = existingM.includes(curMonLabel);
      if(!monthExists && eomVal){
        const prevEOM = [...(result.eom||[])].filter(v=>v!=null).slice(-1)[0] || eomVal;
        const inv     = result.inv?.[curMI2] || 0;
        const pnl     = Math.round(eomVal - prevEOM - inv);
        const pct     = prevEOM ? pnl / prevEOM : 0;
        result.m   = [...existingM]; result.m[curMI2]   = curMonLabel;
        result.bom = [...(result.bom||[])]; result.bom[curMI2] = prevEOM;
        result.eom = [...(result.eom||[])]; result.eom[curMI2] = eomVal;
        result.pnl = [...(result.pnl||[])]; result.pnl[curMI2] = pnl;
        result.pct = [...(result.pct||[])]; result.pct[curMI2] = pct;
        result.inv = [...(result.inv||[])]; result.inv[curMI2] = inv;
      } else if(monthExists && eomVal){
        result.eom = [...result.eom]; result.eom[curMI2] = eomVal;
        const bom = result.bom[curMI2] || 0;
        const inv = result.inv?.[curMI2] || 0;
        result.pnl = [...result.pnl]; result.pnl[curMI2] = bom ? eomVal - bom - inv : null;
        result.pct = [...result.pct]; result.pct[curMI2] = bom ? (eomVal - bom - inv)/bom : null;
      }
    };

    const nowNC   = new Date(Date.now() + 11*60*60*1000);
    const curYear = String(nowNC.getFullYear());
    const curMI   = nowNC.getMonth();
    const curYYMM = `${curYear}-${String(curMI+1).padStart(2,"0")}`;

    if(year === curYear && curMI < 12){
      if(category==="crypto"){
        // Valeur live = total crypto en € (wallet crypto)
        const liveEUR = EFF ? Math.round(EFF.crypto.total * (src?.usdEur || 0.86)) : null;
        const ddRows  = _DD_ST.filter(r=>r[0]&&r[0].startsWith(curYYMM)&&r[1]!=null);
        const ddEUR   = ddRows.length ? ddRows[ddRows.length-1][1] : null;
        _applyLiveEOM(liveEUR || ddEUR);
      }
      if(category==="stocks"){
        // GDB.S = tous les items stocks sauf KUCOIN (qui appartient au fonds crypto GDB.C)
        // Inclut : actions, ETF, Cash plateforme (EURO/USD/STRC), Or
        // Exclut : KUCOIN (cash crypto), Cash Matelas (matelas, hors fonds)
        const usdEur  = src?.usdEur || 0.86;
        const liveEUR = EFF ? Math.round(
          EFF.stocks.items
            .filter(x => x.t !== "KUCOIN" && x.cat !== "Cash Matelas")
            .reduce((s, x) => s + (x.val || 0), 0) * usdEur
        ) : null;
        _applyLiveEOM(liveEUR);
      }
    }
    return result;
  };

  const years = ["2022","2023","2024","2025","2026"].filter(y=>
    (cat==="crypto"&&CRYPTO_MONTHLY[y])||(cat==="stocks"&&STOCKS_MONTHLY[y])||(cat==="total"&&TOTAL_MONTHLY[y])
  );
  const safeYr = years.includes(yr) ? yr : years[years.length-1] || "2026";
  const data = getMonthlyData(cat, safeYr);

  const catLabel = cat==="crypto"?"Crypto":cat==="stocks"?"Actions":"Total";
  const catColor = cat==="crypto"?C.btc:cat==="stocks"?C.blue:C.green;

  // ── Fonctions de conversion ───────────────────────────────────────────────
  // BOM/EOM/PNL : si dataInEUR → déjà en €, sinon en $
  //   mode € : dataInEUR → garder | data$ → × taux
  //   mode $ : dataInEUR → ÷ taux | data$ → garder
  const cvtBOM_EOM = (v, rate) => {
    if(v == null) return null;
    if(eur)  return dataInEUR ? v                    : Math.round(v * rate);
    else     return dataInEUR ? Math.round(v / rate) : v;
  };
  // INV toujours en € dans les données statiques
  //   mode € → garder | mode $ → ÷ taux
  const cvtINV_val = (v, rate) => {
    if(!v) return null;
    return eur ? v : Math.round(v / rate);
  };

  const cvtBOM = i => cvtBOM_EOM(data?.bom?.[i], bomRate(safeYr,i));
  const cvtEOM = i => cvtBOM_EOM(data?.eom?.[i], eomRate(safeYr,i));
  const cvtINV = i => cvtINV_val(data?.inv?.[i], bomRate(safeYr,i));

  const cvtPNL = i => {
    const bom = data?.bom?.[i], eom = data?.eom?.[i];
    const invEUR = data?.inv?.[i] ?? 0;
    const rate_bom = bomRate(safeYr, i);
    const rate_eom = eomRate(safeYr, i);
    if(bom == null || eom == null) {
      const rawPnl = data?.pnl?.[i];
      if(rawPnl == null) return null;
      // rawPnl est dans l'unité native (€ ou $)
      if(eur)  return dataInEUR ? rawPnl                    : Math.round(rawPnl * rate_eom);
      else     return dataInEUR ? Math.round(rawPnl / rate_eom) : rawPnl;
    }
    // P&L = EOM_cible - BOM_cible - INV_cible
    const eomC = cvtBOM_EOM(eom, rate_eom);
    const bomC = cvtBOM_EOM(bom, rate_bom);
    const invC = eur ? invEUR : Math.round(invEUR / rate_bom);
    return eomC - bomC - invC;
  };

  // ── % FX-aware : P&L converti / BOM converti ─────────────────────────────
  const realPct = (data?.bom||[]).map((bom,i)=>{
    if(bom==null) return null;
    const pnl = cvtPNL(i);
    const bomC = cvtBOM(i);
    return (pnl!=null && bomC && bomC!==0) ? pnl/bomC : null;
  });

  const validPnlC = data?.m?.map((_,i)=>cvtPNL(i)).filter(v=>v!=null)??[];
  const validPct = realPct.filter(v=>v!=null);
  const ttlPnl = validPnlC.reduce((s,v)=>s+v,0);
  const avgPct = validPct.length?validPct.reduce((s,v)=>s+v,0)/validPct.length:0;
  const bestI  = realPct.reduce((bi,v,i)=>{if(v==null)return bi; return bi===-1||v>realPct[bi]?i:bi;}, -1);
  const worstI = realPct.reduce((wi,v,i)=>{if(v==null)return wi; return wi===-1||v<realPct[wi]?i:wi;}, -1);

  // Colors for bars
  const bclr = v => v==null?"transparent":v>=0?C.green:C.red;

  return(
    <div>
      {/* ── Sélecteur catégorie ── */}
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {[["crypto","₿ Crypto",C.btc],["stocks","📈 Actions",C.blue],["total","∑ Total",C.green]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setCat(k)} style={{
            flex:1,padding:"7px 4px",borderRadius:8,fontSize:11,fontWeight:700,
            border:`1px solid ${cat===k?c:C.border}`,cursor:"pointer",
            background:cat===k?c+"22":"transparent",color:cat===k?c:C.gray,
          }}>{l}</button>
        ))}
      </div>

      {/* ── Sélecteur année ── */}
      <div style={{display:"flex",gap:3,marginBottom:14,background:C.bg1,borderRadius:10,padding:4}}>
        {years.map(y=>(
          <button key={y} onClick={()=>setYr(y)} style={{
            flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:700,
            border:"none",cursor:"pointer",
            background:safeYr===y?catColor:"transparent",color:safeYr===y?"#000":C.gray,
          }}>{y}</button>
        ))}
      </div>

      {/* ── Résumé annuel ── */}
      {data&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[
            ["Total P&L",cur+(ttlPnl>=0?"+":"")+Math.round(ttlPnl).toLocaleString("fr-FR"),ttlPnl>=0?C.green:C.red],
            ["Moy./mois",fmtP(avgPct),avgPct>=0?C.green:C.red],
            ["Meilleur",bestI>=0?data.m[bestI]+" "+fmtP(realPct[bestI]):"—",C.green],
            ["Pire",worstI>=0?data.m[worstI]+" "+fmtP(realPct[worstI]):"—",C.red],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:C.bg1,borderRadius:8,padding:"8px 6px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:8,color:C.gray,marginBottom:3}}>{l}</div>
              <div style={{fontSize:11,fontWeight:800,color:c}}>{msk(v,hidden)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Graphique barres mensuelles ── */}
      {data&&(()=>{
        const vals = realPct;
        // P&L converti pour les labels des barres
        const pnlsC = data.m.map((_,i)=>cvtPNL(i));
        const mx = Math.max(...vals.filter(v=>v!=null).map(Math.abs), .01);
        const W=320, HTOP=52, HBOT=52, HLAB=14, HPNL=10, MIDLINE=HTOP;
        const TOTAL_H = HTOP + HBOT + HLAB + HPNL + 4;
        const n12=data.m.length, barW=Math.floor((W-16)/n12)-2, gap=2;
        const bx=i=>8+i*(barW+gap);
        return(
          <div style={{...crd(),marginBottom:14}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:8,fontWeight:700}}>
              Performance mensuelle {safeYr} — {cat==="crypto"?"Crypto":cat==="stocks"?"Actions":"Total"} {eur?"€":"$"}
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${TOTAL_H}`} style={{overflow:"visible",display:"block"}}>
              <line x1={4} y1={MIDLINE} x2={W-4} y2={MIDLINE} stroke={C.border} strokeWidth={0.8}/>
              {data.m.map((m,i)=>{
                const v=vals[i], pnl=pnlsC[i];
                const cx=bx(i)+barW/2;
                if(v==null) return(
                  <g key={i}>
                    <rect x={bx(i)} y={MIDLINE-1} width={barW} height={2} fill={C.bg3} rx={1}/>
                    <text x={cx} y={MIDLINE+HBOT+HLAB-2} textAnchor="middle" fill={C.text3} fontSize={6.5}>{m.slice(0,3)}</text>
                  </g>
                );
                const hpx=Math.max(2,Math.abs(v)/mx*(HTOP-8));
                const isPos=v>=0;
                const col=bclr(v);
                const barY=isPos?MIDLINE-hpx:MIDLINE;
                const barH=hpx;
                const lblY=isPos?MIDLINE-hpx-3:MIDLINE+hpx+9;
                const pnlY=isPos?MIDLINE-hpx-11:MIDLINE+hpx+18;
                return(
                  <g key={i}>
                    <rect x={bx(i)} y={barY} width={barW} height={barH}
                      fill={col} opacity={0.85} rx={2}/>
                    <text x={cx} y={lblY} textAnchor="middle"
                      fill={col} fontSize={6.5} fontWeight="800">
                      {fmtP(v,0)}
                    </text>
                    {pnl!=null&&(
                      <text x={cx} y={pnlY} textAnchor="middle"
                        fill={C.text3} fontSize={5.5}>
                        {pnl>=0?"+":""}{Math.round(pnl/1000)}k
                      </text>
                    )}
                    <text x={cx} y={MIDLINE+HBOT+HLAB-2} textAnchor="middle"
                      fill={i===bestI?C.green:i===worstI?C.red:C.text3}
                      fontSize={6.5} fontWeight={i===bestI||i===worstI?"800":"400"}>
                      {m.slice(0,3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })()}

      {/* ── Tableau mensuel détail ── */}
      {data&&(
        <div style={{...crd(),marginBottom:14,padding:"10px 8px"}}>
          <div style={{fontSize:10,color:C.gray,fontWeight:700,marginBottom:8}}>Détail mensuel</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr>
                  {["Mois","BOM","EOM","Investi",`P&L ${cur}`,"%"].map(h=>(
                    <th key={h} style={{padding:"4px 6px",color:C.gray,fontWeight:600,textAlign:h==="Mois"?"left":"right",borderBottom:`1px solid ${C.border}`,fontSize:9}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.m.map((m,i)=>{
                  const eomRaw=data.eom[i], bomRaw=data.bom[i];
                  const eomC = cvtEOM(i), bomC = cvtBOM(i), pnlC = cvtPNL(i), ivC = cvtINV(i);
                  // % toujours = P&L_USD / BOM_USD (ratio invariant)
                  const pct = realPct[i];
                  if(eomRaw==null&&bomRaw==null) return null;
                  return(
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
                      <td style={{padding:"5px 6px",color:C.text2,fontWeight:600}}>{m}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray}}>{bomC!=null?msk(cur+Math.round(bomC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text}}>{eomC!=null?msk(cur+Math.round(eomC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:ivC?C.teal:C.text3,fontWeight:ivC?700:400}}>{ivC?msk((ivC>0?"+":"")+Math.round(ivC).toLocaleString("fr-FR")+cur,hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pnlC)}}>{pnlC!=null?msk((pnlC>=0?"+":"")+Math.round(pnlC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pct)}}>{pct!=null?fmtP(pct):"—"}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:800}}>
                  {(()=>{
                    // BOM = premier mois converti
                    const firstI = data.bom?.findIndex(v=>v!=null) ?? -1;
                    const ttlBOM = firstI>=0 ? cvtBOM(firstI) : null;
                    // EOM = dernier mois converti
                    const lastI = [...(data.eom||[])].map((v,i)=>v!=null?i:-1).filter(i=>i>=0).pop() ?? -1;
                    const ttlEOM = lastI>=0 ? cvtEOM(lastI) : null;
                    // Somme investis convertis
                    const ttlInv2 = data.m.reduce((s,_,i)=>{const v=cvtINV(i); return v?s+v:s;},0);
                    // P&L total converti = somme des P&L mensuels FX-aware
                    const ttlPnlY = ttlPnl;
                    const ttlPctY = ttlBOM ? ttlPnlY / ttlBOM : 0;
                    return(<>
                      <td style={{padding:"5px 6px",color:C.text,fontSize:9}}>TOTAL</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray,fontSize:9}}>{ttlBOM!=null?msk(cur+Math.round(ttlBOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text,fontSize:9}}>{ttlEOM!=null?msk(cur+Math.round(ttlEOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:ttlInv2?C.teal:C.text3,fontSize:9}}>{ttlInv2?msk((ttlInv2>0?"+":"")+Math.round(ttlInv2).toLocaleString("fr-FR")+cur,hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(ttlPnlY),fontSize:9}}>{msk((ttlPnlY>=0?"+":"")+Math.round(ttlPnlY).toLocaleString("fr-FR"),hidden)}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(ttlPctY),fontSize:9,fontWeight:800}}>{fmtP(ttlPctY)}</td>
                    </>);
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Saisonnalité crypto (toutes années) ── */}
      {cat==="crypto"&&(
        <>
          <SH label="Saisonnalité historique — Crypto" color={C.btc}/>
          <div style={{...crd(),marginBottom:14}}>
            <div style={{fontSize:9,color:C.gray,marginBottom:8}}>Performance mensuelle moyenne (2020–2026)</div>
            {(()=>{
              const mx2=Math.max(...SEAS_CRYPTO.pct.map(Math.abs),.01);
              const WS=320, HT=44, HB=44, HLB=14, MIDL=HT;
              const TH=HT+HB+HLB;
              const n=SEAS_CRYPTO.m.length, bwS=Math.floor((WS-16)/n)-2;
              const bxS=i=>8+i*(bwS+2);
              return(
                <svg width="100%" viewBox={`0 0 ${WS} ${TH}`} style={{overflow:"visible",display:"block"}}>
                  <line x1={4} y1={MIDL} x2={WS-4} y2={MIDL} stroke={C.border} strokeWidth={0.8}/>
                  {SEAS_CRYPTO.m.map((m,i)=>{
                    const v=SEAS_CRYPTO.pct[i];
                    const cx=bxS(i)+bwS/2;
                    const hpx=Math.max(2,Math.abs(v)/mx2*(HT-6));
                    const isPos=v>=0; const col=bclr(v);
                    const barY=isPos?MIDL-hpx:MIDL;
                    const lblY=isPos?MIDL-hpx-3:MIDL+hpx+9;
                    return(
                      <g key={i}>
                        <rect x={bxS(i)} y={barY} width={bwS} height={hpx} fill={col} opacity={0.8} rx={2}/>
                        <text x={cx} y={lblY} textAnchor="middle" fill={col} fontSize={6} fontWeight="800">{fmtP(v,0)}</text>
                        <text x={cx} y={MIDL+HB+HLB-2} textAnchor="middle" fill={C.text3} fontSize={6.5}>{m.slice(0,3)}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}


/* ── CompareChart GDB.C vs GDB.S vs BTC — top-level pour Babel ── */
/* ═══════════════════════════════════════════════════════════
   GDB COMPARE CHART v10.2
   Toutes les courbes repartent de 100 au début de la timeframe
   sélectionnée — permet la comparaison de performance directe.
   Benchmark dynamique sur la même période.
═══════════════════════════════════════════════════════════ */
function GdbCompareChartGDB({onTFChange, liveGSB, liveGDBS, liveBench, liveGC}){
  const [tf, setTF]     = useState("YTD");
  const [hover, setHover] = useState(null);
  const [full, setFull]   = useState(false);
  const svgRef = useRef(null);

  const _GSB_data = liveGSB || GS_B100_EXT;
  const _GDBS_data = liveGDBS || GDBS;
  const _BENCH_data = liveBench || BENCH_IDX;
  // BENCH_IDX cols: [date, BTC, ETH, SP500, NASDAQ, MSCI]
  const lastGSB = _GSB_data.length > 0 ? _GSB_data[_GSB_data.length-1][0] : todayNC();
  const cutFn = days => { const d=new Date(new Date(lastGSB).getTime() - days*864e5); return d.toISOString().slice(0,10); };
  const TF_CUTS = {
    "1W": cutFn(7), "1M": cutFn(31), "MTD": lastGSB.slice(0,7)+"-01",
    "YTD": lastGSB.slice(0,4)+"-01-01", "1Y": cutFn(365), "2Y": cutFn(730), "ALL": "2020-01-01",
  };
  const cut = TF_CUTS[tf] || "2023-01-01";

  const _GC_data = liveGC || GC_FULL;
  const gcMap  = {};
  _GC_data.forEach(r=>{ if(r[1]!=null) gcMap[r[0]]=r[1]; });         // GC_FULL: [date, gdbC]
  (_GDBS_data||GDBS).forEach(r=>{ if(r[2]!=null) gcMap[r[0]]=r[2]; }); // GDBS plus récent écrase
  const benchMap = {}; _BENCH_data.forEach(r=>{ benchMap[r[0]]=r; });

  // Source de dates : BENCH_IDX couvre depuis 2020, GSB depuis ~2024 seulement
  const dateSource = _BENCH_data.length > _GSB_data.length ? _BENCH_data : _GSB_data;
  const dates = dateSource.map(r=>r[0]).filter(d=>d>=cut);
  const n = dates.length;

  const rebase = (vals) => {
    const first = vals.find(v=>v!=null);
    if(!first) return vals.map(()=>null);
    return vals.map(v=>v!=null ? round2(v/first*100) : null);
  };

  const gcRaw  = dates.map(d=>gcMap[d]||null);
  const gsRaw  = dates.map(d=>{ const g=_GSB_data.find(x=>x[0]===d); return g&&g[1]!=null?g[1]:null; });
  const btcRaw = dates.map(d=>{ const r=benchMap[d]; return r?r[1]:null; }); // BTC
  const spRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[3]:null; }); // SP500
  const nqRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[4]:null; }); // NASDAQ
  const ethRaw = dates.map(d=>{ const r=benchMap[d]; return r?r[2]:null; }); // ETH
  const msRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[5]:null; }); // MSCI

  const gcB  = rebase(gcRaw);
  const gsB  = rebase(gsRaw);
  const btcB = rebase(btcRaw);
  const spB  = rebase(spRaw);
  const nqB  = rebase(nqRaw);
  const ethB = rebase(ethRaw);
  const msB  = rebase(msRaw);

  const allVals = [...gcB,...gsB,...btcB,...spB,...nqB,...ethB,...msB].filter(v=>v!=null);
  if(!n||!allVals.length) return null;

  const mn=Math.min(...allVals), mx=Math.max(...allVals), rng=mx-mn||1;
  const W=300, H=110, PL=28, PR=8, IW=W-PL-PR;
  const px=i=>PL+i/(n-1)*IW;
  const py=v=>v==null?null:H-((v-mn)/rng)*(H-4)+2;

  /* Interaction touch/mouse */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PL;
    return Math.min(n-1, Math.max(0, Math.round(svgX / (IW/(n-1)))));
  };
  const onMove  = e => { if(!svgRef.current) return; setHover({i:getIdx(e.clientX, svgRef.current.getBoundingClientRect())}); };
  const _tm3=useRef(false),_ts3=useRef(0);
  const onTouch = e => { e.preventDefault(); if(!svgRef.current) return; const t=e.touches[0]||e.changedTouches[0]; if(e.type==="touchstart"){_tm3.current=false;_ts3.current=t.clientX;}else{_tm3.current=Math.abs(t.clientX-_ts3.current)>4;} setHover({i:getIdx(t.clientX, svgRef.current.getBoundingClientRect())}); };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm3.current)setHover(null);};

  const mkLine=(vals,col,bold)=>{
    const pts=vals.map((v,i)=>v!=null?`${px(i)},${py(v)}`:null).filter(Boolean).join(" ");
    return pts?<polyline key={col} points={pts} fill="none" stroke={col} strokeWidth={full?(bold?1.2:0.7):(bold?2.2:1.3)} opacity={full?0.8:.85}/>:null;
  };

  const lastPerf=(vals)=>{ const last=vals.filter(v=>v!=null).at(-1); return last!=null?last-100:null; };
  const handleTF = t => { setTF(t); setHover(null); onTFChange&&onTFChange(t); };
  const xLabel = d => { const [y,m,day]=d.split("-"); return (tf==="1W"||tf==="1M"||tf==="MTD")?`${parseInt(day)}/${m}`:`${m}/${y.slice(2)}`; };
  const step = Math.max(1,Math.floor(n/5));
  const gridVals = [mn,(mn+mx)/2,mx].map(v=>Math.round(v));

  const hi = hover?.i;

  /* Tooltip data au hover */
  const hDate = hi!=null ? dates[hi] : null;
  const SERIES = [
    {vals:gcB,  col:"#F7931A", lbl:"CGIC"},
    {vals:gsB,  col:"#EF4444", lbl:"CGIS"},
    {vals:btcB, col:"#FBBF24", lbl:"BTC"},
    {vals:ethB, col:"#1E40AF", lbl:"ETH"},
    {vals:nqB,  col:"#10B981", lbl:"Nasdaq"},
    {vals:msB,  col:"#EC4899", lbl:"MSCI"},
    {vals:spB,  col:"#6B7280", lbl:"S&P"},
  ];

  const vw = typeof window!=="undefined"?window.innerWidth:390;
  const vh = typeof window!=="undefined"?window.innerHeight:844;

  /* ── Chart content (shared between normal + fullscreen) ── */
  const chartBody = (
    <>
      {/* TF selector */}
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {["1W","1M","MTD","YTD","1Y","2Y","ALL"].map(t=>(
          <button key={t} onClick={()=>handleTF(t)} style={{
            flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
            border:"none",cursor:"pointer",
            background:tf===t?C.btc:"transparent",color:tf===t?"#000":C.gray,
          }}>{t}</button>
        ))}
      </div>

      {/* Tooltip fixe — au-dessus des encarts GDB.C et GDB.S */}
      {hover!=null && hDate && (
        <div style={{
          position:"fixed", top:100, left:"50%", transform:"translateX(-50%)",
          zIndex:200, width:"92%", maxWidth:410,
          background:"rgba(10,12,18,.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"7px 12px",
          display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",
          boxShadow:"0 6px 24px rgba(0,0,0,.85)",
          pointerEvents:"none",
        }}>
          <div style={{fontSize:10,color:"#fff",fontWeight:800,width:"100%",textAlign:"center",marginBottom:2}}>
            {fmtDate(hDate)}
          </div>
          {SERIES.map(({vals,col,lbl})=>{
            const v = vals[hi];
            if(v==null) return null;
            const perf = v-100;
            return(
              <div key={lbl} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <div style={{width:7,height:7,borderRadius:2,background:col}}/>
                  <span style={{fontSize:8,color:C.text2}}>{lbl}</span>
                </div>
                <span style={{fontSize:11,fontWeight:800,color:perf>=0?C.green:C.red}}>{perf>=0?"+":""}{perf.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* SVG */}
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H+20}`}
        style={{overflow:"visible",touchAction:"none",userSelect:"none"}}
        onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>
        {gridVals.map((v,i)=>(
          <g key={i}>
            <line x1={PL} y1={py(v)} x2={W-PR} y2={py(v)} stroke={C.border} strokeWidth={0.4}/>
            <text x={PL-3} y={py(v)+3} textAnchor="end" fill={C.text3} fontSize={6}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={py(100)} x2={W-PR} y2={py(100)} stroke="rgba(255,255,255,.15)" strokeWidth={.8} strokeDasharray="3,3"/>
        {mkLine(gcB,"#F7931A",true)}{mkLine(gsB,"#EF4444",true)}
        {mkLine(btcB,"#FBBF24",false)}{mkLine(ethB,"#1E40AF",false)}
        {mkLine(nqB,"#10B981",false)}{mkLine(msB,"#EC4899",false)}{mkLine(spB,"#6B7280",false)}
        {/* Crosshair */}
        {hi!=null && <>
          <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
          {SERIES.map(({vals,col})=>{ const v=vals[hi]; if(v==null)return null; return <g key={col}><circle cx={px(hi)} cy={py(v)} r={4} fill={C.bg1} stroke={col} strokeWidth={2}/><circle cx={px(hi)} cy={py(v)} r={1.6} fill={col}/></g>; })}
        </>}
        {dates.map((d,i)=>{
          if(i!==0&&i!==n-1&&i%step!==0) return null;
          return <text key={i} x={px(i)} y={H+13} textAnchor="middle" fill={hi===i?"#fff":C.text3} fontSize={5.5}>{xLabel(d)}</text>;
        })}
      </svg>

      {/* Legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",paddingTop:5,borderTop:`1px solid ${C.border}`}}>
        {SERIES.map(({col,lbl,vals})=>{
          const p=lastPerf(vals);
          return(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:10,height:2,background:col,borderRadius:1}}/>
              <span style={{fontSize:8,color:C.gray}}>{lbl}</span>
              {p!=null&&<span style={{fontSize:8,fontWeight:700,color:p>=0?C.green:C.red}}>{p>=0?"+":""}{p.toFixed(1)}%</span>}
            </div>
          );
        })}
      </div>
    </>
  );

  return full ? (
    <div style={{
      position:"fixed",inset:0,zIndex:1000,background:C.bg,
      display:"flex",flexDirection:"column",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:C.bg1,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:800,color:C.btc}}>CGIC · CGIS · Benchmarks</span>
        <button onClick={()=>setFull(false)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 14px",color:C.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>{chartBody}</div>
    </div>
  ) : (
    <div style={{background:C.bg1,borderRadius:12,padding:"10px 10px 6px",border:`1px solid ${C.border}`,marginBottom:12,position:"relative"}}>
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute",top:8,right:8,zIndex:10,
        background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,
        width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",fontSize:11,color:C.gray,
      }}>⛶</button>
      {chartBody}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE GDB  v10
   1. Récapitulatif GDB.C + GDB.S (nb parts, valeur fonds, cours, perfs)
   2. Graphique comparaison benchmarks (GDB.S en rouge)
   3. Benchmark YTD corrigé
   4. Graphique GDB.C cours + Graphique GDB.S cours
═══════════════════════════════════════════════════════════ */
/* ── FondCard: récapitulatif d'un fonds ── */
function FondCard({label, cours, qty, fonds, color, perfs, hidden, eur, usdEur, perfAllTime}){
  // label format: "GDB.C — CRYPTO" or "GDB.S — ACTIONS"
  const [titre, sousTitre] = label.split(" — ");
  // perfAllTime passé depuis PageGDB (corrigé €/$), fallback sur calcul local en €
  const perfCreation = perfAllTime != null ? perfAllTime : (eur ? (cours*(usdEur||0.852))/10-1 : cours/10-1);
  const pUp = perfCreation >= 0;
  const affCours = eur ? "€"+(cours*(usdEur||0.852)).toFixed(2) : "$"+cours.toFixed(2);
  const affFonds = eur ? "€"+fmtK(Math.round(fonds*(usdEur||0.852))) : "$"+fmtK(fonds);

  // Perfs 1J, 1S, 1M seulement (3 premières)
  const perfs3 = perfs.slice(0,3);

  return(
    <div style={{
      background:C.bg1,
      borderRadius:C.radius||14,
      border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${color}`,
      padding:"12px 12px",
      marginBottom:12,
      position:"relative",
      overflow:"hidden",
    }}>
      {/* Halo décoratif */}
      <div style={{
        position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",
        background:`radial-gradient(circle,${color}18,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      {/* Titre */}
      <div style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
        <span style={{color}}>{titre}</span>
        {sousTitre&&<span style={{color:C.gray}}>{" — "}{sousTitre}</span>}
      </div>

      {/* Cours + perf création */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:26,fontWeight:900,color,letterSpacing:-1,lineHeight:1}}>
          {msk(affCours, hidden)}
        </div>        <div style={{textAlign:"right"}}>
          <div style={{fontSize:14,fontWeight:800,color:pUp?C.green:C.red}}>
            {fmtP(perfCreation)}
          </div>
          <div style={{fontSize:9,color:C.gray,letterSpacing:.3}}>depuis création</div>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{height:1,background:C.border,marginBottom:12}}/>

      {/* Fonds + Parts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,marginBottom:14}}>
        <div>
          <div style={{fontSize:8,color:C.gray,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Fonds</div>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{msk(affFonds, hidden)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:8,color:C.gray,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Valeur fonds</div>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{msk(affFonds, hidden)}</div>
        </div>
      </div>

      {/* Perfs 1J / 1S / 1M */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {perfs3.map(([l,v])=>(
          <div key={l} style={{
            background:C.bg2,borderRadius:8,padding:"7px 0",textAlign:"center",
            border:`1px solid ${C.border}`,
          }}>
            <div style={{fontSize:9,color:C.gray,marginBottom:3,letterSpacing:.5}}>{l}</div>
            <div style={{fontSize:13,fontWeight:800,color:v!=null?clr(v):C.gray}}>
              {v!=null?fmtP(v):"—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageGDB({chartData,hidden,EFF,eur,liveGSB,liveGDBS,liveBench,liveGC,liveDD}){
  const [benchTF, setBenchTF] = useState("YTD");
  const src = EFF||CURRENT;
  const usdEurNow = src.usdEur;
  const _GDBS = liveGDBS || GDBS;
  const _DD   = liveDD   || DD;

  // v1.03+ — Perfs live (24h / 7j / 30j), pondérées, calculées depuis les prix live
  const [perf24h, setPerf24h] = useState({crypto:{d:null,w:null,m:null}, stocks:{d:null,w:null,m:null}, loading:true});
  useEffect(()=>{
    let alive=true;
    setPerf24h(p=>({...p, loading:true}));
    fetchPerf24h(src).then(r=>{ if(alive) setPerf24h({crypto:r.crypto, stocks:r.stocks, loading:false}); })
      .catch(()=>{ if(alive) setPerf24h({crypto:{d:null,w:null,m:null}, stocks:{d:null,w:null,m:null}, loading:false}); });
    return ()=>{ alive=false; };
  }, [src.crypto?.total, src.stocks?.total]);

  // Prix actuels GDB.C et GDB.S
  const {gdbC: gcToday, gdbS: gsToday_calc} = calcGdbPrices(src);
  const gdbs2026 = _GDBS.filter(r=>r[0]>='2026-01-01');
  const gsToday  = gdbs2026[gdbs2026.length-1]?.[1] || src.gdbS;

  // Prix à une date donnée depuis GDBS
  const gsPriceAt = d => { for(let i=_GDBS.length-1;i>=0;i--) if(_GDBS[i][0]<=d) return _GDBS[i][1]; return _GDBS[0]?.[1]||src.gdbS; };
  const gcPriceAt = d => { for(let i=_GDBS.length-1;i>=0;i--) if(_GDBS[i][0]<=d) return _GDBS[i][2]; return _GDBS[0]?.[2]||src.gdbC; };

  // Taux USD/EUR à une date donnée depuis DD (col 5 = usdEur)
  const usdEurAt = d => {
    const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=d&&r[5]?r:null),null);
    return row ? row[5] : usdEurNow;
  };

  // Dates dynamiques depuis makeTFCuts
  const TF = makeTFCuts();
  const d1   = TF["1W"];  // ~7j
  const d7   = TF["1M"];  // ~30j (on réutilise les cuts existants)
  const d30  = TF["1M"];
  const dytd = TF["YTD"];

  // Perf corrigée du taux si mode €
  const gsPerf = d => {
    const ref = gsPriceAt(d); if(!ref) return null;
    if(eur){ const usdRef=usdEurAt(d); return (gsToday*usdEurNow)/(ref*usdRef)-1; }
    return gsToday/ref-1;
  };
  const gcPerf = d => {
    const ref = gcPriceAt(d); if(!ref) return null;
    if(eur){ const usdRef=usdEurAt(d); return (gcToday*usdEurNow)/(ref*usdRef)-1; }
    return gcToday/ref-1;
  };
  // Depuis création GDB.C : 10€ = 10.88$ au 25 mars 2020
  const GC_CREATION_USD = 10.88;
  const GC_CREATION_DATE = "2020-03-25";
  // Depuis création GDB.S : 10€ = 11.67$ au 19 août 2025
  const GS_CREATION_USD = 11.67;
  const GS_CREATION_DATE = "2025-08-19";

  // ALL-TIME : prix de création = 10€ dans les deux cas
  // En € : perf = (cours_actuel_$  * usdEur_actuel) / 10€ - 1
  // En $ : perf = cours_actuel_$ / cours_création_$ - 1
  // (usdEurAt(2020-03-25) peut ne pas être dans DD → on utilise le prix € création = 10€ fixe)
  const GC_CREATION_EUR = 10.0;  // toujours 10€ à la création
  const GS_CREATION_EUR = 10.0;

  const gcPerfAllTime = eur
    ? (gcToday * usdEurNow) / GC_CREATION_EUR - 1           // cours actuel en € / 10€
    : gcToday / GC_CREATION_USD - 1;                         // cours actuel en $ / 10.88$

  const gsPerfAllTime = eur
    ? (gsToday * usdEurNow) / GS_CREATION_EUR - 1           // cours actuel en € / 10€
    : gsToday / GS_CREATION_USD - 1;                         // cours actuel en $ / 11.67$

  const gsYTD = gsPerf(dytd);

  const {gdbS: gcS_calc, gdbC: gcC_calc, gdbSfondsUSD} = calcGdbPrices(src);
  const gcQty   = GDB_C_NB_PARTS;
  const gcFonds = Math.round(src.crypto.total);
  const gsQty   = GDB_S_NB_PARTS;
  const gsFonds = Math.round(gdbSfondsUSD || (src.stocks.items.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val,0) + (src.stocks.items.find(x=>x.t==="EURO")?.val||0)));


  const bench = (()=>{
    const TF_CUTS = makeTFCuts();
    const cut = TF_CUTS[benchTF]||"2023-01-01";
    const GS_BASE = 11.7681;
    const _gcData = liveGC || GC_FULL;
    const _gsbData = liveGSB || GS_B100_EXT;
    const _benchData = liveBench || BENCH_IDX;

    // Maps — valeurs null exclues
    const gcMap2 = {}; _gcData.forEach(r=>{ if(r[1]!=null) gcMap2[r[0]]=r[1]; });
    const gsMap3 = {}; _gsbData.forEach(r=>{ if(r[1]!=null) gsMap3[r[0]]=r[1]/100*GS_BASE; });
    const dbMap3 = {}; _benchData.forEach(r=>{ if(r[1]!=null) dbMap3[r[0]]=r; });

    // Derniers points non-null
    const gcLast = _gcData.length>0 ? _gcData[_gcData.length-1][1] : calcGdbPrices(CURRENT).gdbC;
    const gsLast = _gsbData.reduceRight((a,r)=>a!=null?a:(r[1]!=null?r[1]/100*GS_BASE:null),null);
    const dbLast = _benchData.reduceRight((a,r)=>a!=null?a:(r[1]!=null?r:null),null);

    // Premier point non-null à partir de cut
    const fwd = (m, c) => {
      const keys = Object.keys(m).filter(d=>d>=c).sort();
      return keys.length ? m[keys[0]] : null;
    };

    // Taux de change au cut (premier point DD >= cut)
    const usdEurCut = (()=>{
      const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=cut&&r[5]?r:null),null);
      return row ? row[5] : usdEurNow;
    })();

    const fxPerf = (now, start) => {
      if(!start || !now) return null;
      if(eur) return (now*usdEurNow)/(start*usdEurCut)-1;
      return now/start-1;
    };

    const pGC = ()=>{ const s=fwd(gcMap2,cut); return fxPerf(gcLast,s); };
    const pGS = ()=>{
      const ytdStart = gsMap3['2026-01-01']||GS_BASE;
      const s = cut<'2026-01-01' ? ytdStart : fwd(gsMap3,cut);
      return fxPerf(gsLast,s);
    };
    const pDB = col=>{
      const colMap = {}; _benchData.forEach(r=>{ if(r[col]!=null) colMap[r[0]]=r[col]; });
      const s=fwd(colMap,cut), e=colMap[Object.keys(colMap).filter(d=>d<=(_benchData[_benchData.length-1]?.[0]||'9')).sort().at(-1)];
      return fxPerf(e,s);
    };

    return [
      {n:"CGIC",  v:pGC(),  ic:"₿",  color:C.btc},
      {n:"CGIS",  v:pGS(),  ic:"📈", color:C.red},
      {n:"Bitcoin",v:pDB(2), ic:"🟠", color:"#F7931A"},
      {n:"S&P 500",v:pDB(3), ic:"🇺🇸",color:"#6B7280"},
      {n:"Nasdaq", v:pDB(4), ic:"🖥",  color:"#10B981"},
      {n:"ETH",    v:pDB(5), ic:"🔵", color:"#1E40AF"},
      {n:"MSCI",   v:pDB(5), ic:"🌍", color:"#EC4899"},
    ];
  })();

  return(
    <div>
      {/* v1.03 — Performance 24h (réelle, pondérée par portefeuille) */}
      {(()=>{
        const Cell = (lbl, v, accent) => {
          const has = typeof v === "number";
          const col = !has ? C.gray : v>=0 ? C.green : C.red;
          return (
            <div style={{flex:1, background:C.bg1, border:`1px solid ${C.border}`, borderRadius:12,
              padding:"12px 14px", display:"flex", flexDirection:"column", gap:4}}>
              <div style={{display:"flex", alignItems:"center", gap:6}}>
                <span style={{width:8,height:8,borderRadius:4,background:accent,display:"inline-block"}}/>
                <span style={{fontSize:11, fontWeight:700, color:C.text2, letterSpacing:.3}}>{lbl}</span>
              </div>
              <span style={{fontSize:22, fontWeight:900, color:col, letterSpacing:-.5}}>
                {perf24h.loading ? <span className="pulse" style={{color:C.text3}}>…</span>
                 : !has ? "—" : (v>=0?"+":"")+(v*100).toFixed(2)+"%"}
              </span>
            </div>
          );
        };
        return (
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10, fontWeight:700, color:C.gray, textTransform:"uppercase",
              letterSpacing:.6, marginBottom:6, paddingLeft:2}}>Performance 24 h</div>
            <div style={{display:"flex", gap:8}}>
              {Cell("Crypto", perf24h.crypto?.d, C.btc)}
              {Cell("Actions", perf24h.stocks?.d, C.blue)}
            </div>
          </div>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
        {(()=>{
          // v1.03 — Perfs réelles depuis les données mensuelles de l'utilisateur
          const compoundAll = (OBJ) => {
            let c=1, has=false;
            Object.keys(OBJ).sort().forEach(y=>{
              (OBJ[y].pct||[]).forEach(p=>{ if(typeof p==="number"){ c*=(1+p); has=true; } });
            });
            return has ? c-1 : null;
          };
          const lastMonthPct = (OBJ) => {
            const ys=Object.keys(OBJ).sort(); if(!ys.length) return null;
            const arr=OBJ[ys[ys.length-1]].pct||[];
            for(let i=arr.length-1;i>=0;i--) if(typeof arr[i]==="number") return arr[i];
            return null;
          };
          const gcAll = compoundAll(CRYPTO_MONTHLY);
          const gsAll = compoundAll(STOCKS_MONTHLY);
          const cP = perf24h.loading ? {} : (perf24h.crypto||{});
          const sP = perf24h.loading ? {} : (perf24h.stocks||{});
          return (<>
        <FondCard label="CGIC — CRYPTO" cours={gcToday} qty={gcQty} fonds={gcFonds} color={C.btc} hidden={hidden}
          eur={eur} usdEur={src.usdEur} perfAllTime={gcAll}
          perfs={[["1J",cP.d??null],["1S",cP.w??null],["1M",cP.m??null]]}/>
        <FondCard label="CGIS — ACTIONS" cours={gsToday} qty={gsQty} fonds={gsFonds} color={C.blue} hidden={hidden}
          eur={eur} usdEur={src.usdEur} perfAllTime={gsAll}
          perfs={[["1J",sP.d??null],["1S",sP.w??null],["1M",sP.m??null]]}/>
          </>);
        })()}
      </div>

      <SH label="Comparaison — base 100 au départ de la période" color={C.gray}/>
      <GdbCompareChartGDB onTFChange={setBenchTF} liveGSB={liveGSB} liveGDBS={liveGDBS} liveBench={liveBench} liveGC={liveGC}/>

      <SH label={`Benchmark — ${benchTF}`} color={C.gray}/>
      <div style={crd()}>
        {bench.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<bench.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:13,width:20}}>{b.ic}</span>
            <span style={{fontSize:12,flex:1,color:C.text2,fontWeight:600}}>{b.n}</span>
            <div style={{width:80,height:5,background:C.bg3,borderRadius:3,position:"relative",overflow:"hidden"}}>
              {b.v!=null&&<div style={{position:"absolute",left:b.v<0?Math.max(50+b.v*200,0)+"%":"50%",top:0,height:"100%",width:Math.min(Math.abs(b.v)*200,50)+"%",background:b.color,borderRadius:3}}/>}
            </div>
            <span style={{fontSize:12,fontWeight:800,color:b.v!=null?clr(b.v):C.gray,width:52,textAlign:"right"}}>
              {b.v!=null?fmtP(b.v):"—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE TRADES
═══════════════════════════════════════════════════════════ */
function PageTrades({txns,onAdd,onDel,hidden=false,EFF,onTradeApplied,showAdd:showAddProp,setShowAdd:setShowAddProp}){
  const[showAddLocal,setShowAddLocal]=useState(false);
  const showAdd    = showAddProp    !== undefined ? showAddProp    : showAddLocal;
  const setShowAdd = setShowAddProp !== undefined ? setShowAddProp : setShowAddLocal;
  const[filter,setFilter]=useState("ALL");
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  const fil=txns.filter(t=>filter==="ALL"||t.side.toUpperCase()===filter);
  const pos={};
  txns.forEach(t=>{
    const k=t.ticker.toUpperCase();
    if(!pos[k])pos[k]={t:k,bq:0,sq:0,bc:0};
    if(t.side.toUpperCase()==="BUY"){pos[k].bq+=t.qty;pos[k].bc+=t.qty*t.price;}
    else pos[k].sq+=t.qty;
  });
  const submit=()=>{
    if(!form.qty||!form.price||!form.ticker)return;
    const src = EFF||CURRENT;
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price) * src.eurUsd
      : parseFloat(form.price);
    const trade={...form,qty:parseFloat(form.qty),price:priceUSD,priceRaw:parseFloat(form.price),currency:form.currency,id:uid(),bankAccount:form.bank||"Aucune"};
    onAdd(trade);
    onTradeApplied(trade);
    setShowAdd(false);
    setForm({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  };

  return(
    <div>
      <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:C.green+"22",border:`1px solid ${C.green}`,borderRadius:10,padding:"11px 0",color:C.green,fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:14}}>
        + Enregistrer achat / vente
      </button>

      <div style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:4,marginBottom:14}}>
        {[["ALL","Toutes"],["BUY","Achats"],["SELL","Ventes"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:filter===v?(v==="BUY"?C.green:v==="SELL"?C.red:C.btc):"transparent",color:filter===v?"#fff":C.gray}}>{l}</button>
        ))}
      </div>

      <SH label="Positions cumulées" color={C.gray}/>
      <div style={{...crd(),padding:"12px"}}>
        {Object.values(pos).map((p,i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
            <div>
              <span style={{fontSize:13,fontWeight:800,color:C.btc}}>{p.t}</span>
              {p.sq>0&&<span style={{fontSize:10,color:C.red,marginLeft:6}}>Vendu: {p.sq.toFixed(3)}</span>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:700}}>Net: {(p.bq-p.sq).toFixed(4)}</div>
              <div style={{fontSize:10,color:C.gray}}>PA: {hidden?"***":"$"+(p.bc/p.bq).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <SH label={`Journal (${fil.length})`} color={C.gray}/>
      {fil.map(t=>{
        const buy=t.side.toUpperCase()==="BUY",valo=t.qty*t.price;
        return(
          <div key={t.id} style={{...crd(),display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
            <div style={{width:34,height:34,borderRadius:9,background:(buy?C.green:C.red)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,color:buy?C.green:C.red,fontWeight:800}}>{buy?"↓":"↑"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:13,fontWeight:800}}>{t.ticker.toUpperCase()}</span>
                  <span style={{fontSize:9,color:buy?C.green:C.red,background:(buy?C.green:C.red)+"22",padding:"1px 5px",borderRadius:4,fontWeight:700}}>{t.side.toUpperCase()}</span>
                </div>
                <span style={{fontSize:13,fontWeight:800,color:buy?C.green:C.red}}>{hidden?"***":(buy?"-":"+")+"$"+fmt(valo)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                <span style={{fontSize:10,color:C.gray}}>{t.date} · {t.qty} × {hidden?"***":"$"+fmt(t.price)}</span>
                {t.note&&<span style={{fontSize:10,color:C.text3,fontStyle:"italic"}}>{t.note}</span>}
              </div>
            </div>
            <button onClick={()=>onDel(t.id)} style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:16,padding:"0 4px"}}>×</button>
          </div>
        );
      })}


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SNAPSHOT MODAL
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   TRADE MODAL — top-level pour s'afficher depuis n'importe quel onglet
═══════════════════════════════════════════════════════════ */
/* ── YahooTickerSearch : recherche de tickers par nom via Yahoo Finance ──── */
function YahooTickerSearch({onSelect}){
  var query_s=useState(""); var query=query_s[0]; var setQuery=query_s[1];
  var results_s=useState([]); var results=results_s[0]; var setResults=results_s[1];
  var loading_s=useState(false); var loading=loading_s[0]; var setLoading=loading_s[1];
  var error_s=useState(null); var error=error_s[0]; var setError=error_s[1];
  var timer_s=useState(null); var timer=timer_s[0]; var setTimer=timer_s[1];

  var EU_SUFFIXES=[".PA",".MI",".AS",".BR",".DE",".F",".HA",".L",".SW",".CO",".ST",".MC",".AMS"];

  function doSearch(q){
    var q2=(q||query).trim();
    if(!q2||q2.length<2){setResults([]);return;}
    setLoading(true); setError(null);
    // Passer par le worker Cloudflare qui n'a pas de contrainte CORS
    fetch(CF_WORKER_URL+"/search?q="+encodeURIComponent(q2),{
      headers:{"X-Auth-Key":CF_AUTH_KEY},
      signal:AbortSignal.timeout(8000),
    })
      .then(function(r){return r.json();})
      .then(function(data){
        if(data.error) throw new Error(data.error);
        setResults(data.quotes||[]);
        if((data.quotes||[]).length===0) setError("Aucun résultat pour «"+q2+"»");
      })
      .catch(function(e){setResults([]);setError("Erreur: "+e.message);})
      .finally(function(){setLoading(false);});
  }

  function handleChange(v){
    setQuery(v);
    if(timer) clearTimeout(timer);
    var t=setTimeout(function(){doSearch(v);},200);
    setTimer(t);
  }

  return(
    <div>
      <div style={{fontSize:10,color:C.gray,marginBottom:4,fontWeight:600}}>🔍 Rechercher par nom de société</div>
      <div style={{display:"flex",gap:6}}>
        <input value={query} onChange={function(e){handleChange(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter") doSearch(query);}}
          placeholder="Ex: Nvidia, TotalEnergies, Bitcoin..."
          style={{flex:1,background:C.bg3,border:"1px solid "+C.border,borderRadius:8,
            padding:"8px 10px",color:C.text,fontSize:13,outline:"none"}}/>
        <button onClick={function(){doSearch(query);}} disabled={loading||query.length<2}
          style={{padding:"8px 12px",borderRadius:8,background:C.teal,border:"none",
            color:"#000",fontSize:12,fontWeight:700,cursor:query.length<2?"default":"pointer",
            opacity:query.length<2?0.5:1}}>
          {loading?"↻":"🔍"}
        </button>
      </div>
      {error&&<div style={{fontSize:10,color:C.red,marginTop:4}}>{error}</div>}
      {results.length>0&&(
        <div style={{background:C.bg3,borderRadius:8,border:"1px solid "+C.teal+"66",marginTop:4,overflow:"hidden"}}>
          {results.map(function(q,i){
            var isEU=EU_SUFFIXES.some(function(s){return q.symbol.endsWith(s);});
            return(
              <div key={i} onClick={function(){
                var base=q.symbol.includes(".")?q.symbol.split(".")[0]:q.symbol;
                onSelect({ticker:base,yahooSym:q.symbol,name:q.shortname,currency:isEU?"EUR":"USD"});
                setQuery(q.shortname+" ("+q.symbol+")");
                setResults([]);
              }} style={{
                padding:"8px 12px",cursor:"pointer",
                borderBottom:i<results.length-1?"1px solid "+C.border+"44":"none",
                display:"flex",justifyContent:"space-between",alignItems:"center",
              }}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{q.symbol}</div>
                  <div style={{fontSize:10,color:C.text2,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.shortname}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:C.gray}}>{q.exchange}</div>
                  <div style={{fontSize:9,color:isEU?C.blue:C.green}}>{isEU?"🇪🇺 EUR":"🇺🇸 USD"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TradeModal({onClose, onAdd, onTradeApplied, EFF}){
  const[mode,setMode]=useState("trade");
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  const[showNew,setShowNew]=useState(false);
  const[depot,setDepot]=useState({date:today(),bank:"BCI",montant:"",type:"depot",note:""});
  const[confirm,setConfirm]=useState(false);
  const[done,setDone]=useState(null); // {type, montant, bank} après succès
  const src = EFF||CURRENT;

  const submitDepot=()=>{
    if(!depot.montant||!depot.bank) return;
    const montantEUR = parseFloat(depot.montant);
    if(isNaN(montantEUR)||montantEUR<=0) return;
    const isRetrait = depot.type==="retrait";
    const delta = isRetrait ? -montantEUR : montantEUR;
    const trade = {
      id:uid(), date:depot.date, side: isRetrait ? "RETRAIT" : "DEPOT",
      ticker:"CASH", qty:montantEUR, price:1,
      currency:"EUR", bankAccount:depot.bank,
      note:depot.note||(isRetrait?"Retrait "+depot.bank:"Dépôt "+depot.bank),
      isDeposit:true,
    };
    onAdd(trade);
    const newBank = {
      ...src.bank,
      breakdown:{...src.bank.breakdown, [depot.bank]:(src.bank.breakdown[depot.bank]||0)+delta},
      totalEUR: src.bank.totalEUR + delta,
    };
    onTradeApplied({...trade, _directBank: newBank});
    setDone({type:isRetrait?"retrait":"depot", montant:montantEUR, bank:depot.bank});
  };

  const submit=()=>{
    const resolvedTicker = form.ticker==="NOUVEAU" ? (form.newTicker||"").toUpperCase() : form.ticker;
    if(!form.qty||!form.price||!resolvedTicker)return;
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price)*src.eurUsd
      : parseFloat(form.price);    const valoUSD = parseFloat(form.qty)*priceUSD;
    const valoEUR = Math.round(valoUSD*src.usdEur);
    // Enregistrer Yahoo symbol et icône pour nouveau token
    if(form.ticker==="NOUVEAU"){
      const yahooSym = (form.yahooSymbol||"").trim() || resolvedTicker;
      YF_MAP[resolvedTicker] = yahooSym;
      if(form.newIcon) {
        setIconDb(resolvedTicker, { user: form.newIcon });
        // Sauvegarde immédiate en KV (sans attendre le snapshot)
        fetch(CF_WORKER_URL+"/write-bases", {
          method:"POST",
          headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
          body: JSON.stringify({ gdb_icons: serializeIconDb(), gdb_yfmap: YF_MAP }),
          signal: AbortSignal.timeout(10000),
        }).catch(()=>{});
      }
    }
    const trade={...form, ticker:resolvedTicker, qty:parseFloat(form.qty),
      price:priceUSD, priceRaw:parseFloat(form.price), currency:form.currency,
      id:uid(), bankAccount:form.bank||"Aucune"};
    onAdd(trade);
    onTradeApplied(trade);
    setShowNew(false);
    setDone({type:"trade", side:form.side, ticker:resolvedTicker, qty:parseFloat(form.qty), valoUSD, valoEUR, bank:form.bank, note:form.note, date:form.date});
  };

  return(
    <Modal title="Transaction" onClose={onClose}>
      {done ? (
        /* ── Écran de confirmation après opération ── */
        <div style={{padding:"8px 0"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:C.green,marginBottom:4}}>
              {done.type==="trade"
                ? (done.side==="BUY" ? "Achat enregistré" : "Vente enregistrée")
                : done.type==="retrait" ? "Retrait effectué" : "Dépôt effectué"}
            </div>
            <div style={{fontSize:12,color:C.text3}}>{done.date}</div>
          </div>
          <div style={{background:C.bg2,borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",flexDirection:"column",gap:8}}>
            {done.type==="trade" ? (<>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:C.text2}}>Ticker</span>
                <span style={{fontSize:13,fontWeight:800,color:C.text}}>{done.ticker}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Quantité</span>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{done.qty}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Montant</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:done.side==="BUY"?C.red:C.green}}>
                    {done.side==="BUY"?"-":"+"}${fmt(done.valoUSD)}
                  </div>
                  <div style={{fontSize:10,color:C.text3}}>{done.side==="BUY"?"-":"+"}€{fmt(done.valoEUR)}</div>
                </div>
              </div>
              {done.bank&&done.bank!=="Aucune"&&(
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                  <span style={{fontSize:12,color:C.text2}}>Contrepartie</span>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>{done.bank}</span>
                </div>
              )}
              {done.note&&<div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Note</span>
                <span style={{fontSize:12,color:C.text3}}>{done.note}</span>
              </div>}
            </>) : (<>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:C.text2}}>Banque</span>
                <span style={{fontSize:13,fontWeight:800,color:C.text}}>{done.bank}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Montant</span>
                <span style={{fontSize:15,fontWeight:800,color:done.type==="retrait"?C.red:C.green}}>
                  {done.type==="retrait"?"-":"+"}€{fmt(done.montant)}
                </span>
              </div>
            </>)}
          </div>
          <Btn label="Fermer" onClick={onClose} color={C.green}/>
        </div>
      ) : (
        <>
      {/* Sélecteur mode */}
      <div style={{display:"flex",gap:6,marginBottom:14,background:C.bg2,borderRadius:10,padding:4}}>
        {[["trade","↕ Achat / Vente"],["depot","🏦 Dépôt"]].map(([k,l])=>(
          <button key={k} onClick={()=>setMode(k)} style={{
            flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:700,
            border:"none",cursor:"pointer",
            background:mode===k?C.btc:"transparent",
            color:mode===k?"#000":C.gray,
          }}>{l}</button>
        ))}
      </div>

      {mode==="trade" ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{gridColumn:"1/-1"}}><FI label="Date" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:8,padding:3}}>
                {[["BUY","🟢 Acheter"],["SELL","🔴 Vendre"]].map(([k,l])=>(
                  <button key={k} onClick={()=>{
                    const firstSellTicker = k==="SELL" && src.portfolio?.items
                      ? src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0).map(x=>x.t)[0]||"BTC"
                      : form.ticker;
                    const ticker = k==="SELL" ? firstSellTicker : form.ticker;
                    const item = src.portfolio?.items?.find(x=>x.t===ticker);
                    const livePrice = item?.live ? String(item.live) : form.price;
                    const cur = item?.live && (YF_MAP[ticker]||ticker).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : form.currency;
                    setForm({...form, side:k, ticker: k==="SELL" ? firstSellTicker : "_PORTFOLIO_0", price:livePrice, currency:cur});
                  }} style={{
                    flex:1,padding:"8px 0",borderRadius:6,fontSize:13,fontWeight:700,
                    border:"none",cursor:"pointer",
                    background:form.side===k?(k==="BUY"?C.green:C.red):"transparent",
                    color:form.side===k?"#fff":C.gray,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            {form.side==="SELL" ? (
              <FS label="Ticker" value={form.ticker} onChange={v=>{
                const item = src.portfolio?.items?.find(x=>x.t===v);
                const livePrice = item?.live ? String(item.live) : "";
                const cur = item?.live && (YF_MAP[v]||v).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : "USD";
                setForm({...form,ticker:v,price:livePrice,currency:cur});
              }}
                options={(src.portfolio&&src.portfolio.items?src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0):[]).map(x=>x.t)}/>
            ) : (<>
              {/* Dropdown : caché si nouveau ticker actif */}
              {!showNew && (
              <FS label="Ticker" value={form.ticker} onChange={v=>{
                const item = src.portfolio?.items?.find(x=>x.t===v);
                const livePrice = item?.live ? String(item.live) : "";
                const cur = item?.live && (YF_MAP[v]||v).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : "USD";
                const cat = item ? (item.cat||"Picking") : form.cat;
                setForm({...form, ticker:v, price:livePrice, currency:cur, cat});
              }}
                options={[
                  ...(src.portfolio&&src.portfolio.items
                    ? src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0).map(x=>x.t).sort((a,b)=>a.localeCompare(b))
                    : []),
                  "EUR", "USD",
                ]}/>
              )}

              {/* Bouton nouveau ticker */}
              <div style={{gridColumn:"1/-1"}}>
                <button onClick={()=>{
                  setShowNew(!showNew);
                  if(!showNew) setForm({...form, ticker:"NOUVEAU"});
                  else setForm({...form, ticker:"BTC"});
                }} style={{
                  width:"100%", padding:"10px 14px", borderRadius:10, cursor:"pointer",
                  border:`1.5px ${showNew ? "solid" : "dashed"} ${showNew ? C.red+"aa" : C.teal}`,
                  background: showNew ? C.red+"15" : C.teal+"18",
                  color: showNew ? C.red : C.teal,
                  fontSize:13, fontWeight:800,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  letterSpacing:0.2,
                }}>
                  <span style={{fontSize:16,lineHeight:1}}>{showNew ? "✕" : "＋"}</span>
                  {showNew ? "Annuler" : "Nouveau ticker"}
                </button>
              </div>

              {/* Panneau nouveau token */}
              {showNew && (
                <div style={{gridColumn:"1/-1",background:C.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+C.teal+"44",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.teal}}>Nouveau token</div>
                  <YahooTickerSearch
                    onSelect={({ticker, yahooSym, name, currency})=>{
                      const isEU = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".L"].some(s=>(yahooSym||"").endsWith(s));
                      setForm({...form, ticker:"NOUVEAU", newTicker:ticker, yahooSymbol:yahooSym||ticker, currency:isEU?"EUR":form.currency});
                    }}
                  />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <FI label="Symbole ticker *" value={form.newTicker||""} onChange={v=>setForm({...form,newTicker:v.toUpperCase()})} placeholder="NVDA"/>
                    <FI label="Icône (emoji)" value={form.newIcon||""} onChange={v=>setForm({...form,newIcon:v})} placeholder="🟩"/>
                  </div>
                  <FI label="Symbole Yahoo Finance (facultatif)" value={form.yahooSymbol||""} onChange={v=>{
                    const isEU = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".L"].some(s=>v.endsWith(s));
                    setForm({...form, yahooSymbol:v, currency: isEU ? "EUR" : form.currency});
                  }} placeholder="NVDA, NVDA.PA, NVDA.L ..."/>
                  {(form.yahooSymbol||"").match(/\.(PA|MI|AS|BR|DE|F|L)$/) && (
                    <div style={{fontSize:10,color:C.teal,marginTop:-8}}>Détecté : bourse EU — prix en EUR</div>
                  )}
                  <div style={{fontSize:9,color:C.gray}}>Laisse vide = même symbole que le ticker.</div>
                  <FS label="Catégorie" value={form.cat} onChange={v=>setForm({...form,cat:v})}
                    options={["Crypto","Indices","Picking","Or","Cash"]}/>
                </div>
              )}

              {/* Catégorie pour ticker existant */}
              {!showNew && (
                <FS label="Catégorie" value={form.cat} onChange={v=>setForm({...form,cat:v})}
                  options={["Crypto","Indices","Picking","Or","Cash"]}/>
              )}
            </>)}
            <FI label="Quantité" type="number" value={form.qty} onChange={v=>setForm({...form,qty:v})} placeholder="0.01"/>
            <div>
              <FI label={`Prix (${form.currency})`} type="number" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder={form.currency==="USD"?"77000":"68000"}/>
              {(()=>{
                const item = src.portfolio?.items?.find(x=>x.t===(form.ticker==="NOUVEAU"?form.newTicker:form.ticker));
                if(!item?.live) return null;
                const isLive = form.price === String(item.live);
                return(
                  <div style={{fontSize:9,color:isLive?C.green:C.gray,marginTop:3,paddingLeft:2}}>
                    {isLive?"✓ Prix live":"Live: "}
                    {!isLive&&<span style={{color:C.teal,cursor:"pointer",textDecoration:"underline"}}
                      onClick={()=>setForm({...form,price:String(item.live)})}>
                      {item.live} {form.currency} (cliquer pour appliquer)
                    </span>}
                  </div>
                );
              })()}
            </div>
            <FS label="Devise" value={form.currency} onChange={v=>{
              const oldPrice = parseFloat(form.price);
              let newPrice = form.price;
              if(!isNaN(oldPrice) && oldPrice > 0){
                if(v==="EUR" && form.currency==="USD"){
                  newPrice = String(parseFloat((oldPrice * src.usdEur).toFixed(4)));
                } else if(v==="USD" && form.currency==="EUR"){
                  newPrice = String(parseFloat((oldPrice * src.eurUsd).toFixed(4)));
                }
              }
              setForm({...form, currency:v, price:newPrice});
            }} options={["USD","EUR"]}/>
            <div style={{gridColumn:"1/-1"}}><FI label="Note" value={form.note} onChange={v=>setForm({...form,note:v})} placeholder="DCA, TP..."/></div>
            <div style={{gridColumn:"1/-1"}}>
              <FS label="Contrepartie" value={form.bank||"Aucune"}
                onChange={v=>setForm({...form,bank:v})}
                options={["Aucune","BCI","Bourso","DeBlock","KuCoin","IBKR"]}/>
            </div>
          </div>
          {form.qty&&form.price&&(
            <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
              {(()=>{
                const priceUSD = form.currency==="EUR"?parseFloat(form.price||0)*src.eurUsd:parseFloat(form.price||0);
                const valoUSD  = parseFloat(form.qty||0)*priceUSD;
                const valoEUR  = Math.round(valoUSD*src.usdEur);
                const sign     = form.side==="BUY"?"-":"+";
                const col      = form.side==="BUY"?C.red:C.green;
                return(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:C.gray}}>Valorisation</span>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:14,fontWeight:800,color:col}}>{sign}${fmt(valoUSD)}</span>
                        <span style={{fontSize:10,color:C.gray,marginLeft:6}}>{sign}€{fmt(valoEUR)}</span>
                      </div>
                    </div>
                    {form.bank&&form.bank!=="Aucune"&&(()=>{
                      const isStockCash=form.bank==="KuCoin"||(form.bank==="IBKR"&&form.currency==="USD");
                      const isIBKR_EUR = form.bank==="IBKR"&&form.currency==="EUR";
                      const bal = isIBKR_EUR
                        ? (src.stocks.items.find(x=>x.t==="EURO")?.qty||0)
                        : isStockCash
                        ? (src.stocks.items.find(x=>x.t==="USD")?.val||0)
                        : (src.bank.breakdown[form.bank]||0);
                      const impact = isIBKR_EUR ? Math.round(valoEUR) : isStockCash ? Math.round(valoUSD) : Math.round(valoEUR);
                      const after = form.side==="BUY" ? bal-impact : bal+impact;
                      const sym = isIBKR_EUR ? "€" : isStockCash ? "$" : "€";
                      return(
                        <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:4}}>
                          <span style={{fontSize:10,color:C.gray}}>{form.bank} après</span>
                          <span style={{fontSize:12,fontWeight:700,color:after<0?C.red:C.green}}>{sym}{fmt(after)}</span>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label={form.side==="BUY"?"Acheter":"Vendre"} onClick={submit} color={form.side==="BUY"?C.green:C.red}/>
          </div>
        </>
      ) : (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><FI label="Date" type="date" value={depot.date} onChange={v=>setDepot({...depot,date:v})}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:8,padding:3}}>
                {[["depot","⬇ Dépôt"],["retrait","⬆ Retrait"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setDepot({...depot,type:k})} style={{
                    flex:1,padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:700,
                    border:"none",cursor:"pointer",
                    background:depot.type===k?(k==="depot"?C.green:C.red):"transparent",
                    color:depot.type===k?"#fff":C.gray,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <FS label="Banque" value={depot.bank} onChange={v=>setDepot({...depot,bank:v})} options={["BCI","Bourso","DeBlock"]}/>
            <FI label="Montant (€)" type="number" value={depot.montant} onChange={v=>setDepot({...depot,montant:v})} placeholder="1 000"/>
            <div style={{gridColumn:"1/-1"}}><FI label="Note" value={depot.note} onChange={v=>setDepot({...depot,note:v})} placeholder={depot.type==="depot"?"Virement salaire...":"Virement vers courtier..."}/></div>
          </div>
          {depot.montant&&parseFloat(depot.montant)>0&&(()=>{
            const isRetrait = depot.type==="retrait";
            const montant   = parseFloat(depot.montant||0);
            const delta     = isRetrait ? -montant : montant;
            const after     = (src.bank.breakdown[depot.bank]||0) + delta;
            const matelasAfter = src.bank.totalEUR + delta;
            const col       = isRetrait ? C.red : C.green;
            const sign      = isRetrait ? "-" : "+";
            return(
              <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:C.gray}}>{isRetrait?"Retrait":"Dépôt"}</span>
                  <span style={{fontSize:14,fontWeight:800,color:col}}>{sign}€{fmt(montant)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.gray}}>{depot.bank} après</span>
                  <span style={{fontSize:12,fontWeight:700,color:after<0?C.red:C.green}}>€{fmt(after)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                  <span style={{fontSize:11,color:C.gray}}>Cash Matelas total</span>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>€{fmt(matelasAfter)}</span>
                </div>
              </div>
            );
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label={depot.type==="retrait"?"Confirmer retrait":"Confirmer dépôt"} onClick={()=>{
              if(!depot.montant||parseFloat(depot.montant)<=0) return;
              setConfirm(true);
            }} color={depot.type==="retrait"?C.red:C.teal}/>
          </div>

          {/* Écran de confirmation */}
          {confirm&&(()=>{
            const isRetrait = depot.type==="retrait";
            const montant   = parseFloat(depot.montant||0);
            const delta     = isRetrait ? -montant : montant;
            const after     = (src.bank.breakdown[depot.bank]||0) + delta;
            const matelasAfter = src.bank.totalEUR + delta;
            const col       = isRetrait ? C.red : C.green;
            return(
              <div style={{
                position:"fixed",inset:0,zIndex:600,
                background:"rgba(0,0,0,.75)",
                display:"flex",alignItems:"flex-end",justifyContent:"center",
              }} onClick={()=>setConfirm(false)}>
                <div onClick={e=>e.stopPropagation()} style={{
                  background:C.bg1,borderRadius:"20px 20px 0 0",
                  padding:"24px 20px 36px",
                  width:"100%",maxWidth:430,
                  border:`1px solid ${C.border}`,
                }}>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:36,marginBottom:8}}>{isRetrait?"⬆":"⬇"}</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.text}}>
                      Confirmer le {isRetrait?"retrait":"dépôt"}
                    </div>
                    <div style={{fontSize:13,color:C.text3,marginTop:4}}>{depot.bank}</div>
                  </div>

                  {/* Montant en grand */}
                  <div style={{
                    background:col+"15",border:`1px solid ${col}40`,
                    borderRadius:12,padding:"16px",textAlign:"center",marginBottom:16,
                  }}>
                    <div style={{fontSize:32,fontWeight:900,color:col,letterSpacing:-1}}>
                      {isRetrait?"-":"+"}€{fmt(montant)}
                    </div>
                    {depot.note&&<div style={{fontSize:11,color:C.text3,marginTop:4}}>{depot.note}</div>}
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>{depot.date}</div>
                  </div>

                  {/* Récap impact */}
                  <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                      <span style={{fontSize:12,color:C.text2}}>{depot.bank} avant</span>
                      <span style={{fontSize:12,color:C.text}}>€{fmt(src.bank.breakdown[depot.bank]||0)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text2}}>{depot.bank} après</span>
                      <span style={{fontSize:13,fontWeight:800,color:after<0?C.red:C.green}}>€{fmt(after)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,color:C.text2}}>Cash Matelas total</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.teal}}>€{fmt(matelasAfter)}</span>
                    </div>
                  </div>

                  {after<0&&(
                    <div style={{background:C.red+"15",border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:11,color:C.red,textAlign:"center"}}>
                      ⚠ Solde négatif après cette opération
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <Btn label="← Modifier" onClick={()=>setConfirm(false)} color={C.gray} outline/>
                    <Btn label={isRetrait?"✓ Retirer":"✓ Déposer"} onClick={()=>{setConfirm(false);submitDepot();}} color={col}/>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
        </>
      )}
    </Modal>
  );
}

function SnapshotModal({onSave, onClose, EFF}){
  const src = EFF || CURRENT;  // use live prices if refreshed

  /* Dérivation automatique de toutes les colonnes Chart */
  const derive = (s) => {
    const usdEur = s.usdEur;
    const cryptoEUR  = Math.round(s.crypto.total * usdEur);
    const actionsEUR = Math.round(s.stocks.items.filter(x=>x.cat!=="Cash Matelas").reduce((sum,x)=>sum+(x.val||0),0) * usdEur);
    const stableEUR  = Math.round((s.stocks.items.filter(x=>x.cat==="Cash").reduce((sum,x)=>sum+(x.val||0),0)) * usdEur);
    const banqueEUR  = s.bank.totalEUR;
    const immoEUR    = 167000;  // fixe — bien immobilier
    const totalHorsImmo = cryptoEUR + actionsEUR + banqueEUR; // total portefeuille hors immo
    const totalEUR   = totalHorsImmo; // c'est ce qu'on inscrit dans DD col "Total EUR"
    const btcItem    = s.crypto.items[0];
    const btcPrice   = btcItem.live;

    // P&L réel = valeur portefeuille crypto € - capital investi converti en €
    const investiEUR = Math.round(94064 * usdEur);  // col E en €
    const pnlReel    = cryptoEUR - investiEUR;

    // GDB.S cours en €/$ (depuis CURRENT hardcoded si pas live)
    const gdbsEUR = (src.gdbS||CURRENT.gdbS) * usdEur;
    const gdbsUSD = src.gdbS||CURRENT.gdbS;
    const gdbcUSD = src.gdbC||CURRENT.gdbC;

    // Stocks prices
    const sp500  = s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88;
    const nasdaq = s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88; // proxy
    const msci   = s.stocks.items.find(x=>x.t==="URTH")?.live || 199.92;
    // ETH : priorité au prix live fetchés, stockés dans EFF comme résultat du dernier refresh
    const ethPrice = src._ethLive || src._lastETH || null;

    // % allocations
    const pctCrypto  = totalEUR > 0 ? cryptoEUR / totalEUR : 0;
    const pctStable  = totalEUR > 0 ? stableEUR / totalEUR : 0;
    const pctBanque  = totalEUR > 0 ? banqueEUR / totalEUR : 0;
    const pctImmo    = 0; // immo non inclus dans le total portefeuille
    const pctActions = totalEUR > 0 ? actionsEUR / totalEUR : 0;

    return {
      // Core
      date:     today(),
      // Col C-K
      wallet_crypto: cryptoEUR,
      pnl:          pnlReel,
      investi:      94064,
      cours_usd_eur: parseFloat(usdEur.toFixed(6)),
      crypto_eur:   cryptoEUR,
      stable_eur:   stableEUR,
      banque_eur:   banqueEUR,
      immo_eur:     immoEUR,
      total_eur:    totalEUR,
      // Col L-O
      pct_crypto:   pctCrypto,
      pct_stable:   pctStable,
      pct_banque:   pctBanque,
      pct_immo:     pctImmo,
      // Col P-R (GDB.S)
      nb_actions_gdbs: CURRENT.gdbS ? Math.round(CURRENT.totalUSD / CURRENT.gdbS) : 0,
      cours_gdbs_usd: gdbsUSD,
      var_gdbs:     0,
      // Col S-Y (cryptos individuelles)
      eth:  ethPrice,
      pct_eth: 0,
      sol:  86.15,
      doge: 0.098196,
      btc:  btcPrice,
      pct_btc: 0,
      tao:  247.48,
      // Col Z-AE (indices)
      sp500:    sp500,
      pct_sp500:   0,
      nasdaq:   nasdaq,
      pct_nasdaq:  0,
      msci:     msci,
      pct_msci: 0,
      // Col AF-AN (GDB.C / GDB.S détail)
      gdbc_usd:     gdbcUSD,
      var_gdbc:     0,
      total_actions_eur: actionsEUR,
      pct_actions:  pctActions,
      investi_gdbs_eur: CURRENT.gdbS * CURRENT.stocks.items.filter(x=>x.cat!=="Cash").length * 1000,
      nb_actions_gdbs2: 11942,
      gdbs_eur:     gdbsEUR,
      gdbs_usd:     gdbsUSD,
      var_gdbs2:    0,
      // Col AO
      total_hors_immo: totalHorsImmo,
    };
  };

  const[notes, setNotes] = useState("");
  const[dateInput, setDateInput] = useState(today());
  const[saved, setSaved] = useState(false);

  const preview = derive(src);

  const submit = () => {
    // Build the DD-compatible snapshot object (same fields as CHART_MONTHLY)
    const snap = {
      d: dateInput,
      portfolioDate: dateInput,            // date explicite des données portefeuille
      w: preview.wallet_crypto,            // col C
      t: preview.total_eur,               // col K
      b: preview.btc,                     // col W
      gs: preview.gdbs_usd,               // col AM
      // Extended fields (toutes les colonnes Chart)
      pnl:    preview.pnl,               // col D
      inv:    preview.investi,            // col E
      eur:    preview.cours_usd_eur,      // col F
      cg:     preview.crypto_eur,         // col G
      cs:     preview.stable_eur,         // col H
      cb:     preview.banque_eur,         // col I
      ci:     preview.immo_eur,           // col J
      pcc:    preview.pct_crypto,         // col L
      pcs:    preview.pct_stable,         // col M
      pcb:    preview.pct_banque,         // col N
      pci:    preview.pct_immo,           // col O
      gdbs:   preview.cours_gdbs_usd,     // col Q
      eth:    preview.eth,               // col S
      sol:    preview.sol,               // col U
      doge:   preview.doge,              // col V
      tao:    preview.tao,               // col Y
      sp500:  preview.sp500,             // col Z
      nq:     preview.nasdaq,            // col AB
      msci:   preview.msci,             // col AD
      gc:     preview.gdbc_usd,          // col AF
      act:    preview.total_actions_eur, // col AH
      pca:    preview.pct_actions,       // col AI
      gdbs_eur: preview.gdbs_eur,        // col AL
      ao:     preview.total_hors_immo,   // col AO
      notes,
      // ── Détail complet du portfolio au moment du snapshot ──────────────
      _portfolio: {
        date: dateInput,
        totalUSD: Math.round(src.crypto.items.reduce((s,x)=>s+x.val,0) + src.stocks.items.reduce((s,x)=>s+x.val,0) + Math.round(src.bank.totalEUR*(src.eurUsd||1.173))),
        totalEUR: src.totalEUR,
        usdEur: preview.cours_usd_eur || src.usdEur,
        crypto: {
          items: src.crypto.items.map(x=>({
            t:x.t, qty:x.qty, pa:x.pa, live:x.live, val:x.val, pnl:x.pnl, pct:x.pct,
          })),
        },
        stocks: {
          items: src.stocks.items.map(x=>({
            t:x.t, cat:x.cat, qty:x.qty, pa:x.pa, live:x.live, val:x.val, pnl:x.pnl, pct:x.pct,
          })),
        },
        bank: {
          totalEUR: src.bank.totalEUR,
          breakdown: {...src.bank.breakdown},
        },
        gdbC: src.gdbC || CURRENT.gdbC,
        gdbS: src.gdbS || CURRENT.gdbS,
        _ethLive: src._ethLive || null,  // prix ETH live du dernier refresh
      },
    };
    onSave(snap);
    onClose(); // fermer le modal immédiatement, le panneau snapResult prend le relais
  };

  return(
    <Modal title="📸 Snapshot journalier" onClose={onClose}>
      {saved ? (
        <div style={{padding:"8px 0"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:C.green}}>Snapshot enregistré</div>
            <div style={{fontSize:12,color:C.gray,marginTop:3}}>{saved.d}</div>
          </div>

          {/* ── Base locale : ce qui a été écrit ── */}
          <div style={{background:C.bg2,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:10,color:C.gray,fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📱 Base locale mise à jour</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>

              {/* DD */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>📈 DD (historique quotidien)</span>
                <span style={{color:C.green,fontWeight:700}}>✓ {saved.d}</span>
              </div>

              {/* Patrimoine */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
                <span style={{color:C.text2}}>💼 Patrimoine</span>
                <span style={{color:C.btc,fontWeight:700}}>
                  ${fmt(saved.ao_usd||0)} · €{fmt(saved.ao||0)}
                </span>
              </div>

              {/* BTC */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>₿ Bitcoin</span>
                <span style={{color:C.btc,fontWeight:700}}>${fmt(Math.round(saved.btc_price||0))}</span>
              </div>

              {/* GDB.C / GDB.S */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>CGIC / CGIS</span>
                <span style={{color:C.text2,fontWeight:700}}>
                  <span style={{color:C.orange||C.btc}}>${(saved.gc||0).toFixed(2)}</span>
                  {" / "}
                  <span style={{color:C.blue}}>${(saved.gdbs||0).toFixed(2)}</span>
                </span>
              </div>

              {/* Positions */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6}}>
                <div style={{fontSize:10,color:C.gray,marginBottom:5}}>
                  📦 {(saved._portfolio?.stocks?.items||[]).length} positions enregistrées
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {(saved._portfolio?.stocks?.items||[]).map((x,i)=>(
                    <div key={i} style={{background:C.bg3,borderRadius:5,padding:"2px 7px",fontSize:9,color:C.text2,fontWeight:600}}>
                      {x.t} <span style={{color:(x.pnl||0)>=0?C.green:C.red}}>{(x.pnl||0)>=0?"+":""}{fmtK(Math.abs(x.pnl||0))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Banque */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6,display:"flex",gap:10,flexWrap:"wrap"}}>
                <span style={{fontSize:10,color:C.gray}}>🏦 Banque :</span>
                {Object.entries(saved._portfolio?.bank?.breakdown||{}).map(([k,v])=>(
                  <span key={k} style={{fontSize:10,color:C.text2}}>
                    {k} <span style={{color:C.teal,fontWeight:700}}>€{fmt(Math.round(v))}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Btn label="Fermer" onClick={onClose} color={C.green}/>
        </div>
      ) : (
        <>
          {/* Info source */}
          <div style={{background:EFF?C.green+"11":C.btc+"11",borderRadius:10,padding:10,marginBottom:14,
            border:`1px solid ${EFF?C.green:C.btc}44`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:16}}>{EFF?"🟢":"🟡"}</div>
            <div>
              <div style={{fontSize:11,color:EFF?C.green:C.btc,fontWeight:800}}>
                {EFF?"Prix live (refresh effectué)":"Prix statiques (pas de refresh)"}
              </div>
              <div style={{fontSize:10,color:C.gray}}>
                {EFF?"Les valeurs ci-dessous reflètent les derniers prix actualisés."
                    :"Appuie sur ⟳ pour actualiser avant de faire le snapshot."}
              </div>
            </div>
          </div>

          {/* Date + Notes (seuls champs manuels — P&L auto-calculé) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <FI label="Date du snapshot" type="date" value={dateInput} onChange={setDateInput}/>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:13}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:4}}>P&L réel € (col D) — auto</div>
              <div style={{
                background:C.bg3,borderRadius:8,padding:"10px 12px",
                fontSize:13,fontWeight:800,
                color:preview.pnl>=0?C.green:C.red,
              }}>
                {preview.pnl>=0?"+":""}{Math.round(preview.pnl).toLocaleString("fr-FR")} €
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <FI label="Notes (optionnel)" value={notes} onChange={setNotes} placeholder="Clôture avr 2026, achat BTC..."/>
            </div>
          </div>

          {/* Preview automatique — 41 colonnes */}
          <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.gray,fontWeight:800,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>
              Aperçu — 41 colonnes Chart (auto-calculées)
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[
                ["Wallet Crypto", "€"+Math.round(preview.wallet_crypto).toLocaleString("fr-FR"), C.btc],
                ["Total €",       "€"+Math.round(preview.total_eur).toLocaleString("fr-FR"), C.blue],
                ["Total hors immo","€"+Math.round(preview.total_hors_immo).toLocaleString("fr-FR"), C.blue],
                ["BTC",           "$"+Math.round(preview.btc).toLocaleString("fr-FR"), C.gold],
                ["Crypto €",      "€"+Math.round(preview.crypto_eur).toLocaleString("fr-FR"), C.btc],
                ["Actions €",     "€"+Math.round(preview.total_actions_eur).toLocaleString("fr-FR"), C.blue],
                ["Banque €",      "€"+Math.round(preview.banque_eur).toLocaleString("fr-FR"), C.green],
                ["Immo €",        "€"+Math.round(preview.immo_eur).toLocaleString("fr-FR"), C.gray],
                ["CGIC $",       "$"+preview.gdbc_usd.toFixed(2), C.orange],
                ["CGIS $",       "$"+preview.gdbs_usd.toFixed(2), C.blue],
                ["$/€",           preview.cours_usd_eur.toFixed(4), C.gray],
                ["% Crypto",      (preview.pct_crypto*100).toFixed(1)+"%", C.btc],
                ["% Actions",     (preview.pct_actions*100).toFixed(1)+"%", C.blue],
                ["P&L auto",      (preview.pnl>=0?"+":"")+Math.round(preview.pnl).toLocaleString("fr-FR")+"€", preview.pnl>=0?C.green:C.red],
              ].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:9,color:C.gray}}>{l}</span>
                  <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label="📸 Enregistrer" onClick={submit} color={C.btc}/>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
const TABS=["Home","Portfolio","Stats","CGI","Data"];
const ICONS=["◎","◑","▲","◈","⬡"];

/* ── Global API keys (from Power Query in Excel) ── */

/* ═══════════════════════════════════════════════════════════
   PAGE DATA — Explorateur des bases de données
═══════════════════════════════════════════════════════════ */

function CloudKeyList({data, onRefresh}){
  var sel_state = useState(null);
  var selectedKey = sel_state[0]; var setSelectedKey = sel_state[1];
  var search_state = useState("");
  var search = search_state[0]; var setSearch = search_state[1];
  var deleting_state = useState(null);
  var deleting = deleting_state[0]; var setDeleting = deleting_state[1];
  var delMsg_state = useState(null);
  var delMsg = delMsg_state[0]; var setDelMsg = delMsg_state[1];
  var confirmAll_state = useState(false);
  var confirmAll = confirmAll_state[0]; var setConfirmAll = confirmAll_state[1];

  var CLOUD_KEYS = [
    {key:"gdb_snapshots", label:"Snapshots journaliers (objets)"},
    {key:"gdb_txns",      label:"Transactions"},
    {key:"gdb_dd",        label:"DD (historique quotidien)"},
    {key:"gdb_gdbs",      label:"CGIS (CGIC et CGIS)"},
    {key:"gdb_gc",        label:"GC_FULL (CGIC historique)"},
    {key:"gdb_gsb",       label:"GS_B100_EXT"},
    {key:"gdb_cm",        label:"CRYPTO_MONTHLY"},
    {key:"gdb_sm",        label:"STOCKS_MONTHLY"},
    {key:"gdb_tm",        label:"TOTAL_MONTHLY"},
    {key:"gdb_portfolio", label:"Portfolio (positions)"},
    {key:"gdb_crypto",    label:"Crypto (positions)"},
    {key:"gdb_stocks",    label:"Stocks (positions)"},
    {key:"gdb_bank",      label:"Banque (cash matelas)"},
    {key:"gdb_yfmap",     label:"YF_MAP (tickers Yahoo)"},
    {key:"gdb_icons",     label:"Icônes personnalisées"},
    {key:"gdb_bench",     label:"BENCH_IDX (indices BTC/ETH/SP500...)", cols:["Date","BTC $","ETH $","S&P 500","Nasdaq","MSCI World"]},
  ];

  function doDelete(keys, all) {
    setDeleting(all ? "all" : keys[0]);
    setDelMsg(null);
    var body = all ? JSON.stringify({all:true}) : JSON.stringify({keys:keys});
    fetch(CF_WORKER_URL+"/delete", {
      method:"POST",
      headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
      body: body,
    })
      .then(function(r){ return r.json(); })
      .then(function(d){
        setDeleting(null);
        setConfirmAll(false);
        if(d.ok) {
          setDelMsg({ok:true, msg:"Supprime : "+d.deleted.join(", ")});
          if(onRefresh) onRefresh();
        } else {
          setDelMsg({ok:false, msg:"Erreur : "+(d.errors||[d.error]).join(", ")});
        }
      })
      .catch(function(e){ setDeleting(null); setDelMsg({ok:false, msg:e.message}); });
  }

  // ── Vue detail clé ───────────────────────────────────────────────────────
  if(selectedKey){
    var val   = data[selectedKey];
    var meta  = CLOUD_KEYS.find(function(k){ return k.key===selectedKey; });
    var label = meta ? meta.label : selectedKey;

    var rows = []; var headers = [];
    if(Array.isArray(val)){
      if(val.length>0){
        var sorted = val.slice().sort(function(a,b){
          var da = Array.isArray(a)?a[0]:(a.d||a.date||"");
          var db = Array.isArray(b)?b[0]:(b.d||b.date||"");
          return db.localeCompare(da); // décroissant
        });
        if(Array.isArray(sorted[0])){ headers=meta&&meta.cols ? meta.cols : sorted[0].map(function(_,i){return "Col "+(i+1);}); rows=sorted; }
        else if(typeof sorted[0]==="object"){ headers=Object.keys(sorted[0]); rows=sorted.map(function(r){return headers.map(function(h){return r[h]!=null?String(r[h]):"—";}); }); }
      }
    } else if(val && typeof val==="object"){
      var entries=Object.entries(val);
      if(entries.length>0 && typeof entries[0][1]==="object"){ headers=["Cle","Valeur (JSON)"]; rows=entries.map(function(e){return[e[0],JSON.stringify(e[1]).slice(0,100)];}); }
      else { headers=["Cle","Valeur"]; rows=entries.map(function(e){return[e[0],String(e[1])]}); }
    }
    var filtered = search ? rows.filter(function(r){return r.some(function(v){return String(v||"").toLowerCase().indexOf(search.toLowerCase())>=0;});}) : rows;

    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <button onClick={function(){setSelectedKey(null);setSearch("");}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"6px 12px",color:C.text,fontSize:12,cursor:"pointer",fontWeight:700}}>← Retour</button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{label}</div>
            <div style={{fontSize:9,color:C.gray,fontFamily:"monospace"}}>{"kv/"+selectedKey+" — "+(Array.isArray(val)?val.length+" lignes":Object.keys(val||{}).length+" cles")}</div>
          </div>
          <button onClick={function(){doDelete([selectedKey],false);}}
            disabled={deleting===selectedKey}
            style={{background:C.red+"22",border:"1px solid "+C.red+"66",borderRadius:8,padding:"6px 10px",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {deleting===selectedKey?"...":"Effacer"}
          </button>
        </div>
        {delMsg&&<div style={{background:delMsg.ok?C.green+"15":C.red+"15",border:"1px solid "+(delMsg.ok?C.green:C.red)+"44",borderRadius:8,padding:"8px",fontSize:10,color:delMsg.ok?C.green:C.red,marginBottom:10}}>{delMsg.msg}</div>}
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Filtrer..."
          style={{width:"100%",background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px",color:C.text,fontSize:16,marginBottom:10,outline:"none"}}/>
        {rows.length===0
          ? <div style={{textAlign:"center",padding:"20px",color:C.gray,fontSize:12}}>Vide</div>
          : <div style={{overflowX:"auto",borderRadius:10,border:"1px solid "+C.border}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead><tr style={{background:C.bg3}}>
                  {headers.map(function(h,i){return(<th key={i} style={{padding:"5px 7px",textAlign:"left",color:C.gray,fontWeight:700,borderBottom:"1px solid "+C.border,whiteSpace:"nowrap"}}>{h}</th>);})}
                </tr></thead>
                <tbody>
                  {filtered.slice(0,100).map(function(row,ri){return(
                    <tr key={ri} style={{borderBottom:"1px solid "+C.border+"44",background:ri%2===0?"transparent":C.bg2+"44"}}>
                      {row.map(function(cell,ci){return(<td key={ci} style={{padding:"4px 7px",color:ci===0?C.teal:C.text,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{cell}</td>);})}
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
        }
        {filtered.length>100&&<div style={{fontSize:10,color:C.gray,textAlign:"center",marginTop:6}}>100 premiers sur {filtered.length}</div>}
      </div>
    );
  }

  // ── Liste des clés ───────────────────────────────────────────────────────
  return(
    <div>
      {/* Bouton Tout effacer */}
      {!confirmAll ? (
        <button onClick={function(){setConfirmAll(true);}} style={{
          width:"100%",marginBottom:12,padding:"9px 0",borderRadius:10,
          background:C.red+"15",border:"1px solid "+C.red+"44",
          color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",
        }}>Effacer toutes les bases Cloudflare</button>
      ) : (
        <div style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:10,padding:"12px",marginBottom:12}}>
          <div style={{fontSize:12,color:C.red,fontWeight:700,marginBottom:8}}>Confirmer la suppression de TOUTES les bases ?</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){doDelete(null,true);}} disabled={deleting==="all"} style={{flex:1,padding:"8px 0",borderRadius:8,background:C.red,border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {deleting==="all"?"Suppression...":"Confirmer"}
            </button>
            <button onClick={function(){setConfirmAll(false);}} style={{flex:1,padding:"8px 0",borderRadius:8,background:C.bg2,border:"1px solid "+C.border,color:C.gray,fontSize:12,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
      {delMsg&&<div style={{background:delMsg.ok?C.green+"15":C.red+"15",border:"1px solid "+(delMsg.ok?C.green:C.red)+"44",borderRadius:8,padding:"8px",fontSize:10,color:delMsg.ok?C.green:C.red,marginBottom:10}}>{delMsg.msg}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {CLOUD_KEYS.map(function(item){
          var val = data[item.key];
          var count = Array.isArray(val) ? val.length : (val && typeof val==="object") ? Object.keys(val).length : 0;
          var last = null;
          if(Array.isArray(val) && val.length>0){
            // Trouver la date max (la plus récente) pour l'aperçu
            var dates = val.map(function(r){ return Array.isArray(r)?r[0]:(r.d||r.date||null); }).filter(Boolean);
            last = dates.length>0 ? dates.sort().reverse()[0] : null;
          }
          var empty = !val || (Array.isArray(val) && val.length===0);
          return(
            <div key={item.key} style={{background:C.bg2,borderRadius:10,padding:"10px 12px",border:"1px solid "+(empty?C.border:C.teal+"44"),display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div onClick={function(){if(!empty){setSelectedKey(item.key);setSearch("");setDelMsg(null);}}}
                style={{flex:1,cursor:empty?"default":"pointer",opacity:empty?0.5:1}}>
                <div style={{fontSize:11,fontWeight:700,color:empty?C.gray:C.text}}>{item.label}</div>
                <div style={{fontSize:9,color:C.gray,fontFamily:"monospace",marginTop:2}}>{"kv/"+item.key}</div>
              </div>
              <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:8}}>
                {empty ? <span style={{fontSize:10,color:C.gray}}>Vide</span>
                  : <div>
                      <div style={{fontSize:11,fontWeight:700,color:C.teal}}>{count} entrees</div>
                      {last&&<div style={{fontSize:9,color:C.gray}}>{"--> "+last}</div>}
                    </div>
                }
                {!empty&&<span style={{fontSize:14,color:C.teal,cursor:"pointer"}} onClick={function(){if(!empty){setSelectedKey(item.key);setSearch("");setDelMsg(null);}}}>›</span>}
                <button onClick={function(){doDelete([item.key],false);}} disabled={deleting===item.key}
                  style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:6,padding:"4px 8px",color:C.red,fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  {deleting===item.key?"...":"✕"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function PageData({EFF, hidden, txns, chartData, liveDD, liveGDBS, liveGC, liveGSB, liveCM, liveSM, liveTM, liveBench}){
  var _DD   = liveDD   || DD;
  var _GDBS = liveGDBS || GDBS;
  var _GC   = liveGC   || GC_FULL;
  var _GSB  = liveGSB  || GS_B100_EXT;
  var _CM   = liveCM   || CRYPTO_MONTHLY;
  var _SM   = liveSM   || STOCKS_MONTHLY;
  var _TM   = liveTM   || TOTAL_MONTHLY;
  var _BENCH = liveBench || BENCH_IDX;
  var db_state = useState("DD");
  var db = db_state[0]; var setDb = db_state[1];
  var search_state = useState(""); 
  var search = search_state[0]; var setSearch = search_state[1];
  var vm_state = useState("local");
  var viewMode = vm_state[0]; var setViewMode = vm_state[1];
  var cd_state = useState(null);
  var cloudData = cd_state[0]; var setCloudData = cd_state[1];
  var cl_state = useState(false);
  var cloudLoading = cl_state[0]; var setCloudLoading = cl_state[1];
  var ce_state = useState(null);
  var cloudError = ce_state[0]; var setCloudError = ce_state[1];
  var eb_state = useState(null);
  var expandedBase = eb_state[0]; var setExpandedBase = eb_state[1];

  var src = EFF || CURRENT;

  function doLoadCloud(){
    setCloudLoading(true);
    setCloudError(null);
    fetch(CF_WORKER_URL+"/read", {
      headers:{"X-Auth-Key":CF_AUTH_KEY},
      signal: AbortSignal.timeout(10000),
    })
      .then(function(r){
        return r.json().then(function(d){
          if(!r.ok) throw new Error("HTTP "+r.status+" — "+(d.error||"erreur inconnue"));
          return d;
        });
      })
      .then(function(d){ setCloudData(d); setCloudLoading(false); })
      .catch(function(e){ setCloudError(e.message); setCloudLoading(false); });
  }

  function handleViewMode(mode){
    setViewMode(mode);
    if(mode==="cloud" && !cloudData && !cloudLoading) doLoadCloud();
  }

  function getLast(arr){ return (arr && arr.length>0 && arr[arr.length-1]) ? (arr[arr.length-1][0]||"—") : "—"; }
  function fmt(v){ return v!=null ? v.toLocaleString("fr-FR") : "—"; }
  function fmtF(v,d){ return v!=null ? v.toFixed(d) : "—"; }
  function fmtPnl(v){ return v!=null ? (v>=0?"+":"")+v.toLocaleString("fr-FR") : "—"; }
  function fmtPct(v){ return v!=null ? (v*100).toFixed(1)+"%" : "—"; }

  var portfolioItems = (EFF||CURRENT).portfolio && (EFF||CURRENT).portfolio.items ? (EFF||CURRENT).portfolio.items : [];
  var portfolioDate  = (EFF||CURRENT).portfolio && (EFF||CURRENT).portfolio.date ? (EFF||CURRENT).portfolio.date : "—";

  var DATABASES = {
    "DD": {
      label:"DD — Historique quotidien",
      desc:"Valeurs quotidiennes depuis 2020 ("+_DD.length+" points)",
      headers:["Date","Crypto EUR","Total EUR","BTC $","GDB.S $","usdEur"],
      rows: _DD.slice().reverse().map(function(r){return[r[0],fmt(r[1]),fmt(r[2]),fmt(r[3]),fmtF(r[4],4),fmtF(r[5],6)];}),
    },
    "GDBS": {
      label:"CGIS — Cours CGIC et CGIS",
      desc:"Cours journaliers depuis aout 2025 ("+_GDBS.length+" points)",
      headers:["Date","GDB.S $","GDB.C $"],
      rows: _GDBS.slice().reverse().map(function(r){return[r[0],fmtF(r[1],4),fmtF(r[2],4)];}),
    },
    "GC_FULL": {
      label:"GC_FULL — Historique CGIC",
      desc:"Cours GDB.C depuis 2020 ("+_GC.length+" points)",
      headers:["Date","GDB.C $"],
      rows: _GC.slice().reverse().map(function(r){return[r[0],fmtF(r[1],4)];}),
    },
    "GS_B100": {
      label:"GS_B100 — CGIS base 100",
      desc:"GDB.S rebase 100 au 1er jan 2026 ("+_GSB.length+" points)",
      headers:["Date","GDB.S base100"],
      rows: _GSB.slice().reverse().map(function(r){return[r[0],fmtF(r[1],3)];}),
    },
    "BENCH_IDX": {
      label:"BENCH_IDX — Indices de référence",
      desc:"BTC/ETH/SP500/NASDAQ/MSCI World depuis 2020 ("+_BENCH.length+" points)",
      headers:["Date","BTC $","ETH $","S&P 500","Nasdaq","MSCI World"],
      rows: _BENCH.slice().reverse().map(function(r){return[r[0],fmtF(r[1],0),fmtF(r[2],2),fmtF(r[3],2),fmtF(r[4],2),fmtF(r[5],2)];}),
    },
    "DB": {
      label:"DB — Indices base 100",
      desc:"Indices base 100 depuis 2023 ("+DB.length+" points)",
      headers:["Date","Port","Idx1","Idx2","Idx3","Idx4","Idx5"],
      rows: DB.slice().reverse().map(function(r){return[r[0]].concat(r.slice(1).map(function(v){return fmtF(v,1);}));}),
    },
    "PORTFOLIO": {
      label:"Portfolio — Vue unifiee",
      desc:"Toutes les positions au "+portfolioDate,
      headers:["Ticker","Cat","Qty","Live $","Val $","Val EUR","P&L $"],
      rows: portfolioItems.map(function(x){return[x.t,x.cat,x.qty,fmtF(x.live,2),"$"+fmt(x.val),fmt(x.valEUR)+"EUR",fmtPnl(x.pnl)];}),
    },
    "CRYPTO": {
      label:"Crypto — Positions",
      desc:"Detail crypto live",
      headers:["Ticker","Qty","PA $","Live $","Val $","P&L $","%"],
      rows: src.crypto.items.map(function(x){return[x.t,x.qty,fmtF(x.pa,2),fmtF(x.live,0),"$"+fmt(x.val),fmtPnl(x.pnl),fmtPct(x.pct)];}),
    },
    "STOCKS": {
      label:"Stocks — Positions",
      desc:"Detail stocks live",
      headers:["Ticker","Cat","Qty","PA $","Live $","Val $","P&L $"],
      rows: src.stocks.items.map(function(x){return[x.t,x.cat,x.qty,fmtF(x.pa,2),fmtF(x.live,2),"$"+fmt(x.val),fmtPnl(x.pnl)];}),
    },
    "BANK": {
      label:"Banque — Cash Matelas",
      desc:"Comptes bancaires",
      headers:["Banque","Solde EUR","Solde USD"],
      rows: Object.entries(src.bank && src.bank.breakdown ? src.bank.breakdown : {}).map(function(e){
        var name=e[0]; var valEUR=e[1];
        var valUSD = Math.round(valEUR*(src.eurUsd||1.173));
        return[name, valEUR.toLocaleString("fr-FR")+" EUR", valUSD.toLocaleString("fr-FR")+" $"];
      }),
    },
    "TXNS": {
      label:"Transactions — Achats / Ventes",
      desc:"Journal de toutes les transactions ("+(txns||[]).length+" lignes)",
      headers:["Date","Type","Ticker","Cat","Qty","Prix $","Montant $","Contrepartie","Note"],
      rows: (txns||[]).slice().sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(t){
        var valo = Math.round((t.qty||0)*(t.price||0));
        return[t.date, t.side, t.ticker, t.cat||"—", t.qty, fmtF(t.price,2), "$"+fmt(valo), t.bankAccount||"—", t.note||""];
      }),
    },
    "SNAPSHOTS": {
      label:"Snapshots journaliers",
      desc:"Historique des snapshots ("+(chartData||[]).length+" points)",
      headers:["Date","Total EUR","Total USD","usdEur","GDB.S","GDB.C"],
      rows: (chartData||[]).slice().sort(function(a,b){return b.d.localeCompare(a.d);}).map(function(s){
        // v23.07 — mapping corrigé : champs réels + repli mensuel, Total USD calculé
        var eurTot = (s.ao!=null ? s.ao : s.t);                 // ao (quotidien) ou t (mensuel)
        var usdTot = (eurTot!=null && s.eur) ? Math.round(eurTot / s.eur) : null; // EUR / usdEur
        var gdbS   = (s.gdbs!=null ? s.gdbs : s.gs);            // gdbs (col Q) ou gs (col AM)
        var gdbC   = (s.gc!=null ? s.gc : s.gdbc);              // gc (col AF) = GDB.C réel
        return[s.d, eurTot!=null?eurTot:"—", usdTot!=null?usdTot:"—", s.eur||"—", gdbS!=null?gdbS:"—", gdbC!=null?gdbC:"—"];
      }),
    },
    "MONTHLY": {
      label:"Crypto Monthly",
      desc:"P&L mensuel crypto depuis 2020",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_CM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "STOCKS_M": {
      label:"Stocks Monthly",
      desc:"P&L mensuel actions depuis 2026",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_SM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "TOTAL_M": {
      label:"Total Monthly",
      desc:"P&L mensuel total portefeuille depuis 2026",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_TM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "YF_MAP": {
      label:"YF_MAP — Tickers Yahoo Finance",
      desc:"Correspondance ticker interne -> symbole Yahoo ("+(Object.keys(YF_MAP).length)+" tickers)",
      headers:["Ticker","Symbole Yahoo","Bourse EU"],
      rows: Object.entries(YF_MAP).map(function(e){
        var t=e[0]; var sym=e[1];
        var isEU=[".PA",".MI",".AS",".BR",".DE",".F",".L"].some(function(s){return sym.endsWith(s);});
        return[t, sym, isEU ? "OUI" : "—"];
      }),
    },
    "CUSTOM_ICONS": {
      label:"ICON_DB — Base d'icônes (user + FMP)",
      desc:"Icônes stockées en base ("+(Object.keys(ICON_DB).length)+" tickers)",
      headers:["Ticker","Icône user","Logo FMP"],
      rows: Object.entries(ICON_DB).map(function(e){return[e[0], e[1].user||"—", e[1].fmp?"✓ "+e[1].fmp.slice(0,40):"—"];}),
    },
  };

  var currentDB = DATABASES[db];
  var filtered = search
    ? currentDB.rows.filter(function(r){return r.some(function(v){return String(v||"").toLowerCase().indexOf(search.toLowerCase())>=0;});})
    : currentDB.rows;

  function countMonthly(obj){ var n=0; Object.values(obj||{}).forEach(function(d){ n+=(d.m||[]).filter(function(_,i){return d.bom&&d.bom[i]!=null;}).length; }); return n; }
  function lastMonthly(obj){ var yrs=Object.keys(obj||{}).sort(); if(!yrs.length)return"—"; var yr=yrs[yrs.length-1];var d=obj[yr];var ms=(d&&d.m||[]).filter(function(_,i){return d.bom&&d.bom[i]!=null;});return yr+" "+(ms.length?ms[ms.length-1]:""); }

  var LOCAL_SUMMARY = [
    // Séries temporelles
    {name:"DD",          dbKey:"DD",          count:_DD.length,              last:getLast(_DD)},
    {name:"GDBS",        dbKey:"GDBS",         count:_GDBS.length,            last:getLast(_GDBS)},
    {name:"GC_FULL",     dbKey:"GC_FULL",      count:_GC.length,              last:getLast(_GC)},
    {name:"GS_B100_EXT", dbKey:"GS_B100",      count:_GSB.length,             last:getLast(_GSB)},
    {name:"BENCH_IDX",   dbKey:"BENCH_IDX",    count:_BENCH.length,           last:getLast(_BENCH)},
    {name:"DB",          dbKey:"DB",           count:DB.length,               last:getLast(DB)},
    // Monthly
    {name:"CRYPTO_M",    dbKey:"MONTHLY",      count:countMonthly(_CM),       last:lastMonthly(_CM)},
    {name:"STOCKS_M",    dbKey:"STOCKS_M",     count:countMonthly(_SM),       last:lastMonthly(_SM)},
    {name:"TOTAL_M",     dbKey:"TOTAL_M",      count:countMonthly(_TM),       last:lastMonthly(_TM)},
    // Portfolio live
    {name:"Portfolio",   dbKey:"PORTFOLIO",    count:portfolioItems.length,   last:portfolioDate},
    {name:"Crypto",      dbKey:"CRYPTO",       count:(src.crypto&&src.crypto.items?src.crypto.items.length:0), last:(EFF||CURRENT).date||"—"},
    {name:"Stocks",      dbKey:"STOCKS",       count:(src.stocks&&src.stocks.items?src.stocks.items.length:0), last:(EFF||CURRENT).date||"—"},
    {name:"Banque",      dbKey:"BANK",         count:(src.bank&&src.bank.breakdown?Object.keys(src.bank.breakdown).length:0), last:"EUR"},
    // Transactions & snapshots
    {name:"Transactions",dbKey:"TXNS",         count:(txns||[]).length,       last:(txns&&txns.length>0?txns[txns.length-1].date:"—")},
    {name:"Snapshots",   dbKey:"SNAPSHOTS",    count:(chartData||[]).length,  last:(chartData&&chartData.length>0?chartData[chartData.length-1].d:"—")},
    // Références
    {name:"YF_MAP",      dbKey:"YF_MAP",       count:Object.keys(YF_MAP).length, last:"tickers"},
    {name:"CUSTOM_ICONS",dbKey:"CUSTOM_ICONS", count:Object.keys(ICON_DB).length, last:"icones"},
  ];

  return(
    <div>
      <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:10,padding:4,marginBottom:12}}>
        {["local","cloud"].map(function(k){
          var l = k==="local" ? "Bases locales" : "Cloudflare KV";
          return(
            <button key={k} onClick={function(){handleViewMode(k);}} style={{
              flex:1,padding:"7px 0",borderRadius:8,fontSize:11,fontWeight:700,
              border:"none",cursor:"pointer",
              background:viewMode===k?C.btc:"transparent",
              color:viewMode===k?"#000":C.gray,
            }}>{l}</button>
          );
        })}
      </div>

      {viewMode==="local" ? (
        <div>
          <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",marginBottom:10,border:"1px solid "+C.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:9,color:C.gray,letterSpacing:1,textTransform:"uppercase"}}>📱 Bases locales</div>
              <div style={{fontSize:10,fontWeight:700,color:C.btc}}>{LOCAL_SUMMARY.length} bases</div>
            </div>
            {LOCAL_SUMMARY.map(function(b,i){
              var dbKey = b.dbKey || null;
              var isOpen = expandedBase === b.name;
              var previewDB = dbKey ? DATABASES[dbKey] : null;
              return(
                <div key={i} style={{borderBottom:i<LOCAL_SUMMARY.length-1?"1px solid "+C.border+"33":"none"}}>
                  <button onClick={function(){setExpandedBase(isOpen?null:b.name);}} style={{
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    width:"100%",background:"transparent",border:"none",cursor:"pointer",
                    padding:"7px 0",textAlign:"left",
                  }}>
                    <span style={{fontSize:11,fontWeight:700,color:isOpen?C.btc:C.teal,fontFamily:"monospace"}}>{b.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:C.text}}>{b.count} entrées</span>
                      <span style={{fontSize:9,color:C.gray}}>{b.last}</span>
                      <span style={{fontSize:10,color:isOpen?C.btc:C.gray,transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                    </div>
                  </button>
                  {isOpen && previewDB && (
                    <div style={{marginBottom:8,borderRadius:8,overflow:"hidden",border:"1px solid "+C.border+"66"}}>
                      <div style={{fontSize:9,color:C.gray,padding:"5px 8px",background:C.bg3,borderBottom:"1px solid "+C.border+"44"}}>
                        {previewDB.desc} — 5 premières lignes
                      </div>
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                          <thead>
                            <tr style={{background:C.bg3}}>
                              {previewDB.headers.map(function(h,hi){return(
                                <th key={hi} style={{padding:"4px 7px",textAlign:"left",color:C.gray,fontWeight:700,borderBottom:"1px solid "+C.border+"44",whiteSpace:"nowrap"}}>{h}</th>
                              );})}
                            </tr>
                          </thead>
                          <tbody>
                            {previewDB.rows.slice(0,5).map(function(row,ri){return(
                              <tr key={ri} style={{background:ri%2===0?"transparent":C.bg2+"55"}}>
                                {row.map(function(cell,ci){return(
                                  <td key={ci} style={{padding:"4px 7px",color:ci===0?C.btc:C.text,fontFamily:ci===0?"monospace":"inherit",whiteSpace:"nowrap"}}>{cell}</td>
                                );})}
                              </tr>
                            );})}
                            {previewDB.rows.length===0 && (
                              <tr><td colSpan={previewDB.headers.length} style={{padding:"8px",color:C.gray,fontSize:10,textAlign:"center"}}>Base vide</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {isOpen && !previewDB && (
                    <div style={{fontSize:10,color:C.gray,padding:"6px 0 8px"}}>Aperçu non disponible</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:11,color:C.gray}}>Données stockées dans Cloudflare KV</div>
              <div style={{fontSize:10,fontWeight:700,color:C.btc}}>16 bases</div>
            </div>
            <button onClick={doLoadCloud} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"5px 12px",color:C.teal,fontSize:11,fontWeight:700,cursor:"pointer"}}>Actualiser</button>
          </div>
          {cloudLoading && <div style={{textAlign:"center",padding:"30px 0",color:C.gray,fontSize:13}}>Chargement...</div>}
          {cloudError  && <div style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:8,padding:"12px",color:C.red,fontSize:11}}>Erreur : {cloudError}</div>}
          {cloudData && !cloudLoading && <CloudKeyList data={cloudData} onRefresh={doLoadCloud}/>}
        </div>
      )}
    </div>
  );
}


function App(){
  const[tab,setTab]=useState(0);
  const[chartData,setChartData]=useState(CHART_MONTHLY);
  // Séries temporelles en state pour pouvoir les muter après snapshot/refresh
  const[liveDD,setLiveDD]=useState(DD);
  const[liveGDBS,setLiveGDBS]=useState(GDBS);
  const[liveGC,setLiveGC]=useState(GC_FULL);
  const[liveGSB,setLiveGSB]=useState(GS_B100_EXT);
  const[liveBench,setLiveBench]=useState(BENCH_IDX);
  const[liveCM,setLiveCM]=useState(CRYPTO_MONTHLY);
  const[liveSM,setLiveSM]=useState(STOCKS_MONTHLY);
  const[liveTM,setLiveTM]=useState(TOTAL_MONTHLY);
  // Version counter pour forcer re-render après sync ICON_DB (variable module non-reactive)
  const[iconDbVersion,setIconDbVersion]=useState(0);
  const bumpIconDb = () => setIconDbVersion(v=>v+1);
  const[txns,setTxns]=useState(SEED_TXNS);
  const[ready,setReady]=useState(false);
  const[showSnap,setShowSnap]=useState(false);
  const[showTrade,setShowTrade]=useState(false);
  const[eur,setEur]=useState(false);
  const[hidden,setHidden]=useState(false);
  const[live,setLive]=useState(()=>{
    // Si DD contient des snapshots plus récents que le build (CURRENT.date),
    // appliquer les valeurs du dernier snapshot pour afficher les données à jour
    const lastDD = DD.length > 0 ? DD[DD.length-1] : null;
    const lastGDBS = GDBS.length > 0 ? GDBS[GDBS.length-1] : null;
    if(lastDD && lastDD[0] > CURRENT.date){
      // [date, cryptoEUR, totalEUR, btcLive, gdbS, usdEur]
      const usdEur  = lastDD[5] || CURRENT.usdEur;
      const eurUsd  = 1/usdEur;
      const btcPrice = lastDD[3] || CURRENT.btcPrice;
      const gdbS    = lastGDBS ? lastGDBS[1] : (lastDD[4] || CURRENT.gdbS);
      const gdbC    = lastGDBS ? lastGDBS[2] : CURRENT.gdbC;
      const totalEUR = lastDD[2] || CURRENT.totalEUR;
      const totalUSD = Math.round(totalEUR * eurUsd);
      return {
        ...CURRENT,
        date: lastDD[0],
        usdEur, eurUsd, btcPrice,
        gdbS, gdbC,
        totalEUR, totalUSD,
        _fromSnapshot: lastDD[0],
      };
    }
    return {...CURRENT};
  });
  const[refreshing,setRefreshing]=useState(false);
  const[refreshedAt,setRefreshedAt]=useState(null);
  const[refreshErr,setRefreshErr]=useState(null);
  const[gistSync,setGistSync]=useState(null);
  const[gistError,setGistError]=useState(null);
  const[showGistDiag,setShowGistDiag]=useState(false);
  const[themeName,setThemeName]=useState(()=>{
    try{ return localStorage.getItem('gdb_theme')||'dark'; }catch{ return 'dark'; }
  });
  const[showTheme,setShowTheme]=useState(false);
  // ── Écran de démarrage ──────────────────────────────────────────────────
  const[startScreen,setStartScreen]=useState(true); // afficher l'écran de choix
  const[startLoading,setStartLoading]=useState(true); // en train de charger les 2 sources
  const[kvData_snap,setKvData_snap]=useState(null); // {totalUSD, totalEUR, date, raw}
  const[kvError,setKvError]=useState(null);         // message si KV inaccessible
  const[chosenSource,setChosenSource]=useState("local"); // "local" | "cloudflare"
  // localData initialisé avec liveDD (peut inclure des snapshots précédents)
  const[localData,setLocalData]=useState(()=>{
    const _dd = DD;
    const lastRow = _dd.length>0 ? _dd[_dd.length-1] : null;
    const lastDate = lastRow ? lastRow[0] : CURRENT.date;
    const totalEUR = lastRow && lastRow[0] > CURRENT.date ? lastRow[2] : CURRENT.totalEUR;
    const totalUSD = lastRow && lastRow[0] > CURRENT.date ? Math.round(totalEUR / (lastRow[5]||CURRENT.usdEur)) : CURRENT.totalUSD;
    const lastGDBS = GDBS.length>0 ? GDBS[GDBS.length-1] : null;
    return {
      totalUSD, totalEUR,
      date: lastDate,
      gdbS: lastGDBS?.[1] || CURRENT.gdbS,
      gdbC: lastGDBS?.[2] || CURRENT.gdbC,
    };
  });
  // Apply theme to global C on every render
  C = THEMES[themeName]||THEMES.dark;
  cc = getCC();

  const applyTheme = (name) => {
    C = THEMES[name]||THEMES.dark;
    cc = getCC();
    setThemeName(name);
    try{ localStorage.setItem('gdb_theme', name); }catch{}
    setShowTheme(false);
  };

  const handleRefresh = useCallback(async()=>{
    setRefreshing(true); setRefreshErr(null);
    try{
      const prices = await fetchAllPrices();
      const liveEurUsd = prices.EURUSD || (1/CURRENT.usdEur);
      const liveUsdEur = 1 / liveEurUsd;
      const todayStr = todayNC();

      // Utiliser setLive(prev=>) pour avoir l'état live courant (post-trades)
      setLive(prev=>{
        const srcEFF = prev || CURRENT;
        const updated = applyPrices(prices, liveUsdEur, srcEFF);
        const {gdbS: gdbS_r, gdbC: gdbC_r} = calcGdbPrices(updated);

        // Mettre à jour DD/GDBS/GC en même temps
        const cryptoEUR_r = Math.round((updated.crypto && updated.crypto.total ? updated.crypto.total : 0)*liveUsdEur);
        const totalEUR_r  = updated.totalEUR;
        const gdbSCalc    = gdbS_r || CURRENT.gdbS;
        const gdbCCalc    = gdbC_r || CURRENT.gdbC;
        const btcR        = updated.btcPrice || CURRENT.btcPrice;

        setLiveDD(d => {
          const last = d[d.length-1];
          const row = [todayStr, cryptoEUR_r, totalEUR_r, btcR, gdbSCalc, liveUsdEur];
          return last && last[0]===todayStr ? [...d.slice(0,-1), row] : [...d, row];
        });
        // Mettre à jour BENCH_IDX avec les prix live du refresh
        const ethLive  = prices["ETH"]  || null;
        const sp500L   = prices["QQQ"]  || null;
        const nqLive   = prices["QQQ"]  || null;
        const msciLive = prices["URTH"] || null;  // URTH = iShares MSCI World ETF
        if(btcR || ethLive || sp500L) {
          setLiveBench(b => {
            const last = b.length>0 ? b[b.length-1] : null;
            const row = [todayStr, btcR||null, ethLive||null, sp500L||null, nqLive||null, msciLive||null];
            return last && last[0]===todayStr ? [...b.slice(0,-1), row] : [...b, row];
          });
        }
        if(gdbSCalc && gdbCCalc){
          setLiveGDBS(d => {
            const last = d[d.length-1];
            const row = [todayStr, gdbSCalc, gdbCCalc];
            return last && last[0]===todayStr ? [...d.slice(0,-1), row] : [...d, row];
          });
          setLiveGC(d => {
            const last = d[d.length-1];
            const row = [todayStr, gdbCCalc];
            return last && last[0]===todayStr ? [...d.slice(0,-1), row] : [...d, row];
          });
        }

        return {
          ...srcEFF,
          ...updated,
          eurUsd: liveEurUsd,
          usdEur: liveUsdEur,
          gdbS: gdbS_r,
          gdbC: gdbC_r,
          errors: prices.errors,
        };
      });
      const ts = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
      setRefreshedAt(ts);
      // Mettre à jour localData avec les nouvelles valeurs live
      setLive(prev2=>{
        if(prev2) setLocalData({
          totalUSD: prev2.totalUSD||CURRENT.totalUSD,
          totalEUR: prev2.totalEUR||CURRENT.totalEUR,
          date: todayNC(),
          gdbS: prev2.gdbS||CURRENT.gdbS,
          gdbC: prev2.gdbC||CURRENT.gdbC,
        });
        return prev2;
      });
      // Rapport détaillé : succès et échecs
      const successList = Object.keys(YF_MAP).filter(k=>prices[k]!=null);
      if(prices.BTC) successList.push("BTC");
      if(prices.EURUSD) successList.push("EUR");
      const failList = [...new Set(prices.errors)];
      if(failList.length>0){
        setRefreshErr({ok:successList.filter(k=>!failList.includes(k)), fail:failList});
      } else {
        setRefreshErr({ok:successList, fail:[]});
      }
      // Auto-fermeture après 8s
      setTimeout(()=>setRefreshErr(null), 8000);
    } catch(e){ setRefreshErr({ok:[], fail:["Erreur réseau: "+e.message]}); }
    finally{ setRefreshing(false); }
  },[]);

  // v1.02 — rafraîchissement automatique des cours au premier chargement
  const didAutoRefresh = useRef(false);
  useEffect(()=>{
    if(didAutoRefresh.current) return;
    didAutoRefresh.current = true;
    const t = setTimeout(()=>{ handleRefresh(); }, 600);
    return ()=>clearTimeout(t);
  },[handleRefresh]);

  const EFF = live || CURRENT;

  const liveProps = {eur, setEur, hidden, setHidden, EFF, refreshing, handleRefresh, refreshedAt, refreshErr, fromSnapshot: live?._fromSnapshot||null, gistSync, liveDD, liveGDBS, liveGC, liveGSB, liveCM};

  // ── Préchargement au démarrage — charge local + KV en parallèle ──────────
  useEffect(()=>{
    (async()=>{
      // Phase 1 v23.01 — migration unique v8→v9 (idempotente, sans effet visible)
      migrateV8toV9();
      // Date locale = dernière ligne de liveDD (plus récente que CURRENT.date si snapshots précédents)
      const _localDD = liveDD || DD;
      const localLastDate = _localDD.length>0 ? _localDD[_localDD.length-1][0] : CURRENT.date;
      const localLastGDBS = (liveGDBS||GDBS);
      const lastGDBSRow = localLastGDBS.length>0 ? localLastGDBS[localLastGDBS.length-1] : null;
      setLocalData(prev=>({
        ...prev,
        date: localLastDate,
        gdbS: lastGDBSRow?.[1] || CURRENT.gdbS,
        gdbC: lastGDBSRow?.[2] || CURRENT.gdbC,
      }));
      try {
        const res=await fetch(CF_WORKER_URL+"/read",{headers:{"X-Auth-Key":CF_AUTH_KEY},signal:AbortSignal.timeout(8000)});
        if(res.ok){
          const kv=await res.json();
          // Phase 1 v23.01 — seeder le miroir local v9 depuis KV (écriture additive)
          lsv9SeedFromKv(kv);
          // Phase 3 v23.04 — /read KV a réussi → on est en ligne → re-pousser les bases dirty
          flushDirtyBases();
          const kvPort=kv.gdb_portfolio,kvStk=kv.gdb_stocks,kvCryp=kv.gdb_crypto,kvBank=kv.gdb_bank;
          if(kvPort&&kvCryp&&kvStk&&kvBank){
            const uE=CURRENT.usdEur,eU=1/uE;
            const cryptoT=kvCryp.total||(kvCryp.items||[]).reduce((s,x)=>s+(x.val||0),0);
            const stocksT=kvStk.total||(kvStk.items||[]).reduce((s,x)=>s+(x.val||0),0);
            const bankUSD=Math.round((kvBank.totalEUR||0)*eU);
            const totalUSD=cryptoT+stocksT+bankUSD;
            const lastGDBS=kv.gdb_gdbs&&kv.gdb_gdbs.length>0?kv.gdb_gdbs[kv.gdb_gdbs.length-1]:null;
            const lastDD_kv=kv.gdb_dd&&kv.gdb_dd.length>0?kv.gdb_dd[kv.gdb_dd.length-1]:null;
            const kvDate = lastDD_kv?.[0] || kvPort.date || "—";
            setKvData_snap({totalUSD,totalEUR:Math.round(totalUSD*uE),date:kvDate,gdbS:lastGDBS?.[1]||CURRENT.gdbS,gdbC:lastGDBS?.[2]||CURRENT.gdbC,raw:kv});
          } else { setKvError("Bases KV incomplètes"); }
        } else { setKvError("KV inaccessible ("+res.status+")"); }
      } catch(e){ setKvError("KV hors ligne"); }
      setStartLoading(false);
    })();
  },[]);

  function applyStartChoice(useKV){
    setStartScreen(false);
    setChosenSource(useKV ? "cloudflare" : "local");
    if(useKV&&kvData_snap?.raw){
      const kv=kvData_snap.raw;
      // Fusionner la base hardcodée avec les données KV pour combler les trous
      // Le Worker ne stocke que les lignes ajoutées par snapshot — la base hardcodée
      // couvre l'historique jusqu'au 17 mai 2026. On fusionne les deux.
      const _mergeArrays = (base, live) => {
        if(!live || !live.length) return base;
        const map = {};
        base.forEach(r=>{ if(r[0]) map[r[0]] = r; });
        live.forEach(r=>{ if(r[0]) map[r[0]] = r; }); // live écrase si même date
        return Object.values(map).sort((a,b)=>a[0].localeCompare(b[0]));
      };
      if(kv.gdb_dd)    setLiveDD(_mergeArrays(DD, kv.gdb_dd));
      if(kv.gdb_gdbs)  setLiveGDBS(_mergeArrays(GDBS, kv.gdb_gdbs));
      if(kv.gdb_gc)    setLiveGC(_mergeArrays(GC_FULL, kv.gdb_gc));
      if(kv.gdb_gsb)   setLiveGSB(_mergeArrays(GS_B100_EXT, kv.gdb_gsb));
      if(kv.gdb_cm)    setLiveCM(kv.gdb_cm);
      if(kv.gdb_sm)    setLiveSM(kv.gdb_sm);
      if(kv.gdb_tm)    setLiveTM(kv.gdb_tm);
      if(kv.gdb_bench) setLiveBench(kv.gdb_bench);
      if(kv.gdb_yfmap&&typeof kv.gdb_yfmap==="object") Object.assign(YF_MAP,kv.gdb_yfmap);
      if(kv.gdb_icons&&typeof kv.gdb_icons==="object"){
        // Merger : KV écrase les entrées existantes (KV = vérité cloud)
        // mais on conserve les entrées localStorage qui ne seraient pas dans KV
        const merged = { ...serializeIconDb(), ...kv.gdb_icons };
        loadIconDb(merged); // charge + persiste en localStorage
        seedBankLogos();    // réinjecter les URLs banque (toujours fixes)
        lsWriteIcons(serializeIconDb());
        bumpIconDb();
      }
      const kvPort=kv.gdb_portfolio,kvCryp=kv.gdb_crypto,kvStk=kv.gdb_stocks,kvBank=kv.gdb_bank;
      if(kvPort&&kvCryp&&kvStk&&kvBank){
        const uE=CURRENT.usdEur,eU=1/uE;
        const cryptoT=kvCryp.total||(kvCryp.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const stocksT=kvStk.total||(kvStk.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const bankUSD=Math.round((kvBank.totalEUR||0)*eU);
        const totalUSD=cryptoT+stocksT+bankUSD;
        const newLive={...CURRENT,date:kvPort.date||CURRENT.date,totalUSD,totalEUR:Math.round(totalUSD*uE),usdEur:uE,eurUsd:eU,
          crypto:{...CURRENT.crypto,...kvCryp},stocks:{...CURRENT.stocks,...kvStk},bank:{...CURRENT.bank,...kvBank},
          portfolio:{...kvPort},_fromSnapshot:kvPort.date};
        const{gdbS,gdbC}=calcGdbPrices(newLive);
        setLive({...newLive,gdbS,gdbC});
        setRefreshedAt("cloudflare "+kvPort.date);
      }
    }
  }

  useEffect(()=>{
    (async()=>{
      const pingResult = await cfPing();
      const gistOk = pingResult === null;
      if(!gistOk) setGistError(pingResult||{status:null,statusText:"Réponse vide",body:""});
      setGistSync(gistOk);
      const[cd,tx]=await Promise.all([load(SK.chart,CHART_MONTHLY),load(SK.txns,SEED_TXNS)]);
      setChartData(cd);
      setTxns(tx);

      // ── Charger les bases depuis Cloudflare KV (remplace les constantes statiques) ─
      try {
        const res = await fetch(CF_WORKER_URL+"/read",{
          headers:{"X-Auth-Key":CF_AUTH_KEY},
          signal: AbortSignal.timeout(10000),
        });
        if(res.ok){
          const kvData = await res.json();
          // Phase 3 v23.05 — réconciliation des transactions (fusion par id).
          // Récupère une txn ajoutée offline (présente en local, pas en KV) ET
          // une txn faite sur un autre appareil (présente en KV, pas en local).
          try{
            const kvTx = Array.isArray(kvData.gdb_txns) ? kvData.gdb_txns : [];
            const merged = unionTxnsById(tx, kvTx);   // local prioritaire, puis cloud-only
            if(merged.length !== tx.length || merged.length !== kvTx.length){
              setTxns(merged);
              lsv9Set('gdb_txns', merged);
              console.info("[txns] fusion local("+tx.length+") ∪ KV("+kvTx.length+") = "+merged.length+" ligne(s)");
            }
            if(merged.length > kvTx.length){   // le local apporte des txns absentes du cloud → re-push
              saveBase('gdb_txns', merged);
              console.info("[txns] re-push KV : "+(merged.length - kvTx.length)+" txn(s) locale(s) manquante(s)");
            }
          }catch(e){ console.warn("[txns] réconciliation échouée:", e && e.message); }
          // Phase 3 v23.06 — réconciliation des snapshots (fusion par date d).
          // Récupère un snapshot local-only ET un snapshot fait sur un autre appareil,
          // et popule la clé canonique gdb_snapshots (restée vide jusqu'ici).
          try{
            const kvSnap = Array.isArray(kvData.gdb_snapshots) ? kvData.gdb_snapshots : [];
            const mergedSnap = unionSnapsByDate(cd, kvSnap);
            if(mergedSnap.length !== cd.length || mergedSnap.length !== kvSnap.length){
              setChartData(mergedSnap);
              lsv9Set('gdb_snapshots', mergedSnap);
              console.info("[snap] fusion local("+cd.length+") ∪ KV("+kvSnap.length+") = "+mergedSnap.length+" point(s)");
            }
            if(mergedSnap.length > kvSnap.length){   // local apporte des dates absentes du cloud → re-push
              saveBase('gdb_snapshots', mergedSnap);
              console.info("[snap] re-push KV : "+(mergedSnap.length - kvSnap.length)+" snapshot(s) manquant(s)");
            }
          }catch(e){ console.warn("[snap] réconciliation échouée:", e && e.message); }
          // Remplacer les séries statiques si KV a des données plus récentes
          const kvDD   = kvData.gdb_dd;
          const kvGDBS = kvData.gdb_gdbs;
          const kvGC   = kvData.gdb_gc;
          const kvGSB  = kvData.gdb_gsb;
          const kvCM   = kvData.gdb_cm;
          const kvSM   = kvData.gdb_sm;
          const kvTM   = kvData.gdb_tm;
          const kvYF   = kvData.gdb_yfmap;
          const kvPort = kvData.gdb_portfolio;
          const kvCryp = kvData.gdb_crypto;
          const kvStk  = kvData.gdb_stocks;
          const kvBank = kvData.gdb_bank;

          // N'utiliser les données KV que si elles sont plus récentes que le build
          const buildLastDate = DD[DD.length-1] && DD[DD.length-1][0];
          const kvLastDate    = kvDD && kvDD.length>0 ? kvDD[kvDD.length-1][0] : null;
          const kvIsNewer     = kvLastDate && kvLastDate > buildLastDate;

          // Phase 3 v23.08 — DD & GDBS : FUSION par date (build ∪ miroir local ∪ KV),
          // au lieu d'un remplacement en bloc. KV prioritaire sur conflit ; re-push des
          // dates présentes en local mais absentes du cloud (récupère un snapshot offline).
          try {
            const mergedDD = unionSeriesByDate(unionSeriesByDate(DD, lsv9Get('gdb_dd')), kvDD);
            setLiveDD(mergedDD);
            lsv9Set('gdb_dd', mergedDD);
            const kvDDlen = (kvDD&&kvDD.length)||0;
            if(mergedDD.length > kvDDlen){ saveBase('gdb_dd', mergedDD); console.info("[dd] re-push KV : "+(mergedDD.length-kvDDlen)+" date(s) locale(s)"); }

            const mergedGDBS = unionSeriesByDate(unionSeriesByDate(GDBS, lsv9Get('gdb_gdbs')), kvGDBS);
            setLiveGDBS(mergedGDBS);
            lsv9Set('gdb_gdbs', mergedGDBS);
            const kvGlen = (kvGDBS&&kvGDBS.length)||0;
            if(mergedGDBS.length > kvGlen){ saveBase('gdb_gdbs', mergedGDBS); console.info("[gdbs] re-push KV : "+(mergedGDBS.length-kvGlen)+" date(s) locale(s)"); }
            console.info("[dd] fusion DD="+mergedDD.length+" · GDBS="+mergedGDBS.length);
          } catch(e){ console.warn("[dd] réconciliation DD/GDBS échouée:", e && e.message); }

          if(kvIsNewer){
            // Les autres séries restent en « remplacement si KV plus récent » (Phases 23.09/23.10)
            if(kvGC)   setLiveGC(kvGC);
            if(kvGSB)  setLiveGSB(kvGSB);
            if(kvCM)   setLiveCM(kvCM);
            if(kvSM)   setLiveSM(kvSM);
            if(kvTM)   setLiveTM(kvTM);
            console.info("Bases KV chargées ("+kvLastDate+" > "+buildLastDate+")");
          } else {
            console.info("Build plus récent que KV ("+buildLastDate+" >= "+kvLastDate+") — bases locales conservées");
          }

          // YF_MAP : toujours merger (nouveaux tickers ajoutés par l'utilisateur)
          if(kvYF && typeof kvYF === "object"){
            Object.assign(YF_MAP, kvYF);
          }

          // Portfolio KV : injecter dans live si disponible et plus récent que le build
          if(kvPort && kvCryp && kvStk && kvBank){
            const kvPortDate = kvPort.date || null;
            const buildDate  = CURRENT.date || DD[DD.length-1]?.[0];
            if(kvPortDate && kvPortDate > buildDate){
              console.info("Portfolio KV plus récent ("+kvPortDate+") — injection dans live");
              const usdEur  = kvBank.totalEUR && kvStk.total && kvCryp.total
                ? (CURRENT.usdEur) : CURRENT.usdEur;
              const eurUsd  = 1/usdEur;
              const bankUSD = Math.round((kvBank.totalEUR||CURRENT.bank.totalEUR)*eurUsd);
              const cryptoT = kvCryp.total || kvCryp.items.reduce((s,x)=>s+(x.val||0),0);
              const stocksT = kvStk.total  || kvStk.items.reduce((s,x)=>s+(x.val||0),0);
              const totalUSD = cryptoT + stocksT + bankUSD;
              const totalEUR = Math.round(totalUSD * usdEur);
              const newLiveFromKV = {
                ...CURRENT,
                date:     kvPortDate,
                totalUSD, totalEUR, usdEur, eurUsd,
                crypto:   {...CURRENT.crypto, ...kvCryp, date: kvPortDate},
                stocks:   {...CURRENT.stocks, ...kvStk,  date: kvPortDate},
                bank:     {...CURRENT.bank,   ...kvBank, date: kvPortDate},
                portfolio:{...kvPort},
                _fromSnapshot: kvPortDate,
              };
              // Recalculer GDB.C et GDB.S depuis les nouvelles positions
              const {gdbS: kgS, gdbC: kgC} = calcGdbPrices(newLiveFromKV);
              setLive({...newLiveFromKV, gdbS: kgS, gdbC: kgC});
              setRefreshedAt("snapshot "+kvPortDate);
            }
          }
        }
      } catch(e){
        console.warn("Chargement bases KV échoué:", e.message);
      }

      // Dernier snapshot disponible
      const snapshots = cd.filter(r=>r.ao||r.t||r.w).sort((a,b)=>b.d.localeCompare(a.d));
      const last = snapshots[0];

      if(last?._portfolio){
        // ── Reconstruction depuis le dernier snapshot ─────────────────────
        // On utilise les QUANTITÉS du snapshot mais les PRIX de CURRENT
        // pour éviter d'afficher des valeurs périmées
        const p      = last._portfolio;
        const usdEur = CURRENT.usdEur;   // toujours le taux actuel
        const eurUsd = CURRENT.eurUsd;

        // Crypto : quantités snapshot + prix CURRENT
        const cryptoItems = p.crypto?.items?.map(x=>{
          const cur = CURRENT.crypto.items.find(c=>c.t===x.t);
          const livePrice = cur?.live || x.live || CURRENT.btcPrice;
          const qty = x.qty || cur?.qty || 0;
          const val = Math.round(qty * livePrice);
          const pnl = Math.round(val - qty * (x.pa || cur?.pa || 0));
          return { ...cur, ...x, live:livePrice, val, pnl, pct: cur?.pa ? (livePrice-cur.pa)/cur.pa : x.pct };
        }) || CURRENT.crypto.items;
        const cryptoTotal = cryptoItems.reduce((s,x)=>s+x.val,0);

        // Stocks : quantités snapshot + prix CURRENT
        const stocksItems = p.stocks?.items?.map(x=>{
          const cur = CURRENT.stocks.items.find(s=>s.t===x.t);
          const livePrice = cur?.live || x.live || 0;
          const qty = x.qty || cur?.qty || 0;
          const val = Math.round(qty * livePrice);
          const pnl = Math.round(val - qty * (x.pa || cur?.pa || 0));
          return { ...cur, ...x, live:livePrice, val, pnl };
        }) || CURRENT.stocks.items;
        const stocksTotal = stocksItems.reduce((s,x)=>s+x.val,0);

        // Banque : valeurs du snapshot (en €, on fait confiance)
        const bankEUR  = p.bank?.totalEUR || CURRENT.bank.totalEUR;
        const bankUSD  = Math.round(bankEUR * eurUsd);
        const totalUSD = cryptoTotal + stocksTotal + bankUSD;
        const totalEUR = Math.round(totalUSD * usdEur);

        // Reconstruire portfolio.items unifié
        const allItems = [
          ...cryptoItems.map(x=>({...x,cat:"Crypto"})),
          ...stocksItems.map(x=>({...x})),
          ...Object.entries(p.bank?.breakdown||CURRENT.bank.breakdown).map(([k,v])=>({
            t:k,cat:"Cash Matelas",qty:1,pa:v,live:v,valEUR:v,
            val:Math.round(v*eurUsd),pnl:0,pct:0,
          })),
        ];
        const snapEFF = {
          ...CURRENT,
          totalUSD, totalEUR, usdEur, eurUsd,
          btcPrice: CURRENT.btcPrice,
          gdbC: CURRENT.gdbC,
          gdbS: CURRENT.gdbS,
          crypto: {...CURRENT.crypto, date:p.date||last.d, total:cryptoTotal, items:cryptoItems},
          stocks: {...CURRENT.stocks, date:p.date||last.d, total:stocksTotal, items:stocksItems},
          bank:   {...CURRENT.bank, date:p.date||last.d, totalEUR:bankEUR, breakdown:p.bank?.breakdown||CURRENT.bank.breakdown},
          portfolio: {date:p.date||last.d, items:allItems},
          errors: [],
          _fromSnapshot: p.date || last.d,
        };
        const {gdbS: gdbS_s, gdbC: gdbC_s} = calcGdbPrices(snapEFF);
        setLive({...snapEFF, gdbS:gdbS_s, gdbC:gdbC_s});
        setRefreshedAt(`snapshot ${p.date||last.d}`);

      } else {
        // ── Fallback : CURRENT est déjà l'état final (les trades sont déjà intégrés) ──
        // On n'applique PAS les transactions — elles sont déjà dans CURRENT.crypto/stocks
        const replayedEFF = CURRENT;
        if(last){
          const usdEur  = last.eur || replayedEFF.usdEur;
          const eurUsd  = 1 / usdEur;
          const banqueEUR = last.cb || replayedEFF.bank.totalEUR;
          const btcPrice  = last.b  || replayedEFF.btcPrice;
          const btcItem   = replayedEFF.crypto.items[0];
          const btcVal    = Math.round(btcItem.qty * btcPrice);
          setLive({
            ...replayedEFF,
            usdEur, eurUsd, btcPrice,
            crypto: {...replayedEFF.crypto,
              items:[{...btcItem, live:btcPrice, val:btcVal,
                pnl:btcVal-Math.round(btcItem.pa*btcItem.qty)}]},
            bank: {...replayedEFF.bank, totalEUR:banqueEUR},
            errors:[], _fromSnapshot:last.d,
          });
          setRefreshedAt(`snapshot ${last.d}`);
        } else if(tx.length > 0){
          setLive({...replayedEFF, errors:[], _fromSnapshot:null});
          setRefreshedAt(`${tx.length} transaction(s)`);
        }
      }

      setReady(true);
    })();
  },[]);

  // ── Mise à jour des bases de données depuis un snapshot ──────────────────
  const [snapResult, setSnapResult] = useState(null); // {ok, log, errors, snap, nextData}

  // ── Pull-to-refresh ──────────────────────────────────────────────────────
  const[pullY,setPullY]=useState(0);
  const pullStartY=useRef(0);
  const pullActive=useRef(false);
  const PULL_THRESHOLD=50; // réduit de 70 à 50 pour plus de réactivité

  useEffect(()=>{
    const onTouchStart=e=>{
      // Activer dès que scroll = 0, peu importe la position précise
      if(window.scrollY<=2){
        pullStartY.current=e.touches[0].clientY;
        pullActive.current=true;
      }
    };
    const onTouchMove=e=>{
      if(!pullActive.current) return;
      const dy=e.touches[0].clientY-pullStartY.current;
      if(dy>0 && window.scrollY<=2){
        setPullY(Math.min(dy*0.6, PULL_THRESHOLD+30)); // résistance augmentée 0.5→0.6
        if(dy>5) e.preventDefault(); // seuil réduit 10→5
      } else if(dy<=0){
        pullActive.current=false;
        setPullY(0);
      }
    };
    const onTouchEnd=()=>{
      if(pullActive.current && pullY>=PULL_THRESHOLD && !refreshing){
        handleRefresh();
      }
      pullActive.current=false;
      setPullY(0);
    };
    window.addEventListener('touchstart',onTouchStart,{passive:true});
    window.addEventListener('touchmove',onTouchMove,{passive:false});
    window.addEventListener('touchend',onTouchEnd);
    return()=>{
      window.removeEventListener('touchstart',onTouchStart);
      window.removeEventListener('touchmove',onTouchMove);
      window.removeEventListener('touchend',onTouchEnd);
    };
  },[pullY,refreshing,handleRefresh]);

  function updateBasesFromSnapshot(snap, src, liveSeries){
    const log = [], errors = [];
    const today = snap.d;
    const usdEur = snap.eur || src.usdEur;
    const eurUsd = 1/usdEur;

    // Utiliser les séries live (post-snapshots précédents) si disponibles
    const _DD    = liveSeries?.liveDD    || liveDD    || DD;
    const _GDBS  = liveSeries?.liveGDBS  || liveGDBS  || GDBS;
    const _GC    = liveSeries?.liveGC    || liveGC    || GC_FULL;
    const _GSB   = liveSeries?.liveGSB   || liveGSB   || GS_B100_EXT;
    const _CM    = liveSeries?.liveCM    || liveCM    || CRYPTO_MONTHLY;
    const _SM    = liveSeries?.liveSM    || liveSM    || STOCKS_MONTHLY;
    const _TM    = liveSeries?.liveTM    || liveTM    || TOTAL_MONTHLY;
    const _BENCH = liveSeries?.liveBench || liveBench || BENCH_IDX;

    // ── Valeurs live du snapshot ───────────────────────────────────────────
    const btcLive  = snap._portfolio?.items?.find(x=>x.t==="BTC")?.live || src.btcPrice;
    const cryptoEUR= snap.wallet_crypto || Math.round((src.crypto?.total||0)*usdEur);
    const totalEUR = snap.total_eur || src.totalEUR; // total portefeuille hors immo
    const gdbS     = snap.gdbs || src.gdbS;
    const gdbC     = snap.gdbc || src.gdbC;
    const GS_JAN   = 11.7681;
    const MONTHS_FR= ["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];

    // Helper upsert : écrase la ligne si la date existe déjà, sinon insère et trie
    function upsert(arr, row){
      const d = row[0];
      const idx = arr.findIndex(r=>r[0]===d);
      if(idx>=0){ const next=[...arr]; next[idx]=row; return next; }
      return [...arr, row].sort((a,b)=>a[0].localeCompare(b[0]));
    }

    // ── 1. Mise à jour DD ─────────────────────────────────────────────────
    const newRow = [today, cryptoEUR, totalEUR, btcLive, gdbS, usdEur];
    let newDD = upsert([..._DD], newRow);
    const existed = _DD.some(r=>r[0]===today);
    log.push("✓ DD : ligne "+(existed?"mise à jour":"ajoutée")+" ("+today+")");

    // ── 2. Mise à jour GDBS ───────────────────────────────────────────────
    let newGDBS = [..._GDBS];
    if(gdbS && gdbC){
      newGDBS = upsert(newGDBS, [today, gdbS, gdbC]);
      log.push("✓ GDBS : mis à jour (GDB.S="+gdbS+", GDB.C="+gdbC+")");
    } else errors.push("GDBS : gdbS ou gdbC manquant");

    // ── 3. Mise à jour GC_FULL ────────────────────────────────────────────
    let newGC = [..._GC];
    if(gdbC){
      newGC = upsert(newGC, [today, gdbC]);
      log.push("✓ GC_FULL : mis à jour");
    }

    // ── 4. Mise à jour GS_B100_EXT ────────────────────────────────────────
    let newGSB = [..._GSB];
    if(gdbS){
      const gsb = round2(gdbS/GS_JAN*100);
      newGSB = upsert(newGSB, [today, gsb]);
      log.push("✓ GS_B100_EXT : mis à jour ("+gsb+")");
    }

    // ── 5. Monthly : helper générique ─────────────────────────────────────
    function updateMonthly(base, liveEOM, year, monthIdx, inv=0){
      const m = MONTHS_FR[monthIdx];
      const updated = {...base};
      if(!updated[year]){
        // Nouvelle année
        updated[year] = { m:MONTHS_FR.map((_,i)=>i<=monthIdx?m:null).filter(Boolean),
          bom:[liveEOM,...Array(11).fill(null)],eom:[liveEOM,...Array(11).fill(null)],
          pct:[0,...Array(11).fill(null)],pnl:[0,...Array(11).fill(null)],
          inv:[inv,...Array(11).fill(null)],ttl_pnl:0,ttl_pct:0 };
        return updated;
      }
      const d = {...updated[year]};
      const months = d.m || MONTHS_FR;
      const mi = months.indexOf(m);
      if(mi >= 0){
        // Mois existant → mise à jour EOM
        const bom = d.bom[mi] || liveEOM;
        const pnl = Math.round(liveEOM - bom - (d.inv?.[mi]||0));
        const pct = bom ? round2(pnl/bom) : 0;
        d.eom = [...d.eom]; d.eom[mi] = liveEOM;
        d.pnl = [...d.pnl]; d.pnl[mi] = pnl;
        d.pct = [...d.pct]; d.pct[mi] = pct;
      } else {
        // Nouveau mois dans l'année existante
        const prevEOM = d.eom.filter(v=>v!=null).slice(-1)[0] || liveEOM;
        const mi2 = monthIdx;
        d.m    = [...d.m]; d.m[mi2]=m;
        d.bom  = [...d.bom]; d.bom[mi2]=prevEOM;
        d.eom  = [...d.eom]; d.eom[mi2]=liveEOM;
        const pnl2 = Math.round(liveEOM-prevEOM-inv);
        d.pnl  = [...d.pnl]; d.pnl[mi2]=pnl2;
        d.pct  = [...d.pct]; d.pct[mi2]=pnl2/prevEOM;
        d.inv  = [...(d.inv||[])]; d.inv[mi2]=inv;
      }
      d.ttl_pnl = d.pnl.filter(v=>v!=null).reduce((s,v)=>s+v,0);
      updated[year] = d;
      return updated;
    }

    const todayD = new Date(today);
    const year   = String(todayD.getFullYear());
    const monthI = todayD.getMonth();

    // ── 6. CRYPTO_MONTHLY ─────────────────────────────────────────────────
    let newCM = updateMonthly({..._CM}, cryptoEUR, year, monthI);
    log.push("✓ CRYPTO_MONTHLY : mis à jour ("+year+" "+MONTHS_FR[monthI]+" EOM=€"+cryptoEUR+")");

    // ── 7. STOCKS_MONTHLY ─────────────────────────────────────────────────
    const stocksEUR = Math.round((src.stocks?.items||[]).filter(x=>x.cat!=="Cash"&&x.cat!=="Cash Matelas").reduce((s,x)=>s+(x.val||0),0)*usdEur);
    let newSM = updateMonthly({..._SM}, stocksEUR, year, monthI);
    log.push("✓ STOCKS_MONTHLY : mis à jour (€"+stocksEUR+")");

    // ── 8. TOTAL_MONTHLY ──────────────────────────────────────────────────
    const totalLiveEUR = Math.round(totalEUR);
    let newTM = updateMonthly({..._TM}, totalLiveEUR, year, monthI);
    log.push("✓ TOTAL_MONTHLY : mis à jour (€"+totalLiveEUR+")");

    // ── 9. BENCH_IDX (indices de référence BTC/ETH/SP500/NASDAQ/MSCI) ──────
    // Toutes les valeurs sont disponibles dans le snap (issues du dernier refresh)
    const benchBTC  = snap._portfolio?.items?.find(x=>x.t==="BTC")?.live || btcLive || null;
    const benchETH  = snap._portfolio?._ethLive || snap.eth || null;
    const benchSP   = snap.sp500 || snap._portfolio?.items && src.stocks?.items?.find(x=>x.t==="QQQ")?.live || null;
    const benchNQ   = snap.nq   || benchSP || null;  // QQQ = proxy NASDAQ aussi
    const benchMSCI = snap.msci || src.stocks?.items?.find(x=>x.t==="URTH")?.live || null;
    // On upsert seulement si on a au moins BTC (qui vient du snapshot)
    let newBench = [..._BENCH];
    if(benchBTC){
      // Garder les valeurs existantes pour les colonnes qu'on n'a pas
      const existing = _BENCH.find(r=>r[0]===today);
      newBench = upsert(newBench, [
        today,
        benchBTC,
        benchETH  || existing?.[2] || null,   // ETH
        benchSP   || existing?.[3] || null,   // SP500
        benchNQ   || existing?.[4] || null,   // NASDAQ
        benchMSCI || existing?.[5] || null,   // MSCI
      ]);
      const ethLog = benchETH ? `, ETH=$${Math.round(benchETH)}` : "";
      log.push("✓ BENCH_IDX : BTC mis à jour ("+today+", $"+benchBTC+")"+ethLog);
    }

    // ── 10. Portfolio / Crypto / Stocks dans CURRENT (via snap) ───────────
    log.push("✓ _portfolio : sauvegardé avec date "+today);

    return {
      ok: errors.length===0, log, errors,
      newDD, newGDBS, newGC, newGSB, newCM, newSM, newTM, newBench,
    };
  }

  const addSnap=useCallback(async snap=>{
    const result = updateBasesFromSnapshot(snap, EFF||CURRENT, {liveDD, liveGDBS, liveGC, liveGSB, liveCM, liveSM, liveTM, liveBench});

    // Sauvegarder dans chartData (snapshots journaliers)
    // Règle : écrase si même date (snap.d), crée nouvelle ligne sinon
    // snap.d est déjà en UTC+11 via todayNC() ou choisi manuellement par l'utilisateur
    const snapDate = snap.d;
    const next=[...chartData.filter(r=>r.d!==snapDate), snap]
      .sort((a,b)=>a.d.localeCompare(b.d));
    setChartData(next);

    // Mettre à jour les états React des séries
    setLiveDD(result.newDD);
    setLiveGDBS(result.newGDBS);
    // Mettre à jour localData avec les valeurs du snapshot
    const src = EFF||CURRENT;
    setLocalData({
      totalUSD: src.totalUSD,
      totalEUR: src.totalEUR,
      date: snap.d || todayNC(),
      gdbS: snap.gdbs || src.gdbS,
      gdbC: snap.gdbc || src.gdbC,
    });
    setLiveGC(result.newGC);
    setLiveGSB(result.newGSB);
    setLiveCM(result.newCM);
    setLiveSM(result.newSM);
    setLiveTM(result.newTM);
    if(result.newBench) setLiveBench(result.newBench);
    setSnapResult({...result, snap, next, pendingUpload:true});
  },[chartData, EFF]);

  const doSnapUpload = useCallback(async()=>{
    if(!snapResult) return;
    const {next, newDD, newGDBS, newGC, newGSB, newCM, newSM, newTM, newBench} = snapResult;
    const uploadLog = [], uploadErrors = [];
    const liveState = snapResult.snap && snapResult.snap._portfolio
      ? snapResult.snap._portfolio : (EFF || CURRENT);

    // 1. Sauvegarder les snapshots journaliers
    try {
      await save(SK.chart, next);
      saveBase('gdb_snapshots', next);   // Phase 3 — base canonique : miroir v9 local + KV gdb_snapshots
      saveBase('gdb_dd',   newDD);       // Phase 3 v23.08 — série DD : miroir v9 + KV + offline dirty
      saveBase('gdb_gdbs', newGDBS);     // Phase 3 v23.08 — série GDBS
      uploadLog.push("✓ Snapshots journaliers ("+next.length+" points)");
    } catch(e){ uploadErrors.push("✗ Snapshots : "+e.message); }

    // 2+3. Sauvegarder toutes les bases en un seul appel /write-bases (avec retry)
    let basesOk = false;
    for(let attempt = 1; attempt <= 3 && !basesOk; attempt++){
      try {
        const bases = {
          gdb_txns: txns,
          gdb_bench: newBench || liveBench || BENCH_IDX,
          // Séries temporelles
          gdb_dd:   newDD,
          gdb_gdbs: newGDBS,
          gdb_gc:   newGC,
          gdb_gsb:  newGSB,
          // Monthly
          gdb_cm:   newCM,
          gdb_sm:   newSM,
          gdb_tm:   newTM,
          // Portfolio complet
          gdb_portfolio: (EFF||CURRENT).portfolio || CURRENT.portfolio,
          gdb_crypto:    (EFF||CURRENT).crypto    || CURRENT.crypto,
          gdb_stocks:    (EFF||CURRENT).stocks    || CURRENT.stocks,
          gdb_bank:      (EFF||CURRENT).bank      || CURRENT.bank,
          // YF_MAP (tickers refresh)
          gdb_yfmap: YF_MAP,
          gdb_icons: serializeIconDb(),
        };
        const res = await fetch(CF_WORKER_URL+"/write-bases", {
          method:"POST",
          headers:{"Content-Type":"application/json","X-Auth-Key":CF_AUTH_KEY},
          body: JSON.stringify(bases),
          signal: AbortSignal.timeout(30000),
        });
        const data = await res.json();
        if(!res.ok) throw new Error("HTTP "+res.status+" — "+(data.error||""));
        const written = new Set(data.written||[]);
        const snap   = snapResult.snap || {};
        const src    = EFF || CURRENT;
        // Ligne par base — on reprend les mêmes valeurs que dans le log local pour cohérence
        const snapDate = snap.d || today();
        if(written.has("gdb_bench")){
          const btc = newBench?.find(r=>r.d===snapDate);
          uploadLog.push("✓ BENCH_IDX : BTC="+(btc?"$"+btc.BTC:"—")+(btc?.ETH?" ETH=$"+btc.ETH:"")+" ("+snapDate+")");
        }
        if(written.has("gdb_dd")){
          const row = newDD?.find(r=>r.d===snapDate);
          uploadLog.push("✓ DD : "+(row?"ligne ("+snapDate+")":"mis à jour"));
        }
        if(written.has("gdb_gdbs")){
          const row = newGDBS?.find(r=>r.d===snapDate);
          uploadLog.push("✓ GDBS : "+(row?"GDB.S="+row["GDB.S"]+", GDB.C="+row["GDB.C"]:"mis à jour"));
        }
        if(written.has("gdb_gc"))  uploadLog.push("✓ GC_FULL : mis à jour");
        if(written.has("gdb_gsb")){
          const row = newGSB?.find(r=>r.d===snapDate);
          uploadLog.push("✓ GS_B100_EXT : "+(row?row["GS.B100"]:"mis à jour"));
        }
        if(written.has("gdb_cm")){
          const last = newCM && newCM[newCM.length-1];
          uploadLog.push("✓ CRYPTO_MONTHLY : "+(last?last.y+" "+last.m+" EOM=€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_sm")){
          const last = newSM && newSM[newSM.length-1];
          uploadLog.push("✓ STOCKS_MONTHLY : "+(last?"€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_tm")){
          const last = newTM && newTM[newTM.length-1];
          uploadLog.push("✓ TOTAL_MONTHLY : "+(last?"€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_txns"))     uploadLog.push("✓ Transactions : "+txns.length+" lignes");
        if(written.has("gdb_portfolio")) uploadLog.push("✓ Portfolio : sauvegardé");
        if(written.has("gdb_crypto"))   uploadLog.push("✓ Crypto : sauvegardé");
        if(written.has("gdb_stocks"))   uploadLog.push("✓ Stocks : sauvegardé");
        if(written.has("gdb_bank"))     uploadLog.push("✓ Bank : sauvegardé");
        if(written.has("gdb_yfmap"))    uploadLog.push("✓ YF_MAP : "+Object.keys(YF_MAP).length+" tickers");
        if(written.has("gdb_icons"))    uploadLog.push("✓ ICON_DB : "+Object.keys(ICON_DB).length+" icônes");
        // Clés échouées (dans ALLOWED mais non écrites)
        const failed = Object.keys(bases).filter(k=>!written.has(k));
        failed.forEach(k=>uploadErrors.push("✗ "+k+" : non confirmé"));
        basesOk = true;
      } catch(e){
        if(attempt < 3){
          await new Promise(r=>setTimeout(r, 2000));
        } else {
          uploadErrors.push("✗ Bases ("+attempt+" essais) : "+e.message);
        }
      }
    }

    setSnapResult(prev=>({...prev, pendingUpload:false, uploadLog, uploadErrors, uploadDone:true}));
  },[snapResult, txns, EFF]);

  const addTxn=useCallback(async t=>{
    const next=[t,...txns];setTxns(next);
    await save(SK.txns,next);                 // legacy (gdb_sons_v8 + KV gdb_data) — inchangé
    saveBase('gdb_txns', next);               // Phase 2 — base canonique : miroir v9 local + KV gdb_txns
  },[txns]);

  const applyTradeToEFF=useCallback(trade=>{
    setLive(prev=>{
      const base = prev||CURRENT;
      if(trade._directBank){
        // Dépôt/Retrait bancaire
        // Recalcul depuis prev.bank (pas src.bank qui peut être stale)
        const isRetrait = trade.side==="RETRAIT";
        const montantEUR = trade.qty; // qty = montant en €
        const delta = isRetrait ? -montantEUR : montantEUR;
        const bankName = trade.bankAccount;
        const eurUsd = base.eurUsd || 1/(base.usdEur||0.852);

        // Nouveau bank depuis prev
        const newBreakdown = {...base.bank.breakdown};
        newBreakdown[bankName] = (newBreakdown[bankName]||0) + delta;
        const newTotalEUR = Object.values(newBreakdown).reduce((s,v)=>s+v, 0);
        const newBank = {
          ...base.bank,
          breakdown: newBreakdown,
          totalEUR: newTotalEUR,
        };

        // Mettre à jour portfolio.items pour le Cash Matelas correspondant
        let newPortfolioItems = base.portfolio?.items;
        if(newPortfolioItems){
          newPortfolioItems = newPortfolioItems.map(item=>{
            if(item.cat!=="Cash Matelas" || item.t!==bankName) return item;
            const newValEUR = (item.valEUR||item.qty) + delta;  // peut être négatif (découvert)
            const newQty    = newValEUR; // qty = montant €
            const newVal    = Math.round(newValEUR * eurUsd);
            return {...item, qty:newQty, valEUR:newValEUR, val:newVal, live:eurUsd};
          });
        }

        // Recalc totaux
        const deltaUSD = Math.round(delta * eurUsd);
        const newTotalUSD = base.totalUSD + deltaUSD;
        const newTotalEURtot = Math.round(newTotalUSD * (base.usdEur||0.852));

        return {
          ...base,
          bank: newBank,
          totalUSD: newTotalUSD,
          totalEUR: newTotalEURtot,
          ...(newPortfolioItems ? {portfolio:{...base.portfolio, items:newPortfolioItems}} : {}),
        };
      }
      // Achat/Vente : applyTrade retourne un objet complet
      const updated = applyTrade(trade, base);
      // Recalculer GDB.C et GDB.S depuis les nouvelles valeurs
      const {gdbS, gdbC} = calcGdbPrices(updated);
      return {...base, ...updated, gdbS, gdbC};
    });
  },[]);

  const delTxn=useCallback(async id=>{
    const next=txns.filter(t=>t.id!==id);setTxns(next);await save(SK.txns,next);
    saveBase('gdb_txns', next);   // Phase 3 — propager la suppression vers la base canonique
  },[txns]);

  if(!ready)return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>₿</div>
      <div style={{color:C.btc,fontWeight:800,fontSize:18}}>CREUSOT GLOBAL INVESTMENTS</div>
      <div style={{color:C.gray,fontSize:12}}>Chargement...</div>
    </div>
  );

  // ── Écran de démarrage ────────────────────────────────────────────────────
  if(startScreen) return(
    <div style={{fontFamily:"'-apple-system',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      {/* Logo */}
      <div style={{fontSize:48,marginBottom:8}}>₿</div>
      <div style={{fontSize:22,fontWeight:800,color:C.btc,marginBottom:4}}>CREUSOT GLOBAL INVESTMENTS</div>
      <div style={{fontSize:11,color:C.gray,marginBottom:32}}>Choisir la source de données</div>
      <div style={{position:"absolute",top:16,right:20,fontSize:10,color:C.btc,fontFamily:"monospace"}}>{APP_VERSION}</div>

      {startLoading ? (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:24,animation:"spin 1s linear infinite"}}>↻</div>
          <div style={{fontSize:12,color:C.gray}}>Connexion à Cloudflare...</div>
        </div>
      ) : (
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:14}}>

          {/* Carte LOCAL */}
          <div onClick={()=>applyStartChoice(false)} style={{
            background:C.bg2,borderRadius:16,padding:"18px 20px",
            border:`2px solid ${C.btc}`,cursor:"pointer",
            boxShadow:"0 4px 20px rgba(247,147,26,.15)",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>📱</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>Base locale</div>
                  <div style={{fontSize:10,color:C.gray}}>Build intégré dans l'app</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,color:C.btc}}>${fmtK(localData?.totalUSD||0)}</div>
                <div style={{fontSize:11,color:C.gray}}>€{fmtK(localData?.totalEUR||0)}</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
              <span>📅 {localData?.date||"—"}</span>
              <span>CGIS ${localData?.gdbS||"—"} · CGIC ${localData?.gdbC||"—"}</span>
            </div>
          </div>

          {/* Carte CLOUDFLARE */}
          {kvError ? (
            <div style={{background:C.bg2,borderRadius:16,padding:"18px 20px",border:`2px solid ${C.border}`,opacity:.6}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>☁️</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.gray}}>Cloudflare KV</div>
                  <div style={{fontSize:10,color:C.red}}>{kvError}</div>
                </div>
              </div>
            </div>
          ) : (
            <div onClick={()=>applyStartChoice(true)} style={{
              background:C.bg2,borderRadius:16,padding:"18px 20px",
              border:`2px solid ${C.teal}`,cursor:"pointer",
              boxShadow:"0 4px 20px rgba(56,189,248,.1)",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>☁️</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:C.text}}>Cloudflare KV</div>
                    <div style={{fontSize:10,color:C.gray}}>Dernier snapshot cloud</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:800,color:C.teal}}>${fmtK(kvData_snap?.totalUSD||0)}</div>
                  <div style={{fontSize:11,color:C.gray}}>€{fmtK(kvData_snap?.totalEUR||0)}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                <span>📅 {kvData_snap?.date||"—"}</span>
                <span>CGIS ${kvData_snap?.gdbS||"—"} · CGIC ${kvData_snap?.gdbC||"—"}</span>
              </div>
            </div>
          )}

        </div>
      )}
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return(
    <div key={themeName} style={{fontFamily:C.font||"'-apple-system',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:430,margin:"0 auto",paddingBottom:78,boxShadow:themeName==="midnight"?"0 0 80px rgba(180,100,240,.08)":themeName==="bitcoin"?"0 0 80px rgba(247,147,26,.06)":"none"}}>
      <div style={{
        padding:"13px 16px 11px",display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100,
        background:C.bg,
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
      }}>
        {/* Gauche : ↺ 📸 💵 */}
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <button onClick={handleRefresh} disabled={refreshing} title="Actualiser les prix" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${refreshing?C.border:C.green}`,
            background:refreshing?"transparent":C.green+"1A",
            cursor:refreshing?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:refreshing?C.gray:C.green,fontSize:18,fontWeight:900,
            animation:refreshing?"spin 1s linear infinite":"none",
          }}>↺</button>
          <button onClick={()=>setShowSnap(true)} title="Prendre un snapshot" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${C.btc}`,background:C.btc+"1A",
            cursor:"pointer",fontSize:15,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>📸</button>
          <button onClick={()=>setShowTrade(true)} title="Achat / Vente" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${C.teal}`,background:C.teal+"1A",
            cursor:"pointer",fontSize:15,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>💵</button>
        </div>

        {/* Centre : CREUSOT / GLOBAL INVESTMENTS + version (3 lignes) */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:11,fontWeight:900,color:C.btc,letterSpacing:.8,whiteSpace:"nowrap",lineHeight:1.05}}>CREUSOT</span>
            {gistSync===true  && <span onClick={()=>setShowGistDiag(true)} title="Cloudflare KV — connecté" style={{fontSize:10,color:C.green,cursor:"pointer"}}>☁︎</span>}
            {gistSync===false && <span onClick={()=>setShowGistDiag(true)} title="Erreur connexion" style={{fontSize:10,color:C.red,cursor:"pointer"}}>✗</span>}
            {gistSync===null  && <span style={{fontSize:10,color:C.gray}}>·</span>}
          </div>
          <span style={{fontSize:11,fontWeight:900,color:C.btc,letterSpacing:.5,whiteSpace:"nowrap",lineHeight:1.05}}>GLOBAL INVESTMENTS</span>
          <span style={{fontSize:9,fontWeight:700,color:C.btc,opacity:.8,fontFamily:"monospace",letterSpacing:.5}}>{APP_VERSION}</span>
        </div>

        {/* Droite : €/$ 👁 🎨 */}
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <button onClick={()=>setEur(!eur)} title={eur?"Passer en dollars":"Passer en euros"} style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${eur ? C.green : C.gold}`,
            background: eur ? C.green+"1A" : C.gold+"1A",
            cursor:"pointer",fontSize:14,fontWeight:900,
            color: eur ? C.green : C.gold,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{eur?"$":"€"}</button>
          <button onClick={()=>setHidden(!hidden)} title={hidden?"Afficher":"Masquer"} style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${hidden?C.btc:C.purple}`,
            background:hidden?C.btc+"1A":C.purple+"1A",
            cursor:"pointer",fontSize:15,color:hidden?C.btc:C.purple,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{hidden?"🙈":"👁"}</button>
          <button onClick={()=>setShowTheme(true)} title="Thème" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${C.purple}`,background:C.purple+"1A",
            cursor:"pointer",fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>🎨</button>
        </div>
      </div>
      {/* ── Pull-to-refresh indicator ── */}
      {(pullY>0||refreshing)&&(
        <div style={{
          position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",
          width:430,zIndex:200,display:"flex",justifyContent:"center",
          paddingTop:Math.min(pullY,40)+4,
          transition:pullY>0?"none":"all .3s ease",
        }}>
          <div style={{
            width:34,height:34,borderRadius:"50%",
            background:C.bg1,border:"1px solid "+C.border,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,.3)",
          }}>
            <div style={{
              fontSize:18,
              transform:"rotate("+(refreshing?0:Math.min(pullY/PULL_THRESHOLD,1)*360)+"deg)",
              animation:refreshing?"spin 0.8s linear infinite":"none",
              color:pullY>=PULL_THRESHOLD||refreshing?C.btc:C.gray,
            }}>↻</div>
          </div>
        </div>
      )}
      <div style={{padding:"0 16px"}}>
        {tab===0 && <PageOverview chartData={chartData} onSnapshot={()=>setShowSnap(true)} {...liveProps} liveDD={liveDD} liveCM={liveCM} liveGDBS={liveGDBS} liveGC={liveGC} chosenSource={chosenSource} iconDbVersion={iconDbVersion} bumpIconDb={bumpIconDb}/>}
        {tab===1 && <PageAllocation hidden={hidden} EFF={EFF} eur={eur} setEur={setEur} iconDbVersion={iconDbVersion} bumpIconDb={bumpIconDb}/>}
        {tab===2 && <PageStats chartData={chartData} hidden={hidden} EFF={EFF} eur={eur} liveDD={liveDD} src={EFF||CURRENT}/>}
        {tab===3 && <PageGDB chartData={chartData} hidden={hidden} EFF={EFF} eur={eur} liveGSB={liveGSB} liveGDBS={liveGDBS} liveBench={liveBench} liveGC={liveGC} liveDD={liveDD}/>}
        {tab===4 && <PageData EFF={EFF} hidden={hidden} txns={txns} chartData={chartData}
          liveDD={liveDD} liveGDBS={liveGDBS} liveGC={liveGC} liveGSB={liveGSB}
          liveCM={liveCM} liveSM={liveSM} liveTM={liveTM} liveBench={liveBench}/> }
        {/* Buy & Sell accessible via bouton flottant uniquement */}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:430,background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 20px",zIndex:100}}>
        {TABS.map((lb,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:tab===i?C.btc:C.text3,transition:"color .15s"}}>
            <span style={{fontSize:22}}>{ICONS[i]}</span>
            <span style={{fontSize:11,fontWeight:700}}>{lb}</span>
          </button>
        ))}
      </div>
      {/* Buy & Sell accessible via snapshot uniquement */}
      {/* VibeCoded signature */}
      <div style={{
        position:"fixed",bottom:4,left:"50%",transform:"translateX(-50%)",
        zIndex:101,pointerEvents:"none",
        fontSize:8,letterSpacing:.6,color:C.text3,opacity:.45,
        fontFamily:C.font||"system-ui",whiteSpace:"nowrap",
      }}>
        VibeCode by Nakajojo · Claude Sonnet 4.6
      </div>
      {/* Toast refresh — visible depuis tous les onglets */}
      {refreshErr&&typeof refreshErr==="object"&&(
        <div style={{
          position:"fixed",top:52,left:"50%",transform:"translateX(-50%)",
          zIndex:300,width:"92%",maxWidth:410,
          background:C.bg1,border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"10px 14px",
          boxShadow:"0 6px 24px rgba(0,0,0,.7)",
          fontSize:11,
        }}
          onClick={()=>setRefreshErr(null)}
        >
          {refreshErr.fail?.length>0&&(
            <div style={{color:C.red,marginBottom:refreshErr.ok?.length?5:0}}>
              <span style={{fontWeight:700}}>⚠ Échec :</span> {refreshErr.fail.join(", ")}
            </div>
          )}
          {refreshErr.ok?.length>0&&(
            <div style={{color:C.green}}>
              <span style={{fontWeight:700}}>✓ Mis à jour :</span> {refreshErr.ok.join(", ")}
            </div>
          )}
          <div style={{fontSize:9,color:C.text3,marginTop:4,textAlign:"right"}}>Appuie pour fermer</div>
        </div>
      )}
      {showTrade&&<TradeModal onClose={()=>setShowTrade(false)} onAdd={addTxn} onTradeApplied={applyTradeToEFF} EFF={EFF}/>}
      {showGistDiag&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowGistDiag(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:13,fontWeight:800,color:gistSync?C.green:C.red,marginBottom:14}}>
              {gistSync?"🟢":"🔴"} Connexion Cloudflare — {gistSync?"Opérationnelle":"Erreur"}
            </div>
            <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",fontFamily:"monospace",fontSize:11,display:"flex",flexDirection:"column",gap:8}}>
              <div><span style={{color:C.gray}}>WORKER :</span> <span style={{color:C.text,fontSize:9}}>{CF_WORKER_URL}</span></div>
              <div><span style={{color:C.gray}}>AUTH_KEY :</span> <span style={{color:C.text}}>{CF_AUTH_KEY.slice(0,8)}…</span></div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>Statut :</span>{" "}
                {gistSync ? (
                  <span style={{color:C.green,fontWeight:700}}>✓ Connecté — lecture/écriture OK</span>
                ) : (
                  <span style={{color:C.red,fontWeight:700}}>
                    {gistError?.status ?? "—"} {gistError?.statusText ?? "Connexion impossible"}
                  </span>
                )}
              </div>
              {!gistSync && gistError?.body&&(
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                  <div style={{color:C.gray,marginBottom:4}}>Réponse serveur :</div>
                  <div style={{color:C.text,wordBreak:"break-all",fontSize:10}}>{gistError.body}</div>
                </div>
              )}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>Endpoint :</span>
                <div style={{color:C.teal,fontSize:9,wordBreak:"break-all",marginTop:2}}>
                  {CF_WORKER_URL}/ping
                </div>
              </div>
            </div>
            {!gistSync&&(
              <div style={{marginTop:12,fontSize:10,color:C.gray,lineHeight:1.5}}>
                💡 Capture d'écran et envoie-la pour diagnostic.
              </div>
            )}
            <button onClick={()=>setShowGistDiag(false)} style={{
              marginTop:14,width:"100%",padding:"10px 0",borderRadius:10,
              background:gistSync?C.green+"22":C.bg2,
              border:`1px solid ${gistSync?C.green:C.border}`,
              color:gistSync?C.green:C.text,fontSize:13,cursor:"pointer",fontWeight:700,
            }}>Fermer</button>
          </div>
        </div>
      )}
      {showSnap&&<SnapshotModal onSave={addSnap} onClose={()=>setShowSnap(false)} EFF={EFF}/>}

      {/* ── Écran résultat snapshot ── */}
      {snapResult&&(
        <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={snapResult.uploadDone?()=>setSnapResult(null):undefined}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,maxHeight:"80vh",overflowY:"auto",
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 16px"}}/>

            <div style={{fontSize:14,fontWeight:800,color:snapResult.ok?C.green:C.red,marginBottom:14}}>
              {snapResult.ok?"✅ Bases de données mises à jour":"⚠️ Erreurs lors de la mise à jour"}
            </div>

            {/* ── Base locale ── */}
            <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>📱 Base locale</div>
              {snapResult.log.map((l,i)=>(
                <div key={i} style={{fontSize:11,color:l.startsWith("✓")?C.green:C.red,fontFamily:"monospace",marginBottom:3}}>{l}</div>
              ))}
              {snapResult.errors.map((e,i)=>(
                <div key={i} style={{fontSize:11,color:C.red,fontFamily:"monospace",marginBottom:3}}>{e}</div>
              ))}
            </div>

            {/* ── Cloudflare KV ── */}
            {snapResult.uploadDone ? (
              <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>☁️ Cloudflare KV</div>
                {(snapResult.uploadLog||[]).map((l,i)=>(
                  <div key={i} style={{fontSize:11,color:l.startsWith("✓")?C.green:C.red,fontFamily:"monospace",marginBottom:3}}>{l}</div>
                ))}
                {(snapResult.uploadErrors||[]).map((e,i)=>(
                  <div key={i} style={{fontSize:11,color:C.red,fontFamily:"monospace",marginBottom:3}}>{e}</div>
                ))}
              </div>
            ) : snapResult.pendingUpload ? (
              <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>☁️ Cloudflare KV</div>
                <div style={{fontSize:11,color:C.gray}}>En attente d'envoi…</div>
              </div>
            ) : null}

            {/* Boutons */}
            {snapResult.pendingUpload&&!snapResult.uploadDone&&(
              <button onClick={doSnapUpload} style={{
                width:"100%",padding:"12px 0",borderRadius:10,marginBottom:8,
                background:C.green,border:"none",color:"#000",fontSize:13,fontWeight:800,cursor:"pointer",
              }}>☁︎ Envoyer sur Cloudflare</button>
            )}
            {snapResult.pendingUpload&&!snapResult.uploadDone&&(
              <button onClick={()=>setSnapResult(null)} style={{
                width:"100%",padding:"10px 0",borderRadius:10,
                background:"transparent",border:`1px solid ${C.border}`,
                color:C.gray,fontSize:12,cursor:"pointer",
              }}>Ignorer — fermer</button>
            )}
            {snapResult.uploadDone&&(
              <button onClick={()=>setSnapResult(null)} style={{
                width:"100%",padding:"12px 0",borderRadius:10,
                background:C.bg2,border:`1px solid ${C.green}`,
                color:C.green,fontSize:13,fontWeight:800,cursor:"pointer",
              }}>Fermer</button>
            )}
          </div>
        </div>
      )}
      {showTheme&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowTheme(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 18px"}}/>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:16}}>🎨 Thème de l'application</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                ["dark",      "🌑","Fond sombre · Optimal la nuit"],
                ["arctic",    "☀️","Fond clair · Idéal en plein jour"],
                ["bloomberg", "🖥","Terminal · Style Bloomberg Pro"],
                ["midnight",  "✦", "Violet & Or · Premium crypto"],
                ["bitcoin",   "₿", "Orange pill · Bitcoin Standard"],
                ["frozen",    "❄️", "Blizzard · Frozen Throne"],
                ["tropical",  "🌴","Cocotiers · Eau turquoise"],
              ].map(([key,ic,desc])=>{
                const T=THEMES[key];
                return(
                  <button key={key} onClick={()=>applyTheme(key)} style={{
                    display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                    borderRadius:12,border:`2px solid ${themeName===key?C.btc:C.border}`,
                    background:themeName===key?C.btc+"11":C.bg2,
                    cursor:"pointer",textAlign:"left",transition:"all .15s",
                  }}>
                    <span style={{fontSize:22,flexShrink:0}}>{ic}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,
                        fontFamily:key==="bloomberg"?"'Courier New',monospace":"inherit"}}>{T.name}</div>
                      <div style={{fontSize:11,color:C.text3,marginTop:2}}>{desc}</div>
                    </div>
                    {/* Mini palette */}
                    <div style={{display:"flex",gap:3,flexShrink:0}}>
                      {[T.bg1,T.btc,T.green,T.blue].map((c,i)=>(
                        <div key={i} style={{width:12,height:12,borderRadius:3,background:c,border:`1px solid ${T.border}`}}/>
                      ))}
                    </div>
                    {themeName===key&&<span style={{color:C.btc,fontSize:16,flexShrink:0}}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{"*{box-sizing:border-box}button{outline:none}::-webkit-scrollbar{display:none}input,select{-webkit-appearance:none}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
