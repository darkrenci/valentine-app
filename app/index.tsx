import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { Stack } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

/* ✍️ LETTER CONTENT */
const LETTER_TEXT =
  "You are my favorite place to be.\nThis gift carries all the love I couldn’t put into words 💖";

const diceResults = [
  'Give me a hug 🤗',
  'Send me a sweet message 💬',
  'Plan our next date 🍽️',
  'Tell me why you love me 💖',
  'Surprise me later 🎁',
  'Take a cute selfie for me 📸',
];

const COLORS = [
  '#ff4d6d',
  '#ff758f',
  '#ffb3c1',
  '#ffd6e0',
  '#ff8fab',
  '#ffc6ff',
  '#ffd166',
];

const CONFETTI_COUNT = 45;
const HEARTS = ['💔', '💗', '💖', '💘', '❤️'];

export default function Index() {


  const [step, setStep] = useState(0);
  const [resultText, setResultText] = useState('');
  const [tapCount, setTapCount] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [spinCount, setSpinCount] = useState(0);
  const [slotFinished, setSlotFinished] = useState(false);
  const [flashType, setFlashType] = useState<'none' | 'win' | 'almost'>('none');
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [envelopeStage, setEnvelopeStage] = useState<'closed' | 'open' | 'letter'>('closed');
  const [flapBehind, setFlapBehind] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [yesScaleValue, setYesScaleValue] = useState(1);


  const lidAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const letterAnim = useRef(new Animated.Value(0)).current;
  const heartBeat = useRef(new Animated.Value(1)).current;

  const slot1 = useRef(new Animated.Value(0)).current;
  const slot2 = useRef(new Animated.Value(0)).current;
  const slot3 = useRef(new Animated.Value(0)).current;

  const envelopeFlap = useRef(new Animated.Value(0)).current;
  const envelopeLetter = useRef(new Animated.Value(0)).current;
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const envelopeScale = useRef(new Animated.Value(1)).current;
  const letterFade = useRef(new Animated.Value(0)).current;
  const letterSlide = useRef(new Animated.Value(40)).current;
  const flapAnim = useRef(new Animated.Value(0)).current;

  const yesScale = useRef(new Animated.Value(1)).current;

  const heartsFloat = useRef(
  Array.from({ length: 10 }).map(() => ({
    x: new Animated.Value(Math.random() * 260 - 130),
    y: new Animated.Value(80 + Math.random() * 180),
    opacity: new Animated.Value(0.25 + Math.random() * 0.35),
    scale: new Animated.Value(0.8 + Math.random() * 0.8),
  }))
).current;

const dodgeNo = () => {
  // Move NO button randomly
  const randomX = Math.random() * 200 - 100;
  const randomY = Math.random() * 150 - 75;
  setNoPos({ x: randomX, y: randomY });

  // Increase YES scale (state-driven)
  const nextScale = Math.min(yesScaleValue + 0.2, 2.2);
  setYesScaleValue(nextScale);

  Animated.spring(yesScale, {
    toValue: nextScale,
    useNativeDriver: true,
  }).start();
};

  const [fontsLoaded] = useFonts({
    Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading your love letter… 💖</Text>
      </View>
    );
  }

useEffect(() => {
  // simple floating hearts loop
  heartsFloat.forEach((h, i) => {
    const loop = () => {
      h.y.setValue(120 + Math.random() * 180);
      Animated.parallel([
        Animated.timing(h.y, {
          toValue: -120,
          duration: 4500 + i * 150,
          useNativeDriver: true,
        }),
        Animated.timing(h.opacity, {
          toValue: 0,
          duration: 4500 + i * 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        h.opacity.setValue(0.25 + Math.random() * 0.35);
        loop();
      });
    };
    loop();
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const burstHearts = useRef(
  Array.from({ length: 16 }).map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
  }))
).current;

  const typingIntervalRef = useRef<any>(null);

  /* ✍️ TYPEWRITER */
  useEffect(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    if (tapCount === 10) {
      let index = 0;
      setTypedText('');

      typingIntervalRef.current = setInterval(() => {
        if (index < LETTER_TEXT.length) {
          setTypedText(prev => prev + LETTER_TEXT.charAt(index));
          index++;
        } else {
          clearInterval(typingIntervalRef.current);
        }
      }, 40);
    }
  }, [tapCount]);



  const openEnvelope = () => {

  if (envelopeStage !== 'closed') return;

  setEnvelopeStage('open');
  setFlapBehind(true); 

  Animated.parallel([ 
    Animated.timing(envelopeFlap, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }),
    Animated.timing(flapAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }),

    Animated.timing(envelopeLetter, {
      toValue: -120,
      duration: 600,
      useNativeDriver: true,
    }),
  ]).start(() => {
    setFlapBehind(true);
    // ⏳ short pause before full letter
    setTimeout(() => {
      setEnvelopeStage('letter');

      Animated.parallel([
        Animated.timing(envelopeScale, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(letterFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(letterSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  });
};

  // 💓 HEART BEAT
  const startHeartBeat = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, {
          toValue: 1.25,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartBeat, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // 🎁 Gift tap
  const tapGift = () => {
    if (tapCount >= 10) return;
    setTapCount(t => t + 1);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    if (tapCount === 9) {
      Animated.parallel([
        Animated.timing(lidAnim, { toValue: -90, duration: 500, useNativeDriver: true }),
        Animated.timing(letterAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start(startHeartBeat);
    }
  };

  // ❤️ SLOT MACHINE (REALISTIC LOGIC)
const spinHearts = () => {
  setSlotFinished(false);

  const nextSpin = spinCount + 1;
  setSpinCount(nextSpin);

  const isWin = nextSpin % 5 === 0;

  // helper to get random heart index
  const randomIndex = () =>
    Math.floor(Math.random() * HEARTS.length);

  // decide final indices
  let final1: number;
  let final2: number;
  let final3: number;

  if (isWin) {
    // ✅ SAME HEART FOR ALL
    const winIndex = randomIndex();
    final1 = winIndex;
    final2 = winIndex;
    final3 = winIndex;
  } else {
    // ❌ RANDOM HEARTS (DIFFERENT)
    final1 = randomIndex();
    final2 = randomIndex();
    final3 = randomIndex();
  }

  const spin = (anim: Animated.Value, delay: number) =>
    Animated.timing(anim, {
      toValue: -HEARTS.length * 60,
      duration: 1000 + delay,
      useNativeDriver: true,
    });

  Animated.stagger(200, [
    spin(slot1, 0),
    spin(slot2, 200),
    spin(slot3, 400),
  ]).start(() => {
    slot1.setValue(-final1 * 60);
    slot2.setValue(-final2 * 60);
    slot3.setValue(-final3 * 60);

    if (isWin) {
    setResultText(
      diceResults[Math.floor(Math.random() * diceResults.length)]
    );
    setSlotFinished(true);
    setSpinCount(0);
    triggerHeartBurst(); // 💥 HEART CONFETTI
  }
  });
};

const triggerHeartBurst = () => {
  setShowHeartBurst(true);

  burstHearts.forEach(h => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 80;

    h.x.setValue(0);
    h.y.setValue(0);
    h.scale.setValue(1);
    h.opacity.setValue(1);

    Animated.parallel([
      Animated.timing(h.x, {
        toValue: Math.cos(angle) * distance,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(h.y, {
        toValue: Math.sin(angle) * distance,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(h.scale, {
        toValue: 1.8,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(h.opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  });

  setTimeout(() => setShowHeartBurst(false), 800);
};


  const letterTranslate = letterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, -70],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <View style={styles.card}>

          {showHeartBurst && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {burstHearts.map((h, i) => (
              <Animated.Text
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  fontSize: 28,
                  opacity: h.opacity,
                  transform: [
                    { translateX: h.x },
                    { translateY: h.y },
                    { scale: h.scale },
                  ],
                }}
              >
                {HEARTS[Math.floor(Math.random() * HEARTS.length)]}
              </Animated.Text>
            ))}
          </View>
        )}

          {step === 0 && (
            <>
              <Text style={styles.title}>A Gift for You</Text>

              {/* 💓 BEATING HEART (ADDED) */}
              {tapCount >= 10 && (
                <Animated.Text
                  style={[
                    styles.beatingHeart,
                    { transform: [{ scale: heartBeat }] },
                  ]}
                >
                  ❤️
                </Animated.Text>
              )}

              <Pressable onPress={tapGift}>
                <Animated.View style={[styles.giftWrapper, { transform: [{ scale: scaleAnim }] }]}>
                  {tapCount >= 10 && (
                    <Animated.View
                      style={[
                        styles.letter,
                        { opacity: letterAnim, transform: [{ translateY: letterTranslate }] },
                      ]}
                    >
                      <Text style={styles.letterText}>{typedText}</Text>
                    </Animated.View>
                  )}

                  <Animated.View style={[styles.lid, { transform: [{ translateY: lidAnim }] }]}>
                    <View style={styles.bowCenter} />
                  </Animated.View>

                  <View style={styles.box}>
                    <View style={styles.ribbonVertical} />
                    <View style={styles.ribbonHorizontal} />
                  </View>
                </Animated.View>
              </Pressable>

              {tapCount >= 10 && (
                <Pressable style={styles.bigButton} onPress={() => setStep(1)}>
                  <Text style={styles.buttonText}>Continue ❤️</Text>
                </Pressable>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <Text style={styles.title}>❤️ Heart Slot ❤️</Text>

              <View style={styles.slotRow}>
                {[slot1, slot2, slot3].map((slot, i) => (
                  <View key={i} style={styles.slotWindow}>
                    <Animated.View style={{ transform: [{ translateY: slot }] }}>
                      {HEARTS.map((h, idx) => (
                        <Text key={idx} style={styles.slotHeart}>{h}</Text>
                      ))}
                    </Animated.View>
                  </View>
                ))}
              </View>

              {!slotFinished ? (
                <Pressable style={styles.bigButton} onPress={spinHearts}>
                  <Text style={styles.buttonText}>Spin 💘</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.bigButton} onPress={() => setStep(2)}>
                  <Text style={styles.buttonText}>Reveal 💖</Text>
                </Pressable>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* 📩 ENVELOPE STAGE */}
              {envelopeStage !== 'letter' && (
                <>
                  <Pressable onPress={openEnvelope}>
                    <View style={styles.envelopeWrapper}>

                      {/* LETTER PEEK */}
                      <Animated.View
                        style={[
                          styles.envelopeLetter,
                          { transform: [{ translateY: envelopeLetter }] },
                        ]}
                      >
                        <Text style={styles.envelopeLetterText}>
                          My Dearest Love 💖{'\n\n'}
                          This little envelope holds a piece of my heart.
                        </Text>
                      </Animated.View>

                      {/* ENVELOPE BODY */}
                      {/* BACK PANEL */}
                      <View style={styles.envelopeBack} />

                   
          
                      {/* FLAP */}
                     <Animated.View
                        style={[
                          styles.envelopeFlap,
                          flapBehind && { zIndex: 0 },
                          {
                            transform: [
                              { perspective: 1200 },

                              // ⬆️ move upward
                              {
                                translateY: envelopeFlap.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, -70],
                                }),
                              },

                              // 🔁 flip backward (away from camera)
                              {
                                rotateX: envelopeFlap.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '180deg'],
                                }),
                              },

                              // 🔙 fake depth (move backward)
                              {
                                scale: envelopeFlap.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [1, 0.85], // 👈 smaller = farther back
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                  </Pressable>

                  <Text style={styles.result}>{resultText}</Text>
                </>
              )}

              {/* 📄 FULL LETTER STAGE */}
              {envelopeStage === 'letter' && (
                <Animated.View
                  style={[
                    styles.fullLetter,
                    {
                      opacity: letterFade,
                      transform: [{ translateY: letterSlide }],
                    },
                  ]}
                >
                  <Text style={styles.fullLetterTitle}>My Dearest Fay,</Text>

                  <Text style={styles.fullLetterText}>
                    I just wanted to take a moment to tell you how much you mean to me.
                    Being around you makes everything feel lighter, and every
                    conversation, laugh, and quiet moment we share is something I
                    truly treasure.{'\n\n'}
                    So before this day goes any further, I want you to know that
                    it would mean a lot to me to ask you this one question.
                  </Text>

                  <Pressable
                    style={styles.bigButton}
                    onPress={() => setStep(3)}
                  >
                    <Text style={styles.buttonText}>Continue ❤️</Text>
                  </Pressable>
                </Animated.View>
              )}
            </>
          )}


          {step === 3 && (
          <View style={styles.valentineScreen}>
            {/* floating hearts background */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {heartsFloat.map((h, i) => (
                <Animated.Text
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '60%',
                    fontSize: 22,
                    opacity: h.opacity,
                    transform: [
                      { translateX: h.x },
                      { translateY: h.y },
                      { scale: h.scale },
                    ],
                  }}
                >
                  💗
                </Animated.Text>
              ))}
            </View>

            <View style={styles.valentineCard}>
              <Text style={styles.valentineEyebrow}>A tiny question…</Text>
              <Text style={styles.valentineTitle}>Will you be my Valentine?</Text>
              <Text style={styles.valentineSub}>
                Choose wisely 😌💞
              </Text>

              <View style={{ height: 18 }} />

              {/* YES button grows */}
              <Animated.View style={{ transform: [{ scale: yesScale }] }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.valentineYes,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => setStep(4)}
                >
                  <Text style={styles.valentineBtnText}>YES ❤️</Text>
                </Pressable>
              </Animated.View>

              {/* NO button runs away */}
              <Animated.View
                style={{
                  marginTop: 14,
                  transform: [{ translateX: noPos.x }, { translateY: noPos.y }],
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.valentineNo,
                    pressed && { transform: [{ scale: 0.98 }] },
                  ]}
                   onPress={dodgeNo}
                  {...(Platform.OS === 'web' && { onHoverIn: dodgeNo })}
                >
                  <Text style={styles.valentineBtnText}>NO 💔</Text>
                </Pressable>
              </Animated.View>

              <View style={{ height: 10 }} />

              <Text style={styles.valentineHint}>
                (P.S. the “NO” button is shy…)
              </Text>
            </View>
          </View>
        )}

          {step === 4 && (
            <Text style={styles.final}>💖 Yay! 💖</Text>
          )}

        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 600, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#c9184a', marginBottom: 20 },

  beatingHeart: {
    position: 'absolute',
    top: -80,
    fontSize: 64,
    zIndex: 10,
  },

  giftWrapper: { alignItems: 'center', marginBottom: 20 },
  lid: { width: 220, height: 60, backgroundColor: '#ff5c8a', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  box: { width: 210, height: 160, backgroundColor: '#ff8fab', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  ribbonVertical: { position: 'absolute', width: 18, height: '100%', backgroundColor: '#fff', left: '50%', marginLeft: -9 },
  ribbonHorizontal: { position: 'absolute', height: 18, width: '100%', backgroundColor: '#fff', top: '50%', marginTop: -9 },
  bowCenter: { width: 28, height: 28, backgroundColor: '#fff', borderRadius: 14, alignSelf: 'center', marginTop: 16 },

  letter: { position: 'absolute', width: 260, padding: 20, backgroundColor: '#fffafc', borderRadius: 16, zIndex: 4, top: 20 },
  letterText: { textAlign: 'center', fontSize: 18, fontFamily: 'Pacifico' },

  slotRow: { flexDirection: 'row', marginBottom: 20 },
  slotWindow: { width: 60, height: 60, overflow: 'hidden', backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 8 },
  slotHeart: { fontSize: 42, height: 60, textAlign: 'center' },

  bigButton: { backgroundColor: '#ff758f', padding: 16, borderRadius: 10, marginTop: 10 },
  yesButton: { backgroundColor: '#38b000', padding: 16, borderRadius: 10, marginTop: 10 },
  noButton: { backgroundColor: '#d00000', padding: 16, borderRadius: 10, marginTop: 10 },

  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  result: { fontSize: 22, marginBottom: 20 },
  final: { fontSize: 30, fontWeight: 'bold', color: '#c9184a' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18 },

  envelopeWrapper: {
  width: 260,
  height: 180,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 30,
},

envelopeBack: {
  position: 'absolute',
  width: 260,
  height: 160,
  backgroundColor: '#c9184a',
  borderRadius: 16,
  zIndex: 1,
},


envelopeBottom: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: 0,
  height: 0,
  borderLeftWidth: 130,
  borderRightWidth: 130,
  borderTopWidth: 80,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#a4133c',
  zIndex: 3,
},  

envelopeFlap: {
  position: 'absolute',
  bottom: 88,
  left: 0,
  width: 0,
  height: 0,
  borderLeftWidth: 130,
  borderRightWidth: 130,
  borderTopWidth: 80,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#a4133c',
  zIndex: 4,
},

envelopeLetter: {
  position: 'absolute',
  width: 230,
  height: 140,
  backgroundColor: '#fffafc',
  borderRadius: 10,
  padding: 16,
  zIndex: 1,
  bottom: 20,
  alignItems: 'center',
  justifyContent: 'center',
},

envelopeLetterText: {
  textAlign: 'center',
  fontSize: 16,
  fontFamily: 'Pacifico',
  color: '#c9184a',
},

fullLetter: {
  width: '90%',
  maxWidth: 420,
  backgroundColor: '#fffaf0',
  borderRadius: 16,
  padding: 24,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 6,
},

fullLetterTitle: {
  fontSize: 22,
  fontFamily: 'Pacifico',
  color: '#8b0000',
  marginBottom: 12,
},

fullLetterText: {
  fontSize: 15,
  lineHeight: 22,
  textAlign: 'center',
  color: '#5a2a2a',
  marginBottom: 20,
},

valentineScreen: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
  paddingTop: 12,
},

valentineCard: {
  width: '100%',
  maxWidth: 420,
  backgroundColor: '#fff',
  borderRadius: 22,
  paddingVertical: 26,
  paddingHorizontal: 20,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 6,
},

valentineEyebrow: {
  fontSize: 13,
  color: '#c9184a',
  marginBottom: 8,
  fontWeight: '600',
  letterSpacing: 0.5,
},

valentineTitle: {
  fontSize: 26,
  color: '#c9184a',
  textAlign: 'center',
  fontWeight: '800',
},

valentineSub: {
  marginTop: 8,
  fontSize: 14,
  color: '#6b1b2f',
  textAlign: 'center',
},

valentineYes: {
  backgroundColor: '#ff4d6d',
  paddingVertical: 14,
  paddingHorizontal: 26,
  borderRadius: 999,
  minWidth: 220,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 4,
},

valentineNo: {
  backgroundColor: '#9d0208',
  paddingVertical: 14,
  paddingHorizontal: 26,
  borderRadius: 999,
  minWidth: 220,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.10,
  shadowRadius: 10,
  elevation: 3,
},

valentineBtnText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

valentineHint: {
  marginTop: 8,
  fontSize: 12,
  color: '#7a2a3c',
  opacity: 0.8,
},


});
