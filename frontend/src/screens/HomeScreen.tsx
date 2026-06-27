import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import MovieCard from "../components/MovieCard";
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
} from "../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";

const HomeScreen = () => {
  const { user } = useUser();
  const [trending, setTrending] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log("[MovieVault] Fetching movies from TMDB...");

      const results = await Promise.allSettled([
        getTrendingMovies(),
        getPopularMovies(),
        getTopRatedMovies(),
      ]);

      const [trendingRes, popularRes, topRatedRes] = results;

      let anySuccess = false;

      if (trendingRes.status === "fulfilled" && trendingRes.value?.length > 0) {
        setTrending(trendingRes.value);
        console.log("STATE MOVIES:", trendingRes.value);
        anySuccess = true;
        console.log(
          "[MovieVault] Trending loaded:",
          trendingRes.value.length,
          "movies",
        );
      } else if (trendingRes.status === "rejected") {
        console.error(
          "[MovieVault] Trending Fetch Failed:",
          trendingRes.reason?.message || trendingRes.reason,
        );
      }

      if (popularRes.status === "fulfilled" && popularRes.value?.length > 0) {
        setPopular(popularRes.value);
        anySuccess = true;
        console.log(
          "[MovieVault] Popular loaded:",
          popularRes.value.length,
          "movies",
        );
      } else if (popularRes.status === "rejected") {
        console.error(
          "[MovieVault] Popular Fetch Failed:",
          popularRes.reason?.message || popularRes.reason,
        );
      }

      if (topRatedRes.status === "fulfilled" && topRatedRes.value?.length > 0) {
        setTopRated(topRatedRes.value);
        anySuccess = true;
        console.log(
          "[MovieVault] Top Rated loaded:",
          topRatedRes.value.length,
          "movies",
        );
      } else if (topRatedRes.status === "rejected") {
        console.error(
          "[MovieVault] Top Rated Fetch Failed:",
          topRatedRes.reason?.message || topRatedRes.reason,
        );
      }

      if (!anySuccess) {
        const firstError =
          (trendingRes.status === "rejected"
            ? trendingRes.reason?.message
            : null) || "Unable to load movies. Check your internet connection.";
        setError(firstError);
      }
    } catch (err: any) {
      console.error("[MovieVault] Critical Fetch Error:", err);
      setError(err.message || "Something went wrong while loading movies.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onMoviePress = (movie: any) => {
    if (!movie?.id) return;
    navigation.navigate("MovieDetails", { movieId: movie.id });
  };

  const renderMovieSection = (title: string, data: any[]) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          {title} ({data.length})
        </Text>
        <Text style={{ color: "red", marginLeft: 20 }}>
          First movie: {data[0]?.title}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {data.map((item) =>
            item ? (
              <View
                key={item.id?.toString()}
                style={{
                  width: 130,
                  height: 200,
                  backgroundColor: "red",
                  marginRight: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 10, textAlign: "center" }}
                >
                  {item.title}
                </Text>
              </View>
            ) : null,
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="cloud-offline-outline"
          size={72}
          color={Colors.primary}
        />
        <Text style={styles.errorTitle}>Could Not Load Movies</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchMovies(false)}
        >
          <Ionicons name="refresh" size={18} color={Colors.white} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMovies(true)}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movie Vault</Text>
          {user?.firstName && (
            <Text style={styles.headerSubtitle}>
              Welcome back, {user.firstName}!
            </Text>
          )}
        </View>

        {/* DEBUG - remove after fixing */}
        <Text style={{ color: "yellow", padding: 10 }}>
          Trending: {trending.length} | Popular: {popular.length} | Top:{" "}
          {topRated.length}
        </Text>
        <Text style={{ color: "orange", padding: 10, fontSize: 10 }}>
          API: {require("../config/env").ENV.API_URL}
        </Text>

        {renderMovieSection("🔥 Trending Today", trending)}
        {renderMovieSection("🎬 Popular Movies", popular)}
        {renderMovieSection("⭐ Top Rated", topRated)}

        {trending.length === 0 &&
          popular.length === 0 &&
          topRated.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="film-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>No movies found</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchMovies(false)}
              >
                <Ionicons name="refresh" size={18} color={Colors.white} />
                <Text style={styles.retryText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 30,
    gap: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 12,
    gap: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginLeft: 20,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 15,
  },
});

export default HomeScreen;
