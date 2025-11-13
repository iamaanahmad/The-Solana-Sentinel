'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, AlertCircle, DollarSign, Activity, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    tierDistribution: { basic: 0, standard: 0, premium: 0 },
    totalAlerts: 0,
    revenue: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // Mock data for now - replace with actual API calls
    setStats({
      totalAnalyses: 1247,
      tierDistribution: { basic: 856, standard: 234, premium: 157 },
      totalAlerts: 89,
      revenue: 128.50,
      activeUsers: 342,
    });
  }, []);

  const tierData = [
    { name: 'Basic', value: stats.tierDistribution.basic, color: '#94a3b8' },
    { name: 'Standard', value: stats.tierDistribution.standard, color: '#3b82f6' },
    { name: 'Premium', value: stats.tierDistribution.premium, color: '#8b5cf6' },
  ];

  const usageData = [
    { date: 'Mon', analyses: 178, alerts: 12 },
    { date: 'Tue', analyses: 192, alerts: 15 },
    { date: 'Wed', analyses: 165, alerts: 8 },
    { date: 'Thu', analyses: 201, alerts: 18 },
    { date: 'Fri', analyses: 187, alerts: 14 },
    { date: 'Sat', analyses: 156, alerts: 11 },
    { date: 'Sun', analyses: 168, alerts: 11 },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 45.2 },
    { month: 'Feb', revenue: 58.7 },
    { month: 'Mar', revenue: 72.3 },
    { month: 'Apr', revenue: 89.5 },
    { month: 'May', revenue: 103.8 },
    { month: 'Jun', revenue: 128.5 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Activity className="h-10 w-10 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time insights into platform usage, revenue, and user behavior
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAnalyses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Alerts Triggered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalAlerts}</div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-500" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                Avg Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">67</div>
              <p className="text-xs text-muted-foreground mt-1">Across all tokens</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#94a3b8]" />
                  <span className="text-sm">Basic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-sm">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
                  <span className="text-sm">Premium</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="analyses" fill="#3b82f6" name="Analyses" />
                  <Bar dataKey="alerts" fill="#f59e0b" name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { token: 'EPjFWaLb...FbaJ', tier: 'premium', score: 85, time: '2 min ago' },
                { token: 'So11111...1112', tier: 'standard', score: 42, time: '5 min ago' },
                { token: '7vfCXTU...V8Qo', tier: 'basic', score: 78, time: '12 min ago' },
                { token: 'mSoLzY...x7rBx', tier: 'premium', score: 91, time: '18 min ago' },
                { token: '4k3Dyjz...zVXU', tier: 'standard', score: 55, time: '25 min ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-mono text-sm">{activity.token}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={activity.tier === 'premium' ? 'default' : 'secondary'}>
                      {activity.tier}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-semibold">Score: {activity.score}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.score > 75 ? 'Low Risk' : activity.score > 50 ? 'Medium' : 'High Risk'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
