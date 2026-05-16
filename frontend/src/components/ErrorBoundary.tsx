import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MovieVault] Global Crash:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>System Error</Text>
            <Text style={styles.subtitle}>The application encountered a runtime crash.</Text>
          </View>
          
          <ScrollView style={styles.errorBox}>
            <Text style={styles.errorText}>
              {this.state.error?.toString()}
            </Text>
          </ScrollView>

          <TouchableOpacity 
            style={styles.button}
            onPress={this.handleReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    marginBottom: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center'
  },
  errorBox: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 12,
    maxHeight: 300,
    marginBottom: 20
  },
  errorText: {
    color: '#FF3B30',
    fontFamily: 'monospace',
    fontSize: 12
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ErrorBoundary;
