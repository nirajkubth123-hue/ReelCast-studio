import { AbTestConfig, AbTestResultMetrics } from '../types';

/**
 * Simulates an authentic A/B test traffic split (default 50/50)
 * Evaluates linguistic triggers (hooks, question marks, emojis, length)
 * to generate randomized yet realistic variance in views, likes, shares, and engagement.
 */
export function generateAbTestSimulation(
  abTest: AbTestConfig,
  baseViews = 16000,
  baseReach = 13500
): AbTestResultMetrics {
  const capA = abTest.captionA || '';
  const capB = abTest.captionB || '';

  // Heuristic weights for realistic score variance
  let scoreA = 50;
  let scoreB = 50;

  // Variant A characteristics
  if (capA.includes('?') || capA.toLowerCase().includes('what') || capA.toLowerCase().includes('why')) scoreA += 10;
  if (/[\u{1F300}-\u{1F6FF}]/u.test(capA)) scoreA += 5;
  if (capA.length > 40 && capA.length < 280) scoreA += 8; // Optimal short reel caption length
  if (capA.toLowerCase().includes('pov') || capA.toLowerCase().includes('secret') || capA.toLowerCase().includes('stop')) scoreA += 12;

  // Variant B characteristics
  if (capB.includes('?') || capB.toLowerCase().includes('what') || capB.toLowerCase().includes('why')) scoreB += 10;
  if (/[\u{1F300}-\u{1F6FF}]/u.test(capB)) scoreB += 5;
  if (capB.length > 40 && capB.length < 280) scoreB += 8;
  if (capB.toLowerCase().includes('pov') || capB.toLowerCase().includes('secret') || capB.toLowerCase().includes('stop')) scoreB += 12;

  // Inject healthy pseudo-random variation (±18%)
  const randomFactorA = 0.85 + Math.random() * 0.3;
  const randomFactorB = 0.85 + Math.random() * 0.3;

  const finalScoreA = scoreA * randomFactorA;
  const finalScoreB = scoreB * randomFactorB;

  const totalScore = finalScoreA + finalScoreB;
  const shareA = finalScoreA / totalScore;
  const shareB = finalScoreB / totalScore;

  // Traffic split (50% base traffic pool per test arm)
  const trafficShareA = (abTest.splitPercentage || 50) / 100;
  const trafficShareB = 1 - trafficShareA;

  // Metric calculation with variant performance multiplier
  const multA = shareA * 2;
  const multB = shareB * 2;

  const viewsA = Math.round(baseViews * trafficShareA * (0.9 + multA * 0.1));
  const reachA = Math.round(baseReach * trafficShareA * (0.9 + multA * 0.1));
  const likesA = Math.round(viewsA * (0.075 + (shareA * 0.05)));
  const commentsA = Math.round(viewsA * (0.008 + (shareA * 0.007)));
  const sharesA = Math.round(viewsA * (0.015 + (shareA * 0.012)));
  const engRateA = Number(((likesA + commentsA + sharesA) / (viewsA || 1) * 100).toFixed(1));
  const avgWatchA = Number((78 + shareA * 18).toFixed(1));

  const viewsB = Math.round(baseViews * trafficShareB * (0.9 + multB * 0.1));
  const reachB = Math.round(baseReach * trafficShareB * (0.9 + multB * 0.1));
  const likesB = Math.round(viewsB * (0.075 + (shareB * 0.05)));
  const commentsB = Math.round(viewsB * (0.008 + (shareB * 0.007)));
  const sharesB = Math.round(viewsB * (0.015 + (shareB * 0.012)));
  const engRateB = Number(((likesB + commentsB + sharesB) / (viewsB || 1) * 100).toFixed(1));
  const avgWatchB = Number((78 + shareB * 18).toFixed(1));

  let winningVariant: 'A' | 'B' | 'tie' = 'tie';
  let diffPercent = 0;
  let keyDifferentiator = 'Equal audience engagement';

  if (engRateA > engRateB * 1.03) {
    winningVariant = 'A';
    diffPercent = Math.round(((engRateA - engRateB) / engRateB) * 100);
    keyDifferentiator = capA.includes('?') 
      ? 'Intriguing question hook sparked 2.4x higher comment discussion'
      : 'Direct curiosity hook improved retention and bookmark shares';
  } else if (engRateB > engRateA * 1.03) {
    winningVariant = 'B';
    diffPercent = Math.round(((engRateB - engRateA) / engRateA) * 100);
    keyDifferentiator = capB.includes('?')
      ? 'Interactive question prompt generated significantly more comments'
      : 'Punchy emotional framing drove stronger share-to-friend ratios';
  } else {
    diffPercent = 2;
    keyDifferentiator = 'Both captions performed almost identically with steady algorithmic feed distribution';
  }

  const confidenceScore = Math.min(99, Math.max(82, 85 + Math.floor(Math.abs(diffPercent) * 0.4)));

  return {
    variantA: {
      label: 'Variant A (Control)',
      caption: capA,
      reach: reachA,
      views: viewsA,
      likes: likesA,
      comments: commentsA,
      shares: sharesA,
      engagementRate: engRateA,
      avgWatchPercentage: avgWatchA
    },
    variantB: {
      label: 'Variant B (Challenger)',
      caption: capB,
      reach: reachB,
      views: viewsB,
      likes: likesB,
      comments: commentsB,
      shares: sharesB,
      engagementRate: engRateB,
      avgWatchPercentage: avgWatchB
    },
    winningVariant,
    confidenceScore,
    winningDifferencePercent: diffPercent,
    keyDifferentiator
  };
}
