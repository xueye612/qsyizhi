(() => {
  /** @param {string} sel */
  const $ = (sel, root = document) => root.querySelector(sel);
  /** @param {string} sel */
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    del(key) {
      localStorage.removeItem(key);
    },
  };

  const KEYS = {
    medicationCheckins: "demo.patient.medicationCheckins",
    dailyVitals: "demo.patient.dailyVitals",
    symptomLogs: "demo.patient.symptomLogs",
    uploadRecords: "demo.patient.uploadRecords",
    globalSearchHistory: "demo.patient.search.history",
    settings: "demo.patient.settings",
    reminderState: "demo.patient.reminders",
    deviceSync: "demo.patient.deviceSyncHistory",
  };

  const seedData = {
    patient: {
      name: "李明",
      id: "PT20260125",
      stage: "术后6个月",
      doctor: { name: "张主任", dept: "肾移植科", title: "主治医师", online: true },
      hospital: "北京协和医院",
      surgeryDate: "2025-09-01",
      risk: { level: "中风险", reason: "肌酐略高，需定期复查" },
      masked: { idCard: "110101********1234", phone: "138****5678" },
      family: [
        { name: "王芳", relation: "配偶" },
        { name: "李强", relation: "儿子" },
      ],
    },
    today: {
      date: "2026-04-01",
      reminders: [
        {
          id: "r1",
          type: "用药",
          title: "他克莫司胶囊",
          subtitle: "14:00 服用 2mg（餐前30分钟效果更佳）",
          dueAt: "2026-04-01T14:00:00",
          priority: "normal",
        },
        {
          id: "r2",
          type: "复诊",
          title: "肾移植科复查",
          subtitle: "明天 09:00 复诊，请提前30分钟到达医院",
          dueAt: "2026-04-02T09:00:00",
          priority: "normal",
        },
        {
          id: "r3",
          type: "检查",
          title: "血药浓度检查",
          subtitle: "2天后需空腹检查，请保持规律服药",
          dueAt: "2026-04-03T08:00:00",
          priority: "normal",
        },
        {
          id: "r4",
          type: "随访任务",
          title: "填写本周随访记录",
          subtitle: "包括体重、尿量、饮食记录等",
          dueAt: "2026-04-03T23:59:00",
          priority: "high",
        },
      ],
      healthOverview: {
        waterMl: 2100,
        weightKg: 68.3,
        urineMl: 1750,
        stoolTimes: 2,
      },
      aiSummary: {
        alert: "肌酐水平略有升高（128 μmol/L），建议密切监测，如有不适请及时联系医生",
        conclusion: [
          "肌酐水平较上周上升15%，需关注肾功能变化",
          "建议增加随访频率至每周1次",
          "当前用药方案基本合理，可维持现有剂量",
        ],
      },
      uploads: [
        { id: "u1", time: "2026-03-31 09:30", name: "肾功能检查报告", status: "已解析" },
        { id: "u2", time: "2026-03-28 14:15", name: "血常规检查报告", status: "分析中" },
      ],
      tasks: [
        {
          id: "t1",
          title: "填写随访记录",
          status: "待完成",
          deadline: "2026-04-03 23:59",
          desc: "请填写本周随访数据（体重、尿量、饮食记录等）",
        },
        {
          id: "t2",
          title: "上传术后检查报告",
          status: "已完成",
          deadline: "—",
          desc: "已完成术后第6个月检查报告上传",
        },
      ],
    },
    metrics: {
      latest: {
        creatinine: { value: 126, unit: "μmol/L", ref: "53-106", status: "high" },
        tacrolimus: { value: 8.5, unit: "ng/ml", ref: "5-12", status: "ok" },
        weight: { value: 68.3, unit: "kg", status: "ok" },
        bp: { value: "120/80", unit: "mmHg", status: "ok" },
        glucose: { value: 5.7, unit: "mmol/L", status: "ok" },
        hgb: { value: 130, unit: "g/L", status: "ok" },
      },
      history7: {
        creatinine: [
          { d: "3/25", v: 111 },
          { d: "3/26", v: 109 },
          { d: "3/27", v: 112 },
          { d: "3/28", v: 116 },
          { d: "3/29", v: 110 },
          { d: "3/30", v: 118 },
          { d: "3/31", v: 126 },
        ],
        tacrolimus: [
          { d: "3/25", v: 7.2 },
          { d: "3/26", v: 7.4 },
          { d: "3/27", v: 7.6 },
          { d: "3/28", v: 7.9 },
          { d: "3/29", v: 7.8 },
          { d: "3/30", v: 8.0 },
          { d: "3/31", v: 8.5 },
        ],
        weight: [
          { d: "3/25", v: 68.0 },
          { d: "3/26", v: 68.1 },
          { d: "3/27", v: 68.2 },
          { d: "3/28", v: 68.4 },
          { d: "3/29", v: 69.2 },
          { d: "3/30", v: 68.8 },
          { d: "3/31", v: 68.3 },
        ],
        glucose: [
          { d: "3/25", v: 5.6 },
          { d: "3/26", v: 5.8 },
          { d: "3/27", v: 5.7 },
          { d: "3/28", v: 5.8 },
          { d: "3/29", v: 5.9 },
          { d: "3/30", v: 5.8 },
          { d: "3/31", v: 5.7 },
        ],
      },
    },
    medication: {
      regimen: [
        { key: "tac", name: "他克莫司胶囊", type: "免疫抑制剂", dose: "2mg × 2次/日", times: ["08:00", "14:00"] },
        { key: "pred", name: "泼尼松片", type: "糖皮质激素", dose: "10mg × 1次/日", times: ["08:00"] },
        { key: "mmf", name: "吗替麦考酚酯", type: "抗代谢药", dose: "0.5g × 2次/日", times: ["08:00", "20:00"] },
      ],
      adjustments: [
        { time: "2026-03-25", title: "他克莫司剂量调整", desc: "1.5mg → 2mg bid（早/晚各2mg）" },
        { time: "2026-03-15", title: "新加药物", desc: "吗替麦考酚酯 0.5g bid（早/晚各0.5g）" },
      ],
    },
    devices: [
      {
        key: "bp",
        name: "智能血压计",
        connected: true,
        last: { value: "120/80", unit: "mmHg", time: "2026-04-01 08:30", extra: "心率 72次/分" },
        today: [
          { time: "早 8:30", value: "120/80" },
          { time: "午 12:15", value: "118/78" },
          { time: "晚 18:00", value: "125/82" },
        ],
        alerts: [
          { level: "warn", text: "今晚血压偏高：125/82 mmHg（建议明日继续监测，如持续偏高请咨询医生）", at: "2026-04-01 18:00" },
        ],
      },
      {
        key: "scale",
        name: "智能体重秤",
        connected: true,
        last: { value: "68.5", unit: "kg", time: "2026-04-01 07:00", extra: "BMI 23.1" },
        today: [{ time: "今日 07:00", value: "68.5kg" }],
        alerts: [{ level: "ok", text: "体重稳定，BMI 23.1 处于健康范围", at: "2026-04-01 07:02" }],
      },
      {
        key: "glu",
        name: "血糖仪",
        connected: true,
        last: { value: "5.8", unit: "mmol/L", time: "2026-04-01 06:45", extra: "空腹" },
        today: [
          { time: "空腹 06:45", value: "5.8" },
          { time: "餐后2h 09:30", value: "6.9" },
        ],
        alerts: [{ level: "ok", text: "血糖监测正常：空腹5.8，餐后2h 6.9", at: "2026-04-01 09:35" }],
      },
    ],
  };

  // -------- UI primitives ----------
  const toastEl = $("#toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  const modalEl = $("#modal");
  const modalPanel = $("#modalPanel");
  const sheetEl = $("#sheet");
  const sheetPanel = $("#sheetPanel");

  function openModal(html, { fullscreen = false } = {}) {
    modalPanel.innerHTML = html;
    if (fullscreen) modalPanel.classList.add("modal__panel--fullscreen");
    else modalPanel.classList.remove("modal__panel--fullscreen");
    modalEl.classList.add("modal--open");
    modalEl.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    modalEl.classList.remove("modal--open");
    modalEl.setAttribute("aria-hidden", "true");
    modalPanel.innerHTML = "";
  }
  function openSheet(html) {
    sheetPanel.innerHTML = html;
    sheetEl.classList.add("open");
    sheetEl.setAttribute("aria-hidden", "false");
  }
  function closeSheet() {
    sheetEl.classList.remove("open");
    sheetEl.setAttribute("aria-hidden", "true");
    sheetPanel.innerHTML = "";
  }

  const globalSearchEl = $("#globalSearch");
  const globalSearchInput = $("#globalSearchInput");
  const globalSearchRecent = $("#globalSearchRecent");
  const globalSearchResults = $("#globalSearchResults");
  const globalSearchMeta = $("#globalSearchMeta");
  const quickSearchInput = $("#quickSearchInput");
  const appEl = $("#app");
  const pagesEl = $("#pages");
  const searchState = { items: [] };
  let lastSearchOpenAt = 0;

  function getSearchHistory() {
    return storage.get(KEYS.globalSearchHistory, []);
  }
  function pushSearchHistory(keyword) {
    const q = String(keyword || "").trim();
    if (!q) return;
    const old = getSearchHistory().filter((x) => x !== q);
    storage.set(KEYS.globalSearchHistory, [q, ...old].slice(0, 8));
  }

  function buildPatientSearchItems() {
    const items = [];
    seedData.today.reminders.forEach((r) => {
      items.push({
        title: `${r.type} · ${r.title}`,
        desc: r.subtitle,
        tag: "提醒",
        text: `${r.type} ${r.title} ${r.subtitle}`,
        run: () => {
          go("reminders");
          renderReminders();
        },
      });
    });
    seedData.medication.regimen.forEach((m) => {
      items.push({
        title: m.name,
        desc: `${m.type}｜${m.dose}`,
        tag: "用药",
        text: `${m.name} ${m.type} ${m.dose} ${m.times.join(" ")}`,
        run: () => {
          go("medication");
          renderMedication();
        },
      });
    });
    seedData.devices.forEach((d) => {
      items.push({
        title: d.name,
        desc: `最新 ${d.last.value}${d.last.unit}｜${d.last.time}`,
        tag: "设备",
        text: `${d.name} ${d.last.value} ${d.last.unit} ${d.last.extra || ""}`,
        run: () => {
          go("devices");
          renderDevices();
        },
      });
    });
    const uploads = storage.get(KEYS.uploadRecords, seedData.today.uploads);
    uploads.forEach((u) => {
      items.push({
        title: u.name,
        desc: `${u.time}｜${u.status}`,
        tag: "报告",
        text: `${u.name} ${u.time} ${u.status}`,
        run: () => {
          go("home");
          renderHome();
        },
      });
    });
    seedData.today.tasks.forEach((t) => {
      items.push({
        title: t.title,
        desc: `${t.status}｜${t.deadline}`,
        tag: "任务",
        text: `${t.title} ${t.status} ${t.desc}`,
        run: () => {
          go("home");
          renderHome();
        },
      });
    });
    const logs = storage.get(KEYS.symptomLogs, []);
    logs.forEach((l) => {
      items.push({
        title: l.title,
        desc: `${l.time}｜${l.desc}`,
        tag: "症状",
        text: `${l.title} ${l.desc}`,
        run: () => {
          go("symptoms");
          renderSymptoms();
        },
      });
    });
    items.push({
      title: `${seedData.patient.name} (${seedData.patient.id})`,
      desc: `${seedData.patient.stage}｜${seedData.patient.risk.level}`,
      tag: "我的",
      text: `${seedData.patient.name} ${seedData.patient.id} ${seedData.patient.stage} ${seedData.patient.risk.level}`,
      run: () => {
        go("profile");
        renderProfile();
      },
    });
    return items;
  }

  function renderSearchRecent() {
    if (!globalSearchRecent) return;
    const list = getSearchHistory();
    if (!list.length) {
      globalSearchRecent.innerHTML = "";
      return;
    }
    globalSearchRecent.innerHTML = `
      <div class="global-search__title">最近搜索</div>
      ${list
        .map(
          (q) => `<button class="global-search__item clickable" data-action="search-recent" data-keyword="${encodeURIComponent(q)}"><div><div class="global-search__name">${q}</div></div><span class="global-search__tag">历史</span></button>`
        )
        .join("")}
    `;
  }

  function runGlobalSearch(keyword) {
    if (!globalSearchResults || !globalSearchMeta) return;
    const q = String(keyword || "").trim().toLowerCase();
    if (!q) {
      searchState.items = [];
      globalSearchMeta.textContent = "输入关键词开始搜索";
      globalSearchResults.innerHTML = "";
      renderSearchRecent();
      return;
    }
    const hits = buildPatientSearchItems().filter((x) => x.text.toLowerCase().includes(q)).slice(0, 18);
    searchState.items = hits;
    globalSearchMeta.textContent = `共 ${hits.length} 条结果`;
    globalSearchResults.innerHTML = `
      <div class="global-search__title">搜索结果</div>
      ${hits.length
        ? hits
            .map(
              (x, idx) => `<button class="global-search__item clickable" data-action="search-select" data-idx="${idx}"><div><div class="global-search__name">${x.title}</div><div class="global-search__desc">${x.desc}</div></div><span class="global-search__tag">${x.tag}</span></button>`
            )
            .join("")
        : `<div class="global-search__item"><div><div class="global-search__name">未找到结果</div><div class="global-search__desc">可尝试提醒名称、药名、报告类型等关键词</div></div></div>`}
    `;
  }

  function openGlobalSearch(initial = "") {
    if (!globalSearchEl || !globalSearchInput) return;
    const now = Date.now();
    if (now - lastSearchOpenAt < 280) return;
    lastSearchOpenAt = now;
    if (globalSearchEl.classList.contains("open")) {
      if (typeof initial === "string" && initial) globalSearchInput.value = initial;
      globalSearchInput.focus();
      return;
    }
    globalSearchEl.classList.add("open");
    globalSearchEl.setAttribute("aria-hidden", "false");
    globalSearchInput.value = initial;
    runGlobalSearch(initial);
    setTimeout(() => globalSearchInput.focus(), 0);
  }

  function closeGlobalSearch() {
    if (!globalSearchEl) return;
    globalSearchEl.classList.remove("open");
    globalSearchEl.setAttribute("aria-hidden", "true");
  }

  function focusQuickSearch() {
    if (!(quickSearchInput instanceof HTMLInputElement)) return;
    quickSearchInput.focus();
    quickSearchInput.select();
  }

  function submitQuickSearch(keyword) {
    const q = String(keyword || "").trim().toLowerCase();
    if (!q) {
      focusQuickSearch();
      return;
    }
    const hits = buildPatientSearchItems().filter((x) => x.text.toLowerCase().includes(q));
    if (!hits.length) {
      toast("未找到匹配结果");
      return;
    }
    pushSearchHistory(q);
    hits[0].run();
    toast(`已定位：${hits[0].title}`);
  }

  function initSearchDockAutoHide() {
    if (!appEl || !pagesEl) return;
    let lastTop = 0;
    pagesEl.addEventListener("scroll", () => {
      const top = pagesEl.scrollTop;
      if (top <= 8) {
        appEl.classList.remove("search-dock--hidden");
        lastTop = top;
        return;
      }
      if (top > lastTop + 8) appEl.classList.add("search-dock--hidden");
      else if (top < lastTop - 8) appEl.classList.remove("search-dock--hidden");
      lastTop = top;
    });
  }

  // click-to-close overlays
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const close = t.getAttribute("data-close");
    if (close === "modal") closeModal();
    if (close === "sheet") closeSheet();
    if (close === "global-search") closeGlobalSearch();
  });

  globalSearchInput?.addEventListener("input", () => runGlobalSearch(globalSearchInput.value));
  globalSearchInput?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      const q = String(globalSearchInput.value || "").trim();
      if (q) pushSearchHistory(q);
      if (searchState.items[0]) {
        closeGlobalSearch();
        searchState.items[0].run();
      }
    }
  });

  document.addEventListener("keydown", (ev) => {
    const key = String(ev.key || "").toLowerCase();
    if ((ev.ctrlKey || ev.metaKey) && key === "k") {
      ev.preventDefault();
      openGlobalSearch();
    }
    if (key === "escape") closeGlobalSearch();
  });

  quickSearchInput?.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    submitQuickSearch(quickSearchInput.value);
  });

  // routing
  let current = "home";
  const pages = $$(".page");
  const tabs = $$(".tab");
  function go(page) {
    const next = pages.find((p) => p.dataset.page === page);
    const prev = pages.find((p) => p.dataset.page === current);
    if (!next || next === prev) return;
    prev?.classList.remove("active");
    next.classList.add("active");
    tabs.forEach((t) => {
      const active = t.dataset.nav === page;
      t.classList.toggle("active", active);
      t.toggleAttribute("aria-current", active);
    });
    current = page;
  }
  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      const page = t.dataset.nav;
      if (page) go(page);
    }),
  );

  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function fmtCountdown(ms) {
    if (ms <= 0) return "已到时间";
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h <= 0) return `还有 ${m} 分钟`;
    if (m === 0) return `还有 ${h} 小时`;
    return `还有 ${h} 小时 ${m} 分钟`;
  }
  function nowForDemo() {
    // 固定“演示当前时间”：2026-04-01 12:00，便于稳定展示倒计时
    return new Date("2026-04-01T12:00:00");
  }
  function getStatusPill(status) {
    if (status === "ok") return `<span class="pill pill--ok">正常</span>`;
    if (status === "high") return `<span class="pill pill--danger">偏高</span>`;
    if (status === "low") return `<span class="pill pill--warn">偏低</span>`;
    return `<span class="pill">—</span>`;
  }

  // ---------- demo state init ----------
  const defaultSettings = {
    channels: { wechat: true, sms: true, miniapp: true },
    repeatTimes: 3,
    quietHours: true,
  };
  const settings = storage.get(KEYS.settings, defaultSettings);
  storage.set(KEYS.settings, settings);

  const reminderState = storage.get(KEYS.reminderState, {});
  storage.set(KEYS.reminderState, reminderState);

  const uploadsState = storage.get(KEYS.uploadRecords, seedData.today.uploads);
  storage.set(KEYS.uploadRecords, uploadsState);

  const medCheckins = storage.get(KEYS.medicationCheckins, {});
  storage.set(KEYS.medicationCheckins, medCheckins);

  const symptomLogs = storage.get(KEYS.symptomLogs, []);
  storage.set(KEYS.symptomLogs, symptomLogs);

  const deviceSyncHistory = storage.get(KEYS.deviceSync, []);
  storage.set(KEYS.deviceSync, deviceSyncHistory);

  // ---------- renderers ----------
  function disclaimerBlock() {
    return `
      <div class="callout callout--warn" style="margin-top:10px">
        <div class="callout__title">免责声明</div>
        <div class="callout__body">本功能为辅助参考，不替代主治医师的面诊和诊疗决策，如有疑虑请及时联系您的主管医师。</div>
      </div>
    `;
  }

  function renderHome() {
    const page = pages.find((p) => p.dataset.page === "home");
    if (!page) return;

    const [drugReminder] = seedData.today.reminders;
    const due = new Date(drugReminder.dueAt);
    const countdown = fmtCountdown(due.getTime() - nowForDemo().getTime());

    const ov = storage.get(KEYS.dailyVitals, seedData.today.healthOverview);
    const uploads = storage.get(KEYS.uploadRecords, seedData.today.uploads);

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">今日提醒</div>
              <div class="muted" style="margin-top:4px">用药与复诊提醒（演示）</div>
            </div>
            <span class="pill pill--warn" id="homeCountdown">${countdown}</span>
          </div>
          <div class="divider"></div>

          <!-- 用药提醒块：按钮必须跟随用药提醒 -->
          <div class="reminder-block reminder-block--med">
            <div class="split">
              <div style="min-width:0">
                <div class="item__title">用药提醒 · ${drugReminder.title}</div>
                <div class="item__desc">${drugReminder.subtitle}</div>
              </div>
              <div class="item__right" style="min-width:auto">
                <span class="pill pill--warn">${countdown}</span>
              </div>
            </div>
            <div class="reminder-actions-inline">
              <button class="btn btn--ghost" data-action="remind-later">稍后提醒</button>
              <button class="btn btn--primary" data-action="confirm-med">确认服药</button>
            </div>
          </div>

          <div style="height:10px"></div>

          <!-- 复诊提醒块：详情按钮跟复诊 -->
          <div class="reminder-block reminder-block--visit">
            <div class="split">
              <div style="min-width:0">
                <div class="item__title">复诊预约提醒</div>
                <div class="item__desc">${seedData.today.reminders[1].subtitle}</div>
              </div>
              <div class="item__right" style="min-width:auto">
                <span class="pill">明天</span>
                <button class="action-btn action-btn--primary" data-action="view-appointment">详情</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">今日健康概览</div>
              <div class="muted" style="margin-top:4px">快速查看今日关键数据</div>
            </div>
            <button class="btn btn--sm btn--ghost" data-action="update-vitals">更新今日数据</button>
          </div>
          <div class="divider"></div>
          <div class="grid-2">
            <div class="stat">
              <div class="stat__label">饮水量</div>
              <div class="stat__value">${ov.waterMl}ml</div>
            </div>
            <div class="stat">
              <div class="stat__label">体重</div>
              <div class="stat__value">${ov.weightKg}kg</div>
            </div>
            <div class="stat">
              <div class="stat__label">尿量</div>
              <div class="stat__value">${ov.urineMl}ml</div>
            </div>
            <div class="stat">
              <div class="stat__label">大便次数</div>
              <div class="stat__value">${ov.stoolTimes}次</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">AI智能分析报告</div>
              <div class="muted" style="margin-top:4px">指标异常提醒与趋势关注</div>
            </div>
            <button class="btn btn--sm btn--ghost" data-action="open-ai-report">查看</button>
          </div>
          <div class="divider"></div>
          <div class="callout callout--info">
            <div class="callout__title">指标异常提醒</div>
            <div class="callout__body">${seedData.today.aiSummary.alert}</div>
          </div>
          <div class="divider"></div>
          <div class="muted"><b>AI分析结论：</b> ${seedData.today.aiSummary.conclusion.map((s) => `• ${s}`).join(" ")}</div>
          ${disclaimerBlock()}
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">检查报告上传</div>
              <div class="muted" style="margin-top:4px">支持自动OCR识别与智能分析（演示）</div>
            </div>
            <button class="btn btn--sm btn--primary" data-action="upload-report">📸 上传</button>
          </div>
          <div class="divider"></div>
          <div class="list">
            ${uploads
              .map(
                (u) => `
              <div class="item clickable" data-action="view-upload" data-upload="${u.id}">
                <div class="item__main">
                  <div class="item__title">${u.name}</div>
                  <div class="item__desc">${u.time}</div>
                </div>
                <div class="item__right">
                  <span class="pill">${u.status}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">随访任务</div>
              <div class="muted" style="margin-top:4px">本周任务与截止时间</div>
            </div>
            <button class="btn btn--sm btn--ghost" data-action="go-reminders">去提醒</button>
          </div>
          <div class="divider"></div>
          <div class="list">
            ${seedData.today.tasks
              .map((t) => {
                const pill =
                  t.status === "待完成" ? `<span class="pill pill--warn">${t.status}</span>` : `<span class="pill pill--ok">${t.status}</span>`;
                return `
                  <div class="item clickable" data-action="open-task" data-task="${t.id}">
                    <div class="item__main">
                      <div class="item__title">${t.title}</div>
                      <div class="item__desc">${t.desc}<br/>截止：${t.deadline}</div>
                    </div>
                    <div class="item__right">
                      ${pill}
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">随访医生</div>
              <div class="muted" style="margin-top:4px">${seedData.patient.doctor.name} · ${seedData.patient.doctor.dept} · ${seedData.patient.doctor.title}</div>
            </div>
            <span class="pill ${seedData.patient.doctor.online ? "pill--ok" : ""}">${seedData.patient.doctor.online ? "在线" : "离线"}</span>
          </div>
          <div class="divider"></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-action="consult">💬 在线咨询</button>
            <button class="btn btn--ghost" data-action="call">📞 电话联系</button>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">历史数据记录</div>
              <div class="muted" style="margin-top:4px">最近三次关键指标</div>
            </div>
            <button class="btn btn--sm btn--ghost" data-action="go-data">查看趋势</button>
          </div>
          <div class="divider"></div>
          <div class="list">
            <div class="item">
              <div class="item__main">
                <div class="item__title">2026-03-31</div>
                <div class="item__desc">128 肌酐 · 8.2 血药浓度 · 68.5 体重</div>
              </div>
              <div class="item__right">${getStatusPill("high")}</div>
            </div>
            <div class="item">
              <div class="item__main">
                <div class="item__title">2026-03-30</div>
                <div class="item__desc">118 肌酐 · 8.0 血药浓度 · 68.8 体重</div>
              </div>
              <div class="item__right">${getStatusPill("ok")}</div>
            </div>
            <div class="item">
              <div class="item__main">
                <div class="item__title">2026-03-29</div>
                <div class="item__desc">110 肌酐 · 7.8 血药浓度 · 69.2 体重</div>
              </div>
              <div class="item__right">${getStatusPill("ok")}</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="muted"><b>数据解读：</b> • 近期肌酐呈上升趋势，建议增加复查频率 • 血药浓度在治疗窗范围内 • 体重稳定</div>
        </div>
      </div>
    `;
  }

  function renderReminders() {
    const page = pages.find((p) => p.dataset.page === "reminders");
    if (!page) return;

    const st = storage.get(KEYS.reminderState, {});
    const items = seedData.today.reminders.map((r) => {
      const s = st[r.id]?.status ?? "待处理";
      return { ...r, status: s, snoozeCount: st[r.id]?.snoozeCount ?? 0 };
    });

    const now = nowForDemo();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const startOfDayAfter = new Date(startOfTomorrow);
    startOfDayAfter.setDate(startOfDayAfter.getDate() + 1);
    const soonMs = 3 * 60 * 60 * 1000;

    const counts = items.reduce(
      (acc, r) => {
        if (r.status === "已完成") acc.done += 1;
        else if (r.status === "已逾期") acc.over += 1;
        else acc.todo += 1;
        return acc;
      },
      { todo: 0, done: 0, over: 0 },
    );

    const s = storage.get(KEYS.settings, defaultSettings);
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">今日提醒概览</div>
              <div class="muted" style="margin-top:4px">模拟提醒状态（可操作）</div>
            </div>
            <span class="pill">${counts.todo} 待处理</span>
          </div>
          <div class="divider"></div>
          <div class="grid-2">
            <div class="stat"><div class="stat__label">待处理</div><div class="stat__value">${counts.todo}</div></div>
            <div class="stat"><div class="stat__label">已完成</div><div class="stat__value">${counts.done}</div></div>
            <div class="stat"><div class="stat__label">已逾期</div><div class="stat__value">${counts.over}</div></div>
            <div class="stat"><div class="stat__label">重复提醒</div><div class="stat__value">${s.repeatTimes}次</div></div>
          </div>
        </div>

        <div class="card">
          <div class="title">提醒列表</div>
          <div class="muted" style="margin-top:4px">更醒目的彩色卡片 + 大按钮（演示）</div>
          <div class="divider"></div>
          <div class="stack">
            ${items
              .map((r) => {
                const due = new Date(r.dueAt);
                const ms = due.getTime() - now.getTime();
                const timeText = `${pad2(due.getHours())}:${pad2(due.getMinutes())}`;

                const isDone = r.status === "已完成";
                let cls = "reminder--later";
                if (isDone) cls = "reminder--done";
                else if (ms > 0 && ms <= soonMs) cls = "reminder--soon";
                else if (due >= startOfDay && due < startOfTomorrow) cls = "reminder--today";
                else if (due >= startOfTomorrow && due < startOfDayAfter) cls = "reminder--tomorrow";
                else cls = "reminder--later";

                const statusText = isDone ? "已完成" : "待处理";
                const statusCls = isDone ? "reminder--done" : cls;
                return `
                  <div class="reminder-card ${statusCls}">
                    <div class="reminder-card__top">
                      <div style="min-width:0">
                        <div class="reminder-card__title">${r.type} · ${r.title}</div>
                        <div class="reminder-card__desc">${r.subtitle}</div>
                      </div>
                      <div class="reminder-card__meta">
                        <div class="reminder-time">${r.type === "复诊" ? "明天" : timeText}</div>
                        <div class="reminder-status">${statusText}</div>
                      </div>
                    </div>
                    <div class="reminder-actions">
                      <button class="btn btn--light" data-action="snooze" data-reminder="${r.id}">稍后提醒</button>
                      <button class="btn btn--accent" data-action="done" data-reminder="${r.id}">确认完成</button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <div class="card">
          <div class="title">提醒设置</div>
          <div class="muted" style="margin-top:4px">演示：开关/选择项会持久化</div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">提醒方式</div>
            <div class="tag-row">
              <button class="tag ${s.channels.wechat ? "selected" : ""}" data-action="toggle-channel" data-channel="wechat">微信</button>
              <button class="tag ${s.channels.sms ? "selected" : ""}" data-action="toggle-channel" data-channel="sms">短信</button>
              <button class="tag ${s.channels.miniapp ? "selected" : ""}" data-action="toggle-channel" data-channel="miniapp">小程序推送</button>
            </div>
            <div class="hint">提示：仅演示开关效果，不实际推送</div>
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">重要任务重复提醒次数</div>
            <select data-action="set-repeat">
              ${[1, 2, 3, 4, 5]
                .map((n) => `<option value="${n}" ${n === s.repeatTimes ? "selected" : ""}>${n}次</option>`)
                .join("")}
            </select>
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">静音时段（22:00-07:00）</div>
            <div class="tag-row">
              <button class="tag ${s.quietHours ? "selected" : ""}" data-action="toggle-quiet">已开启</button>
              <button class="tag ${!s.quietHours ? "selected" : ""}" data-action="toggle-quiet">已关闭</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMedication() {
    const page = pages.find((p) => p.dataset.page === "medication");
    if (!page) return;

    const checkins = storage.get(KEYS.medicationCheckins, {});
    const todayKey = seedData.today.date;

    const regimenHtml = seedData.medication.regimen
      .map((m) => {
        const total = m.times.length;
        const done = checkins[todayKey]?.[m.key]?.length ?? 0;
        const pct = Math.round((done / total) * 100);
        const pill = done >= total ? `<span class="pill pill--ok">今日已完成 ${done}/${total}</span>` : `<span class="pill pill--warn">今日已完成 ${done}/${total}</span>`;
        return `
          <div class="item">
            <div class="item__main">
              <div class="item__title">${m.name}</div>
              <div class="item__desc">${m.type}｜${m.dose}<br/>今日时间点：${m.times.join("、")}</div>
              <div class="progress" style="margin-top:8px"><div style="width:${pct}%"></div></div>
            </div>
            <div class="item__right">
              ${pill}
              <button class="btn btn--sm btn--primary" data-action="med-checkin" data-med="${m.key}">打卡</button>
            </div>
          </div>
        `;
      })
      .join("");

    const adjustments = seedData.medication.adjustments
      .map(
        (a) => `
        <div class="item">
          <div class="item__main">
            <div class="item__title">${a.title}</div>
            <div class="item__desc">${a.desc}</div>
          </div>
          <div class="item__right"><span class="pill">${a.time}</span></div>
        </div>
      `,
      )
      .join("");

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">今日用药提醒</div>
              <div class="muted" style="margin-top:4px">打卡会记录在本地（演示）</div>
            </div>
            <span class="pill">${seedData.today.date}</span>
          </div>
          <div class="divider"></div>
          <div class="list">${regimenHtml}</div>
        </div>

        <div class="card">
          <div class="title">调药记录</div>
          <div class="muted" style="margin-top:4px">仅展示历史事件（演示）</div>
          <div class="divider"></div>
          <div class="list">${adjustments}</div>
        </div>

        <div class="card">
          <div class="title">副作用反馈</div>
          <div class="muted" style="margin-top:4px">提交后会在“症状”页历史中展示</div>
          <div class="divider"></div>
          <div class="tag-row" id="sideEffectTags">
            ${["手抖", "头痛", "恶心", "腹泻", "失眠", "皮疹"].map((t) => `<button class="tag" data-tag="${t}">${t}</button>`).join("")}
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">其他不适描述</div>
            <textarea id="sideEffectText" placeholder="可简单描述持续时间、程度等（演示）"></textarea>
          </div>
          <div class="divider"></div>
          <button class="btn btn--primary" data-action="submit-side-effects">提交反馈</button>
        </div>
      </div>
    `;
  }

  function renderSymptoms() {
    const page = pages.find((p) => p.dataset.page === "symptoms");
    if (!page) return;

    const logs = storage.get(KEYS.symptomLogs, []);

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="title">症状快速记录</div>
          <div class="muted" style="margin-top:4px">点击标签选中/取消（演示）</div>
          <div class="divider"></div>
          <div class="tag-row" id="symptomTags">
            ${[
              "水肿",
              "乏力",
              "食欲不振",
              "恶心呕吐",
              "头痛头晕",
              "心慌",
              "发热",
              "尿量减少",
              "药物反应",
              "失眠",
              "关节疼痛",
              "肌肉酸痛",
            ]
              .map((t) => `<button class="tag" data-tag="${t}">${t}</button>`)
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">症状详细描述</div>
            <textarea id="symptomDetail" placeholder="例如：持续2天，程度较轻...（演示）"></textarea>
          </div>
          <div class="divider"></div>
          <div class="title">症状评估问卷</div>
          <div class="muted" style="margin-top:4px">量表仅用于随访记录，不用于诊断</div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">今日整体身体感受</div>
            <select id="overallFeel">
              <option value="很差">😢 很差</option>
              <option value="较差">😕 较差</option>
              <option value="一般" selected>😐 一般</option>
              <option value="良好">🙂 良好</option>
              <option value="很好">😃 很好</option>
            </select>
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">乏力程度（0-10） <span class="pill" id="fatigueVal">3</span></div>
            <input id="fatigue" type="range" min="0" max="10" value="3" />
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">疼痛程度（0-10） <span class="pill" id="painVal">1</span></div>
            <input id="pain" type="range" min="0" max="10" value="1" />
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">食欲情况</div>
            <select id="appetite">
              <option value="很差">很差</option>
              <option value="较差">较差</option>
              <option value="正常" selected>正常</option>
              <option value="较好">较好</option>
              <option value="很好">很好</option>
            </select>
          </div>
          <div class="divider"></div>
          <div class="field">
            <div class="label">睡眠质量</div>
            <select id="sleep">
              <option value="很差">很差</option>
              <option value="较差">较差</option>
              <option value="正常" selected>正常</option>
              <option value="较好">较好</option>
              <option value="很好">很好</option>
            </select>
          </div>
          <div class="divider"></div>
          <button class="btn btn--primary" data-action="submit-symptoms">提交评估</button>
          ${disclaimerBlock()}
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">症状历史记录</div>
              <div class="muted" style="margin-top:4px">最近提交的随访自述（本地）</div>
            </div>
            <button class="btn btn--sm btn--danger" data-action="clear-symptoms">清空</button>
          </div>
          <div class="divider"></div>
          <div class="list" id="symptomHistory">
            ${
              logs.length
                ? logs
                    .slice()
                    .reverse()
                    .map(
                      (l) => `
              <div class="item">
                <div class="item__main">
                  <div class="item__title">${l.title}</div>
                  <div class="item__desc">${l.desc}</div>
                </div>
                <div class="item__right"><span class="pill">${l.time}</span></div>
              </div>
            `,
                    )
                    .join("")
                : `<div class="muted">暂无记录。你可以先提交一次症状评估。</div>`
            }
          </div>
          <div class="divider"></div>
          <div class="callout callout--info">
            <div class="callout__title">AI分析结论（演示）</div>
            <div class="callout__body">症状总体稳定，未发现明显异常；如出现持续发热、明显水肿或尿量减少等情况，建议及时联系随访医生。</div>
          </div>
          ${disclaimerBlock()}
        </div>
      </div>
    `;

    // bind range display
    const fatigue = $("#fatigue", page);
    const pain = $("#pain", page);
    const fatigueVal = $("#fatigueVal", page);
    const painVal = $("#painVal", page);
    fatigue?.addEventListener("input", () => (fatigueVal.textContent = String(fatigue.value)));
    pain?.addEventListener("input", () => (painVal.textContent = String(pain.value)));
  }

  function renderProfile() {
    const page = pages.find((p) => p.dataset.page === "profile");
    if (!page) return;

    const s = storage.get(KEYS.settings, defaultSettings);
    const famAuth = s.familyAuth ?? seedData.patient.family.map(() => true);
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">${seedData.patient.name}</div>
              <div class="muted" style="margin-top:4px">${seedData.patient.stage}｜ID: ${seedData.patient.id}｜随访医生: ${seedData.patient.doctor.name}</div>
            </div>
            <span class="pill pill--warn">${seedData.patient.risk.level}</span>
          </div>
          <div class="divider"></div>
          <div class="grid-2">
            <div class="stat"><div class="stat__label">身份证号</div><div class="stat__value" style="font-size:13px">${seedData.patient.masked.idCard}</div></div>
            <div class="stat"><div class="stat__label">手机号</div><div class="stat__value" style="font-size:13px">${seedData.patient.masked.phone}</div></div>
            <div class="stat"><div class="stat__label">手术日期</div><div class="stat__value" style="font-size:13px">${seedData.patient.surgeryDate}</div></div>
            <div class="stat"><div class="stat__label">医院</div><div class="stat__value" style="font-size:13px">${seedData.patient.hospital}</div></div>
          </div>
          <div class="divider"></div>
          <div class="callout callout--warn">
            <div class="callout__title">风险等级：${seedData.patient.risk.level}</div>
            <div class="callout__body">${seedData.patient.risk.reason}。如有不适请及时联系医生。</div>
          </div>
        </div>

        <div class="card">
          <div class="title">家庭管理</div>
          <div class="muted" style="margin-top:4px">演示：授权开关（本地保存）</div>
          <div class="divider"></div>
          <div class="list">
            ${seedData.patient.family
              .map((m, idx) => {
                const on = !!famAuth[idx];
                return `
                  <div class="item">
                    <div class="item__main">
                      <div class="item__title">${m.name}</div>
                      <div class="item__desc">${m.relation}｜已授权查看</div>
                    </div>
                    <div class="item__right">
                      <button class="tag ${on ? "selected" : ""}" data-action="toggle-family" data-index="${idx}">${on ? "已授权" : "未授权"}</button>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <div class="card">
          <div class="title">设置中心</div>
          <div class="muted" style="margin-top:4px">演示：导出/隐私/关于</div>
          <div class="divider"></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-action="export">📊 数据导出</button>
            <button class="btn btn--ghost" data-action="privacy">📄 隐私政策</button>
          </div>
          <div class="divider"></div>
          <button class="btn btn--ghost" data-action="about">ℹ️ 关于我们</button>
          <div class="divider"></div>
          <button class="btn btn--danger" data-action="logout">退出登录</button>
        </div>
      </div>
    `;
  }

  function renderDevices() {
    const page = pages.find((p) => p.dataset.page === "devices");
    if (!page) return;
    const history = storage.get(KEYS.deviceSync, []);
    const connectedCount = seedData.devices.filter((d) => d.connected).length;
    const pendingCount = seedData.devices.length - connectedCount;

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">设备连接概览</div>
              <div class="muted" style="margin-top:4px">支持蓝牙设备自动搜索与连接（演示）</div>
            </div>
            <span class="pill">${connectedCount} 已连接</span>
          </div>
          <div class="divider"></div>
          <div class="grid-2">
            <div class="stat"><div class="stat__label">已连接设备</div><div class="stat__value">${connectedCount}</div></div>
            <div class="stat"><div class="stat__label">待连接设备</div><div class="stat__value">${pendingCount}</div></div>
          </div>
          <div class="divider"></div>
          <button class="btn btn--primary" data-action="scan-devices">🔍 扫描附近设备</button>
        </div>

        ${seedData.devices
          .map((d) => {
            const connPill = d.connected ? `<span class="pill pill--ok">已连接</span>` : `<span class="pill pill--warn">未连接</span>`;
            return `
              <div class="card">
                <div class="split">
                  <div>
                    <div class="title">${d.name}</div>
                    <div class="muted" style="margin-top:4px">最新数据：${d.last.value} ${d.last.unit}${d.last.extra ? "｜" + d.last.extra : ""}</div>
                    <div class="muted">测量时间：${d.last.time}</div>
                  </div>
                  ${connPill}
                </div>
                <div class="divider"></div>
                <div class="list">
                  ${d.alerts
                    .map((a) => {
                      const p = a.level === "warn" ? "pill--warn" : a.level === "danger" ? "pill--danger" : "pill--ok";
                      return `<div class="item"><div class="item__main"><div class="item__title">异常值提醒</div><div class="item__desc">${a.text}<br/>检测时间：${a.at}</div></div><div class="item__right"><span class="pill ${p}">${a.level === "warn" ? "需关注" : "正常"}</span></div></div>`;
                    })
                    .join("")}
                </div>
                <div class="divider"></div>
                <button class="btn btn--ghost" data-action="sync-device" data-device="${d.key}">立即同步</button>
              </div>
            `;
          })
          .join("")}

        <div class="card">
          <div class="title">数据同步历史</div>
          <div class="muted" style="margin-top:4px">点击“立即同步”会新增记录（本地）</div>
          <div class="divider"></div>
          <div class="list">
            ${
              history.length
                ? history
                    .slice()
                    .reverse()
                    .map(
                      (h) => `
                <div class="item">
                  <div class="item__main">
                    <div class="item__title">${h.title}</div>
                    <div class="item__desc">${h.desc}</div>
                  </div>
                  <div class="item__right"><span class="pill">${h.time}</span></div>
                </div>
              `,
                    )
                    .join("")
                : `<div class="muted">暂无同步记录。</div>`
            }
          </div>
        </div>
      </div>
    `;
  }

  function metricCard(label, val, statusPill, sub) {
    return `
      <div class="item">
        <div class="item__main">
          <div class="item__title">${label}</div>
          <div class="item__desc">${sub ?? ""}</div>
        </div>
        <div class="item__right">
          ${statusPill}
          <div class="title" style="font-size:14px">${val}</div>
        </div>
      </div>
    `;
  }

  function renderData() {
    const page = pages.find((p) => p.dataset.page === "data");
    if (!page) return;

    const latest = seedData.metrics.latest;
    const defaultMetric = storage.get("demo.patient.data.metric", "creatinine");
    const defaultRange = storage.get("demo.patient.data.range", "7");

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">关键指标</div>
              <div class="muted" style="margin-top:4px">异常仅作提示，请联系主管医师进一步了解</div>
            </div>
            <span class="pill">最后更新：2026-03-31</span>
          </div>
          <div class="divider"></div>
          <div class="list">
            ${metricCard("肌酐", `${latest.creatinine.value} ${latest.creatinine.unit}`, getStatusPill(latest.creatinine.status), `参考值：${latest.creatinine.ref}`)}
            ${metricCard("他克莫司血药浓度", `${latest.tacrolimus.value} ${latest.tacrolimus.unit}`, getStatusPill(latest.tacrolimus.status), `参考值：${latest.tacrolimus.ref}`)}
            ${metricCard("体重", `${latest.weight.value} ${latest.weight.unit}`, getStatusPill(latest.weight.status))}
            ${metricCard("血压", `${latest.bp.value} ${latest.bp.unit}`, getStatusPill(latest.bp.status))}
            ${metricCard("血糖（空腹）", `${latest.glucose.value} ${latest.glucose.unit}`, getStatusPill(latest.glucose.status))}
            ${metricCard("血红蛋白", `${latest.hgb.value} ${latest.hgb.unit}`, getStatusPill(latest.hgb.status))}
          </div>
          ${disclaimerBlock()}
        </div>

        <div class="card">
          <div class="title">趋势查看</div>
          <div class="muted" style="margin-top:4px">点击切换指标与时间范围（演示图表）</div>
          <div class="divider"></div>
          <div class="segmented" id="metricSeg">
            ${[
              { key: "creatinine", label: "肌酐" },
              { key: "tacrolimus", label: "血药" },
              { key: "weight", label: "体重" },
              { key: "glucose", label: "血糖" },
            ]
              .map((m) => `<button class="seg-btn ${m.key === defaultMetric ? "active" : ""}" data-action="metric" data-metric="${m.key}">${m.label}</button>`)
              .join("")}
          </div>
          <div style="height:8px"></div>
          <div class="segmented" id="rangeSeg">
            ${[
              { key: "7", label: "近7天" },
              { key: "30", label: "近30天" },
            ]
              .map((r) => `<button class="seg-btn ${r.key === defaultRange ? "active" : ""}" data-action="range" data-range="${r.key}">${r.label}</button>`)
              .join("")}
          </div>
          <div class="chart-wrap">
            <canvas id="trendChart" width="320" height="160"></canvas>
            <div class="hint" id="chartHint"></div>
          </div>
        </div>
      </div>
    `;

    drawTrendChart(defaultMetric, defaultRange);
  }

  function drawTrendChart(metricKey, rangeKey) {
    const canvas = $("#trendChart");
    const hint = $("#chartHint");
    if (!(canvas instanceof HTMLCanvasElement) || !hint) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // For demo: 30d uses same 7 points (visual only)
    const series = seedData.metrics.history7[metricKey] ?? seedData.metrics.history7.creatinine;
    const points = series;
    hint.textContent = `当前：${metricKey === "creatinine" ? "肌酐" : metricKey === "tacrolimus" ? "血药浓度" : metricKey === "weight" ? "体重" : "血糖"}｜${rangeKey === "7" ? "近7天" : "近30天（演示）"}`;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // paddings
    const padL = 26;
    const padR = 14;
    const padT = 14;
    const padB = 26;

    const xs = points.map((_, i) => padL + (i * (W - padL - padR)) / Math.max(1, points.length - 1));
    const min = Math.min(...points.map((p) => p.v));
    const max = Math.max(...points.map((p) => p.v));
    const span = Math.max(1e-6, max - min);
    const ys = points.map((p) => padT + (1 - (p.v - min) / span) * (H - padT - padB));

    // grid
    ctx.strokeStyle = "rgba(17,24,39,0.10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padT + (i * (H - padT - padB)) / 3;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
    }

    // line
    ctx.strokeStyle = "rgba(102,126,234,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    xs.forEach((x, i) => {
      const y = ys[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // points
    xs.forEach((x, i) => {
      const y = ys[i];
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(102,126,234,0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // x labels (first, mid, last)
    ctx.fillStyle = "rgba(17,24,39,0.75)";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, Microsoft YaHei, sans-serif";
    const labelIdx = [0, Math.floor(points.length / 2), points.length - 1];
    labelIdx.forEach((i) => {
      const x = xs[i];
      const t = points[i].d;
      ctx.fillText(t, x - ctx.measureText(t).width / 2, H - 8);
    });

    // interaction: click to show tooltip
    canvas.onclick = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      let best = 0;
      let bestDist = Infinity;
      xs.forEach((px, i) => {
        const d = Math.abs(px - x);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      const p = points[best];
      toast(`${p.d}：${p.v}`);
    };
  }

  // ---------- event delegation ----------
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const el = t.closest("[data-action]");
    if (!(el instanceof HTMLElement)) return;
    const action = el.getAttribute("data-action");
    if (!action) return;

    if (action === "open-global-search") {
      focusQuickSearch();
      return;
    }
    if (action === "submit-quick-search") {
      submitQuickSearch(quickSearchInput?.value || "");
      return;
    }
    if (action === "search-recent") {
      const keyword = decodeURIComponent(el.getAttribute("data-keyword") || "");
      if (globalSearchInput) globalSearchInput.value = keyword;
      runGlobalSearch(keyword);
      return;
    }
    if (action === "search-select") {
      const idx = Number(el.getAttribute("data-idx"));
      const hit = searchState.items[idx];
      if (hit) {
        pushSearchHistory(globalSearchInput?.value || "");
        closeGlobalSearch();
        hit.run();
      }
      return;
    }

    if (action === "go-reminders") {
      go("reminders");
      return;
    }
    if (action === "go-data") {
      go("data");
      return;
    }
    if (action === "consult") {
      openModal(
        `<h2 class="h2">在线咨询（演示）</h2><p class="muted">这里可接入图文咨询/快捷问答。演示版仅展示入口。</p>${disclaimerBlock()}<button class="btn btn--primary" style="margin-top:10px" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      return;
    }
    if (action === "call") {
      toast("已发起电话联系（演示）");
      return;
    }
    if (action === "view-appointment") {
      openModal(
        `<h2 class="h2">复诊预约详情</h2><div class="muted">时间：2026-04-02 09:00<br/>医生：${seedData.patient.doctor.name}<br/>地点：肾移植科门诊（第3诊室）</div><div class="divider"></div><div class="callout callout--info"><div class="callout__title">复查准备清单</div><div class="callout__body">• 空腹6-8小时（血生化）<br/>• 带上最近的检查报告<br/>• 记录近3天血压、体重数据</div></div><button class="btn btn--primary" style="margin-top:10px" data-close="modal">我知道了</button>`,
        { fullscreen: true },
      );
      return;
    }

    if (action === "confirm-med") {
      const key = "demo.patient.home.confirmedMed";
      storage.set(key, { at: new Date().toISOString() });
      toast("已记录：本次用药确认完成");
      return;
    }
    if (action === "remind-later") {
      toast("已设置：稍后再次提醒（演示）");
      return;
    }
    if (action === "update-vitals") {
      const ov = storage.get(KEYS.dailyVitals, seedData.today.healthOverview);
      openSheet(`
        <h2 class="h2">更新今日数据</h2>
        <div class="muted">保存后会更新首页概览（本地）</div>
        <div class="divider"></div>
        <div class="stack">
          <div class="field"><div class="label">饮水量（ml）</div><input id="fWater" type="number" inputmode="numeric" value="${ov.waterMl}" /></div>
          <div class="field"><div class="label">体重（kg）</div><input id="fWeight" type="number" step="0.1" inputmode="decimal" value="${ov.weightKg}" /></div>
          <div class="field"><div class="label">尿量（ml）</div><input id="fUrine" type="number" inputmode="numeric" value="${ov.urineMl}" /></div>
          <div class="field"><div class="label">大便次数</div><input id="fStool" type="number" inputmode="numeric" value="${ov.stoolTimes}" /></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-close="sheet">取消</button>
            <button class="btn btn--primary" id="btnSaveVitals">保存</button>
          </div>
        </div>
      `);
      setTimeout(() => {
        $("#btnSaveVitals")?.addEventListener("click", () => {
          const water = Number($("#fWater")?.value ?? ov.waterMl);
          const weight = Number($("#fWeight")?.value ?? ov.weightKg);
          const urine = Number($("#fUrine")?.value ?? ov.urineMl);
          const stool = Number($("#fStool")?.value ?? ov.stoolTimes);
          if (!Number.isFinite(water) || water < 0) return toast("请填写正确的饮水量");
          if (!Number.isFinite(weight) || weight <= 0) return toast("请填写正确的体重");
          if (!Number.isFinite(urine) || urine < 0) return toast("请填写正确的尿量");
          if (!Number.isFinite(stool) || stool < 0) return toast("请填写正确的大便次数");
          storage.set(KEYS.dailyVitals, { waterMl: water, weightKg: weight, urineMl: urine, stoolTimes: stool });
          closeSheet();
          renderHome();
          toast("已保存今日数据");
        });
      }, 0);
      return;
    }
    if (action === "open-ai-report") {
      openModal(
        `
        <div class="badge">AI</div>
        <h2 class="h2">智能分析报告（演示）</h2>
        <div class="callout callout--info">
          <div class="callout__title">指标异常提醒</div>
          <div class="callout__body">${seedData.today.aiSummary.alert}</div>
        </div>
        <div class="divider"></div>
        <div class="title">趋势关注</div>
        <div class="muted" style="margin-top:4px">这里可展示多指标趋势与对比（演示为静态文案）。</div>
        <div class="divider"></div>
        <div class="title">AI分析结论</div>
        <div class="muted" style="margin-top:6px">${seedData.today.aiSummary.conclusion.map((s) => `• ${s}`).join("<br/>")}</div>
        ${disclaimerBlock()}
        <div class="divider"></div>
        <button class="btn btn--primary" data-close="modal">关闭</button>
      `,
        { fullscreen: true },
      );
      return;
    }

    if (action === "upload-report") {
      openSheet(`
        <h2 class="h2">上传检查报告（演示）</h2>
        <div class="muted">选择图片后将模拟：上传 → OCR解析 → AI分析中</div>
        <div class="divider"></div>
        <div class="field">
          <div class="label">报告类型</div>
          <select id="uploadType">
            <option value="肾功能检查报告">肾功能检查报告</option>
            <option value="血常规检查报告">血常规检查报告</option>
            <option value="尿常规检查报告">尿常规检查报告</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="divider"></div>
        <input id="filePick" type="file" accept="image/*" />
        <div style="height:10px"></div>
        <div class="progress"><div id="uploadBar"></div></div>
        <div class="hint" id="uploadHint">等待选择文件…</div>
        <div class="divider"></div>
        <div class="btn-row">
          <button class="btn btn--ghost" data-close="sheet">关闭</button>
          <button class="btn btn--primary" id="btnStartUpload" disabled>开始上传</button>
        </div>
      `);

      const filePick = $("#filePick");
      const btn = $("#btnStartUpload");
      const bar = $("#uploadBar");
      const hint = $("#uploadHint");
      filePick?.addEventListener("change", () => {
        btn.disabled = !(filePick instanceof HTMLInputElement) || !filePick.files || filePick.files.length === 0;
        if (!btn.disabled) hint.textContent = "文件已选择，点击开始上传。";
      });
      btn?.addEventListener("click", () => {
        if (!(bar instanceof HTMLElement) || !(hint instanceof HTMLElement)) return;
        btn.disabled = true;
        const type = String($("#uploadType")?.value ?? "检查报告");
        const now = nowForDemo();
        const time = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
        const id = `u${Math.floor(Math.random() * 1e6)}`;
        const list = storage.get(KEYS.uploadRecords, seedData.today.uploads);
        const next = [{ id, time, name: type, status: "上传中" }, ...list];
        storage.set(KEYS.uploadRecords, next);
        renderHome();

        let pct = 0;
        hint.textContent = "上传中…";
        const timer = setInterval(() => {
          pct = Math.min(100, pct + 12 + Math.random() * 10);
          bar.style.width = `${pct}%`;
          if (pct >= 100) {
            clearInterval(timer);
            hint.textContent = "OCR解析中…";
            updateUploadStatus(id, "解析中");
            setTimeout(() => {
              hint.textContent = "AI分析中…";
              updateUploadStatus(id, "分析中");
              setTimeout(() => {
                hint.textContent = "已完成";
                updateUploadStatus(id, "已解析");
                renderHome();
                toast("上传完成：已解析（演示）");
              }, 1100);
            }, 900);
          }
        }, 260);
      });
      return;
    }

    if (action === "view-upload") {
      const id = el.getAttribute("data-upload");
      const uploads = storage.get(KEYS.uploadRecords, seedData.today.uploads);
      const u = uploads.find((x) => x.id === id);
      openModal(
        `<h2 class="h2">${u?.name ?? "报告详情"}</h2><div class="muted">状态：${u?.status ?? "—"}<br/>时间：${u?.time ?? "—"}</div><div class="divider"></div><div class="callout callout--info"><div class="callout__title">解析结果（演示）</div><div class="callout__body">这里可展示 OCR 提取的关键指标与变化趋势。演示版不输出诊断性结论。</div></div>${disclaimerBlock()}<button class="btn btn--primary" style="margin-top:10px" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      return;
    }

    if (action === "open-task") {
      const id = el.getAttribute("data-task");
      const task = seedData.today.tasks.find((x) => x.id === id);
      openModal(
        `<h2 class="h2">${task?.title ?? "随访任务"}</h2><div class="muted">${task?.desc ?? ""}<br/>截止：${task?.deadline ?? "—"}</div><div class="divider"></div><button class="btn btn--ghost" data-action="fill-followup" data-task="${id}">立即填写</button><div style="height:8px"></div><button class="btn btn--primary" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      return;
    }

    if (action === "fill-followup") {
      const ov = storage.get(KEYS.dailyVitals, seedData.today.healthOverview);
      closeModal();
      openSheet(`
        <h2 class="h2">填写随访记录（演示）</h2>
        <div class="muted">提交后会写入本地记录，便于演示闭环。</div>
        <div class="divider"></div>
        <div class="stack">
          <div class="field"><div class="label">体重（kg）</div><input id="ffWeight" type="number" step="0.1" value="${ov.weightKg}" /></div>
          <div class="field"><div class="label">尿量（ml）</div><input id="ffUrine" type="number" value="${ov.urineMl}" /></div>
          <div class="field"><div class="label">饮食记录</div><textarea id="ffDiet" placeholder="例如：今日饮食清淡…">今日饮食清淡，早餐:小米粥+鸡蛋,午餐:米饭+蔬菜+鱼肉,晚餐:面条+青菜</textarea></div>
          <div class="field"><div class="label">身体感受</div><textarea id="ffFeel" placeholder="例如：状态良好…">状态良好，无不适症状</textarea></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-close="sheet">取消</button>
            <button class="btn btn--primary" id="btnFollowupSave">保存并提交</button>
          </div>
        </div>
      `);
      setTimeout(() => {
        $("#btnFollowupSave")?.addEventListener("click", () => {
          const weight = Number($("#ffWeight")?.value ?? ov.weightKg);
          const urine = Number($("#ffUrine")?.value ?? ov.urineMl);
          if (!Number.isFinite(weight) || weight <= 0) return toast("请填写正确体重");
          if (!Number.isFinite(urine) || urine < 0) return toast("请填写正确尿量");
          const logs = storage.get(KEYS.symptomLogs, []);
          logs.push({
            time: `${seedData.today.date} 14:30`,
            title: "随访记录已提交",
            desc: `体重 ${weight}kg，尿量 ${urine}ml；饮食/感受已记录（演示）`,
          });
          storage.set(KEYS.symptomLogs, logs);
          closeSheet();
          toast("随访记录已提交（演示）");
        });
      }, 0);
      return;
    }

    if (action === "done" || action === "snooze") {
      const id = el.getAttribute("data-reminder");
      if (!id) return;
      const st = storage.get(KEYS.reminderState, {});
      const cur = st[id]?.status ?? "待处理";
      if (action === "done") {
        st[id] = { ...(st[id] ?? {}), status: "已完成" };
        storage.set(KEYS.reminderState, st);
        renderReminders();
        toast("已标记完成");
        return;
      }
      if (cur === "已完成") {
        toast("该提醒已完成");
        return;
      }
      st[id] = { ...(st[id] ?? {}), status: "待处理", snoozeCount: (st[id]?.snoozeCount ?? 0) + 1 };
      storage.set(KEYS.reminderState, st);
      renderReminders();
      toast("已稍后提醒（演示）");
      return;
    }

    if (action === "toggle-channel") {
      const ch = el.getAttribute("data-channel");
      const s = storage.get(KEYS.settings, defaultSettings);
      if (ch && s.channels[ch] != null) {
        s.channels[ch] = !s.channels[ch];
        storage.set(KEYS.settings, s);
        renderReminders();
        toast("已保存提醒方式");
      }
      return;
    }
    if (action === "set-repeat") {
      const sel = t;
      if (!(sel instanceof HTMLSelectElement)) return;
      const s = storage.get(KEYS.settings, defaultSettings);
      s.repeatTimes = Number(sel.value) || 3;
      storage.set(KEYS.settings, s);
      toast("已保存重复提醒次数");
      renderReminders();
      return;
    }
    if (action === "toggle-quiet") {
      const s = storage.get(KEYS.settings, defaultSettings);
      s.quietHours = !s.quietHours;
      storage.set(KEYS.settings, s);
      renderReminders();
      toast("已保存静音设置");
      return;
    }

    if (action === "med-checkin") {
      const med = el.getAttribute("data-med");
      if (!med) return;
      const todayKey = seedData.today.date;
      const all = storage.get(KEYS.medicationCheckins, {});
      const day = all[todayKey] ?? {};
      const arr = day[med] ?? [];
      const time = new Date().toTimeString().slice(0, 5);
      if (arr.length >= (seedData.medication.regimen.find((x) => x.key === med)?.times.length ?? 1)) {
        toast("今日该药已全部完成");
        return;
      }
      arr.push(time);
      day[med] = arr;
      all[todayKey] = day;
      storage.set(KEYS.medicationCheckins, all);
      renderMedication();
      toast("已打卡");
      return;
    }

    if (action === "submit-side-effects") {
      const tagsRoot = $("#sideEffectTags");
      const chosen = $$(".tag.selected", tagsRoot).map((x) => x.getAttribute("data-tag")).filter(Boolean);
      const text = String($("#sideEffectText")?.value ?? "").trim();
      if (!chosen.length && !text) return toast("请至少选择一个症状或填写描述");
      const logs = storage.get(KEYS.symptomLogs, []);
      logs.push({
        time: `${seedData.today.date} 14:30`,
        title: "副作用反馈已提交",
        desc: `${chosen.length ? `症状：${chosen.join("、")}` : ""}${chosen.length && text ? "；" : ""}${text ? `描述：${text}` : ""}`,
      });
      storage.set(KEYS.symptomLogs, logs);
      toast("已提交反馈");
      go("symptoms");
      renderSymptoms();
      return;
    }

    if (action === "submit-symptoms") {
      const tagsRoot = $("#symptomTags");
      const chosen = $$(".tag.selected", tagsRoot).map((x) => x.getAttribute("data-tag")).filter(Boolean);
      const detail = String($("#symptomDetail")?.value ?? "").trim();
      const overall = String($("#overallFeel")?.value ?? "一般");
      const fatigue = String($("#fatigue")?.value ?? "0");
      const pain = String($("#pain")?.value ?? "0");
      const appetite = String($("#appetite")?.value ?? "正常");
      const sleep = String($("#sleep")?.value ?? "正常");

      const logs = storage.get(KEYS.symptomLogs, []);
      logs.push({
        time: `${seedData.today.date} 14:30`,
        title: chosen.length ? `症状：${chosen.join("、")}` : "症状评估提交",
        desc: `整体感受：${overall}；乏力 ${fatigue}分；疼痛 ${pain}分；食欲：${appetite}；睡眠：${sleep}${detail ? `；补充：${detail}` : ""}`,
      });
      storage.set(KEYS.symptomLogs, logs);
      toast("已提交评估");
      renderSymptoms();
      return;
    }

    if (action === "clear-symptoms") {
      storage.set(KEYS.symptomLogs, []);
      toast("已清空记录");
      renderSymptoms();
      return;
    }

    if (action === "metric" || action === "range") {
      if (action === "metric") {
        const m = t.getAttribute("data-metric") ?? "creatinine";
        storage.set("demo.patient.data.metric", m);
      } else {
        const r = t.getAttribute("data-range") ?? "7";
        storage.set("demo.patient.data.range", r);
      }
      renderData();
      return;
    }

    if (action === "sync-device") {
      const key = el.getAttribute("data-device") ?? "bp";
      toast("同步中…");
      setTimeout(() => {
        const hist = storage.get(KEYS.deviceSync, []);
        hist.push({
          time: `${seedData.today.date} ${new Date().toTimeString().slice(0, 5)}`,
          title: "设备同步成功",
          desc: `设备：${seedData.devices.find((d) => d.key === key)?.name ?? key}（演示）`,
        });
        storage.set(KEYS.deviceSync, hist);
        renderDevices();
        toast("同步成功");
      }, 1100);
      return;
    }

    if (action === "scan-devices") {
      openModal(
        `
        <div class="badge">蓝牙</div>
        <h2 class="h2">扫描附近设备（演示）</h2>
        <div class="muted">正在扫描…</div>
        <div class="divider"></div>
        <div class="list">
          <div class="item"><div class="item__main"><div class="item__title">智能血压计</div><div class="item__desc">信号：强</div></div><div class="item__right"><button class="btn btn--sm btn--primary" data-action="pair">连接</button></div></div>
          <div class="item"><div class="item__main"><div class="item__title">智能体重秤</div><div class="item__desc">信号：中</div></div><div class="item__right"><button class="btn btn--sm btn--primary" data-action="pair">连接</button></div></div>
          <div class="item"><div class="item__main"><div class="item__title">血糖仪</div><div class="item__desc">信号：中</div></div><div class="item__right"><button class="btn btn--sm btn--primary" data-action="pair">连接</button></div></div>
        </div>
        <div class="divider"></div>
        <button class="btn btn--primary" data-close="modal">完成</button>
      `,
        { fullscreen: true },
      );
      return;
    }

    if (action === "pair") {
      toast("已连接设备（演示）");
      return;
    }

    if (action === "toggle-family") {
      const idx = Number(el.getAttribute("data-index"));
      const s = storage.get(KEYS.settings, defaultSettings);
      const famAuth = s.familyAuth ?? seedData.patient.family.map(() => true);
      famAuth[idx] = !famAuth[idx];
      s.familyAuth = famAuth;
      storage.set(KEYS.settings, s);
      renderProfile();
      toast("已保存授权");
      return;
    }

    if (action === "privacy") {
      openModal(
        `<h2 class="h2">隐私政策（演示）</h2><div class="muted">此处展示隐私条款摘要与完整内容入口（演示）。</div><div class="divider"></div><button class="btn btn--primary" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      return;
    }
    if (action === "about") {
      openModal(
        `<h2 class="h2">关于我们</h2><div class="muted">版本号：1.0.0（演示）</div><div class="divider"></div><button class="btn btn--primary" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      return;
    }
    if (action === "export") {
      openModal(
        `<h2 class="h2">数据导出（演示）</h2><div class="muted" id="exportHint">正在生成导出文件…</div><div style="height:10px"></div><div class="progress"><div id="exportBar" style="width:8%"></div></div><div class="divider"></div><button class="btn btn--ghost" data-close="modal">关闭</button>`,
        { fullscreen: true },
      );
      const bar = $("#exportBar");
      const hint = $("#exportHint");
      let pct = 8;
      const timer = setInterval(() => {
        pct = Math.min(100, pct + 18);
        if (bar instanceof HTMLElement) bar.style.width = `${pct}%`;
        if (pct >= 100) {
          clearInterval(timer);
          if (hint instanceof HTMLElement) hint.textContent = `已生成（演示）：EX-${Math.floor(Math.random() * 1e6).toString().padStart(6, "0")}`;
          toast("导出已生成（演示）");
        }
      }, 450);
      return;
    }
    if (action === "logout") {
      openModal(
        `<h2 class="h2">确认退出？</h2><div class="muted">演示版可选择清空本地记录。</div><div class="divider"></div><div class="btn-row"><button class="btn btn--ghost" data-close="modal">取消</button><button class="btn btn--danger" id="btnClearAndExit">清空并退出</button></div>`,
        { fullscreen: false },
      );
      setTimeout(() => {
        $("#btnClearAndExit")?.addEventListener("click", () => {
          Object.values(KEYS).forEach((k) => storage.del(k));
          storage.del("demo.patient.data.metric");
          storage.del("demo.patient.data.range");
          closeModal();
          toast("已清空本地数据（演示）");
          renderAll();
        });
      }, 0);
      return;
    }
  });

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (!t.classList.contains("tag")) return;
    // Toggle tags in symptom / side effect areas
    const parentId = t.parentElement?.id;
    if (parentId === "symptomTags" || parentId === "sideEffectTags") {
      t.classList.toggle("selected");
    }
  });

  function updateUploadStatus(id, status) {
    const list = storage.get(KEYS.uploadRecords, seedData.today.uploads);
    const next = list.map((u) => (u.id === id ? { ...u, status } : u));
    storage.set(KEYS.uploadRecords, next);
  }

  function renderAll() {
    renderHome();
    renderReminders();
    renderMedication();
    renderSymptoms();
    renderData();
    renderDevices();
    renderProfile();
  }

  // init
  initSearchDockAutoHide();
  renderAll();
})();

