import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Modal,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, Pressable,
} from 'react-native';
import { useFonts, CormorantGaramond_300Light, CormorantGaramond_300Light_Italic, CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { DMMono_300Light } from '@expo-google-fonts/dm-mono';
import { ref, push, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { colors } from '../lib/theme';
import { notifyNewLetter } from '../lib/notifications';
import { myTokenKey } from '../../App';

const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function fmtDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function CartinhasScreen() {
  const [letters, setLetters] = useState([]);
  const [sender, setSender] = useState('Markos');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_300Light_Italic,
    CormorantGaramond_400Regular,
    DMMono_300Light,
  });

  useEffect(() => {
    return onValue(ref(db, 'letters'), snapshot => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setLetters(list);
    });
  }, []);

  function send() {
    const text = body.trim();
    if (!text) return;
    push(ref(db, 'letters'), { from: sender, body: text, createdAt: Date.now() });
    notifyNewLetter(myTokenKey.current, sender, text);
    setBody('');
  }

  function deleteLetter(letter) {
    Alert.alert('Apagar', 'Apagar esta cartinha para sempre?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => { remove(ref(db, 'letters/' + letter.key)); setSelected(null); } },
    ]);
  }

  if (!fontsLoaded) return null;

  const isMarkos = sender === 'Markos';
  const composeAccent = isMarkos
    ? { border: colors.goldBorder, focus: colors.gold, btnBg: colors.goldBg, btnBorder: colors.goldBorder, btnText: colors.goldLight }
    : { border: colors.roseBorder, focus: colors.rose, btnBg: colors.roseBg, btnBorder: colors.roseBorder, btnText: colors.roseLight };

  const modalAccent = selected
    ? (selected.from === 'Markos'
      ? { border: colors.goldBorder, line: colors.gold, from: colors.goldLight }
      : { border: colors.roseBorder, line: colors.rose, from: colors.roseLight })
    : {};

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.label}>cartinhas · palavras do coração</Text>
          <Text style={s.h1}>Cartas entre{'\n'}<Text style={s.h1Em}>nós</Text></Text>
          <Text style={s.subtitle}>Cada carta, uma lembrança guardada para sempre.</Text>
        </View>

        <View style={s.divider} />

        {/* Compose */}
        <Text style={s.sectionLabel}>escrever · enviar uma cartinha</Text>
        <Text style={[s.h2, { color: isMarkos ? colors.goldLight : colors.roseLight }]}>
          Escrever uma cartinha
        </Text>

        <View style={s.senderRow}>
          {['Markos', 'Iris'].map(name => {
            const active = sender === name;
            const isM = name === 'Markos';
            return (
              <TouchableOpacity
                key={name}
                style={[
                  s.senderBtn,
                  active && { backgroundColor: isM ? colors.goldBg : colors.roseBg, borderColor: isM ? colors.goldBorder : colors.roseBorder },
                ]}
                onPress={() => setSender(name)}
                activeOpacity={0.7}
              >
                <Text style={[s.senderBtnText, active && { color: isM ? colors.goldLight : colors.roseLight }]}>{name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.composeDate}>{todayStr()}</Text>
        <TextInput
          style={[s.composeArea, { borderColor: composeAccent.border }]}
          placeholder="Escreva sua cartinha aqui..."
          placeholderTextColor={colors.hint}
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={3000}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: composeAccent.btnBg, borderColor: composeAccent.btnBorder }]}
          onPress={send}
          activeOpacity={0.7}
        >
          <Text style={[s.sendBtnText, { color: composeAccent.btnText }]}>enviar ✉</Text>
        </TouchableOpacity>

        <View style={s.divider} />

        {/* Feed */}
        <Text style={s.sectionLabel}>todas as cartas · clique para ler</Text>
        <Text style={[s.h2, { color: colors.roseLight }]}>Todas as cartinhas</Text>

        {letters.length === 0 ? (
          <Text style={s.empty}>nenhuma cartinha ainda · seja o primeiro a escrever</Text>
        ) : (
          letters.map(letter => {
            const isM = letter.from === 'Markos';
            return (
              <TouchableOpacity
                key={letter.key}
                style={[s.feedItem, { backgroundColor: isM ? colors.goldBg : colors.roseBg, borderColor: isM ? colors.goldBorder : colors.roseBorder }]}
                onPress={() => setSelected(letter)}
                activeOpacity={0.75}
              >
                <View style={s.feedHeader}>
                  <Text style={[s.feedFrom, { color: isM ? colors.goldLight : colors.roseLight }]}>{letter.from}</Text>
                  <Text style={s.feedDate}>{fmtDate(letter.createdAt)}</Text>
                </View>
                <Text style={s.feedPreview} numberOfLines={2}>
                  {letter.body}
                </Text>
                <Text style={s.feedRead}>ler →</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Reading modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={s.overlay} onPress={() => setSelected(null)}>
          <Pressable style={[s.modal, { borderColor: modalAccent.border }]} onPress={() => {}}>
            <Text style={[s.modalFrom, { color: modalAccent.from }]}>de {selected?.from}</Text>
            <Text style={s.modalDate}>{selected && fmtDate(selected.createdAt)}</Text>
            <View style={[s.modalDivider, { backgroundColor: modalAccent.line }]} />
            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={s.modalBody}>{selected?.body}</Text>
            </ScrollView>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)} activeOpacity={0.7}>
                <Text style={s.closeBtnText}>fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteLetter(selected)} activeOpacity={0.7}>
                <Text style={s.deleteBtn}>apagar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: colors.bg },
  scroll:   { padding: 24, paddingBottom: 48 },

  header:   { marginBottom: 24 },
  label:    { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  h1:       { fontFamily: 'CormorantGaramond_300Light', fontSize: 32, color: colors.text, lineHeight: 36 },
  h1Em:     { fontFamily: 'CormorantGaramond_300Light_Italic', color: colors.roseLight },
  subtitle: { fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.muted, lineHeight: 20, marginTop: 10 },

  divider:       { height: 0.5, backgroundColor: colors.border, marginVertical: 32 },
  sectionLabel:  { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 6 },
  h2:            { fontFamily: 'CormorantGaramond_300Light', fontSize: 26, marginBottom: 16, lineHeight: 30 },

  senderRow:     { flexDirection: 'row', gap: 8, marginBottom: 14 },
  senderBtn:     { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 6, borderWidth: 0.5, borderColor: colors.border },
  senderBtnText: { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' },

  composeDate: { fontFamily: 'DMMono_300Light', fontSize: 10, color: colors.hint, letterSpacing: 1.2, marginBottom: 10 },
  composeArea: { backgroundColor: colors.surface, borderWidth: 0.5, borderRadius: 8, padding: 16, fontFamily: 'CormorantGaramond_300Light', fontSize: 17, color: colors.text, lineHeight: 30, minHeight: 200, marginBottom: 12 },

  sendBtn:     { borderWidth: 0.5, borderRadius: 6, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'flex-start' },
  sendBtnText: { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase' },

  feedItem:   { borderWidth: 0.5, borderRadius: 8, padding: 16, marginBottom: 8 },
  feedHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  feedFrom:   { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' },
  feedDate:   { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint, letterSpacing: 1 },
  feedPreview: { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 16, color: 'rgba(240,235,227,0.6)', lineHeight: 24 },
  feedRead:   { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint, textAlign: 'right', marginTop: 8, letterSpacing: 1 },

  empty:  { fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.hint, textAlign: 'center', paddingVertical: 24 },

  overlay:      { flex: 1, backgroundColor: 'rgba(10,8,6,0.88)', justifyContent: 'center', padding: 24 },
  modal:        { backgroundColor: colors.surface, borderWidth: 0.5, borderRadius: 12, padding: 28, maxHeight: '80%' },
  modalFrom:    { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 4 },
  modalDate:    { fontFamily: 'DMMono_300Light', fontSize: 10, color: colors.hint, letterSpacing: 1 },
  modalDivider: { width: 40, height: 0.5, marginVertical: 18 },
  modalScroll:  { maxHeight: 300 },
  modalBody:    { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 18, color: 'rgba(240,235,227,0.85)', lineHeight: 32 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 24 },
  closeBtn:     { borderWidth: 0.5, borderColor: colors.border, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 20 },
  closeBtnText: { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' },
  deleteBtn:    { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint, letterSpacing: 1 },
});
