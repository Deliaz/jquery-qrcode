const QRCodeGenerator = require('qrcode-generator');

export default class QRCode {
    // Check if canvas is available in the browser (as Modernizr does)
    static get hasCanvas() {
        const elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }


    // Wrapper for the original QR code generator.
    createQRCode(text, level, version, quiet) {
        const qr = {};

        const vqr = QRCodeGenerator(version, level);
        vqr.addData(text);
        vqr.make();

        quiet = quiet || 0;

        const qrModuleCount = vqr.getModuleCount();
        const quietModuleCount = vqr.getModuleCount() + 2 * quiet;

        function isDark(row, col) {
            row -= quiet;
            col -= quiet;

            if (row < 0 || row >= qrModuleCount || col < 0 || col >= qrModuleCount) {
                return false;
            }
            return vqr.isDark(row, col);
        }

        function addBlank(l, t, r, b) {
            const prevIsDark = qr.isDark;
            const moduleSize = 1 / quietModuleCount;

            qr.isDark = function (row, col) {
                const ml = col * moduleSize;
                const mt = row * moduleSize;
                const mr = ml + moduleSize;
                const mb = mt + moduleSize;

                return prevIsDark(row, col) && (l > mr || ml > r || t > mb || mt > b);
            };
        }

        qr.text = text;
        qr.level = level;
        qr.version = version;
        qr.moduleCount = quietModuleCount;
        qr.isDark = isDark;
        qr.addBlank = addBlank;

        return qr;
    }

    // Returns a minimal QR code for the given text starting with version `minVersion`.
    // Returns `undefined` if `text` is too long to be encoded in `maxVersion`.
    createMinQRCode(text, level, minVersion, maxVersion, quiet) {
        minVersion = Math.max(1, minVersion || 1);
        maxVersion = Math.min(40, maxVersion || 40);
        for (let version = minVersion; version <= maxVersion; version += 1) {
            try {
                return this.createQRCode(text, level, version, quiet);
            } catch (err) {/* empty */
            }
        }
        return undefined;
    }

    drawBackgroundLabel(qr, context, settings) {
        const size = settings.size;
        const font = 'bold ' + settings.mSize * size + 'px ' + settings.fontname;
        const ctx = document.createElement('canvas').getContext('2d');

        ctx.font = font;

        const w = ctx.measureText(settings.label).width;
        const sh = settings.mSize;
        const sw = w / size;
        const sl = (1 - sw) * settings.mPosX;
        const st = (1 - sh) * settings.mPosY;
        const sr = sl + sw;
        const sb = st + sh;
        const pad = 0.01;

        if (settings.mode === 1) {
            // Strip
            qr.addBlank(0, st - pad, size, sb + pad);
        } else {
            // Box
            qr.addBlank(sl - pad, st - pad, sr + pad, sb + pad);
        }

        context.fillStyle = settings.fontcolor;
        context.font = font;
        context.fillText(settings.label, sl * size, st * size + 0.75 * settings.mSize * size);
    }

    drawBackgroundImage(qr, context, settings) {
        const size = settings.size;
        const w = settings.image.naturalWidth || 1;
        const h = settings.image.naturalHeight || 1;
        const sh = settings.mSize;
        const sw = sh * w / h;
        const sl = (1 - sw) * settings.mPosX;
        const st = (1 - sh) * settings.mPosY;
        const sr = sl + sw;
        const sb = st + sh;
        const pad = 0.01;

        if (settings.mode === 3) {
            // Strip
            qr.addBlank(0, st - pad, size, sb + pad);
        } else {
            // Box
            qr.addBlank(sl - pad, st - pad, sr + pad, sb + pad);
        }

        context.drawImage(settings.image, sl * size, st * size, sw * size, sh * size);
    }

    drawBackground(qr, context, settings) {
        if (settings.background && settings.background.matches('img')) {
            context.drawImage(settings.background, 0, 0, settings.size, settings.size);
        } else if (settings.background) {
            context.fillStyle = settings.background;
            context.fillRect(settings.left, settings.top, settings.size, settings.size);
        }

        const mode = settings.mode;
        if (mode === 1 || mode === 2) {
            this.drawBackgroundLabel(qr, context, settings);
        } else if (mode === 3 || mode === 4) {
            this.drawBackgroundImage(qr, context, settings);
        }
    }

    drawModuleDefault(qr, context, settings, left, top, width, row, col) {
        if (qr.isDark(row, col)) {
            context.rect(left, top, width, width);
        }
    }

    drawModuleRoundedDark(ctx, l, t, r, b, rad, nw, ne, se, sw) {
        if (nw) {
            ctx.moveTo(l + rad, t);
        } else {
            ctx.moveTo(l, t);
        }

        if (ne) {
            ctx.lineTo(r - rad, t);
            ctx.arcTo(r, t, r, b, rad);
        } else {
            ctx.lineTo(r, t);
        }

        if (se) {
            ctx.lineTo(r, b - rad);
            ctx.arcTo(r, b, l, b, rad);
        } else {
            ctx.lineTo(r, b);
        }

        if (sw) {
            ctx.lineTo(l + rad, b);
            ctx.arcTo(l, b, l, t, rad);
        } else {
            ctx.lineTo(l, b);
        }

        if (nw) {
            ctx.lineTo(l, t + rad);
            ctx.arcTo(l, t, r, t, rad);
        } else {
            ctx.lineTo(l, t);
        }
    }

