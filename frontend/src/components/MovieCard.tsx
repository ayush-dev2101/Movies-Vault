import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const posterPath = movie?.poster_path || movie?.posterPath;
  const imageUri = getImageUrl(posterPath, 'w500');
  const title = movie?.title || movie?.name || 'Unknown Title';
  const rating = movie?.vote_average || movie?.rating;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(movie)}
      activeOpacity={0.75}
    >
      <View style={[styles.imageWrapper, { width, height: width * 1.5 }]}>
        {imageLoading && !imageError && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        {imageError ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { width, height: width * 1.5 }]}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>
            ★ {rating != null ? Number(rating).toFixed(1) : 'N/A'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    marginBottom: 15,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  imageWrapper: {
    backgroundColor: Colors.surfaceLight,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  infoContainer: {
    padding: 8,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
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
