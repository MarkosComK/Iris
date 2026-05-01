import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, useWindowDimensions, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../lib/theme';
import { AUTHOR_COLORS, sendDrawing, subscribeToDrawing } from '../lib/drawings';

const MY_AUTHOR    = Platform.OS === 'ios' ? 'markos' : 'iris';
const OTHER_AUTHOR = Platform.OS === 'ios' ? 'iris'   : 'markos';
const MY_COLOR     = AUTHOR_COLORS[MY_AUTHOR];
const OTHER_LABEL  = `de ${OTHER_AUTHOR}`;

function toD(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return d;
}

function normalizeStrokes(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : Object.values(raw);
  return arr.map(s => ({
    color: s.color,
    d: toD(Array.isArray(s.points) ? s.points : Object.values(s.points)),
  }));
}

export default function DesenhoScreen() {
  const { width } = useWindowDimensions();
  const canvasSize = width - 32;

  const [viewMode, setViewMode]   = useState('draw'); // 'draw' | 'received'
  const [myStrokes, setMyStrokes] = useState([]);
  const [sentState, setSentState] = useState(false);
  const [received, setReceived]   = useState(null);
  const currentPoints             = useRef([]);
  const [, tick]                  = useState(0);

  useEffect(() => {
    return subscribeToDrawing(OTHER_AUTHOR, data => {
      if (data?.strokes) setReceived(normalizeStrokes(data.strokes));
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder:         () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onPanResponderGrant: e => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        currentPoints.current = [{ x, y }];
        tick(n => n + 1);
      },
      onPanResponderMove: e => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        const pts  = currentPoints.current;
        const last = pts[pts.length - 1];
        if ((x - last.x) ** 2 + (y - last.y) ** 2 > 4) {
          pts.push({ x, y });
          tick(n => n + 1);
        }
      },
      onPanResponderRelease: () => {
        const pts = currentPoints.current;
        if (pts.length >= 2) {
          setMyStrokes(prev => [...prev, { color: MY_COLOR, points: pts, d: toD(pts) }]);
        }
        currentPoints.current = [];
        tick(n => n + 1);
      },
    }),
  ).current;

  const handleClear = useCallback(() => {
    setMyStrokes([]);
    currentPoints.current = [];
    tick(n => n + 1);
  }, []);

  const handleSend = useCallback(async () => {
    if (myStrokes.length === 0) return;
    await sendDrawing(MY_AUTHOR, myStrokes.map(({ color, points }) => ({ color, points })));
    setSentState(true);
    setTimeout(() => setSentState(false), 2000);
  }, [myStrokes]);

  const showingMine    = viewMode === 'draw';
  const activeD        = toD(currentPoints.current);
  const isEmpty        = myStrokes.length === 0 && currentPoints.current.length === 0;
  const displayStrokes = showingMine ? myStrokes : (received || []);

  return (
    <View style={s.root}>
      <Text style={s.label}>{showingMine ? 'meu desenho' : OTHER_LABEL}</Text>

      <View style={[s.canvas, { width: canvasSize, height: canvasSize }]}>
        <Svg width={canvasSize} height={canvasSize} style={StyleSheet.absoluteFill}>
          {displayStrokes.map((stroke, i) => (
            <Path key={i} d={stroke.d} stroke={stroke.color}
              strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {showingMine && activeD ? (
            <Path d={activeD} stroke={MY_COLOR}
              strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </Svg>

        {showingMine && (
          <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
        )}

        {!showingMine && received === null && (
          <View style={s.empty}>
            <Text style={s.emptyText}>nenhum desenho ainda</Text>
          </View>
        )}
      </View>

      {showingMine ? (
        <View style={s.row}>
          <TouchableOpacity style={s.btnGhost} onPress={handleClear}>
            <Text style={s.btnGhostText}>limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnView} onPress={() => setViewMode('received')}>
            <Text style={s.btnViewText}>recebido</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnSend, isEmpty && s.btnDisabled]}
            onPress={handleSend}
            disabled={isEmpty}
          >
            <Text style={s.btnSendText}>{sentState ? 'enviado ✓' : 'enviar ♡'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.btnBack} onPress={() => setViewMode('draw')}>
          <Text style={s.btnBackText}>← meu desenho</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.bg, padding: 16, alignItems: 'center' },
  label:        {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 2,
    textTransform: 'uppercase', color: colors.muted,
    marginBottom: 10, alignSelf: 'flex-start',
  },
  canvas:       {
    borderRadius: 4, borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.surface, overflow: 'hidden',
  },
  empty:        { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  emptyText:    {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.hint,
  },
  row:          { flexDirection: 'row', gap: 8, marginTop: 12, alignSelf: 'stretch' },
  btnGhost:     {
    flex: 1, paddingVertical: 11, borderRadius: 4,
    borderWidth: 0.5, borderColor: colors.border, alignItems: 'center',
  },
  btnGhostText: {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.muted,
  },
  btnView:      {
    flex: 1, paddingVertical: 11, borderRadius: 4,
    borderWidth: 0.5, borderColor: colors.goldBorder,
    backgroundColor: colors.goldBg, alignItems: 'center',
  },
  btnViewText:  {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.gold,
  },
  btnSend:      {
    flex: 1, paddingVertical: 11, borderRadius: 4,
    borderWidth: 0.5, borderColor: colors.roseBorder,
    backgroundColor: colors.roseBg, alignItems: 'center',
  },
  btnDisabled:  { opacity: 0.3 },
  btnSendText:  {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.rose,
  },
  btnBack:      {
    marginTop: 12, paddingVertical: 11, alignSelf: 'stretch',
    borderRadius: 4, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center',
  },
  btnBackText:  {
    fontFamily: 'DMMono_300Light', fontSize: 10, letterSpacing: 1.5,
    textTransform: 'uppercase', color: colors.muted,
  },
});
