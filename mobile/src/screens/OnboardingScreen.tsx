import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface Step {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: 'wallet',
    iconBg: '#e0f2fe',
    iconColor: '#0a2f5b',
    title: 'Velkommen til PayWay',
    subtitle: 'Betaling til Føroyar',
    description:
      'Send penge, betal i butikker og del regningen med venner — alt sammen fra én app.',
  },
  {
    icon: 'send',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    title: 'Send penge på sekunder',
    subtitle: 'Tryk, vælg, send',
    description:
      'Overfør penge til venner og familie med det samme. Vælg en kontakt eller indtast et beløb — pengene er fremme med det samme.',
  },
  {
    icon: 'qr-code',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    title: 'Scan og betal',
    subtitle: 'Hurtigt i butikken',
    description:
      'Scan en QR-kode hos enhver PayWay-butik og betal direkte fra din telefon. Ingen kontanter, ingen kort.',
  },
  {
    icon: 'at',
    iconBg: '#f3e8ff',
    iconColor: '#9333ea',
    title: 'Dit PayWay-Tag',
    subtitle: 'Del dit unikke tag',
    description:
      'Dit personlige @tag gør det nemt for andre at sende penge til dig. Del det med venner — ingen telefonnummer nødvendigt.',
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(index);
    },
    [],
  );

  const goNext = () => {
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = ({ item, index }: { item: Step; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const iconScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });
    const iconOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    const textTranslate = scrollX.interpolate({
      inputRange,
      outputRange: [40, 0, -40],
      extrapolate: 'clamp',
    });
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.illustrationArea}>
          <Animated.View
            style={[
              styles.iconCircle,
              { backgroundColor: item.iconBg, transform: [{ scale: iconScale }], opacity: iconOpacity },
            ]}
          >
            <Ionicons name={item.icon} size={64} color={item.iconColor} />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.textArea,
            { transform: [{ translateX: textTranslate }], opacity: textOpacity },
          ]}
        >
          <Text style={[styles.stepSubtitle, { color: C.accent }]}>{item.subtitle}</Text>
          <Text style={[styles.stepTitle, { color: C.text }]}>{item.title}</Text>
          <Text style={[styles.stepDescription, { color: C.textSecondary }]}>
            {item.description}
          </Text>
        </Animated.View>
      </View>
    );
  };

  const isLast = currentIndex === STEPS.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              setCurrentIndex(currentIndex - 1);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={C.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={[styles.headerCounter, { color: C.textLight }]}>
          {currentIndex + 1} / {STEPS.length}
        </Text>
        <TouchableOpacity onPress={onComplete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.skipText, { color: C.textSecondary }]}>Spring over</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        renderItem={renderStep}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity, backgroundColor: C.accent },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: C.accent }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {isLast ? 'Kom i gang' : 'Næste'}
          </Text>
          <Ionicons
            name={isLast ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerCounter: {
    fontSize: 13,
    fontWeight: '600',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  illustrationArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    minHeight: height * 0.3,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.lg,
    maxHeight: height * 0.3,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
