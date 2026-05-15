// CODE CREATED BY GEMINI
// UPDATED WITH FIREBASE INTEGRATION

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  SafeAreaView,
  Alert 
} from 'react-native';
import '@react-native-firebase/app';
import database from '@react-native-firebase/database';

// Mock database simulating MiLB historical and current statistics
const INITIAL_PLAYERS = [
  {
    id: '1',
    name: 'Jackson Holliday',
    team: 'Norfolk Tides (AAA)',
    position: 'SS',
    currentStats: { avg: '.294', hr: '12', rbi: '51', ops: '.912', g: '65' },
    historicalStats: [
      { year: '2023', team: 'Aberdeen (A+)', avg: '.314', hr: '5', rbi: '32', ops: '.940' },
      { year: '2023', team: 'Bowie (AA)', avg: '.338', hr: '3', rbi: '15', ops: '.921' },
      { year: '2022', team: 'Delmarva (A)', avg: '.238', hr: '1', rbi: '4', ops: '.778' }
    ],
    gameLogs: [
      { date: '05/14', opp: 'dur', ab: '4', r: '2', h: '2', rbi: '1', hr: '1' },
      { date: '05/13', opp: 'dur', ab: '5', r: '1', h: '1', rbi: '0', hr: '0' },
      { date: '05/11', opp: 'clt', ab: '3', r: '0', h: '0', rbi: '0', hr: '0' }
    ]
  },
  {
    id: '2',
    name: 'Dylan Crews',
    team: 'Rochester Red Wings (AAA)',
    position: 'OF',
    currentStats: { avg: '.281', hr: '14', rbi: '48', ops: '.885', g: '58' },
    historicalStats: [
      { year: '2023', team: 'Fredericksburg (A)', avg: '.355', hr: '5', rbi: '22', ops: '1.050' },
      { year: '2023', team: 'Harrisburg (AA)', avg: '.208', hr: '0', rbi: '5', ops: '.598' }
    ],
    gameLogs: [
      { date: '05/14', opp: 'buf', ab: '4', r: '1', h: '3', rbi: '3', hr: '1' },
      { date: '05/12', opp: 'buf', ab: '4', r: '0', h: '0', rbi: '0', hr: '0' },
      { date: '05/10', opp: 'syr', ab: '5', r: '2', h: '2', rbi: '1', hr: '0' }
    ]
  }
];

