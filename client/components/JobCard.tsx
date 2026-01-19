import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const PRIMARY_BLUE = '#1e88e5';
const DARK_TEXT = '#2c3e50';
const BORDER_COLOR = '#ecf0f1';
const WHITE = '#ffffff';

const JobCard = ({ job }: { job: any }) => {
  if (!job) return null;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="office-building" size={24} color={PRIMARY_BLUE} />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
        </View>

        <TouchableOpacity>
          <Feather name="bookmark" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.tagRow}>
        <View style={styles.tag}>
          <Feather name="map-pin" size={12} color="#7f8c8d" />
          <Text style={styles.tagText}>{job.location}</Text>
        </View>
        <View style={styles.tag}>
          <Feather name="clock" size={12} color="#7f8c8d" />
          <Text style={styles.tagText}>{job.type}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.salary}>{job.salary}</Text>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...Platform.select({
      web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.03)' },
      default: { elevation: 3 }
    })
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 17, fontWeight: '700', color: DARK_TEXT },
  company: { fontSize: 14, color: '#7f8c8d', marginTop: 2 },
  tagRow: { flexDirection: 'row', marginTop: 15 },
  tag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f8f9fa', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginRight: 10 
  },
  tagText: { fontSize: 12, color: '#7f8c8d', marginLeft: 4 },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f1f1' 
  },
  salary: { fontSize: 16, fontWeight: '700', color: PRIMARY_BLUE },
  applyButton: { 
    backgroundColor: DARK_TEXT, 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  applyText: { color: WHITE, fontWeight: '600', fontSize: 14 }
});

export default JobCard;