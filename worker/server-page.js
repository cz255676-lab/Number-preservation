import { VPN_HTML_CONTENT } from "./vpn-page.js";

// 云服务器看板沿用 VPN 看板已经验证过的交互与登录流程，
// 仅替换资产字段、接口和安全提示，避免两套页面行为逐渐不一致。
let serverHtml = VPN_HTML_CONTENT
  .replaceAll("VPN_API_URL", "SERVER_API_URL")
  .replaceAll("VPN_TEST_URL", "SERVER_TEST_URL")
  .replaceAll("AccountLabel", "Host")
  .replaceAll("accountLabel", "host")
  .replaceAll("Vpns", "Servers")
  .replaceAll("vpns", "servers")
  .replaceAll("Vpn", "Server")
  .replaceAll("vpn", "server")
  .replaceAll("VPN", "云服务器")
  .replaceAll("fa-shield-halved", "fa-server")
  .replaceAll(".server-card { transition:", ".server-card { overflow-wrap: anywhere; transition:")
  .replaceAll("个人 云服务器 订阅到期、续费与 Telegram 提醒看板", "个人云服务器到期、续费与 Telegram 提醒看板")
  .replaceAll("云服务器 资产看板", "云服务器资产看板")
  .replaceAll("云服务器 看板", "云服务器看板")
  .replaceAll("云服务器 名称（必填）", "服务器名称（必填）")
  .replaceAll("云服务器 名称", "服务器名称")
  .replaceAll("添加 云服务器", "添加服务器")
  .replaceAll("新增 云服务器", "新增服务器")
  .replaceAll("编辑 云服务器", "编辑服务器")
  .replaceAll("删除 云服务器", "删除服务器")
  .replaceAll("未找到 云服务器", "未找到服务器")
  .replaceAll("未命名 云服务器", "未命名服务器")
  .replaceAll("云服务器 已更新", "服务器已更新")
  .replaceAll("云服务器 已添加", "服务器已添加")
  .replaceAll("云服务器 已删除", "服务器已删除")
  .replaceAll("云服务器 总数", "服务器总数")
  .replaceAll("搜索 云服务器", "搜索云服务器")
  .replaceAll("正在读取 云服务器 数据", "正在读取云服务器数据")
  .replaceAll("没有找到匹配的 云服务器", "没有找到匹配的服务器")
  .replaceAll("还没有 云服务器 订阅", "还没有云服务器记录")
  .replaceAll("添加第一个 云服务器，系统会计算剩余天数并按规则提醒。", "添加第一台云服务器，系统会计算剩余天数并按规则提醒。")
  .replaceAll("账号标识", "IP / 主机名")
  .replaceAll("套餐（选填）", "地区 / 配置（选填）")
  .replaceAll("套餐：", "地区 / 配置：")
  .replaceAll("搜索名称、服务商、IP / 主机名或套餐", "搜索名称、服务商、IP / 主机名或配置")
  .replaceAll("例如：香港高速套餐", "例如：香港云服务器")
  .replaceAll("例如：Mullvad", "例如：Cloudflare 或阿里云")
  .replaceAll("仅填昵称或邮箱尾号，不要填密码", "例如：server.example.com（不要填登录密码）")
  .replaceAll("例如：年付 5 设备", "例如：香港 / 2 核 4 GB")
  .replaceAll("这里只记录订阅信息。请勿填写 云服务器 密码、验证码、私钥、恢复码、配置文件或带访问密钥的订阅链接。", "这里只记录续费信息。请勿填写 root 密码、SSH 私钥、API 密钥、恢复码或控制面板令牌。")
  .replaceAll("通过 Telegram 验证后管理 云服务器 订阅与续费提醒。", "通过 Telegram 验证后管理云服务器到期与续费提醒。")
  .replaceAll("云服务器 订阅与续费提醒", "云服务器到期与续费提醒")
  .replaceAll("云服务器 资产", "云服务器")
  .replaceAll("云服务器 测试提醒", "云服务器测试提醒")
  .replaceAll("云服务器 统计", "云服务器统计")
  .replaceAll("状态安全", "续费正常")
  .replaceAll("保存并监控", "保存并提醒")
  .replaceAll('id="serverHost" type="text" maxlength="80"', 'id="serverHost" type="text" maxlength="120"')
  .replaceAll('id="serverPlan" type="text" maxlength="80"', 'id="serverPlan" type="text" maxlength="120"')
  .replaceAll("不要粘贴含访问密钥的订阅地址", "不要粘贴含访问密钥的控制台地址")
  .replaceAll("例如：续费前检查套餐价格", "例如：续费前备份并检查账单")
  .replaceAll("这里只记录续费信息。请勿填写 root 密码、SSH 私钥、API 密钥、恢复码或控制面板令牌。", "这里只记录到期与续费信息，不监控在线状态或性能。请勿填写 root 密码、SSH 私钥、API 密钥、恢复码或控制面板令牌。");

const duplicateServerTab = '                    <a href="/servers" class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white/75 border-b-4 border-transparent hover:text-white whitespace-nowrap">\n' +
  '                        <i class="fa-solid fa-server" aria-hidden="true"></i> 云服务器\n' +
  '                    </a>\n';
serverHtml = serverHtml.replace(duplicateServerTab, "");

const activeServerTab = '                    <span class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white border-b-4 border-emerald-300 whitespace-nowrap" aria-current="page">';
const vpnTab = '                    <a href="/vpns" class="min-h-11 flex items-center gap-2 px-1 text-lg md:text-xl font-extrabold text-white/75 border-b-4 border-transparent hover:text-white whitespace-nowrap">\n' +
  '                        <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> VPN 资产\n' +
  '                    </a>\n';
serverHtml = serverHtml.replace(activeServerTab, vpnTab + activeServerTab);

export const SERVER_HTML_CONTENT = serverHtml;
