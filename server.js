/**
 * WARNING: This server contains a known vulnerability (CVE-2025-55182)
 * For educational and security research purposes only.
 * DO NOT use in production or expose to untrusted networks.
 */

import express from 'express';
import session from 'express-session';
import multer from 'multer';
import rscServer from 'react-server-dom-webpack/server';
import { createElement } from 'react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { renderToReadableStream } = rscServer;
const upload = multer();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Session configuration
app.use(session({
  secret: 'demo-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Body parser for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// RSC Flight protocol endpoint - VULNERABLE to CVE-2025-55182
// Supports both JSON and multipart/form-data (Flight protocol)
app.post('/rsc', upload.any(), async (req, res) => {
  try {
    console.log('🐦 Flight message received at the castle gates...');
    console.log('Content-Type:', req.headers['content-type']);
    
    // Debug: Log what we receive
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request files:', req.files ? req.files.length : 0);
    
    // =================================================================
    // VULNERABLE CODE PATH: Flight Protocol Deserialization
    // The castle trusts ALL messages from Flight without validation!
    // =================================================================
    
    // Helper function to try executing RCE payload
    const tryExecuteRCE = (payloadStr, source) => {
      try {
        console.log('🔍 Castle guards checking ' + source + ' message...');
        
        let payload0;
        if (typeof payloadStr === 'string') {
          payload0 = JSON.parse(payloadStr);
        } else if (typeof payloadStr === 'object') {
          payload0 = payloadStr;
        } else {
          return false;
        }
        
        // Check for _response._prefix pattern (CVE-2025-55182 exploit structure)
        if (payload0 && payload0._response && payload0._response._prefix) {
          const codeToExecute = payload0._response._prefix;
          console.log('');
          console.log('🦹 ==========================================');
          console.log('🦹 THE IMPOSTER HAS INFILTRATED THE CASTLE!');
          console.log('🦹 ==========================================');
          console.log('📜 Imposters secret scroll:');
          console.log(codeToExecute);
          console.log('🦹 ==========================================');
          console.log('');
          
          // UNSAFE: Direct code execution - this IS the vulnerability
          // The castle blindly trusts and executes the message!
          const require = (name) => {
            const modules = { fs, path };
            if (modules[name]) return modules[name];
            throw new Error('Module ' + name + ' not available');
          };
          eval(codeToExecute);
          
          return true;
        }
        return false;
      } catch (e) {
        console.log('⚠️  Error in ' + source + ':', e.message);
        return false;
      }
    };
    
    // Method 1: Handle multipart/form-data (Flight protocol format)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const content = file.buffer.toString('utf8');
        console.log('📄 File field "' + file.fieldname + '":', content.substring(0, 100));
        
        if (tryExecuteRCE(content, 'multipart-form')) {
          res.json({ success: true, message: 'The Imposter has executed their plan!' });
          return;
        }
      }
    }
    
    // Method 2: Handle JSON body with Flight payload in field "0"
    if (req.body && req.body['0']) {
      console.log('📄 Body field "0":', String(req.body['0']).substring(0, 100));
      
      if (tryExecuteRCE(req.body['0'], 'json-body-field-0')) {
        res.json({ success: true, message: 'The Imposter has executed their plan!' });
        return;
      }
    }
    
    // Method 3: Check if body itself is the payload (direct JSON)
    if (req.body && req.body._response && req.body._response._prefix) {
      if (tryExecuteRCE(req.body, 'direct-json-body')) {
        res.json({ success: true, message: 'The Imposter has executed their plan!' });
        return;
      }
    }
    
    // =================================================================
    // Normal application logic (non-exploit path)
    // =================================================================
    
    const { action, payload } = req.body;

    if (action === 'callServerFunction') {
      const { moduleId, functionName, args } = payload;
      const modulePath = path.join(__dirname, 'src', 'server-components', moduleId + '.js');
      
      if (fs.existsSync(modulePath)) {
        const module = await import(modulePath);
        const serverFunction = module[functionName];

        if (typeof serverFunction === 'function') {
          const result = await serverFunction(...args);
          res.json({ success: true, result });
        } else {
          res.status(400).json({ success: false, error: 'Invalid function' });
        }
      } else {
        res.status(404).json({ success: false, error: 'Module not found' });
      }
    } else if (action === 'renderRSC') {
      const stream = await renderToReadableStream(
        createElement(req.body.component, req.body.props),
        {
          onError: (error) => {
            console.error('RSC render error:', error);
          }
        }
      );

      res.setHeader('Content-Type', 'text/x-component');
      res.setHeader('X-React-Server-Component', '1');
      
      const reader = stream.getReader();
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (error) {
          console.error('Stream error:', error);
          res.end();
        }
      };
      pump();
    } else {
      res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('RSC endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main application route - The Kingdom of Reactland
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>⚔️ The Kingdom of Reactland - Royal Castle Portal</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
      <script crossorigin src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Crimson Text', serif;
          min-height: 100vh;
          background: 
            radial-gradient(ellipse at top, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes flyBird {
          0% { transform: translateX(-100px) translateY(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateX(50vw) translateY(-30px); }
          90% { opacity: 1; }
          100% { transform: translateX(100vw) translateY(0); opacity: 0; }
        }
        .flying-bird {
          position: fixed;
          top: 15%;
          font-size: 2rem;
          animation: flyBird 12s ease-in-out infinite;
          z-index: 100;
          filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));
        }
        .stars {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .star {
          position: absolute;
          width: 3px;
          height: 3px;
          background: white;
          border-radius: 50%;
          animation: twinkle 2s ease-in-out infinite;
        }
      </style>
    </head>
    <body>
      <div class="stars" id="stars"></div>
      <div class="flying-bird">🐦</div>
      <div id="root"></div>
      
      <script>
        // Create twinkling stars
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 50; i++) {
          const star = document.createElement('div');
          star.className = 'star';
          star.style.left = Math.random() * 100 + '%';
          star.style.top = Math.random() * 60 + '%';
          star.style.animationDelay = Math.random() * 2 + 's';
          star.style.opacity = Math.random() * 0.5 + 0.3;
          starsContainer.appendChild(star);
        }
      </script>
      
      <script type="text/babel">
        const { useState } = React;

        // Castle Component
        function CastleSVG({ size = 120 }) {
          return (
            <svg viewBox="0 0 100 100" style={{width: size, height: size}}>
              {/* Castle base */}
              <rect x="15" y="50" width="70" height="45" fill="#4a3728" stroke="#2d1f14" strokeWidth="2"/>
              {/* Main tower */}
              <rect x="35" y="25" width="30" height="70" fill="#5c4033" stroke="#2d1f14" strokeWidth="2"/>
              {/* Left tower */}
              <rect x="10" y="35" width="20" height="60" fill="#4a3728" stroke="#2d1f14" strokeWidth="2"/>
              {/* Right tower */}
              <rect x="70" y="35" width="20" height="60" fill="#4a3728" stroke="#2d1f14" strokeWidth="2"/>
              {/* Tower tops */}
              <polygon points="50,5 35,25 65,25" fill="#8b0000" stroke="#5c0000" strokeWidth="1"/>
              <polygon points="20,20 10,35 30,35" fill="#8b0000" stroke="#5c0000" strokeWidth="1"/>
              <polygon points="80,20 70,35 90,35" fill="#8b0000" stroke="#5c0000" strokeWidth="1"/>
              {/* Door */}
              <path d="M42 95 L42 70 Q50 62 58 70 L58 95" fill="#2d1f14" stroke="#1a1a1a" strokeWidth="2"/>
              {/* Windows */}
              <rect x="45" y="40" width="10" height="12" fill="#ffd700" opacity="0.8"/>
              <rect x="15" y="50" width="8" height="10" fill="#ffd700" opacity="0.6"/>
              <rect x="77" y="50" width="8" height="10" fill="#ffd700" opacity="0.6"/>
              {/* Flags */}
              <line x1="50" y1="5" x2="50" y2="-5" stroke="#5c4033" strokeWidth="2"/>
              <polygon points="50,-5 65,0 50,5" fill="#ffd700"/>
            </svg>
          );
        }

        // Royal Seal Component
        function RoyalSeal() {
          return (
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 15px',
              position: 'relative',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <svg viewBox="0 0 100 100" style={{width: '100%', height: '100%'}}>
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#ffd700'}} />
                    <stop offset="50%" style={{stopColor: '#ffed4a'}} />
                    <stop offset="100%" style={{stopColor: '#b8860b'}} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#goldGrad)" strokeWidth="3" filter="url(#glow)"/>
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#goldGrad)" strokeWidth="1"/>
                {/* Crown */}
                <path d="M30 55 L35 35 L42 45 L50 30 L58 45 L65 35 L70 55 Z" fill="url(#goldGrad)" filter="url(#glow)"/>
                {/* Jewels on crown */}
                <circle cx="50" cy="38" r="3" fill="#ff0000"/>
                <circle cx="38" cy="45" r="2" fill="#00ff00"/>
                <circle cx="62" cy="45" r="2" fill="#0066ff"/>
                <text x="50" y="75" textAnchor="middle" fill="#ffd700" fontSize="8" fontFamily="Cinzel" fontWeight="600">REACTLAND</text>
              </svg>
            </div>
          );
        }

        function Login({ onLoginSuccess }) {
          const [username, setUsername] = React.useState('');
          const [password, setPassword] = React.useState('');
          const [error, setError] = React.useState('');
          const [loading, setLoading] = React.useState(false);

          const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);

            try {
              const response = await fetch('/rsc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'callServerFunction',
                  payload: {
                    moduleId: 'AuthServer',
                    functionName: 'validateLogin',
                    args: [username, password]
                  }
                })
              });

              const result = await response.json();
              if (result.success && result.result.success) {
                onLoginSuccess(result.result.user);
              } else {
                setError(result.result?.error || 'The castle gates remain sealed!');
              }
            } catch (err) {
              setError('A dark fog prevents entry to the castle!');
              console.error(err);
            } finally {
              setLoading(false);
            }
          };

          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              padding: '20px'
            }}>
              {/* Header */}
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <RoyalSeal />
                <h1 style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  color: '#ffd700',
                  textShadow: '0 0 20px rgba(255,215,0,0.4), 2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '3px',
                  marginBottom: '5px'
                }}>The Kingdom of Reactland</h1>
                <p style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1rem',
                  color: '#a0a0c0',
                  letterSpacing: '2px'
                }}>Royal Castle Portal</p>
              </div>

              {/* Login Card - Castle Gate */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(74,55,40,0.95) 0%, rgba(45,31,20,0.98) 100%)',
                border: '3px solid #8b4513',
                borderRadius: '12px',
                padding: '35px 40px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.1)',
                position: 'relative'
              }}>
                {/* Decorative top */}
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50)',
                  fontSize: '1.8rem'
                }}>🏰</div>

                <h2 style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1.3rem',
                  color: '#ffd700',
                  textAlign: 'center',
                  marginBottom: '25px',
                  marginTop: '10px'
                }}>⚔️ Enter the Castle Gates ⚔️</h2>

                <p style={{
                  textAlign: 'center',
                  color: '#c4a47c',
                  fontSize: '0.95rem',
                  marginBottom: '25px',
                  fontStyle: 'italic'
                }}>
                  "Only trusted villagers may pass through Flight's sacred link..."
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{marginBottom: '20px'}}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#d4a574',
                      fontSize: '0.9rem',
                      fontFamily: 'Cinzel, serif',
                      letterSpacing: '1px'
                    }}>🧙 Villager Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Enter thy name..."
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(20,15,10,0.8)',
                        border: '2px solid #5c4033',
                        borderRadius: '6px',
                        color: '#f0e6d3',
                        fontSize: '1rem',
                        fontFamily: 'Crimson Text, serif',
                        outline: 'none'
                      }}
                      disabled={loading}
                    />
                  </div>
                  
                  <div style={{marginBottom: '25px'}}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#d4a574',
                      fontSize: '0.9rem',
                      fontFamily: 'Cinzel, serif',
                      letterSpacing: '1px'
                    }}>🔑 Secret Passphrase</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'rgba(20,15,10,0.8)',
                        border: '2px solid #5c4033',
                        borderRadius: '6px',
                        color: '#f0e6d3',
                        fontSize: '1rem',
                        fontFamily: 'Crimson Text, serif',
                        outline: 'none'
                      }}
                      disabled={loading}
                    />
                  </div>
                  
                  {error && (
                    <div style={{
                      background: 'rgba(139,0,0,0.3)',
                      border: '2px solid #8b0000',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '20px',
                      color: '#ff6b6b',
                      fontSize: '0.95rem',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      ⚠️ {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: loading ? '#3d2817' : 'linear-gradient(180deg, #8b4513 0%, #5c2d0a 100%)',
                      border: '2px solid #ffd700',
                      borderRadius: '6px',
                      color: '#ffd700',
                      fontSize: '1.1rem',
                      fontFamily: 'Cinzel, serif',
                      fontWeight: '600',
                      letterSpacing: '2px',
                      cursor: loading ? 'wait' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 15px rgba(139,69,19,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                    disabled={loading}
                  >
                    {loading ? '🐦 Sending Flight...' : '🏰 Open the Gates'}
                  </button>
                </form>

                <div style={{
                  marginTop: '25px',
                  padding: '15px',
                  background: 'rgba(139,69,19,0.2)',
                  border: '1px solid #5c4033',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <p style={{color: '#8b7355', fontSize: '0.8rem', marginBottom: '8px', fontFamily: 'Cinzel'}}>
                    📜 Known Villagers of the Realm
                  </p>
                  <p style={{color: '#a08060', fontSize: '0.85rem', fontFamily: 'Crimson Text'}}>
                    <strong>admin</strong> / securepassword123<br/>
                    <strong>user1</strong> / password123
                  </p>
                </div>
              </div>

              <p style={{
                marginTop: '30px',
                color: '#4a4a6a',
                fontSize: '0.8rem',
                textAlign: 'center',
                fontFamily: 'Crimson Text',
                fontStyle: 'italic'
              }}>
                "The Flight protocol carries messages between villagers and castle..."
              </p>
            </div>
          );
        }

        function Dashboard({ user, onLogout }) {
          const treasures = [
            { id: 'GOLD-001', name: 'The Dragon\\'s Hoard', amount: '50,000 gold coins', status: 'SECURED' },
            { id: 'GOLD-002', name: 'Crown Jewels of Reactland', amount: '12 precious gems', status: 'SECURED' },
            { id: 'GOLD-003', name: 'Ancient Spell Scrolls', amount: '147 scrolls', status: 'SECURED' },
            { id: 'GOLD-004', name: 'Royal Tax Collection', amount: '25,000 silver', status: 'PENDING' },
          ];

          const villagers = [
            { name: 'Sir Edmund', role: 'Knight Commander', location: 'Northern Wall', status: 'ON DUTY' },
            { name: 'Lady Marianne', role: 'Court Wizard', location: 'Tower of Magic', status: 'RESEARCHING' },
            { name: 'Brother Thomas', role: 'Royal Scribe', location: 'Great Library', status: 'ON DUTY' },
            { name: 'Master Chen', role: 'Castle Architect', location: 'East Wing', status: 'BUILDING' },
          ];

          return (
            <div style={{minHeight: '100vh', color: '#e8dcc8'}}>
              {/* Top Banner */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(74,55,40,0.98) 0%, rgba(45,31,20,0.95) 100%)',
                borderBottom: '3px solid #8b4513',
                padding: '15px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                  <span style={{fontSize: '2rem'}}>🏰</span>
                  <div>
                    <h1 style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '1.4rem',
                      color: '#ffd700',
                      letterSpacing: '2px'
                    }}>Kingdom of Reactland</h1>
                    <p style={{fontSize: '0.75rem', color: '#a08060', fontStyle: 'italic'}}>
                      The Castle's Inner Chambers
                    </p>
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                  <div style={{textAlign: 'right'}}>
                    <p style={{color: '#ffd700', fontFamily: 'Cinzel', fontSize: '0.95rem'}}>
                      🧙 {user.username}
                    </p>
                    <p style={{color: '#c4a47c', fontSize: '0.8rem'}}>
                      {user.role === 'admin' ? '👑 Royal Administrator' : '🏠 Trusted Villager'}
                    </p>
                  </div>
                  <button 
                    onClick={onLogout}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(139,0,0,0.3)',
                      border: '2px solid #8b0000',
                      borderRadius: '6px',
                      color: '#ff6b6b',
                      fontSize: '0.9rem',
                      fontFamily: 'Cinzel, serif',
                      cursor: 'pointer'
                    }}
                  >
                    🚪 Leave Castle
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div style={{padding: '30px', maxWidth: '1200px', margin: '0 auto'}}>
                {/* Welcome Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139,69,19,0.3) 0%, rgba(74,55,40,0.3) 100%)',
                  border: '2px solid #8b4513',
                  borderRadius: '12px',
                  padding: '25px 30px',
                  marginBottom: '30px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '20px',
                    background: 'rgba(139,0,0,0.8)',
                    border: '2px solid #ffd700',
                    borderRadius: '4px',
                    padding: '5px 15px',
                    transform: 'rotate(3deg)'
                  }}>
                    <span style={{color: '#ffd700', fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: '2px'}}>
                      👑 ROYAL ACCESS
                    </span>
                  </div>
                  
                  <h2 style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.6rem',
                    color: '#ffd700',
                    marginBottom: '15px'
                  }}>Welcome to the Castle, {user.username}!</h2>
                  <p style={{color: '#c4a47c', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: '1.6'}}>
                    You have passed through the sacred Flight link and entered the castle's inner chambers.
                    Here lies the kingdom's most precious treasures and secrets...
                  </p>
                  <div style={{
                    marginTop: '20px',
                    display: 'flex',
                    gap: '25px',
                    fontSize: '0.9rem',
                    color: '#a08060'
                  }}>
                    <span>🐦 Flight Status: <span style={{color: '#90EE90'}}>Connected</span></span>
                    <span>🏰 Location: Royal Treasury</span>
                    <span>⚔️ Guard Status: Active</span>
                  </div>
                </div>

                {/* Grid Layout */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px'}}>
                  
                  {/* Royal Treasury */}
                  <div style={{
                    background: 'rgba(45,31,20,0.9)',
                    border: '2px solid #8b4513',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(90deg, #5c2d0a, #8b4513)',
                      padding: '15px 20px',
                      borderBottom: '2px solid #ffd700'
                    }}>
                      <h3 style={{
                        fontFamily: 'Cinzel, serif',
                        color: '#ffd700',
                        fontSize: '1.1rem',
                        letterSpacing: '2px'
                      }}>💰 The Royal Treasury</h3>
                    </div>
                    <div style={{padding: '15px'}}>
                      {treasures.map(item => (
                        <div key={item.id} style={{
                          background: 'rgba(20,15,10,0.6)',
                          border: '1px solid #5c4033',
                          borderRadius: '8px',
                          padding: '15px',
                          marginBottom: '12px'
                        }}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div>
                              <p style={{color: '#8b7355', fontSize: '0.8rem', fontFamily: 'monospace'}}>{item.id}</p>
                              <p style={{color: '#f0e6d3', fontSize: '1rem', marginTop: '5px', fontWeight: '600'}}>{item.name}</p>
                              <p style={{color: '#c4a47c', fontSize: '0.9rem', marginTop: '3px'}}>{item.amount}</p>
                            </div>
                            <span style={{
                              padding: '4px 10px',
                              background: item.status === 'SECURED' ? 'rgba(0,100,0,0.3)' : 'rgba(200,150,0,0.3)',
                              border: item.status === 'SECURED' ? '1px solid #228b22' : '1px solid #daa520',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: item.status === 'SECURED' ? '#90EE90' : '#ffd700'
                            }}>{item.status === 'SECURED' ? '🔒' : '⏳'} {item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Castle Inhabitants */}
                  <div style={{
                    background: 'rgba(45,31,20,0.9)',
                    border: '2px solid #8b4513',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: 'linear-gradient(90deg, #5c2d0a, #8b4513)',
                      padding: '15px 20px',
                      borderBottom: '2px solid #ffd700'
                    }}>
                      <h3 style={{
                        fontFamily: 'Cinzel, serif',
                        color: '#ffd700',
                        fontSize: '1.1rem',
                        letterSpacing: '2px'
                      }}>👥 Castle Inhabitants</h3>
                    </div>
                    <div style={{padding: '15px'}}>
                      {villagers.map(v => (
                        <div key={v.name} style={{
                          background: 'rgba(20,15,10,0.6)',
                          border: '1px solid #5c4033',
                          borderRadius: '8px',
                          padding: '15px',
                          marginBottom: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <p style={{color: '#ffd700', fontFamily: 'Cinzel', fontSize: '1rem'}}>{v.name}</p>
                            <p style={{color: '#c4a47c', fontSize: '0.85rem'}}>{v.role}</p>
                            <p style={{color: '#8b7355', fontSize: '0.8rem'}}>📍 {v.location}</p>
                          </div>
                          <span style={{
                            padding: '4px 10px',
                            background: 'rgba(0,100,0,0.2)',
                            border: '1px solid #5c4033',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#90EE90'
                          }}>{v.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Warning Scroll */}
                <div style={{
                  marginTop: '30px',
                  padding: '25px',
                  background: 'linear-gradient(135deg, rgba(139,69,19,0.2) 0%, rgba(45,31,20,0.3) 100%)',
                  border: '2px solid #8b4513',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <p style={{color: '#ffd700', fontFamily: 'Cinzel', letterSpacing: '2px', marginBottom: '15px', fontSize: '1.1rem'}}>
                    📜 Royal Decree 📜
                  </p>
                  <p style={{color: '#c4a47c', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.8', maxWidth: '700px', margin: '0 auto'}}>
                    "These treasures are protected by the sacred Flight link. The castle trusts all messages 
                    that arrive through Flight, for only true villagers know the way... 
                    <span style={{color: '#ff6b6b'}}>or so we believed.</span>"
                  </p>
                  <p style={{color: '#8b7355', fontSize: '0.85rem', marginTop: '15px'}}>
                    — His Majesty, King React the Nineteenth
                  </p>
                </div>
              </div>
            </div>
          );
        }

        function App() {
          const [user, setUser] = React.useState(null);

          const handleLoginSuccess = (userData) => {
            setUser(userData);
          };

          const handleLogout = () => {
            setUser(null);
          };

          if (!user) {
            return <Login onLoginSuccess={handleLoginSuccess} />;
          }

          return <Dashboard user={user} onLogout={handleLogout} />;
        }

        window.addEventListener('load', () => {
          try {
            if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
              console.error('React or ReactDOM not loaded');
              document.getElementById('root').innerHTML = '<p style="padding: 2rem; color: red;">The magical scrolls failed to load!</p>';
              return;
            }
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } catch (error) {
            console.error('Error rendering app:', error);
            document.getElementById('root').innerHTML = '<p style="padding: 2rem; color: red;">A dark spell has disrupted the castle: ' + error.message + '</p>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\\n🏰 The Castle of Reactland is now open!`);
  console.log(`⚠️  WARNING: The Flight protocol trusts all messages (CVE-2025-55182)`);
  console.log(`⚠️  For educational purposes only\\n`);
  console.log('🐦 Flight endpoint: http://localhost:' + PORT + '/rsc');
  console.log('🏰 Castle gates: http://localhost:' + PORT);
});
