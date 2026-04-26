import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function OnboardingScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.topBlob} />

      <View style={styles.content}>
        <Text style={styles.title}>Chào mừng trở lại</Text>
        
        <View style={styles.illustrationPlaceholder}>
            <View style={styles.circleBg} />
            <Text style={{fontSize: 50}}>📱</Text>
        </View>

        <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
            testID="input-email"
            style={styles.input}
            placeholder="mary.elliot@mail.com"
            value={email}
            onChangeText={setEmail}
            />
            
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput 
            testID="input-password"
            style={styles.input}
            placeholder="••••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            testID="btn-login"
            style={styles.loginBtn}
            onPress={() => navigation?.navigate('Home')}
            >
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity><Text style={styles.signUpText}>Đăng ký</Text></TouchableOpacity>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topBlob: { position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#8B5CF6', opacity: 0.7 },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 100 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 40 },
  illustrationPlaceholder: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  circleBg: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: '#EEF2FF' },
  form: { width: '100%' },
  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 8 },
  input: { borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 12, fontSize: 16, marginBottom: 25 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 40 },
  forgotText: { color: '#6366F1', fontWeight: '700' },
  loginBtn: { backgroundColor: '#6366F1', paddingVertical: 18, borderRadius: 15, alignItems: 'center', shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  loginBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#4B5563' },
  signUpText: { color: '#6366F1', fontWeight: 'bold' }
});