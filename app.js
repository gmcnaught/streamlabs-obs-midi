/* App Entry Point - loads config, builds clients 
2020 Grant McNaught
*/

const config = require('config');
const easymidi = require('easymidi');
const Slobs = require('./lib/slobs.js');
const slobs = new Slobs('foo');
slobs.init();

async function main() {
  
  initMidi();
  
}

async function initMidi() {
  // Monitor all MIDI inputs with a single "message" listener
  easymidi.getInputs().forEach(inputName => {
    const input = new easymidi.Input(inputName);
    input.on('message', processMessage);
  });
}

async function processMessage(msg){
    let resource = await midiToResource(msg);
    let success = await slobs.setValues(resource.resourceId,'setDeflection',[calculateDeflection(msg.value)])
}

function calculateDeflection(currentVal){
  const MAX_VAL=127;
  const MIN_VAL=0;

  let percent = (currentVal-MIN_VAL)/(MAX_VAL-MIN_VAL);
  return percent;
}

async function midiToResource(msg){
    
    if (msg._type === 'cc'){
        let mapping = {
            5: 'Audio Input Capture',
            6: 'Desktop Audio',
            7: 'Alertbox'
        } 
        let audio = await slobs.basicRequest(
            'AudioService',
            'getSourcesForCurrentScene'
        );
        return audio.result.find((resource) => resource.name === mapping[msg.controller]);
    }
    
}

main();
