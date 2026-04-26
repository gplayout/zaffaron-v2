/**
 * RecipeOps Telegram Alerts
 * Sends alerts on failures, daily summaries, and pipeline status
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// F-kimi-17 (2026-04-26): validate Telegram CHAT_ID format up-front so a
// misconfigured chat id surfaces with a clear console.error rather than a
// generic Telegram API error during sendMessage. Telegram chat ids are
// numeric, optionally prefixed with '-' for groups/channels (-100xxxx for
// supergroups/channels). Empty/undefined/non-numeric values would silently
// trigger Telegram API errors that operators easily miss.
const CHAT_ID_RE = /^-?\d+$/;
let _chatIdValidated = false;
let _chatIdValid = false;
function validateChatId() {
  if (_chatIdValidated) return _chatIdValid;
  _chatIdValidated = true;
  if (!CHAT_ID || typeof CHAT_ID !== 'string' || !CHAT_ID_RE.test(CHAT_ID.trim())) {
    console.error(`[ALERT-CONFIG] TELEGRAM_CHAT_ID invalid (got: ${JSON.stringify(CHAT_ID)}). Expected numeric, optionally with leading '-'. Telegram alerts disabled.`);
    _chatIdValid = false;
  } else {
    _chatIdValid = true;
  }
  return _chatIdValid;
}

// P1.1 (2026-04-26, Kimi F-kimi-04): validate Telegram BOT_TOKEN format up-front
// so a malformed token surfaces with a clear [ALERT-CONFIG] error rather than a
// silent 401 from Telegram API. Format: <bot_id>:<35+ char alphanumeric+_- token>.
// Empty/undefined fall through to existing !BOT_TOKEN guard. Malformed (wrong
// shape, leaked partial value, etc.) is the gap this regex closes.
const BOT_TOKEN_RE = /^\d+:[A-Za-z0-9_-]{35,}$/;
let _botTokenValidated = false;
let _botTokenValid = false;
function validateBotToken() {
  if (_botTokenValidated) return _botTokenValid;
  _botTokenValidated = true;
  if (!BOT_TOKEN || typeof BOT_TOKEN !== 'string' || !BOT_TOKEN_RE.test(BOT_TOKEN.trim())) {
    // Mask token in error log: show only first 6 chars + length, never full token
    const masked = BOT_TOKEN ? `${String(BOT_TOKEN).slice(0, 6)}...(len=${String(BOT_TOKEN).length})` : 'undefined';
    console.error(`[ALERT-CONFIG] TELEGRAM_BOT_TOKEN malformed (got: ${masked}). Expected '<bot_id>:<35+ char token>'. Telegram alerts disabled.`);
    _botTokenValid = false;
  } else {
    _botTokenValid = true;
  }
  return _botTokenValid;
}

export async function sendAlert(message, silent = false) {
  if (!BOT_TOKEN) {
    console.log(`[ALERT] ${message}`);
    return;
  }
  if (!validateBotToken()) {
    console.log(`[ALERT-NOSEND] ${message}`);
    return;
  }
  if (!validateChatId()) {
    console.log(`[ALERT-NOSEND] ${message}`);
    return;
  }

  try {
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_notification: silent,
      }),
    });
    const data = await resp.json();
    if (!data.ok) console.error('Telegram alert failed:', data.description);
  } catch (e) {
    console.error('Telegram alert error:', e.message);
  }
}

export async function alertPipelineStart(count) {
  await sendAlert(`🏭 <b>RecipeOps Pipeline Starting</b>\n📦 ${count} jobs queued`, true);
}

export async function alertJobDone(slug, score, cost) {
  await sendAlert(
    `✅ <b>Recipe Published</b>\n📗 ${slug}\n⭐ Verify: ${score}/10\n💰 $${cost.toFixed(3)}`,
    true
  );
}

export async function alertJobFailed(name, error, retryCount) {
  await sendAlert(
    `❌ <b>Recipe Failed</b>\n📕 ${name}\n🔄 Retry: ${retryCount}\n⚠️ ${error?.slice(0, 200)}`
  );
}

export async function alertGateFailed(slug, issues) {
  const issueList = issues.slice(0, 5).map(i => `  G${i.gate}: ${i.field} — ${i.msg}`).join('\n');
  await sendAlert(
    `🔒 <b>Gate Check Failed</b>\n📙 ${slug}\n${issueList}`
  );
}

export async function alertDailySummary(stats) {
  await sendAlert(
    `📊 <b>RecipeOps Daily Summary</b>\n` +
    `✅ Done: ${stats.done || 0}\n` +
    `❌ Failed: ${stats.failed || 0}\n` +
    `🔄 Retrying: ${stats.retrying || 0}\n` +
    `⚠️ Review: ${stats.review || 0}\n` +
    `📦 Queued: ${stats.queued || 0}\n` +
    `💰 Cost: $${(stats.totalCost || 0).toFixed(2)}\n` +
    `📈 Total recipes: ${stats.totalRecipes || '?'}`
  );
}
