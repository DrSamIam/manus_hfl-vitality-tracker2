import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  CyclePrediction,
  formatPredictionDate,
  getPhaseColor,
  getPhaseDescription,
} from "@/lib/cycle-utils";

interface CyclePredictionCardProps {
  prediction: CyclePrediction;
  cycleLength: number;
}

export function CyclePredictionCard({ prediction, cycleLength }: CyclePredictionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const phaseColor = getPhaseColor(prediction.currentPhase);
  const phaseDescription = getPhaseDescription(prediction.currentPhase);

  // Calculate cycle wheel positions
  const wheelSize = 200;
  const center = wheelSize / 2;
  const radius = 80;
  const innerRadius = 55;

  // Phase angles (approximate for 28-day cycle)
  const menstrualEnd = (5 / cycleLength) * 360;
  const follicularEnd = ((cycleLength - 14 - 2) / cycleLength) * 360;
  const ovulationEnd = ((cycleLength - 14 + 1) / cycleLength) * 360;

  // Current day indicator angle
  const currentDayAngle = (prediction.daysUntilNextPeriod > 0 
    ? ((cycleLength - prediction.daysUntilNextPeriod) / cycleLength) * 360 
    : 0) - 90;

  const polarToCartesian = (angle: number, r: number) => ({
    x: center + r * Math.cos((angle * Math.PI) / 180),
    y: center + r * Math.sin((angle * Math.PI) / 180),
  });

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(endAngle - 90, r);
    const end = polarToCartesian(startAngle - 90, r);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const currentPos = polarToCartesian(currentDayAngle, radius);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Cycle Prediction
      </ThemedText>

      {/* Cycle Wheel */}
      <View style={styles.wheelContainer}>
        <Svg width={wheelSize} height={wheelSize}>
          {/* Phase arcs */}
          {/* Menstrual (red) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.menstruation}
            strokeWidth={25}
            fill="none"
            strokeDasharray={`${(menstrualEnd / 360) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
            rotation={-90}
            origin={`${center}, ${center}`}
          />
          {/* Follicular (amber) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.follicular}
            strokeWidth={25}
            fill="none"
            strokeDasharray={`${((follicularEnd - menstrualEnd) / 360) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
            rotation={-90 + menstrualEnd}
            origin={`${center}, ${center}`}
          />
          {/* Ovulation (green) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.ovulation}
            strokeWidth={25}
            fill="none"
            strokeDasharray={`${((ovulationEnd - follicularEnd) / 360) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
            rotation={-90 + follicularEnd}
            origin={`${center}, ${center}`}
          />
          {/* Luteal (indigo) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.luteal}
            strokeWidth={25}
            fill="none"
            strokeDasharray={`${((360 - ovulationEnd) / 360) * 2 * Math.PI * radius} ${2 * Math.PI * radius}`}
            rotation={-90 + ovulationEnd}
            origin={`${center}, ${center}`}
          />

          {/* Current day indicator */}
          <Circle
            cx={currentPos.x}
            cy={currentPos.y}
            r={8}
            fill="#FFFFFF"
            stroke={phaseColor}
            strokeWidth={3}
          />

          {/* Center text */}
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize={12}
            fill={colors.textSecondary}
          >
            Day
          </SvgText>
          <SvgText
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize={24}
            fontWeight="bold"
            fill={colors.text}
          >
            {cycleLength - prediction.daysUntilNextPeriod}
          </SvgText>
        </Svg>
      </View>

      {/* Current Phase */}
      <View style={[styles.phaseCard, { backgroundColor: phaseColor + "20", borderColor: phaseColor }]}>
        <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
        <View style={styles.phaseInfo}>
          <ThemedText type="defaultSemiBold" style={{ textTransform: "capitalize" }}>
            {prediction.currentPhase} Phase
          </ThemedText>
          <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
            {phaseDescription}
          </ThemedText>
        </View>
      </View>

      {/* Predictions */}
      <View style={styles.predictions}>
        <View style={styles.predictionItem}>
          <ThemedText style={{ fontSize: 24 }}>🩸</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold">Next Period</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              {formatPredictionDate(prediction.nextPeriodStart)} ({prediction.daysUntilNextPeriod} days)
            </ThemedText>
          </View>
        </View>

        <View style={styles.predictionItem}>
          <ThemedText style={{ fontSize: 24 }}>🥚</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold">Ovulation</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              {prediction.daysUntilOvulation > 0 
                ? `${formatPredictionDate(prediction.ovulationDate)} (${prediction.daysUntilOvulation} days)`
                : "Passed this cycle"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.predictionItem}>
          <ThemedText style={{ fontSize: 24 }}>💚</ThemedText>
          <View>
            <ThemedText type="defaultSemiBold">Fertile Window</ThemedText>
            <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
              {formatPredictionDate(prediction.fertileWindowStart)} - {formatPredictionDate(prediction.fertileWindowEnd)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Phase Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.menstruation }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Menstrual</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.follicular }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Follicular</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.ovulation }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Ovulation</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.luteal }]} />
          <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>Luteal</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  wheelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  phaseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  predictions: {
    gap: 12,
    marginBottom: 16,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
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
});
