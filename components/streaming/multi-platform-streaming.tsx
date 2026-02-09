"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Plus,
  Share2,
  Zap,
  TrendingUp,
  Users,
  MessageSquare,
  Activity,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  MultiPlatformService,
  type StreamingPlatform,
  type PlatformAnalytics,
} from "@/lib/multi-platform-service";
import type { PlatformTestResult } from "@/lib/streaming-platform-test";
import { useToast } from "@/hooks/use-toast";

interface PlatformConnectionType {
  id: string;
  platform: string;
  name: string;
  streamKey: string;
  serverUrl?: string;
  isActive: boolean;
  isConnected: boolean;
}

interface MultiPlatformStreamingProps {
  isStreaming: boolean;
  onPlatformsChange?: (platforms: string[]) => void;
}

export default function MultiPlatformStreaming({
  isStreaming,
  onPlatformsChange,
}: MultiPlatformStreamingProps) {
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([]);
  const [analytics, setAnalytics] = useState<{
    [key: string]: PlatformAnalytics[];
  }>({});
  const [activeTab, setActiveTab] = useState("connections");
  const [loading, setLoading] = useState(true);
  const [testingConnections, setTestingConnections] = useState<Set<string>>(
    new Set(),
  );
  const [bandwidthOptimization, setBandwidthOptimization] = useState<any>(null);
  const [platformTestResults, setPlatformTestResults] = useState<
    Record<string, PlatformTestResult>
  >({});

  const multiPlatformService = MultiPlatformService.getInstance();
  const { toast } = useToast();

  useEffect(() => {
    loadPlatforms();
  }, []);

  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(loadAnalytics, 30000); // Update every 30 seconds
      loadAnalytics();
      return () => clearInterval(interval);
    }
  }, [isStreaming, platforms]);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const userPlatforms = await multiPlatformService.getUserPlatforms();
      setPlatforms(userPlatforms);

      // Notify parent of active platforms
      const activePlatformIds = userPlatforms
        .filter((p) => p.is_active)
        .map((p) => p.id);
      onPlatformsChange?.(activePlatformIds);
    } catch (error) {
      console.error("Failed to load platforms:", error);
      toast({
        title: "Error",
        description: "Failed to load streaming platforms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsPromises = platforms
        .filter((p) => p.is_active && isStreaming)
        .map(async (platform) => {
          const data = await multiPlatformService.getPlatformAnalytics(
            platform.id,
          );
          return { platformId: platform.id, data };
        });

      const results = await Promise.all(analyticsPromises);
      const analyticsMap = results.reduce(
        (acc, { platformId, data }) => {
          acc[platformId] = data;
          return acc;
        },
        {} as { [key: string]: PlatformAnalytics[] },
      );

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleTogglePlatform = async (platformId: string, active: boolean) => {
    try {
      setTestingConnections((prev) => new Set(prev).add(platformId));

      if (active) {
        // Test connection before activating
        const testResult =
          await multiPlatformService.testPlatformConnection(platformId);
        setPlatformTestResults((prev) => ({
          ...prev,
          [platformId]: testResult,
        }));

        if (!testResult.success) {
          toast({
            title: "Connection Failed",
            description: testResult.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        setPlatformTestResults((prev) => {
          const next = { ...prev };
          delete next[platformId];
          return next;
        });
      }

      await multiPlatformService.updatePlatform(platformId, {
        is_active: active,
      });
      setPlatforms((prev) =>
        prev.map((p) =>
          p.id === platformId ? { ...p, is_active: active } : p,
        ),
      );

      // Update parent
      const activePlatformIds = platforms
        .map((p) => (p.id === platformId ? { ...p, is_active: active } : p))
        .filter((p) => p.is_active)
        .map((p) => p.id);
      onPlatformsChange?.(activePlatformIds);

      toast({
        title: active ? "Platform Activated" : "Platform Deactivated",
        description: `${platforms.find((p) => p.id === platformId)?.name} is now ${active ? "active" : "inactive"}`,
      });
    } catch (error) {
      console.error("Failed to toggle platform:", error);
      toast({
        title: "Error",
        description: "Failed to update platform status",
        variant: "destructive",
      });
    } finally {
      setTestingConnections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  };

  const handleOptimizeBandwidth = async () => {
    try {
      const activePlatformIds = platforms
        .filter((p) => p.is_active)
        .map((p) => p.id);
      const optimization =
        await multiPlatformService.optimizeBandwidth(activePlatformIds);
      setBandwidthOptimization(optimization);

      toast({
        title: "Bandwidth Optimized",
        description: `Potential savings: ${optimization.optimization_savings} kbps`,
      });
    } catch (error) {
      console.error("Failed to optimize bandwidth:", error);
      toast({
        title: "Error",
        description: "Failed to optimize bandwidth",
        variant: "destructive",
      });
    }
  };

  const activePlatforms = platforms.filter((p) => p.is_active);
  const connectedPlatforms = platforms.filter((p) => p.is_connected);
  const totalEstimatedBandwidth = activePlatforms.reduce(
    (sum, platform) => sum + platform.settings.bitrate,
    0,
  );

  // Calculate aggregated analytics
  const aggregatedAnalytics = Object.values(analytics)
    .flat()
    .reduce(
      (acc, curr) => ({
        totalViewers: acc.totalViewers + curr.viewers,
        totalChatMessages: acc.totalChatMessages + curr.chat_messages,
        totalEngagement: acc.totalEngagement + curr.engagement_rate,
        averageStreamHealth: acc.averageStreamHealth, // Would need proper calculation
      }),
      {
        totalViewers: 0,
        totalChatMessages: 0,
        totalEngagement: 0,
        averageStreamHealth: "good",
      },
    );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Multi-Platform Streaming</h3>
          <p className="text-sm text-muted-foreground">
            {activePlatforms.length} active • {connectedPlatforms.length}{" "}
            connected
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleOptimizeBandwidth}
            disabled={activePlatforms.length === 0}
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimize
          </Button>
          <Button
            onClick={() => {}}
            className="bg-gradient-to-r from-orange-500 to-amber-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Platform
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      {isStreaming && activePlatforms.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Viewers</p>
                  <p className="text-xl font-bold">
                    {aggregatedAnalytics.totalViewers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Chat Messages</p>
                  <p className="text-xl font-bold">
                    {aggregatedAnalytics.totalChatMessages.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-xl font-bold">
                    {aggregatedAnalytics.totalEngagement.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Stream Health</p>
                  <p className="text-xl font-bold capitalize">
                    {aggregatedAnalytics.averageStreamHealth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bandwidth Warning */}
      {totalEstimatedBandwidth > 10000 && (
        <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            High bandwidth usage detected ({totalEstimatedBandwidth} kbps).
            Consider optimizing your stream settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          {platforms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Platforms Connected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Connect your streaming platforms to reach a wider audience
                  across multiple channels.
                </p>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Platform
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {platforms.map((platform) => (
                <Card key={platform.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white font-medium">
                          {platform.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium">{platform.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {platform.platform_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {platform.is_connected ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Wifi className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <WifiOff className="h-3 w-3 mr-1" />
                            Disconnected
                          </Badge>
                        )}
                        <Switch
                          checked={platform.is_active}
                          onCheckedChange={(checked) =>
                            handleTogglePlatform(platform.id, checked)
                          }
                          disabled={
                            testingConnections.has(platform.id) ||
                            !platform.is_connected
                          }
                        />
                      </div>
                    </div>

                    {testingConnections.has(platform.id) && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        Testing connection...
                      </div>
                    )}

                    {platformTestResults[platform.id] && (
                      <Alert
                        className={`mt-3 ${platformTestResults[platform.id].status === "passed" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="space-y-2">
                          <p className="font-medium">
                            {platformTestResults[platform.id].message}
                          </p>
                          <div className="text-xs">
                            Diagnostics: network{" "}
                            {
                              platformTestResults[platform.id].diagnostics
                                .network
                            }
                            , auth{" "}
                            {platformTestResults[platform.id].diagnostics.auth},
                            endpoint{" "}
                            {
                              platformTestResults[platform.id].diagnostics
                                .endpointReachability
                            }
                            , latency{" "}
                            {platformTestResults[platform.id].diagnostics
                              .latency ?? "n/a"}
                            ms
                          </div>
                          {platformTestResults[platform.id]
                            .actionableRemediation.length > 0 && (
                            <ul className="list-disc ml-4 text-xs space-y-1">
                              {platformTestResults[
                                platform.id
                              ].actionableRemediation.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ul>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {platform.is_active && analytics[platform.id] && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Viewers</p>
                            <p className="font-medium">
                              {analytics[platform.id][
                                analytics[platform.id].length - 1
                              ]?.viewers || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Chat</p>
                            <p className="font-medium">
                              {analytics[platform.id][
                                analytics[platform.id].length - 1
                              ]?.chat_messages || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Health</p>
                            <p className="font-medium capitalize">
                              {analytics[platform.id][
                                analytics[platform.id].length - 1
                              ]?.stream_health || "good"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Real-time analytics across all connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStreaming && activePlatforms.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Bandwidth Usage
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Required</span>
                          <span>{totalEstimatedBandwidth} kbps</span>
                        </div>
                        <Progress
                          value={Math.min(
                            (totalEstimatedBandwidth / 15000) * 100,
                            100,
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Platform Distribution
                      </h4>
                      <div className="space-y-1">
                        {activePlatforms.map((platform) => (
                          <div
                            key={platform.id}
                            className="flex justify-between text-sm"
                          >
                            <span>{platform.name}</span>
                            <span>{platform.settings.bitrate} kbps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activePlatforms.length === 0
                      ? "No active platforms to analyze"
                      : "Start streaming to see real-time analytics"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
              <CardDescription>
                Configure settings that apply to all platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Adaptive Bitrate</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust quality based on connection
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Relay</p>
                  <p className="text-sm text-muted-foreground">
                    Sync chat messages across all platforms
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Failover</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch to backup platforms if needed
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
