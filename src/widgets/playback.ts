import { WiggleContext } from '../WiggleContext';

export function playback(context: WiggleContext): void {
  const timestamp = document.createElement('code');
  let timestampUpdatePid: any = null;
  const timestampUpdateInterval = 25;
  const updateTimestamp = () => {
    timestamp.textContent = context.timestamp;
    timestampUpdatePid = setTimeout(() => updateTimestamp(), timestampUpdateInterval);
  };
  
  const playStopButton = document.createElement('button');
  playStopButton.textContent = 'Play';
  playStopButton.addEventListener('click', async (e) => {
    if (context.isPlaying) {
      context.stop();
      if (timestampUpdatePid) {
        clearTimeout(timestampUpdatePid);
        timestampUpdatePid = null;
      }
      playStopButton.textContent = 'Play';
    } else {
      if (!context.isBuilt) {
        await context.build();
      }
      context.start();
      updateTimestamp();
      playStopButton.textContent = 'Pause';
    }
  });

  const legend = document.createElement('legend');
  legend.textContent = 'Playback';

  const widget = document.createElement('fieldset');
  widget.appendChild(legend);
  widget.appendChild(playStopButton);
  widget.appendChild(document.createTextNode(' '));
  widget.appendChild(timestamp);

  context.renderWidget(widget);
}
