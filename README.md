pa-toggle-music
===

Toggle pulseaudio music input sinks


## Usage

```bash
# move the music player's sink input to the next available sink
pa-toggle-music

# move the music player's sink input to a specific sink
pa-toggle-music "" alsa_output.pci-0000_07_00.0.analog-surround-51

# move the application's sink input to next available sink
pa-toggle-music Clementine

# move the application's sink input to a specific sink
pa-toggle-music Clementine alsa_output.pci-0000_07_00.0.analog-surround-51
```


## Requirements

- `pactl` (libpulse on Arch, pulseaudio-utils on Ubuntu, etc.)
- `node` >= 6


## Install

### Packages

todo

### Build manually

Make sure that the latest version of [NodeJS][node] and [Yarn][yarn] are installed on the system.

```bash
git clone https://github.com/bastimeyer/pa-toggle-music.git
cd pa-toggle-music
yarn install --pure-lockfile
yarn run build
sudo install -m 755 ./dist/pa-toggle-music /usr/bin/pa-toggle-music
```


  [node]: https://nodejs.org "Node.js"
  [yarn]: https://yarnpkg.com "Fast, reliable, and secure dependency management."
