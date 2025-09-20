import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';
import { generateChartData, formatNumber } from '../../utils/leetcodeHelpers';

const StatsChart = ({ stats, profile }) => {
  if (!stats) return null;

  const pieData = generateChartData(stats);
  const barData = [
    { name: 'Easy', solved: stats.easy, color: '#10b981' },
    { name: 'Medium', solved: stats.medium, color: '#f59e0b' },
    { name: 'Hard', solved: stats.hard, color: '#ef4444' },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} problems ({((data.value / stats.totalSolved) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} problems solved
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Problem Solving Statistics
        </h2>
        <div className="text-sm text-gray-500">
          Total: {formatNumber(stats.totalSolved)} problems
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Distribution
          </h3>
          
          {stats.totalSolved > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No problems solved yet</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex justify-center space-x-4 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Progress by Difficulty
          </h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="solved" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Solve Rate</p>
              <p className="text-2xl font-bold text-green-900">{stats.solveRate}%</p>
            </div>
            <div className="p-2 bg-green-200 rounded-full">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            {stats.totalSolved} / {stats.totalSubmissions} problems
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Average Difficulty</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalSolved > 0 
                  ? ((stats.medium * 2 + stats.hard * 3 + stats.easy * 1) / stats.totalSolved).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="p-2 bg-blue-200 rounded-full">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            1.0 = Easy, 2.0 = Medium, 3.0 = Hard
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Hard Problems</p>
              <p className="text-2xl font-bold text-purple-900">{stats.hardRate}%</p>
            </div>
            <div className="p-2 bg-purple-200 rounded-full">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-purple-600">
            {stats.hard} hard problems solved
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;