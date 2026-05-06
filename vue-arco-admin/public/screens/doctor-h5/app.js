(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
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
    doctorFilters: "demo.doctor.filters",
    waitlistFilter: "demo.doctor.waitlist.filter",
    globalSearchHistory: "demo.doctor.search.history",
    alertState: "demo.doctor.alerts",
    patientNotes: "demo.doctor.patientNotes",
    donorNotes: "demo.doctor.donorNotes",
  };

  // --- demo data generator (deterministic "random") ---
  function mulberry32(seedNum) {
    let a = seedNum >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20260417);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const between = (min, max, digits = 0) => {
    const v = min + rand() * (max - min);
    const m = Math.pow(10, digits);
    return Math.round(v * m) / m;
  };
  const pad2 = (n) => String(n).padStart(2, "0");

  function genPatient(i) {
    const lastNames = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜"];
    const given1 = ["明", "芳", "伟", "军", "磊", "敏", "静", "娜", "强", "洋", "杰", "丽", "超", "霞", "晨", "博", "鑫", "倩", "佳", "鹏", "婷", "浩", "雪", "宇", "飞"];
    const given2 = ["", "伟", "军", "磊", "涛", "玲", "梅", "婷", "琳", "晨", "浩", "强", "鑫", "宇", "波", "敏", "欣", "宁", "悦", "佳"];
    const name = `${pick(lastNames)}${pick(given1)}${pick(given2)}`;
    const yyyymm = `2026${pad2(1 + Math.floor(rand() * 3))}`;
    const id = `PT${yyyymm}${pad2(10 + i)}`;
    const months = 1 + Math.floor(rand() * 18);
    const stage = `术后${months}个月`;

    const creatinine = Math.round(between(70, 165, 0));
    const tac = between(4.8, 11.5, 1);
    const weight = between(52.0, 82.0, 1);

    let risk = "正常";
    if (creatinine >= 130 || tac < 5.6) risk = "异常";
    else if (creatinine >= 110 || tac < 6.6) risk = "需关注";

    const day = 28 + Math.floor(rand() * 4);
    const hh = 8 + Math.floor(rand() * 10);
    const mm = pick([0, 5, 10, 15, 20, 30, 45, 50]);
    const updatedAt = `2026-03-${pad2(day)} ${pad2(hh)}:${pad2(mm)}`;

    const vitals = {
      water: Math.round(between(1600, 2600, 0)),
      urine: Math.round(between(1200, 2200, 0)),
      stool: Math.round(between(1, 3, 0)),
      fatigue: Math.round(between(0, 6, 0)),
    };

    const diets = [
      "饮食以清淡为主，适量优质蛋白。",
      "早餐粥类，午晚餐蔬菜+瘦肉，注意少盐。",
      "近期胃口一般，分次少量进食，注意补水。",
      "控制油盐，避免腌制食品，保持规律作息。",
    ];
    const symptomPool = ["水肿", "乏力", "轻度头痛", "睡眠一般", "食欲正常", "无明显不适", "偶有手抖"];
    const symptoms = Array.from(new Set(Array.from({ length: Math.floor(rand() * 3) }, () => pick(symptomPool)))).filter((s) => s !== "无明显不适");

    const chatTemplates = [
      "这两天有点乏力，需要注意什么？",
      "复诊需要空腹吗？",
      "药物需要饭前还是饭后服用？",
      "最近睡眠一般，会影响指标吗？",
    ];

    const chat = rand() < 0.55
      ? [{ by: "患者", at: "2026-04-01 10:10", text: pick(chatTemplates) }]
      : [];

    return {
      id,
      name,
      stage,
      risk,
      updatedAt,
      metrics: { creatinine, tacrolimus: tac, weight },
      vitals,
      diet: pick(diets),
      symptoms,
      chat,
    };
  }

  const patients = Array.from({ length: 6 }, (_, i) => genPatient(i));
  const abnormalIds = patients.filter((p) => p.risk === "异常").slice(0, 2).map((p) => p.id);
  const focusIds = patients.filter((p) => p.risk === "需关注").slice(0, 2).map((p) => p.id);

  const alerts = [
    { id: "a1", level: "danger", title: "肌酐异常升高", patientId: abnormalIds[0] ?? patients[0].id, detail: "本次肌酐明显高于近期水平，建议优先关注并完善复查。", at: "2026-03-31 09:35" },
    { id: "a2", level: "warn", title: "随访记录待补全", patientId: focusIds[0] ?? patients[1].id, detail: "患者未提交本周随访记录，建议提醒或电话随访。", at: "2026-04-01 09:00" },
    { id: "a3", level: "warn", title: "血药浓度偏低风险", patientId: abnormalIds[1] ?? patients[2].id, detail: "血药浓度处于治疗窗下限附近波动，建议关注依从性与复查频率。", at: "2026-03-31 10:05" },
  ];

  const seed = {
    me: { name: "张主任", dept: "肾移植科", title: "主治医师", hospital: "北京协和医院" },
    kpis: { followups: 8, alerts: alerts.length, visits: 12 },
    patients,
    alerts,
    waitlist: [
      {
        id: "WL-2026-001",
        patientId: "PT20260241",
        patientName: "赵明",
        bloodType: "O",
        hla: "A2/B46/DR9",
        waitDays: 286,
        risk: "高危",
        nextReviewAt: "2026-05-12",
        followupCycle: "半年复查",
        externalResultStatus: "待上传",
        internalResultStatus: "已调取",
        educationStatus: "待完成",
        status: "待复查",
      },
      {
        id: "WL-2026-002",
        patientId: "PT20260309",
        patientName: "李静",
        bloodType: "A",
        hla: "A11/B40/DR4",
        waitDays: 153,
        risk: "关注",
        nextReviewAt: "2026-05-22",
        followupCycle: "半年复查",
        externalResultStatus: "已上传",
        internalResultStatus: "已调取",
        educationStatus: "已完成",
        status: "配型中",
      },
      {
        id: "WL-2026-003",
        patientId: "PT20260177",
        patientName: "王成",
        bloodType: "B",
        hla: "A24/B13/DR15",
        waitDays: 204,
        risk: "关注",
        nextReviewAt: "2026-06-02",
        followupCycle: "半年复查",
        externalResultStatus: "待上传",
        internalResultStatus: "待调取",
        educationStatus: "待完成",
        status: "待配型",
      },
      {
        id: "WL-2026-004",
        patientId: "PT20260412",
        patientName: "周倩",
        bloodType: "AB",
        hla: "A2/B58/DR8",
        waitDays: 98,
        risk: "稳定",
        nextReviewAt: "2026-06-16",
        followupCycle: "半年复查",
        externalResultStatus: "已上传",
        internalResultStatus: "已调取",
        educationStatus: "已完成",
        status: "待配型",
      },
      {
        id: "WL-2026-005",
        patientId: "PT20260208",
        patientName: "陈林",
        bloodType: "O",
        hla: "A26/B54/DR12",
        waitDays: 241,
        risk: "高危",
        nextReviewAt: "2026-05-09",
        followupCycle: "半年复查",
        externalResultStatus: "待上传",
        internalResultStatus: "待调取",
        educationStatus: "待完成",
        status: "配型中",
      },
    ],
    donors: [
      {
        id: "DONOR-2026-0042",
        name: "张某某",
        age: 32,
        sex: "男",
        type: "活体供体",
        relation: "父亲供子",
        blood: "A型",
        status: "已评估",
        match: { hla: "3/6位点匹配", cross: "阴性", pra: "2%" },
        renal: { creatinine: 76, egfr: 95, reserve: "良好" },
        timeline: [
          { at: "2026-03-20 14:00", text: "提交供体申请（父亲供子）" },
          { at: "2026-03-23 09:30", text: "完成影像学检查（双肾CT）" },
          { at: "2026-03-24 10:00", text: "完成心理评估（合格）" },
          { at: "2026-03-25 14:30", text: "完成综合评估（适宜捐赠）" },
        ],
      },
      { id: "DONOR-2026-0041", name: "李某某", age: 28, sex: "女", type: "活体供体", relation: "配偶供肾", blood: "B型", status: "评估中", match: { hla: "2/6位点匹配", cross: "待检测", pra: "—" }, renal: { creatinine: 82, egfr: 92, reserve: "良好" }, timeline: [{ at: "2026-03-26 09:10", text: "评估进行中（待补充交叉配血）" }] },
    ],
    research: {
      project: {
        code: "KTR-2026-014",
        title: "肾移植术后早期感染风险与随访依从性关联研究",
        status: "进行中",
        enrolled: 128,
        months: 6,
        completeness: "98%",
        eta: "2026-09-30",
      },
      quickFilters: ["术后<6个月", "年龄>60岁", "肌酐>120", "血药浓度<7", "有并发症"],
      papers: [
        { title: "他克莫司血药浓度与肾功能相关性分析", type: "会议摘要", at: "2026-03-15" },
        { title: "肾移植术后早期并发症风险预测模型", type: "完整论文", at: "2026-02-28" },
      ],
    },
    analytics: {
      totals: { patients: 312, followups: 15420, rate: "93.8%" },
      risk: { high: 28, mid: 47, low: 25 },
      insight: [
        "术后1-3个月是随访关键期，建议保持固定监测节奏（演示）",
        "高风险患者中随访缺失更常见，建议优先补齐关键指标（演示）",
        "多指标轻度异常叠加时，建议提前安排复诊沟通（演示）",
      ],
    },
  };

  // ---- UI primitives ----
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

  function openModal(html) {
    modalPanel.innerHTML = html;
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

  function buildDoctorSearchItems() {
    const items = [];
    seed.patients.forEach((p) => {
      items.push({
        title: `${p.name} (${p.id})`,
        desc: `${p.stage}｜${p.risk}｜肌酐 ${p.metrics.creatinine}`,
        tag: "患者",
        text: `${p.name} ${p.id} ${p.stage} ${p.risk}`,
        run: () => {
          go("patients");
          renderPatients();
          openPatientDetail(p.id);
        },
      });
    });
    seed.waitlist.forEach((w) => {
      items.push({
        title: `${w.patientName} (${w.patientId})`,
        desc: `血型 ${w.bloodType}｜${w.status}｜等待 ${w.waitDays} 天`,
        tag: "配型患者",
        text: `${w.patientName} ${w.patientId} ${w.bloodType} ${w.hla} ${w.status} ${w.risk}`,
        run: () => {
          go("waitlist");
          renderWaitlist();
          openWaitlistDetail(w.id);
        },
      });
    });
    seed.alerts.forEach((a) => {
      items.push({
        title: a.title,
        desc: `${a.patientId}｜${a.at}`,
        tag: "预警",
        text: `${a.title} ${a.patientId} ${a.detail}`,
        run: () => {
          go("alerts");
          renderAlerts();
          openAlertDetail(a.id);
        },
      });
    });
    seed.donors.forEach((d) => {
      items.push({
        title: `${d.name} (${d.id})`,
        desc: `${d.type}｜${d.status}｜血型 ${d.blood}`,
        tag: "供体",
        text: `${d.name} ${d.id} ${d.type} ${d.status} ${d.blood} ${d.match.hla}`,
        run: () => {
          go("donors");
          renderDonors();
          openDonorDetail(d.id);
        },
      });
    });
    seed.research.papers.forEach((p) => {
      items.push({
        title: p.title,
        desc: `${p.type}｜${p.at}`,
        tag: "科研",
        text: `${p.title} ${p.type}`,
        run: () => {
          go("research");
          renderResearch();
        },
      });
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
    const hits = buildDoctorSearchItems().filter((x) => x.text.toLowerCase().includes(q)).slice(0, 18);
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
        : `<div class="global-search__item"><div><div class="global-search__name">未找到结果</div><div class="global-search__desc">可尝试姓名、患者ID、血型、配型状态等关键词</div></div></div>`}
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
    const hits = buildDoctorSearchItems().filter((x) => x.text.toLowerCase().includes(q));
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
  let current = "patients";
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
  tabs.forEach((t) => t.addEventListener("click", () => t.dataset.nav && go(t.dataset.nav)));

  // ---- helpers ----
  const fmt = (n) => (Number.isFinite(n) ? String(n) : "—");
  function pill(level, text) {
    if (level === "danger") return `<span class="pill pill--danger">${text}</span>`;
    if (level === "warn") return `<span class="pill pill--warn">${text}</span>`;
    if (level === "ok") return `<span class="pill pill--ok">${text}</span>`;
    return `<span class="pill pill--soft">${text}</span>`;
  }
  function riskToPill(risk) {
    if (risk === "异常") return pill("danger", "异常");
    if (risk === "需关注") return pill("warn", "需关注");
    return pill("ok", "正常");
  }

  // ---- renderers ----
  function renderPatients() {
    const page = pages.find((p) => p.dataset.page === "patients");
    if (!page) return;

    const filters = storage.get(KEYS.doctorFilters, { group: "全部患者", q: "" });
    const groups = ["全部患者", "异常", "需关注", "术后", "术前"];

    const q = String(filters.q || "").trim();
    let list = seed.patients.slice();
    if (filters.group === "异常") list = list.filter((p) => p.risk === "异常");
    if (filters.group === "需关注") list = list.filter((p) => p.risk === "需关注");
    if (filters.group === "术后") list = list.filter((p) => p.stage.includes("术后"));
    if (filters.group === "术前") list = list.filter((p) => p.stage.includes("术前"));
    if (q) list = list.filter((p) => `${p.name}${p.id}`.includes(q));

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">今日工作概览</div>
              <div class="muted" style="margin-top:4px">随访/预警/复诊（演示）</div>
            </div>
            <span class="pill pill--soft">${seed.me.name}</span>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">待随访</div><div class="kpi__value">${seed.kpis.followups}</div></div>
            <div class="kpi kpi--warn"><div class="kpi__label">异常提醒</div><div class="kpi__value">${seed.kpis.alerts}</div></div>
            <div class="kpi"><div class="kpi__label">今日复诊</div><div class="kpi__value">${seed.kpis.visits}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div class="title">患者列表</div>
            <button class="btn btn--sm btn--ghost" data-action="open-search">搜索</button>
          </div>
          <div class="divider"></div>
          <div class="segmented">
            ${groups
              .map((g) => `<button class="seg-btn ${filters.group === g ? "active" : ""}" data-action="set-group" data-group="${g}">${g.replace("全部患者", "全部")}</button>`)
              .join("")}
          </div>
          <div style="height:10px"></div>
          <div class="stack">
            ${list
              .map(
                (p) => `
              <div class="patient-card clickable" data-action="open-patient" data-id="${p.id}">
                <div class="patient-top">
                  <div style="min-width:0">
                    <div class="patient-name">${p.name}</div>
                    <div class="patient-meta">
                      <span class="pill pill--soft">${p.stage}</span>
                      <span class="pill pill--soft">ID: ${p.id}</span>
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                    ${riskToPill(p.risk)}
                    <span class="pill pill--soft">查看详情</span>
                  </div>
                </div>
                <div class="metric-row">
                  <div class="metric">
                    <div class="metric__v">${fmt(p.metrics.creatinine)}</div>
                    <div class="metric__u">肌酐 μmol/L</div>
                  </div>
                  <div class="metric">
                    <div class="metric__v">${fmt(p.metrics.tacrolimus)}</div>
                    <div class="metric__u">血药浓度 ng/ml</div>
                  </div>
                  <div class="metric">
                    <div class="metric__v">${fmt(p.metrics.weight)}</div>
                    <div class="metric__u">体重 kg</div>
                  </div>
                </div>
                <div class="patient-foot">
                  <div class="patient-updated">最后更新：${p.updatedAt}</div>
                  <span class="pill pill--soft">点击卡片打开</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderWaitlist() {
    const page = pages.find((p) => p.dataset.page === "waitlist");
    if (!page) return;
    const st = storage.get(KEYS.waitlistFilter, { view: "all" });
    const view = String(st.view || "all");
    let list = seed.waitlist.slice();
    if (view === "high") list = list.filter((x) => x.risk === "高危");
    if (view === "review") list = list.filter((x) => x.status === "待复查");

    const high = seed.waitlist.filter((x) => x.risk === "高危").length;
    const due = seed.waitlist.filter((x) => x.status === "待复查").length;
    const externalPending = seed.waitlist.filter((x) => x.externalResultStatus === "待上传").length;
    const pendingMatch = seed.waitlist.filter((x) => x.status === "待配型").length;
    const matching = seed.waitlist.filter((x) => x.status === "配型中").length;
    const highList = seed.waitlist
      .filter((x) => x.risk === "高危")
      .sort((a, b) => b.waitDays - a.waitDays)
      .slice(0, 2);

    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">等待配型患者</div>
              <div class="muted" style="margin-top:4px">等待周期常为 1-2 年，需半年度随访复查（演示）</div>
            </div>
            <span class="pill pill--soft">总人数 ${seed.waitlist.length}</span>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">总等待人数</div><div class="kpi__value">${seed.waitlist.length}</div></div>
            <div class="kpi kpi--danger"><div class="kpi__label">高风险</div><div class="kpi__value">${high}</div></div>
            <div class="kpi kpi--warn"><div class="kpi__label">近30天待复查</div><div class="kpi__value">${due}</div></div>
          </div>
          <div class="divider"></div>
          <div class="wait-flow">
            <div class="wait-flow__step"><span class="wait-flow__idx">1</span><div><div class="wait-flow__title">入组等待</div><div class="wait-flow__desc">进入候选池</div></div></div>
            <div class="wait-flow__step"><span class="wait-flow__idx">2</span><div><div class="wait-flow__title">半年复查</div><div class="wait-flow__desc">动态评估风险</div></div></div>
            <div class="wait-flow__step"><span class="wait-flow__idx">3</span><div><div class="wait-flow__title">外院上传</div><div class="wait-flow__desc">补齐关键结果</div></div></div>
            <div class="wait-flow__step"><span class="wait-flow__idx">4</span><div><div class="wait-flow__title">本院调取</div><div class="wait-flow__desc">复核完整数据</div></div></div>
            <div class="wait-flow__step"><span class="wait-flow__idx">5</span><div><div class="wait-flow__title">进入配型</div><div class="wait-flow__desc">优先级排序</div></div></div>
          </div>
          <div style="height:10px"></div>
          <div class="wait-status-grid">
            <div class="wait-status wait-status--blue"><div class="wait-status__label">待配型</div><div class="wait-status__value">${pendingMatch}</div></div>
            <div class="wait-status wait-status--cyan"><div class="wait-status__label">配型中</div><div class="wait-status__value">${matching}</div></div>
            <div class="wait-status wait-status--amber"><div class="wait-status__label">待复查</div><div class="wait-status__value">${due}</div></div>
            <div class="wait-status wait-status--red"><div class="wait-status__label">高风险</div><div class="wait-status__value">${high}</div></div>
          </div>
          <div style="height:10px"></div>
          <div class="callout callout--info">
            <div class="callout__title">重点关注（高风险）</div>
            <div class="callout__body">
              ${highList.length
                ? highList
                    .map((x) => `${x.patientName}（${x.patientId}）· 等待 ${x.waitDays} 天 · 下次复查 ${x.nextReviewAt}`)
                    .join("<br/>")
                : "暂无高风险患者"}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div class="title">配型等待列表</div>
            <button class="btn btn--sm btn--ghost" data-action="open-search">搜索</button>
          </div>
          <div class="divider"></div>
          <div class="segmented">
            <button class="seg-btn ${view === "all" ? "active" : ""}" data-action="set-waitlist-filter" data-view="all">全部</button>
            <button class="seg-btn ${view === "high" ? "active" : ""}" data-action="set-waitlist-filter" data-view="high">高风险</button>
            <button class="seg-btn ${view === "review" ? "active" : ""}" data-action="set-waitlist-filter" data-view="review">待复查</button>
          </div>
          <div style="height:10px"></div>
          <div class="stack">
            ${list
              .map(
                (r) => `
                <div class="item wait-item wait-item--${r.risk === "高危" ? "high" : r.risk === "关注" ? "warn" : "normal"} clickable" data-action="open-waitlist" data-id="${r.id}">
                  <div class="item__main">
                    <div class="item__title">${r.patientName} <span class="muted">${r.patientId}</span></div>
                    <div class="item__desc">血型 ${r.bloodType}｜HLA ${r.hla}｜等待 ${r.waitDays} 天（约 ${Math.max(1, Math.round(r.waitDays / 365))} 年）<br/>下次复查：${r.nextReviewAt}｜外院：${r.externalResultStatus}｜状态：${r.status}</div>
                    <div class="wait-item__meta">复查周期：${r.followupCycle}｜本院调取：${r.internalResultStatus}｜宣教：${r.educationStatus}</div>
                  </div>
                  <div class="item__right">
                    ${r.risk === "高危" ? pill("danger", "高危") : r.risk === "关注" ? pill("warn", "关注") : pill("ok", "稳定")}
                    <span class="pill pill--soft">查看</span>
                  </div>
                </div>
              `,
              )
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="muted">外院待上传：${externalPending} 人；建议优先补齐后再进入配型复核流程。</div>
        </div>
      </div>
    `;
  }

  function renderAlerts() {
    const page = pages.find((p) => p.dataset.page === "alerts");
    if (!page) return;
    const st = storage.get(KEYS.alertState, {});
    const items = seed.alerts.map((a) => ({ ...a, handled: !!st[a.id]?.handled }));

    const todo = items.filter((x) => !x.handled).length;
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">预警中心</div>
              <div class="muted" style="margin-top:4px">点击条目进入处置（演示）</div>
            </div>
            <span class="pill pill--warn">${todo} 待处置</span>
          </div>
        </div>
        <div class="card">
          <div class="title">预警列表</div>
          <div class="divider"></div>
          <div class="stack">
            ${items
              .map((a) => {
                const p = a.level === "danger" ? pill("danger", "高危") : pill("warn", "需关注");
                const handled = a.handled ? pill("ok", "已处置") : pill("warn", "待处置");
                return `
                  <div class="item clickable" data-action="open-alert" data-alert="${a.id}">
                    <div class="item__main">
                      <div class="item__title">${a.title}</div>
                      <div class="item__desc">患者：${seed.patients.find((p2) => p2.id === a.patientId)?.name ?? a.patientId}｜${a.at}<br/>${a.detail}</div>
                    </div>
                    <div class="item__right">${p}${handled}</div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderDonors() {
    const page = pages.find((p) => p.dataset.page === "donors");
    if (!page) return;
    const total = seed.donors.length;
    const live = seed.donors.filter((d) => d.type.includes("活体")).length;
    const cad = total - live;
    const assessed = seed.donors.filter((d) => d.status.includes("已")).length;
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">供体管理概览</div>
              <div class="muted" style="margin-top:4px">列表/详情/评估时间线（演示）</div>
            </div>
            <span class="pill pill--soft">${seed.donors.length} 条</span>
          </div>
          <div class="divider"></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-action="donor-add">➕ 新增供体</button>
            <button class="btn btn--primary" data-action="donor-export">📤 导出报告</button>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">供体信息总览</div>
              <div class="muted" style="margin-top:4px">数量/类型/评估状态（演示）</div>
            </div>
            <span class="pill pill--soft">总数 ${total}</span>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">活体供体</div><div class="kpi__value">${live}</div></div>
            <div class="kpi"><div class="kpi__label">尸体供体</div><div class="kpi__value">${cad}</div></div>
            <div class="kpi"><div class="kpi__label">评估完成</div><div class="kpi__value">${assessed}</div></div>
          </div>
          <div class="divider"></div>
          <div class="muted">提示：演示版不包含真实审批与合规流程，仅展示信息组织方式。</div>
        </div>

        <div class="card">
          <div class="title">AI 辅助建议（演示）</div>
          <div class="muted" style="margin-top:4px">基于供体评估指标的关注点提示</div>
          <div class="divider"></div>
          <div class="callout callout--warn">
            <div class="callout__title">建议关注</div>
            <div class="callout__body">
              • 优先核对交叉配血与 HLA 配型结果的完整性<br/>
              • 关注肾功能储备（eGFR）与基础肌酐是否在合理范围<br/>
              • 若处于“评估中”，建议补齐缺失项目并生成评估清单
            </div>
          </div>
          <div class="divider"></div>
          <button class="btn btn--primary" data-action="donor-plan">🎯 生成评估建议</button>
          <div class="divider"></div>
          <div class="muted">免责声明：AI 建议仅作辅助提示，不替代临床判断与最终决策。</div>
        </div>

        <div class="card">
          <div class="title">供体列表</div>
          <div class="divider"></div>
          <div class="stack">
            ${seed.donors
              .map(
                (d) => `
                <div class="item clickable" data-action="open-donor" data-id="${d.id}">
                  <div class="item__main">
                    <div class="item__title">${d.name} <span class="muted">${d.type}｜${d.relation}</span></div>
                    <div class="item__desc">供体ID: ${d.id}｜${d.age}岁｜${d.sex}｜血型 ${d.blood}<br/>HLA: ${d.match.hla}｜交叉配血: ${d.match.cross}</div>
                  </div>
                  <div class="item__right">
                    <span class="pill pill--soft">${d.status}</span>
                    <span class="pill pill--soft">查看</span>
                  </div>
                </div>
              `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderResearch() {
    const page = pages.find((p) => p.dataset.page === "research");
    if (!page) return;
    const prj = seed.research.project;
    const cohort = seed.patients;
    const abnormal = cohort.filter((p) => p.risk === "异常").length;
    const focus = cohort.filter((p) => p.risk === "需关注").length;
    const normal = cohort.length - abnormal - focus;
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">我的科研项目</div>
              <div class="muted" style="margin-top:4px">课题：${prj.code}</div>
            </div>
            <span class="pill pill--ok">${prj.status}</span>
          </div>
          <div class="divider"></div>
          <div class="item" style="background:transparent;border:none;padding:0">
            <div class="item__main">
              <div class="item__title">${prj.title}</div>
              <div class="item__desc">数据收集中｜预计完成：${prj.eta}</div>
            </div>
            <div class="item__right"><span class="pill pill--soft">完整度 ${prj.completeness}</span></div>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">入组患者</div><div class="kpi__value">${prj.enrolled}</div></div>
            <div class="kpi"><div class="kpi__label">随访月数</div><div class="kpi__value">${prj.months}</div></div>
            <div class="kpi"><div class="kpi__label">数据完整率</div><div class="kpi__value">${prj.completeness}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="title">科研数据管理</div>
          <div class="muted" style="margin-top:4px">对标电脑端：数据导出/脱敏、专病数据库（演示）</div>
          <div class="divider"></div>

          <div class="feature-card feature-card--purple">
            <div class="feature-card__top">
              <div>
                <div class="feature-card__title">数据导出与脱敏</div>
                <div class="feature-card__desc">按项目/时间/字段范围导出，默认脱敏并留痕（演示）</div>
              </div>
              <button class="feature-card__btn" data-action="research-export">立即导出</button>
            </div>
            <ul class="bullet">
              <li>多格式：Excel / CSV（演示）</li>
              <li>默认脱敏：姓名/证件/联系方式自动处理</li>
              <li>导出记录：谁/何时/导出哪些字段</li>
            </ul>
          </div>

          <div style="height:10px"></div>

          <div class="feature-card feature-card--blue">
            <div class="feature-card__top">
              <div>
                <div class="feature-card__title">专病数据库（随访库）</div>
                <div class="feature-card__desc">统一结构化字段，支持队列筛选与数据质量检查（演示）</div>
              </div>
              <button class="feature-card__btn" data-action="research-db">进入数据库</button>
            </div>
            <ul class="bullet">
              <li>字段：手术时间/移植类型/肌酐/血药/随访完成度…</li>
              <li>支持：条件筛选、样本量预估、数据缺失提示</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">队列筛选（演示）</div>
              <div class="muted" style="margin-top:4px">使用本页模拟患者数据作为候选队列</div>
            </div>
            <span class="pill pill--soft">候选 ${cohort.length} 人</span>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi kpi--warn"><div class="kpi__label">异常</div><div class="kpi__value">${abnormal}</div></div>
            <div class="kpi"><div class="kpi__label">需关注</div><div class="kpi__value">${focus}</div></div>
            <div class="kpi"><div class="kpi__label">正常</div><div class="kpi__value">${normal}</div></div>
          </div>
          <div class="divider"></div>
          <div class="segmented">
            ${[
              "术后<6个月",
              "肌酐>120",
              "血药浓度<6.5",
              "需关注/异常",
              "随访记录缺失",
            ]
              .map((f) => `<button class="seg-btn" data-action="toggle-filter" data-filter="${f}">${f}</button>`)
              .join("")}
          </div>
          <div style="height:10px"></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-action="research-preview">样本预览</button>
            <button class="btn btn--primary" data-action="research-export">导出（脱敏）</button>
          </div>
          <div class="divider"></div>
          <div class="muted">提示：演示版不包含真实审批流；实际业务可接“导出申请→审批→脱敏→下载→审计”。</div>
        </div>

        <div class="card">
          <div class="split">
            <div>
              <div class="title">导出记录与审计（演示）</div>
              <div class="muted" style="margin-top:4px">便于伦理审查与数据安全审计</div>
            </div>
            <button class="btn btn--sm btn--ghost" data-action="research-audit">查看</button>
          </div>
          <div class="divider"></div>
          <div class="stack">
            ${[
              { who: seed.me.name, at: "2026-04-01 09:20", what: "随访库导出（CSV，字段 18 项）", st: "已脱敏" },
              { who: "科研助理-刘", at: "2026-03-29 16:05", what: "队列筛选导出（Excel，字段 12 项）", st: "已脱敏" },
              { who: "数据管理员", at: "2026-03-28 11:40", what: "项目备份导出（CSV，字段 25 项）", st: "处理中" },
            ]
              .map((r) => {
                const st = r.st === "已脱敏" ? pill("ok", r.st) : pill("warn", r.st);
                return `<div class="item"><div class="item__main"><div class="item__title">${r.what}</div><div class="item__desc">操作人：${r.who}｜时间：${r.at}</div></div><div class="item__right">${st}</div></div>`;
              })
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="muted">免责声明：科研数据处理需遵循院内合规与脱敏要求，本页仅演示展示。</div>
        </div>

        <div class="card">
          <div class="title">论文与报告</div>
          <div class="divider"></div>
          <div class="stack">
            ${seed.research.papers
              .map(
                (p) => `
                <div class="item clickable" data-action="open-paper" data-title="${encodeURIComponent(p.title)}">
                  <div class="item__main">
                    <div class="item__title">${p.title}</div>
                    <div class="item__desc">${p.type}｜${p.at}</div>
                  </div>
                  <div class="item__right"><span class="pill pill--soft">查看</span></div>
                </div>
              `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderAnalytics() {
    const page = pages.find((p) => p.dataset.page === "analytics");
    if (!page) return;
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">整体数据概览</div>
              <div class="muted" style="margin-top:4px">统计与洞察（演示）</div>
            </div>
            <span class="pill pill--soft">随访完成率 ${seed.analytics.totals.rate}</span>
          </div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">总患者数</div><div class="kpi__value">${seed.analytics.totals.patients}</div></div>
            <div class="kpi"><div class="kpi__label">随访记录</div><div class="kpi__value">${seed.analytics.totals.followups}</div></div>
            <div class="kpi"><div class="kpi__label">完成率</div><div class="kpi__value">${seed.analytics.totals.rate}</div></div>
          </div>
        </div>

        <div class="card">
          <div class="title">患者风险分层（演示）</div>
          <div class="divider"></div>
          <div class="grid-3">
            <div class="kpi"><div class="kpi__label">高风险</div><div class="kpi__value">${seed.analytics.risk.high}%</div></div>
            <div class="kpi"><div class="kpi__label">中风险</div><div class="kpi__value">${seed.analytics.risk.mid}%</div></div>
            <div class="kpi"><div class="kpi__label">低风险</div><div class="kpi__value">${seed.analytics.risk.low}%</div></div>
          </div>
          <div class="divider"></div>
          <div class="muted">说明：仅用于演示，不作为临床诊断依据。</div>
        </div>

        <div class="card">
          <div class="title">AI智能洞察（演示）</div>
          <div class="divider"></div>
          <div class="stack">
            ${seed.analytics.insight
              .map((s) => `<div class="item"><div class="item__main"><div class="item__desc">${s}</div></div><div class="item__right">${pill("warn", "提示")}</div></div>`)
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="muted">免责声明：本功能为辅助参考，不替代临床判断与诊疗决策。</div>
        </div>
      </div>
    `;
  }

  function renderMe() {
    const page = pages.find((p) => p.dataset.page === "me");
    if (!page) return;
    page.innerHTML = `
      <div class="stack">
        <div class="card">
          <div class="split">
            <div>
              <div class="title">${seed.me.name}</div>
              <div class="muted" style="margin-top:4px">${seed.me.dept}｜${seed.me.title}</div>
            </div>
            <span class="pill pill--soft">${seed.me.hospital}</span>
          </div>
          <div class="divider"></div>
          <div class="btn-row">
            <button class="btn btn--ghost" data-action="settings">设置</button>
            <button class="btn btn--primary" data-action="logout">退出</button>
          </div>
        </div>
        <div class="card">
          <div class="title">快捷入口</div>
          <div class="divider"></div>
          <div class="stack">
            <div class="item clickable" data-action="open-search"><div class="item__main"><div class="item__title">搜索患者</div><div class="item__desc">按姓名/ID 快速定位</div></div><div class="item__right"><span class="pill pill--soft">打开</span></div></div>
            <div class="item clickable" data-action="open-alerts"><div class="item__main"><div class="item__title">查看预警</div><div class="item__desc">异常指标与处置闭环</div></div><div class="item__right"><span class="pill pill--soft">打开</span></div></div>
          </div>
        </div>
      </div>
    `;
  }

  function openPatientDetail(id) {
    const p = seed.patients.find((x) => x.id === id);
    if (!p) return;
    const cr = Number(p.metrics.creatinine);
    const tac = Number(p.metrics.tacrolimus);
    const crBase = Number.isFinite(cr) ? cr : 110;
    const tBase = Number.isFinite(tac) ? tac : 7.5;
    const crTrend = [
      Math.max(60, Math.round(crBase - 10 - Math.random() * 6)),
      Math.max(60, Math.round(crBase - 6 - Math.random() * 4)),
      Math.max(60, Math.round(crBase - 2 - Math.random() * 3)),
      Math.round(crBase),
    ];
    const tacTrend = [
      Math.max(3.5, Math.round((tBase - 1.2 - Math.random() * 0.6) * 10) / 10),
      Math.max(3.5, Math.round((tBase - 0.8 - Math.random() * 0.4) * 10) / 10),
      Math.max(3.5, Math.round((tBase - 0.4 - Math.random() * 0.3) * 10) / 10),
      Math.round(tBase * 10) / 10,
    ];
    const crUp = crTrend[3] > crTrend[0] + 8;
    const tacLow = tacTrend[3] < 6.5;
    const aiTitle = crUp || tacLow ? "需关注的指标组合" : "总体趋势稳定";
    const aiBody = crUp
      ? `肌酐呈上升趋势（${crTrend[0]}→${crTrend[1]}→${crTrend[2]}→${crTrend[3]} μmol/L），建议优先复查并结合临床评估。`
      : `肌酐波动不大（${crTrend[0]}→${crTrend[3]} μmol/L），建议按计划随访并持续观察。`;
    const aiBody2 = tacLow
      ? `血药浓度当前偏低或处于下限附近（${tacTrend[3]} ng/ml），建议核对用药依从性与复查频率。`
      : `血药浓度处于治疗窗范围（${tacTrend[3]} ng/ml），继续按计划监测。`;

    openModal(`
      <div class="split">
        <div>
          <div class="title">患者详情</div>
          <div class="muted" style="margin-top:4px">${p.name}｜${p.stage}｜ID: ${p.id}</div>
        </div>
        ${riskToPill(p.risk)}
      </div>
      <div class="divider"></div>
      <div class="title">最新检查指标</div>
      <div class="divider"></div>
      <div class="stack">
        <div class="item"><div class="item__main"><div class="item__title">肌酐</div><div class="item__desc">参考值 53-106 μmol/L</div></div><div class="item__right">${p.metrics.creatinine > 106 ? pill("danger", "偏高") : pill("ok", "正常")}<span class="pill pill--soft">${p.metrics.creatinine} μmol/L</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">血药浓度</div><div class="item__desc">参考值 5-12 ng/ml</div></div><div class="item__right">${p.metrics.tacrolimus < 5 ? pill("warn", "偏低") : pill("ok", "正常")}<span class="pill pill--soft">${p.metrics.tacrolimus} ng/ml</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">体重</div><div class="item__desc">BMI（演示）</div></div><div class="item__right"><span class="pill pill--soft">${p.metrics.weight} kg</span></div></div>
      </div>
      <div class="divider"></div>
      <div class="title">AI智能分析（演示）</div>
      <div class="divider"></div>
      <div class="callout callout--info">
        <div class="callout__title">${aiTitle}</div>
        <div class="callout__body">
          ${aiBody}<br/>
          ${aiBody2}
        </div>
      </div>
      <div style="height:8px"></div>
      <div class="stack">
        <div class="item">
          <div class="item__main">
            <div class="item__title">异常要点（演示）</div>
            <div class="item__desc">
              • 肌酐趋势：${crUp ? "上升" : "平稳"}（近4次）<br/>
              • 血药浓度：${tacLow ? "偏低/下限附近" : "治疗窗范围内"}<br/>
              • 建议动作：优先复查/联系随访/补齐指标
            </div>
          </div>
          <div class="item__right">${pill(crUp || tacLow ? "warn" : "ok", crUp || tacLow ? "需关注" : "正常")}</div>
        </div>
      </div>
      <div style="height:6px"></div>
      <div class="muted">免责声明：本功能为辅助参考，不替代临床判断与诊疗决策。</div>
      <div class="divider"></div>
      <div class="title">今日健康数据</div>
      <div class="divider"></div>
      <div class="grid-3">
        <div class="kpi"><div class="kpi__label">饮水量</div><div class="kpi__value">${p.vitals.water}</div></div>
        <div class="kpi"><div class="kpi__label">尿量</div><div class="kpi__value">${p.vitals.urine}</div></div>
        <div class="kpi"><div class="kpi__label">乏力分</div><div class="kpi__value">${p.vitals.fatigue}</div></div>
      </div>
      <div style="height:10px"></div>
      <div class="muted">饮食记录：${p.diet}</div>
      <div class="divider"></div>
      <div class="title">症状记录</div>
      <div class="divider"></div>
      <div class="muted">${p.symptoms.length ? p.symptoms.join(" · ") : "暂无明显症状（演示）"}</div>
      <div class="divider"></div>
      <div class="title">快捷操作</div>
      <div style="height:10px"></div>
      <div class="btn-row">
        <button class="btn btn--ghost" data-action="adjust-med" data-id="${p.id}">调整用药</button>
        <button class="btn btn--primary" data-action="schedule" data-id="${p.id}">预约复诊</button>
      </div>
      <div style="height:10px"></div>
      <div class="btn-row">
        <button class="btn btn--ghost" data-action="followup" data-id="${p.id}">发起随访</button>
        <button class="btn btn--ghost" data-action="message" data-id="${p.id}">发送消息</button>
      </div>
      <div class="divider"></div>
      <div class="muted">提示：医生端演示中的建议/洞察仅作展示，不替代临床决策。</div>
      <div style="height:10px"></div>
      <button class="btn btn--primary" data-close="modal">关闭</button>
    `);
  }

  function openAlertDetail(id) {
    const a = seed.alerts.find((x) => x.id === id);
    if (!a) return;
    const st = storage.get(KEYS.alertState, {});
    const handled = !!st[a.id]?.handled;
    const p = seed.patients.find((x) => x.id === a.patientId);
    openModal(`
      <div class="split">
        <div>
          <div class="title">预警详情</div>
          <div class="muted" style="margin-top:4px">${a.title}｜${a.at}</div>
        </div>
        ${handled ? pill("ok", "已处置") : pill(a.level === "danger" ? "danger" : "warn", "待处置")}
      </div>
      <div class="divider"></div>
      <div class="muted">患者：${p?.name ?? a.patientId}（${a.patientId}）</div>
      <div style="height:8px"></div>
      <div class="card" style="padding:10px">
        <div class="title">异常说明（演示）</div>
        <div class="muted" style="margin-top:6px">${a.detail}</div>
      </div>
      <div class="divider"></div>
      <div class="title">处置记录</div>
      <div class="muted" style="margin-top:6px">${handled ? "已记录：已联系患者，建议复查并持续随访（演示）" : "暂无处置记录（演示）"}</div>
      <div style="height:10px"></div>
      <div class="btn-row">
        <button class="btn btn--ghost" data-action="go-patient" data-id="${a.patientId}">查看患者</button>
        <button class="btn btn--primary" data-action="mark-handled" data-alert="${a.id}">${handled ? "已处置" : "标记已处置"}</button>
      </div>
      <div class="divider"></div>
      <div class="muted">免责声明：预警仅提示关注，不替代临床判断。</div>
      <div style="height:10px"></div>
      <button class="btn btn--primary" data-close="modal">关闭</button>
    `);
  }

  function openDonorDetail(id) {
    const d = seed.donors.find((x) => x.id === id);
    if (!d) return;
    openModal(`
      <div class="split">
        <div>
          <div class="title">供体详情</div>
          <div class="muted" style="margin-top:4px">${d.name}｜${d.type}｜${d.relation}</div>
        </div>
        <span class="pill pill--soft">${d.status}</span>
      </div>
      <div class="divider"></div>
      <div class="grid-3">
        <div class="kpi"><div class="kpi__label">年龄</div><div class="kpi__value">${d.age}</div></div>
        <div class="kpi"><div class="kpi__label">性别</div><div class="kpi__value">${d.sex}</div></div>
        <div class="kpi"><div class="kpi__label">血型</div><div class="kpi__value">${d.blood}</div></div>
      </div>
      <div class="divider"></div>
      <div class="title">配型信息</div>
      <div style="height:8px"></div>
      <div class="stack">
        <div class="item"><div class="item__main"><div class="item__title">HLA配型</div><div class="item__desc">${d.match.hla}</div></div><div class="item__right">${pill("ok","已记录")}</div></div>
        <div class="item"><div class="item__main"><div class="item__title">交叉配血</div><div class="item__desc">${d.match.cross}</div></div><div class="item__right">${pill(d.match.cross === "阴性" ? "ok" : "warn","结果")}</div></div>
        <div class="item"><div class="item__main"><div class="item__title">PRA</div><div class="item__desc">${d.match.pra}</div></div><div class="item__right">${pill("soft","参考")}</div></div>
      </div>
      <div class="divider"></div>
      <div class="title">评估时间线</div>
      <div class="divider"></div>
      <div class="stack">
        ${d.timeline
          .map((x) => `<div class="item"><div class="item__main"><div class="item__title">${x.text}</div><div class="item__desc">${x.at}</div></div><div class="item__right">${pill("soft","记录")}</div></div>`)
          .join("")}
      </div>
      <div style="height:10px"></div>
      <div class="btn-row">
        <button class="btn btn--ghost" data-action="donor-eval" data-id="${d.id}">启动评估</button>
        <button class="btn btn--primary" data-action="donor-report" data-id="${d.id}">生成报告</button>
      </div>
      <div style="height:10px"></div>
      <button class="btn btn--primary" data-close="modal">关闭</button>
    `);
  }

  function openSearchSheet() {
    const filters = storage.get(KEYS.doctorFilters, { group: "全部患者", q: "" });
    openSheet(`
      <div class="title">搜索患者</div>
      <div class="muted" style="margin-top:4px">按姓名或ID检索（演示）</div>
      <div class="divider"></div>
      <div class="stack">
        <div class="field">
          <div class="muted" style="font-weight:900">关键词</div>
          <input id="q" type="text" value="${filters.q || ""}" placeholder="例如：李明 / PT2026..." />
        </div>
        <div class="btn-row">
          <button class="btn btn--ghost" data-close="sheet">取消</button>
          <button class="btn btn--primary" id="btnApplySearch">搜索</button>
        </div>
      </div>
    `);
    setTimeout(() => {
      $("#btnApplySearch")?.addEventListener("click", () => {
        const q = String($("#q")?.value ?? "").trim();
        storage.set(KEYS.doctorFilters, { ...filters, q });
        closeSheet();
        renderPatients();
        toast(q ? "已应用搜索" : "已清空搜索");
      });
    }, 0);
  }

  function openWaitlistDetail(id) {
    const r = seed.waitlist.find((x) => x.id === id);
    if (!r) return;
    openModal(`
      <div class="split">
        <div>
          <div class="title">配型患者详情</div>
          <div class="muted" style="margin-top:4px">${r.patientName}｜${r.patientId}</div>
        </div>
        ${r.risk === "高危" ? pill("danger", "高危") : r.risk === "关注" ? pill("warn", "关注") : pill("ok", "稳定")}
      </div>
      <div class="divider"></div>
      <div class="stack">
        <div class="item"><div class="item__main"><div class="item__title">血型</div><div class="item__desc">${r.bloodType}</div></div><div class="item__right"><span class="pill pill--soft">基础</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">HLA摘要</div><div class="item__desc">${r.hla}</div></div><div class="item__right"><span class="pill pill--soft">配型</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">等待时长</div><div class="item__desc">${r.waitDays} 天</div></div><div class="item__right"><span class="pill pill--soft">时长</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">复查周期</div><div class="item__desc">${r.followupCycle || "半年复查"}</div></div><div class="item__right"><span class="pill pill--soft">随访</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">下次复查</div><div class="item__desc">${r.nextReviewAt}</div></div><div class="item__right"><span class="pill pill--soft">计划</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">外院结果</div><div class="item__desc">${r.externalResultStatus || "待上传"}</div></div><div class="item__right"><span class="pill pill--soft">上传</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">本院调取</div><div class="item__desc">${r.internalResultStatus || "待调取"}</div></div><div class="item__right"><span class="pill pill--soft">数据</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">健康宣教</div><div class="item__desc">${r.educationStatus || "待完成"}</div></div><div class="item__right"><span class="pill pill--soft">教育</span></div></div>
        <div class="item"><div class="item__main"><div class="item__title">当前状态</div><div class="item__desc">${r.status}</div></div><div class="item__right"><span class="pill pill--soft">流程</span></div></div>
      </div>
      <div class="divider"></div>
      <button class="btn btn--primary" data-close="modal">关闭</button>
    `);
  }

  // ---- events ----
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const el = t.closest("[data-action]");
    if (!(el instanceof HTMLElement)) return;
    const action = el.getAttribute("data-action");
    if (!action) return;

    if (action === "open-search") {
      focusQuickSearch();
      return;
    }
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
    if (action === "set-group") {
      const group = el.getAttribute("data-group") ?? "全部患者";
      const filters = storage.get(KEYS.doctorFilters, { group: "全部患者", q: "" });
      storage.set(KEYS.doctorFilters, { ...filters, group });
      renderPatients();
      return;
    }
    if (action === "set-waitlist-filter") {
      const view = el.getAttribute("data-view") ?? "all";
      storage.set(KEYS.waitlistFilter, { view });
      renderWaitlist();
      return;
    }
    if (action === "open-patient") {
      const id = el.getAttribute("data-id");
      if (id) openPatientDetail(id);
      return;
    }
    if (action === "open-waitlist") {
      const id = el.getAttribute("data-id");
      if (id) openWaitlistDetail(id);
      return;
    }
    if (action === "open-alert") {
      const id = el.getAttribute("data-alert");
      if (id) openAlertDetail(id);
      return;
    }
    if (action === "mark-handled") {
      const id = el.getAttribute("data-alert");
      if (!id) return;
      const st = storage.get(KEYS.alertState, {});
      st[id] = { handled: true, at: new Date().toISOString() };
      storage.set(KEYS.alertState, st);
      toast("已标记处置完成");
      renderAlerts();
      openAlertDetail(id);
      return;
    }
    if (action === "go-patient") {
      const id = el.getAttribute("data-id");
      if (!id) return;
      closeModal();
      go("patients");
      renderPatients();
      openPatientDetail(id);
      return;
    }
    if (action === "open-donor") {
      const id = el.getAttribute("data-id");
      if (id) openDonorDetail(id);
      return;
    }
    if (action === "donor-add") {
      toast("新增供体（演示入口）");
      return;
    }
    if (action === "donor-export") {
      toast("导出供体报告（演示）");
      return;
    }
    if (action === "donor-eval") {
      toast("启动健康评估（演示）");
      return;
    }
    if (action === "donor-report") {
      toast("生成评估报告（演示）");
      return;
    }
    if (action === "donor-plan") {
      openModal(
        `<div class="title">评估建议（演示）</div>
         <div class="divider"></div>
         <div class="callout callout--info">
           <div class="callout__title">建议清单</div>
           <div class="callout__body">
             • 补齐交叉配血结果并复核一致性<br/>
             • 生成术前准备清单与时间线提醒<br/>
             • 将关键结论汇总为评估报告，便于沟通与归档
           </div>
         </div>
         <div class="divider"></div>
         <button class="btn btn--primary" data-close="modal">关闭</button>`
      );
      return;
    }
    if (action === "toggle-filter") {
      el.classList.toggle("active");
      toast("已切换筛选条件（演示）");
      return;
    }
    if (action === "export-data") {
      toast("数据导出与脱敏（演示入口）");
      return;
    }
    if (action === "enroll-batch") {
      toast("批量入组（演示入口）");
      return;
    }
    if (action === "research-export") {
      openModal(
        `<div class="title">数据导出（脱敏）（演示）</div>
         <div class="divider"></div>
         <div class="callout callout--info">
           <div class="callout__title">导出配置</div>
           <div class="callout__body">
             • 项目：${seed.research.project.code}<br/>
             • 范围：2026-01-01 ～ 2026-03-31（演示）<br/>
             • 字段：基础信息 + 关键指标 + 随访完成度（演示）<br/>
             • 脱敏：姓名/证件/联系方式默认脱敏
           </div>
         </div>
         <div class="divider"></div>
         <div class="btn-row">
           <button class="btn btn--ghost" data-close="modal">取消</button>
           <button class="btn btn--primary" data-action="research-export-run">确认导出</button>
         </div>`
      );
      return;
    }
    if (action === "research-export-run") {
      toast("已提交导出任务（演示）");
      closeModal();
      return;
    }
    if (action === "research-db") {
      openModal(
        `<div class="title">专病数据库（演示）</div>
         <div class="divider"></div>
         <div class="muted">这里可展示字段字典、数据质量、队列筛选与样本预估。演示版提供示例视图。</div>
         <div class="divider"></div>
         <div class="stack">
           <div class="item"><div class="item__main"><div class="item__title">字段总览</div><div class="item__desc">基础信息 8项｜随访指标 12项｜用药相关 6项（演示）</div></div><div class="item__right"><span class="pill pill--soft">查看</span></div></div>
           <div class="item"><div class="item__main"><div class="item__title">数据质量检查</div><div class="item__desc">缺失值/异常值/重复记录（演示）</div></div><div class="item__right"><span class="pill pill--soft">运行</span></div></div>
           <div class="item"><div class="item__main"><div class="item__title">队列筛选</div><div class="item__desc">条件组合筛选与样本量预估（演示）</div></div><div class="item__right"><span class="pill pill--soft">打开</span></div></div>
         </div>
         <div class="divider"></div>
         <button class="btn btn--primary" data-close="modal">关闭</button>`
      );
      return;
    }
    if (action === "research-preview") {
      const sample = seed.patients
        .slice(0, 6)
        .map((p) => `<div class="item"><div class="item__main"><div class="item__title">${p.name}（${p.id}）</div><div class="item__desc">${p.stage}｜肌酐 ${p.metrics.creatinine}｜血药 ${p.metrics.tacrolimus}｜体重 ${p.metrics.weight}</div></div><div class="item__right">${riskToPill(p.risk)}</div></div>`)
        .join("");
      openModal(
        `<div class="title">样本预览（演示）</div>
         <div class="muted" style="margin-top:6px">以下为候选样本的示例展示（仅演示，不含真实脱敏）。</div>
         <div class="divider"></div>
         <div class="stack">${sample}</div>
         <div class="divider"></div>
         <button class="btn btn--primary" data-close="modal">关闭</button>`
      );
      return;
    }
    if (action === "research-audit") {
      openModal(
        `<div class="title">导出审计（演示）</div>
         <div class="divider"></div>
         <div class="callout callout--warn">
           <div class="callout__title">审计要点</div>
           <div class="callout__body">记录导出人、时间、字段范围、用途说明与脱敏策略，便于审计追溯。</div>
         </div>
         <div class="divider"></div>
         <button class="btn btn--primary" data-close="modal">关闭</button>`
      );
      return;
    }
    if (action === "open-paper") {
      const title = decodeURIComponent(el.getAttribute("data-title") ?? "论文");
      openModal(`<div class="title">查看：${title}</div><div class="divider"></div><div class="muted">演示版仅展示入口与摘要占位。</div><div style="height:10px"></div><button class="btn btn--primary" data-close="modal">关闭</button>`);
      return;
    }
    if (action === "open-alerts") {
      go("alerts");
      renderAlerts();
      return;
    }
    if (action === "adjust-med") {
      toast("调整用药（演示入口）");
      return;
    }
    if (action === "schedule") {
      toast("预约复诊（演示入口）");
      return;
    }
    if (action === "followup") {
      toast("发起随访（演示入口）");
      return;
    }
    if (action === "message") {
      toast("发送消息（演示入口）");
      return;
    }
    if (action === "settings") {
      openModal(`<div class="title">设置（演示）</div><div class="divider"></div><div class="muted">此处可配置通知、权限、默认筛选等。</div><div style="height:10px"></div><button class="btn btn--primary" data-close="modal">关闭</button>`);
      return;
    }
    if (action === "logout") {
      openModal(`<div class="title">确认退出？</div><div class="muted" style="margin-top:6px">演示版可清空本地预警处置状态。</div><div class="divider"></div><div class="btn-row"><button class="btn btn--ghost" data-close="modal">取消</button><button class="btn btn--primary" data-action="clear-local">清空并退出</button></div>`);
      return;
    }
    if (action === "clear-local") {
      Object.values(KEYS).forEach((k) => storage.del(k));
      closeModal();
      toast("已清空本地状态（演示）");
      renderAll();
      return;
    }
  });

  function renderAll() {
    renderPatients();
    renderWaitlist();
    renderAlerts();
    renderDonors();
    renderResearch();
    renderAnalytics();
    renderMe();
  }

  initSearchDockAutoHide();
  renderAll();
})();

