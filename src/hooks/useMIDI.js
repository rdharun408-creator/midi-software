import { useState, useEffect, useCallback, useRef } from 'react';

// Browser-side Drum Sequencer Patterns for Yamaha XG Tone Generator (MIDI Channel 10)
const DRUM_PATTERNS = {
  // Bhangra Pop (16 steps of 1/16 notes, 96 ticks total)
  1: {
    length: 96,
    stepSize: 6,
    steps: {
      0: [36, 42],   // Bass Drum + Closed Hat
      6: [42],
      12: [40, 42],  // Stick + Closed Hat
      18: [42],
      24: [36, 42],  // Bass Drum + Closed Hat
      30: [36],
      36: [40, 42],  // Stick + Closed Hat
      42: [42],
      48: [36, 42],
      54: [42],
      60: [40, 42],
      66: [42],
      72: [36, 42],
      78: [36],
      84: [40, 42],
      90: [46]       // Open Hat
    }
  },
  // Teen Taal (16 beats of 1/8 notes, 16 steps * 12 ticks = 192 ticks)
  101: {
    length: 192,
    stepSize: 12,
    steps: {
      0: [36, 38],   // Dha
      12: [38],      // Dhin
      24: [38],      // Dhin
      36: [36, 38],  // Dha
      48: [36, 38],  // Dha
      60: [38],      // Dhin
      72: [38],      // Dhin
      84: [36, 38],  // Dha
      96: [36, 40],  // Dha (cowbell/tin)
      108: [40],     // Tin
      120: [40],     // Tin
      132: [36, 40], // Ta
      144: [36, 38], // Ta
      156: [38],     // Dhin
      168: [38],     // Dhin
      180: [36, 38]  // Dha
    }
  },
  // Kaharwa (8 steps of 1/8 notes, 96 ticks)
  109: {
    length: 96,
    stepSize: 12,
    steps: {
      0: [36, 38],   // Dha
      12: [36],      // Ge
      24: [41],      // Na
      36: [36],      // Ka
      48: [38],      // Dhin
      60: [36],      // Ge
      72: [41],      // Na
      84: [36]       // Ka
    }
  },
  // Dadra (6 steps of 1/8 notes, 72 ticks)
  110: {
    length: 72,
    stepSize: 12,
    steps: {
      0: [36, 38],   // Dha
      12: [38],      // Dhi
      24: [41],      // Na
      36: [36, 38],  // Dha
      48: [40],      // Ti
      60: [41]       // Na
    }
  },
  // 8Beat Standard (16 steps of 1/16 notes, 96 ticks)
  201: {
    length: 96,
    stepSize: 6,
    steps: {
      0: [36, 42],   // Kick + Closed Hat
      6: [42],       // Closed Hat
      12: [38, 42],  // Snare + Closed Hat
      18: [42],
      24: [36, 42],  // Kick + Closed Hat
      30: [36],      // Kick
      36: [38, 42],  // Snare + Closed Hat
      42: [42],
      48: [36, 42],
      54: [42],
      60: [38, 42],
      66: [42],
      72: [36, 42],
      78: [36],
      84: [38, 42],
      90: [46]       // Open Hat
    }
  },
  // Disco Fever (16 steps of 1/16 notes, 96 ticks)
  231: {
    length: 96,
    stepSize: 6,
    steps: {
      0: [36, 42],       // Kick + Closed Hat
      6: [46],           // Open Hat
      12: [36, 38, 42],  // Kick + Snare + Closed Hat
      18: [46],
      24: [36, 42],
      30: [46],
      36: [36, 38, 42],
      42: [46],
      48: [36, 42],
      54: [46],
      60: [36, 38, 42],
      66: [46],
      72: [36, 42],
      78: [46],
      84: [36, 38, 42],
      90: [46]
    }
  },
  // Bossa Nova (8 steps of 1/8 notes, 96 ticks)
  251: {
    length: 96,
    stepSize: 12,
    steps: {
      0: [36, 37, 42],   // Kick + Rimshot + Closed Hat
      12: [42],
      24: [37, 42],      // Rimshot + Closed Hat
      36: [36, 42],
      48: [42],
      60: [37, 42],
      72: [36, 42],
      84: [37, 46]       // Rimshot + Open Hat
    }
  }
};

