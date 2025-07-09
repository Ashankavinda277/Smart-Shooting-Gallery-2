const WebSocket = require('ws');

// Create a WebSocket server
const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });
  
  // Store connected clients by type
  const clients = {
    web: new Set(),
    nodeMCU: new Set()
  };
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress);
    
    // Initially mark as unidentified
    ws.clientType = 'unidentified';
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        // First check if the message is valid JSON
        const messageStr = message.toString().trim();
        console.log('Raw message received:', messageStr);
        
        // Handle non-JSON messages
        if (messageStr === 'jj' || messageStr === 'HIT') {
          console.log('Received simple hit message:', messageStr);
          
          // Create a proper hit message for web clients
          const hitData = {
            type: 'target_hit',
            targetId: 0,
            timestamp: Date.now(),
            score: 1,
            rawMessage: messageStr
          };
          
          // Forward to all web clients
          clients.web.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(hitData));
            }
          });
          
          return; // Exit early after handling the special case
        }
        
        // Try to parse as JSON for other messages
        const data = JSON.parse(messageStr);
        
        // Check if this is a device identification message
        if (data.type === 'identify') {
          if (data.clientType === 'nodeMCU') {
            console.log('NodeMCU device identified and registered');
            ws.clientType = 'nodeMCU';
            clients.nodeMCU.add(ws);
          } else if (data.clientType === 'web') {
            console.log('Web client identified and registered');
            ws.clientType = 'web';
            clients.web.add(ws);
          }
          
          // Send confirmation back to the client
          ws.send(JSON.stringify({ 
            type: 'identification_confirmed', 
            clientType: ws.clientType 
          }));
          
          return;
        }
        
        console.log(`Received data from ${ws.clientType}:`, data);
        
        // Process data from NodeMCU (which got it from Mega via Serial)
        if (ws.clientType === 'nodeMCU') {
          // Log the specific data from NodeMCU for debugging
          console.log('NodeMCU data received:', data);
          
          // Handle simple HIT message format
          if (data.type === 'hit' && data.value === 'HIT') {
            // Convert to the expected format for frontend
            const hitData = {
              type: 'target_hit',
              targetId: 0, // Default target ID
              timestamp: Date.now(),
              score: 1,    // Default score value
              hitValue: data.value
            };
            
            // Forward processed data to all web clients
            clients.web.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(hitData));
              }
            });
          } 
          // Handle any other JSON messages from NodeMCU
          else {
            // Forward Arduino Mega data to all web clients
            clients.web.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        
        // Handle unparseable messages more gracefully
        try {
          const rawMessage = message.toString().trim();
          console.log('Attempting to handle unparseable message:', rawMessage);
          
          // Create a fallback message format
          const fallbackData = {
            type: 'unparsed_message',
            rawContent: rawMessage,
            timestamp: Date.now(),
            clientType: ws.clientType || 'unknown'
          };
          
          // If it seems to be from a sensor or contains certain keywords
          if (rawMessage.includes('HIT') || 
              rawMessage.includes('hit') || 
              rawMessage.includes('target') ||
              ws.clientType === 'nodeMCU') {
            
            fallbackData.type = 'possible_hit_event';
            
            // Forward to web clients
            clients.web.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(fallbackData));
              }
            });
            
            console.log('Forwarded unparseable message as possible hit event');
          }
        } catch (fallbackError) {
          console.error('Failed to handle message with fallback method:', fallbackError);
        }
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      console.log(`WebSocket connection closed for client type: ${ws.clientType}`);
      if (ws.clientType === 'web') {
        clients.web.delete(ws);
      } else if (ws.clientType === 'nodeMCU') {
        clients.nodeMCU.delete(ws);
      }
    });
    
    // Send a welcome message and request identification
    ws.send(JSON.stringify({ 
      type: 'connection', 
      status: 'connected',
      message: 'Please identify yourself by sending a message with type:identify and clientType:nodeMCU or web'
    }));
  });
  
  return wss;
};

module.exports = setupWebSocketServer;
