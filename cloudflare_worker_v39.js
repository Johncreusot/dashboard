/**
 * Watchlist & Thèses — Cloudflare Worker v39
 * (dérivé du Worker GDB & Sons v38 — mêmes connecteurs)
 *
 * Variables d'environnement requises :
 *   - AUTH_KEY     : secret partagé (doit correspondre à CF_AUTH_KEY côté front)
 *   - GDB_KV       : binding KV namespace
 *   - FMP_API_KEY  : clé API FinancialModelingPrep (SECRET — `wrangler secret put FMP_API_KEY`)
 *
 * Nouveautés v39 :
 *   - Clé KV `cgi_watchlist` ajoutée dans /read et /write-bases
 *     (stocke la watchlist : tickers + thèses + alertes de prix)
 *   - Clé FMP lue uniquement depuis env.FMP_API_KEY (plus aucune clé en dur)
 */

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Auth-Key",
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({}, CORS_HEADERS, {"Content-Type": "application/json"}),
  });
}

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // ── /ping — pas d'auth requise (diagnostic) ───────────────────────────────
  if (path === "/ping") {
    return json({
      ok: true,
      ts: Date.now(),
      hasKV: typeof GDB_KV !== "undefined",
      hasAuth: typeof AUTH_KEY !== "undefined",
    });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const clientKey = request.headers.get("X-Auth-Key");
  if (typeof AUTH_KEY === "undefined" || clientKey !== AUTH_KEY) {
    return json({ error: "Unauthorized" }, 401);
  }

  if (typeof GDB_KV === "undefined") {
    return json({ error: "KV namespace not bound — check Cloudflare Worker settings" }, 500);
  }

  // ── GET /read ─────────────────────────────────────────────────────────────
  if (path === "/read" && request.method === "GET") {
    const KEYS = [
      "cgi_data","cgi_txns","cgi_dd","cgi_snapshots","cgi_gdbs","cgi_gc","cgi_gsb",
      "cgi_cm","cgi_sm","cgi_tm",
      "cgi_portfolio","cgi_crypto","cgi_stocks","cgi_bank",
      "cgi_yfmap","cgi_icons","cgi_bench",
      "cgi_watchlist","cgi_inv","cgi_futures","cgi_ibkr_annex",
    ];
    const result = { _ok: true };
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      try {
        var raw = await GDB_KV.get(k);
        result[k] = raw ? JSON.parse(raw) : null;
      } catch (e) {
        result[k] = null;
        result["_err_"+k] = e.message;
      }
    }
    return json(result);
  }

  // ── POST /write ───────────────────────────────────────────────────────────
  if (path === "/write" && request.method === "POST") {
    try {
      var body = await request.text();
      JSON.parse(body); // validate JSON
      await GDB_KV.put("cgi_data", body);
      return json({ ok: true, key: "cgi_data" });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── POST /write-bases ─────────────────────────────────────────────────────
  if (path === "/write-bases" && request.method === "POST") {
    try {
      var body2 = await request.text();
      var bases = JSON.parse(body2);
      var ALLOWED = [
        "cgi_txns","cgi_dd","cgi_snapshots","cgi_gdbs","cgi_gc","cgi_gsb",
        "cgi_cm","cgi_sm","cgi_tm",
        "cgi_portfolio","cgi_crypto","cgi_stocks","cgi_bank",
        "cgi_yfmap","cgi_icons","cgi_bench",
        "cgi_watchlist","cgi_inv","cgi_futures","cgi_ibkr_annex",
      ];
      var written = [];
      var errors2 = [];
      // Écriture parallèle pour réduire le temps total
      await Promise.all(ALLOWED.map(async function(key) {
        if (bases[key] !== undefined && bases[key] !== null) {
          try {
            await GDB_KV.put(key, JSON.stringify(bases[key]));
            written.push(key);
          } catch (e2) {
            errors2.push(key + ": " + e2.message);
          }
        }
      }));
      return json({ ok: errors2.length === 0, written: written, errors: errors2 });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── GET /search?q= — Yahoo Finance autocomplete ────────────────────────
  if (path === "/search" && request.method === "GET") {
    const q = url.searchParams.get("q") || "";
    if (!q) return json({ error: "Missing q param" }, 400);
    const SH = {
      "User-Agent":   "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Accept":       "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer":      "https://finance.yahoo.com/",
      "Origin":       "https://finance.yahoo.com",
    };
    try {
      var sUrl = "https://query1.finance.yahoo.com/v1/finance/search?q=" + encodeURIComponent(q)
        + "&lang=en&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query";
      var sr = await fetch(sUrl, { headers: SH });
      if (!sr.ok) {
        sUrl = sUrl.replace("query1", "query2");
        sr = await fetch(sUrl, { headers: SH });
      }
      if (!sr.ok) return json({ error: "Yahoo search HTTP " + sr.status, quotes: [] }, 502);
      const sData = await sr.json();
      // Structure Yahoo : { quotes: [...] } à la racine (pas finance.result[0].quotes)
      const raw = sData.quotes || sData?.finance?.result?.[0]?.quotes || [];
      const quotes = raw
        .filter(x => x.symbol && ["EQUITY","ETF","CRYPTOCURRENCY","MUTUALFUND","INDEX"].includes(x.quoteType))
        .slice(0, 5)
        .map(x => ({
          symbol:    x.symbol,
          shortname: x.shortname || x.longname || x.symbol,
          exchange:  x.exchange || x.fullExchangeName || "",
          quoteType: x.quoteType,
        }));
      return json({ quotes, _raw_count: raw.length });
    } catch(e) {
      return json({ error: e.message, quotes: [] }, 500);
    }
  }

  // ── GET /yahoo?symbol= ────────────────────────────────────────────────────
  if (path === "/yahoo" && request.method === "GET") {
    var symbol = url.searchParams.get("symbol");
    if (!symbol) return json({ error: "symbol required" }, 400);
    try {
      var yahooUrl = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1d&range=5d";
      var res = await fetch(yahooUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) {
        yahooUrl = yahooUrl.replace("query1", "query2");
        res = await fetch(yahooUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      }
      var data = await res.json();
      var result2 = data && data.chart && data.chart.result && data.chart.result[0];
      if (!result2) return json({ symbol: symbol, price: null });
      var meta = result2.meta || {};
      var live2 = meta.regularMarketPrice;
      var quotes = result2.indicators && result2.indicators.quote && result2.indicators.quote[0];
      var closes = quotes && quotes.close ? quotes.close.filter(function(v){ return v != null; }) : [];
      var price = (live2 && live2 > 0) ? live2 : (closes.length ? closes[closes.length-1] : null);
      var prevClose = meta.chartPreviousClose || meta.previousClose || (closes.length>1 ? closes[closes.length-2] : null);
      var pct1d = (price!=null && prevClose) ? (price-prevClose)/prevClose : null;
      return json({ symbol: symbol, price: price, prevClose: prevClose, pct1d: pct1d });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── GET /yahoo-chart?symbol=AAPL&interval=1d&range=1mo ───────────────────
  // Retourne OHLC + meta (name, marketCap, currency, prevClose, price, news)
  if (path === "/yahoo-chart" && request.method === "GET") {
    var sym    = url.searchParams.get("symbol");
    var interv = url.searchParams.get("interval") || "1d";
    var range  = url.searchParams.get("range")    || "1mo";
    var noLogo = url.searchParams.get("no_logo")  === "1"; // skip FMP si logo déjà en base côté client
    if (!sym) return json({ error: "symbol required" }, 400);

    // Headers simulant un vrai browser — essentiels pour Yahoo
    var YH = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Origin": "https://finance.yahoo.com",
      "Referer": "https://finance.yahoo.com/",
    };

    try {
      // ── 1. CHART (OHLC + prix live) ────────────────────────────────────────
      var chartUrl = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym)
        + "?interval=" + interv + "&range=" + range + "&includePrePost=false";
      var cr = await fetch(chartUrl, { headers: YH });
      if (!cr.ok) {
        chartUrl = chartUrl.replace("query1", "query2");
        cr = await fetch(chartUrl, { headers: YH });
      }
      var cd = await cr.json();
      var res = cd && cd.chart && cd.chart.result && cd.chart.result[0];
      if (!res) return json({ error: "no chart data", symbol: sym }, 404);

      var meta   = res.meta || {};
      var quotes = (res.indicators && res.indicators.quote && res.indicators.quote[0]) || {};
      var ts     = res.timestamp || [];
      var candles = [];
      for (var i = 0; i < ts.length; i++) {
        if (quotes.close && quotes.close[i] != null) {
          candles.push({ t: ts[i]*1000, o: quotes.open&&quotes.open[i], h: quotes.high&&quotes.high[i], l: quotes.low&&quotes.low[i], c: quotes.close[i], v: quotes.volume&&quotes.volume[i] });
        }
      }

      // ── 2. Données enrichies — Yahoo prioritaire, FMP désactivé (mode debug Yahoo) ──
      var quoteResult = null;
      var longName = null, marketCap = null, sector = null, industry = null, quoteType = "", exchFull2 = null;
      var marketHours = null, logoUrl = null, marketState = null, exchangeTz = null;
      var volAvg = null, lastDiv = null, lastDivDate = null;
      var change1d = null, changePct1d = null;
      var topHoldings = null, etfCategory = null;
      // FMP — uniquement pour le logo (250 calls/jour) — sauté si no_logo=1
      var fmpError = null, fmpStatus = null;
      if(!noLogo){
        try {
          // Clé FMP lue UNIQUEMENT depuis la variable secrète (aucune clé en dur).
          var _fmpKey = (typeof FMP_API_KEY !== "undefined") ? FMP_API_KEY : null;
          if (_fmpKey) {
            var _fmpUrl = "https://financialmodelingprep.com/stable/profile?symbol=" + encodeURIComponent(sym) + "&apikey=" + _fmpKey;
            var _fmpR = await fetch(_fmpUrl);
            fmpStatus = _fmpR.status;
            if (_fmpR.ok) {
              var _fmpD = await _fmpR.json();
              var _fmpP = Array.isArray(_fmpD) ? _fmpD[0] : null;
              if (_fmpP) logoUrl = _fmpP.image || _fmpP.logo || null;
            }
          } else {
            fmpError = "FMP_API_KEY non définie (env)";
          }
        } catch(efmp) { fmpError = efmp.message; }
      }
      var yahooDebug = {};

      // ── A. Yahoo quoteSummary — source principale pour tous les fundamentals ──
      // Modules utilisés :
      //   summaryDetail  → marketCap, averageVolume, dividendRate, exDividendDate
      //   assetProfile   → sector, industry (stocks)
      //   quoteType      → quoteType, longName, symbol
      // Note: logo, CIK, ISIN → non disponibles dans Yahoo (FMP uniquement)
      try {
        // Étape 1: cookie via fc.yahoo.com
        yahooDebug.step = "cookie";
        var yCookieVal = "";
        var yFcResp = await fetch("https://fc.yahoo.com", {
          headers: { "User-Agent": YH["User-Agent"] }, redirect: "follow",
        }).catch(function(){ return null; });
        if (yFcResp) {
          var yFcCookie = yFcResp.headers.get("set-cookie") || "";
          if (yFcCookie) yCookieVal = yFcCookie.split(";")[0];
          yahooDebug.fcStatus = yFcResp.status;
        }

        // Étape 2 : crumb
        yahooDebug.step = "crumb";
        var yCrumb = null;
        for (var _ci = 0; _ci < 2 && !yCrumb; _ci++) {
          var _cHost = _ci === 0 ? "query1" : "query2";
          var _cResp = await fetch("https://" + _cHost + ".finance.yahoo.com/v1/test/getcrumb", {
            headers: Object.assign({}, YH, yCookieVal ? { "Cookie": yCookieVal } : {}),
          }).catch(function(){ return null; });
          if (_cResp && _cResp.ok) {
            var _ct = (await _cResp.text()).trim();
            if (_ct && _ct.length > 2 && !_ct.includes("{")) {
              yCrumb = _ct;
              var _cc = _cResp.headers.get("set-cookie");
              if (_cc) yCookieVal = _cc.split(";")[0];
            }
          }
          yahooDebug["crumbStatus" + _ci] = _cResp ? _cResp.status : 0;
        }
        yahooDebug.crumb = yCrumb ? yCrumb.slice(0,6) + "..." : "null";

        // Étape 3 : quoteSummary avec tous les modules utiles
        yahooDebug.step = "quoteSummary";
        var _qsModules = "summaryDetail,assetProfile,summaryProfile,quoteType,price,defaultKeyStatistics,topHoldings,fundProfile";
        var _qsUrl = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/"
          + encodeURIComponent(sym)
          + "?modules=" + encodeURIComponent(_qsModules)
          + "&formatted=false"
          + (yCrumb ? "&crumb=" + encodeURIComponent(yCrumb) : "");
        var _qsHeaders = Object.assign({}, YH, yCookieVal ? { "Cookie": yCookieVal } : {});
        var _qsResp = await fetch(_qsUrl, { headers: _qsHeaders });
        if (!_qsResp.ok) _qsResp = await fetch(_qsUrl.replace("query1","query2"), { headers: _qsHeaders });
        yahooDebug.qsStatus = _qsResp.status;

        if (_qsResp.ok) {
          var _qsRaw = await _qsResp.text();
          yahooDebug.qsLen = _qsRaw.length;
          var _qsData = JSON.parse(_qsRaw);
          var _qsErr  = _qsData && _qsData.quoteSummary && _qsData.quoteSummary.error;
          if (_qsErr) yahooDebug.qsErr = JSON.stringify(_qsErr).slice(0,100);
          var _qsRes  = _qsData && _qsData.quoteSummary && _qsData.quoteSummary.result && _qsData.quoteSummary.result[0];
          yahooDebug.hasResult = !!_qsRes;

          if (_qsRes) {
            var _sd  = _qsRes.summaryDetail        || {};
            var _ap  = _qsRes.assetProfile          || {};  // sector/industry pour stocks
            var _sp  = _qsRes.summaryProfile        || {};  // sector/industry fallback
            var _qt  = _qsRes.quoteType             || {};
            var _th  = _qsRes.topHoldings           || {};
            var _fp2 = _qsRes.fundProfile           || {};
            var _pr  = _qsRes.price                 || {};
            var _dks = _qsRes.defaultKeyStatistics  || {};  // marketState, regularMarketChange

            // Helper : Yahoo retourne parfois {raw, fmt} même avec formatted=false
            var _raw = function(v) {
              if (v == null) return null;
              if (typeof v === "object" && v.raw != null) return v.raw;
              return v;
            };

            // Identité
            longName  = _qt.longName || _qt.shortName || null;
            quoteType = _qt.quoteType || "";
            exchFull2 = _qt.exchange  || null;

            // État du marché depuis price module (REGULAR/PRE/POST/CLOSED)
            marketState = _pr.marketState || null;
            exchangeTz  = _pr.exchangeTimezoneName || _qt.timeZoneFullName || null;
            yahooDebug.marketState = marketState || "null";
            yahooDebug.longName  = longName;
            yahooDebug.quoteType = quoteType;

            // Log les clés disponibles pour diagnostic

            // Fondamentaux financiers — extraire .raw si nécessaire
            // marketCap : summaryDetail pour stocks, price module pour ETF
            // ETF : totalAssets (AUM) = équivalent market cap dans defaultKeyStatistics
            marketCap = _raw(_sd.marketCap) || _raw(_pr.marketCap) || _raw(_dks.totalAssets) || null;
            // volume : summaryDetail.averageVolume ou averageVolume10days
            volAvg    = _raw(_sd.averageVolume) || _raw(_sd.averageVolume10days)
                     || _raw(_pr.averageDailyVolume3Month) || _raw(_pr.averageDailyVolume10Day) || null;
            yahooDebug.marketCap = marketCap ? "ok:" + Math.round(marketCap/1e9) + "B" : "null";
            yahooDebug.volAvg    = volAvg ? "ok" : "null";
            // Log sdKeys + prKeys pour diagnostiquer les champs disponibles
            yahooDebug.sdKeys = Object.keys(_sd).slice(0,15).join(",");
            yahooDebug.prKeys = Object.keys(_pr).slice(0,15).join(",");

            // Dividende : summaryDetail ou price (ETF)
            var _divRate = _raw(_sd.dividendRate) || _raw(_sd.trailingAnnualDividendRate)
                        || _raw(_pr.trailingAnnualDividendRate) || null;
            var _divDate = _raw(_sd.exDividendDate) || _raw(_pr.exDividendDate) || null;
            if (_divDate && typeof _divDate === "number") _divDate = new Date(_divDate * 1000).toISOString().slice(0,10);
            lastDiv = _divRate; lastDivDate = _divDate;
            yahooDebug.divRate = _divRate != null ? String(_divRate) : "null";
            yahooDebug.divDate = _divDate || "null";

            // Variation du jour — depuis summaryDetail ou price (déjà déclaré plus haut)
            var _change    = _raw(_pr.regularMarketChange)        || _raw(_sd.regularMarketChange)    || null;
            var _changePct = _raw(_pr.regularMarketChangePercent) || _raw(_sd.regularMarketChangePercent) || null;
            if (_changePct && Math.abs(_changePct) < 1) _changePct = _changePct * 100; // Yahoo retourne 0.09 pour 9%
            yahooDebug.change = _change != null ? "ok" : "null";

            // Secteur/Industrie : assetProfile/summaryProfile (stocks) ou fundProfile (ETF)
            sector   = _ap.sector   || _sp.sector   || _fp2.categoryName || null;
            industry = _ap.industry || _sp.industry || _fp2.fundFamily   || null;
            yahooDebug.sector   = sector   || "null";
            yahooDebug.industry = industry || "null";

            // ETF : categoryName + holdings
            etfCategory = _fp2.categoryName || _fp2.fundFamily || null;
            yahooDebug.etfCategory = etfCategory || "null";
            if (_th.holdings && _th.holdings.length > 0) {
              topHoldings = _th.holdings.slice(0, 10).map(function(h) {
                return {
                  symbol: h.symbol || "",
                  name:   h.holdingName || h.symbol || "",
                  pct:    h.holdingPercent != null ? Math.round(h.holdingPercent * 1000) / 10 : null,
                };
              });
              yahooDebug.holdingsCount = topHoldings.length;
            } else {
              yahooDebug.holdingsCount = 0;
            }
          }
        } else {
          yahooDebug.step = "qs_http_fail";
          yahooDebug.body = await _qsResp.text().then(function(t){ return t.slice(0,150); }).catch(function(){ return ""; });
        }
      } catch(eyh) {
        yahooDebug.step = "exception";
        yahooDebug.error = eyh.message || String(eyh);
      }

      // ── B. Yahoo /v7/quote — fallback si quoteSummary a raté le longName/quoteType ──
      try {
        if (!longName || !quoteType || !marketState) {
          var _v7url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + encodeURIComponent(sym)
            + "&fields=longName,shortName,quoteType,fullExchangeName,marketState,exchangeTimezoneName,exchangeTimezoneShortName";
          var _v7r = await fetch(_v7url, { headers: YH });
          if (!_v7r.ok) _v7r = await fetch(_v7url.replace("query1","query2"), { headers: YH });
          if (_v7r.ok) {
            var _v7d = await _v7r.json();
            var _v7i = _v7d && _v7d.quoteResponse && _v7d.quoteResponse.result && _v7d.quoteResponse.result[0];
            if (_v7i) {
              if (!longName)    longName    = _v7i.longName || _v7i.shortName;
              if (!quoteType)   quoteType   = _v7i.quoteType || "";
              if (!exchFull2)   exchFull2   = _v7i.fullExchangeName;
              if (!marketState) marketState = _v7i.marketState || null;
              if (!exchangeTz)  exchangeTz  = _v7i.exchangeTimezoneName || null;
            }
          }
          yahooDebug.v7 = "used";
        }
      } catch(ev7) { yahooDebug.v7err = ev7.message; }

      quoteResult = { longName, marketCap, sector, industry, quoteType, fullExchangeName: exchFull2 };

      // ── 3. NEWS via /v1/finance/search ────────────────────────────────────
      var newsItems = [];
      try {
        var nUrl = "https://query1.finance.yahoo.com/v1/finance/search?q=" + encodeURIComponent(sym)
          + "&newsCount=8&quotesCount=0&enableFuzzyQuery=false&lang=en-US";
        var nr = await fetch(nUrl, { headers: YH });
        if (!nr.ok) { nUrl = nUrl.replace("query1","query2"); nr = await fetch(nUrl, { headers: YH }); }
        if (nr.ok) {
          var nd = await nr.json();
          var rawNews = nd && nd.news || [];
          newsItems = rawNews.slice(0,8).map(function(n){ return {
            title:     n.title || "",
            publisher: n.publisher || "",
            url:       n.link || "",
            time:      n.providerPublishTime ? n.providerPublishTime * 1000 : null,
            thumbnail: n.thumbnail && n.thumbnail.resolutions && n.thumbnail.resolutions[0] && n.thumbnail.resolutions[0].url || null,
          };});
        }
      } catch(e4) {}

      // ── 4. Exchange → pays ────────────────────────────────────────────────
      var EXCHANGE_MAP = {
        "NYQ":{cc:"US",city:"New York (NYSE)"},"NMS":{cc:"US",city:"New York (NASDAQ)"},
        "NGM":{cc:"US",city:"New York (NASDAQ)"},"PCX":{cc:"US",city:"NYSE Arca"},
        "LSE":{cc:"GB",city:"Londres (LSE)"},"PAR":{cc:"FR",city:"Paris (Euronext)"},
        "MIL":{cc:"IT",city:"Milan (Euronext)"},"FRA":{cc:"DE",city:"Francfort (XETRA)"},
        "GER":{cc:"DE",city:"Francfort (XETRA)"},"AMS":{cc:"NL",city:"Amsterdam (Euronext)"},
        "BRU":{cc:"BE",city:"Bruxelles (Euronext)"},"TSX":{cc:"CA",city:"Toronto (TSX)"},
        "TOR":{cc:"CA",city:"Toronto (TSX)"},"ASX":{cc:"AU",city:"Sydney (ASX)"},
        "HKG":{cc:"HK",city:"Hong Kong (HKEX)"},"CCC":{cc:"CRYPTO",city:"Crypto"},
      };
      var exchCode = (quoteResult && quoteResult.fullExchangeName) || meta.exchangeName || "";
      // Map fullExchangeName string → cc
      var ccMap = {"NASDAQ":"US","NYSE":"US","NYSE Arca":"US","LSE":"GB","Paris":"FR","Milan":"IT","XETRA":"DE","Amsterdam":"NL","Toronto":"CA","Crypto":"CRYPTO"};
      var exInfo = EXCHANGE_MAP[exchCode] || { cc: ccMap[exchCode] || "US", city: exchCode };

      // ── Prix spot robuste ──────────────────────────────────────────────────
      // Quand le marché est fermé (marketState !== "REGULAR"), on privilégie
      // le close du dernier candle OHLC — plus fiable que regularMarketPrice
      // qui peut être le pre/post-market ou une valeur décalée pour les EU.
      var allCloses = [];
      for(var ci = 0; ci < candles.length; ci++){
        if(candles[ci].c != null) allCloses.push(candles[ci].c);
      }
      var lastCandleClose = allCloses.length ? allCloses[allCloses.length-1] : null;
      var prevCandleClose = allCloses.length > 1 ? allCloses[allCloses.length-2] : null;
      var metaPrice       = meta.regularMarketPrice || null;
      var metaPrevClose   = meta.chartPreviousClose || meta.previousClose || null;
      var mktState        = marketState || meta.marketState || "CLOSED";

      var spotPrice, spotPrevClose;
      if(mktState !== "REGULAR" && lastCandleClose){
        // Marché fermé → close OHLC prioritaire
        spotPrice     = lastCandleClose;
        spotPrevClose = prevCandleClose || metaPrevClose;
      } else if(lastCandleClose && metaPrice){
        // Marché ouvert → vérifier cohérence (ratio ±50%)
        var ratio = metaPrice / lastCandleClose;
        spotPrice     = (ratio < 0.5 || ratio > 2.0) ? lastCandleClose : metaPrice;
        spotPrevClose = (ratio < 0.5 || ratio > 2.0) ? (prevCandleClose || metaPrevClose) : (metaPrevClose || prevCandleClose);
      } else {
        spotPrice     = metaPrice || lastCandleClose;
        spotPrevClose = metaPrevClose || prevCandleClose;
      }

      return json({
        symbol:      sym,
        name:        (quoteResult && (quoteResult.longName||quoteResult.shortName)) || meta.longName || meta.shortName || sym,
        currency:    meta.currency || "USD",
        price:       spotPrice,
        prevClose:   spotPrevClose,
        marketCap:   (quoteResult && quoteResult.marketCap) || null,
        exchange:    exchCode,
        exchangeCC:  exInfo.cc,
        exchangeCity:exInfo.city,
        quoteType:   (quoteResult && quoteResult.quoteType) || (function(){
          // Yahoo retourne "EQUITY" pour les ETC/ETF EU quand quoteSummary échoue
          // 1. Essai via instrumentType du meta
          var it = meta.instrumentType || "";
          if(it === "ETF" || it === "ETC") return "ETF";
          if(it === "MUTUALFUND") return "MUTUALFUND";
          // 2. Heuristique : ETC/ETF identifiés par le nom (Amundi, iShares, Lyxor, Xtrackers…)
          var longN = (meta.longName || meta.shortName || "").toLowerCase();
          var etfKeywords = ["etc ", "etf", "amundi", "ishares", "lyxor", "xtrackers",
            "physical", "tracker", "ucits", "index fund", "world index"];
          for (var ki = 0; ki < etfKeywords.length; ki++){
            if(longN.indexOf(etfKeywords[ki]) >= 0) return "ETF";
          }
          return it || "";
        })(),
        sector:      (quoteResult && quoteResult.sector)    || "",
        industry:    (quoteResult && quoteResult.industry)  || "",
        logoUrl:     logoUrl     || null,
        marketState: marketState || null,
        exchangeTz:  exchangeTz  || null,
        etfCategory: etfCategory || null,
        topHoldings: topHoldings || null,
        _yahooDebug: yahooDebug,
        volAvg:      volAvg      || null,
        lastDiv:     lastDiv     || null,
        lastDivDate: lastDivDate || null,
        change1d:    change1d    || null,
        changePct1d: changePct1d || null,
        marketHours: marketHours || null,
        _fmpDebug: {
          status:      fmpStatus,
          error:       fmpError,
          hasKey:      false, // FMP désactivé
          fields: {
            marketCap:   marketCap   != null ? "ok" : "null",
            sector:      sector      ? "ok" : "null",
            industry:    industry    ? "ok" : "null",
            logoUrl:     logoUrl     ? "ok" : "null",
            volAvg:      volAvg      != null ? "ok" : "null",
            lastDiv:     lastDiv     != null ? "ok" : "null",
            lastDivDate: lastDivDate ? "ok" : "null",
            marketHours: marketHours ? "ok" : "null",
          }
        },
        candles:     candles,
        news:        newsItems,
      });
    } catch(e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── GET /coingecko-coin?id=bitcoin&symbol=BTC ────────────────────────────
  // Métriques complètes (marketCap, ATH, supply, rank, logo, categories, news)
  // Résultat mis en cache KV 1h pour éviter le rate-limit CoinGecko (429)
  if (path === "/coingecko-coin" && request.method === "GET") {
    var cgId  = url.searchParams.get("id");
    var cgSym = url.searchParams.get("symbol") || "";
    var noCache = url.searchParams.get("no_cache") === "1";
    if (!cgId) return json({ error: "id required" }, 400);

    var CG = {
      "Accept":          "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Referer":         "https://www.coingecko.com/",
      "Origin":          "https://www.coingecko.com",
    };
    var CG_BASE = "https://api.coingecko.com/api/v3";
    var cacheKey = "cg_coin_" + cgId;

    try {
      // ── Lecture cache KV (TTL 1h) ──────────────────────────────────────────
      if (!noCache && typeof GDB_KV !== "undefined") {
        var cached = await GDB_KV.get(cacheKey);
        if (cached) {
          var cachedData = JSON.parse(cached);
          // Ajouter les news fraîches (pas cachées)
          cachedData._fromCache = true;
          return json(cachedData);
        }
      }

      // ── 1. Métriques /coins/{id} ──────────────────────────────────────────
      var coinUrl = CG_BASE + "/coins/" + encodeURIComponent(cgId)
        + "?localization=false&tickers=false&market_data=true&community_data=false"
        + "&developer_data=false&sparkline=false";
      var cr = await fetch(coinUrl, { headers: CG });
      if (!cr.ok) return json({ error: "CoinGecko coin error: " + cr.status + " (id: " + cgId + ")" }, 502);
      var coin = await cr.json();
      var md = coin.market_data || {};

      // ── 2. News Yahoo Finance ──────────────────────────────────────────────
      var newsItems = [];
      var newsQuery = cgSym || cgId;
      try {
        var nUrl = "https://query1.finance.yahoo.com/v1/finance/search?q=" + encodeURIComponent(newsQuery)
          + "&newsCount=8&quotesCount=0&enableFuzzyQuery=false&lang=en-US";
        var nr = await fetch(nUrl, { headers: { "User-Agent":"Mozilla/5.0","Accept":"application/json","Origin":"https://finance.yahoo.com","Referer":"https://finance.yahoo.com/" } });
        if (!nr.ok) { nUrl = nUrl.replace("query1","query2"); nr = await fetch(nUrl); }
        if (nr.ok) {
          var nd = await nr.json();
          newsItems = (nd.news || []).slice(0,8).map(function(n){ return {
            title: n.title||"", publisher: n.publisher||"", url: n.link||"",
            time: n.providerPublishTime ? n.providerPublishTime*1000 : null,
            thumbnail: n.thumbnail&&n.thumbnail.resolutions&&n.thumbnail.resolutions[0]&&n.thumbnail.resolutions[0].url||null,
          };});
        }
      } catch(en) {}

      // ── 3. Dominance BTC ──────────────────────────────────────────────────
      var btcDominance = null;
      if (cgId === "bitcoin") {
        try {
          var gr = await fetch(CG_BASE + "/global", { headers: CG });
          if (gr.ok) { var gd = await gr.json(); btcDominance = gd.data&&gd.data.market_cap_percentage&&gd.data.market_cap_percentage.btc||null; }
        } catch(eg) {}
      }

      // ── 4. Catégories ─────────────────────────────────────────────────────
      var categories = Array.isArray(coin.categories) ? coin.categories.filter(function(c){return c&&c.length>0;}) : [];

      // ── Prix spot depuis market_data ───────────────────────────────────────
      var spotPrice  = md.current_price&&md.current_price.usd||null;
      var prevClose  = spotPrice&&md.price_change_24h ? spotPrice-md.price_change_24h : null;

      var result = {
        name:              coin.name||cgId,
        symbol:            (coin.symbol||"").toUpperCase(),
        rank:              coin.market_cap_rank||null,
        logoUrl:           coin.image&&(coin.image.large||coin.image.small)||null,
        price:             spotPrice,
        prevClose:         prevClose,
        currency:          "USD",
        pct1d:             md.price_change_percentage_24h||null,
        marketCap:         md.market_cap&&md.market_cap.usd||null,
        volume24h:         md.total_volume&&md.total_volume.usd||null,
        ath:               md.ath&&md.ath.usd||null,
        athChangesPct:     md.ath_change_percentage&&md.ath_change_percentage.usd||null,
        athDate:           md.ath_date&&md.ath_date.usd||null,
        circulatingSupply: md.circulating_supply||null,
        maxSupply:         md.max_supply||null,
        totalSupply:       md.total_supply||null,
        sector:            categories[0]||null,
        industry:          categories[1]||null,
        quoteType:         "CRYPTO",
        btcDominance:      btcDominance,
        news:              newsItems,
        _cgDebug: { id:cgId, hasMarketData:!!md.current_price, newsCount:newsItems.length, categories:categories.slice(0,5) },
      };

      // ── Mise en cache KV 1h ───────────────────────────────────────────────
      if (typeof GDB_KV !== "undefined") {
        await GDB_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
      }

      return json(result);
    } catch(e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── GET /coingecko-ohlc?id=bitcoin&days=7 ────────────────────────────────
  // OHLC seulement — appelé à chaque changement de timeframe (léger, pas de cache)
  if (path === "/coingecko-ohlc" && request.method === "GET") {
    var oId   = url.searchParams.get("id");
    var oDays = url.searchParams.get("days") || "7";
    if (!oId) return json({ error: "id required" }, 400);

    var CGO = {
      "Accept":          "application/json",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Referer":         "https://www.coingecko.com/",
      "Origin":          "https://www.coingecko.com",
    };
    var CGOB = "https://api.coingecko.com/api/v3";

    // days valides pour OHLC : 1, 7, 14, 30, 90, 180, 365, max
    var validD = [1,7,14,30,90,180,365,"max"];
    var dNum = parseInt(oDays);
    var ohlcDays = oDays === "max" ? "max" : (function(){
      for (var di=0; di<validD.length; di++){
        if(validD[di]!=="max" && dNum<=validD[di]) return validD[di];
      }
      return "max";
    })();

    try {
      var oUrl = CGOB + "/coins/" + encodeURIComponent(oId) + "/ohlc?vs_currency=usd&days=" + ohlcDays;
      var or2 = await fetch(oUrl, { headers: CGO });
      if (!or2.ok) return json({ error: "OHLC error: " + or2.status }, 502);
      var oRaw = await or2.json();
      var candles = Array.isArray(oRaw) ? oRaw.map(function(r){return{t:r[0],o:r[1],h:r[2],l:r[3],c:r[4]};}) : [];
      return json({ candles: candles, ohlcDays: ohlcDays });
    } catch(e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── POST /delete ──────────────────────────────────────────────────────────  // ── POST /delete ──────────────────────────────────────────────────────────
  // Body: { keys: ["cgi_dd", ...] } ou { all: true }
  if (path === "/delete" && request.method === "POST") {
    try {
      var body3 = await request.text();
      var payload = JSON.parse(body3);
      var ALLOWED = ["cgi_data","cgi_txns","cgi_dd","cgi_gdbs","cgi_gc","cgi_gsb","cgi_bench","cgi_cm","cgi_sm","cgi_tm","cgi_portfolio","cgi_crypto","cgi_stocks","cgi_bank","cgi_yfmap","cgi_icons","cgi_snapshots","cgi_watchlist"];
      var toDelete = payload.all ? ALLOWED : (payload.keys || []).filter(function(k){ return ALLOWED.indexOf(k) >= 0; });
      var deleted = []; var delErrors = [];
      await Promise.all(toDelete.map(async function(key) {
        try { await GDB_KV.delete(key); deleted.push(key); }
        catch(e) { delErrors.push(key + ": " + e.message); }
      }));
      return json({ ok: delErrors.length === 0, deleted: deleted, errors: delErrors });
    } catch(e) {
      return json({ error: e.message }, 500);
    }
  }

  // ── POST /migrate-kv ─────────────────────────────────────────────────────
  // Migration one-shot : lit les anciennes clés gdb_* et réécrit sous cgi_*
  // puis supprime les gdb_*. Idempotent (skip si cgi_* déjà rempli).
  if (path === "/migrate-kv" && request.method === "POST") {
    var MIGRATE_MAP = {
      "gdb_snapshots": "cgi_snapshots",
      "gdb_txns":      "cgi_txns",
      "gdb_dd":        "cgi_dd",
      "gdb_gdbs":      "cgi_gdbs",
      "gdb_cm":        "cgi_cm",
      "gdb_sm":        "cgi_sm",
      "gdb_tm":        "cgi_tm",
      "gdb_portfolio": "cgi_portfolio",
      "gdb_crypto":    "cgi_crypto",
      "gdb_stocks":    "cgi_stocks",
      "gdb_bank":      "cgi_bank",
      "gdb_yfmap":     "cgi_yfmap",
      "gdb_icons":     "cgi_icons",
      "gdb_watchlist": "cgi_watchlist",
      "gdb_gc":        "cgi_gc",
      "gdb_gsb":       "cgi_gsb",
      "gdb_bench":     "cgi_bench",
    };
    var migrated = [], skipped = [], errors = [];
    await Promise.all(Object.entries(MIGRATE_MAP).map(async function([oldKey, newKey]) {
      try {
        // Si cgi_* existe déjà et non vide → skip (idempotent)
        var existing = await GDB_KV.get(newKey);
        if (existing && existing !== "null") {
          // cgi_* déjà rempli — supprimer quand même l'ancien gdb_*
          try { await GDB_KV.delete(oldKey); } catch(e){}
          skipped.push(newKey + " (déjà présent)");
          return;
        }
        var val = await GDB_KV.get(oldKey);
        if (val === null) {
          skipped.push(oldKey + " (vide)");
          return;
        }
        await GDB_KV.put(newKey, val);
        await GDB_KV.delete(oldKey);
        migrated.push(oldKey + " → " + newKey);
      } catch(e) {
        errors.push(oldKey + ": " + e.message);
      }
    }));
    return json({
      ok: errors.length === 0,
      migrated: migrated,
      skipped: skipped,
      errors: errors,
      summary: migrated.length + " clés migrées, " + skipped.length + " sautées, " + errors.length + " erreurs"
    });
  }

  return json({ error: "Not found", path: path }, 404);
}
