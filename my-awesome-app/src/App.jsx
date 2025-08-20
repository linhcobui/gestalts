import React, { useState, useRef, useEffect } from 'react';
import localforage from 'localforage';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

function ProfileTab({ user }) {
  return (
    <Box sx={{
          height: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 2,
        }}>
      <Avatar
        src={user.picture}
        alt={user.name}
        sx={{ width: 80, height: 80, margin: 'auto', mb: 2 }}
      />
      <Typography variant="h5" gutterBottom>
        Welcome back, {user.name}!
      </Typography>
      <Typography variant="body1">Email: {user.email}</Typography>
    </Box>
  );
}

function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load sessions from localForage on mount
  useEffect(() => {
    const loadSessions = async () => {
      const saved = (await localforage.getItem('sessions')) || [];
      setSessions(saved);
    };
    loadSessions();
  }, []);

  // Select session to listen to
  const onSelectSession = (session) => {
    // Create a URL from the Blob for audio playback
    const url = URL.createObjectURL(session.audioBlob);
    setSelectedSession({ ...session, audioURL: url });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }} elevation={1}>
        <Typography variant="h6">Analysis</Typography>
        <Typography variant="body2" color="text.secondary">
          To be developed...
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Your Sessions
      </Typography>

      {sessions.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No sessions recorded yet.
        </Typography>
      )}

      <List>
        {sessions.map((session) => (
          <ListItemButton
            key={session.id}
            selected={selectedSession?.id === session.id}
            onClick={() => onSelectSession(session)}
          >
            <ListItemText
              primary={session.name}
              secondary={`${session.date} — Duration: ${session.duration}s`}
            />
          </ListItemButton>
        ))}
      </List>

      {selectedSession && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">{selectedSession.name}</Typography>
          <audio
            controls
            src={selectedSession.audioURL}
            style={{ width: '100%' }}
          />
        </Box>
      )}
    </Box>
  );
}



function RecordTab() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert('Your browser does not support audio recording');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or error occurred');
      console.error(err);
    }
  };

  const stopRecording = async () => {
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);

      // Create session object
      const session = {
        id: Date.now().toString(),
        name: `Session ${new Date().toLocaleString()}`,
        date: new Date().toLocaleString(),
        duration: Math.round(audioBlob.size / 16000),
        audioBlob, // store the blob itself
      };

      // Retrieve old sessions
      const oldSessions = (await localforage.getItem('sessions')) || [];
      oldSessions.push(session);

      // Save updated sessions
      await localforage.setItem('sessions', oldSessions);
      console.log('Session saved to localForage!');
    };

    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        px: 2,
      }}
    >
      {!recording ? (
        <Button variant="contained" onClick={startRecording}>
          Record New Session
        </Button>
      ) : (
        <Button variant="outlined" color="error" onClick={stopRecording}>
          Stop Recording
        </Button>
      )}

      {audioURL && (
        <Box mt={3}>
          <Typography variant="subtitle1">Your recording:</Typography>
          <audio controls src={audioURL} />
        </Box>
      )}
    </Box>
  );
}

const DEV_MODE = true;  // Set this to false for production

export default function App() {
  // Normal Auth0 hooks
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  // Dev-mode mocked user and auth state
  const mockUser = {
    name: 'Linh Co Bui',
    email: 'linhcobui@example.com',
    picture: 'https://scontent.fmel18-1.fna.fbcdn.net/v/t39.30808-1/440414533_829342372395831_733636898518807187_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=109&ccb=1-7&_nc_sid=e99d92&_nc_ohc=LSi2CezEUJUQ7kNvwGUiCNQ&_nc_oc=AdkFE01nhyy1GJa6iuC-e6RbV_Jc8fc5ANkzhhxhtOB--nCdTdugyNttxriVIHax6h8&_nc_zt=24&_nc_ht=scontent.fmel18-1.fna&_nc_gid=C3PuIoqzLlubRkVj5IVdQg&oh=00_AfWUlHRJ9uwilYl21KUu4HrRMY_ExIND68FPHrQn2xDo6Q&oe=68A1F01A',
  };

  const [tab, setTab] = useState('profile');

  if (isLoading) return <div>Loading...</div>;

  // If dev mode, pretend user is authenticated and inject mock user
  if (DEV_MODE) {
    return (
      <Box sx={{ pb: 7 }}>
        {tab === 'profile' && (
          <>
            <ProfileTab user={mockUser} />
            {/* Logout button only in Profile tab */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => alert('Logout disabled in dev mode')}
              >
                Log Out
              </Button>
            </Box>
          </>
        )}
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'record' && <RecordTab />}

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={tab}
            onChange={(event, newValue) => {
              setTab(newValue);
            }}
          >
            <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
            <BottomNavigationAction label="Sessions" value="sessions" icon={<ListIcon />} />
            <BottomNavigationAction label="Record" value="record" icon={<FiberManualRecordIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    );
  }

  // Normal Auth0 auth flow
  if (!isAuthenticated) {
    return (
      <Box sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 2,
        }}>
        <Typography variant="h3" gutterBottom>
          Gestalts Tracker
        </Typography>
        <Button variant="contained" onClick={() => loginWithRedirect()}>
          Log In / Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 7 }}>
      {tab === 'profile' && (
        <>
          <ProfileTab user={user} />
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={() => logout({ returnTo: window.location.origin })}>
              Log Out
            </Button>
          </Box>
        </>
      )}
      {tab === 'sessions' && <SessionsTab />}
      {tab === 'record' && <RecordTab />}

      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={tab}
          onChange={(event, newValue) => {
            setTab(newValue);
          }}
        >
          <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
          <BottomNavigationAction label="Sessions" value="sessions" icon={<ListIcon />} />
          <BottomNavigationAction label="Record" value="record" icon={<FiberManualRecordIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

// export default function App() {
//   const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

//   const [tab, setTab] = useState('profile');

//   if (isLoading) return <div>Loading...</div>;

//   if (!isAuthenticated) {
//     return (
//       <Box sx={{ textAlign: 'center', mt: 5 }}>
//         <Typography variant="h3" gutterBottom>
//           Gestalts Tracker
//         </Typography>
//         <Button variant="contained" onClick={() => loginWithRedirect()}>
//           Log In / Sign Up
//         </Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ pb: 7 }}>
//       {/* Content */}
//       {tab === 'profile' && (
//         <>
//           <ProfileTab user={user} />
//           {/* Logout button only in Profile tab */}
//           <Box sx={{ textAlign: 'center', mt: 2 }}>
//             <Button variant="outlined" onClick={() => logout({ returnTo: window.location.origin })}>
//               Log Out
//             </Button>
//           </Box>
//         </>
//       )}
//       {tab === 'sessions' && <SessionsTab />}
//       {tab === 'record' && <RecordTab />}

//       {/* Bottom navigation bar */}
//       <Paper
//         sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
//         elevation={3}
//       >
//         <BottomNavigation
//           showLabels
//           value={tab}
//           onChange={(event, newValue) => {
//             setTab(newValue);
//           }}
//         >
//           <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
//           <BottomNavigationAction label="Sessions" value="sessions" icon={<ListIcon />} />
//           <BottomNavigationAction label="Record" value="record" icon={<FiberManualRecordIcon />} />
//         </BottomNavigation>
//       </Paper>
//     </Box>
//   );
// }
