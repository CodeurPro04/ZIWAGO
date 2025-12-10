import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/hooks/useUserData';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function VerificationScreen() {
  const router = useRouter();
  const { phone } = useUserStore(); // Récupérer le numéro de téléphone
  const [code, setCode] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Compteur
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleCodeChange = (text: string, index: number) => {
    // Accepter seulement les chiffres
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus sur l'input suivant
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit quand tout est rempli
    if (newCode.every((digit) => digit !== '') && index === 3) {
      Keyboard.dismiss();
      setTimeout(() => {
        // Vérification du code ici
        router.push('/onboarding/step2');
      }, 300);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      // Logique pour renvoyer le code
      console.log('Code renvoyé');
      setCode(['', '', '', '']);
      setTimer(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formater le numéro de téléphone pour l'affichage
  const formatPhoneNumber = (phoneNumber: string) => {
    // Ajouter des espaces pour une meilleure lisibilité
    if (phoneNumber.length === 10) {
      return phoneNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phoneNumber;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* En-tête avec icône */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="message-text-outline" size={60} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Entrez le code à 4 chiffres envoyé au{'\n'}
            <Text style={styles.phoneNumber}>
              +225 {formatPhoneNumber(phone)}
            </Text>
          </Text>

          {/* Inputs du code */}
          <View style={styles.codeInputContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.codeBox,
                  code[index] && styles.codeBoxFilled,
                ]}
              >
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
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

          {/* Section renvoyer le code */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>
              Vous n'avez pas reçu le code ?
            </Text>
            <TouchableOpacity
              onPress={handleResendCode}
              disabled={!canResend}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  !canResend && styles.resendButtonTextDisabled,
                ]}
              >
                {canResend ? 'Renvoyer le code' : `Renvoyer (${formatTime(timer)})`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lien pour changer de numéro */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.changeNumberButton}
          >
            <Icon name="phone-refresh" size={20} color={Colors.primary} />
            <Text style={styles.changeNumberText}>
              Changer de numéro de téléphone
            </Text>
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
    marginBottom: Spacing.xxl,
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