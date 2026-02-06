'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShippingTracker } from '@/components/ecommerce/shipping-tracker';
import { FulfillmentStatus } from '@/components/ecommerce/fulfillment-status';
import { TransportationMap } from '@/components/ecommerce/transportation-map';
import { LogisticsMetrics } from '@/components/ecommerce/logistics-metrics';
import { Truck, Package, MapPin, Zap } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Shipping & Logistics</h1>
          <p className="text-muted-foreground mt-2">Real-time shipment tracking and fulfillment management</p>
        </div>

        <LogisticsMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Tabs defaultValue="tracking">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tracking" className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Tracking
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Live Map
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tracking" className="space-y-4 mt-6">
                  <ShippingTracker />
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <TransportationMap />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div>
            <FulfillmentStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
