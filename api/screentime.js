// api/screentime.js
const data = {}; // 内存存储（Vercel免费版用这个就够）

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { action, app } = req.query;

  // toggle：打开/关闭APP时调用
  if (action === "toggle" && app) {
    const now = Date.now();
    const key = app.toLowerCase();

    if (!data[key]) {
      data[key] = { status: "closed", sessions: [], totalMs: 0 };
    }

    const entry = data[key];

    if (entry.status === "closed") {
      // 打开APP
      entry.status = "open";
      entry.openedAt = now;
    } else {
      // 关闭APP
      const duration = now - entry.openedAt;
      entry.totalMs += duration;
      entry.sessions.push({ open: entry.openedAt, close: now, duration });
      entry.status = "closed";
      entry.openedAt = null;
    }

    return res.json({ ok: true, app: key, status: entry.status });
  }

  // report：查看今天的使用情况
  if (action === "report") {
    const report = Object.entries(data).map(([app, info]) => ({
      app,
      status: info.status,
      totalMinutes: Math.round(info.totalMs / 60000),
      sessions: info.sessions.length,
    }));
    return res.json({ ok: true, report });
  }

  return res.json({ ok: false, msg: "请加上 ?action=toggle&app=微信 或 ?action=report" });
}
