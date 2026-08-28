const { useEffect, useMemo, useRef, useState } = React;
const DATA = window.GROWTH_DATA;

const BASE_SERIES = [
  { id: "valid", name: "全部有效注册", group: "root", color: "#174A5B", width: 3.2, dash: "solid", total: DATA.summary.validRegistrations, note: "有效注册汇总" },
  { id: "growth", name: "用增部分", group: "department", color: "#159A8C", width: 2.8, dash: "solid", total: 3273, note: "用增归属注册" },
  { id: "sales", name: "销售自拓", group: "department", color: "#4B8DE8", width: 2.4, dash: "solid", total: 5480, note: "销售自主拓展" },
  { id: "sem", name: "SEM投流", group: "department", color: "#8072D4", width: 2.4, dash: "solid", total: 3942, note: "搜索广告投放" },
  { id: "ambassador", name: "U大使", group: "department", color: "#EAB65F", width: 2.4, dash: "solid", total: 1633, note: "大使推荐注册" },
  { id: "confirmed", name: "确定的（100%）", group: "confidence", color: "#159A8C", width: 3, dash: "solid", total: DATA.summary.confirmed, note: "Referer、UTM 或专属链接等明确命中" },
  { id: "assisted", name: "大概率的（>60%）", group: "confidence", color: "#F0A45D", width: 2.4, dash: "dashed", total: DATA.summary.assisted, note: "注册前 7 天访问过对应渠道来源" },
  { id: "unidentified", name: "有可能的", group: "confidence", color: "#9AAFB7", width: 2.2, dash: "dashed", total: DATA.summary.unidentified, note: "没有可靠证据" },
  { id: "geo", name: "GEO", group: "channel", color: "#159A8C", width: 2, dash: "solid", note: "AI 问答来源域名" },
  { id: "content", name: "内容运营", group: "channel", color: "#4B8DE8", width: 2, dash: "solid", note: "内容平台 Referer / UTM" },
  { id: "kol", name: "社群&站外运营", group: "channel", color: "#8072D4", width: 2, dash: "solid", note: "外链合作 / KOL" },
  { id: "community", name: "开发者运营", group: "channel", color: "#38B39A", width: 2, dash: "solid", note: "开发者产品与社区来源" },
  { id: "offline", name: "活动运营", group: "channel", color: "#EAB65F", width: 2, dash: "solid", note: "线上 / 广告 / 线下活动" },
  { id: "event", name: "热点响应", group: "channel", color: "#E97979", width: 2, dash: "solid", note: "事件营销 campaign" },
  { id: "other", name: "other", group: "channel", color: "#A58A65", width: 2.2, dash: "dashed", total: 947, note: "大概率的（>60%） + 有可能的" }
].map((item) => ({
  ...item,
  values: DATA.trends[item.id],
  total: item.total ?? DATA.trends[item.id].reduce((sum, value) => sum + value, 0)
}));

function distributeTotal(total, weights) {
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const raw = weights.map((value) => value * total / weightSum);
  const values = raw.map(Math.floor);
  let remainder = total - values.reduce((sum, value) => sum + value, 0);
  raw.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, remainder)
    .forEach(({ index }) => { values[index] += 1; });
  return values;
}

const SOURCE_COLORS = ["#246B8E", "#4B8DE8", "#8072D4", "#38B39A", "#EAB65F"];
const SOURCE_SERIES = Object.entries(DATA.details).flatMap(([parentId, sources]) => sources.map((source, index) => ({
  id: `source-${parentId}-${index}`,
  parentId,
  name: source.source,
  group: "source",
  color: SOURCE_COLORS[index % SOURCE_COLORS.length],
  width: 2,
  dash: index === sources.length - 1 && sources.length > 3 ? "dashed" : "solid",
  total: source.confirmed,
  note: source.evidence,
  values: distributeTotal(source.confirmed, DATA.trends[parentId])
})));
const SERIES = [...BASE_SERIES, ...SOURCE_SERIES];

