import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";

interface WeeklyBarChartProps {
  data: { day: string; value: number }[];
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data }) => {
  // Reorder days to start from Sunday and end at Saturday
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // If no data, show placeholder
  if (!data.length) {
    const placeholderData = dayOrder.map(day => ({ day, value: 0 }));
    return renderChart(placeholderData);
  }

  // Reorder the data according to the day order
  const orderedData = dayOrder.map(day => 
    data.find(item => item.day === day) || { day, value: 0 }
  );

  return renderChart(orderedData);
};

const renderChart = (data: { day: string; value: number }[]) => {
  const maxValue = Math.max(...data.map((item) => item.value), 300);
  const chartHeight = 180;
  const barWidth = 24;
  const barSpacing = 16;
  const chartWidth = data.length * (barWidth + barSpacing) - barSpacing;
  const yAxisWidth = 40;
  const totalWidth = chartWidth + yAxisWidth;

  // Get color based on value relative to target (assuming target is 200mg cholesterol)
  const getBarColor = (value: number) => {
    if (value <= 200) return "#4CAF50"; // Green - Good
    if (value <= 240) return "#FF9800"; // Orange - Borderline
    return "#F44336"; // Red - High
  };

  // Calculate Y-axis scale with better spacing
  const getYAxisLabels = () => {
    const step = maxValue <= 100 ? 25 : maxValue <= 300 ? 50 : 100;
    const labels = [];
    for (let i = 0; i <= maxValue; i += step) {
      if (labels.length < 5) { // Limit to 5 labels to avoid overlap
        labels.push(i);
      }
    }
    if (labels[labels.length - 1] < maxValue) {
      labels.push(Math.ceil(maxValue / step) * step);
    }
    return labels;
  };

  const yAxisLabels = getYAxisLabels();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Cholesterol Intake</Text>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartWithAxis}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            {yAxisLabels.reverse().map((value, index) => (
              <Text key={`y-label-${value}`} style={styles.yAxisLabel}>
                {value}
              </Text>
            ))}
          </View>
          
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {yAxisLabels.reverse().map((value, index) => {
              const y = chartHeight - 20 - (value / maxValue) * (chartHeight - 40);
              return (
                <Line
                  key={`grid-${value}`}
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#E0E0E0"
                  strokeWidth={0.5}
                  strokeDasharray="2,2"
                />
              );
            })}
            
            {/* Bars */}
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
        </View>
        
        {/* X-axis labels */}
        <View style={[styles.xAxisLabels, { marginLeft: yAxisWidth }]}>
          {data.map((item, index) => (
            <View key={`label-${item.day}-${index}`} style={[styles.labelContainer, { width: barWidth + barSpacing }]}>
              <Text style={styles.dayLabel}>{item.day}</Text>
              <Text style={styles.valueLabel}>{Math.round(item.value)}</Text>
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
  chartWithAxis: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  yAxisLabels: {
    width: 40,
    height: 180,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
    paddingBottom: 20,
    paddingTop: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: "#757575",
    textAlign: "right",
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