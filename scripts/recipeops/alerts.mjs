/**
 * RecipeOps Telegram Alerts
 * Sends alerts on failures, daily summaries, and pipeline status
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendAlert(message, silent = false) {
  if (!BOT_TOKEN) {
    console.log(`[ALERT] ${message}`);
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
