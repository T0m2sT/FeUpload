import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";

const POSTS = [
    ['First Post', 'Hello World', "ES"],
    ['Second Post', 'Goodbye World', "ME"],
]

const FORUMS = ["DA", "ES", "ME"]

export default function SimpleForum() {
  const [view, setView] = useState("feed");
  const [activeForum, setActiveForum] = useState(FORUMS[0]);
  const [showForumList, setShowForumList] = useState(false);
  const [posts, setPosts] = useState([

  ]);
  const [inputTitle, setInputTitle] = useState("");
  const [inputBody, setInputBody] = useState("");
  const [inputForum, setInputForum] = useState(FORUMS[0]);

  const addPost = () => {
    setPosts([{ title: inputTitle, body: inputBody, page: inputForum }, ...posts]);
    setInputTitle("");
    setInputBody("");
    setView("feed");
    setActiveForum(inputForum);
  };

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <TouchableOpacity onPress={() => setView("feed")}>
          <Text style={{ fontWeight: view === "feed" ? "bold" : "normal" }}>FEED</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView("new")}>
          <Text style={{ fontWeight: view === "new" ? "bold" : "normal" }}>NEW POST</Text>
        </TouchableOpacity>
      </View>

      {view === "feed" ? (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "center", padding: 15, backgroundColor: '#f9f9f9', marginTop: 10 }}>
            {FORUMS.map((f) => (
              <TouchableOpacity key={f} onPress={() => setActiveForum(f)} style={{ marginHorizontal: 15 }}>
                <Text style={{ fontWeight: activeForum === f ? "bold" : "normal", color: activeForum === f ? "blue" : "gray" }}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView>
            {posts
              .filter(item => item.page === activeForum)
              .map((item, index) => (
                <View key={index} style={{ padding: 20, borderBottomWidth: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
                  <Text>{item.body}</Text>
                </View>
              ))}
          </ScrollView>
        </View>
      ) : (
        <View style={{ padding: 20 }}>
          <TextInput
            placeholder="Enter title..."
            value={inputTitle}
            onChangeText={setInputTitle}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TextInput
            placeholder="Write your post"
            value={inputBody}
            onChangeText={setInputBody}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />

          <Text style={{marginBottom: 10}}>Choose your Forum</Text>
          <TouchableOpacity
            style ={{marginBottom: 20, padding: 10, borderWidth: 1}}
            onPress={() => setShowForumList(!showForumList)}
          >
            <Text>{inputForum}</Text>
          </TouchableOpacity>

          {showForumList && (
            <View style={{marginBottom: 20}}>
              {FORUMS.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setInputForum(item);
                    setShowForumList(false);
                  }}
                  style={{padding: 10, backgroundColor: '#eee', marginBottom: 5}}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity onPress={addPost} style={{ backgroundColor: 'blue', padding: 10 }}>
            <Text style={{ color: 'white', textAlign: 'center' }}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}