export default function App() {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // current, historical, logs
  const [loading, setLoading] = useState(true);
  
  // Form input states
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');

  // Load players from Firebase on app start
  useEffect(() => {
    loadPlayersFromFirebase();
  }, []);

  const loadPlayersFromFirebase = () => {
    setLoading(true);
    try {
      const unsubscribe = database()
        .ref('players')
        .on('value', (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const playerList = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value
            }));
            setPlayers(playerList);
          } else {
            // If no data in Firebase, use initial players
            setPlayers(INITIAL_PLAYERS);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error loading players from Firebase:', error);
          setLoading(false);
          // Fallback to initial players if Firebase fails
          setPlayers(INITIAL_PLAYERS);
        });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase connection error:', error);
      setLoading(false);
      setPlayers(INITIAL_PLAYERS);
    }
  };

  // Add a new player with starter mock data fields
  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }
    
    const newPlayer = {
      name: playerName,
      team: playerTeam || 'Unassigned (Rookie)',
      position: playerPosition || 'IF',
      currentStats: { avg: '.000', hr: '0', rbi: '0', ops: '.000', g: '0' },
      historicalStats: [
        { year: '2025', team: 'Draft Camp', avg: '.000', hr: '0', rbi: '0', ops: '.000' }
      ],
      gameLogs: [
        { date: 'N/A', opp: 'NONE', ab: '0', r: '0', h: '0', rbi: '0', hr: '0' }
      ]
    };

    try {
      // Save to Firebase
      await database().ref('players').push(newPlayer);
      
      // Clear form
      setPlayerName('');
      setPlayerTeam('');
      setPlayerPosition('');
      
      Alert.alert('Success', 'Player added successfully!');
    } catch (error) {
      console.error('Error saving player to Firebase:', error);
      Alert.alert('Error', 'Failed to add player. Check your Firebase connection.');
      
      // Fallback: add locally if Firebase fails
      const localPlayer = {
        id: Math.random().toString(),
        ...newPlayer
      };
      setPlayers([...players, localPlayer]);
      setPlayerName('');
      setPlayerTeam('');
      setPlayerPosition('');
    }
  };

  // Delete player from Firebase
  const handleDeletePlayer = async (playerId) => {
    try {
      await database().ref(`players/${playerId}`).remove();
      Alert.alert('Success', 'Player removed successfully!');
    } catch (error) {
      console.error('Error deleting player:', error);
      Alert.alert('Error', 'Failed to delete player.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>⚾ MiLB Tracker Pro</Text>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>⚾ MiLB Tracker Pro</Text>
      
      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Player Name (e.g. Walker Jenkins)" 
          value={playerName}
          onChangeText={setPlayerName}
        />
        <View style={styles.row}>
          <TextInput 
            style={[styles.input, { flex: 2, marginRight: 8 }]} 
            placeholder="Team (e.g. St. Paul)" 
            value={playerTeam}
            onChangeText={setPlayerTeam}
          />
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            placeholder="Pos (e.g. OF)" 
            value={playerPosition}
            onChangeText={setPlayerPosition}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleAddPlayer}>
          <Text style={styles.buttonText}>➕ Track New Player</Text>
        </TouchableOpacity>
      </View>

      {/* Roster List Section */}
      <Text style={styles.sectionTitle}>My Monitored Prospects ({players.length})</Text>
      <ScrollView style={styles.listContainer}>
        {players.map((player) => (
          <View key={player.id} style={{ marginBottom: 8 }}>
            <TouchableOpacity 
              style={styles.playerCard} 
              onPress={() => { setSelectedPlayer(player); setActiveTab('current'); }}
            >
              <View>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerDetails}>{player.team} • {player.position}</Text>
              </View>
              <Text style={styles.viewLink}>View Stats ➔</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete Player',
                  `Are you sure you want to remove ${player.name}?`,
                  [
                    { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                    { 
                      text: 'Delete', 
                      onPress: () => handleDeletePlayer(player.id),
                      style: 'destructive'
                    }
                  ]
                );
              }}
            >
              <Text style={{ color: '#ff3b30', fontSize: 12, fontWeight: '600' }}>🗑️ Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Deep-Dive Stats Modal */}
      {selectedPlayer && (
        <Modal animationType="slide" transparent={false} visible={!!selectedPlayer}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeaderView}>
              <View>
                <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                <Text style={styles.modalPlayerSub}>{selectedPlayer.team} • {selectedPlayer.position}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPlayer(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabBar}>
              {['current', 'historical', 'logs'].map((tab) => (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tab, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Body Render Engine */}
            <ScrollView style={styles.modalContent}>
              {activeTab === 'current' && (
                <View style={styles.statsCard}>
                  <Text style={styles.cardHeader}>Current Season Statistics</Text>
                  <View style={styles.grid}>
                    <View style={styles.gridItem}><Text style={styles.gridLabel}>G</Text><Text style={styles.gridValue}>{selectedPlayer.currentStats.g}</Text></View>
                    <View style={styles.gridItem}><Text style={styles.gridLabel}>AVG</Text><Text style={styles.gridValue}>{selectedPlayer.currentStats.avg}</Text></View>
                    <View style={styles.gridItem}><Text style={styles.gridLabel}>HR</Text><Text style={styles.gridValue}>{selectedPlayer.currentStats.hr}</Text></View>
                    <View style={styles.gridItem}><Text style={styles.gridLabel}>RBI</Text><Text style={styles.gridValue}>{selectedPlayer.currentStats.rbi}</Text></View>
                    <View style={styles.gridItem}><Text style={styles.gridLabel}>OPS</Text><Text style={styles.gridValue}>{selectedPlayer.currentStats.ops}</Text></View>
                  </View>
                </View>
              )}

              {activeTab === 'historical' && (
                <View>
                  <Text style={styles.cardHeader}>Historical Career Path</Text>
                  {selectedPlayer.historicalStats.map((hist, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableYear}>{hist.year}</Text>
                      <View style={styles.tableDataBlock}>
                        <Text style={styles.tableTeam}>{hist.team}</Text>
                        <Text style={styles.tableStats}>AVG: {hist.avg} | HR: {hist.hr} | OPS: {hist.ops}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === 'logs' && (
                <View>
                  <Text style={styles.cardHeader}>Recent Game Action Logs</Text>
                  {selectedPlayer.gameLogs.map((log, index) => (
                    <View key={index} style={styles.logRow}>
                      <Text style={styles.logDate}>{log.date} vs {log.opp.toUpperCase()}</Text>
                      <Text style={styles.logLine}>{log.h}-{log.ab}, {log.r} R, {log.rbi} RBI, {log.hr} HR</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#0f2042', marginVertical: 12, textAlign: 'center' },
  inputContainer: { backgroundColor: '#fff', padding: 14, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, marginBottom: 16 },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 6, marginBottom: 10, fontSize: 15 },
  row: { flexDirection: 'row' },
  button: { backgroundColor: '#0076ff', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#555', marginBottom: 8 },
  listContainer: { flex: 1 },
  playerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#0076ff' },
  playerName: { fontSize: 17, fontWeight: 'bold', color: '#222' },
  playerDetails: { fontSize: 13, color: '#666', marginTop: 2 },
  viewLink: { fontSize: 13, color: '#0076ff', fontWeight: '600' },
  deleteButton: { paddingHorizontal: 16, paddingVertical: 6, alignItems: 'flex-end' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeaderView: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#0f2042' },
  modalPlayerName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  modalPlayerSub: { fontSize: 14, color: '#b0c4de', marginTop: 2 },
  closeButton: { backgroundColor: '#ff3b30', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#0076ff' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#777' },
  activeTabText: { color: '#0076ff' },
  modalContent: { padding: 20 },
  cardHeader: { fontSize: 18, fontWeight: 'bold', color: '#0f2042', marginBottom: 14 },
  statsCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8 },
  grid: { flexDirection: 'row', justifyContent: 'space-around' },
  gridItem: { alignItems: 'center' },
  gridLabel: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 4 },
  gridValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  tableYear: { fontSize: 16, fontWeight: 'bold', color: '#444', width: 55 },
  tableDataBlock: { flex: 1 },
  tableTeam: { fontSize: 14, fontWeight: '600', color: '#111' },
  tableStats: { fontSize: 12, color: '#666', marginTop: 2 },
  logRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logDate: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  logLine: { fontSize: 14, color: '#555', marginTop: 2 }
});
