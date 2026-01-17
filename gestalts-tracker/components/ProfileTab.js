import { Button, Image, StyleSheet, Text, View } from 'react-native';

export default function ProfileTab({ user, onLogout, devMode }) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.picture }}
        style={styles.avatar}
      />
      <Text style={styles.welcomeText}>
        Welcome back, {user.name}!
      </Text>
      <Text style={styles.emailText}>
        Email: {user.email}
      </Text>
      
      <View style={styles.logoutButton}>
        <Button
          title="Log Out"
          onPress={onLogout}
          color="#666"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    marginTop: 20,
  },
});