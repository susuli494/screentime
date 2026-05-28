// netlify/functions/screentime.js
const data = {};

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const { action, app } = params;

  if (action === "toggle" && app) {
    const now = Date.now();
    const key = app.toLowerCase();

    if (!data[key]) {
      data[key] = { status: "closed", sessions: [], totalMs: 0 };
    }

    const entry = data[key];

    if (entry.status === "closed") {
      entry.status = "open";
      entry.openedAt = now;
    } else {
      const duration = now - entry.openedAt;
      entry.totalMs += duration;
      entry.sessions.push({ open: entry.openedAt, close: now, duration });
      entry.status = "closed";
      entry.openedAt = null;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, app: key, status: entry.status }),
    };
  }

  if (action === "report") {
    const report = Object.entries(data).map(([app, info]) => ({
      app,
      status: info.status,
      totalMinutes: Math.round(info.totalMs / 60000),
      sessions: info.sessions.length,
    }));
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, report }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: false, msg: "请加上 ?action=toggle&app=微信 或 ?action=report" }),
  };
};
