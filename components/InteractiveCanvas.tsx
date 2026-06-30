// components/InteractiveCanvas.tsx
// السبورة التفاعليّة: تعرض صورة صفحة الكتاب على كنفس Skia، وتطبع فوقها طبقات
// زجاجيّة (Glassmorphism) تظهر تدريجيًّا بنبضة withSpring، وتلتقط لمس الطفل
// وتُرجع إحداثيّاته النسبيّة (0..1) — فتعمل بدقّة على كلّ الشاشات (آيفون/آيباد).
//
// الإصدارات المعتمَدة بدقّة:
//   @shopify/react-native-skia 2.6.2
//   react-native-reanimated 4.3.1
//   react-native-gesture-handler 2.31.1

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Group,
  RoundedRect,
  Circle,
  BlurMask,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useDerivedValue,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

// ===== الأنواع =====

export type AnnotationType = 'rect' | 'circle' | 'highlight';

export interface Annotation {
  type: AnnotationType;
  // إحداثيّات نسبيّة 0..1 بالنسبة لمستطيل الصورة المعروض.
  x: number;
  y: number;
  width?: number; // نسبيّ 0..1 (لـ rect / highlight)
  height?: number; // نسبيّ 0..1 (لـ rect / highlight)
  radius?: number; // نسبيّ 0..1 (لـ circle)
  color?: string;
}

export interface InteractiveCanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  onPressCoord: (coord: { x: number; y: number }) => void;
}

// مستطيل الصورة المعروض داخل الكنفس (بعد احتواء الأبعاد).
interface FitRect {
  ox: number; // إزاحة أفقيّة
  oy: number; // إزاحة رأسيّة
  dw: number; // عرض معروض
  dh: number; // ارتفاع معروض
}

// ===== دوال مساعدة =====

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// احتواء الصورة داخل الكنفس مع الحفاظ على نسبة الأبعاد (contain) وتوسيطها.
function computeFit(
  canvasW: number,
  canvasH: number,
  imgW: number,
  imgH: number
): FitRect {
  if (canvasW <= 0 || canvasH <= 0 || imgW <= 0 || imgH <= 0) {
    return { ox: 0, oy: 0, dw: 0, dh: 0 };
  }
  const scale = Math.min(canvasW / imgW, canvasH / imgH);
  const dw = imgW * scale;
  const dh = imgH * scale;
  const ox = (canvasW - dw) / 2;
  const oy = (canvasH - dh) / 2;
  return { ox, oy, dw, dh };
}

// ===== طبقة تأشير واحدة (تدير ظهورها الخاصّ بنبضة withSpring متدرّجة) =====

function AnnotationLayer({
  annotation,
  index,
  fit,
}: {
  annotation: Annotation;
  index: number;
  fit: FitRect;
}) {
  const appear = useSharedValue(0);

  useEffect(() => {
    // ظهور تدريجيّ: كلّ طبقة تتأخّر عن سابقتها ثمّ تنبض withSpring.
    appear.value = withDelay(
      index * 120,
      withSpring(1, { damping: 13, stiffness: 130, mass: 0.6 })
    );
  }, [appear, index]);

  // تحويل الإحداثيّات النسبيّة (0..1) إلى بكسلات الكنفس الفعليّة.
  const color = annotation.color ?? '#FF8A3D';
  const px = fit.ox + annotation.x * fit.dw;
  const py = fit.oy + annotation.y * fit.dh;
  const w = (annotation.width ?? 0) * fit.dw;
  const h = (annotation.height ?? 0) * fit.dh;
  const r = (annotation.radius ?? 0) * fit.dw;

  // مركز الشكل (نقطة أصل التحجيم) ليكون الظهور من المنتصف.
  const isCircle = annotation.type === 'circle';
  const centerX = isCircle ? px : px + w / 2;
  const centerY = isCircle ? py : py + h / 2;
  const origin = useMemo(
    () => ({ x: centerX, y: centerY }),
    [centerX, centerY]
  );

  // الشفافيّة والتحجيم مشتقّان من قيمة الظهور (worklets).
  const opacity = useDerivedValue(() => appear.value);
  const transform = useDerivedValue(() => [
    { scale: 0.6 + appear.value * 0.4 },
  ]);

  return (
    <Group transform={transform} origin={origin} opacity={opacity}>
      {isCircle ? (
        <>
          {/* تعبئة زجاجيّة شفّافة مع تمويه ناعم */}
          <Circle cx={px} cy={py} r={r} color={color} opacity={0.26}>
            <BlurMask blur={6} style="normal" />
          </Circle>
          {/* حافّة زجاجيّة فاتحة */}
          <Circle
            cx={px}
            cy={py}
            r={r}
            color="#FFFFFF"
            style="stroke"
            strokeWidth={2}
            opacity={0.6}
          />
        </>
      ) : annotation.type === 'highlight' ? (
        // تظليل (قلم تحديد) — تعبئة شبه شفّافة باللون.
        <RoundedRect
          x={px}
          y={py}
          width={w}
          height={h}
          r={6}
          color={color}
          opacity={0.35}
        >
          <BlurMask blur={4} style="normal" />
        </RoundedRect>
      ) : (
        <>
          {/* مستطيل زجاجيّ: تعبئة شفّافة + حافّة فاتحة */}
          <RoundedRect
            x={px}
            y={py}
            width={w}
            height={h}
            r={10}
            color={color}
            opacity={0.22}
          >
            <BlurMask blur={6} style="normal" />
          </RoundedRect>
          <RoundedRect
            x={px}
            y={py}
            width={w}
            height={h}
            r={10}
            color="#FFFFFF"
            style="stroke"
            strokeWidth={2}
            opacity={0.65}
          />
        </>
      )}
    </Group>
  );
}

// ===== المكوّن الرئيسيّ =====

export default function InteractiveCanvas({
  imageUrl,
  annotations,
  onPressCoord,
}: InteractiveCanvasProps) {
  const image = useImage(imageUrl);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const imgW = image ? image.width() : 0;
  const imgH = image ? image.height() : 0;

  const fit = useMemo(
    () => computeFit(size.width, size.height, imgW, imgH),
    [size.width, size.height, imgW, imgH]
  );

  // تحويل لمسة الكنفس (بكسل) إلى إحداثيّات نسبيّة 0..1 ضمن مستطيل الصورة.
  const handleTap = useCallback(
    (tapX: number, tapY: number) => {
      if (fit.dw <= 0 || fit.dh <= 0) return;
      const rx = clamp01((tapX - fit.ox) / fit.dw);
      const ry = clamp01((tapY - fit.oy) / fit.dh);
      onPressCoord({ x: rx, y: ry });
    },
    [fit, onPressCoord]
  );

  const tap = useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        'worklet';
        runOnJS(handleTap)(e.x, e.y);
      }),
    [handleTap]
  );

  return (
    <GestureDetector gesture={tap}>
      <View
        style={styles.fill}
        onLayout={(e) =>
          setSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          })
        }
      >
        <Canvas style={styles.fill}>
          {image && (
            <SkiaImage
              image={image}
              x={fit.ox}
              y={fit.oy}
              width={fit.dw}
              height={fit.dh}
              fit="fill"
            />
          )}
          {image &&
            fit.dw > 0 &&
            annotations.map((a, i) => (
              <AnnotationLayer
                key={i}
                annotation={a}
                index={i}
                fit={fit}
              />
            ))}
        </Canvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
