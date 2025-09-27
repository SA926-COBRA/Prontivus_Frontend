import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LightBulbIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { biAnalyticsApiService, AnalyticsInsight, BIInsightsSummary } from '../lib/biAnalyticsApi';

interface AnalyticsInsightsProps {
  className?: string;
}

const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const queryClient = useQueryClient();

  // Fetch insights summary
  const { data: insightsSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['bi-insights-summary'],
    queryFn: () => biAnalyticsApiService.getBIInsightsSummary(),
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch analytics insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['analytics-insights', selectedCategory, selectedType, selectedStatus],
    queryFn: () => biAnalyticsApiService.getAnalyticsInsights({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      insight_type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      limit: 100,
    }),
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: () => biAnalyticsApiService.generateAnalyticsInsights({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      insight_type: selectedType !== 'all' ? selectedType : undefined,
      confidence_threshold: confidenceThreshold,
      data_period_days: selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-insights'] });
      queryClient.invalidateQueries({ queryKey: ['bi-insights-summary'] });
    },
  });

  // Review insight mutation
  const reviewInsightMutation = useMutation({
    mutationFn: ({ insightId, status, actionTaken }: { insightId: number; status: string; actionTaken?: string }) =>
      biAnalyticsApiService.reviewAnalyticsInsight(insightId, status, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-insights'] });
      queryClient.invalidateQueries({ queryKey: ['bi-insights-summary'] });
    },
  });

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate();
  };

  const handleReviewInsight = (insightId: number, status: string, actionTaken?: string) => {
    reviewInsightMutation.mutate({ insightId, status, actionTaken });
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
        return <LightBulbIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'reviewed':
        return 'text-green-600 bg-green-100';
      case 'dismissed':
        return 'text-gray-600 bg-gray-100';
      case 'implemented':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInsights = insights?.filter(insight => 
    insight.confidence_score >= confidenceThreshold
  ) || [];

  if (summaryLoading || insightsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics Insights</h1>
          <p className="text-gray-600">AI-powered insights and recommendations</p>
        </div>
        
        <GradientButton
          onClick={handleGenerateInsights}
          disabled={generateInsightsMutation.isPending}
          className="flex items-center gap-2"
        >
          {generateInsightsMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <SparklesIcon className="w-4 h-4" />
          )}
          Generate Insights
        </GradientButton>
      </div>

      {/* Summary Cards */}
      {insightsSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insights</p>
                <AnimatedCounter
                  value={insightsSummary.total_insights}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <LightBulbIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Impact</p>
                <AnimatedCounter
                  value={insightsSummary.high_impact_insights}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <AnimatedCounter
                  value={insightsSummary.unread_insights}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <EyeIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </ModernCard>

          <ModernCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent</p>
                <AnimatedCounter
                  value={insightsSummary.recent_insights.length}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {/* Filters */}
      <ModernCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="clinical">Clinical</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="quality">Quality</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="trend">Trend</option>
              <option value="anomaly">Anomaly</option>
              <option value="recommendation">Recommendation</option>
              <option value="prediction">Prediction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="implemented">Implemented</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confidence</label>
            <select
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0.5}>≥ 50%</option>
              <option value={0.6}>≥ 60%</option>
              <option value={0.7}>≥ 70%</option>
              <option value={0.8}>≥ 80%</option>
              <option value={0.9}>≥ 90%</option>
            </select>
          </div>
        </div>
      </ModernCard>

      {/* Insights by Type */}
      {insightsSummary && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(insightsSummary.insights_by_type).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <AnimatedCounter
                    value={count}
                    className="text-2xl font-bold text-gray-900"
                  />
                  <p className="text-sm text-gray-600 capitalize mt-1">{type}</p>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => (
            <ModernCard key={insight.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getInsightIcon(insight.insight_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact_level)}`}>
                        {insight.impact_level}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(insight.status)}`}>
                        {insight.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{insight.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Type: {insight.insight_type}</span>
                    <span>Category: {insight.category}</span>
                    <span className={`font-medium ${getConfidenceColor(insight.confidence_score)}`}>
                      Confidence: {Math.round(insight.confidence_score * 100)}%
                    </span>
                    <span>Generated: {new Date(insight.generated_at).toLocaleDateString()}</span>
                  </div>
                  
                  {insight.related_metrics && insight.related_metrics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-1">Related Metrics:</p>
                      <div className="flex flex-wrap gap-1">
                        {insight.related_metrics.map((metricId) => (
                          <span
                            key={metricId}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            Metric #{metricId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {insight.action_taken && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Action Taken:</p>
                      <p className="text-sm text-green-700">{insight.action_taken}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {insight.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleReviewInsight(insight.id, 'reviewed')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Mark as reviewed"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReviewInsight(insight.id, 'dismissed')}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Dismiss"
                        >
                          <CogIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {insight.status === 'reviewed' && (
                      <button
                        onClick={() => handleReviewInsight(insight.id, 'implemented')}
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Mark as implemented"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </ModernCard>
          ))
        ) : (
          <ModernCard className="p-12 text-center">
            <LightBulbIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Found</h3>
            <p className="text-gray-600 mb-4">
              No insights match your current filters. Try adjusting the filters or generate new insights.
            </p>
            <GradientButton onClick={handleGenerateInsights}>
              Generate Insights
            </GradientButton>
          </ModernCard>
        )}
      </div>

      {/* Recent Insights */}
      {insightsSummary && insightsSummary.recent_insights.length > 0 && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
          <div className="space-y-3">
            {insightsSummary.recent_insights.map((insight) => (
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

export default AnalyticsInsights;