    drawModuleRoundedLight(ctx, l, t, r, b, rad, nw, ne, se, sw) {
        if (nw) {
            ctx.moveTo(l + rad, t);
            ctx.lineTo(l, t);
            ctx.lineTo(l, t + rad);
            ctx.arcTo(l, t, l + rad, t, rad);
        }

        if (ne) {
            ctx.moveTo(r - rad, t);
            ctx.lineTo(r, t);
            ctx.lineTo(r, t + rad);
            ctx.arcTo(r, t, r - rad, t, rad);
        }

        if (se) {
            ctx.moveTo(r - rad, b);
            ctx.lineTo(r, b);
            ctx.lineTo(r, b - rad);
            ctx.arcTo(r, b, r - rad, b, rad);
        }

        if (sw) {
            ctx.moveTo(l + rad, b);
            ctx.lineTo(l, b);
            ctx.lineTo(l, b - rad);
            ctx.arcTo(l, b, l + rad, b, rad);
        }
    }

    drawModuleRounded(qr, context, settings, left, top, width, row, col) {
        const isDark = qr.isDark;
        const right = left + width;
        const bottom = top + width;
        const radius = settings.radius * width;
        const rowT = row - 1;
        const rowB = row + 1;
        const colL = col - 1;
        const colR = col + 1;
        const center = isDark(row, col);
        const northwest = isDark(rowT, colL);
        const north = isDark(rowT, col);
        const northeast = isDark(rowT, colR);
        const east = isDark(row, colR);
        const southeast = isDark(rowB, colR);
        const south = isDark(rowB, col);
        const southwest = isDark(rowB, colL);
        const west = isDark(row, colL);

        if (center) {
            this.drawModuleRoundedDark(context, left, top, right, bottom, radius, !north && !west, !north && !east, !south && !east, !south && !west);
        } else {
            this.drawModuleRoundedLight(context, left, top, right, bottom, radius, north && west && northwest, north && east && northeast, south && east && southeast, south && west && southwest);
        }
    }

    drawModules(qr, context, settings) {
        const moduleCount = qr.moduleCount;
        const moduleSize = settings.size / moduleCount;
        let fn = this.drawModuleDefault.bind(this);
        let row;
        let col;

        if (settings.radius > 0 && settings.radius <= 0.5) {
            fn = this.drawModuleDefault.bind(this);
        }

        context.beginPath();
        for (row = 0; row < moduleCount; row += 1) {
            for (col = 0; col < moduleCount; col += 1) {
                let l = settings.left + col * moduleSize;
                let t = settings.top + row * moduleSize;

                fn(qr, context, settings, l, t, moduleSize, row, col);
            }
        }
        if (settings.fill && settings.fill.matches && settings.fill.matches('img')) {
            context.strokeStyle = 'rgba(0,0,0,0.5)';
            context.lineWidth = 2;
            context.stroke();
            const prev = context.globalCompositeOperation;
            context.globalCompositeOperation = 'destination-out';
            context.fill();
            context.globalCompositeOperation = prev;

            context.clip();
            context.drawImage(settings.fill, 0, 0, settings.size, settings.size);
            context.restore();
        } else {
            context.fillStyle = settings.fill;
            context.fill();
        }
    }

    // Draws QR code to the given `canvas` and returns it.
    drawOnCanvas(canvas, settings) {
        const qr = this.createMinQRCode(settings.text, settings.ecLevel, settings.minVersion, settings.maxVersion, settings.quiet);
        if (!qr) {
            return null;
        }

        const context = canvas.getContext('2d');

        this.drawBackground(qr, context, settings);
        this.drawModules(qr, context, settings);

        return canvas;
    }

    // Returns a `canvas` element representing the QR code for the given settings.
    createCanvas(settings) {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('width', settings.size);
        canvas.setAttribute('height', settings.size);

        return this.drawOnCanvas(canvas, settings);
    }

    // Returns an `image` element representing the QR code for the given settings.
    createImage(settings) {
        const img = document.createElement('img');
        img.setAttribute('src', this.createCanvas(settings).toDataURL('image/png'));
        return img;
    }

    // Returns a `div` element representing the QR code for the given settings.
    createDiv(settings) {
        const qr = this.createMinQRCode(settings.text, settings.ecLevel, settings.minVersion, settings.maxVersion, settings.quiet);
        if (!qr) {
            return null;
        }

        // some shortcuts to improve compression
        const settings_size = settings.size;
        const settings_bgColor = settings.background;
        const math_floor = Math.floor;

        const moduleCount = qr.moduleCount;
        const moduleSize = math_floor(settings_size / moduleCount);
        const offset = math_floor(0.5 * (settings_size - moduleSize * moduleCount));

        let row;
        let col;
        const div = document.createElement('div');

        const containerCSS = {
            position: 'relative',
            left: 0,
            top: 0,
            padding: 0,
            margin: 0,
            width: settings_size,
            height: settings_size
        };
        const darkCSS = {
            position: 'absolute',
            padding: 0,
            margin: 0,
            width: moduleSize,
            height: moduleSize,
            'background-color': settings.fill
        };

        Object.keys(containerCSS).forEach(function (key) {
            div.style[key] = containerCSS[key];
        });

        if (settings_bgColor) {
            div.css('background-color', settings_bgColor);
        }

        for (row = 0; row < moduleCount; row += 1) {
            for (col = 0; col < moduleCount; col += 1) {
                if (qr.isDark(row, col)) {

                    const innerDiv = document.createElement('div');
                    Object.keys(darkCSS).forEach(function (key) {
                        innerDiv.style[key] = darkCSS[key];
                    });
                    innerDiv.style.left = offset + col * moduleSize;
                    innerDiv.style.top = offset + row * moduleSize;

                    div.appendChild(innerDiv);
                }
            }
        }

        return div;
    }

    createHTML(settings) {
        if (QRCode.hasCanvas && settings.render === 'canvas') {
            return this.createCanvas(settings);
        } else if (QRCode.hasCanvas && settings.render === 'image') {
            return this.createImage(settings);
        }

        return this.createDiv(settings);
    }
}
