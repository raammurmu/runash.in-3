'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveStreamPlayer } from '@/components/ecommerce/live-stream-player';
import { VideoOnDemand } from '@/components/ecommerce/video-on-demand';
import { ShortsCarousel } from '@/components/ecommerce/shorts-carousel';
import { ClipsLibrary } from '@/components/ecommerce/clips-library';
import { Tv, Film, Zap, Scissors } from 'lucide-react';

export default function WatchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Watch & Shop</h1>
          <p className="text-muted-foreground mt-2">Live streams, videos, and exclusive content</p>
        </div>

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live" className="gap-2">
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="vod" className="gap-2">
              <Film className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="shorts" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Shorts</span>
            </TabsTrigger>
            <TabsTrigger value="clips" className="gap-2">
              <Scissors className="h-4 w-4" />
              <span className="hidden sm:inline">Clips</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <LiveStreamPlayer />
          </TabsContent>

          <TabsContent value="vod" className="space-y-6">
            <VideoOnDemand />
          </TabsContent>

          <TabsContent value="shorts" className="space-y-6">
            <ShortsCarousel />
          </TabsContent>

          <TabsContent value="clips" className="space-y-6">
            <ClipsLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
