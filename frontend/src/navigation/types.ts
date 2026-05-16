export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Splash: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTP: { email: string };
  OTPVerification: { email: string; type: 'verification' | 'password_reset' };
  ForgotPassword: undefined;
  ResetPassword: { email: string; otp: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Watchlist: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type MovieStackParamList = {
  MovieDetails: { movieId: number };
  CastDetails: { castId: number };
  Reviews: { movieId: number };
  Trailers: { movieId: number };
};