const OVERVIEW_IDS = ["valid", "growth", "sales", "sem", "ambassador"];
const DEPARTMENT_IDS = ["growth", "sales", "sem", "ambassador"];
const CONFIDENCE_IDS = ["confirmed", "assisted", "unidentified"];
const CHANNEL_IDS = ["geo", "content", "kol", "community", "offline", "event", "other"];
const sourceSeriesFor = (parentId) => SOURCE_SERIES.filter((item) => item.parentId === parentId);

function Icon({ name, size = 16 }) {
  const paths = {
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"></path><path d="M4 19h16"></path></>,
    palette: <><circle cx="12" cy="12" r="9"></circle><path d="M8 9h.01M12 7h.01M16 9h.01M8 14h.01"></path></>,
    check: <path d="m5 12 4 4L19 6"></path>,
    arrow: <path d="m9 18 6-6-6-6"></path>,
    close: <><path d="m6 6 12 12"></path><path d="m18 6-12 12"></path></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function TrendChart({ activeIds, primaryColor, period }) {
  const ref = useRef(null);
  const option = useMemo(() => {
    const visible = SERIES.filter((item) => activeIds.has(item.id));
    const days = Number.parseInt(period, 10);
    const dates = DATA.dates.slice(-days);
    return {
      animationDuration: 420,
      color: visible.map((item) => item.id === "confirmed" || item.id === "geo" ? primaryColor : item.color),
      tooltip: {
        trigger: "axis",
        backgroundColor: "#174A5B",
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: "#FFFFFF", fontFamily: "Noto Sans SC", fontSize: 12 },
        order: "seriesAsc"
      },
      grid: { left: 58, right: 28, top: 24, bottom: 54 },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dates,
        axisLine: { lineStyle: { color: "#C9D4DC" } },
        axisTick: { show: false },
        axisLabel: { color: "#738592", fontSize: 11, interval: 1, margin: 14 }
      },
      yAxis: {
        type: "value",
        min: (value) => Math.max(0, Math.floor(value.min * 0.92)),
        max: (value) => Math.ceil(value.max * 1.06),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#738592", fontSize: 11 },
        splitLine: { lineStyle: { color: "#DEEBE8", type: "dashed" } }
      },
      dataZoom: [{ type: "inside", zoomOnMouseWheel: false, moveOnMouseMove: true }],
      series: visible.map((item) => ({
        id: item.id,
        name: item.name,
        type: "line",
        data: item.values.slice(-days),
        showSymbol: false,
        symbol: "circle",
        smooth: false,
        lineStyle: {
          width: item.width,
          type: item.dash,
          color: item.id === "confirmed" || item.id === "geo" ? primaryColor : item.color
        },
        itemStyle: { color: item.id === "confirmed" || item.id === "geo" ? primaryColor : item.color },
        emphasis: { focus: "series", lineStyle: { width: item.width + 1 } }
      }))
    };
  }, [activeIds, primaryColor, period]);

  useEffect(() => {
    const chart = echarts.init(ref.current);
    chart.setOption(option, true);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);
    return () => { chart.dispose(); window.removeEventListener("resize", resize); };
  }, [option]);

  return <div className="chart-stage">
    <div ref={ref} className="trend-chart"></div>
    {activeIds.size === 0 ? <div className="chart-empty"><strong>暂未选择曲线</strong><span>点击上方指标或下方渠道重新显示</span></div> : null}
  </div>;
}

function SeriesChip({ item, active, onToggle, primaryColor }) {
  const color = item.id === "confirmed" || item.id === "geo" ? primaryColor : item.color;
  return <button className={`series-chip ${active ? "active" : "muted"}`} onClick={() => onToggle(item.id)} aria-pressed={active}>
    <span className="series-check" style={{ borderColor: color, background: active ? color : "#FFFFFF" }}>{active ? <Icon name="check" size={12}></Icon> : null}</span>
    <span className="series-copy"><strong>{item.name}</strong><small>{item.total.toLocaleString()}</small></span>
    <i className="series-line" style={{ background: color }}></i>
  </button>;
}

