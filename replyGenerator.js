/**
 * Tempo Reply Generator
 * 
 * Generates Tempo-specific reply templates with AlphaUSD references
 * and Tempo explorer links.
 */

const EXPLORER_URL = 'https://explore.tempo.xyz';

const GRANT_TEMPLATES = [
  "Transfer confirmed on Tempo. AlphaUSD delivered instantly",
  "Grant processed on Tempo. Check your balance",
  "Payment complete. Your AlphaUSD just landed via Tempo",
  "Done on Tempo. Funds in your wallet now",
  "Tempo delivery complete. AlphaUSD transferred",
  "Grant sent on Tempo testnet. Zero fees, instant settlement",
  "AlphaUSD delivered. Powered by Tempo's native fee sponsorship",
  "Tempo grant processed. Your testnet funds are ready",
];

const P2P_TEMPLATES = [
  "Sent on Tempo. AlphaUSD transferred successfully",
  "Payment complete on Tempo. Recipient notified",
  "Transfer done. AlphaUSD moved via Tempo network",
  "Processed on Tempo. Payment delivered instantly",
  "Tempo transfer confirmed. Zero gas fees",
  "P2P complete on Tempo. AlphaUSD in recipient's wallet",
];

const ERROR_TEMPLATES = [
  "Transfer couldn't be processed right now. Try again shortly",
  "Something went wrong on our end. We're looking into it",
];

// Memory to avoid duplicate replies
const recentReplies = [];
const MAX_MEMORY = 50;

function getRandomTemplate(templates) {
  // Try to find one not recently used
  for (let i = 0; i < 5; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const similarity = recentReplies.some(r => {
      const words1 = r.split(' ');
      const words2 = template.split(' ');
      const common = words1.filter(w => words2.includes(w)).length;
      return common / Math.max(words1.length, words2.length) > 0.7;
    });
    if (!similarity) {
      recentReplies.push(template);
      if (recentReplies.length > MAX_MEMORY) recentReplies.shift();
      return template;
    }
  }
  // Fallback
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function generateReply(tx) {
  try {
    const templates = tx.type === 'grant' ? GRANT_TEMPLATES : P2P_TEMPLATES;
    let reply = getRandomTemplate(templates);

    // Add amount if available
    if (tx.amount) {
      reply += ` ($${parseFloat(tx.amount).toFixed(2)} αUSD)`;
    }

    // Add recipient tag
    if (tx.recipient_pay_tag) {
      reply += `. monitag: ${tx.recipient_pay_tag}`;
    }

    // Add explorer link
    if (tx.tx_hash && !tx.tx_hash.startsWith('skip_') && !tx.tx_hash.startsWith('failed_')) {
      reply += `\n🔗 ${EXPLORER_URL}/tx/${tx.tx_hash}`;
    }

    // Add unique suffix to prevent duplicate detection
    const uniqueSuffix = ` ⚡${Date.now().toString(36).slice(-4)}`;
    reply += uniqueSuffix;

    return reply;
  } catch (error) {
    console.error('Reply generation error:', error.message);
    return getRandomTemplate(ERROR_TEMPLATES);
  }
}
