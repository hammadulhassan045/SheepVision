import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import AppButton from '../components/AppButton';
import AuthBrandHeader from '../components/AuthBrandHeader';

const features = [
  {icon: 'qr-code-scanner', label: 'QR tracking'},
  {icon: 'monitor-heart', label: 'Health records'},
  {icon: 'trending-up', label: 'Growth insights'},
];

export default function OnboardingScreen({navigation}) {
  const finishOnboarding = route => navigation.navigate(route);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AuthBrandHeader />

        <ImageBackground
          source={require('../../assets/sheepvision-splash.png')}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={styles.hero}></ImageBackground>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>SMARTER CARE STARTS HERE</Text>
          <Text style={styles.title}>Track Every Sheep</Text>
          <Text style={styles.subtitle}>
            Scan QR codes, manage health, breeding, growth, feed and more, all
            in one place.
          </Text>
        </View>

        <View style={styles.features}>
          {features.map(feature => (
            <View key={feature.label} style={styles.feature}>
              <MaterialIcons name={feature.icon} size={20} color="#176B4B" />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Get Started"
            onPress={() => finishOnboarding('Register')}
            style={styles.primaryButton}
          />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => finishOnboarding('Login')}
            style={styles.loginAction}>
            <Text style={styles.loginText}>I already have an account</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#176B4B" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8F4',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
  },
  hero: {
    height: 252,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#DDEADF',
  },
  heroImage: {
    borderRadius: 20,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    margin: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F7FFF4',
  },
  imageBadgeText: {
    color: '#176B4B',
    fontSize: 12,
    fontWeight: '700',
  },
  copy: {
    paddingTop: 22,
  },
  eyebrow: {
    color: '#4E8068',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#183D2F',
    fontSize: 29,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#566C60',
    fontSize: 14,
    lineHeight: 21,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 19,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DDE9DE',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureLabel: {
    color: '#2C5743',
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 18,
  },
  pageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  activePage: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#176B4B',
  },
  pageLabel: {
    color: '#6B8274',
    fontSize: 11,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 56,
  },
  loginAction: {
    minHeight: 48,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  loginText: {
    color: '#176B4B',
    fontSize: 14,
    fontWeight: '700',
  },
});
