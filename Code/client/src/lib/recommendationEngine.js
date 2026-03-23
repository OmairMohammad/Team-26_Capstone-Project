export function assessAsset(asset) {
  let healthScore = asset.efficiencyScore;

  if (asset.recentFaults >= 3) healthScore -= 20;
  else if (asset.recentFaults >= 1) healthScore -= 8;

  if (asset.overdueDays > 30) healthScore -= 18;
  else if (asset.overdueDays > 7) healthScore -= 10;

  if (asset.vibration > 50) healthScore -= 12;
  else if (asset.vibration > 30) healthScore -= 6;

  if (asset.temperature > 110) healthScore -= 10;
  else if (asset.temperature > 100) healthScore -= 5;

  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  let riskLevel = 'Low';
  let recommendedAction = 'Continue Monitoring';

  if (healthScore < 50 || asset.recentFaults >= 4 || asset.overdueDays > 28) {
    riskLevel = 'High';
    recommendedAction = 'Service / Escalate';
  } else if (healthScore < 80 || asset.recentFaults >= 1 || asset.overdueDays > 7) {
    riskLevel = 'Medium';
    recommendedAction = 'Inspect / Tune / Clean';
  }

  const keyFactors = [
    asset.recentFaults > 0 ? `${asset.recentFaults} recent fault event(s)` : 'No recent faults recorded',
    asset.overdueDays > 0 ? `${asset.overdueDays} day(s) overdue for maintenance` : 'Maintenance is on schedule',
    `Efficiency score: ${asset.efficiencyScore}`,
    `Vibration reading: ${asset.vibration}`,
  ];

  const supportingNotes =
    riskLevel === 'High'
      ? 'Escalation recommended due to overdue maintenance, repeated faults, and high operating stress indicators.'
      : riskLevel === 'Medium'
      ? 'Advisory action recommended because selected indicators are outside the preferred operating range.'
      : 'Asset remains within expected condition thresholds. Continue monitoring and log any changes.';

  return {
    ...asset,
    healthScore,
    riskLevel,
    recommendedAction,
    keyFactors,
    supportingNotes,
    reviewStatus: riskLevel === 'High' ? 'Pending Escalation' : riskLevel === 'Medium' ? 'Pending Review' : 'Ready for Approval',
  };
}

export function getDashboardMetrics(assessedAssets) {
  const totalAssets = assessedAssets.length;
  const healthyAssets = assessedAssets.filter((item) => item.riskLevel === 'Low').length;
  const mediumRiskAssets = assessedAssets.filter((item) => item.riskLevel === 'Medium').length;
  const highRiskAssets = assessedAssets.filter((item) => item.riskLevel === 'High').length;
  const openRecommendations = assessedAssets.filter((item) => item.riskLevel !== 'Low').length;
  const pendingReview = assessedAssets.filter((item) => item.reviewStatus !== 'Approved').length;

  return [
    { label: 'Total Assets', value: totalAssets, helper: 'Tracked in selected fleet' },
    { label: 'Healthy Assets', value: healthyAssets, helper: 'Low-risk operating profile' },
    { label: 'Medium Risk Assets', value: mediumRiskAssets, helper: 'Require inspection or tuning' },
    { label: 'High Risk Assets', value: highRiskAssets, helper: 'Require service or escalation' },
    { label: 'Open Recommendations', value: openRecommendations, helper: 'Action output generated' },
    { label: 'Pending Review', value: pendingReview, helper: 'Awaiting human decision' },
  ];
}