const getPatternForStyle = (styleNo) => {
  if (DRUM_PATTERNS[styleNo]) return DRUM_PATTERNS[styleNo];
  if (styleNo >= 100 && styleNo <= 130) return DRUM_PATTERNS[109]; // Fallback to Kaharwa
  if (styleNo >= 230 && styleNo <= 250) return DRUM_PATTERNS[231]; // Fallback to Disco
  if (styleNo >= 250) return DRUM_PATTERNS[251];                  // Fallback to Bossa Nova
  return DRUM_PATTERNS[201];                                      // Fallback to 8Beat
};

const getKitForStyle = (styleNo, category) => {
  if (category === 'Riyaz') {
    return { msb: 126, lsb: 0, program: 116 }; // Tabla Kit 1
  }
  if (category === 'Indian' || styleNo === 1) {
    return { msb: 126, lsb: 1, program: 109 }; // Indian Kit 1
  }
  if (category === 'Dance & DJ') {
    return { msb: 127, lsb: 0, program: 26 };  // Analog Kit
  }
  return { msb: 127, lsb: 0, program: 1 };     // Standard Kit 1
};

export function useMIDI(options = {}) {
  const { enableLogging = false } = options;
  const [midiAccess, setMidiAccess] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [selectedInputId, setSelectedInputId] = useState('');
  const [selectedOutputId, setSelectedOutputId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [midiThruEnabled, setMidiThruEnabled] = useState(false);
  const [midiLog, setMidiLog] = useState([]);
  const [error, setError] = useState(null);
  
  // New States for Style/Beat Control & Transpose
  const [transpose, setTransposeState] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [midiClockSync, setMidiClockSync] = useState(false);
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [beatPlayerMode, setBeatPlayerMode] = useState('sync'); // 'sync' (Hardware sync) or 'auto' (App beats)
  const activeStyleRef = useRef(null);
  const tickCountRef = useRef(0);
  const nextTickTimeRef = useRef(0);

  const midiLogRef = useRef([]);

  const addLog = useCallback((message, type = 'info') => {
    const newLog = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), message, type };
    midiLogRef.current = [newLog, ...midiLogRef.current].slice(0, 100); // Keep last 100
    if (enableLogging) {
      setMidiLog([...midiLogRef.current]);
    }
  }, [enableLogging]);

  // Sync log history when logging is enabled (switching to Monitor tab)
  useEffect(() => {
    if (enableLogging) {
      setMidiLog([...midiLogRef.current]);
    }
  }, [enableLogging]);

  const updateDevices = useCallback((access) => {
    if (!access) return;
    const inputList = Array.from(access.inputs.values());
    const outputList = Array.from(access.outputs.values());
    
    setInputs(inputList);
    setOutputs(outputList);

    // Verify if currently selected output device is still available, if not, reset or auto-select
    setSelectedOutputId(prev => {
      const isStillAvailable = outputList.some(o => o.id === prev);
      if (isStillAvailable) return prev;
      
      // Auto-select first Yamaha or first available if none selected / previous is gone
      if (outputList.length > 0) {
        const yamaha = outputList.find(o => o.name.toLowerCase().includes('yamaha'));
        return yamaha ? yamaha.id : outputList[0].id;
      }
      return '';
    });

    // Verify if currently selected input device is still available, if not, reset or auto-select
    setSelectedInputId(prev => {
      const isStillAvailable = inputList.some(i => i.id === prev);
      if (isStillAvailable) return prev;

      if (inputList.length > 0) {
        const yamaha = inputList.find(i => i.name.toLowerCase().includes('yamaha'));
        return yamaha ? yamaha.id : inputList[0].id;
      }
      return '';
    });
  }, []);

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setError('Web MIDI API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    navigator.requestMIDIAccess({ sysex: false })
      .then((access) => {
        setMidiAccess(access);
        updateDevices(access);
        
        access.onstatechange = (e) => {
          updateDevices(e.target);
          addLog(`Device ${e.port.state}: ${e.port.name}`, 'info');
        };
      })
      .catch((err) => {
        setError('Failed to access MIDI devices. Please ensure you granted permission.');
        console.error(err);
      });
  }, [updateDevices, addLog]);

  // Handle incoming MIDI messages for monitor
  useEffect(() => {
    if (!midiAccess || !selectedInputId) return;
    
    const input = midiAccess.inputs.get(selectedInputId);
    if (!input) return;

    const handleMidiMessage = (message) => {
      const [status, data1, data2] = message.data;
      const cmd = status >> 4;
      const channel = (status & 0xf) + 1;
      
      let logMsg = `Raw: [${message.data.join(', ')}]`;
      
      if (cmd === 8 || (cmd === 9 && data2 === 0)) {
        logMsg = `Note Off: CH${channel} Note:${data1}`;
      } else if (cmd === 9) {
        logMsg = `Note On: CH${channel} Note:${data1} Vel:${data2}`;
      } else if (cmd === 11) {
        logMsg = `CC: CH${channel} CC:${data1} Val:${data2}`;
      } else if (cmd === 12) {
        logMsg = `PC: CH${channel} Prog:${data1 + 1}`;
      } else if (cmd === 14) {
        logMsg = `Pitch Bend: CH${channel} Val:${(data2 << 7) | data1}`;
      }

      addLog(`IN: ${logMsg}`, 'rx');

      if (midiThruEnabled && selectedOutputId) {
        const output = midiAccess.outputs.get(selectedOutputId);
        if (output) {
          // Forward Note On, Note Off, Sustain (CC 64), and Pitch Bend
          if (cmd === 8 || cmd === 9 || cmd === 14 || (cmd === 11 && data1 === 64)) {
            // Re-route to the selected output channel
            const newStatus = (cmd << 4) | (selectedChannel - 1);
            try {
              // Apply transpose offset if it's a Note On/Off event
              let finalNote = data1;
              if (cmd === 8 || cmd === 9) {
                finalNote = Math.max(0, Math.min(127, data1 + transpose));
              }
              const outData = data2 !== undefined ? [newStatus, finalNote, data2] : [newStatus, finalNote];
              output.send(outData);
            } catch (err) {
              console.error("MIDI Thru Error:", err);
            }
          }
        }
      }
    };

    input.onmidimessage = handleMidiMessage;

    return () => {
      input.onmidimessage = null;
    };
  }, [midiAccess, selectedInputId, addLog, midiThruEnabled, selectedOutputId, selectedChannel, transpose]);

  const sendVoiceChange = useCallback((msb, lsb, program, voiceName = '') => {
    if (msb === null || lsb === null || program === null || msb === undefined || lsb === undefined || program === undefined) {
      addLog(`INFO: ${voiceName || 'This patch'} is a keyboard-internal voice and cannot be selected via MIDI.`, 'info');
      return false;
    }

    if (!midiAccess || !selectedOutputId) {
      addLog('Error: No MIDI output selected', 'error');
      return false;
    }

    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) {
      addLog('Error: MIDI output not found', 'error');
      return false;
    }

    const channelIndex = selectedChannel - 1; // 0-15
    
    // Status bytes
    const ccStatus = 0xB0 + channelIndex;
    const pcStatus = 0xC0 + channelIndex;

    try {
      const now = performance.now();
      // Send CC 0 (MSB)
      output.send([ccStatus, 0, parseInt(msb)], now);
      // Send CC 32 (LSB) with a tiny 5ms delay to allow hardware synth buffer to process bank select
      output.send([ccStatus, 32, parseInt(lsb)], now + 5);
      // Send PC (Program - 1) with a 10ms delay to commit bank and program change in order
      output.send([pcStatus, parseInt(program) - 1], now + 10);
      
      addLog(`OUT: Voice Change CH${selectedChannel} [MSB:${msb} LSB:${lsb} PC:${program}]`, 'tx');
      return true;
    } catch (err) {
      console.error(err);
      addLog(`Error sending MIDI: ${err.message}`, 'error');
      return false;
    }
  }, [midiAccess, selectedOutputId, selectedChannel, addLog]);

  const sendTestNote = useCallback(() => {
    if (!midiAccess || !selectedOutputId) {
      addLog('Error: No MIDI output selected', 'error');
      return;
    }

    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) return;

    const channelIndex = selectedChannel - 1;
    const noteOnStatus = 0x90 + channelIndex;
    const noteOffStatus = 0x80 + channelIndex;
    const middleC = 60;
    const velocity = 100;

    try {
      output.send([noteOnStatus, middleC, velocity]);
      addLog(`OUT: Test Note On CH${selectedChannel}`, 'tx');
      
      setTimeout(() => {
        output.send([noteOffStatus, middleC, 0]);
        addLog(`OUT: Test Note Off CH${selectedChannel}`, 'tx');
      }, 500);
    } catch (err) {
      console.error(err);
      addLog(`Error sending Test Note: ${err.message}`, 'error');
    }
  }, [midiAccess, selectedOutputId, selectedChannel, addLog]);

  // High-precision, look-ahead Web MIDI clock & sequencer scheduler
  useEffect(() => {
    if (!isClockRunning || !midiAccess || !selectedOutputId) return;

    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) return;

    const LOOK_AHEAD_MS = 100;
    const SCHEDULE_INTERVAL_MS = 25;
    const intervalMs = 60000 / (bpm * 24);
    
    // Initialize or clamp next tick time to avoid scheduling old ticks
    const now = performance.now();
    if (nextTickTimeRef.current < now) {
      nextTickTimeRef.current = now;
    }

    const schedule = () => {
      const currentTime = performance.now();
      const scheduleAheadUntil = currentTime + LOOK_AHEAD_MS;

      try {
        while (nextTickTimeRef.current < scheduleAheadUntil) {
          const scheduledTime = nextTickTimeRef.current;

          // 1. Send clock sync pulse (if sync is enabled or we are in hardware sync mode)
          if (midiClockSync || beatPlayerMode === 'sync') {
            output.send([0xF8], scheduledTime);
          }

          // 2. Play sequenced drum note on Channel 10 (if in auto mode and active style is set)
          if (beatPlayerMode === 'auto' && activeStyleRef.current) {
            const pattern = getPatternForStyle(activeStyleRef.current.no);
            if (pattern) {
              const currentTick = tickCountRef.current;
              
              if (pattern.steps && pattern.steps[currentTick]) {
                const notes = pattern.steps[currentTick];
                notes.forEach(noteNumber => {
                  // Send Note On to Channel 10 (0x99) at precise scheduled time
                  output.send([0x99, noteNumber, 100], scheduledTime);
                  // Schedule Note Off (0x89) exactly 80ms later
                  output.send([0x89, noteNumber, 0], scheduledTime + 80);
                });
              }

              // Advance tick count
              tickCountRef.current = (currentTick + 1) % pattern.length;
            }
          }

          nextTickTimeRef.current += intervalMs;
        }
      } catch (err) {
        console.error("Scheduler MIDI send error:", err);
      }
    };

    // Run scheduler immediately and set up periodic interval
    schedule();
    const timerId = setInterval(schedule, SCHEDULE_INTERVAL_MS);

    return () => {
      clearInterval(timerId);
    };
  }, [isClockRunning, midiClockSync, beatPlayerMode, bpm, midiAccess, selectedOutputId]);

  const sendMidiStart = useCallback((selectedStyle) => {
    if (!midiAccess || !selectedOutputId) {
      addLog('Error: No MIDI output selected', 'error');
      return;
    }
    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) return;

    try {
      // Stash active style in ref and reset tick count and scheduling clock
      activeStyleRef.current = selectedStyle || { no: 201, category: 'Pop & Rock' };
      tickCountRef.current = 0;
      nextTickTimeRef.current = 0;

      if (beatPlayerMode === 'auto') {
        // Send Program Change on Channel 10 to select the correct drum kit
        const kit = getKitForStyle(activeStyleRef.current.no, activeStyleRef.current.category);
        const now = performance.now();
        // Channel 10 is index 9 (0xB9 for CC, 0xC9 for PC)
        output.send([0xB9, 0, kit.msb], now);
        output.send([0xB9, 32, kit.lsb], now + 5);
        output.send([0xC9, kit.program - 1], now + 10);
        addLog(`OUT: Loading Auto Drum Kit [MSB:${kit.msb} LSB:${kit.lsb} PC:${kit.program}] on CH10`, 'tx');
      } else {
        // Send MIDI Start for hardware rhythm sync
        output.send([0xFA]);
      }

      setIsClockRunning(true);
      addLog(`OUT: Beat Start (${beatPlayerMode === 'auto' ? 'Auto Beat' : 'MIDI Start FA'})`, 'tx');
    } catch (err) {
      console.error(err);
      addLog(`Error starting playback: ${err.message}`, 'error');
    }
  }, [midiAccess, selectedOutputId, beatPlayerMode, addLog]);

  const sendMidiStop = useCallback(() => {
    if (!midiAccess || !selectedOutputId) {
      addLog('Error: No MIDI output selected', 'error');
      return;
    }
    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) return;

    try {
      if (beatPlayerMode === 'auto') {
        // Send All Notes Off to Channel 10 (CC 120 and 123) just in case
        output.send([0xB9, 120, 0]);
        output.send([0xB9, 123, 0]);
      } else {
        // Send MIDI Stop for hardware rhythm sync
        output.send([0xFC]);
      }
      setIsClockRunning(false);
      addLog(`OUT: Beat Stop (${beatPlayerMode === 'auto' ? 'Auto Beat' : 'MIDI Stop FC'})`, 'tx');
    } catch (err) {
      console.error(err);
      addLog(`Error stopping playback: ${err.message}`, 'error');
    }
  }, [midiAccess, selectedOutputId, beatPlayerMode, addLog]);

  const changeActiveStyle = useCallback((style) => {
    if (!style) return;
    activeStyleRef.current = style;
    
    // If sequencer is playing in auto mode, update the kit immediately
    if (isClockRunning && beatPlayerMode === 'auto' && midiAccess && selectedOutputId) {
      const output = midiAccess.outputs.get(selectedOutputId);
      if (output) {
        const kit = getKitForStyle(style.no, style.category);
        const now = performance.now();
        output.send([0xB9, 0, kit.msb], now);
        output.send([0xB9, 32, kit.lsb], now + 5);
        output.send([0xC9, kit.program - 1], now + 10);
        addLog(`OUT: Dynamic Kit Change [MSB:${kit.msb} LSB:${kit.lsb} PC:${kit.program}] on CH10`, 'tx');
      }
    }
  }, [isClockRunning, beatPlayerMode, midiAccess, selectedOutputId, addLog]);

  const sendMasterTranspose = useCallback((semitones) => {
    const clamped = Math.max(-12, Math.min(12, semitones));
    setTransposeState(clamped);

    if (!midiAccess || !selectedOutputId) return;
    const output = midiAccess.outputs.get(selectedOutputId);
    if (!output) return;

    const val = 64 + clamped; // 0x40 = 64 is 0 transpose
    try {
      output.send([0xF0, 0x43, 0x10, 0x4C, 0x00, 0x00, 0x06, val, 0xF7]);
      addLog(`OUT: Keyboard Transpose ${clamped > 0 ? '+' : ''}${clamped} (SysEx)`, 'tx');
    } catch (err) {
      console.error(err);
      addLog(`Error sending Transpose SysEx: ${err.message}`, 'error');
    }
  }, [midiAccess, selectedOutputId, addLog]);

  const clearLog = () => {
    midiLogRef.current = [];
    setMidiLog([]);
  };

  const isConnected = !!(selectedOutputId && outputs.some(out => out.id === selectedOutputId));

  return {
    inputs,
    outputs,
    selectedInputId,
    setSelectedInputId,
    selectedOutputId,
    setSelectedOutputId,
    selectedChannel,
    setSelectedChannel,
    midiThruEnabled,
    setMidiThruEnabled,
    sendVoiceChange,
    sendTestNote,
    midiLog,
    clearLog,
    error,
    isConnected,
    // Style/Beat controls & Transpose exports
    bpm,
    setBpm,
    midiClockSync,
    setMidiClockSync,
    isClockRunning,
    sendMidiStart,
    sendMidiStop,
    transpose,
    sendMasterTranspose,
    beatPlayerMode,
    setBeatPlayerMode,
    changeActiveStyle
  };
}
