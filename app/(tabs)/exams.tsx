import { FlatList, Linking, Text, TouchableOpacity, View } from 'react-native';

export default function ExamsScreen() {
  const exams = [
    {
      id: "1",
      title: "DA Test 2023",
      pdf: "https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link",
    },
  ];

  const openPDF = (url: string) => {
    Linking.openURL(url)
  };

  return (
    <View style={{
      flex: 1,
      padding: 20,
      justifyContent: "center",
      alignContent: "center"
      }}>
      <FlatList
        contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        }}
        data={exams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openPDF(item.pdf)}
            style={{
              padding: 15,
              marginBottom: 10,
              backgroundColor: "#eee",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );}
