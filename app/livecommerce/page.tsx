'use client';

import { useState } from 'react';
import { ShoppingCart, Users, TrendingUp, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LiveCommercePage() {
  const [selectedStream, setSelectedStream] = useState<string | null>(null);

  const liveStreams = [
    {
      id: '1',
      title: 'Summer Collection Launch',
      viewers: 5243,
      products: 12,
      revenue: '$24,530',
      status: 'live',
      image: '/placeholder.jpg',
      host: 'Sarah Chen',
      duration: '1h 23m',
    },
    {
      id: '2',
      title: 'Tech Gadget Showcase',
      viewers: 3891,
      products: 8,
      revenue: '$18,920',
      status: 'live',
      image: '/placeholder.jpg',
      host: 'Marcus Johnson',
      duration: '45m',
    },
    {
      id: '3',
      title: 'Beauty & Wellness Haul',
      viewers: 2156,
      products: 15,
      revenue: '$12,340',
      status: 'live',
      image: '/placeholder.jpg',
      host: 'Emma Williams',
      duration: '32m',
    },
  ];

  const stats = [
    { label: 'Active Streams', value: '3', icon: Users, color: 'bg-orange-500' },
    { label: 'Total Viewers', value: '11.3K', icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Concurrent Orders', value: '847', icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Items Sold', value: '2,340', icon: Package, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Live Commerce Hub</h1>
          <p className="text-slate-400">Real-time shopping with integrated livestream commerce</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-slate-900 border-slate-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Live Streams Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Active Live Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <Card
                key={stream.id}
                onClick={() => setSelectedStream(stream.id)}
                className={`bg-slate-900 border-slate-800 overflow-hidden cursor-pointer transition-all hover:border-orange-500 ${
                  selectedStream === stream.id ? 'border-orange-500' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={stream.image || "/placeholder.svg"}
                    alt={stream.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-sm">
                      {stream.viewers.toLocaleString()} watching
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{stream.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{stream.duration} • {stream.host}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-orange-400">{stream.products} products</span>
                    <span className="text-sm font-semibold text-green-400">{stream.revenue}</span>
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    Watch & Shop
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Conversion Rate</span>
                <span className="font-semibold text-green-400">8.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Avg Order Value</span>
                <span className="font-semibold">$45.67</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cart Abandonment</span>
                <span className="font-semibold text-orange-400">12.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Customer Satisfaction</span>
                <span className="font-semibold text-blue-400">4.8/5</span>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">Revenue Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Today</span>
                  <span className="font-bold text-xl">$56,890</span>
                </div>
                <div className="w-full bg-slate-800 rounded h-2">
                  <div className="bg-orange-600 rounded h-2 w-3/4" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">This Week</span>
                  <span className="font-bold text-xl">$324,150</span>
                </div>
                <div className="w-full bg-slate-800 rounded h-2">
                  <div className="bg-green-600 rounded h-2 w-5/6" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
