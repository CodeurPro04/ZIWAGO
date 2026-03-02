declare module 'expo-local-authentication' {
  export enum AuthenticationType {
    FINGERPRINT = 1,
    FACIAL_RECOGNITION = 2,
    IRIS = 3,
  }

  export type LocalAuthenticationResult =
    | { success: true }
    | { success: false; error?: string; warning?: string };

  export function supportedAuthenticationTypesAsync(): Promise<AuthenticationType[]>;
  export function hasHardwareAsync(): Promise<boolean>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options?: {
    promptMessage?: string;
    cancelLabel?: string;
    disableDeviceFallback?: boolean;
  }): Promise<LocalAuthenticationResult>;
}

