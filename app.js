/* App Entry Point - loads config, builds clients 
2020 Grant McNaught
*/

const config = require('config');
const easymidi = require('easymidi');
const Slobs = require('./lib/slobs.js');
const slobs = new Slobs('foo');
slobs.init();

async function main() {
  console.log('Initializing...');
  initMidi();
}

async function initMidi() {
  // Monitor all MIDI inputs with a single "message" listener
  easymidi.getInputs().forEach(inputName => {
    const input = new easymidi.Input(inputName);
    input.on('message', processMessage);
  });
}

async function processMessage(msg) {
  let resource = await midiToResource(msg);
  if (resource) {
    let success = await slobs.setValues(resource.resourceId, 'setDeflection', [
      calculateDeflection(msg.value)
    ]);
  }
}

function calculateDeflection(currentVal) {
  const MAX_VAL = 127;
  const MIN_VAL = 0;

  let percent = (currentVal - MIN_VAL) / (MAX_VAL - MIN_VAL);
  return percent;
}

async function midiToResource(msg) {
  if (msg._type === 'cc') {
    let mapping = {
      5: 'Mic/Aux',
      6: 'Desktop Audio',
      7: 'Alertbox'
    };
    let audio = await slobs.basicRequest(
      'AudioService',
      'getSourcesForCurrentScene'
    );
    return audio.result.find(
      resource => resource.name === mapping[msg.controller]
    );
  } else if (msg._type === 'noteoff') {
    let mapping = {
      36: toggleMute.bind(this,'Mic/Aux'),
      37: toggleMute.bind(this,'Desktop Audio'),
      38: toggleVisibility.bind(this,'Webcam Source'),
      39: toggleVisibility.bind(this,'Game Capture'),
      40: switchScene.bind(this,'Live Scene'),
      41: switchScene.bind(this,'Cam-Closeup'),
      42: switchScene.bind(this,'Be Right Back'),
      43: switchScene.bind(this,'Stream Ending Soon')
    };
    let result = await mapping[msg.note]();
  } //else console.log(msg);
  return null;
}
async function toggleMute(deviceName) {
  let audio = await slobs.basicRequest(
    'AudioService',
    'getSourcesForCurrentScene'
  );
  let resource = audio.result.find(resource => resource.name === deviceName);
  let update = await slobs.setValues(resource.resourceId, 'setMuted', [
    !resource.muted
  ]);

  return update;
}
async function toggleVisibility(deviceName){
  //console.log(deviceName);
  let activeScene = await slobs.basicRequest('ScenesService','activeScene');
  //console.log (activeScene.result.nodes);
  let itemRef= activeScene.result.nodes.find( item => item.name === deviceName);
  //console.log(itemRef);
  let update = await slobs.setValues(itemRef.resourceId,'setVisibility',[!itemRef.visible]);
  return update;
}

async function switchScene(sceneName) {
  let scenes = await slobs.basicRequest('ScenesService','getScenes');
  console.log(scenes);
  let itemRef = scenes.result.find( item => item.name === sceneName);
  console.log(itemRef)
  let update = await slobs.setValues('ScenesService','makeSceneActive',[itemRef.id])

}
main();
