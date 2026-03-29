import { Text, View, FlatList, TouchableOpacity, Linking } from "react-native";

export default function ExercisesScreen() {
  const exercises = [
    {
      id: "1",
      title: "Workout Plan 1",
      pdf: "https://pages.up.pt/~up353972/slides/?s=html5#1",
    },
  ];

  const openPDF = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openPDF(item.pdf)}
            style={{
              padding: 15,
              marginBottom: 10,
              backgroundColor: "#eee",
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
