import { useMemo, useState } from "react";

const salaryTable = {
  "E03": { SS: 7000, S: 6400, A: 5800, B: 5200, C: 4700, D: 3500 },
  "E03-1": { SS: 7400, S: 6800, A: 6100, B: 5500, C: 5000, D: 3700 },
  "E03-2": { SS: 7800, S: 7200, A: 6500, B: 5800, C: 5300, D: 3900 },
  "E03-3": { SS: 8700, S: 7900, A: 7200, B: 6400, C: 5800, D: 4300 },
  "E03-4": { SS: 10000, S: 9000, A: 8000, B: 8000, C: 7000, D: 5000 },
  "E04": { SS: 8400, S: 7700, A: 7000, B: 6300, C: 5600, D: 4200 },
  "E04-1": { SS: 8900, S: 8200, A: 7400, B: 6700, C: 5900, D: 4500 },
  "E04-2": { SS: 9400, S: 8600, A: 7800, B: 7100, C: 6300, D: 4700 },
  "E04-3": { SS: 10400, S: 9500, A: 8700, B: 7800, C: 6900, D: 5200 },
  "E04-4": { SS: 12000, S: 11000, A: 10000, B: 9000, C: 8000, D: 6000 },
  "E05": { SS: 10200, S: 9400, A: 8500, B: 7700, C: 6800, D: 5100 },
  "E05-1": { SS: 10800, S: 10000, A: 9000, B: 8200, C: 7200, D: 5400 },
  "E05-2": { SS: 11400, S: 10500, A: 9500, B: 8600, C: 7600, D: 5700 },
  "E05-3": { SS: 12600, S: 11700, A: 10500, B: 9500, C: 8400, D: 6300 },
  "E05-4": { SS: 14000, S: 13000, A: 12000, B: 11000, C: 10000, D: 7000 },
  "E06": { SS: 12600, S: 11550, A: 10500, B: 9500, C: 8400, D: 6300 },
  "E06-1": { SS: 13400, S: 12200, A: 11100, B: 10100, C: 8900, D: 6700 },
  "E06-2": { SS: 14100, S: 12900, A: 11800, B: 10600, C: 9400, D: 7100 },
  "E06-3": { SS: 15600, S: 14300, A: 13000, B: 11800, C: 10400, D: 7800 },
  "E06-4": { SS: 18000, S: 16000, A: 15000, B: 13000, C: 12000, D: 9000 },
  "E07": { SS: 15480, S: 14200, A: 12900, B: 11600, C: 10300, D: 7700 },
  "E07-1": { SS: 16400, S: 15100, A: 13700, B: 12300, C: 10900, D: 8200 },
  "E07-2": { SS: 17300, S: 15900, A: 14400, B: 13000, C: 11500, D: 8600 },
  "E07-3": { SS: 19200, S: 17600, A: 16000, B: 14400, C: 12800, D: 9500 },
  "E07-4": { SS: 22000, S: 20000, A: 18000, B: 16000, C: 15000, D: 11000 },
  "E08": { SS: 21360, S: 19580, A: 17800, B: 16000, C: 14200, D: 10600 },
  "E08-1": { SS: 22600, S: 20800, A: 18900, B: 17000, C: 15100, D: 11200 },
  "E08-2": { SS: 23900, S: 21900, A: 19900, B: 17900, C: 15900, D: 11900 },
  "E08-3": { SS: 26500, S: 24300, A: 22100, B: 19800, C: 17600, D: 13100 },
  "E08-4": { SS: 30000, S: 27000, A: 25000, B: 22000, C: 20000, D: 15000 },
};

const departments = ["企业培训业务部", "基础教育业务部", "高教业务部"];
const grades = Object.keys(salaryTable);
const ratings = ["未提供", "CR值 100%", "CR值 100%～110%", "CR值 110%～120%"];
const modes = ["按职级算薪资", "按薪资反推职级"];
const cityOptions = [
  "北京",
  "上海",
  "广州",
  "深圳",
  "杭州",
  "成都",
  "武汉",
  "西安",
  "南京",
  "苏州",
  "重庆",
  "天津",
  "郑州",
  "长沙",
  "青岛",
  "宁波",
  "厦门",
  "佛山",
  "东莞",
  "其他",
];
const levels = ["SS", "S", "A", "B", "C", "D"];

