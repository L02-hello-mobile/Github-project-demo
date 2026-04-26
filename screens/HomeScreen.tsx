import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [taskState, setTaskState] = useState('Xem nhiệm vụ');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar} />
            <View>
                <Text style={styles.helloText}>Hello!</Text>
                <Text style={styles.nameText}>Hello Mobile</Text>
            </View>
          </View>
          <Ionicons name="notifications" size={26} color="#1F2937" />
        </View>

        {/* Banner Tím Bo Góc */}
        <View style={styles.banner}>
          <View style={{flex: 1}}>
            <Text style={styles.bannerTitle}>Nhiệm vụ của bạn sắp hoàn thành!</Text>
            <TouchableOpacity 
              testID="btn-action"
              style={styles.bannerBtn} 
              onPress={() => setTaskState('Đang tải...')}
            >
              <Text style={styles.bannerBtnText}>{taskState}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressRing}>
             <View style={styles.innerCircle}>
                <Text style={styles.progressVal}>85%</Text>
             </View>
          </View>
        </View>

        {/* Đang diễn ra (Ngang) */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đang diễn ra <Text style={styles.count}>6</Text></Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hList}>
            <View style={styles.cardH}>
                <Text style={styles.tag}>Job fair</Text>
                <Text style={styles.cardHTitle}>Hỗ trợ gian hàng số 14</Text>
                <View style={styles.pBar}><View style={[styles.pFill, {width: '60%'}]} /></View>
            </View>
            <View style={[styles.cardH, {backgroundColor: '#FFEDD5'}]}>
                <Text style={styles.tag}>Âm nhạc</Text>
                <Text style={styles.cardHTitle}>Sound check</Text>
                <View style={styles.pBar}><View style={[styles.pFill, {width: '30%', backgroundColor: '#F97316'}]} /></View>
            </View>
        </ScrollView>

        {/* Sự kiện (Dọc) */}
        <Text style={styles.sectionTitle}>Sự kiện <Text style={styles.count}>4</Text></Text>
        <View style={styles.eventItem}>
            <View style={[styles.iconBox, {backgroundColor: '#FCE7F3'}]}><Ionicons name="briefcase" size={20} color="#DB2777" /></View>
            <View style={{flex: 1, marginLeft: 15}}>
                <Text style={styles.eventTitle}>Job fair</Text>
                <Text style={styles.eventSub}>23 Tasks</Text>
            </View>
            <Text style={styles.eventPercent}>70%</Text>
        </View>
        <View style={styles.eventItem}>
            <View style={[styles.iconBox, {backgroundColor: '#E0E7FF'}]}><Ionicons name="musical-notes" size={20} color="#4F46E5" /></View>
            <View style={{flex: 1, marginLeft: 15}}>
                <Text style={styles.eventTitle}>Câu lạc bộ âm nhạc</Text>
                <Text style={styles.eventSub}>30 Tasks</Text>
            </View>
            <Text style={styles.eventPercent}>52%</Text>
        </View>

      </ScrollView>

      {/* Thanh Menu Dưới (Bottom Tab giả) */}
      <View style={styles.bottomTab}>
        <Ionicons name="home" size={24} color="#6366F1" />
        <Ionicons name="calendar" size={24} color="#9CA3AF" />
        <View style={styles.fab}><Ionicons name="add" size={30} color="#FFF" /></View>
        <Ionicons name="document-text" size={24} color="#9CA3AF" />
        <Ionicons name="people" size={24} color="#9CA3AF" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFF' },
  scrollArea: { padding: 25, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#DDD', marginRight: 15 },
  helloText: { color: '#6B7280', fontSize: 14 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  banner: { backgroundColor: '#4F46E5', borderRadius: 30, padding: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 35 },
  bannerTitle: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 15, lineHeight: 22 },
  bannerBtn: { backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 15, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#4F46E5', fontWeight: 'bold' },
  progressRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: '#818CF8', justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 65, height: 65, borderRadius: 32.5, borderLeftWidth: 5, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', transform: [{rotate: '45deg'}] },
  progressVal: { color: '#FFF', fontWeight: 'bold', fontSize: 16, transform: [{rotate: '-45deg'}] },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  count: { color: '#8B5CF6', fontSize: 16 },
  hList: { overflow: 'visible', marginBottom: 35 },
  cardH: { width: 240, backgroundColor: '#EEF2FF', borderRadius: 25, padding: 20, marginRight: 15 },
  tag: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  cardHTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937', marginBottom: 25 },
  pBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3 },
  pFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },
  eventItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  eventTitle: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  eventSub: { color: '#9CA3AF', fontSize: 13 },
  eventPercent: { fontWeight: 'bold', color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB', padding: 8, borderRadius: 12 },
  bottomTab: { position: 'absolute', bottom: 0, width: '100%', height: 85, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 10 },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366F1', marginTop: -50, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});