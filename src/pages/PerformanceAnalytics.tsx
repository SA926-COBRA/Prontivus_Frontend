import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  TrendingDownIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { ModernCard, GradientButton, AnimatedCounter, ProgressRing, StatusIndicator, LoadingSpinner } from '../components/ui/ModernComponents';
import { biAnalyticsApiService, ClinicalMetric, PerformanceComparison, MetricValue } from '../lib/biAnalyticsApi';

interface PerformanceAnalyticsProps {
  className?: string;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ className = '' }) => {
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  // Fetch clinical KPIs
  const { data: clinicalKPIs, isLoading: kpisLoading } = useQuery({
    queryKey: ['clinical-kpis'],
    queryFn: () => biAnalyticsApiService.getClinicalKPIs(),
  });

  // Fetch financial KPIs
  const { data: financialKPIs, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-kpis'],
    queryFn: () => biAnalyticsApiService.getFinancialKPIs(),
  });

  // Fetch operational KPIs
  const { data: operationalKPIs, isLoading: operationalLoading } = useQuery({
    queryKey: ['operational-kpis'],
    queryFn: () => biAnalyticsApiService.getOperationalKPIs(),
  });

  // Fetch quality KPIs
  const { data: qualityKPIs, isLoading: qualityLoading } = useQuery({
    queryKey: ['quality-kpis'],
    queryFn: () => biAnalyticsApiService.getQualityKPIs(),
  });

  // Fetch performance comparison for selected metric
  const { data: performanceComparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ['performance-comparison', selectedMetric],
    queryFn: () => selectedMetric ? biAnalyticsApiService.getPerformanceComparison(selectedMetric) : null,
    enabled: !!selectedMetric,
  });

  // Fetch metric trend for selected metric
  const { data: metricTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['metric-trend', selectedMetric, selectedTimeframe],
    queryFn: () => selectedMetric ? biAnalyticsApiService.getMetricTrend(
      selectedMetric, 
      selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90
    ) : null,
    enabled: !!selectedMetric,
  });

  // Fetch metric values for selected metric
  const { data: metricValues, isLoading: valuesLoading } = useQuery({
    queryKey: ['metric-values', selectedMetric],
    queryFn: () => selectedMetric ? biAnalyticsApiService.getMetricValues({ metric_id: selectedMetric, limit: 50 }) : null,
    enabled: !!selectedMetric,
  });

  // Calculate metric mutation
  const calculateMetricMutation = useMutation({
    mutationFn: (metricId: number) => {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90) * 24 * 60 * 60 * 1000);
      
      return biAnalyticsApiService.calculateMetric({
        metric_id: metricId,
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-values', selectedMetric] });
      queryClient.invalidateQueries({ queryKey: ['metric-trend', selectedMetric] });
      queryClient.invalidateQueries({ queryKey: ['performance-comparison', selectedMetric] });
    },
  });

  const handleCalculateMetric = (metricId: number) => {
    calculateMetricMutation.mutate(metricId);
  };

  const getKPIsByCategory = () => {
    switch (selectedCategory) {
      case 'clinical':
        return clinicalKPIs || [];
      case 'financial':
        return financialKPIs || [];
      case 'operational':
        return operationalKPIs || [];
      case 'quality':
        return qualityKPIs || [];
      default:
        return [
          ...(clinicalKPIs || []),
          ...(financialKPIs || []),
          ...(operationalKPIs || []),
          ...(qualityKPIs || [])
        ];
    }
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'needs_improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'currency') {
      return `$${value.toLocaleString()}`;
    } else if (unit === 'minutes') {
      return `${value.toFixed(0)} min`;
    } else if (unit === 'days') {
      return `${value.toFixed(1)} days`;
    } else {
      return value.toFixed(2);
    }
  };

  if (kpisLoading || financialLoading || operationalLoading || qualityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const kpis = getKPIsByCategory();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600">Monitor and analyze key performance indicators</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="clinical">Clinical</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="quality">Quality</option>
          </select>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <ModernCard
            key={kpi.id}
            className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedMetric === kpi.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedMetric(kpi.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{kpi.metric_name}</h3>
              <StatusIndicator 
                status={kpi.status === 'active' ? 'success' : 'warning'} 
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target</span>
                <span className="font-medium text-gray-900">
                  {kpi.target_value ? formatValue(kpi.target_value, kpi.unit) : 'N/A'}
                </span>
              </div>
              
              {kpi.threshold_warning && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Warning</span>
                  <span className="font-medium text-yellow-600">
                    {formatValue(kpi.threshold_warning, kpi.unit)}
                  </span>
                </div>
              )}
              
              {kpi.threshold_critical && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical</span>
                  <span className="font-medium text-red-600">
                    {formatValue(kpi.threshold_critical, kpi.unit)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCalculateMetric(kpi.id);
                }}
                disabled={calculateMetricMutation.isPending}
                className="w-full text-sm"
              >
                {calculateMetricMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Calculate'
                )}
              </GradientButton>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Selected Metric Details */}
      {selectedMetric && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Comparison */}
          {performanceComparison && (
            <ModernCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Comparison</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getPerformanceStatusColor(performanceComparison.status)}`}>
                  {performanceComparison.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatValue(performanceComparison.current_value)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target Value</span>
                  <span className="font-medium text-gray-900">
                    {formatValue(performanceComparison.target_value)}
                  </span>
                </div>
                
                {performanceComparison.industry_average && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Industry Average</span>
                    <span className="font-medium text-gray-900">
                      {formatValue(performanceComparison.industry_average)}
                    </span>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Performance Score</span>
                    <span className="font-bold text-lg text-gray-900">
                      {Math.round(performanceComparison.performance_score)}%
                    </span>
                  </div>
                  <ProgressRing
                    value={performanceComparison.performance_score}
                    size={120}
                    strokeWidth={8}
                    className="mx-auto"
                  />
                </div>
              </div>
            </ModernCard>
          )}

          {/* Metric Trend */}
          {metricTrend && (
            <ModernCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metricTrend.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(metricTrend.trend)}`}>
                    {metricTrend.change > 0 ? '+' : ''}{metricTrend.change}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trend Direction</span>
                  <span className={`font-medium capitalize ${getTrendColor(metricTrend.trend)}`}>
                    {metricTrend.trend}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Change</span>
                  <span className={`font-medium ${getTrendColor(metricTrend.trend)}`}>
                    {metricTrend.change > 0 ? '+' : ''}{metricTrend.change}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Points</span>
                  <span className="font-medium text-gray-900">
                    {metricTrend.values?.length || 0}
                  </span>
                </div>
                
                {metricTrend.values && metricTrend.values.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Values</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {metricTrend.values.slice(-5).map((value: MetricValue, index: number) => (
                        <div key={value.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {new Date(value.period_start).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatValue(value.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ModernCard>
          )}
        </div>
      )}

      {/* Metric Values Chart */}
      {selectedMetric && metricValues && metricValues.length > 0 && (
        <ModernCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historical Values</h3>
          
          <div className="space-y-4">
            {metricValues.slice(0, 10).map((value) => (
              <div key={value.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(value.period_start).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {value.period_type} • {new Date(value.calculated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatValue(value.value)}
                  </p>
                  {value.confidence_score && (
                    <p className="text-xs text-gray-600">
                      {Math.round(value.confidence_score * 100)}% confidence
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      )}

      {/* No Metric Selected */}
      {!selectedMetric && (
        <ModernCard className="p-12 text-center">
          <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Metric</h3>
          <p className="text-gray-600">
            Choose a metric from the grid above to view detailed performance analysis and trends.
          </p>
        </ModernCard>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
