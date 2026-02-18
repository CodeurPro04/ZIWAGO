import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { healthCheck, mobileLogin } from '@/lib/api';

export default function VerificationScreen() {
  const router = useRouter();
  const { phone, countryCode, firstName, updateUserData } = useUserStore();
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, '');

  const submitVerification = async (pin: string[]) => {
    if (pin.join('').length !== 4) return;

    setLoading(true);
    try {
      await healthCheck();
      const login = await mobileLogin({
        phone: fullPhone,
        role: 'customer',
        name: firstName || 'Client',
      });

      updateUserData('backendCustomerId', login.user.id);
      updateUserData('walletBalance', login.user.wallet_balance ?? 0);
      updateUserData('phone', fullPhone);
      updateUserData('avatarUrl', login.user.avatar_url ?? '');

      router.replace('/onboarding/step2');
    } catch {
      Alert.alert('Connexion impossible', 'Le backend ne repond pas. Verifiez le serveur Laravel et l URL API.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && index === 3) {
      Keyboard.dismiss();
      setTimeout(() => {
        submitVerification(newCode);
      }, 150);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (!canResend) return;
    setCode(['', '', '', '']);
    setTimer(60);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayPhone = `${countryCode} ${phone}`.trim();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="message-text-outline" size={60} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Verification</Text>
          <Text style={styles.subtitle}>
            Entrez le code a 4 chiffres envoye au{`\n`}
            <Text style={styles.phoneNumber}>{displayPhone}</Text>
          </Text>

          <View style={styles.codeInputContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={[styles.codeBox, code[index] && styles.codeBoxFilled]}>
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={styles.codeInput}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={code[index]}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : null}

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Vous n avez pas recu le code ?</Text>
            <TouchableOpacity onPress={handleResendCode} disabled={!canResend} style={styles.resendButton}>
              <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
                {canResend ? 'Renvoyer le code' : `Renvoyer (${formatTime(timer)})`}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()} style={styles.changeNumberButton}>
            <Icon name="phone-refresh" size={20} color={Colors.primary} />
            <Text style={styles.changeNumberText}>Changer de numero de telephone</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: Colors.text,
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    color: Colors.text,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  resendButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    marginTop: 'auto',
  },
  changeNumberText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});