function DrilldownTree({ selectedL2, selectedL3, selectedL4, activeIds, growthChannelsOpen, level4Open, onSelectRoot, onSelectL2, onExpandGrowth, onSelectL3, onSelectL4, onToggleLine, linkLabel }) {
  const root = DATA.attributionTree;
  const growth = root.children.find((item) => item.id === "growth");
  const activeL2 = root.children.find((item) => item.id === selectedL2);
  const activeL3 = growth.children.find((item) => item.id === selectedL3);
  const [l2Open, setL2Open] = useState(true);
  const [growthOpen, setGrowthOpen] = useState(growthChannelsOpen);
  const [expandedL3, setExpandedL3] = useState(level4Open ? selectedL3 : null);

  useEffect(() => {
    if (selectedL2 === "growth" && growthChannelsOpen) {
      setL2Open(true);
      setGrowthOpen(true);
      if (level4Open) setExpandedL3(selectedL3);
    } else if (!growthChannelsOpen) {
      setGrowthOpen(false);
      setExpandedL3(null);
    }
  }, [selectedL2, selectedL3, growthChannelsOpen, level4Open]);

  const isLineActive = (id) => activeIds.has(id);
  const lineState = (id) => <button className={`line-state ${isLineActive(id) ? "active" : ""}`} onClick={() => onToggleLine(id)} aria-pressed={isLineActive(id)} title="点击切换曲线显示状态"><i></i>{isLineActive(id) ? "已显示" : "未显示"}</button>;
  const treeArrow = (open) => <span className={`tree-arrow ${open ? "open" : ""}`}><Icon name="arrow" size={14}></Icon></span>;
  const toggleGrowth = () => {
    if (growthOpen) {
      setGrowthOpen(false);
      setExpandedL3(null);
      onSelectL2("growth");
    }
    else {
      setL2Open(true);
      setGrowthOpen(true);
      onExpandGrowth();
    }
  };
  const toggleL3 = (id) => {
    if (expandedL3 === id) setExpandedL3(null);
    else {
      setExpandedL3(id);
      onSelectL3(id);
    }
  };
  const expandCurrent = () => {
    setL2Open(true);
    setGrowthOpen(true);
    setExpandedL3(selectedL3);
  };
  const collapseAll = () => {
    setL2Open(false);
    setGrowthOpen(false);
    setExpandedL3(null);
  };

  return <section className="drill-panel monitor-panel" aria-label="注册量四级下钻">
    <div className="monitor-toolbar">
      <div className="path-strip"><span>当前路径</span><strong>{root.name}</strong><Icon name="arrow" size={13}></Icon><strong>{activeL2.name}</strong>{selectedL2 === "growth" ? <><Icon name="arrow" size={13}></Icon><strong>{activeL3.name}</strong>{selectedL4 ? <><Icon name="arrow" size={13}></Icon><strong>{SERIES.find((item) => item.id === selectedL4)?.name}</strong></> : null}</> : null}<em><i></i>{linkLabel}</em></div>
      <div className="monitor-actions"><button onClick={expandCurrent}>展开当前路径</button><button onClick={collapseAll}>全部收起</button></div>
    </div>
    <div className="monitor-table-wrap">
      <table className="monitor-table">
        <colgroup><col className="col-object"></col><col className="col-evidence"></col><col className="col-number"></col><col className="col-share"></col><col className="col-state"></col></colgroup>
        <tbody>
          <tr className="monitor-row level-1 selected">
            <td><div className="tree-object depth-1"><button className="tree-label" onClick={() => { setL2Open(true); onSelectRoot(); }}><strong>{root.name}</strong></button><button className="tree-arrow-button" onClick={() => setL2Open((value) => !value)} aria-label={l2Open ? "收起注册归属" : "展开注册归属"} title={l2Open ? "收起下级" : "展开下级"}>{treeArrow(l2Open)}</button></div></td><td>{root.note}</td><td className="number-cell">{root.value.toLocaleString()}</td><td className="share-cell">100.0%</td><td>{lineState("valid")}</td>
          </tr>
          {l2Open ? root.children.map((item) => {
            const share = item.value / root.value * 100;
            const selected = selectedL2 === item.id;
            return <React.Fragment key={item.id}>
              <tr className={`monitor-row level-2 ${selected ? "selected" : ""}`}>
                <td><div className="tree-object depth-2"><span className="tree-rail"></span><button className="tree-label" onClick={() => onSelectL2(item.id)}><strong>{item.name}</strong></button>{item.id === "growth" ? <button className="tree-arrow-button" onClick={toggleGrowth} aria-label={growthOpen ? "收起用增渠道" : "展开用增渠道"} title={growthOpen ? "收起下级" : "展开下级"}>{treeArrow(growthOpen)}</button> : null}</div></td><td>{item.note}</td><td className="number-cell">{item.value.toLocaleString()}</td><td className="share-cell">{share.toFixed(1)}%</td><td>{lineState(item.id)}</td>
              </tr>
              {item.id === "growth" && growthOpen ? growth.children.map((channel) => {
                const channelShare = channel.value / growth.value * 100;
                const channelSelected = selectedL3 === channel.id;
                const sources = DATA.details[channel.id] || [];
                const channelExpanded = sources.length > 0 && expandedL3 === channel.id;
                return <React.Fragment key={channel.id}>
                  <tr className={`monitor-row level-3 ${channelSelected ? "selected" : ""} ${channel.id === "other" ? "other" : ""}`}>
                    <td><div className="tree-object depth-3"><span className="tree-rail"></span><button className="tree-label" onClick={() => onSelectL3(channel.id)}><strong>{channel.name}</strong></button>{sources.length > 0 ? <button className="tree-arrow-button" onClick={() => toggleL3(channel.id)} aria-label={channelExpanded ? `收起${channel.name}具体来源` : `展开${channel.name}具体来源`} title={channelExpanded ? "收起下级" : "展开下级"}>{treeArrow(channelExpanded)}</button> : null}</div></td><td>{channel.note}</td><td className="number-cell">{channel.value.toLocaleString()}</td><td className="share-cell">{channelShare.toFixed(1)}%</td><td>{lineState(channel.id)}</td>
                  </tr>
                  {channelExpanded ? sources.map((source, index) => {
                    const sourceId = `source-${channel.id}-${index}`;
                    const sourceShare = source.confirmed / channel.value * 100;
                    return <tr className={`monitor-row level-4 ${selectedL4 === sourceId ? "selected" : ""}`} key={sourceId}>
                      <td><div className="tree-object depth-4"><span className="tree-rail"></span><button className="tree-label" onClick={() => onSelectL4(sourceId)}><strong>{source.source}</strong></button></div></td><td>{source.evidence}</td><td className="number-cell">{source.confirmed.toLocaleString()}</td><td className="share-cell">{sourceShare.toFixed(1)}%</td><td>{lineState(sourceId)}</td>
                    </tr>;
                  }) : null}
                </React.Fragment>;
              }) : null}
            </React.Fragment>;
          }) : null}
        </tbody>
      </table>
    </div>
  </section>;
}

