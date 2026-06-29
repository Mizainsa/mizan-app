// components/GlassCard.tsx
// حاوية «زجاجية» (Glassmorphism) بطراز ٢٠٢٦ مرسومة بـ Skia — بلا تبعيات جديدة.
// اللوحة: تعبئة شفافة + لمعة متدرّجة + حدّ نيون خافت + ظلّ ناعم، فوقها يُعرض المحتوى.
//
// ملاحظة صريحة: الضبابية الحقيقية لما خلف البطاقة (backdrop-blur) تتطلّب
// مكتبة native مثل expo-blur (غير مثبّتة حاليًّا). هذه نسخة Skia تعطي مظهر
// «الزجاج المثلَّج» دون ضبابية الخلفية — جاهزة لإضافة backdrop-blur لاحقًا.

import { ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Shadow,
} from '@shopify/react-native-skia';
import { theme } from '../config/theme';

interface GlassCardProps {
  width: number;
  height: number;
  children?: ReactNode;
  // لون الحدّ النيونيّ (افتراضيًّا برتقالي الهوية).
  glow?: string;
  // شدّة تعتيم اللوح الزجاجيّ (0..1).
  tint?: number;
  style?: ViewStyle;
  // حشوة داخلية للمحتوى.
  padding?: number;
  radius?: number;
}

export default function GlassCard({
  width,
  height,
  children,
  glow = theme.colors.primary,
  tint = 0.14,
  style,
  padding = 16,
  radius = theme.radius.lg,
}: GlassCardProps) {
  const inset = 2; // إفساح مكان للظلّ والحدّ
  const w = width - inset * 2;
  const h = height - inset * 2;

  return (
    <View style={[{ width, height }, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* اللوح الزجاجيّ: تعبئة شبه شفّافة مع ظلّ ناعم */}
        <RoundedRect x={inset} y={inset} width={w} height={h} r={radius} color={`rgba(255,255,255,${tint})`}>
          <Shadow dx={0} dy={8} blur={24} color="rgba(124,45,18,0.18)" />
        </RoundedRect>

        {/* لمعة علوية متدرّجة (إحساس الزجاج) */}
        <RoundedRect x={inset} y={inset} width={w} height={h} r={radius}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, h)}
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.04)']}
          />
        </RoundedRect>

        {/* حدّ نيون خافت */}
        <RoundedRect
          x={inset}
          y={inset}
          width={w}
          height={h}
          r={radius}
          style="stroke"
          strokeWidth={1.5}
          color={glow}
          opacity={0.55}
        />
      </Canvas>

      {/* المحتوى فوق اللوح */}
      <View style={[styles.content, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
});
