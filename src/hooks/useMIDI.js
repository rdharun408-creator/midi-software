import { useState, useEffect, useCallback, useRef } from 'react';

export function useMIDI() {
  const [midiAccess, setMidiAccess] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [selectedInputId, setSelectedInputId] = useState('');
  const [selectedOutputId, setSelectedOutputId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [midiThruEnabled, setMidiThruEnabled] = useState(false);
  const [midiLog, setMidiLog] = useState([]);
  const [error, setError] = useState(null);

  const midiLogRef = useRef([]);

  const addLog = useCallback((message, type = 'info') => {
    const newLog = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), message, type };
    midiLogRef.current = [newLog, ...midiLogRef.current].slice(0, 100); // Keep last 100
    setMidiLog([...midiLogRef.current]);
  }, []);

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
              const outData = data2 !== undefined ? [newStatus, data1, data2] : [newStatus, data1];
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
  }, [midiAccess, selectedInputId, addLog, midiThruEnabled, selectedOutputId, selectedChannel]);

  const sendVoiceChange = useCallback((msb, lsb, program) => {
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
      // Send CC 0 (MSB)
      output.send([ccStatus, 0, parseInt(msb)]);
      // Send CC 32 (LSB)
      output.send([ccStatus, 32, parseInt(lsb)]);
      // Send PC (Program - 1)
      output.send([pcStatus, parseInt(program) - 1]);
      
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
    isConnected
  };
}
