import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Rect, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Reference ranges for common biomarkers (sex and age adjusted)
const REFERENCE_RANGES: Record<string, { male: { low: number; optimal: [number, number]; high: number }; female: { low: number; optimal: [number, number]; high: number } }> = {
  "Testosterone (Total)": {
    male: { low: 300, optimal: [500, 900], high: 1100 },
    female: { low: 15, optimal: [25, 70], high: 100 },
  },
  "Estradiol (E2)": {
    male: { low: 10, optimal: [20, 40], high: 60 },
    female: { low: 30, optimal: [50, 200], high: 400 },
  },
  "Cortisol": {
    male: { low: 5, optimal: [10, 20], high: 25 },
    female: { low: 5, optimal: [10, 20], high: 25 },
  },
  "TSH (Thyroid Stimulating Hormone)": {
    male: { low: 0.3, optimal: [1.0, 2.5], high: 4.5 },
    female: { low: 0.3, optimal: [1.0, 2.5], high: 4.5 },
  },
  "Vitamin D": {
    male: { low: 20, optimal: [40, 80], high: 100 },
    female: { low: 20, optimal: [40, 80], high: 100 },
  },
  "Vitamin B12": {
    male: { low: 200, optimal: [500, 900], high: 1200 },
    female: { low: 200, optimal: [500, 900], high: 1200 },
  },
  "Iron/Ferritin": {
    male: { low: 30, optimal: [70, 200], high: 400 },
    female: { low: 20, optimal: [50, 150], high: 300 },
  },
  "Glucose (Fasting)": {
    male: { low: 60, optimal: [70, 99], high: 126 },
    female: { low: 60, optimal: [70, 99], high: 126 },
  },
  "HbA1c": {
    male: { low: 4.0, optimal: [4.5, 5.6], high: 6.5 },
    female: { low: 4.0, optimal: [4.5, 5.6], high: 6.5 },
  },
  "Total Cholesterol": {
    male: { low: 100, optimal: [150, 200], high: 240 },
    female: { low: 100, optimal: [150, 200], high: 240 },
  },
  "Progesterone": {
    male: { low: 0.1, optimal: [0.2, 1.0], high: 1.5 },
    female: { low: 1, optimal: [5, 20], high: 30 },
  },
};

interface BiomarkerChartProps {
  markerName: string;
  data: Array<{ value: string; testDate: string }>;
  sex: "male" | "female";
  unit: string;
}

export function BiomarkerChart({ markerName, data, sex, unit }: BiomarkerChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const chartData = useMemo(() => {
    return data
      .map((item) => ({
        value: parseFloat(item.value),
        date: new Date(item.testDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }))
      .reverse()
      .slice(-7); // Last 7 data points
  }, [data]);

  const referenceRange = REFERENCE_RANGES[markerName]?.[sex];

  const getStatusColor = (value: number) => {
    if (!referenceRange) return colors.tint;
    if (value < referenceRange.low) return colors.warning;
    if (value > referenceRange.high) return colors.error;
    if (value >= referenceRange.optimal[0] && value <= referenceRange.optimal[1]) return colors.success;
    return colors.warning;
  };

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const previousValue = chartData.length > 1 ? chartData[chartData.length - 2].value : null;
  const trend = latestValue && previousValue ? (latestValue > previousValue ? "↑" : latestValue < previousValue ? "↓" : "→") : null;

  if (chartData.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <ThemedText style={{ color: colors.textSecondary }}>
          No data available for {markerName}
        </ThemedText>
      </View>
    );
  }

  // Chart dimensions
  const chartWidth = 300;
  const chartHeight = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const minValue = Math.min(...chartData.map((d) => d.value));
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;
  const paddedMin = minValue - valueRange * 0.1;
  const paddedMax = maxValue + valueRange * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Calculate point positions
  const points = chartData.map((d, i) => ({
    x: padding.left + (i / Math.max(chartData.length - 1, 1)) * plotWidth,
    y: padding.top + plotHeight - ((d.value - paddedMin) / paddedRange) * plotHeight,
    value: d.value,
    date: d.date,
  }));

  // Create line path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View>
          <ThemedText type="defaultSemiBold">{markerName}</ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>{unit}</ThemedText>
        </View>
        {latestValue !== null && (
          <View style={styles.latestValue}>
            <ThemedText
              type="title"
              style={{ color: getStatusColor(latestValue), fontSize: 24 }}
            >
              {latestValue}
            </ThemedText>
            {trend && (
              <ThemedText style={{ color: getStatusColor(latestValue), fontSize: 18 }}>
                {trend}
              </ThemedText>
            )}
          </View>
        )}
      </View>

      {/* Reference Range Legend */}
      {referenceRange && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
              Optimal: {referenceRange.optimal[0]}-{referenceRange.optimal[1]}
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
              Borderline
            </ThemedText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
              Out of range
            </ThemedText>
          </View>
        </View>
      )}

      {/* SVG Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Reference zone background */}
          {referenceRange && (
            <Rect
              x={padding.left}
              y={padding.top + plotHeight - ((referenceRange.optimal[1] - paddedMin) / paddedRange) * plotHeight}
              width={plotWidth}
              height={((referenceRange.optimal[1] - referenceRange.optimal[0]) / paddedRange) * plotHeight}
              fill={colors.success}
              opacity={0.15}
            />
          )}
          
          {/* Line */}
          <Line
            x1={points[0]?.x || 0}
            y1={points[0]?.y || 0}
            x2={points[points.length - 1]?.x || 0}
            y2={points[points.length - 1]?.y || 0}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          
          {/* Data points and connecting lines */}
          {points.map((point, i) => (
            <Circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={6}
              fill={getStatusColor(point.value)}
            />
          ))}
          
          {/* Connect points with lines */}
          {points.slice(1).map((point, i) => (
            <Line
              key={`line-${i}`}
              x1={points[i].x}
              y1={points[i].y}
              x2={point.x}
              y2={point.y}
              stroke={colors.tint}
              strokeWidth={2}
            />
          ))}
        </Svg>
      </View>

      {/* Data Points Labels */}
      <View style={styles.dataPoints}>
        {chartData.map((point, index) => (
          <View key={index} style={styles.dataPoint}>
            <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
              {point.date}
            </ThemedText>
            <ThemedText
              style={{ fontSize: 12, color: getStatusColor(point.value), fontWeight: "600" }}
            >
              {point.value}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  latestValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  dataPoints: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dataPoint: {
    alignItems: "center",
    flex: 1,
  },
});
