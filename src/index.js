import QRCode from './QRCode';
import {DEFAULTS} from './const';

const QRCodeInstance = new QRCode();

module.exports = function (el, options) {
    const settings = Object.assign({}, DEFAULTS, options);

    if (options.render === 'datauri') {
        return QRCodeInstance.getDataURI(settings)
    }

    if (el.nodeName.toLowerCase() === 'canvas') {
        return QRCodeInstance.drawOnCanvas(el, settings);
    } else {
        return el.appendChild(QRCodeInstance.createHTML(settings));
    }
};
