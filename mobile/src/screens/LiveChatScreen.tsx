import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '../utils/constants';
import { useColors } from '../utils/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const QUICK_REPLIES = [
  'Hvordan sender jeg penge?',
  'Hvad koster det?',
  'Jeg har et problem med min betaling',
  'Hvordan sletter jeg min konto?',
];

const BOT_RESPONSES: Record<string, string> = {
  'hvordan sender jeg penge': 'For at sende penge:\n\n1. Tryk "Send" på forsiden\n2. Indtast modtagerens @PayWay-Tag eller telefonnummer\n3. Indtast beløbet\n4. Tilføj en valgfri besked\n5. Bekræft med PIN eller Face ID\n\nDe første 10 overførsler pr. måned er gratis!',
  'hvad koster det': 'Payway har følgende priser:\n\n• P2P-overførsler: Gratis (de første 10/md), herefter 0,5%\n• Butiksbetalinger: Gratis for dig\n• Optankning via kort: Op til 5% gebyr\n• Udbetaling til bank: 5,00 DKK\n\nSe "Vilkår & Betingelser" for fuld prisoversigt.',
  'problem med min betaling': 'Beklager at høre det! For at hjælpe dig bedst:\n\n1. Tjek din transaktionshistorik under "Overførsler"\n2. Sørg for at du har nok saldo\n3. Prøv at genstarte appen\n\nHvis problemet fortsætter, beskriv venligst hvad der skete, og jeg vil forsøge at hjælpe dig videre.',
  'hvordan sletter jeg min konto': 'Du kan slette din konto direkte i appen:\n\n1. Gå til Profil\n2. Scroll ned til "Kontosletning"\n3. Tryk "Slet min konto"\n4. Læs konsekvenserne\n5. Skriv SLET for at bekræfte\n\nDin resterende saldo udbetales til din bankkonto inden for 5 hverdage.',
  'hej': 'Hej! 👋 Velkommen til PayWay Support. Hvordan kan jeg hjælpe dig i dag?',
  'tak': 'Selv tak! Glad for at kunne hjælpe. Er der andet jeg kan hjælpe med? 😊',
};

function findBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const [key, response] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(key)) return response;
  }

  if (lower.includes('send') || lower.includes('overfør')) return BOT_RESPONSES['hvordan sender jeg penge'];
  if (lower.includes('pris') || lower.includes('gebyr') || lower.includes('kost')) return BOT_RESPONSES['hvad koster det'];
  if (lower.includes('slet') || lower.includes('fjern') || lower.includes('luk konto')) return BOT_RESPONSES['hvordan sletter jeg min konto'];
  if (lower.includes('fejl') || lower.includes('virker ikke') || lower.includes('problem')) return BOT_RESPONSES['problem med min betaling'];
  if (lower.includes('wallet') || lower.includes('saldo') || lower.includes('optank') || lower.includes('fyld op')) {
    return 'For at fylde op på din wallet:\n\n1. Tryk "Fyld op" på forsiden\n2. Indtast beløbet (min. 50 DKK)\n3. Bekræft med dit betalingskort\n\nMaks wallet-saldo er 10.000 DKK.';
  }
  if (lower.includes('pin') || lower.includes('kode')) {
    return 'Du kan ændre din PIN under:\n\nProfil → Skift PIN\n\nIndtast din nuværende PIN og vælg en ny 4-cifret kode.';
  }
  if (lower.includes('biometr') || lower.includes('face id') || lower.includes('finger')) {
    return 'Du kan aktivere biometri (Face ID / Touch ID) under:\n\nProfil → Biometri\n\nDette gør det hurtigere at godkende betalinger.';
  }
  if (lower.includes('kort') || lower.includes('visa') || lower.includes('mastercard')) {
    return 'Du kan administrere dine betalingskort under:\n\nProfil → Betalingskort\n\nVi accepterer Visa og Mastercard.';
  }
  if (lower.includes('kyc') || lower.includes('verifi')) {
    return 'KYC-verifikation giver dig højere transaktionsgrænser:\n\n• Tier 1 (basis): Op til 5.000 DKK/dag\n• Tier 2 (fuld): Op til 10.000 DKK/dag\n\nGå til Profil → KYC Verifikation for at komme i gang.';
  }
  if (lower.includes('tag') || lower.includes('payway-tag') || lower.includes('brugernavn')) {
    return 'Dit PayWay-Tag er dit unikke brugernavn. Du kan opsætte eller ændre det under:\n\nProfil → Rediger profil\n\nDit tag bruges når andre sender penge til dig, f.eks. @dittagher.';
  }
  if (lower.includes('gruppe') || lower.includes('split') || lower.includes('del')) {
    return 'Du kan oprette grupper til at dele udgifter:\n\n1. Gå til "Overførsler" → "Grupper"\n2. Tryk + for at oprette en ny gruppe\n3. Tilføj medlemmer via deres PayWay-Tag\n4. Vælg fordeling (lige eller procent)\n5. Tilføj udgifter løbende\n\nGruppen holder styr på hvem der skylder hvad.';
  }

  return 'Tak for din besked! Jeg er ikke helt sikker på, hvad du mener. Prøv at stille dit spørgsmål på en anden måde, eller vælg en af de hurtige emner nedenfor.\n\nDu kan også kontakte os på support@payway.fo.';
}

export function LiveChatScreen() {
  const C = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hej! 👋 Jeg er PayWays AI-assistent. Jeg kan hjælpe dig med spørgsmål om din konto, betalinger, gebyrer og meget mere.\n\nHvad kan jeg hjælpe dig med?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        text: findBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: C.primary }]}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: C.primary }]
            : [styles.bubbleBot, { backgroundColor: C.surface, borderColor: C.borderLight }],
        ]}>
          <Text style={[styles.bubbleText, { color: C.text }, isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
          <Text style={[styles.timestamp, { color: C.textLight }, isUser && styles.timestampUser]}>
            {item.timestamp.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <View style={[styles.botAvatar, { backgroundColor: C.primary }]}>
                <Ionicons name="sparkles" size={16} color="#fff" />
              </View>
              <View style={[styles.typingBubble, { backgroundColor: C.surface, borderColor: C.borderLight }]}>
                <ActivityIndicator size="small" color={C.primary} />
                <Text style={[styles.typingText, { color: C.textLight }]}>Skriver...</Text>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Replies */}
      {messages.length <= 1 && (
        <View style={styles.quickReplies}>
          {QUICK_REPLIES.map((q, i) => (
            <TouchableOpacity key={i} style={[styles.quickReply, { backgroundColor: C.surface, borderColor: C.primary }]} onPress={() => sendMessage(q)}>
              <Text style={[styles.quickReplyText, { color: C.primary }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: C.surface, borderTopColor: C.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text }]}
          value={input}
          onChangeText={setInput}
          placeholder="Skriv en besked..."
          placeholderTextColor={C.textLight}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage(input)}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: C.primary }, !input.trim() && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatList: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  msgRowUser: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: SPACING.md,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.5)',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
  },
  typingText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  quickReply: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    letterSpacing: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