function inferLevel(city, manualLevel) {
  if (manualLevel) return manualLevel;
  if (["北京", "上海"].includes(city)) return "SS";
  if (["广州", "深圳"].includes(city)) return "S";
  return null;
}

function getSplitRatio(department, city) {
  if (department === "高教业务部") return { base: 0.8, perf: 0.2, label: "8:2" };
  if (department === "企业培训业务部") {
    if (["北京", "上海", "广州", "深圳"].includes(city)) return { base: 0.9, perf: 0.1, label: "9:1" };
    return { base: 0.8, perf: 0.2, label: "8:2" };
  }
  if (department === "基础教育业务部") {
    if (["北京", "上海", "广州"].includes(city)) return { base: 0.9, perf: 0.1, label: "9:1" };
    return { base: 0.8, perf: 0.2, label: "8:2" };
  }
  return null;
}

function getApproval(cr) {
  if (cr <= 100) return "无需审批";
  if (cr <= 105) return "直属Leader审批";
  if (cr <= 110) return "部门负责人审批";
  return "HRD审批";
}

function getRatingMatch(rating, cr) {
  if (!rating || rating === "未提供") return "未提供";
  if (rating === "CR值 100%") {
    if (cr === 100) return "合理";
    return cr > 100 ? "偏高（已超过 CR值 100% 合理范围）" : "偏低（低于 CR值 100% 标准建议）";
  }
  if (rating === "CR值 100%～110%") {
    if (cr >= 100 && cr <= 110) return "合理";
    return cr > 110 ? "偏高（已超过 CR值 100%～110% 合理范围）" : "偏低（未体现 CR值 100%～110% 区间）";
  }
  if (rating === "CR值 110%～120%") {
    if (cr >= 110 && cr <= 120) return "合理";
    return cr > 120 ? "偏高（已超过 CR值 110%～120% 合理范围）" : "偏低（未体现 CR值 110%～120% 区间）";
  }
  return "未提供";
}

function formatAnnual(monthly) {
  const annual = (monthly * 12) / 10000;
  return Number.isInteger(annual)
    ? `${annual}`
    : annual.toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1");
}

const fieldLabelStyle = {
  display: "block",
  marginBottom: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "#334155",
};

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  fontSize: 15,
  boxSizing: "border-box",
  outline: "none",
};

const cardStyle = {
  background: "rgba(255,255,255,0.92)",
  padding: 28,
  borderRadius: 24,
  border: "1px solid rgba(148,163,184,0.15)",
  boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
};

