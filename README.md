# SL Web Face

A library for animating faces on the web. It uses a web canvas for rendering.

This is an early release for tire-kickers and curious folk. When the version goes to 1.0+, it can be considered production-ready. I won't bother publishing to NPM until then.

## Features
* Animate faces to show 11 emotions, lid levels, blinking, eye attention, and speaking.
* Faces are configured as a combination of individual parts including head, eyes, and mouth.
* Skin, hair, and eyes can be recolored at load-time.
* Playback of speech audio with lip animation (visemes) timed to match audio.
* Face configuration can be loaded from web-hosted files.
* Extensible to create new face parts with different art assets.

## Usage

Here's some basic code for loading a face and rendering it continuously to a canvas.

```javascript
import { loadFaceFromUrl } from "sl-web-face";

let canvasContext, face;

async function init() {
  // Need a canvas element with this ID in your DOM.
  const canvas = window.getElementById('theCanvas');
  if (!canvas) throw Error('Could not find canvas in the DOM.');
  canvasContext = canvas.getContext('2d');
  face = await loadFaceFromUrl('https://example.com/yourfaceconf.yml');
  requestAnimationFrame(renderCanvas);
}

function renderCanvas() {
  canvasContext.clearRect(0, 0, context.canvas.width, context.canvas.height);
  face.render(canvasContext, 0, 0);
  requestAnimationFrame(render);
}

init();
```

How to animate? You can publish events that will cause the face to react.

```javascript
import { loadFaceFromUrl, publishEvent, Topics, Viseme, Emotion, LidLevel } from 'sl-web-face';

...all the code from first example...

function blink() { publishEvent(Topics.BLINK, {}); }
function lookAt(dx:number, dy:number) { publishEvent(Topics.ATTENTION, {dx, dy}); }
function beHappy() { publishEvent(Topics.EMOTION, Emotion.HAPPY); }
function squint() { publishEvent(Topics.LID_LEVEL, LidLevel.SQUINT); }
function makeOFace() { publishEvent(Topics.VISEME, Viseme.O); }
```

Some idle eye movements including blinking and looking around can be performed automatically with controllers.

```javascript
import { loadFaceFromUrl, publishEvent, BlinkController, AttentionController } from 'sl-web-face';

...all the code from first example...

let blinkController, attentionController;

function startIdleEyeMovements() {
  blinkController = new BlinkController();
  attentionController = new AttentionController();
  blinkController.start();
  attentionController.start();
}
```

You can play an audio file with timed lip animations (visemes) if you have a `.wav` and corresponding `.lipz` file.

```javascript
import { loadFaceFromUrl, publishEvent, loadSpeechFromUrl } from 'sl-web-face';

...all the code from first example...

async function saySomething() {
  const speechAudio = await loadSpeechFromUrl('https://example.com/dialogue.wav'); // Will look for a file called dialogue.lipz.txt at the same location.
  speechAudio.play(); // Plays audio and animates lips.
}
```

### Web-Hosted Files for Faces

These would include the art assets for face and mouth, configuration files, audio files and lipz files.

I'll put them up on a public location a bit later. It's possible I'll open-source a web app from a different repo that includes them. Or I may do something else slightly different to make them available. 

### Contributing

The project isn't open to contributions at this point. But that could change. Contact me if you'd like to collaborate. 

### Contacting

You can reach me on LinkedIn. I'll accept connections if you will just mention "SL Web Face" or some other shared interest in your connection request.

https://www.linkedin.com/in/erikhermansen/
