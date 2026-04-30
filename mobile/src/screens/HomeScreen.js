import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  StyleSheet, Pressable, StatusBar,
} from 'react-native';
import { useFonts, CormorantGaramond_300Light, CormorantGaramond_300Light_Italic, CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { DMMono_300Light } from '@expo-google-fonts/dm-mono';
import { colors } from '../lib/theme';

const elements = [
  { num: 79, sym: 'Au', name: 'Ouro',         mass: '196.967 u',    color: 'gold', msg: 'Raro, precioso e eterno: assim como você. O ouro não enferruja, não some, não perde o brilho com o tempo.' },
  { num: 6,  sym: 'Di', name: 'Diamante',     mass: '3.513 g/cm³',  color: 'teal', msg: 'Formado sob pressão imensa, o material mais duro do mundo. Assim quero forjarei o que teremos.' },
  { num: 77, sym: 'Ro', name: 'Quartzo Rosa', mass: '2.648 g/cm³',  color: 'rose', msg: 'A pedra do amor incondicional. Dizem que quem carrega quartzo rosa perto do coração nunca anda sozinho. Eu acredito nisso.' },
  { num: 29, sym: 'Cu', name: 'Cobre',        mass: '63.546 u',     color: 'gold', msg: 'O cobre aquece tudo que toca e brilha com o tempo. Elemento 29, símbolo Cu. A primeira metade de algo que a química descobriu antes de mim.' },
  { num: 52, sym: 'Te', name: 'Telúrio',      mass: '127.60 u',     color: 'rose', msg: 'Raro e especial, quase nunca encontrado puro na natureza. Símbolo Te. Mas quando o Cobre encontra o Telúrio, a ciência confirma o que eu já sabia: você é CuTe.' },
  { num: '?', sym: '?', name: 'em breve',     mass: '— —',          color: 'locked' },
];

const accent = {
  gold:   { bg: colors.goldBg,   border: colors.goldBorder,   sym: colors.goldLight  },
  rose:   { bg: colors.roseBg,   border: colors.roseBorder,   sym: colors.roseLight  },
  teal:   { bg: colors.tealBg,   border: colors.tealBorder,   sym: colors.tealLight  },
  locked: { bg: 'transparent',   border: colors.hint,         sym: colors.hint       },
};

export default function HomeScreen() {
  const [selected, setSelected] = useState(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_300Light_Italic,
    CormorantGaramond_400Regular,
    DMMono_300Light,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.label}>elementos · série especial</Text>
          <Text style={s.h1}>Tabela Periódica{'\n'}<Text style={s.h1Em}>do Amor</Text></Text>
          <Text style={s.subtitle}>Para Iris. Cada elemento foi escolhido com cuidado. Toque para descobrir o que cada um significa.</Text>
        </View>

        <View style={s.grid}>
          {elements.map((el, i) => {
            const a = accent[el.color];
            const locked = el.color === 'locked';
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={locked ? 1 : 0.7}
                onPress={() => !locked && setSelected(el)}
                style={[s.card, { backgroundColor: a.bg, borderColor: a.border, opacity: locked ? 0.3 : 1 }]}
              >
                <Text style={s.elNum}>{el.num}</Text>
                <Text style={[s.elSym, { color: a.sym }]}>{el.sym}</Text>
                <Text style={s.elName}>{el.name}</Text>
                <Text style={s.elMass}>{el.mass}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.footerNote}>// mais elementos em breve · com amor</Text>
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={s.overlay} onPress={() => setSelected(null)}>
          <Pressable style={[s.modal, selected && { borderColor: accent[selected.color]?.border }]} onPress={() => {}}>
            <Text style={s.modalNum}>elemento {selected?.num}</Text>
            <Text style={[s.modalSym, { color: selected && accent[selected.color]?.sym }]}>{selected?.sym}</Text>
            <Text style={s.modalName}>{selected?.name}</Text>
            <Text style={s.modalMass}>{selected?.mass}</Text>
            <View style={[s.modalDivider, { backgroundColor: selected && accent[selected.color]?.sym }]} />
            <Text style={s.modalMsg}>{selected?.msg}</Text>
            <TouchableOpacity style={s.closeBtn} onPress={() => setSelected(null)}>
              <Text style={s.closeBtnText}>fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.bg },
  scroll:    { padding: 24, paddingBottom: 48 },

  header:    { marginBottom: 28 },
  label:     { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2.5, color: colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  h1:        { fontFamily: 'CormorantGaramond_300Light', fontSize: 32, color: colors.text, lineHeight: 36 },
  h1Em:      { fontFamily: 'CormorantGaramond_300Light_Italic', color: colors.goldLight },
  subtitle:  { fontFamily: 'DMMono_300Light', fontSize: 12, color: colors.muted, lineHeight: 20, marginTop: 10, maxWidth: 320 },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  card:      { width: '31%', borderWidth: 0.5, borderRadius: 6, padding: 12, gap: 4 },
  elNum:     { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint },
  elSym:     { fontFamily: 'CormorantGaramond_400Regular', fontSize: 34, lineHeight: 38 },
  elName:    { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.muted },
  elMass:    { fontFamily: 'DMMono_300Light', fontSize: 8, color: colors.hint, marginTop: 2 },

  footerNote: { fontFamily: 'DMMono_300Light', fontSize: 10, color: colors.hint, letterSpacing: 1 },

  overlay:   { flex: 1, backgroundColor: 'rgba(10,8,6,0.88)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal:     { backgroundColor: colors.surface, borderWidth: 0.5, borderRadius: 12, padding: 32, width: '100%', maxWidth: 380, alignItems: 'center' },
  modalNum:  { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, color: colors.hint, marginBottom: 6 },
  modalSym:  { fontFamily: 'CormorantGaramond_300Light', fontSize: 72, lineHeight: 78 },
  modalName: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 22, color: colors.text, marginBottom: 4 },
  modalMass: { fontFamily: 'DMMono_300Light', fontSize: 9, color: colors.hint, letterSpacing: 1.5, marginBottom: 20 },
  modalDivider: { width: 40, height: 0.5, marginBottom: 20 },
  modalMsg:  { fontFamily: 'CormorantGaramond_300Light_Italic', fontSize: 17, color: 'rgba(240,235,227,0.75)', lineHeight: 28, textAlign: 'center', marginBottom: 28 },
  closeBtn:  { borderWidth: 0.5, borderColor: colors.border, borderRadius: 4, paddingVertical: 8, paddingHorizontal: 20 },
  closeBtnText: { fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2, color: colors.muted, textTransform: 'uppercase' },
});