const metricCardStyle = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: 18,
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  minHeight: 88,
};

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("按职级算薪资");
  const [department, setDepartment] = useState("基础教育业务部");
  const [city, setCity] = useState("深圳");
  const [customCity, setCustomCity] = useState("");
  const [manualLevel, setManualLevel] = useState("");
  const [grade, setGrade] = useState("E5-4");
  const [rating, setRating] = useState("未提供");
  const [offeredSalary, setOfferedSalary] = useState("");
  const [currentSalary, setCurrentSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const actualCity = city === "其他" ? customCity.trim() : city;

  const result = useMemo(() => {
    const level = inferLevel(actualCity, manualLevel);

    if (!department || !actualCity) return { error: "请先补全事业部和城市。" };
    if (!level) return { error: "请补充城市等级（SS/S/A/B/C/D）或选择标准城市名称。" };

    const split = getSplitRatio(department, actualCity);
    if (!split) return { error: "未识别到事业部薪酬结构规则。" };

    if (mode === "按职级算薪资") {
      if (!grade) return { error: "请选择职级。" };

      const standardSalary = salaryTable[grade]?.[level];
      if (!standardSalary) return { error: "未查询到对应职级薪资标准。" };

      const monthly = offeredSalary ? Number(offeredSalary) : standardSalary;
      if (!Number.isFinite(monthly) || monthly <= 0) return { error: "拟给月薪请输入有效数字。" };

      const baseSalary = Math.round(monthly * split.base);
      const perfSalary = monthly - baseSalary;
      const cr = Math.round((monthly / standardSalary) * 100);
      const approval = getApproval(cr);
      const ratingMatch = getRatingMatch(rating, cr);
      const annual = formatAnnual(monthly);

      const current = currentSalary ? Number(currentSalary) : null;
      const raisePercent = current && current > 0 ? Math.round(((monthly - current) / current) * 100) : null;

      const output = `${department}${actualCity}薪资初步建议：

职级：
${grade}：${monthly}（${baseSalary}底薪+${perfSalary}绩效）*12+提成=${annual}w/年+提成   CR值${cr}%${raisePercent !== null ? `   涨幅${raisePercent}%（目前${current}）` : ""}

审批建议：
${approval}

评级匹配：
${ratingMatch}

说明：
标准月薪为${standardSalary}，本次拟给月薪为${monthly}，CR区间为${rating}。${raisePercent !== null ? `\n目前薪资为${current}，涨幅为${raisePercent}%。` : ""}${notes ? `\n备注：${notes}` : ""}`;

      return {
        level,
        splitLabel: split.label,
        standardSalary,
        monthly,
        grade,
        baseSalary,
        perfSalary,
        cr,
        annual,
        approval,
        ratingMatch,
        raisePercent,
        output,
      };
    }

    const monthly = Number(offeredSalary);
    if (!Number.isFinite(monthly) || monthly <= 0) {
      return { error: "反推职级时，请输入有效的拟给月薪。" };
    }

    const candidates = Object.entries(salaryTable).map(([g, row]) => {
      const standardSalary = row[level];
      const cr = Math.round((monthly / standardSalary) * 100);
      const distance = Math.abs(monthly - standardSalary);
      const inPreferredRange = cr >= 100 && cr <= 110;
      return { g, standardSalary, cr, distance, inPreferredRange };
    });

    candidates.sort((a, b) => {
      if (a.inPreferredRange !== b.inPreferredRange) return a.inPreferredRange ? -1 : 1;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.standardSalary - b.standardSalary;
    });

    const best = candidates[0];
    const baseSalary = Math.round(monthly * split.base);
    const perfSalary = monthly - baseSalary;
    const approval = getApproval(best.cr);
    const ratingMatch = getRatingMatch(rating, best.cr);
    const annual = formatAnnual(monthly);

    const current = currentSalary ? Number(currentSalary) : null;
    const raisePercent = current && current > 0 ? Math.round(((monthly - current) / current) * 100) : null;

    let judgement = "落在合理范围内，建议按该职级发放。";
    if (best.cr < 95) judgement = "拟给月薪明显低于该职级标准位，建议谨慎确认是否定级偏高。";
    if (best.cr > 110) judgement = "拟给月薪明显高于该职级标准位，建议结合候选人能力确认是否需要上调职级或走特批。";

    const output = `${department}${actualCity}薪资初步建议：

推荐职级：
${best.g}

薪资建议：
${best.g}：${monthly}（${baseSalary}底薪+${perfSalary}绩效）*12+提成=${annual}w/年+提成   CR值${best.cr}%${raisePercent !== null ? `   涨幅${raisePercent}%（目前${current}）` : ""}

审批建议：
${approval}

评级匹配：
${ratingMatch}

职级判断：
${judgement}

说明：
按${actualCity}${level}城市等级测算，最接近的标准职级为${best.g}，标准月薪为${best.standardSalary}，本次拟给月薪为${monthly}，CR区间为${rating}。${raisePercent !== null ? `\n目前薪资为${current}，涨幅为${raisePercent}%。` : ""}${notes ? `\n备注：${notes}` : ""}`;

    return {
      level,
      splitLabel: split.label,
      standardSalary: best.standardSalary,
      monthly,
      grade: best.g,
      baseSalary,
      perfSalary,
      cr: best.cr,
      annual,
      approval,
      ratingMatch,
      raisePercent,
      judgement,
      output,
    };
  }, [mode, department, actualCity, manualLevel, grade, rating, offeredSalary, currentSalary, notes]);

  const copyOutput = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(360px, 460px) minmax(420px, 1fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "#e0e7ff",
              color: "#4338ca",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            HR 内部试运行版
          </div>

          <h1
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: 36,
              lineHeight: 1.15,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            销售岗薪资计算器
          </h1>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#4f46e5",
              marginBottom: 12,
            }}
          >
            v2
          </div>

          <p
            style={{
              color: "#64748b",
              marginTop: 0,
              marginBottom: 24,
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            支持按职级算薪资，也支持根据拟给月薪反推最合适职级。
          </p>

          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <label style={fieldLabelStyle}>计算模式</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} style={fieldStyle}>
                {modes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={fieldLabelStyle}>事业部</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={fieldStyle}>
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={fieldLabelStyle}>城市</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} style={fieldStyle}>
                  {cityOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={fieldLabelStyle}>城市等级（未知城市时手动选）</label>
                <select value={manualLevel} onChange={(e) => setManualLevel(e.target.value)} style={fieldStyle}>
                  <option value="">自动识别</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {city === "其他" && (
              <div>
                <label style={fieldLabelStyle}>自定义城市名称</label>
                <input
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="例如：合肥"
                  style={fieldStyle}
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={fieldLabelStyle}>职级</label>
                {mode === "按职级算薪资" ? (
                  <select value={grade} onChange={(e) => setGrade(e.target.value)} style={fieldStyle}>
                    {grades.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input value="系统将自动推荐最合适职级" readOnly style={{ ...fieldStyle, background: "#f8fafc", color: "#64748b" }} />
                )}
              </div>

              <div>
                <label style={fieldLabelStyle}>CR区间</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} style={fieldStyle}>
                  {ratings.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={fieldLabelStyle}>
                  {mode === "按职级算薪资" ? "拟给月薪（可不填，默认按标准月薪）" : "拟给月薪（必填，用于反推职级）"}
                </label>
                <input
                  type="number"
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(e.target.value)}
                  placeholder="例如：15000"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>目前薪资（可选，用于计算涨幅）</label>
                <input
                  type="number"
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                  placeholder="例如：12000"
                  style={fieldStyle}
                />
              </div>
            </div>

            <div>
              <label style={fieldLabelStyle}>备注（可选）</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="例如：候选人有头部教育公司背景，业务方强push"
                rows={4}
                style={{ ...fieldStyle, resize: "vertical", minHeight: 108 }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 22, color: "#0f172a" }}>计算结果</h2>

            {result.error ? (
              <div
                style={{
                  background: "#fff7ed",
                  color: "#9a3412",
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid #fed7aa",
                  fontSize: 15,
                  lineHeight: 1.7,
                }}
              >
                {result.error}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <MetricCard label="城市等级" value={result.level} />
                <MetricCard label="薪酬结构" value={result.splitLabel} />
                <MetricCard label="推荐职级" value={result.grade} />
                <MetricCard label="标准月薪" value={result.standardSalary} />
                <MetricCard label="拟给月薪" value={result.monthly} />
                <MetricCard label="CR值" value={`${result.cr}%`} />
                <MetricCard label="底薪 / 绩效" value={`${result.baseSalary} / ${result.perfSalary}`} />
                <MetricCard label="审批建议" value={result.approval} />
                {result.raisePercent !== null && result.raisePercent !== undefined && (
                  <MetricCard label="涨幅比例" value={`${result.raisePercent}%`} />
                )}

                <div
                  style={{
                    ...metricCardStyle,
                    gridColumn: "1 / -1",
                  }}
                >
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>推荐职级 / 评级匹配</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                    {result.grade} / {result.ratingMatch}
                  </div>
                  {result.judgement && (
                    <div style={{ marginTop: 10, fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>
                      {result.judgement}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
                gap: 12,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>标准输出模板</h2>

              <button
                onClick={copyOutput}
                disabled={!result.output}
                style={{
                  border: "1px solid #cbd5e1",
                  background: copied ? "#e0e7ff" : "#ffffff",
                  color: copied ? "#4338ca" : "#334155",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied ? "已复制" : "复制结果"}
              </button>
            </div>

            <textarea
              readOnly
              value={result.output || ""}
              rows={18}
              style={{
                width: "100%",
                padding: 16,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 14,
                lineHeight: 1.7,
                borderRadius: 18,
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
