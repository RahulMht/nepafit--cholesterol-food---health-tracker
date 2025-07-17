import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface WeeklyBarChartProps {
  data: { day: string; value: number }[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  // If no data, show placeholder
  if (!data.length) {
    const placeholderData = [
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
      { day: "Sun", value: 0 },
    ];
    return renderChart(placeholderData);
  }

  return renderChart(data);
};

const renderChart = (data: { day: string; value: number }[]) => {
  const maxValue = Math.max(...data.map((item) => item.value), 300);
  const chartHeight = 180;
  const barWidth = 24;
  const barSpacing = 16;
  const chartWidth = data.length * (barWidth + barSpacing) - barSpacing;

  // Get color based on value relative to target (assuming target is 200mg cholesterol)
  const getBarColor = (value: number) => {
    if (value <= 200) return "#4CAF50"; // Green - Good
    if (value <= 240) return "#FF9800"; // Orange - Borderline
    return "#F44336"; // Red - High
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Cholesterol Intake</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {data.map((item, index) => {
            const barHeight = item.value ? (item.value / maxValue) * (chartHeight - 40) : 2;
            const x = index * (barWidth + barSpacing);
            const y = chartHeight - barHeight - 20;
            
            return (
              <Rect
                key={`bar-${item.day}-${index}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={getBarColor(item.value)}
              />
            );
          })}
        </Svg>
        
        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {data.map((item, index) => (
            <View key={`label-${item.day}-${index}`} style={[styles.labelContainer, { width: barWidth + barSpacing }]}>
              <Text style={styles.dayLabel}>{item.day}</Text>
              <Text style={styles.valueLabel}>{item.value}mg</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.targetLine}>
        <View style={styles.targetDash} />
        <Text style={styles.targetLabel}>Target: less than 200mg daily</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: "center",
  },
  xAxisLabels: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingTop: 8,
  },
  labelContainer: {
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 2,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#424242",
  },
  targetLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  targetDash: {
    width: 16,
    height: 2,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  targetLabel: {
    fontSize: 12,
    color: "#757575",
  },
});