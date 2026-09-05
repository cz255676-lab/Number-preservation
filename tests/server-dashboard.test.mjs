import assert from "node:assert/strict";
import worker from "../worker/worker.js";
import { SERVER_HTML_CONTENT } from "../worker/server-page.js";

class MemoryKV {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
    this.throwOnGet = new Set();
  }

  async get(key, options) {
    if (this.throwOnGet.has(key)) throw new Error(`KV read failed: ${key}`);
    if (!this.values.has(key)) return null;
    const value = this.values.get(key);
    if (options && options.type === "json") return JSON.parse(value);
    return value;
  }

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async delete(key) {
    this.values.delete(key);
  }
}

const kv = new MemoryKV({
  session_token_test_session: "valid",
  esim_list: "[]",
  domain_list: "[]",
  vpn_list: "[]"
});
const env = { ESIM_DB: kv, TG_BOT_TOKEN: "test-token", TG_CHAT_ID: "test-chat" };

async function call(path, options = {}) {
  return worker.fetch(new Request(`https://dashboard.example${path}`, options), env, {});
}

const inlineScripts = [...SERVER_HTML_CONTENT.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1].trim())
  .filter(Boolean);
assert.equal(inlineScripts.length, 1);
for (const source of inlineScripts) new Function(source);
assert.ok(inlineScripts[0].includes("if (!/^\\d{6}$/.test(code))"));
assert.match(SERVER_HTML_CONTENT, /云服务器资产看板/);
assert.match(SERVER_HTML_CONTENT, /root 密码/);
assert.match(SERVER_HTML_CONTENT, /不监控在线状态或性能/);
assert.match(SERVER_HTML_CONTENT, /保存并提醒/);
assert.match(SERVER_HTML_CONTENT, /续费正常/);
assert.match(SERVER_HTML_CONTENT, />续费\/管理<\/a>/);
assert.match(SERVER_HTML_CONTENT, /id="serverHost" type="text" maxlength="120"/);
assert.match(SERVER_HTML_CONTENT, /id="serverPlan" type="text" maxlength="120"/);
assert.match(SERVER_HTML_CONTENT, /href="\/vpns"/);
assert.equal((SERVER_HTML_CONTENT.match(/href="\/servers"/g) || []).length, 0);

const pageResponse = await call("/servers");
assert.equal(pageResponse.status, 200);
assert.match(pageResponse.headers.get("content-type"), /^text\/html/);
assert.match(await pageResponse.text(), /云服务器资产看板/);

for (const page of ["/", "/domains", "/vpns"]) {
  const response = await call(page);
  assert.match(await response.text(), /href="\/servers"/);
}

const unauthorized = await call("/api/servers");
assert.equal(unauthorized.status, 401);

const headers = { "Content-Type": "application/json", Authorization: "test_session" };
const created = await call("/api/servers", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "香港云服务器",
    provider: "Example Cloud",
    host: "server.example.com",
    plan: "香港 / 2 核 4 GB",
    expireDate: "2027-01-01",
    renewalDays: 365,
    cost: "HK$500/年",
    autoRenew: true,
    notifyAdvance: 7,
    notifyInterval: 1,
    notifyCount: 7,
    manageUrl: "https://cloud.example/account",
    remark: "续费前检查账单"
  })
});
assert.equal(created.status, 200);
const createdBody = await created.json();
assert.equal(createdBody.success, true);
assert.equal(createdBody.server.name, "香港云服务器");
assert.equal(createdBody.server.host, "server.example.com");
assert.equal(createdBody.server.autoRenew, true);
assert.equal(JSON.parse(kv.values.get("server_list")).length, 1);
assert.equal(kv.values.get("esim_list"), "[]");
assert.equal(kv.values.get("domain_list"), "[]");
assert.equal(kv.values.get("vpn_list"), "[]");

const invalidCases = [
  { name: "  ", expireDate: "2027-01-01" },
  { name: "日期错误", expireDate: "2027-02-30" },
  { name: "周期错误", expireDate: "2027-01-01", renewalDays: "1.5" },
  { name: "状态错误", expireDate: "2027-01-01", autoRenew: "yes" },
  { name: "危险链接", expireDate: "2027-01-01", manageUrl: "https://cloud.example/account?token=secret" }
];
for (const body of invalidCases) {
  const response = await call("/api/servers", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  assert.equal(response.status, 400);
}

const listResponse = await call("/api/servers", { headers });
assert.equal(listResponse.status, 200);
assert.equal((await listResponse.json()).length, 1);

const updated = await call("/api/servers", {
  method: "PUT",
  headers,
  body: JSON.stringify({
    id: createdBody.server.id,
    name: "香港生产服务器",
    expireDate: "2027-12-31",
    renewalDays: 30,
    autoRenew: false
  })
});
assert.equal(updated.status, 200);
const updatedBody = await updated.json();
assert.equal(updatedBody.server.name, "香港生产服务器");
assert.equal(updatedBody.server.renewalDays, 30);
assert.equal(updatedBody.server.autoRenew, false);

const localToday = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
await kv.put("server_list", JSON.stringify([{
  ...updatedBody.server,
  expireDate: localToday,
  manageUrl: "https://cloud.example/account"
}]));

const originalFetch = globalThis.fetch;
const telegramPayloads = [];
globalThis.fetch = async (url, options) => {
  assert.match(String(url), /^https:\/\/api\.telegram\.org\/bot/);
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /云服务器到期提醒/);
assert.match(telegramPayloads[0].text, /server\.example\.com/);
assert.equal(telegramPayloads[0].reply_markup.inline_keyboard[0][0].text, "续费/管理");

telegramPayloads.length = 0;
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
try {
  const manual = await call("/api/server-reminders/test", { method: "POST", headers });
  assert.equal(manual.status, 200);
  assert.equal((await manual.json()).sent, 1);
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /手动测试/);

telegramPayloads.length = 0;
const expiredFourteenDaysAgo = new Date(
  Date.parse(`${localToday}T00:00:00Z`) - 14 * 86400000
).toISOString().slice(0, 10);
await kv.put("server_list", JSON.stringify([{ ...updatedBody.server, expireDate: expiredFourteenDaysAgo }]));
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
}
assert.equal(telegramPayloads.length, 0);

await kv.put("esim_list", JSON.stringify([{
  id: "sim_test",
  name: "测试卡",
  number: "+852 00000000",
  cycle: 365,
  expireDate: localToday,
  notifyAdvance: 15,
  notifyInterval: 1,
  notifyCount: 0,
  rechargeUrl: "https://carrier.example/recharge"
}]));
kv.throwOnGet.add("server_list");
globalThis.fetch = async (url, options) => {
  telegramPayloads.push(JSON.parse(options.body));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
try {
  await worker.scheduled({}, env, {});
} finally {
  globalThis.fetch = originalFetch;
  kv.throwOnGet.delete("server_list");
}
assert.equal(telegramPayloads.length, 1);
assert.match(telegramPayloads[0].text, /eSIM 到期提醒/);

await kv.put("esim_list", "[]");
await kv.put("server_list", JSON.stringify([updatedBody.server]));
const deleted = await call("/api/servers", {
  method: "DELETE",
  headers,
  body: JSON.stringify({ id: createdBody.server.id })
});
assert.equal(deleted.status, 200);
assert.equal(JSON.parse(kv.values.get("server_list")).length, 0);

console.log("server dashboard tests: ok");
