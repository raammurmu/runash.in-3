export type PlatformTestStatus = "passed" | "failed";
export type PlatformTestDiagnosticStatus = "passed" | "failed" | "unknown";

export interface PlatformTestResult {
  status: PlatformTestStatus;
  success: boolean;
  message: string;
  actionableRemediation: string[];
  diagnostics: {
    network: PlatformTestDiagnosticStatus;
    auth: PlatformTestDiagnosticStatus;
    endpointReachability: PlatformTestDiagnosticStatus;
    latency: number | null;
  };
  checkedAt: string;
}
