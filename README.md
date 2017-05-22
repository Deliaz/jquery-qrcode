# nojquery-qrcode

![license][license-img]

Generates QR codes dynamically. 
A fork of [lrsjng/jquery-qrcode](https://github.com/lrsjng/jquery-qrcode) but without jQuery dependency.

**The difference:** 
1) Does not require jQuery!
2) Uses webpack for build
3) Refactored to ES6 module system
4) Uses [qrcode-generator](qrcode-generator) as a dependency (instead of direct copying)

### Demo
Original demo is here: [DEMO](https://larsjung.de/jquery-qrcode/latest/demo/) 

### Options
Same as in the original plugin: [Options](https://larsjung.de/jquery-qrcode/) 

### Build
Run `npm run build`. 
Dist script will be in the `dist/` folder.

[license-img]: https://img.shields.io/badge/license-MIT-a0a060.svg?style=flat-square
[qrcode]: https://github.com/kazuhikoarase/qrcode-generator
[qrcode-generator]: https://github.com/kazuhikoarase/qrcode-generator
