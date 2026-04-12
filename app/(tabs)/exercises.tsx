import { Text, View, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { pdfAssets } from '../../constants/Pdfs';

export default function ExercisesScreen() {
  const router = useRouter();

  const sections = [
    {
      id: "sample",
      title: "Introduction",
    },
    {
      id: "sample",
      title: "Chapter 1",
    },
    {
      id: "sample",
      title: "Chapter 2",
    },
  ];

  const openPDF = (id: string) => {
    // Navigate to our custom in-app viewer and pass the strict mapped id
    router.push({ pathname: "/pdf-viewer" as any, params: { id } });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={sections}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openPDF(item.id)}
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
