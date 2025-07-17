import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface WeeklyBarChartProps {
  data: { day: string; value: number }[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  // If no data, show placeholder (Sunday to Saturday)
  if (!data.length) {
    const placeholderData = [
      { day: "Sun", value: 0 },
      { day: "Mon", value: 0 },
      { day: "Tue", value: 0 },
      { day: "Wed", value: 0 },
      { day: "Thu", value: 0 },
      { day: "Fri", value: 0 },
      { day: "Sat", value: 0 },
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
  
  // Calculate y-axis tick marks (integers only)
  const yAxisTicks = [];
  const tickCount = 5;
  const tickInterval = Math.ceil(maxValue / tickCount);
  for (let i = 0; i <= tickCount; i++) {
    yAxisTicks.push(i * tickInterval);
  }
  
  // Create a unique chart ID for this render
  const chartId = Math.random().toString(36).substr(2, 9);

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
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          {yAxisTicks.reverse().map((tick, index) => (
            <Text key={`y-tick-${chartId}-${tick}-${index}`} style={styles.yAxisLabel}>
              {Math.round(tick)}
            </Text>
          ))}
        </View>
        
        <View style={styles.chartAndXAxis}>
          <Svg width={chartWidth} height={chartHeight}>
            {data.map((item, index) => {
              const barHeight = item.value ? (item.value / maxValue) * (chartHeight - 40) : 2;
              const x = index * (barWidth + barSpacing);
              const y = chartHeight - barHeight - 20;
              
              return (
                <Rect
                  key={`bar-${chartId}-${item.day}-${index}`}
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
              <View key={`label-${chartId}-${item.day}-${index}`} style={[styles.labelContainer, { width: barWidth + barSpacing }]}>
                <Text style={styles.dayLabel}>{item.day}</Text>
                <Text style={styles.valueLabel}>{Math.round(item.value)}mg</Text>
              </View>
            ))}
          </View>
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
    flexDirection: "row",
    alignItems: "flex-start",
  },
  yAxisContainer: {
    height: 180,
    justifyContent: "space-between",
    paddingVertical: 20,
    marginRight: 8,
    minWidth: 30,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#757575",
    textAlign: "right",
  },
  chartAndXAxis: {
    flex: 1,
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