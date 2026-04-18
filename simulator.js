// simulator.js
// This is the ENTRY POINT for the simulator
// Its only job is to start the interval loop
// ALL the simulator logic lives in src/services/simulatorService.js

import { sendReadings } from "./src/services/simulatorService.js";

// Send a reading from every device every 3 seconds
setInterval(sendReadings, 3000);