import * as LocalAuthentication from 'expo-local-authentication';

export async function getBiometricLabel(): Promise<string> {
  const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  }
  if (supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Empreinte';
  }
  if (supported.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Biometrie';
  }
  return 'Biometrie';
}

export async function canUseBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Annuler',
    disableDeviceFallback: false,
  });
  return result.success;
}
