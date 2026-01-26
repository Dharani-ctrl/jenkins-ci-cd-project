import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  RefreshControl
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// --- Project Components ---
import JobCard from "../../components/JobCard"; 

// --- Design Constants ---
const PRIMARY_BLUE = '#1e88e5'; 
const DARK_TEXT = '#2c3e50';   
const LIGHT_BG = '#f5f7fa';    
const WHITE = '#ffffff';

export default function Home() {
  const router = useRouter();
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Developer", "Designer", "Manager", "Analyst"];

  // --- Fetch Jobs Logic ---
  const fetchJobs = async (query = "", category = "All") => {
    try {
      setLoading(true);
      
      // IMPORTANT: Use your CURRENT IP address here. 
      // If it fails, check your terminal for the IP shown in index.js
      const baseUrl = "http://10.98.87.155:5000/api/jobs";
      const url = `${baseUrl}?search=${query}${category !== "All" ? `&category=${category}` : ""}`;
      
      console.log("Requesting URL:", url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // We look for 'data.jobs' because your backend sends { success: true, jobs: [...] }
      if (data && data.jobs) {
        setJobs(data.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Only alert if it's not a background refresh
      if (!refreshing) {
        Alert.alert("Connection Error", "Could not connect to the server. Please check your IP address and ensure the server is running.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle category change
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    fetchJobs(searchQuery, category);
  };

  // Handle Search
  const handleSearch = () => {
    fetchJobs(searchQuery, activeCategory);
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Find Your Path,</Text>
          <Text style={styles.userName}>Explore Opportunities 🚀</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push("/Profile")}
        >
          <Feather name="user" size={24} color={PRIMARY_BLUE} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_BLUE]} />
        }
      >
        {/* --- Search Bar --- */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#999" />
            <TextInput
              placeholder="Search by job title or company"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
            <Ionicons name="options-outline" size={24} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* --- Categories --- */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => handleCategorySelect(cat)}
              style={[
                styles.categoryChip, 
                activeCategory === cat && styles.activeChip
              ]}
            >
              <Text style={[
                styles.categoryText, 
                activeCategory === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- Job List --- */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <TouchableOpacity onPress={() => router.push("/Jobs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={PRIMARY_BLUE} />
            <Text style={styles.loadingText}>Fetching latest jobs...</Text>
          </View>
        ) : (
          <View style={styles.jobListContainer}>
            {jobs.length > 0 ? (
              jobs.map((item: any) => (
                <JobCard key={item._id} job={item} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="info" size={50} color="#bdc3c7" />
                <Text style={styles.noJobsText}>No jobs found matching your criteria.</Text>
                <TouchableOpacity onPress={() => fetchJobs("", "All")}>
                  <Text style={styles.resetText}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#7f8c8d' },
  userName: { fontSize: 20, fontWeight: '700', color: DARK_TEXT },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BG,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: DARK_TEXT,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DARK_TEXT },
  seeAll: { color: PRIMARY_BLUE, fontWeight: '600' },
  categoryList: { paddingLeft: 20, marginBottom: 25 },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: LIGHT_BG,
    marginRight: 10,
  },
  activeChip: { backgroundColor: PRIMARY_BLUE },
  categoryText: { color: DARK_TEXT, fontWeight: '500' },
  activeCategoryText: { color: WHITE },
  jobListContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  loaderContainer: { marginTop: 50, alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#7f8c8d' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  noJobsText: { textAlign: 'center', color: '#999', marginTop: 15, fontSize: 16 },
  resetText: { color: PRIMARY_BLUE, marginTop: 10, fontWeight: '600' }
});