function App() {
  const [period, setPeriod] = useState("14天");
  const [activeIds, setActiveIds] = useState(() => new Set(OVERVIEW_IDS));
  const [selectedL2, setSelectedL2] = useState("growth");
  const [selectedL3, setSelectedL3] = useState("geo");
  const [growthChannelsOpen, setGrowthChannelsOpen] = useState(false);
  const [level4Open, setLevel4Open] = useState(false);
  const [selectedL4, setSelectedL4] = useState(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.primaryColor);
    document.body.dataset.density = t.density;
  }, [t]);

  const openGrowthChannels = () => {
    setActiveIds(new Set(CHANNEL_IDS));
    setSelectedL2("growth");
    setGrowthChannelsOpen(true);
    setLevel4Open(false);
    setSelectedL4(null);
  };
  const showGrowthOnly = () => {
    setActiveIds(new Set(["growth"]));
    setSelectedL2("growth");
    setGrowthChannelsOpen(false);
    setLevel4Open(false);
    setSelectedL4(null);
  };
  const openLevel4 = (id) => {
    const sourceIds = sourceSeriesFor(id).map((item) => item.id);
    setActiveIds(new Set([id, ...sourceIds]));
    setSelectedL2("growth");
    setSelectedL3(id);
    setGrowthChannelsOpen(true);
    setLevel4Open(sourceIds.length > 0);
    setSelectedL4(null);
  };
  const toggle = (id) => {
    const item = SERIES.find((series) => series.id === id);
    if (id === "growth") {
      showGrowthOnly();
      return;
    }
    if (item?.group === "channel") {
      openLevel4(id);
      return;
    }
    if (id === "confirmed" && activeIds.has("confirmed")) {
      setActiveIds((current) => {
        const next = new Set(current);
        next.delete("confirmed");
        CHANNEL_IDS.forEach((channelId) => next.delete(channelId));
        return next.size ? next : new Set(OVERVIEW_IDS);
      });
      setGrowthChannelsOpen(false);
      setLevel4Open(false);
      setSelectedL4(null);
      return;
    }
    setActiveIds((current) => {
      const enteringConfidence = item?.group === "confidence" && !current.has(id) && !CONFIDENCE_IDS.some((confidenceId) => current.has(confidenceId));
      const next = enteringConfidence ? new Set() : new Set(current);
      if (next.has(id)) {
        next.delete(id);
        if (id === "confirmed") CHANNEL_IDS.forEach((channelId) => next.delete(channelId));
      } else {
        next.add(id);
      }
      if (next.size === 0) return item?.group === "source" ? new Set([selectedL3]) : new Set(OVERVIEW_IDS);
      return next;
    });
    if (item?.group === "confidence") {
      setSelectedL2("growth");
      if (id === "confirmed") setGrowthChannelsOpen(true);
      setLevel4Open(false);
      setSelectedL4(null);
    }
    if (item?.group === "department" && !activeIds.has(id)) setSelectedL2(id);
    if (item?.group === "source" && selectedL4 === id && activeIds.has(id)) setSelectedL4(null);
  };
  const showOverview = () => {
    setActiveIds(new Set(OVERVIEW_IDS));
    setSelectedL2("growth");
    setSelectedL3("geo");
    setGrowthChannelsOpen(false);
    setLevel4Open(false);
    setSelectedL4(null);
  };
  const showDepartments = () => {
    setActiveIds(new Set(DEPARTMENT_IDS));
    setSelectedL2("growth");
    setSelectedL3("geo");
    setGrowthChannelsOpen(false);
    setLevel4Open(false);
    setSelectedL4(null);
  };
  const channelsOnly = () => {
    setActiveIds(new Set(CHANNEL_IDS));
    setSelectedL2("growth");
    setGrowthChannelsOpen(true);
    setLevel4Open(false);
    setSelectedL4(null);
  };
  const toggleValidTotal = () => {
    setActiveIds((current) => {
      const next = new Set(current);
      if (next.has("valid")) next.delete("valid"); else next.add("valid");
      return next;
    });
  };
  const toggleLineVisibility = (id) => {
    setActiveIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    if (selectedL4 === id && activeIds.has(id)) setSelectedL4(null);
  };
  const selectL2 = (id) => {
    if (id === "growth") {
      showGrowthOnly();
    } else {
      setSelectedL2(id);
      setActiveIds(new Set([id]));
      setGrowthChannelsOpen(false);
      setLevel4Open(false);
      setSelectedL4(null);
    }
  };
  const selectL3 = (id) => {
    openLevel4(id);
  };
  const selectL4 = (id) => {
    setActiveIds(new Set([id]));
    setSelectedL4(id);
    setLevel4Open(true);
  };
  const openTweaks = () => window.postMessage({ type: "miaoda:tweaks:activate" }, "*");
  const rootSeries = SERIES.filter((item) => item.group === "root");
  const departmentSeries = SERIES.filter((item) => item.group === "department");
  const confidenceSeries = SERIES.filter((item) => item.group === "confidence");
  const channelSeries = SERIES.filter((item) => item.group === "channel");
  const level4Series = sourceSeriesFor(selectedL3);
  const activeL2 = DATA.attributionTree.children.find((item) => item.id === selectedL2);
  const activeL3 = DATA.attributionTree.children.find((item) => item.id === "growth").children.find((item) => item.id === selectedL3);
  const activeL4 = SOURCE_SERIES.find((item) => item.id === selectedL4);
  const selectedChannelVisible = activeIds.has(selectedL3);
  const activeDepartments = DEPARTMENT_IDS.filter((id) => activeIds.has(id));
  const allGrowthChannelsVisible = CHANNEL_IDS.every((id) => activeIds.has(id));
  const isDepartmentView = activeDepartments.length > 0 && !CONFIDENCE_IDS.some((id) => activeIds.has(id)) && !CHANNEL_IDS.some((id) => activeIds.has(id));
  const linkLabel = selectedL4 && activeL4
    ? `已聚焦：用增 / ${activeL3.name} / ${activeL4.name}`
    : level4Open
    ? `已展开：用增 / ${activeL3.name} / ${level4Series.length} 个具体来源`
    : isDepartmentView
      ? activeDepartments.length > 1 ? "曲线：注册归属概览" : `已联动：${SERIES.find((item) => item.id === activeDepartments[0]).name}`
      : allGrowthChannelsVisible
      ? "已联动：用增 / 7 个三级渠道"
      : selectedL2 === "growth"
      ? `已联动：用增 / ${activeL3.name}${selectedL3 !== "other" && !selectedChannelVisible ? "（曲线已隐藏）" : ""}`
      : `已联动：${activeL2.name}`;

  return <div className="app" data-screen-label="用增多渠道趋势">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">UG</div><div><div className="brand-title">用增数据看板</div><div className="brand-sub">User growth trend</div></div></div>
      <span className="demo-badge">演示数据 · 更新于 10:30</span>
    </header>
    <main className="main">
      <div className="page-head controls-only">
        <div className="filters"><div className="segmented">{["7天", "14天", "30天"].map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div><select className="date-select" defaultValue="2026-08-19"><option value="2026-08-19">截至 2026-08-19</option></select><button className="outline-button"><Icon name="download"></Icon>导出</button></div>
      </div>

      <section className="trend-panel">
        <div className="selector-head"><button className="selector-toggle" onClick={() => setSelectorOpen((value) => !value)} aria-expanded={selectorOpen}><span className={selectorOpen ? "open" : ""}><Icon name="arrow" size={14}></Icon></span><strong>选择曲线</strong><small>当前显示 {activeIds.size} 条</small></button><div className="selector-summary"><em className="link-status"><i></i>{linkLabel}</em><div className="quick-actions"><button className={activeIds.has("valid") ? "total-on" : ""} onClick={toggleValidTotal}>{activeIds.has("valid") ? "隐藏总量" : "叠加总量"}</button><button onClick={showOverview}>归属概览</button>{growthChannelsOpen && !allGrowthChannelsVisible ? <button onClick={channelsOnly}>恢复 7 条渠道</button> : null}</div></div></div>
        {selectorOpen ? <div className="selector-body">
          <div className="selector-group root-selector"><div className="group-label">总量</div><div className="chip-grid root-chips">{rootSeries.map((item) => <SeriesChip key={item.id} item={item} active={activeIds.has(item.id)} onToggle={toggle} primaryColor={t.primaryColor}></SeriesChip>)}</div></div>
          <div className="selector-group"><div className="group-label">注册归属</div><div className="chip-grid department-chips">{departmentSeries.map((item) => <SeriesChip key={item.id} item={item} active={activeIds.has(item.id)} onToggle={toggle} primaryColor={t.primaryColor}></SeriesChip>)}</div></div>
          <div className="selector-group confidence-selector"><div className="group-label">归因可信度</div><div className="chip-grid confidence-chips">{confidenceSeries.map((item) => <SeriesChip key={item.id} item={item} active={activeIds.has(item.id)} onToggle={toggle} primaryColor={t.primaryColor}></SeriesChip>)}</div></div>
          {growthChannelsOpen ? <div className="selector-group channel-selector expanded"><div className="group-label">用增渠道</div><div className="chip-grid channel-chips">{channelSeries.map((item) => <SeriesChip key={item.id} item={item} active={activeIds.has(item.id)} onToggle={toggle} primaryColor={t.primaryColor}></SeriesChip>)}</div></div> : <div className="selector-group channel-gate"><div className="group-label">用增渠道</div><button className="channel-gate-button" onClick={openGrowthChannels}><span><strong>选择“用增部分”后展开 7 条渠道曲线</strong><small>GEO、内容运营、社群&amp;站外运营、开发者运营、活动运营、热点响应、other</small></span><em>展开用增渠道 <Icon name="arrow" size={14}></Icon></em></button></div>}
          {level4Open ? <div className="selector-group source-selector expanded"><div className="group-label">{activeL3.name} 来源</div><div className="chip-grid source-chips">{level4Series.map((item) => <SeriesChip key={item.id} item={item} active={activeIds.has(item.id)} onToggle={toggle} primaryColor={t.primaryColor}></SeriesChip>)}</div></div> : null}
        </div> : null}
        <div className="chart-head"><div><strong>每日注册趋势</strong><span>按注册日期 · 单位：人</span></div><div className="scale-note"><i></i>纵轴随已选曲线自动缩放</div></div>
        <TrendChart activeIds={activeIds} primaryColor={t.primaryColor} period={period}></TrendChart>
        <div className="chart-foot"><span>全部有效注册 = 全部注册 − 明确广告注册 − 内部账号 − 测试账号 − 机器人及爬虫账号</span><span>大概率的（&gt;60%）为非互斥证据，不与汇总相加</span></div>
      </section>

      <DrilldownTree selectedL2={selectedL2} selectedL3={selectedL3} selectedL4={selectedL4} activeIds={activeIds} growthChannelsOpen={growthChannelsOpen} level4Open={level4Open} onSelectRoot={showDepartments} onSelectL2={selectL2} onExpandGrowth={openGrowthChannels} onSelectL3={selectL3} onSelectL4={selectL4} onToggleLine={toggleLineVisibility} linkLabel={linkLabel}></DrilldownTree>
    </main>
    <button className="floating-style" onClick={openTweaks} aria-label="打开风格设置"><Icon name="palette"></Icon></button>
    <TweaksPanel title="风格"><TweakSection label="曲线"></TweakSection><TweakColor label="主色" value={t.primaryColor} options={["#159A8C", "#3B82D0", "#6F69C9"]} onChange={(value) => setTweak("primaryColor", value)}></TweakColor><TweakRadio label="密度" value={t.density} options={["compact", "regular", "comfy"]} onChange={(value) => setTweak("density", value)}></TweakRadio></TweaksPanel>
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App></App>);
Object.assign(window, { App, TrendChart });
