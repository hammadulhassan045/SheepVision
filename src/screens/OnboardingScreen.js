import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';

import AppButton from '../components/AppButton';

const features = [
  {
    icon: 'qrcode-scan',
    title: 'QR Tracking',
    description: 'Identify every sheep',
  },
  {
    icon: 'heart-pulse',
    title: 'Health Records',
    description: 'Keep care organized',
  },
  {
    icon: 'chart-line',
    title: 'Growth Insights',
    description: 'Monitor flock progress',
  },
];

export default function OnboardingScreen({navigation}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8F4" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>INTELLIGENT FLOCK MANAGEMENT</Text>
          </View>

          <Text style={styles.title}>
            Better care.
            {'\n'}
            <Text style={styles.titleAccent}>Healthier flocks</Text>
          </Text>

          <Text style={styles.subtitle}>
            Everything you need to manage your sheep farm, all in one simple
            place.
          </Text>
        </View>

        <View style={styles.heroContainer}>
          <ImageBackground
            source={require('../../assets/sheepvision-splash.png')}
            resizeMode="cover"
            imageStyle={styles.heroImage}
            style={styles.hero}>
            <View style={styles.heroOverlay}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={15}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.heroBottom}>
                <Text style={styles.heroHeading}>
                  Smarter farming
                  {'\n'}
                  starts with every sheep.
                </Text>
                <Text style={styles.heroCaption}>Track • Record • Improve</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.heroAccent} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Everything in one place</Text>
          <Text style={styles.sectionCaption}>BUILT FOR YOUR FLOCK</Text>
        </View>

        <View style={styles.features}>
          {features.map(feature => (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons
                  name={feature.icon}
                  size={22}
                  color="#176B4B"
                />
              </View>

              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <AppButton
            title="Get Started"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Log in to your existing account"
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
            style={styles.loginAction}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <Text style={styles.loginText}>Log in</Text>
            <MaterialIcons name="arrow-forward" size={17} color="#176B4B" />
          </TouchableOpacity>

          <Text style={styles.footerNote}>MADE FOR BETTER SHEEP FARMING</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F4',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 14,
  },
  intro: {
    marginBottom: 19,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E5F1E7',
    marginBottom: 13,
    gap: 7,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#24845B',
  },
  eyebrowText: {
    color: '#286447',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#173D2D',
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  titleAccent: {
    color: '#238258',
  },
  subtitle: {
    color: '#627368',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 320,
  },
  heroContainer: {
    position: 'relative',
    marginBottom: 27,
  },
  hero: {
    height: 218,
    overflow: 'hidden',
    borderRadius: 23,
    backgroundColor: '#315D45',
  },
  heroImage: {
    borderRadius: 23,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 17,
    backgroundColor: 'rgba(9, 38, 25, 0.38)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(12, 43, 28, 0.76)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroBottom: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  heroHeading: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  heroCaption: {
    color: '#E3F2E7',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  heroAccent: {
    position: 'absolute',
    bottom: -5,
    left: 24,
    right: 24,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#D7E9D9',
    zIndex: -1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#234734',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionCaption: {
    color: '#7B9282',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  features: {
    flexDirection: 'row',
    gap: 9,
  },
  featureCard: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 12,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EEE6',
  },
  featureIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF4EB',
    marginBottom: 10,
  },
  featureTitle: {
    color: '#234734',
    fontSize: 11,
    fontWeight: '800',
  },
  featureDescription: {
    color: '#78877C',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 23,
  },
  primaryButton: {
    minHeight: 55,
  },
  loginAction: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 5,
  },
  loginPrompt: {
    color: '#687A6E',
    fontSize: 12,
  },
  loginText: {
    color: '#176B4B',
    fontSize: 13,
    fontWeight: '800',
  },
  footerNote: {
    textAlign: 'center',
    color: '#94A397',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 5,
  },
});
