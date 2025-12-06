import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForceStore, Setup, HandType, GripType } from '../stores/forceStore';
import { Ionicons } from '@expo/vector-icons'; 

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { setups, deleteSetup, addSetup } = useForceStore();
  const [isModalVisible, setModalVisible] = useState(false);

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Setup", "Are you sure? History will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSetup(id) }
    ]);
  };

  const renderSetupItem = ({ item }: { item: Setup }) => (
    // Clicking the main card goes to TRAINING now
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('TrainingScreen', { 
        setupId: item.id, 
        contextName: `${item.hand} - ${item.grip}` 
      })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.hand} {item.grip}</Text>
          <Text style={styles.cardSubtitle}>{item.holdName}</Text>
        </View>
        <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={10}>
           <Ionicons name="trash-outline" size={22} color="#444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.tapPrompt}>Tap to Train</Text>
        <TouchableOpacity 
          style={styles.historyBtn}
          onPress={() => navigation.navigate('HistoryScreen', { setupId: item.id, title: item.holdName })}
        >
          <Ionicons name="stats-chart" size={16} color="#00D1FF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={setups}
        keyExtractor={(item) => item.id}
        renderItem={renderSetupItem}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No setups found.</Text>
                <Text style={styles.emptySubText}>Create a new configuration to start training.</Text>
            </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>

      <AddSetupModal visible={isModalVisible} onClose={() => setModalVisible(false)} onAdd={addSetup} />
    </View>
  );
}

// --- MODAL COMPONENT ---
const AddSetupModal = ({ visible, onClose, onAdd }: any) => {
  const [hand, setHand] = useState<HandType>('Right');
  const [grip, setGrip] = useState<GripType>('Half Crimp');
  const [holdName, setHoldName] = useState('');

  const handleSave = () => {
    if (!holdName.trim()) return alert("Please enter a hold name");
    onAdd(hand, grip, holdName);
    setHoldName('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Configuration</Text>
          
          <Text style={styles.label}>Hand:</Text>
          <View style={styles.row}>
             {['Left', 'Right', 'Both'].map((h: any) => (
               <TouchableOpacity key={h} onPress={() => setHand(h)} style={[styles.selectBtn, hand === h && styles.selectedBtn]}>
                 <Text style={[styles.selectText, hand === h && styles.selectedText]}>{h}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={styles.label}>Grip:</Text>
          <View style={styles.row}>
             {['Open', 'Half Crimp', 'Full Crimp'].map((g: any) => (
               <TouchableOpacity key={g} onPress={() => setGrip(g)} style={[styles.selectBtn, grip === g && styles.selectedBtn]}>
                 <Text style={[styles.selectText, grip === g && styles.selectedText]}>{g}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={styles.label}>Hold Name:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. 20mm edge" 
            placeholderTextColor="#666"
            value={holdName}
            onChangeText={setHoldName}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveText}>Create</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', paddingHorizontal: 20 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#666', marginTop: 10 },
  
  card: { backgroundColor: '#222', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { color: '#aaa', fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 },
  tapPrompt: { color: '#00D1FF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  historyBtn: { padding: 5 },

  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#00D1FF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#222', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#888', marginBottom: 8, marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  selectBtn: { padding: 8, borderWidth: 1, borderColor: '#444', borderRadius: 6 },
  selectedBtn: { backgroundColor: '#00D1FF', borderColor: '#00D1FF' },
  selectText: { color: '#888' },
  selectedText: { color: '#000', fontWeight: 'bold' },
  input: { backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 8, marginTop: 5 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 25, gap: 20 },
  saveBtn: { backgroundColor: '#00D1FF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveText: { color: '#000', fontWeight: 'bold' },
  cancelText: { color: '#aaa' }
});