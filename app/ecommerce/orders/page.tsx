'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderList } from '@/components/ecommerce/order-list';
import { OrderTracking } from '@/components/ecommerce/order-tracking';
import { OrderConfirmation } from '@/components/ecommerce/order-confirmation';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-2">Track and manage your purchases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: 'Active Orders', value: '2', color: 'from-blue-500/10 to-blue-600/10' },
            { icon: Clock, label: 'Processing', value: '1', color: 'from-yellow-500/10 to-yellow-600/10' },
            { icon: CheckCircle, label: 'Delivered', value: '12', color: 'from-green-500/10 to-green-600/10' },
            { icon: AlertCircle, label: 'Pending', value: '0', color: 'from-red-500/10 to-red-600/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className={`p-4 bg-gradient-to-br ${stat.color} border-border/40`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              <OrderList status="active" onSelectOrder={setSelectedOrder} />
            </TabsContent>

            <TabsContent value="processing" className="space-y-4 mt-6">
              <OrderList status="processing" onSelectOrder={setSelectedOrder} />
            </TabsContent>

            <TabsContent value="delivered" className="space-y-4 mt-6">
              <OrderList status="delivered" onSelectOrder={setSelectedOrder} />
            </TabsContent>
          </Tabs>
        </Card>

        {selectedOrder && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <OrderTracking orderId={selectedOrder} />
            </div>
            <div>
              <OrderConfirmation orderId={selectedOrder} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
