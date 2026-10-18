# Denttar – nasazení přes GitHub Pages a správa aktualit

## Jak to funguje
Web je statický. Obsah je v `data/aktuality.json` a `data/web.json`. Sestřička je upravuje přes formulář v **Pages CMS** (https://pagescms.org), bez kódu. Každá úprava se uloží do GitHubu a GitHub Pages web do ~1 minuty sám aktualizuje.

## 1. Repozitář na GitHubu (jednorázově)
1. Na github.com si vytvořte účet (pokud ho nemáte) a klikněte **New repository**. Název např. `denttar-web`, nechte **Public** (zdarma GitHub Pages u veřejných repozitářů) a nic nezaškrtávejte.
2. Na stránce nového repozitáře zvolte **uploading an existing file** a přetáhněte do okna VŠECHNY soubory a složky z rozbaleného archivu (včetně skrytých `.pages.yml`, `.nojekyll` a složky `data`). Potvrďte **Commit changes**.

## 2. Zapnutí GitHub Pages
**Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, složka `/ (root)` → Save.**
Za minutu se web objeví na `https://VASE-JMENO.github.io/denttar-web/`.

## 3. Doména denttar.cz
1. V **Settings → Pages → Custom domain** zadejte `denttar.cz` a uložte (soubor `CNAME` už v repozitáři je).
2. U registrátora domény nastavte DNS záznamy:
   - čtyři záznamy **A** pro `@` na: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - záznam **CNAME** pro `www` na `VASE-JMENO.github.io`
3. Po ověření DNS (až několik hodin) zaškrtněte **Enforce HTTPS**.
Aktuální IP adresy si můžete ověřit v dokumentaci GitHub Pages.

## 4. Správa aktualit (sestřička)
1. Sestřička si založí GitHub účet; vy ji v repozitáři přidáte: **Settings → Collaborators → Add people**.
2. Na https://app.pagescms.org se přihlásí přes GitHub a vybere repozitář.
3. **Aktuality → přidat položku →** datum, nadpis, text **→ Save**.

## Bezpečnost (po předchozím incidentu)
- Změňte hesla u registrátora, e-mailu i starého hostingu a zapněte dvoufázové ověření.
- Starý hosting a starý web zrušte, ať ho nikdo nezneužije.
- Dvoufázové ověření zapněte i na GitHub účtech.
