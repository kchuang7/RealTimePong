Real-Time Pong with Socket.io
=============================

Features
--------

Minimal dependencies outside of Express for the web server, socket.io for the full-duplex real-time channel, and shortid for unique room id generation. I have attempted to provide adequate commenting explaining all major blocks of code. 

**Multiple Room Support**

- Maximum of 2 players (socket.io connects) per room
- 1-click unique room creation
- Identified with simple URL with unique room id

**Dedicated Game Loops per Room**

- Prototypal creation of unique game loop object per room
- Game loop only runs when room is full with 2 players
- Self-correcting game loop compensates for drift while requiring low CPU loads
- Server-sided game state to prevent client tampering

**Vanilla Javascript Frontend**

- Separate game loop on client updates canvas play field at 60 FPS
- Client state updated with every server loop cycle
- Augmented with EJS for basic templating