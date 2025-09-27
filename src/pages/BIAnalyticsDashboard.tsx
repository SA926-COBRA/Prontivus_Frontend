import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CogIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { biAnalyticsApiService, BIInsightsSummary, DataQualitySummary, ClinicalMetric, MetricAlert, AnalyticsInsight } from '../lib/biAnalyticsApi';

interface BIAnalyticsDashboardProps {
  className?: string;
}

const BIAnalyticsDashboard: React.FC<BIAnalyticsDashboardProps> = ({ className = '' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch BI insights summary
  const { data: insightsSummary, isLoading: insightsLoading } = useQuery({
    queryKey: ['bi-insights-summary'],
    queryFn: () => biAnalyticsApiService.getBIInsightsSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch data quality summary
  const { data: qualitySummary, isLoading: qualityLoading } = useQuery({
    queryKey: ['data-quality-summary'],
    queryFn: () => biAnalyticsApiService.getDataQualitySummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch clinical KPIs
  const { data: clinicalKPIs, isLoading: kpisLoading } = useQuery({
    queryKey: ['clinical-kpis'],
    queryFn: () => biAnalyticsApiService.getClinicalKPIs(),
  });

  // Fetch active alerts
  const { data: activeAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: () => biAnalyticsApiService.getActiveAlerts(),
    refetchInterval: 60000, // 1 minute
  });

  // Fetch high impact insights
  const { data: highImpactInsights, isLoading: insightsHighLoading } = useQuery({
    queryKey: ['high-impact-insights'],
    queryFn: () => biAnalyticsApiService.getHighImpactInsights(),
  });

  // Fetch recent insights
  const { data: recentInsights, isLoading: recentInsightsLoading } = useQuery({
    queryKey: ['recent-insights', selectedTimeframe],
    queryFn: () => biAnalyticsApiService.getRecentInsights(
      selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
    ),
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: number) => biAnalyticsApiService.acknowledgeMetricAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
    },
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: number) => biAnalyticsApiService.resolveMetricAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
    },
  });

  // Review insight mutation
  const reviewInsightMutation = useMutation({
    mutationFn: ({ insightId, status, actionTaken }: { insightId: number; status: string; actionTaken?: string }) =>
      biAnalyticsApiService.reviewAnalyticsInsight(insightId, status, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['high-impact-insights'] });
      queryClient.invalidateQueries({ queryKey: ['recent-insights'] });
    },
  });

  const handleAcknowledgeAlert = (alertId: number) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleResolveAlert = (alertId: number) => {
    resolveAlertMutation.mutate(alertId);
  };

  const handleReviewInsight = (insightId: number, status: string) => {
    reviewInsightMutation.mutate({ insightId, status });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-blue-500" />;
      case 'anomaly':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'recommendation':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'prediction':
        return <ClockIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <EyeIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (insightsLoading || qualityLoading || kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and performance insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <GradientButton
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['bi-insights-summary'] });
              queryClient.invalidateQueries({ queryKey: ['data-quality-summary'] });
              queryClient.invalidateQueries({ queryKey: ['clinical-kpis'] });
              queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
            }}
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </GradientButton>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Insights */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Insights</p>
              <AnimatedCounter
                value={insightsSummary?.total_insights || 0}
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <EyeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-600 font-medium">
                {insightsSummary?.high_impact_insights || 0} high impact
              </span>
              <span className="mx-2">•</span>
              <span>{insightsSummary?.unread_insights || 0} unread</span>
            </div>
          </div>
        </ModernCard>

        {/* Data Quality Score */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Quality</p>
              <div className="flex items-center gap-2 mt-1">
                <AnimatedCounter
                  value={Math.round((qualitySummary?.overall_quality_score || 0) * 100)}
                  className="text-2xl font-bold text-gray-900"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
            <ProgressRing
              value={(qualitySummary?.overall_quality_score || 0) * 100}
              size={48}
              strokeWidth={4}
              className="text-green-500"
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>{qualitySummary?.checks_performed || 0} checks</span>
              <span className="mx-2">•</span>
              <span className="text-red-600">{qualitySummary?.issues_found || 0} issues</span>
            </div>
          </div>
        </ModernCard>

        {/* Active Alerts */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <AnimatedCounter
                value={activeAlerts?.length || 0}
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-red-600 font-medium">
                {activeAlerts?.filter(alert => alert.alert_type === 'critical').length || 0} critical
              </span>
              <span className="mx-2">•</span>
              <span>{activeAlerts?.filter(alert => alert.alert_type === 'warning').length || 0} warnings</span>
            </div>
          </div>
        </ModernCard>

        {/* Clinical KPIs */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clinical KPIs</p>
              <AnimatedCounter
                value={clinicalKPIs?.length || 0}
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-green-600 font-medium">
                {clinicalKPIs?.filter(kpi => kpi.status === 'active').length || 0} active
              </span>
              <span className="mx-2">•</span>
              <span>{clinicalKPIs?.filter(kpi => kpi.is_system_metric).length || 0} system</span>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            <StatusIndicator status="warning" />
          </div>
          
          {alertsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : activeAlerts && activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertTypeColor(alert.alert_type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Current: {alert.current_value} | Threshold: {alert.threshold_breached}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.triggered_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        disabled={acknowledgeAlertMutation.isPending}
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        disabled={resolveAlertMutation.isPending}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No active alerts</p>
            </div>
          )}
        </ModernCard>

        {/* High Impact Insights */}
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">High Impact Insights</h3>
            <StatusIndicator status="info" />
          </div>
          
          {insightsHighLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : highImpactInsights && highImpactInsights.length > 0 ? (
            <div className="space-y-3">
              {highImpactInsights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.insight_type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{insight.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact_level)}`}>
                          {insight.impact_level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReviewInsight(insight.id, 'reviewed')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Mark as reviewed"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReviewInsight(insight.id, 'dismissed')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Dismiss"
                      >
                        <CogIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <EyeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No high impact insights</p>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Insights by Category */}
      {insightsSummary && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(insightsSummary.insights_by_category).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <AnimatedCounter
                    value={count}
                    className="text-2xl font-bold text-gray-900"
                  />
                  <p className="text-sm text-gray-600 capitalize mt-1">{category}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Recent Insights */}
      {recentInsights && recentInsights.length > 0 && (
        <ModernCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Insights</h3>
            <span className="text-sm text-gray-500">
              Last {selectedTimeframe === '7d' ? '7' : selectedTimeframe === '30d' ? '30' : '90'} days
            </span>
          </div>
          
          <div className="space-y-3">
            {recentInsights.slice(0, 10).map((insight) => (
              <div
                key={insight.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(insight.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round(insight.confidence * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}
    </div>
  );
};

export default BIAnalyticsDashboard;
