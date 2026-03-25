import { Text, View } from 'react-native';

export default function ExamsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        
      }}
    >
      <Text 
        style={{
          fontSize: 25,
        }}
      >
        Exams
      </Text>
    </View>
  );
}
