(() => {
  const D = JSON.parse(document.getElementById('data').textContent);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const word = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cases = D.cases;
  const M = D.messengers;

  // ---------- ссылки на мессенджеры ----------
  const ico = {
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 3c.9-.3 1.7.2 1.4 1.3z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.1c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-3.2-1.1-5.3-4.3-5.4-4.5-.2-.2-1.3-1.7-1.3-3.3s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 .9c.3.2.5.2.6.4.1.1.1.7-.1 1.4z"/></svg>',
    max: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5A9.5 9.5 0 0 0 2.5 12c0 1.9.6 3.7 1.5 5.2L3 21l3.9-1a9.5 9.5 0 1 0 5.1-17.5zm-4 6.2h2l2 3.4 2-3.4h2v6.6h-1.8v-3.9l-1.8 3h-.8l-1.8-3v3.9H8z"/></svg>'
  };
  const names = { telegram: 'Telegram', whatsapp: 'WhatsApp', max: 'MAX' };
  const hrefs = (k, text) => {
    const t = encodeURIComponent(text);
    if (k === 'telegram') return `https://t.me/${String(M.telegram).replace(/^@/, '')}?text=${t}`;
    if (k === 'whatsapp') return `https://wa.me/${String(M.whatsapp).replace(/\D/g, '')}?text=${t}`;
    return M.max;
  };
  const avail = ['telegram', 'whatsapp', 'max'].filter((k) => M[k]);
  const toast = (t) => { const el = $('toast'); el.textContent = t; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); };
  const btnHtml = (text, pick) => (pick ? [pick] : avail).map((k, i) =>
    `<a class="btn ${i === 0 && !pick ? 'btn-main' : 'btn-ghost'}" href="${esc(hrefs(k, text))}" target="_blank" rel="noopener" data-msg="${esc(text)}" ${k === 'max' ? 'data-copy' : ''}>${ico[k]}${names[k]}</a>`).join('');
  const fillCta = (text) => document.querySelectorAll('[data-cta]').forEach((el) => { el.innerHTML = btnHtml(text); });
  const DEFAULT = D.message;
  fillCta(DEFAULT);
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-copy]'); if (!a) return;
    try { navigator.clipboard.writeText(a.dataset.msg || DEFAULT); toast('Текст сообщения скопирован – вставьте его в чат MAX'); } catch (_) {}
  });

  // окно «Обсудить проект»
  const chat = $('chat');
  const openChat = (text, note) => {
    const t = text || DEFAULT;
    chat.querySelector('[data-cta]').innerHTML = btnHtml(t);
    $('chatP').textContent = note || 'Выберите мессенджер – текст сообщения уже набран.';
    if (chat.showModal) chat.showModal(); else chat.setAttribute('open', '');
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-chat]')) return openChat();
    const p = e.target.closest('[data-plan]');
    if (p) return openChat(`Здравствуйте! Интересует «${p.dataset.plan}». Расскажите, как начать?`, `Тариф: ${p.dataset.plan}. Выберите мессенджер – текст уже набран.`);
    const w = e.target.closest('[data-want]');
    if (w) return openChat(`Здравствуйте! Мне понравился сайт «${w.dataset.want}» на вашей витрине. Хочу похожий для своего бизнеса – расскажите, как начать?`, `Хочу похожий на «${w.dataset.want}». Выберите мессенджер – текст уже набран.`);
  });
  $('chatX').addEventListener('click', () => chat.close ? chat.close() : chat.removeAttribute('open'));
  chat.addEventListener('click', (e) => { if (e.target === chat) chat.close(); });

  // ---------- подвал ----------
  const L = D.legal || {};
  $('foot').textContent = `© ${new Date().getFullYear()} ${L.fio || D.name}${L.status ? ', ' + L.status : ''}${L.inn ? ', ИНН ' + L.inn : ''}`;
  if (L.email) $('footMail').innerHTML = `<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`;

  // ---------- цифры, лента ниш ----------
  const groups = D.niches.filter((n) => cases.some((c) => c.group === n.key));
  $('facts').innerHTML = `<span><b>${cases.length}</b>${word(cases.length, 'сайт', 'сайта', 'сайтов')} в работах</span><span><b>${groups.length}</b>${word(groups.length, 'ниша', 'ниши', 'ниш')}</span><span><b>0 ₽</b>за демо до разговора о цене</span>`;
  const tk = groups.map((n) => n.title);
  $('ticker').innerHTML = [...tk, ...tk].map((t, i) => `<span${i >= tk.length ? ' aria-hidden="true"' : ''}>${esc(t)}</span>`).join('');
  $('worksNote').innerHTML = 'Проект для знакомой – сайт, который я сделала для реального человека, и он уже работает. Демо-проект – сайт, собранный на пробу под конкретный бизнес: <span class="hl">откройте любой и посмотрите вживую</span>.';

  // ---------- макеты в первом экране ----------
  const fit = (img) => {
    const go = () => { const box = img.parentElement; img.style.setProperty('--shift', Math.max(0, img.getBoundingClientRect().height - box.clientHeight) + 'px'); };
    if (img.complete && img.naturalHeight) go(); else img.addEventListener('load', go, { once: true });
  };
  const lap = ['egoist-arkhangelsk', 'nail-wizard', 'prostor-volgograd', 'viktoria-tury'].map((s) => cases.find((c) => (c.desktop || '').includes('-' + s + '-'))).filter(Boolean);
  $('laptopScr').innerHTML = lap.map((c, i) => `<img src="${esc(c.desktop)}" alt="" class="${i === 0 ? 'on' : ''}">`).join('');
  if (lap.length > 1 && !reduce) { let i = 0; const imgs = $('laptopScr').children; setInterval(() => { imgs[i].classList.remove('on'); i = (i + 1) % imgs.length; imgs[i].classList.add('on'); }, 3800); }
  const hp = cases.find((c) => (c.mobile || '').includes('-pomor-')) || cases.find((c) => c.mobile);
  if (hp) { const sc = $('heroPhone').querySelector('.screen'); sc.innerHTML = `<img src="${esc(hp.mobile)}" alt="">`; fit(sc.firstChild); }

  // ---------- работы ----------
  const taskBy = {
    barber: ['Показать услуги и цены и принять запись без звонков', 'Прайс, мастера, отзывы и кнопка записи в мессенджер'],
    nogti: ['Показать работы и цены, чтобы клиент выбрал мастера и записался', 'Галерея работ, прайс и запись в один клик'],
    cvety: ['Показать букеты и принять заказ с доставкой', 'Каталог букетов, условия доставки, заказ в мессенджер'],
    stroy: ['Вызвать доверие и собирать заявки на расчёт', 'Проекты, этапы работ, расчёт стоимости и заявка в мессенджер'],
    avto: ['Показать услуги и цены и принять запись на удобное время', 'Прайс, запись и контакты'],
    klining: ['Объяснить, что входит в уборку, и принять заявку', 'Состав услуг, расчёт и заявка в мессенджер'],
    stom: ['Вызвать доверие к клинике и записать на консультацию', 'Направления, ответы на вопросы пациентов, запись в мессенджер'],
    tury: ['Подобрать тур и принять заявку', 'Направления, подбор тура из вашего города, заявка в мессенджер']
  };
  const FIRST = 9;
  let filter = null, view = 'd', expanded = false;
  const phoneHtml = (c) => `<div class="phone"><div class="screen"><img src="${esc(c.mobile)}" alt="Сайт ${esc(c.title)} на телефоне" loading="lazy" decoding="async"></div></div>`;
  const caseHtml = (c) => {
    const real = c.kind === 'real' || c.kind === 'friend';
    const [task0, did0] = taskBy[c.group] || ['', ''];
    const task = c.task || task0, did = c.did || did0;
    const res = c.result || (real ? 'Сайт опубликован и работает.' : 'Готовое демо: владельцу можно показать и доработать под себя.');
    const label = c.kind === 'friend' ? 'Проект для знакомой' : c.kind === 'real' ? 'Реальный заказ' : 'Демо-проект';
    const shot = view === 'm' && c.mobile
      ? `<div class="shot m">${phoneHtml(c)}</div>`
      : `<div class="shot d"><img src="${esc(c.desktop)}" alt="Сайт ${esc(c.title)}" loading="lazy" decoding="async"></div>`;
    return `<article class="case">${shot}<div class="cbody">
      <div class="meta"><span class="badge ${real ? 'real' : ''}">${label}</span>${esc([c.niche, c.city].filter(Boolean).join(' · '))}</div>
      <h3>${esc(c.title)}</h3>
      <dl><div><dt>Задача</dt><dd>${esc(task)}</dd></div><div><dt>Что реализовано</dt><dd>${esc(did)}</dd></div><div><dt>Результат</dt><dd>${esc(res)}</dd></div></dl>
      ${c.quote ? `<blockquote class="hl" style="margin:0;font-size:15px">«${esc(c.quote)}»<br><small style="font-family:var(--body);font-style:normal;color:var(--ink-3)">${esc(c.quoteAuthor || '')}</small></blockquote>` : ''}
      <div class="actions"><a class="btn btn-main btn-sm" href="${esc(c.url)}" target="_blank" rel="noopener">Открыть сайт</a><button class="btn btn-ghost btn-sm" type="button" data-want="${esc(c.title)}">Хочу похожий</button></div>
    </div></article>`;
  };
  const renderCases = () => {
    const list = filter ? cases.filter((c) => c.group === filter) : cases;
    const shown = filter || expanded ? list : list.slice(0, FIRST);
    $('cases').innerHTML = shown.map(caseHtml).join('');
    const rest = list.length - shown.length;
    $('moreWrap').hidden = rest <= 0;
    $('moreBtn').textContent = `Показать ещё ${rest} ${word(rest, 'работу', 'работы', 'работ')}`;
    $('cases').querySelectorAll('.phone img').forEach(fit);
    if (!reduce) $('cases').querySelectorAll('.phone img').forEach((im) => { im.style.animation = 'tape 18s ease-in-out infinite alternate'; });
  };
  $('filters').innerHTML = [`<button class="chip" type="button" aria-pressed="true" data-f="">Все ${cases.length}</button>`]
    .concat(groups.map((n) => `<button class="chip" type="button" aria-pressed="false" data-f="${esc(n.key)}">${esc(n.title.split(' и ')[0])} ${cases.filter((c) => c.group === n.key).length}</button>`)).join('');
  $('filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-f]'); if (!b) return;
    filter = b.dataset.f || null;
    $('filters').querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderCases();
  });
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view;
    document.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderCases();
  }));
  $('moreBtn').addEventListener('click', () => { expanded = true; renderCases(); });
  renderCases();

  // ---------- подбор за минуту ----------
  const goals = [
    ['rec', 'Чтобы записывались', 'запись клиентов'],
    ['ord', 'Чтобы оставляли заявки', 'заявки на услуги'],
    ['show', 'Показать работы и цены', 'витрина работ и цен'],
    ['card', 'Просто быть в интернете', 'сайт-визитка']
  ];
  const st = { niche: null, goal: null, msg: null };
  const chips = (id, items, key) => {
    $(id).innerHTML = items.map(([v, label]) => `<button class="chip" type="button" aria-pressed="false" data-v="${esc(v)}">${esc(label)}</button>`).join('');
    $(id).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      st[key] = b.dataset.v;
      $(id).querySelectorAll('.chip').forEach((x) => x.setAttribute('aria-pressed', x === b));
      drawResult();
    });
  };
  chips('qNiche', groups.map((n) => [n.key, n.title]).concat([['other', 'Другое']]), 'niche');
  chips('qGoal', goals.map(([v, l]) => [v, l]), 'goal');
  chips('qMsg', avail.map((k) => [k, names[k]]), 'msg');
  const drawResult = () => {
    const el = $('result');
    if (!st.niche || !st.goal) {
      el.innerHTML = '<h3>Ваш формат появится здесь</h3><p>Выберите нишу и главную задачу сайта – я подскажу формат, цену и срок.</p>';
      return;
    }
    const n = st.niche === 'other' ? 'вашей сферы' : (D.niches.find((x) => x.key === st.niche) || {}).title;
    const g = goals.find((x) => x[0] === st.goal);
    const near = cases.filter((c) => c.group === st.niche).length;
    const text = `Здравствуйте! Я занимаюсь: ${st.niche === 'other' ? 'другой сферой' : n}. Сайт нужен для: ${g[2]}. Расскажите, как начать?`;
    el.innerHTML = `<h3>Вам подойдёт сайт-одностраничник</h3>
      <p>Одна понятная страница под вашу сферу${n === 'вашей сферы' ? '' : ' (' + esc(n.toLowerCase()) + ')'}: главная задача – ${esc(g[2])}. Кнопка ведёт в ваш мессенджер с готовым сообщением.</p>
      ${near ? `<p>В моих работах ${near} ${word(near, 'сайт', 'сайта', 'сайтов')} такой ниши – можно посмотреть.</p>` : ''}
      <div class="price">от 10 000 ₽</div><p>3-5 дней · 2 круга правок</p>
      <div class="cta" style="justify-content:flex-start;margin-top:4px">${btnHtml(text, st.msg).replace('btn-ghost', 'btn-main')}</div>
      ${st.msg ? '' : '<p style="font-size:13px">Выберите мессенджер в вопросе 3 – или напишите в любой из них.</p>'}`;
  };
  drawResult();

  // ---------- появление при прокрутке ----------
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
  document.querySelectorAll('.rv').forEach((el) => io ? io.observe(el) : el.classList.add('in'));
})();
