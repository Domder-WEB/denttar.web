(function () {
  var DNY = ["po", "út", "st", "čt", "pá", "so", "ne"];
  var DEN_KDY = ["v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pátek", "v sobotu", "v neděli"];
  var MESICE = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var paragraphs = function (s) {
    return String(s || "").split(/\n+/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  };
  var imgSrc = function (s) {
    s = String(s || "").trim().replace(/^\/+/, "");
    return /^[\w\-. \/]+$/.test(s) && s.indexOf("..") === -1 ? encodeURI(s) : "";
  };
  var getJSON = function (u) {
    return fetch(u, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(u);
      return r.json();
    }).catch(function () { return null; });
  };

  function toMin(s) {
    var m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(s || "");
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  function fmt(min) { return Math.floor(min / 60) + ":" + ("0" + (min % 60)).slice(-2); }

  // každý den může mít až dva úseky (dopoledne a odpoledne)
  function weekTable(hodiny) {
    var byDay = [[], [], [], [], [], [], []];
    (hodiny || []).forEach(function (h, i) {
      var idx = DNY.indexOf(String(h.den || "").toLowerCase().slice(0, 2));
      if (idx < 0) idx = i;
      if (idx > 6) return;
      [[h.od, h["do"]], [h.od2, h.do2]].forEach(function (p) {
        var od = toMin(p[0]), end = toMin(p[1]);
        if (od != null && end != null && end > od) byDay[idx].push({ od: od, do: end });
      });
      byDay[idx].sort(function (a, b) { return a.od - b.od; });
    });
    return byDay;
  }

  function statusNow(hodiny, now) {
    var byDay = weekTable(hodiny);
    var today = (now.getDay() + 6) % 7;
    var cur = now.getHours() * 60 + now.getMinutes();
    var t = byDay[today], i;
    for (i = 0; i < t.length; i++) {
      if (cur >= t[i].od && cur < t[i].do) return { open: true, text: "Otevřeno", detail: "Ordinujeme do " + fmt(t[i].do) };
    }
    for (i = 0; i < t.length; i++) {
      if (cur < t[i].od) return { open: false, text: "Zavřeno", detail: "Dnes otevíráme v " + fmt(t[i].od) };
    }
    for (i = 1; i <= 7; i++) {
      var d = (today + i) % 7;
      if (byDay[d].length) {
        return { open: false, text: "Zavřeno", detail: "Znovu otevíráme " + (i === 1 ? "zítra" : DEN_KDY[d]) + " v " + fmt(byDay[d][0].od) };
      }
    }
    return { open: false, text: "Zavřeno", detail: "" };
  }

  if (typeof module !== "undefined") { module.exports = { statusNow: statusNow, toMin: toMin }; }
  if (typeof document === "undefined") return;

  function section(id, show) {
    var el = $(id);
    if (el) el.hidden = !show;
    var link = document.querySelector('nav a[data-sec="' + id + '"]');
    if (link) link.hidden = !show;
  }
  function initials(name) {
    var clean = String(name || "").replace(/\b(MUDr|MDDr|DiS|Bc|Mgr|Ing|Dr|Ph|D)\b\.?/gi, "").replace(/[\[\]]/g, "");
    var parts = clean.trim().split(/\s+/).filter(Boolean);
    return ((parts[0] || "?").charAt(0) + (parts[1] ? parts[1].charAt(0) : "")).toUpperCase();
  }
  function digits(s) { return String(s || "").replace(/[^\d+]/g, ""); }

  Promise.all([getJSON("data/web.json"), getJSON("data/aktuality.json")]).then(function (r) {
    var w = r[0], a = (r[1] && r[1].aktuality) || [];
    if (!w) {
      $("status-text").textContent = "Obsah se nepodařilo načíst";
      $("status-detail").textContent = "Otevřete web přes jeho internetovou adresu, ne jako soubor v počítači.";
      return;
    }

    var nazev = w.nazev || "Denttar";
    document.title = nazev + " – " + (w.podtitul || "zubní ordinace");
    $("nazev").textContent = nazev;
    $("foot-nazev").textContent = nazev;
    $("podtitul").textContent = w.podtitul || "";
    if (w.nadpis) $("nadpis").textContent = w.nadpis;
    $("uvod-text").textContent = w.uvod || "";
    $("rok").textContent = new Date().getFullYear();

    var logo = imgSrc(w.logo);
    if (logo) { $("logo-wrap").innerHTML = '<img src="' + esc(logo) + '" alt="">'; }

    var foto = imgSrc(w.foto);
    if (foto) { $("foto-wrap").innerHTML = '<img src="' + esc(foto) + '" alt="' + esc(nazev) + '">'; $("foto-wrap").hidden = false; }

    if (w.oznameni) { $("oznameni").textContent = w.oznameni; $("oznameni").hidden = false; }

    // kontakt
    var tel = digits(w.telefon);
    $("telefon").textContent = w.telefon || "";
    $("telefon").href = tel ? "tel:" + tel : "#kontakt";
    if (tel) $("hero-tel").href = "tel:" + tel;
    $("hero-tel").textContent = tel ? "Zavolat a objednat se" : "Objednat se";
    $("email").textContent = w.email || "";
    $("email").href = w.email ? "mailto:" + w.email : "#kontakt";
    $("adresa").textContent = w.adresa || "";
    $("doprava").textContent = w.doprava || "";
    $("doprava-wrap").hidden = !w.doprava;
    if (w.mapa_odkaz && /^https?:\/\//.test(w.mapa_odkaz)) { $("mapa").href = w.mapa_odkaz; $("mapa").hidden = false; }
    $("foot-prov").textContent = w.provozovatel || "";
    $("foot-ico").textContent = w.ico || "";

    // stav
    var hodiny = w.hodiny || [];
    function renderStatus() {
      var s = statusNow(hodiny, new Date());
      $("status-text").textContent = s.text;
      $("status-detail").textContent = s.detail;
      $("dot").className = "dot" + (s.open ? " is-open" : "");
    }
    renderStatus();
    setInterval(renderStatus, 60000);

    // hodiny
    var todayIdx = (new Date().getDay() + 6) % 7;
    $("hodiny-tab").innerHTML = hodiny.map(function (h, i) {
      var idx = DNY.indexOf(String(h.den || "").toLowerCase().slice(0, 2));
      if (idx < 0) idx = i;
      var parts = [];
      if (h.od && h["do"]) parts.push(esc(h.od) + " – " + esc(h["do"]));
      if (h.od2 && h.do2) parts.push(esc(h.od2) + " – " + esc(h.do2));
      var cell = parts.length ? parts.join(",&nbsp; ") : '<span class="closed">zavřeno</span>';
      return '<tr' + (idx === todayIdx ? ' class="today"' : '') + '><th scope="row">' + esc(h.den) + '</th><td>' + cell + '</td></tr>';
    }).join("");
    $("objednani").innerHTML = paragraphs(w.objednani);
    section("hodiny", hodiny.length > 0);

    // aktuality
    a = a.slice().sort(function (x, y) { return String(y.datum).localeCompare(String(x.datum)); });
    $("aktuality-list").innerHTML = a.length ? a.map(function (n) {
      var d = new Date(n.datum);
      var date = isNaN(d) ? '<span class="news__day">·</span>' :
        '<span class="news__day">' + d.getDate() + '</span><span class="news__mon">' + MESICE[d.getMonth()] + " " + d.getFullYear() + '</span>';
      return '<article class="news__item"><div class="news__date">' + date + '</div><div class="news__body"><h3>' + esc(n.nadpis) + '</h3>' + paragraphs(n.text) + '</div></article>';
    }).join("") : '<p class="empty">Zatím tu nejsou žádné aktuality.</p>';

    // služby
    var sl = w.sluzby || [];
    $("sluzby-list").innerHTML = sl.map(function (s) {
      return '<div><dt>' + esc(s.nazev) + '</dt><dd>' + esc(s.popis) + '</dd></div>';
    }).join("");
    section("sluzby", sl.length > 0);

    // první návštěva
    var nv = w.navsteva || [];
    $("navsteva-list").innerHTML = nv.map(function (s) {
      return '<li><div><h3>' + esc(s.krok) + '</h3><p>' + esc(s.popis) + '</p></div></li>';
    }).join("");
    section("navsteva", nv.length > 0);

    // ceník
    var ce = w.cenik || [];
    $("cenik-list").innerHTML = ce.map(function (c) {
      return '<li><span>' + esc(c.polozka) + '</span><span>' + esc(c.cena) + '</span></li>';
    }).join("");
    section("cenik", ce.length > 0);

    // tým
    var ty = w.tym || [];
    $("tym-list").innerHTML = ty.map(function (t) {
      var f = imgSrc(t.foto);
      var pic = f ? '<img src="' + esc(f) + '" alt="' + esc(t.jmeno) + '">' : esc(initials(t.jmeno));
      return '<li class="person"><div class="person__pic">' + pic + '</div><h3>' + esc(t.jmeno) + '</h3><p>' + esc(t.role) + '</p></li>';
    }).join("");
    section("tym", ty.length > 0);

    // galerie
    var ga = (w.galerie || []).filter(function (g) { return imgSrc(g.foto); });
    $("galerie-list").innerHTML = ga.map(function (g) {
      return '<img loading="lazy" src="' + esc(imgSrc(g.foto)) + '" alt="' + esc(g.popis || "Fotografie ordinace") + '">';
    }).join("");
    section("galerie", ga.length > 0);

    // pojišťovny
    var po = w.pojistovny || [];
    $("pojistovny-list").innerHTML = po.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    section("pojistovny", po.length > 0);

    // faq
    var fq = w.faq || [];
    $("faq-list").innerHTML = fq.map(function (q) {
      return '<details><summary>' + esc(q.otazka) + '</summary><p>' + esc(q.odpoved) + '</p></details>';
    }).join("");
    section("faq", fq.length > 0);
  });

  // menu
  var burger = $("burger"), menu = $("menu");
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
  });
})();
