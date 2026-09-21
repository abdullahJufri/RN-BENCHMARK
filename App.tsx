import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DataBenchmarkScreen from './src/screens/DataBenchmarkScreen';
import SearchBenchmarkScreen from './src/screens/SearchBenchmarkScreen';
import FormBenchmarkScreen from './src/screens/FormBenchmarkScreen';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#6200EE',
          tabBarInactiveTintColor: '#999',
          headerStyle: { backgroundColor: '#F3E5F5' },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
          tabBarStyle: { height: 60, paddingBottom: 6 },
        }}
      >
        <Tab.Screen
          name="DataBenchmark"
          component={DataBenchmarkScreen}
          options={{
            title: 'Data Masif',
            headerTitle: '📊 Data Masif Benchmark RN',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
          }}
        />
        <Tab.Screen
          name="SearchBenchmark"
          component={SearchBenchmarkScreen}
          options={{
            title: 'Search',
            headerTitle: '🔍 Search Benchmark RN',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔍</Text>,
          }}
        />
        <Tab.Screen
          name="FormBenchmark"
          component={FormBenchmarkScreen}
          options={{
            title: 'Form',
            headerTitle: '📝 Form Benchmark RN',
            tabBarIcon: () => <Text style={{ fontSize: 20 }}>📝</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
