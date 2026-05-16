import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Colors from '../constants/Colors';
import { getImageUrl } from '../services/tmdb';

interface MovieCardProps {
  movie: any;
  onPress: (movie: any) => void;
  width?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = SCREEN_WIDTH / 2 - 20;

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress, width = DEFAULT_WIDTH }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { width }]} 
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: getImageUrl(movie.poster_path) }}
        style={[styles.image, { width, height: width * 1.5 }]}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>★ {movie.vote_average?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    marginBottom: 15,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  infoContainer: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default MovieCard;
