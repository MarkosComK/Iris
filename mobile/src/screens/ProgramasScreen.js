import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useFonts, CormorantGaramond_300Light, CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { DMMono_300Light } from '@expo-google-fonts/dm-mono';
import { ref, push, update, remove, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { colors } from '../lib/theme';

export default function ProgramasScreen() {
  const [ideas, setIdeas] = useState([]);
  const [input, setInput] = useState('');

  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    DMMono_300Light,
  });

  useEffect(() => {
    const ideasRef = ref(db, 'date-ideas');
    return onValue(ideasRef, snapshot => {
      const data = snapshot.val() || {};
      const list = Object.entries(data)
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setIdeas(list);
    });
  }, []);

  function addIdea() {
    const val = input.trim();
    if (!val) return;
    push(ref(db, 'date-ideas'), { text: val, done: false, createdAt: Date.now() });
    setInput('');
  }

  function toggle(idea) {
    update(ref(db, 'date-ideas/' + idea.key), { done: !idea.done });
  }

  function deleteIdea(idea) {
    Alert.alert('Remover', `Remover "${idea.text}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remove(ref(db, 'date-ideas/' + idea.key)) },
    ]);
  }

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.label}>programas · lista colaborativa</Text>
          <Text style={s.h1}>Programas pra{'\n'}<Text style={s.h1Em}>gente fazer</Text></Text>
          <Text style={s.subtitle}>Adicione ideias de programas e aventuras. Marque os que já fizemos juntos.</Text>
        </View>

        <View style={s.formRow}>
          <TextInput
            style={s.input}
            placeholder="uma nova ideia de programa..."
            placeholderTextColor={colors.hint}
            value={input}
            onChangeText={setInput}
            maxLength={120}
            onSubmitEditing={addIdea}
            returnKeyType="done"
          />
          <TouchableOpacity style={s.addBtn} onPress={addIdea} activeOpacity={0.7}>
            <Text style={s.addBtnText}>add</Text>
          </TouchableOpacity>
        </View>

        {ideas.length === 0 ? (
          <Text style={s.empty}>nenhuma ideia ainda · adicione a primeira</Text>
        ) : (
          ideas.map(idea => (
            <TouchableOpacity
              key={idea.key}
              style={[s.item, idea.done && s.itemDone]}
              onPress={() => toggle(idea)}
              onLongPress={() => deleteIdea(idea)}
              activeOpacity={0.7}
            >
              <View style={[s.check, idea.done && s.checkDone]}>
                {idea.done && <Text style={s.checkMark}>✓</Text>}
              </View>
              <Text style={[s.itemText, idea.done && s.itemTextDone]}>{idea.text}</Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={s.hint}>segure para remover uma ideia</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: colors.bg },
  scroll:     { padding: 24, paddingBottom: 48 },

  header:     { marginBottom: 24 },
  label:      { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  h1:         { fontFamily: 'CormorantGaramond_300Light', fontSize: 32, color: colors.text, lineHeight: 36 },
  h1Em:       { fontFamily: 'CormorantGaramond_300Light', color: colors.tealLight },
  subtitle:   { fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.muted, lineHeight: 20, marginTop: 10 },

  formRow:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input:      { flex: 1, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 10, fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.text },
  addBtn:     { backgroundColor: colors.tealBg, borderWidth: 0.5, borderColor: colors.tealBorder, borderRadius: 6, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, color: colors.tealLight, textTransform: 'uppercase' },

  item:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 6, padding: 12, marginBottom: 6 },
  itemDone:   { backgroundColor: colors.tealBg, borderColor: colors.tealBorder },
  check:      { width: 22, height: 22, borderRadius: 11, borderWidth: 0.5, borderColor: colors.borderHover, alignItems: 'center', justifyContent: 'center' },
  checkDone:  { backgroundColor: colors.tealBg, borderColor: colors.teal },
  checkMark:  { fontFamily: 'DMMono_300Light', fontSize: 11, color: colors.tealLight },
  itemText:   { flex: 1, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.text },
  itemTextDone: { color: colors.muted, textDecorationLine: 'line-through' },

  empty:  { fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.hint, textAlign: 'center', paddingVertical: 24 },
  hint:   { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint, textAlign: 'center', marginTop: 16, letterSpacing: 1 },
});
